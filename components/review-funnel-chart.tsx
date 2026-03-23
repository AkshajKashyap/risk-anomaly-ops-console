import type { FunnelStage } from "@/lib/analytics";

const stageStyles = [
  "bg-sky-500/20 text-sky-200 border border-sky-500/30",
  "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30",
  "bg-amber-500/20 text-amber-200 border border-amber-500/30",
  "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
  "bg-violet-500/20 text-violet-200 border border-violet-500/30",
];

export function ReviewFunnelChart({ stages }: { stages: FunnelStage[] }) {
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Review funnel</h2>
          <p className="mt-1 text-sm text-slate-400">
            Latest-review view of how events move from model flagging to human action.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {stages.map((stage, index) => {
          const widthPct =
            stage.value === 0 ? 0 : Math.max(12, Math.round((stage.value / maxValue) * 100));

          return (
            <div key={stage.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium text-slate-200">{stage.label}</p>
                  <p className="text-slate-500">{stage.helper}</p>
                </div>
                <p className="text-base font-semibold text-slate-100">{stage.value}</p>
              </div>

              <div className="h-11 rounded-2xl bg-slate-950 p-1">
                <div
                  className={`flex h-full items-center rounded-xl px-3 text-sm font-medium ${
                    stageStyles[index % stageStyles.length]
                  }`}
                  style={{ width: `${widthPct}%` }}
                >
                  {stage.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
