import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validation Sinh học Khách Hàng
    if (!email || !password || !name) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (password.length < 6) {
       return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // 2. Chặn Cửa người dùng Cũ chống rác rưởi (Check Trùng Trùng lặp Email)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email already taken" }, { status: 409 });
    }

    // 3. Nghiền Nát Password Bằng Phép Thuật Quân Sự Kĩ Thuật Bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Mở cửa Khai Sinh Ra Người Dùng (Và đóng nhãn USER vô thưởng vô phạt)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER"
      },
    });

    // 5. Giải Vây, Trả Password Khép lại không Show
    return NextResponse.json({ 
       success: true, 
       user: { id: user.id, name: user.name, email: user.email } 
    }, { status: 201 });

  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
