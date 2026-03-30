'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Page } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { useRouter } from 'next/navigation';
import { confirm } from '@/components/shared/ConfirmDialog';

interface PageSwitcherProps {
  currentPage: Page | null;
  pages: Page[];
  projectId: string;
  initialPageId: string;
  fontFamily?: string;
}

export function PageSwitcher({ currentPage, pages, projectId, initialPageId, fontFamily }: PageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { hasUnsavedChanges } = useEditorStore();
  const router = useRouter();

  const handlePageClick = async (e: React.MouseEvent, targetPageId: string) => {
    if (targetPageId === initialPageId) {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (hasUnsavedChanges) {
      e.preventDefault();
      if (!await confirm({ title: 'Modifiche non salvate', message: 'Hai delle modifiche non salvate. Vuoi abbandonare la pagina e perdere le modifiche?', confirmLabel: 'Abbandona', variant: 'danger' })) {
        setIsOpen(false);
      } else {
        router.push(`/editor/${projectId}/${targetPageId}`);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="relative" style={{ fontFamily }} data-tour="page-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 -ml-2 rounded-xl transition-all group border",
          isOpen 
            ? "bg-white border-zinc-200 shadow-lg scale-[1.02]" 
            : "bg-zinc-50 border-zinc-100 hover:bg-white hover:border-zinc-200 hover:shadow-md"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-zinc-900 font-black uppercase tracking-tight text-[12px] group-hover:text-blue-600 transition-colors">
            {currentPage?.title || 'Pagina'}
          </span>
        </div>
        <ChevronDown 
          size={14} 
          className={cn(
            "text-zinc-400 group-hover:text-blue-500 transition-transform duration-300", 
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[10000]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-zinc-200 py-1.5 z-[10001] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-zinc-100 mb-1">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-[9px]">Pagine del sito</p>
            </div>
            <div className="max-h-[350px] overflow-y-auto px-1.5 custom-scrollbar">
              {pages.map((p) => {
                const isCurrent = p.id === initialPageId;
                return (
                  <Link
                    key={p.id}
                    href={`/editor/${projectId}/${p.id}`}
                    onClick={(e) => { handlePageClick(e, p.id); if (!e.defaultPrevented) setIsOpen(false); }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all mb-0.5 group/item",
                      isCurrent 
                        ? "bg-blue-50 text-blue-700 font-bold" 
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className={cn("truncate font-semibold", isCurrent ? "text-blue-700" : "text-zinc-700 group-hover/item:text-zinc-900")}>
                        {p.title}
                      </span>
                      <span className={cn("text-[10px] font-normal truncate", isCurrent ? "text-blue-400" : "text-zinc-400")}>
                        /{p.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.language && (
                        <span className={cn(
                          "text-[9px] font-black px-1 py-0.5 rounded uppercase tracking-tighter shrink-0",
                          isCurrent ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300"
                        )}>
                          {p.language}
                        </span>
                      )}
                      {isCurrent && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
