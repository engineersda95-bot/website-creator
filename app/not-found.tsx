import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6">
        <span className="text-white font-black text-lg">SV</span>
      </div>
      <h1 className="text-6xl font-black text-zinc-200">404</h1>
      <h2 className="text-xl font-bold text-zinc-900 mt-4">Pagina non trovata</h2>
      <p className="text-zinc-500 mt-2 max-w-sm">
        La pagina che stai cercando non esiste o è stata spostata.
      </p>
      <div className="flex items-center gap-3 mt-8">
        <Link
          href="/"
          className="px-5 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-all active:scale-[0.97]"
        >
          Torna alla home
        </Link>
        <Link
          href="/editor"
          className="px-5 py-2.5 border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-all"
        >
          Vai all&apos;editor
        </Link>
      </div>
    </div>
  );
}
