"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create live-scored demo event");
      }

      setMessage("Demo event created and scored");
      router.push(`/dashboard/events/${data.eventId}`);
      router.refresh();
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
