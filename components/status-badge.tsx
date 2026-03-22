type StatusValue = "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED";

const statusStyles: Record<StatusValue, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  APPROVED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  REJECTED: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  ESCALATED: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status in statusStyles ? status : "PENDING") as StatusValue;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[normalized]}`}
    >
      {normalized}
    </span>
  );
}
