import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentDbUser } from "@/lib/current-user";

const reviewSchema = z.object({
  eventId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED", "ESCALATED"]),
  note: z.string().max(2000).optional().default(""),
  feedbackLabel: z
    .enum(["TRUE_POSITIVE", "FALSE_POSITIVE", "BENIGN", "NEEDS_MORE_INFO"])
    .optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = reviewSchema.parse(json);

    const reviewer = await getOrCreateCurrentDbUser();

    const event = await prisma.eventItem.findUnique({
      where: { id: parsed.eventId },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const review = await prisma.reviewDecision.upsert({
      where: {
        eventId_reviewerId: {
          eventId: parsed.eventId,
          reviewerId: reviewer.id,
        },
      },
      update: {
        status: parsed.status,
        note: parsed.note || null,
      },
      create: {
        eventId: parsed.eventId,
        reviewerId: reviewer.id,
        status: parsed.status,
        note: parsed.note || null,
      },
    });

    let feedbackLabel = null;

    if (parsed.feedbackLabel) {
      feedbackLabel = await prisma.feedbackLabel.upsert({
        where: {
          eventId_reviewerId: {
            eventId: parsed.eventId,
            reviewerId: reviewer.id,
          },
        },
        update: {
          label: parsed.feedbackLabel,
        },
        create: {
          eventId: parsed.eventId,
          reviewerId: reviewer.id,
          label: parsed.feedbackLabel,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      review,
      feedbackLabel,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid review payload", details: error.flatten() },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    const status = message === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
