import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    const body = await req.json();
    const { customerName, customerEmail, address, items, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // SECURITY: Calculate totalAmount server-side to prevent price manipulation
    const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id || null, // Guest checkout allowed
        customerName,
        customerEmail,
        address,
        totalAmount: calculatedTotal,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            priceAt: item.price
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
     const session = await getServerSession() as any;
     const { searchParams } = new URL(request.url);
     const userId = searchParams.get('userId');

     if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const role = session.user.role;
     const currentUserId = (session.user as any).id;

     // ADMIN gets all orders; authenticated users only see their own orders
     const where = role === "ADMIN"
        ? (userId ? { userId } : {})
        : { userId: currentUserId };

     const orders = await prisma.order.findMany({
        where,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
     });

     return NextResponse.json(orders);
  } catch (error) {
     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
