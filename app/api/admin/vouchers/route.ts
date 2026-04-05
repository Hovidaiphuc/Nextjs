import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const vouchers = await prisma.voucher.findMany({
      include: {
        _count: { select: { usages: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(vouchers);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const {
      code, type, value,
      minOrderAmount, maxDiscount,
      usageLimit, perUserLimit,
      expiryDate, applicableCategories,
      isActive
    } = body;

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        type: type ?? "PERCENT",
        value: Number(value) ?? 0,
        minOrderAmount: Number(minOrderAmount) ?? 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        perUserLimit: Number(perUserLimit) ?? 1,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        applicableCategories: applicableCategories ?? null,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    console.error("Voucher create error:", error);
    return NextResponse.json({ error: "Mã trùng lặp hoặc lỗi hệ thống" }, { status: 500 });
  }
}