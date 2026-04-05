import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/addresses — List user's addresses
export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });
    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/addresses — Create new address
export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, phone, province, district, ward, detail, isDefault } = body;

    // If this is set as default, unset other defaults first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Check if this is the first address
    const count = await prisma.address.count({ where: { userId } });
    const makeDefault = isDefault || count === 0;

    const address = await prisma.address.create({
      data: { userId, name, phone, province, district, ward, detail, isDefault: makeDefault }
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("Address POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/addresses — Update address
export async function PUT(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { id, name, phone, province, district, ward, detail, isDefault } = body;

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: { name, phone, province, district, ward, detail, isDefault: isDefault ?? existing.isDefault }
    });

    return NextResponse.json(address);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/addresses?id=xxx — Delete address
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
