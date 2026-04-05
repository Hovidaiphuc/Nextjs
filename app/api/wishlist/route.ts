import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/wishlist — Get user's wishlist
export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            variants: { orderBy: { price: "asc" }, take: 1 }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(wishlists);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/wishlist — Add to wishlist
export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { productId } = await req.json();

    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } }
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Already in wishlist" });
    }

    const wishlist = await prisma.wishlist.create({
      data: { userId, productId }
    });

    return NextResponse.json(wishlist, { status: 201 });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/wishlist?productId=xxx — Remove from wishlist
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    await prisma.wishlist.deleteMany({
      where: { userId, productId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
