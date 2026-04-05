import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// POST /api/products/[id]/images — Admin adds gallery image
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: productId } = await params;
    const body = await req.json();
    const { url, isPrimary } = body;

    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // If this image is primary, unset other primary flags
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const image = await prisma.productImage.create({
      data: { productId, url, isPrimary: isPrimary ?? false }
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi thêm ảnh" }, { status: 500 });
  }
}

// DELETE /api/products/[id]/images?imageId=xxx
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("imageId");
    if (!imageId) return NextResponse.json({ error: "imageId required" }, { status: 400 });

    await prisma.productImage.delete({ where: { id: imageId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xóa ảnh" }, { status: 500 });
  }
}
