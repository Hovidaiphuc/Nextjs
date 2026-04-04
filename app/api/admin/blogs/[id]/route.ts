import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Hết pin" }, { status: 403 });
    const { id } = await params;
    await prisma.blogArticle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Bắn lỗi kẹt giấy" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Thẩm quyền rỗng" }, { status: 403 });
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.blogArticle.update({ where: { id }, data: body });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Kẹt giấy In" }, { status: 500 });
  }
}
