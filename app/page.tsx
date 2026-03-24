import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-4xl py-20">
        <h1 className="text-5xl font-bold tracking-tight">
          Risk Anomaly Ops Console
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-400">
          Fraud and anomaly review console showcasing the app shell, database
          schema, and seeded demo workflow.
        </p>

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-5 py-3 font-medium text-slate-900"
          >
            Open dashboard
          </Link>
          <Link
            href="/sign-in"
            className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-100"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-100"
          >
            Sign up
          </Link>
          <Link
            href="/api/health"
            className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-100"
          >
            Check health
          </Link>
        </div>
      </div>
    </main>
  );
}
