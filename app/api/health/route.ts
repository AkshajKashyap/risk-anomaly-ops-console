import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const eventCount = await prisma.eventItem.count();
  const flaggedCount = await prisma.eventItem.count({
    where: { flagged: true },
  });

  return NextResponse.json({
    status: "ok",
    database: "connected",
    eventCount,
    flaggedCount,
  });
}
