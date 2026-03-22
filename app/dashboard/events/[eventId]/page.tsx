import Link from "next/link";
import { notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { ReviewActionForm } from "@/components/review-action-form";

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

function formatMoney(amount: number | null) {
  if (amount === null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;

  const event = await prisma.eventItem.findUnique({
    where: { id: eventId },
    include: {
      riskPrediction: true,
      anomalyOutput: true,
      reviews: {
        include: {
          reviewer: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      feedbackLabels: {
        include: {
          reviewer: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const latestReview = event.reviews[0];
  const latestLabel = event.feedbackLabels[0];
  const latestStatus = latestReview?.status ?? "PENDING";
  const thresholdStatus =
    (event.riskPrediction?.score ?? 0) >= (event.riskPrediction?.threshold ?? 1) ||
    (event.anomalyOutput?.score ?? 0) >= (event.anomalyOutput?.threshold ?? 1)
      ? "ABOVE ALERT THRESHOLD"
      : "BELOW ALERT THRESHOLD";

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
              ← Back to queue
            </Link>
            <h1 className="mt-3 text-3xl font-bold">
              Case {event.externalId ?? event.id}
            </h1>
            <p className="mt-2 text-slate-400">
              Inspect model outputs, metadata, and reviewer decisions for this event.
            </p>
          </div>
          <UserButton />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Risk score</p>
            <p className="mt-2 text-2xl font-semibold">
              {event.riskPrediction?.score?.toFixed(3) ?? "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Anomaly score</p>
            <p className="mt-2 text-2xl font-semibold">
              {event.anomalyOutput?.score?.toFixed(3) ?? "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Confidence</p>
            <p className="mt-2 text-2xl font-semibold">
              {event.riskPrediction?.confidence?.toFixed(3) ?? "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Status</p>
            <div className="mt-2">
              <StatusBadge status={latestStatus} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold">Case summary</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Event type</p>
                  <p className="mt-1">{event.eventType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Source</p>
                  <p className="mt-1">{event.source}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Country</p>
                  <p className="mt-1">{event.country ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Amount</p>
                  <p className="mt-1">{formatMoney(event.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Occurred at</p>
                  <p className="mt-1">{formatDate(event.occurredAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Threshold status</p>
                  <p className="mt-1">{thresholdStatus}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold">Model details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Risk model</p>
                  <p className="mt-1">
                    {event.riskPrediction?.modelName ?? "-"} / {event.riskPrediction?.modelVersion ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Anomaly model</p>
                  <p className="mt-1">
                    {event.anomalyOutput?.modelName ?? "-"} / {event.anomalyOutput?.modelVersion ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Risk threshold</p>
                  <p className="mt-1">{event.riskPrediction?.threshold?.toFixed(3) ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Anomaly threshold</p>
                  <p className="mt-1">{event.anomalyOutput?.threshold?.toFixed(3) ?? "-"}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold">Payload metadata</h2>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-300">
{JSON.stringify(event.payload, null, 2)}
              </pre>
            </section>
          </div>

          <div className="space-y-6">
            <ReviewActionForm eventId={event.id} />

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold">Latest review</h2>
              {latestReview ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400">Reviewer</p>
                    <p>{latestReview.reviewer.name ?? latestReview.reviewer.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Decision</p>
                    <div className="mt-1">
                      <StatusBadge status={latestReview.status} />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400">Updated</p>
                    <p>{formatDate(latestReview.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Note</p>
                    <p>{latestReview.note ?? "-"}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No review saved yet.</p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold">Latest feedback label</h2>
              {latestLabel ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400">Reviewer</p>
                    <p>{latestLabel.reviewer.name ?? latestLabel.reviewer.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Label</p>
                    <p>{latestLabel.label}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Updated</p>
                    <p>{formatDate(latestLabel.updatedAt)}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No feedback label saved yet.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
