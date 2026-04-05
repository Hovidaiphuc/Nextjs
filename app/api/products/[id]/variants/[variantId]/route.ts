import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// PUT /api/products/[id]/variants/[variantId]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { variantId } = await params;
    const body = await req.json();

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(body.sku && { sku: body.sku.toUpperCase() }),
        ...(body.name && { name: body.name }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.stock !== undefined && { stock: Number(body.stock) }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null })
      }
    });

    return NextResponse.json(variant);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Biến thể không tồn tại" }, { status: 404 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "SKU đã tồn tại" }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}

// DELETE /api/products/[id]/variants/[variantId]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { variantId } = await params;
    await prisma.productVariant.delete({ where: { id: variantId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Biến thể không tồn tại" }, { status: 404 });
    }
    return NextResponse.json({ error: "Lỗi xóa" }, { status: 500 });
  }
}
