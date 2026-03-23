type PageLoadingStateProps = {
  title: string;
  description: string;
};

export function PageLoadingState({
  title,
  description,
}: PageLoadingStateProps) {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="max-w-3xl">
          <div className="h-4 w-32 rounded bg-slate-800" />
          <div className="mt-4 h-10 w-80 rounded bg-slate-800" />
          <div className="mt-3 h-4 w-full max-w-2xl rounded bg-slate-900" />
          <div className="mt-2 h-4 w-full max-w-xl rounded bg-slate-900" />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-lg font-semibold text-slate-200">{title}</p>
          <p className="mt-2 text-sm text-slate-400">{description}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="h-4 w-28 rounded bg-slate-800" />
                <div className="mt-4 h-8 w-24 rounded bg-slate-800" />
                <div className="mt-3 h-4 w-full rounded bg-slate-900" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
