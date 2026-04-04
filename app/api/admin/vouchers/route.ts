import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Lỗi Thẩm Quyền" }, { status: 403 });
    const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(vouchers);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi kết xuất" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Lỗi Thẩm Quyền" }, { status: 403 });
    
    const body = await req.json();
    const { code, type, value, isActive } = body;
    
    const voucher = await prisma.voucher.create({
       data: { code: code.toUpperCase(), type, value: Number(value), isActive }
    });

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Mã trùng lặp" }, { status: 500 });
  }
}
