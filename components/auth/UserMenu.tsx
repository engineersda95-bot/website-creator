'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { LogOut, ChevronDown, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { confirm } from '@/components/shared/ConfirmDialog';

export const UserMenu: React.FC = () => {
  const { user, logout } = useEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initial = user.email?.[0].toUpperCase() || '?';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-zinc-100 transition-all border border-zinc-100 bg-white shadow-sm active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-[11px] shadow-inner">
          {initial}
        </div>
        <span className="text-[12px] font-bold text-zinc-600 hidden md:inline">{user.email?.split('@')[0]}</span>
        <ChevronDown size={12} className={cn("text-zinc-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] py-1.5 z-[10001] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="text-sm font-black text-zinc-900 truncate uppercase tracking-tight">{user.email?.split('@')[0]}</p>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-medium">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/editor"
              className="px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <Layout size={14} className="text-zinc-400" />
              I miei siti
            </Link>
          </div>

          <div className="border-t border-zinc-100 pt-1 mt-1">
            <button
              onClick={async () => { 
                if (useEditorStore.getState().hasUnsavedChanges) {
                  if (!await confirm({ title: 'Modifiche non salvate', message: 'Hai delle modifiche non salvate. Vuoi uscire e perdere le modifiche?', confirmLabel: 'Esci', variant: 'danger' })) {
                    return;
                  }
                }
                await logout(); 
                useEditorStore.getState().setUnsavedChanges(false);
                window.location.href = '/login'; 
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-bold"
            >
              <LogOut size={14} />
              Disconnetti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
