'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        className="flex items-center gap-1.5 p-1 pr-2 rounded-lg hover:bg-zinc-100 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-[11px]">
          {initial}
        </div>
        <ChevronDown size={12} className={cn("text-zinc-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] py-1 z-[10001] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="text-sm font-medium text-zinc-900 truncate">{user.email?.split('@')[0]}</p>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={async () => { await logout(); window.location.href = '/login'; }}
              className="w-full px-4 py-2.5 text-left text-sm text-zinc-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2.5 transition-colors"
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
