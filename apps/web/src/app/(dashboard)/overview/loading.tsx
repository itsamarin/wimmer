export default function OverviewLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 flex-shrink-0">
        <div className="space-y-1.5">
          <div className="h-3.5 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="h-2.5 w-56 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-hidden">
        {/* Banner skeleton */}
        <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse" />
              </div>
              <div className="h-7 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="h-2.5 w-16 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="h-3.5 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="h-2.5 w-60 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="h-5 w-32 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-[260px] rounded-lg bg-slate-50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
