import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/admin/orders/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { images: true } }, variant: true } },
        voucher: true,
        addresses: true,
        user: { select: { name: true, email: true, phone: true } },
        orderStatusLogs: { orderBy: { createdAt: "asc" } }
      }
    });

    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/orders/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { status, trackingNumber, note, paymentStatus } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id },
      data: updateData
    });

    // Log status change
    if (status !== undefined) {
      await prisma.orderStatusLog.create({
        data: {
          orderId: id,
          status,
          note: note ?? `Admin cập nhật trạng thái: ${status}`
        }
      });

      // Notify user
      if (order.userId) {
        const statusMessages: Record<string, string> = {
          CONFIRMED: "đã được xác nhận",
          PROCESSING: "đang được chuẩn bị",
          SHIPPED: "đang được giao hàng",
          DELIVERED: "đã được giao thành công",
          CANCELLED: "đã bị hủy",
          REFUNDED: "đã được hoàn tiền"
        };
        await prisma.notification.create({
          data: {
            userId: order.userId,
            title: `Đơn hàng #${id.slice(-6)} ${statusMessages[status] ?? status}`,
            message: trackingNumber ? `Mã vận đơn: ${trackingNumber}` : `Cập nhật: ${note ?? status}`,
            link: `/account/orders/${id}`
          }
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}