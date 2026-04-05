import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/analytics — Admin dashboard stats
export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenue stats
    const [todayOrders, weekOrders, monthOrders, allOrders] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startOfDay }, paymentStatus: "PAID" },
        select: { totalAmount: true }
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startOfWeek }, paymentStatus: "PAID" },
        select: { totalAmount: true }
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startOfMonth }, paymentStatus: "PAID" },
        select: { totalAmount: true }
      }),
      prisma.order.findMany({
        where: { paymentStatus: "PAID" },
        select: { totalAmount: true, createdAt: true, status: true }
      })
    ]);

    const revenue = {
      today: todayOrders.reduce((s, o) => s + o.totalAmount, 0),
      week: weekOrders.reduce((s, o) => s + o.totalAmount, 0),
      month: monthOrders.reduce((s, o) => s + o.totalAmount, 0),
      total: allOrders.reduce((s, o) => s + o.totalAmount, 0)
    };

    // Order counts
    const orderCounts = {
      today: todayOrders.length,
      week: weekOrders.length,
      month: monthOrders.length,
      total: allOrders.length
    };

    // 30-day revenue chart
    const chartData: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(startOfDay);
      d.setDate(d.getDate() - i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const dayOrders = allOrders.filter(o => {
        const od = new Date(o.createdAt);
        return od >= d && od < nextD;
      });
      chartData.push({
        date: d.toISOString().split("T")[0],
        revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
        orders: dayOrders.length
      });
    }

    // Top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _count: { productId: true },
      _sum: { quantity: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10
    });

    const enrichedTop = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { id: true, name: true, imageUrl: true }
        });
        return {
          ...tp,
          product
        };
      })
    );

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      include: {
        items: { include: { product: { select: { name: true } } } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // Order status distribution
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true }
    });

    // Counts
    const [productCount, userCount, lowStockCount] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.product.count({ where: { stock: { lte: 5 } } })
    ]);

    return NextResponse.json({
      revenue,
      orderCounts,
      chartData,
      topProducts: enrichedTop,
      recentOrders,
      statusCounts,
      counts: { products: productCount, users: userCount, lowStock: lowStockCount }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
