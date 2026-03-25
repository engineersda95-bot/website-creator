'use client'

import { useActionState } from 'react'
import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-8 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <span className="text-white font-black text-xs">SV</span>
          </div>
          <span className="text-lg font-bold text-zinc-900">SitiVetrina</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          Torna alla home
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Bentornato!</h1>
            <p className="text-zinc-500 text-sm mt-2">Accedi per gestire i tuoi siti vetrina</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                placeholder="latua@email.it"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-zinc-900 text-white rounded-lg font-semibold text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Accesso in corso...
                </span>
              ) : 'Accedi'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-400">
            Accedi al tuo account per gestire i tuoi siti
          </p>
        </div>
      </div>
    </div>
  )
}
