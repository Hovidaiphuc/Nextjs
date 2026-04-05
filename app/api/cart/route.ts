import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/cart — Get server-side cart for authenticated user
export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { include: { images: true } } }
            }
          }
        }
      }
    });

    return NextResponse.json(cart ?? { items: [] });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/cart — Sync localStorage cart → server cart (merge strategy)
export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { items } = body; // Array<{ variantId: string, quantity: number }>

    // Upsert cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Clear existing items and re-insert merged
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    for (const item of items) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: item.variantId,
          quantity: Math.max(1, item.quantity ?? 1),
        }
      });
    }

    const updated = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { include: { images: true } } }
            }
          }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/cart — Clear cart
export async function DELETE() {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    await prisma.cartItem.deleteMany({
      where: { cart: { userId } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
