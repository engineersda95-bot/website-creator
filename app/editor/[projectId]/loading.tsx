export default function ProjectDashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      {/* Breadcrumb placeholder */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-5 w-16 rounded-xl bg-zinc-100 animate-pulse" />
        <div className="h-5 w-4 rounded bg-zinc-100 animate-pulse" />
        <div className="h-5 w-32 rounded-xl bg-zinc-100 animate-pulse" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-56 rounded-xl bg-zinc-100 animate-pulse" />
        <div className="h-10 w-32 rounded-xl bg-zinc-100 animate-pulse" />
      </div>

      {/* Page card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-xl bg-zinc-100 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
