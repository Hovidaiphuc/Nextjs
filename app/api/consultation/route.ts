import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession() as any;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // SECURITY: Only ADMIN/DOCTOR can list all tickets. Regular users only see their own.
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const currentUserId = (session.user as any).id;

    let tickets;
    if (role === "ADMIN" || role === "DOCTOR") {
      // ADMIN/DOCTOR can view all tickets or filter by userId
      tickets = userId
        ? await prisma.consultationTicket.findMany({ where: { userId }, include: { user: true, doctor: true, prescription: { include: { products: true } } }, orderBy: { createdAt: 'desc' } })
        : await prisma.consultationTicket.findMany({ include: { user: true, doctor: true, prescription: true }, orderBy: { createdAt: 'desc' } });
    } else {
      // Regular user: only their own tickets
      tickets = await prisma.consultationTicket.findMany({ where: { userId: currentUserId }, include: { doctor: true, prescription: { include: { products: true } } }, orderBy: { createdAt: 'desc' } });
    }

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await request.json();
    const { skinIssue, imageUrl } = body;

    // SECURITY: Use session user ID instead of body userId
    const userId = (session.user as any).id;

    // Lấy một Doctor ngẫu nhiên để gán vào ticket cho nhanh trong bản demo
    const firstDoctor = await prisma.doctor.findFirst();

    const ticket = await prisma.consultationTicket.create({
      data: {
        skinIssue,
        imageUrl,
        userId,
        doctorId: firstDoctor?.id,
      },
      include: { doctor: true }
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
