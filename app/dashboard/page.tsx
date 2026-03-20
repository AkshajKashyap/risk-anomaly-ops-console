import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const events = await prisma.eventItem.findMany({
    orderBy: { occurredAt: "desc" },
    take: 20,
    include: {
      riskPrediction: true,
      anomalyOutput: true,
    },
  });

  const flaggedCount = events.filter((e) => e.flagged).length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Risk Review Console</h1>
            <p className="mt-2 text-slate-400">
              Week 10 skeleton, seeded data, database-connected dashboard
            </p>
          </div>
          <UserButton />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Visible events</p>
            <p className="mt-2 text-2xl font-semibold">{events.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Flagged in view</p>
            <p className="mt-2 text-2xl font-semibold">{flaggedCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Data source</p>
            <p className="mt-2 text-2xl font-semibold">Postgres</p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">External ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Flagged</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Anomaly Score</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-slate-800">
                  <td className="px-4 py-3 font-medium">{event.externalId}</td>
                  <td className="px-4 py-3">{event.eventType}</td>
                  <td className="px-4 py-3">{event.source}</td>
                  <td className="px-4 py-3">{event.country ?? "-"}</td>
                  <td className="px-4 py-3">
                    {event.amount !== null ? `$${event.amount.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3">{event.flagged ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{event.riskPrediction?.score ?? "-"}</td>
                  <td className="px-4 py-3">{event.anomalyOutput?.score ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
