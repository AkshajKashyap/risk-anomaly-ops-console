"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ScoreServiceResult = {
  ok?: boolean;
  error?: string;
  score?: number;
};

type CreateDemoEventResponse = {
  eventId?: string;
  risk?: ScoreServiceResult;
  anomaly?: ScoreServiceResult;
  error?: string;
};

function scoringOutcome(data: CreateDemoEventResponse) {
  const riskOk = data.risk?.ok === true;
  const anomalyOk = data.anomaly?.ok === true;

  if (riskOk && anomalyOk) return "scored";
  if (riskOk || anomalyOk) return "partial";
  return "failed";
}

export function CreateDemoEventButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setRunning(true);
    setMessage(null);

    try {
      const response = await fetch("/api/events/ingest-demo", {
        method: "POST",
      });

      const data: CreateDemoEventResponse = await response.json();

      if (data.eventId) {
        const outcome = scoringOutcome(data);
        router.push(`/dashboard/events/${data.eventId}?created=1&scoring=${outcome}`);
        router.refresh();
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create live-scored demo event");
      }

      setMessage("Demo event created and scored");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create demo event";
      setMessage(errorMessage);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={running}
        className="rounded-xl bg-white px-4 py-2 font-medium text-slate-900 disabled:opacity-60"
      >
        {running ? "Creating..." : "Create + live score demo event"}
      </button>

      {message ? <p className="text-sm text-slate-400">{message}</p> : null}
    </div>
  );
}
