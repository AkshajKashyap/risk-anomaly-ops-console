type MetricCardProps = {
  label: string;
  value: string;
  helpText: string;
};

export function MetricCard({ label, value, helpText }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helpText}</p>
    </div>
  );
}
