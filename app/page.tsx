import Link from "next/link";

const evaluationSteps = [
  {
    title: "Review queue",
    description: "Start on the dashboard to see flagged events, scores, and current review status.",
  },
  {
    title: "Case detail",
    description: "Open one case to inspect event metadata, stored model outputs, and reviewer context.",
  },
  {
    title: "Analytics",
    description: "Finish in analytics to confirm the workflow rolls up into queue health and outcome KPIs.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/70 px-8 py-14 shadow-2xl shadow-slate-950/30">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Risk Anomaly Ops Console
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              A fraud and anomaly review console for triaging flagged events,
              recording reviewer decisions, and tracking queue health.
            </h1>
            <p className="mt-5 text-base text-slate-300 sm:text-lg">
              Built to show the product layer around ML scoring: review queue,
              case investigation, reviewer action, and analytics in one flow.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-200 sm:text-base">
              Queue -&gt; case detail -&gt; reviewer action -&gt; analytics
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-slate-200"
            >
              Open dashboard
            </Link>
            <Link
              href="/analytics"
              className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Open analytics
            </Link>
            <Link
              href="/sign-in"
              className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Sign in
            </Link>
            <Link
              href="/api/health"
              className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Check health
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
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
                <dt className="text-sm font-medium text-slate-300">Seeded view</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-400">
                  The repo includes seeded events, model outputs, and reviewer
                  decisions so the queue and analytics make sense quickly.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-300">What stands out</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-400">
                  It connects live scoring, human review, and operational KPIs
                  instead of stopping at a model demo.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
