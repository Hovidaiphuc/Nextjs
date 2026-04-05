import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// POST /api/cart/items — Add item to cart
export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { variantId, quantity = 1 } = await req.json();

    if (!variantId) return NextResponse.json({ error: "variantId required" }, { status: 400 });

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Check existing item
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } }
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.cartItem.create({
        data: { cartId: cart.id, variantId, quantity }
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Cart items POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/cart/items?variantId=xxx — Remove item
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get("variantId");

    if (!variantId) return NextResponse.json({ error: "variantId required" }, { status: 400 });

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, variantId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/cart/items — Update quantity
export async function PUT(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { variantId, quantity } = await req.json();

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } });
      return NextResponse.json({ success: true });
    }

    const item = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } }
    });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
