"use client";

import Link from "next/link";

type PageErrorStateProps = {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  reset: () => void;
};

export function PageErrorState({
  title,
  description,
  backHref,
  backLabel,
  reset,
}: PageErrorStateProps) {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-rose-500/30 bg-slate-900 p-6">
        <p className="text-sm font-medium text-rose-300">Something went wrong</p>
        <h1 className="mt-2 text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-slate-400">{description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-white px-4 py-2 font-medium text-slate-900"
          >
            Try again
          </button>

          <Link
            href={backHref}
            className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-100"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
