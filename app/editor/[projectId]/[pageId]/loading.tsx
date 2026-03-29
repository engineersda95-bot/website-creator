export default function PageEditorLoading() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r border-zinc-200 bg-zinc-50 p-4 flex flex-col gap-4">
        <div className="h-6 w-32 rounded-xl bg-zinc-100 animate-pulse" />
        <div className="h-10 w-full rounded-xl bg-zinc-100 animate-pulse" />
        <div className="flex flex-col gap-3 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-full rounded-xl bg-zinc-100 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-8">
        <div className="h-full min-h-[calc(100vh-4rem)] rounded-xl bg-zinc-100 animate-pulse" />
      </div>
    </div>
  );
}
