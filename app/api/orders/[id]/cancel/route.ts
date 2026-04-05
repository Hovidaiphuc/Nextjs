import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// POST /api/orders/[id]/cancel
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const role = session.user.role;
    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });

    // Check ownership (or admin)
    if (role !== "ADMIN" && order.userId !== userId) {
      return NextResponse.json({ error: "Không có quyền hủy đơn này" }, { status: 403 });
    }

    // Can only cancel PENDING orders
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return NextResponse.json({ error: "Không thể hủy đơn ở trạng thái này" }, { status: 400 });
    }

    const { note } = await req.json().catch(() => ({}));

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        paymentStatus: order.paymentStatus === "PAID" ? "FAILED" : order.paymentStatus
      }
    });

    await prisma.orderStatusLog.create({
      data: {
        orderId: id,
        status: "CANCELLED",
        note: note ?? "Người dùng hủy đơn"
      }
    });

    // Restore voucher usage
    if (order.voucherId) {
      await prisma.voucherUsage.deleteMany({
        where: { orderId: id }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
