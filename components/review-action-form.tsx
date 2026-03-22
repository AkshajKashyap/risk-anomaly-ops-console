"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReviewStatus = "APPROVED" | "REJECTED" | "ESCALATED";
type FeedbackLabel =
  | ""
  | "TRUE_POSITIVE"
  | "FALSE_POSITIVE"
  | "BENIGN"
  | "NEEDS_MORE_INFO";

export function ReviewActionForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<ReviewStatus>("APPROVED");
  const [feedbackLabel, setFeedbackLabel] = useState<FeedbackLabel>("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          status,
          note,
          feedbackLabel: feedbackLabel || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save review");
      }

      setMessage("Review saved");
      setNote("");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
    >
      <h2 className="text-lg font-semibold text-slate-100">Reviewer action</h2>
      <p className="mt-1 text-sm text-slate-400">
        Approve, reject, or escalate this flagged event and optionally attach a feedback label.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Decision</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReviewStatus)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
          >
            <option value="APPROVED">Approve</option>
            <option value="REJECTED">Reject</option>
            <option value="ESCALATED">Escalate</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Feedback label</span>
          <select
            value={feedbackLabel}
            onChange={(e) => setFeedbackLabel(e.target.value as FeedbackLabel)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
          >
            <option value="">No label</option>
            <option value="TRUE_POSITIVE">True positive</option>
            <option value="FALSE_POSITIVE">False positive</option>
            <option value="BENIGN">Benign</option>
            <option value="NEEDS_MORE_INFO">Needs more info</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-slate-200">Note</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Add reviewer context or rationale"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
        />
      </label>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-white px-4 py-2 font-medium text-slate-900 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save review"}
        </button>

        {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      </div>
    </form>
  );
}
