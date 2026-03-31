import Link from "next/link";
import { notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { ReviewActionForm } from "@/components/review-action-form";
import { LiveScoreButton } from "@/components/live-score-button";

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams?: Promise<{
    created?: string;
    scoring?: string;
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

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const { userId } = await auth();
  const { eventId } = await params;
  const query = (await searchParams) ?? {};

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
  const scoringState =
    query.created === "1" &&
    (query.scoring === "scored" || query.scoring === "partial" || query.scoring === "failed")
      ? query.scoring
      : null;
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
              Inspect stored outputs, run live scoring, and review this event end to end.
            </p>
          </div>
          {userId ? (
            <UserButton />
          ) : (
            <Link
              href="/sign-in"
              className="rounded-xl bg-white px-4 py-2 font-medium text-slate-900"
            >
              Sign in to edit
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {scoringState ? (
            <section
              className={`md:col-span-4 rounded-2xl border p-4 ${
                scoringState === "scored"
                  ? "border-emerald-400/25 bg-emerald-400/10"
                  : scoringState === "partial"
                    ? "border-amber-400/25 bg-amber-400/10"
                    : "border-rose-400/25 bg-rose-400/10"
              }`}
            >
              <p className="text-sm font-medium text-white">
                {scoringState === "scored"
                  ? "Demo event created and scored"
                  : scoringState === "partial"
                    ? "Demo event created with partial scoring"
                    : "Demo event created, but live scoring failed"}
              </p>
              <p className="mt-1 text-sm text-slate-200">
                {scoringState === "scored"
                  ? "Both ML services responded and the latest outputs were saved on this case."
                  : scoringState === "partial"
                    ? "The case was created, but only one ML service responded. You can still inspect the event and retry scoring after sign-in."
                    : "The case was created, but neither ML service responded. This usually means the local scoring services are offline. You can still inspect the event and retry scoring after sign-in."}
              </p>
            </section>
          ) : null}

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
            <p className="text-sm text-slate-400">Review status</p>
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
                  <p className="text-sm text-slate-400">Flagged state</p>
                  <p className="mt-1">{event.flagged ? "Flagged" : "Not flagged"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Threshold status</p>
                  <p className="mt-1">{thresholdStatus}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold">Stored model outputs</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Risk model</p>
                  <p className="mt-1">{event.riskPrediction?.modelName ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Risk version</p>
                  <p className="mt-1">{event.riskPrediction?.modelVersion ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Risk threshold</p>
                  <p className="mt-1">{event.riskPrediction?.threshold?.toFixed(3) ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Risk scored at</p>
                  <p className="mt-1">
                    {event.riskPrediction ? formatDate(event.riskPrediction.createdAt) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Risk latency</p>
                  <p className="mt-1">
                    {event.riskPrediction?.latencyMs !== null &&
                    event.riskPrediction?.latencyMs !== undefined
                      ? `${event.riskPrediction.latencyMs} ms`
                      : "-"}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-4 sm:col-span-2" />

                <div>
                  <p className="text-sm text-slate-400">Anomaly model</p>
                  <p className="mt-1">{event.anomalyOutput?.modelName ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Anomaly version</p>
                  <p className="mt-1">{event.anomalyOutput?.modelVersion ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Anomaly threshold</p>
                  <p className="mt-1">{event.anomalyOutput?.threshold?.toFixed(3) ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Anomaly scored at</p>
                  <p className="mt-1">
                    {event.anomalyOutput ? formatDate(event.anomalyOutput.createdAt) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Anomaly latency</p>
                  <p className="mt-1">
                    {event.anomalyOutput?.latencyMs !== null &&
                    event.anomalyOutput?.latencyMs !== undefined
                      ? `${event.anomalyOutput.latencyMs} ms`
                      : "-"}
                  </p>
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
            {userId ? (
              <>
                <LiveScoreButton eventId={event.id} />
                <ReviewActionForm eventId={event.id} />
              </>
            ) : (
              <section className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 p-5">
                <h2 className="text-lg font-semibold text-cyan-50">Read-only demo mode</h2>
                <p className="mt-1 text-sm text-cyan-50/85">
                  This case is publicly explorable so evaluators can inspect the workflow without
                  signing in. Sign in only if you want to rerun live scoring or save a reviewer
                  decision.
                </p>
                <div className="mt-4">
                  <Link
                    href="/sign-in"
                    className="inline-flex rounded-xl bg-white px-4 py-2 font-medium text-slate-900"
                  >
                    Sign in for write actions
                  </Link>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold">Latest review</h2>
              {latestReview ? (
                <div className="mt-4 space-y-3 text-sm">
                  {userId ? (
                    <div>
                      <p className="text-slate-400">Reviewer</p>
                      <p>{latestReview.reviewer.name ?? latestReview.reviewer.email}</p>
                    </div>
                  ) : null}
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
                  {userId ? (
                    <div>
                      <p className="text-slate-400">Reviewer</p>
                      <p>{latestLabel.reviewer.name ?? latestLabel.reviewer.email}</p>
                    </div>
                  ) : null}
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
