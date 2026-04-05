import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// POST /api/orders/[id]/payment-confirm — User confirms bank transfer
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { id } = await params;
    const { bankRef } = await req.json();

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    if (order.paymentMethod !== "BANK_TRANSFER") {
      return NextResponse.json({ error: "Đơn này không phải chuyển khoản" }, { status: 400 });
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Đã xác nhận thanh toán rồi" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        bankRef: bankRef ?? null,
        paymentStatus: "PAID",
        status: "CONFIRMED"
      }
    });

    await prisma.orderStatusLog.create({
      data: {
        orderId: id,
        status: "CONFIRMED",
        note: bankRef ? `Xác nhận CK: ${bankRef}` : "Xác nhận thanh toán chuyển khoản"
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: order.userId ?? userId,
        title: "Thanh toán đã được xác nhận",
        message: `Đơn hàng #${id.slice(-6)} đã được xác nhận thanh toán. Đang chuẩn bị giao hàng.`,
        link: `/account/orders/${id}`
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Payment confirm error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
