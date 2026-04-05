import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// POST /api/orders/apply-voucher
export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code) return NextResponse.json({ valid: false, error: "Mã không được để trống" }, { status: 400 });
    if (!subtotal || subtotal <= 0) return NextResponse.json({ valid: false, error: "Giá trị đơn hàng không hợp lệ" }, { status: 400 });

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!voucher) {
      return NextResponse.json({ valid: false, error: "Mã không tồn tại" }, { status: 404 });
    }

    if (!voucher.isActive) {
      return NextResponse.json({ valid: false, error: "Mã đã bị vô hiệu hóa" }, { status: 400 });
    }

    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return NextResponse.json({ valid: false, error: "Mã đã hết hạn" }, { status: 400 });
    }

    if (subtotal < voucher.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        error: `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(voucher.minOrderAmount)} để dùng mã này`
      }, { status: 400 });
    }

    // Check usage limit
    if (voucher.usageLimit) {
      const usedCount = await prisma.voucherUsage.count({ where: { voucherId: voucher.id } });
      if (usedCount >= voucher.usageLimit) {
        return NextResponse.json({ valid: false, error: "Mã đã hết lượt sử dụng" }, { status: 400 });
      }
    }

    // Per-user limit
    const userId = session?.user ? (session.user as any).id : null;
    if (userId && voucher.perUserLimit) {
      const userUsageCount = await prisma.voucherUsage.count({
        where: { voucherId: voucher.id, userId }
      });
      if (userUsageCount >= voucher.perUserLimit) {
        return NextResponse.json({ valid: false, error: "Bạn đã sử dụng mã này rồi" }, { status: 400 });
      }
    }

    // Calculate discount
    let discount = 0;
    if (voucher.type === "PERCENT") {
      discount = subtotal * (voucher.value / 100);
      if (voucher.maxDiscount) discount = Math.min(discount, voucher.maxDiscount);
    } else {
      discount = voucher.value;
    }
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      newTotal: Math.round(subtotal - discount),
      voucher: {
        id: voucher.id,
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount
      }
    });
  } catch (error) {
    console.error("Apply voucher error:", error);
    return NextResponse.json({ valid: false, error: "Lỗi hệ thống" }, { status: 500 });
  }
}
