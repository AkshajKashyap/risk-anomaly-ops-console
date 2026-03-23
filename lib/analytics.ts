import { prisma } from "@/lib/prisma";

type LatestReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED";

export type FunnelStage = {
  label: string;
  value: number;
  helper: string;
};

export type AnomalyTrendPoint = {
  label: string;
  anomalyRatePct: number;
  anomalyCount: number;
  totalCount: number;
};

export type AnalyticsSnapshot = {
  summary: {
    totalEvents: number;
    flaggedEvents: number;
    reviewedFlaggedEvents: number;
    confirmedIssueCount: number;
    escalatedCount: number;
    flaggedRatePct: number;
    reviewCompletionRatePct: number;
    avgReviewTurnaroundHours: number;
    approvedPct: number;
    rejectedPct: number;
    escalatedPct: number;
    highRiskPrecisionProxyPct: number;
    latestAnomalyRatePct: number;
    latestAnomalyRateLabel: string;
  };
  funnel: FunnelStage[];
  anomalyTrend: AnomalyTrendPoint[];
};

function percent(numerator: number, denominator: number) {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function getLatestStatus(event: {
  reviews: Array<{
    status: LatestReviewStatus;
  }>;
}) {
  return event.reviews[0]?.status ?? "PENDING";
}

function isConfirmedIssue(status: LatestReviewStatus) {
  return status === "APPROVED" || status === "ESCALATED";
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const events = await prisma.eventItem.findMany({
    orderBy: { occurredAt: "asc" },
    include: {
      riskPrediction: true,
      anomalyOutput: true,
      reviews: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });

  const totalEvents = events.length;
  const flaggedEvents = events.filter((event) => event.flagged);
  const reviewedFlaggedEvents = flaggedEvents.filter((event) => event.reviews.length > 0);

  const latestReviewedFlagged = reviewedFlaggedEvents.map((event) => ({
    event,
    review: event.reviews[0],
    latestStatus: getLatestStatus(event),
  }));

  const confirmedIssueCount = latestReviewedFlagged.filter(({ latestStatus }) =>
    isConfirmedIssue(latestStatus),
  ).length;

  const escalatedCount = latestReviewedFlagged.filter(
    ({ latestStatus }) => latestStatus === "ESCALATED",
  ).length;

  const approvedCount = latestReviewedFlagged.filter(
    ({ latestStatus }) => latestStatus === "APPROVED",
  ).length;

  const rejectedCount = latestReviewedFlagged.filter(
    ({ latestStatus }) => latestStatus === "REJECTED",
  ).length;

  const turnaroundHours = latestReviewedFlagged
    .map(({ event, review }) => {
      const diffMs = review.updatedAt.getTime() - event.createdAt.getTime();
      return diffMs >= 0 ? diffMs / (1000 * 60 * 60) : 0;
    })
    .filter((value) => Number.isFinite(value));

  const avgReviewTurnaroundHours =
    turnaroundHours.length > 0
      ? round1(
          turnaroundHours.reduce((sum, value) => sum + value, 0) /
            turnaroundHours.length,
        )
      : 0;

  const highRiskReviewed = latestReviewedFlagged.filter(({ event }) => {
    const threshold = event.riskPrediction?.threshold;
    const score = event.riskPrediction?.score;

    return threshold !== null && threshold !== undefined && score !== undefined
      ? score >= threshold
      : false;
  });

  const highRiskConfirmedCount = highRiskReviewed.filter(({ latestStatus }) =>
    isConfirmedIssue(latestStatus),
  ).length;

  const trendBuckets = new Map<
    string,
    {
      date: Date;
      totalCount: number;
      anomalyCount: number;
    }
  >();

  for (const event of events) {
    const key = dayKey(event.occurredAt);
    const existing =
      trendBuckets.get(key) ??
      {
        date: event.occurredAt,
        totalCount: 0,
        anomalyCount: 0,
      };

    existing.totalCount += 1;

    const anomalyThreshold = event.anomalyOutput?.threshold;
    const anomalyScore = event.anomalyOutput?.score;

    if (
      anomalyThreshold !== null &&
      anomalyThreshold !== undefined &&
      anomalyScore !== undefined &&
      anomalyScore >= anomalyThreshold
    ) {
      existing.anomalyCount += 1;
    }

    trendBuckets.set(key, existing);
  }

  const anomalyTrend = Array.from(trendBuckets.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-7)
    .map((bucket) => ({
      label: formatDayLabel(bucket.date),
      anomalyRatePct: round1(percent(bucket.anomalyCount, bucket.totalCount)),
      anomalyCount: bucket.anomalyCount,
      totalCount: bucket.totalCount,
    }));

  const latestTrendPoint = anomalyTrend[anomalyTrend.length - 1];

  return {
    summary: {
      totalEvents,
      flaggedEvents: flaggedEvents.length,
      reviewedFlaggedEvents: reviewedFlaggedEvents.length,
      confirmedIssueCount,
      escalatedCount,
      flaggedRatePct: round1(percent(flaggedEvents.length, totalEvents)),
      reviewCompletionRatePct: round1(
        percent(reviewedFlaggedEvents.length, flaggedEvents.length),
      ),
      avgReviewTurnaroundHours,
      approvedPct: round1(percent(approvedCount, reviewedFlaggedEvents.length)),
      rejectedPct: round1(percent(rejectedCount, reviewedFlaggedEvents.length)),
      escalatedPct: round1(percent(escalatedCount, reviewedFlaggedEvents.length)),
      highRiskPrecisionProxyPct: round1(
        percent(highRiskConfirmedCount, highRiskReviewed.length),
      ),
      latestAnomalyRatePct: latestTrendPoint?.anomalyRatePct ?? 0,
      latestAnomalyRateLabel: latestTrendPoint?.label ?? "No anomaly data",
    },
    funnel: [
      {
        label: "Total events",
        value: totalEvents,
        helper: "All ingested events in the database.",
      },
      {
        label: "Flagged",
        value: flaggedEvents.length,
        helper: "Events marked as flagged after model scoring.",
      },
      {
        label: "Reviewed",
        value: reviewedFlaggedEvents.length,
        helper: "Flagged events with at least one saved reviewer decision.",
      },
      {
        label: "Confirmed issue",
        value: confirmedIssueCount,
        helper: "Latest review is APPROVED or ESCALATED.",
      },
      {
        label: "Escalated",
        value: escalatedCount,
        helper: "Latest review is ESCALATED.",
      },
    ],
    anomalyTrend,
  };
}
