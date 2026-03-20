'use client';

import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-zinc-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold tracking-tight">SitiVetrina</div>
        <div className="flex items-center gap-6">
          <a href="/editor" className="px-5 py-2.5 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200">
            Crea il tuo sito
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight leading-[1.1]">
            Crea il sito per la tua <br /> 
            <span className="text-blue-600">attività locale</span> in minuti.
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Niente codice. Niente stress. Solo un editor a blocchi semplice e potente per portare il tuo business online oggi stesso.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="/editor" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
              Inizia da zero
            </a>
          </div>

          <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <a href="/editor?template=RISTORANTE" className="group p-6 bg-white border border-zinc-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all text-left">
              <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">Template Ristorante 🍕</h3>
              <p className="text-zinc-500 text-sm mt-2">Hero + Menu + Dove siamo. Perfetto per pizzerie e locali.</p>
            </a>
            <a href="/editor?template=PROFESSIONISTA" className="group p-6 bg-white border border-zinc-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all text-left">
              <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">Template Professionista 💼</h3>
              <p className="text-zinc-500 text-sm mt-2">Servizi + Chi siamo. Ideale per avvocati o consulenti.</p>
            </a>
          </div>
        </div>

        {/* Floating Preview Card Mockup */}
        <div className="mt-20 w-full max-w-5xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden bg-zinc-50 aspect-video flex items-center justify-center text-zinc-400">
            [ Screenshot dell'Editor ]
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 text-center text-zinc-500 text-sm">
        <p>© 2024 SitiVetrina. Prodotto da Proximatica.</p>
      </footer>
    </div>
  );
}
