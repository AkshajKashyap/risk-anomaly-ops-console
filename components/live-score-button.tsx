"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ScoreServiceResult = {
  ok?: boolean;
  score?: number;
};

type RescoreResponse = {
  risk?: ScoreServiceResult;
  anomaly?: ScoreServiceResult;
  error?: string;
};

function summarizeResult(data: RescoreResponse) {
  const riskSummary =
    data.risk?.ok && typeof data.risk.score === "number"
      ? `risk ${data.risk.score.toFixed(3)}`
      : "risk failed";

  const anomalySummary =
    data.anomaly?.ok && typeof data.anomaly.score === "number"
      ? `anomaly ${data.anomaly.score.toFixed(3)}`
      : "anomaly failed";

  return `${riskSummary}, ${anomalySummary}`;
}

export function LiveScoreButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setRunning(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/events/${eventId}/rescore`, {
        method: "POST",
      });

      const data: RescoreResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || summarizeResult(data));
      }

      setMessage(`Live scoring saved: ${summarizeResult(data)}`);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Live scoring failed";
      setMessage(errorMessage);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold text-slate-100">Live ML scoring</h2>
      <p className="mt-1 text-sm text-slate-400">
        Call both local ML services, normalize the responses, and persist the latest outputs.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={running}
          className="rounded-xl bg-sky-400 px-4 py-2 font-medium text-slate-950 disabled:opacity-60"
        >
          {running ? "Running..." : "Run live scoring now"}
        </button>

        {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      </div>
    </div>
  );
}
