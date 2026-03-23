import { PageLoadingState } from "@/components/page-loading-state";

export default function DashboardLoading() {
  return (
    <PageLoadingState
      title="Loading review queue"
      description="Fetching flagged events, latest review statuses, and model scores."
    />
  );
}
