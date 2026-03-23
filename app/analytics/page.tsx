import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getAnalyticsSnapshot } from "@/lib/analytics";
import { MetricCard } from "@/components/metric-card";
import { ReviewFunnelChart } from "@/components/review-funnel-chart";

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatHours(value: number) {
  return `${value.toFixed(1)}h`;
}

export default async function AnalyticsPage() {
  const snapshot = await getAnalyticsSnapshot();
  const { summary } = snapshot;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
              ← Back to queue
            </Link>
            <h1 className="mt-3 text-3xl font-bold">Operations analytics</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              Week 13 view of queue health, reviewer throughput, and model-output quality
              across {summary.totalEvents} total events.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-100"
            >
              Open review queue
            </Link>
            <UserButton />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Flagged rate"
            value={formatPercent(summary.flaggedRatePct)}
            helpText={`${summary.flaggedEvents} flagged out of ${summary.totalEvents} total events.`}
          />
          <MetricCard
            label="Review completion rate"
            value={formatPercent(summary.reviewCompletionRatePct)}
            helpText={`${summary.reviewedFlaggedEvents} flagged events have a saved review.`}
          />
          <MetricCard
            label="Average review turnaround"
            value={formatHours(summary.avgReviewTurnaroundHours)}
            helpText="Average time from event creation to latest saved reviewer action."
          />
          <MetricCard
            label="Decision mix"
            value={`${summary.approvedPct.toFixed(1)} / ${summary.rejectedPct.toFixed(1)} / ${summary.escalatedPct.toFixed(1)}`}
            helpText="Approved / rejected / escalated as a percent of reviewed flagged events."
          />
          <MetricCard
            label="High-risk precision proxy"
            value={formatPercent(summary.highRiskPrecisionProxyPct)}
            helpText="Among threshold-crossing risk cases with a review, percent confirmed by reviewers."
          />
          <MetricCard
            label="Latest anomaly rate"
            value={formatPercent(summary.latestAnomalyRatePct)}
            helpText={`Most recent active day in trend: ${summary.latestAnomalyRateLabel}.`}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <ReviewFunnelChart stages={snapshot.funnel} />

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Anomaly rate, last 7 active days</h2>
            <p className="mt-1 text-sm text-slate-400">
              Share of events whose anomaly score met or exceeded the stored anomaly threshold.
            </p>

            {snapshot.anomalyTrend.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No anomaly trend data yet.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {snapshot.anomalyTrend.map((point) => {
                  const widthPct =
                    point.anomalyRatePct === 0 ? 0 : Math.max(10, Math.round(point.anomalyRatePct));

                  return (
                    <div key={point.label}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <p className="text-slate-300">{point.label}</p>
                        <p className="text-slate-400">
                          {point.anomalyCount}/{point.totalCount} ({point.anomalyRatePct.toFixed(1)}%)
                        </p>
                      </div>
                      <div className="h-3 rounded-full bg-slate-950">
                        <div
                          className="h-3 rounded-full bg-cyan-400/80"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-slate-100">KPI definitions</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="font-medium text-slate-200">Flagged rate</p>
              <p className="mt-2 text-sm text-slate-400">
                Flagged events divided by all events in the database.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="font-medium text-slate-200">Review completion rate</p>
              <p className="mt-2 text-sm text-slate-400">
                Flagged events with at least one saved review divided by all flagged events.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="font-medium text-slate-200">Average review turnaround</p>
              <p className="mt-2 text-sm text-slate-400">
                Average hours from event creation to the latest saved reviewer decision.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="font-medium text-slate-200">Decision mix</p>
              <p className="mt-2 text-sm text-slate-400">
                Share of reviewed flagged cases whose latest status is approved, rejected, or escalated.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="font-medium text-slate-200">High-risk precision proxy</p>
              <p className="mt-2 text-sm text-slate-400">
                Among reviewed events whose risk score crossed the stored threshold, percent confirmed
                by the latest review.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="font-medium text-slate-200">Confirmed issue</p>
              <p className="mt-2 text-sm text-slate-400">
                A case whose latest review status is APPROVED or ESCALATED.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
