'use client'

import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm p-8 bg-white border border-zinc-200 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Bentornato!</h1>
        <p className="text-zinc-500 text-sm text-center mb-6">Accedi per gestire i tuoi siti vetrina</p>
        
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              className="w-full p-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="latua@email.it"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              className="w-full p-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          
          {state?.error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
          >
            {isPending ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-zinc-400">
          Non hai un account? Registrati su Supabase.
        </div>
      </div>
    </div>
  )
}
