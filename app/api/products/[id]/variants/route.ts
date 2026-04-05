import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/products/[id]/variants
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: { price: "asc" }
    });
    return NextResponse.json(variants);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải biến thể" }, { status: 500 });
  }
}

// POST /api/products/[id]/variants — Admin creates variant
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: productId } = await params;
    const body = await req.json();
    const { sku, name, price, stock, imageUrl } = body;

    if (!sku || !name || price === undefined) {
      return NextResponse.json({ error: "SKU, name, price là bắt buộc" }, { status: 400 });
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku: sku.toUpperCase(),
        name,
        price: Number(price),
        stock: Number(stock ?? 0),
        imageUrl: imageUrl || null
      }
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "SKU đã tồn tại" }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi tạo biến thể" }, { status: 500 });
  }
}
