import Link from "next/link";

const evaluationSteps = [
  {
    title: "Review queue",
    description: "Start the public demo on the dashboard to scan the seeded flagged queue and latest review state.",
  },
  {
    title: "Case detail",
    description: "Open one seeded case to inspect event metadata, stored model outputs, and reviewer context.",
  },
  {
    title: "Analytics",
    description: "Finish in analytics to confirm the workflow rolls up into queue health and outcome KPIs.",
  },
];

const proofChips = [
  "Persisted reviewer decisions",
  "Database-backed analytics",
  "Live rescoring with stored outputs",
];

const previewSections = [
  {
    eyebrow: "Queue",
    title: "Flagged review queue",
    detail: "Filter flagged events by status and sort by occurred time, risk, or anomaly.",
    items: ["Latest review status", "Stored risk + anomaly scores", "Open case detail"],
  },
  {
    eyebrow: "Case",
    title: "Case investigation",
    detail: "Inspect event metadata, prior labels, and reviewer context before taking action.",
    items: ["Reviewer action form", "Model metadata + thresholds", "Rescore event"],
  },
  {
    eyebrow: "Analytics",
    title: "Operational KPIs",
    detail: "Roll the workflow up into queue health, review completion, turnaround, and quality.",
    items: ["Flagged rate", "Average review turnaround", "High-risk precision proxy"],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/70 px-6 py-8 shadow-2xl shadow-slate-950/30 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Risk Anomaly Ops Console
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Review flagged events, record decisions, and track queue health.
              </h1>
              <p className="mt-5 text-base text-slate-300 sm:text-lg">
                Built to show the product layer around ML scoring: review queue,
                case investigation, reviewer action, and analytics in one flow.
              </p>
              <p className="mt-4 text-sm font-medium text-slate-200 sm:text-base">
                Queue → case detail → reviewer action → analytics
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                Public demo browsing is available without auth. Sign in only if you want to create
                demo events, rerun live scoring, or save reviewer decisions.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {proofChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-100"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-slate-200"
                >
                  Start public demo
                </Link>
                <Link
                  href="/analytics"
                  className="rounded-xl border border-slate-700 bg-slate-950/50 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  Open analytics
                </Link>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  Sign in for write actions
                </Link>
                <Link
                  href="/api/health"
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-300"
                >
                  Health
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-inner shadow-slate-950/60">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Product preview
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Queue, case review, and KPI rollups in one workflow
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {previewSections.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      {section.eyebrow}
                    </p>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-white">{section.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {section.detail}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300">
                        Real app surface
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {section.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              What to evaluate
            </p>
            <div className="mt-4 space-y-4">
              {evaluationSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <h2 className="text-lg font-semibold text-white">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Quick read
            </p>
            <dl className="mt-4 space-y-5">
              <div>
                <dt className="text-sm font-medium text-slate-300">Use case</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-400">
                  Internal ops tooling for reviewing suspicious payment,
                  identity, and login events.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-300">How to evaluate</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-400">
                  Start with the public dashboard, open one case, then finish in analytics. The
                  strongest path is readable in under two minutes without signing in.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-300">Seeded view</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-400">
                  The repo includes seeded events, model outputs, and reviewer
                  decisions so the queue and analytics make sense quickly.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-300">Live scoring note</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-400">
                  Write actions use local demo ML integrations. They work when the two local ML
                  service repos are running; otherwise the seeded read-only demo still works.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
