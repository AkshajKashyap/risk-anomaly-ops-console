"use client";

import { PageErrorState } from "@/components/page-error-state";

export default function EventDetailError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Unable to load this case"
      description="The case detail page failed to load. Retry the request or go back to the review queue."
      backHref="/dashboard"
      backLabel="Back to queue"
      reset={reset}
    />
  );
}
