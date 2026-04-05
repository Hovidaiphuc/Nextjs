import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: { orderBy: { price: "asc" } },
        images: { orderBy: { isPrimary: "desc" } }
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, categoryId, brand, skinType, ingredients, stock } = body;
    
    // Nếu category chưa tồn tại, ta có thể tạo nhanh (Chỉ dùng cho test nhanh)
    let finalCategoryId = categoryId;
    if (!categoryId) {
      const cat = await prisma.category.upsert({
        where: { slug: 'skincare' },
        update: {},
        create: { name: 'Chăm sóc da', slug: 'skincare' }
      });
      finalCategoryId = cat.id;
    }

    const product = await prisma.product.create({
      data: { name, description, price, imageUrl, categoryId: finalCategoryId, brand, skinType, ingredients, stock: Number(stock) || 0 },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể tạo sản phẩm' }, { status: 500 });
  }
}
