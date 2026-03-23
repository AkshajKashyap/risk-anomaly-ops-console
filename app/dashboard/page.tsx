import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { CreateDemoEventButton } from "@/components/create-demo-event-button";

type DashboardPageProps = {
  searchParams?: Promise<{
    status?: string;
    sort?: string;
    direction?: string;
    flaggedOnly?: string;
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

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const statusFilter = params.status ?? "all";
  const sortBy = params.sort ?? "occurredAt";
  const direction = params.direction === "asc" ? "asc" : "desc";
  const flaggedOnly = params.flaggedOnly !== "false";

  const events = await prisma.eventItem.findMany({
    where: flaggedOnly ? { flagged: true } : undefined,
    include: {
      riskPrediction: true,
      anomalyOutput: true,
      reviews: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });

  const rows = events
    .map((event) => {
      const latestReview = event.reviews[0];
      const latestStatus = latestReview?.status ?? "PENDING";

      return {
        ...event,
        latestStatus,
      };
    })
    .filter((event) => {
      if (statusFilter === "all") return true;
      return event.latestStatus === statusFilter.toUpperCase();
    })
    .sort((a, b) => {
      const multiplier = direction === "asc" ? 1 : -1;

      if (sortBy === "risk") {
        return (
          ((a.riskPrediction?.score ?? -1) - (b.riskPrediction?.score ?? -1)) *
          multiplier
        );
      }

      if (sortBy === "anomaly") {
        return (
          ((a.anomalyOutput?.score ?? -1) - (b.anomalyOutput?.score ?? -1)) *
          multiplier
        );
      }

      return (a.occurredAt.getTime() - b.occurredAt.getTime()) * multiplier;
    });

  const totalFlagged = events.length;
  const approvedCount = rows.filter((row) => row.latestStatus === "APPROVED").length;
  const escalatedCount = rows.filter((row) => row.latestStatus === "ESCALATED").length;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Risk review queue</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              Week 12 integration: create events, call both local ML services, persist live outputs,
              and review flagged cases in one workflow.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Link
              href="/analytics"
              className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-100"
            >
              Open analytics
            </Link>
            <CreateDemoEventButton />
            <UserButton />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Flagged queue size</p>
            <p className="mt-2 text-2xl font-semibold">{totalFlagged}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Approved in view</p>
            <p className="mt-2 text-2xl font-semibold">{approvedCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Escalated in view</p>
            <p className="mt-2 text-2xl font-semibold">{escalatedCount}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="rounded-xl border border-slate-700 px-3 py-2" href="/dashboard?status=all&sort=occurredAt&direction=desc">
              All
            </Link>
            <Link className="rounded-xl border border-slate-700 px-3 py-2" href="/dashboard?status=pending&sort=occurredAt&direction=desc">
              Pending
            </Link>
            <Link className="rounded-xl border border-slate-700 px-3 py-2" href="/dashboard?status=approved&sort=occurredAt&direction=desc">
              Approved
            </Link>
            <Link className="rounded-xl border border-slate-700 px-3 py-2" href="/dashboard?status=rejected&sort=occurredAt&direction=desc">
              Rejected
            </Link>
            <Link className="rounded-xl border border-slate-700 px-3 py-2" href="/dashboard?status=escalated&sort=occurredAt&direction=desc">
              Escalated
            </Link>
            <Link className="rounded-xl border border-slate-700 px-3 py-2" href="/dashboard?status=all&sort=risk&direction=desc">
              Sort by risk
            </Link>
            <Link className="rounded-xl border border-slate-700 px-3 py-2" href="/dashboard?status=all&sort=anomaly&direction=desc">
              Sort by anomaly
            </Link>
            <Link className="rounded-xl border border-slate-700 px-3 py-2" href="/dashboard?status=all&sort=occurredAt&direction=desc&flaggedOnly=false">
              Show all events
            </Link>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-800 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">External ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Anomaly</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Occurred</th>
                <th className="px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((event) => (
                <tr key={event.id} className="border-b border-slate-800">
                  <td className="px-4 py-3 font-medium">{event.externalId ?? event.id}</td>
                  <td className="px-4 py-3">{event.eventType}</td>
                  <td className="px-4 py-3">{event.source}</td>
                  <td className="px-4 py-3">{event.country ?? "-"}</td>
                  <td className="px-4 py-3">{formatMoney(event.amount)}</td>
                  <td className="px-4 py-3">
                    {event.riskPrediction?.score?.toFixed(3) ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    {event.anomalyOutput?.score?.toFixed(3) ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={event.latestStatus} />
                  </td>
                  <td className="px-4 py-3">{formatDate(event.occurredAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="rounded-lg border border-slate-700 px-3 py-2"
                    >
                      View case
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 ? (
            <div className="p-6 text-sm text-slate-400">
              No events matched the current filters.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
