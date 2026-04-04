import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Lỗi Bậc Cấp" }, { status: 403 });
    const { id } = await params;
    await prisma.voucher.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Không Xóa Được" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Lỗi Bậc Cấp" }, { status: 403 });
    const { id } = await params;
    const body = await req.json();
    
    // Nếu có value thì phải ép sang Number
    if (body.value !== undefined) body.value = Number(body.value);
    
    const updated = await prisma.voucher.update({ where: { id }, data: body });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Cập nhật Thất Bại" }, { status: 500 });
  }
}
