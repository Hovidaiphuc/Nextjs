import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session || !session.user) {
        return NextResponse.json({ error: "Lệnh Kẻ vãng lai không được chấm điểm. Hãy Đăng Nhập!" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || rating < 1 || rating > 5) {
       return NextResponse.json({ error: "Tham số Sao không đúng Định Dạng!" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        productId,
        userId: (session.user as any).id
      },
    });
    
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[REVIEW_CREATE]", error);
    return NextResponse.json({ error: "Lỗi kết tủa CSDL Review" }, { status: 500 });
  }
}
