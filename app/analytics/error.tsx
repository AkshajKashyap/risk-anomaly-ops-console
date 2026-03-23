"use client";

import { PageErrorState } from "@/components/page-error-state";

export default function AnalyticsError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Unable to load analytics"
      description="The analytics page failed to compute its KPI queries. Retry the request or go back to the review queue."
      backHref="/dashboard"
      backLabel="Back to queue"
      reset={reset}
    />
  );
}
