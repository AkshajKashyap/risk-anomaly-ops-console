"use client";

import { PageErrorState } from "@/components/page-error-state";

export default function DashboardError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Unable to load the review queue"
      description="The dashboard could not finish loading flagged events. Retry the request or go back to the home page."
      backHref="/"
      backLabel="Back to home"
      reset={reset}
    />
  );
}
