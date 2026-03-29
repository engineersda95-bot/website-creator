export default function EditorLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 rounded-xl bg-zinc-100 animate-pulse" />
        <div className="h-10 w-36 rounded-xl bg-zinc-100 animate-pulse" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-xl bg-zinc-100 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
