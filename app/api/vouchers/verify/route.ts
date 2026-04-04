import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;
    
    if (!code) return NextResponse.json({ error: "Vui lòng đính kèm mã code" }, { status: 400 });

    const voucher = await prisma.voucher.findUnique({
       where: { code: code.toUpperCase() }
    });

    if (!voucher) return NextResponse.json({ error: "Kho tàng không tồn tại Mã này!" }, { status: 404 });
    if (!voucher.isActive) return NextResponse.json({ error: "Mã Khuyến Mãi Giai đoạn này đã Bị Phong Ấn!" }, { status: 400 });

    return NextResponse.json({ success: true, voucher }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Hệ thống Check Mã Lỗi" }, { status: 500 });
  }
}
