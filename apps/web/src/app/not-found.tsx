import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        {/* Wimmer logo mark */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-wimmer-600 text-white font-bold text-2xl shadow-lg">
          W
        </div>

        {/* Error code */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-wimmer-500">
            404
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Back link */}
        <Link
          href="/overview"
          className="inline-flex items-center gap-2 bg-wimmer-600 hover:bg-wimmer-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Back to Overview
        </Link>

        {/* Branding */}
        <p className="text-xs text-slate-400">
          Wimmer &mdash; Intelligence Beyond Seasons
        </p>
      </div>
    </div>
  );
}
