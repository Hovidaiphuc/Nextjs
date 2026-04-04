import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) return NextResponse.json({ error: "Thương phẩm không tồn tại" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải thư viện" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Thẩm quyền rỗng" }, { status: 403 });
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xóa dữ liệu" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Thẩm quyền rỗng" }, { status: 403 });
    
    const { id } = await params;
    const body = await req.json();
    
    // Ép kiểu stock tránh lỗi undefined Type
    const dataToUpdate = { ...body };
    if (body.stock !== undefined) {
        dataToUpdate.stock = Number(body.stock);
    }
    
    const product = await prisma.product.update({
       where: { id },
       data: dataToUpdate
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật dữ liệu" }, { status: 500 });
  }
}
