'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { LogOut, User, Layout, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const UserMenu: React.FC = () => {
  const { user, logout, project } = useEditorStore();
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

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pl-3 pr-2 rounded-full border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all bg-white"
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Account</span>
          <span className="text-xs font-bold text-zinc-900 leading-none">{user.email?.split('@')[0]}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-100">
          {user.email?.[0].toUpperCase()}
        </div>
        <ChevronDown size={14} className={cn("text-zinc-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white border border-zinc-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-2 z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-zinc-50 mb-2">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Email</p>
            <p className="text-sm font-bold text-zinc-900 truncate">{user.email}</p>
          </div>

          <div className="h-px bg-zinc-50 my-2" />

          <button 
            onClick={() => logout()}
            className="w-full px-5 py-3 text-left hover:bg-red-50 flex items-center gap-3 group transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-red-100 group-hover:text-red-600 transition-all">
              <LogOut size={16} />
            </div>
            <span className="text-sm font-bold text-zinc-600 group-hover:text-red-700">Disconnetti</span>
          </button>
        </div>
      )}
    </div>
  );
};
