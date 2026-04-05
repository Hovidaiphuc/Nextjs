import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    const body = await req.json();
    const {
      customerName, customerEmail, address,
      addressId, shippingMethod, paymentMethod,
      voucherCode, note,
      items: cartItems // Array<{ id, name, price, imageUrl, quantity, variantId? }>
    } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const userId = session?.user ? (session.user as any).id : null;

    // Resolve full address
    let fullAddress = address ?? "";
    let addressIdResolved: string | null = addressId ?? null;
    if (addressId && !address) {
      const savedAddr = await prisma.address.findUnique({ where: { id: addressId } });
      if (savedAddr) {
        fullAddress = `${savedAddr.detail}, ${savedAddr.ward}, ${savedAddr.district}, ${savedAddr.province}`;
        addressIdResolved = savedAddr.id;
      }
    } else if (!addressId && address) {
      fullAddress = address;
    }

    // Shipping fee
    const SHIPPING_STANDARD = 30000;
    const SHIPPING_EXPRESS = 50000;
    const FREE_SHIPPING_THRESHOLD = 500000;
    let shippingFee = 0;
    if (shippingMethod === "STANDARD") shippingFee = SHIPPING_STANDARD;
    else if (shippingMethod === "EXPRESS") shippingFee = SHIPPING_EXPRESS;
    else if (shippingMethod === "FREE") shippingFee = 0;
    else if (shippingMethod === "FREE" || !shippingMethod) shippingFee = 0;

    // Calculate subtotal
    let subtotal = 0;
    const orderItemData: any[] = [];

    for (const item of cartItems) {
      subtotal += item.price * item.quantity;
      orderItemData.push({
        productId: item.id,
        variantId: item.variantId ?? null,
        variantName: item.variantName ?? null,
        quantity: item.quantity,
        priceAt: item.price
      });
    }

    // Apply voucher
    let voucherId: string | null = null;
    let discountAmount = 0;

    if (voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: voucherCode.toUpperCase() }
      });

      if (voucher && voucher.isActive && (!voucher.expiryDate || new Date(voucher.expiryDate) > new Date())) {
        let discount = 0;
        if (voucher.type === "PERCENT") {
          discount = subtotal * (voucher.value / 100);
          if (voucher.maxDiscount) discount = Math.min(discount, voucher.maxDiscount);
        } else {
          discount = voucher.value;
        }
        discount = Math.min(discount, subtotal);
        discountAmount = Math.round(discount);
        voucherId = voucher.id;
      }
    }

    // Final total
    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    const order = await prisma.order.create({
      data: {
        userId,
        customerName,
        customerEmail,
        address: fullAddress,
        addressId: addressIdResolved,
        status: paymentMethod === "BANK_TRANSFER" ? "PENDING" : "PENDING",
        totalAmount,
        shippingMethod: shippingMethod ?? "STANDARD",
        shippingFee,
        paymentMethod: paymentMethod ?? "COD",
        paymentStatus: "UNPAID",
        note: note ?? null,
        discountAmount,
        voucherId,
        items: { create: orderItemData }
      },
      include: {
        items: { include: { product: true, variant: true } },
        voucher: true,
        addresses: true
      }
    });

    // Log status
    await prisma.orderStatusLog.create({
      data: { orderId: order.id, status: "PENDING", note: "Đơn hàng được tạo" }
    });

    // Record voucher usage
    if (voucherId && userId) {
      await prisma.voucherUsage.create({
        data: { voucherId, userId, orderId: order.id }
      }).catch(() => {}); // ignore duplicate key
    }

    // Clear server-side cart if authenticated
    if (userId) {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    // Notification
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title: "Đơn hàng mới",
          message: `Đơn hàng #${order.id.slice(-6)} đã được tạo. Tổng: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}`,
          link: `/account/orders/${order.id}`
        }
      });
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession() as any;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("id");

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: { include: { images: true } }, variant: true } },
          voucher: true,
          addresses: true,
          user: { select: { name: true, email: true } },
          orderStatusLogs: { orderBy: { createdAt: "asc" } }
        }
      });
      if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

      // Ownership check — guest orders (userId=null) are accessible by anyone with the order ID
      const currentUserId = (session?.user as any)?.id;
      const isGuestOrder = order.userId === null;
      if (!isGuestOrder && session?.user?.role !== "ADMIN" && order.userId !== currentUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      return NextResponse.json(order);
    }

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const currentUserId = (session.user as any).id;

    const where = role === "ADMIN"
      ? (userId ? { userId } : {})
      : { userId: currentUserId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: { select: { name: true, imageUrl: true } }, variant: true } },
        orderStatusLogs: { orderBy: { createdAt: "asc" } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}