import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const excludeId = searchParams.get("excludeId");
    const limit = parseInt(searchParams.get("limit") || "4");

    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: excludeId ? { not: excludeId } : undefined,
      },
      include: {
        images: { orderBy: { isPrimary: "desc" } },
        variants: { orderBy: { price: "asc" } }
      },
      take: limit,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải sản phẩm liên quan" }, { status: 500 });
  }
}
