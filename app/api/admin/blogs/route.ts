import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const blogs = await prisma.blogArticle.findMany({
       include: { author: { select: { name: true, email: true } } },
       orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi kết xuất Tạp chí" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Phạm thượng" }, { status: 403 });
    
    const body = await req.json();
    const { title, slug, coverImage, content, tags } = body;
    
    const blog = await prisma.blogArticle.create({
       data: {
          title, slug, coverImage, content, tags,
          authorId: session.user.id
       }
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi phát hành ấn phẩm" }, { status: 500 });
  }
}
