import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Tham nhũng quyền lực" }, { status: 403 });
    
    const { id } = await params;
    const body = await req.json();
    const order = await prisma.order.update({
       where: { id },
       data: { status: body.status }
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật CSDL" }, { status: 500 });
  }
}
