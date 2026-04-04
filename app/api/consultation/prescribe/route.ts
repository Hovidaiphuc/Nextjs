import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session || session.user?.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, notes, productIds } = await req.json();

    // TRANSACTION: Update ticket + create prescription atomically — no partial state
    const [ticket, script] = await prisma.$transaction([
      prisma.consultationTicket.update({
        where: { id: ticketId },
        data: {
          status: "ANSWERED",
          response: notes,
        }
      }),
      prisma.prescription.create({
        data: {
          ticketId,
          notes,
          products: {
            connect: productIds.map((id: string) => ({ id }))
          }
        }
      })
    ]);

    return NextResponse.json({ success: true, ticket, script }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
