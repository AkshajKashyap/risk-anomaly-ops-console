import { PageLoadingState } from "@/components/page-loading-state";

export default function AnalyticsLoading() {
  return (
    <PageLoadingState
      title="Loading analytics"
      description="Computing KPI cards, funnel stages, and anomaly-rate trend data."
    />
  );
}
