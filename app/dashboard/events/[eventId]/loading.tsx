import { PageLoadingState } from "@/components/page-loading-state";

export default function EventDetailLoading() {
  return (
    <PageLoadingState
      title="Loading case detail"
      description="Fetching stored model outputs, review state, and event metadata."
    />
  );
}
