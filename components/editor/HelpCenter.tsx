'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  ChevronRight,
  ArrowLeft,
  HelpCircle,
  BookOpen,
  Play
} from 'lucide-react';
import { cn, fuzzySearch, formatRichText } from '@/lib/utils';
import { HELP_DOCS, HELP_CATEGORIES } from '@/lib/help-docs';
import { restartTour } from './OnboardingTour';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    let docs = HELP_DOCS;
    if (activeCategory) {
      docs = docs.filter(d => d.category === activeCategory);
    }
    if (searchQuery) {
      docs = docs.filter(doc =>
        fuzzySearch(searchQuery, doc.title) ||
        fuzzySearch(searchQuery, doc.description) ||
        fuzzySearch(searchQuery, doc.content)
      );
    }
    return docs;
  }, [searchQuery, activeCategory]);

  const selectedDoc = useMemo(() =>
    HELP_DOCS.find(d => d.id === selectedDocId),
    [selectedDocId]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <header className="px-5 py-3.5 flex items-center justify-between border-b border-zinc-100 shrink-0 bg-white">
          {selectedDoc ? (
            <button
              onClick={() => setSelectedDocId(null)}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft size={15} />
              Indietro
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <HelpCircle size={18} className="text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-900">Assistenza</h2>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-600"
          >
            <X size={16} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {selectedDoc ? (
            /* ── DETAIL VIEW ── */
            <div className="animate-in fade-in duration-150">
              {/* Doc header */}
              <div className="px-6 pt-6 pb-5 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <selectedDoc.icon size={14} className="text-zinc-400" />
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                    {HELP_CATEGORIES[selectedDoc.category]}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 leading-snug">
                  {selectedDoc.title}
                </h3>
              </div>

              {/* Doc content */}
              <div className="px-6 py-6">
                <div
                  className="text-[13px] text-zinc-600 leading-[1.8] [&_strong]:text-zinc-900 [&_strong]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:mb-1 [&_li]:pl-1"
                  dangerouslySetInnerHTML={{ __html: formatRichText(selectedDoc.content) }}
                />
              </div>
            </div>

          ) : (
            /* ── LIST VIEW ── */
            <div className="animate-in fade-in duration-150">

              {/* Restart tour banner */}
              <div className="px-5 pt-5 pb-0">
                <button
                  onClick={() => { restartTour(); onClose(); }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-all group text-left"
                >
                  <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <Play size={15} className="ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-blue-900">Rivedi il tour guidato</span>
                    <p className="text-[11px] text-blue-600/70 mt-0.5">11 passaggi — circa 2 minuti</p>
                  </div>
                  <ChevronRight size={14} className="text-blue-400 shrink-0" />
                </button>
              </div>

              {/* Search + filters */}
              <div className="px-5 pt-4 pb-2 space-y-3 sticky top-0 bg-white z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={15} />
                  <input
                    type="text"
                    placeholder="Cerca..."
                    className="w-full bg-zinc-50 border border-zinc-200 py-2 pl-9 pr-3 rounded-lg text-sm focus:border-zinc-400 focus:bg-white outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {[{ key: null, label: 'Tutte' }, ...Object.entries(HELP_CATEGORIES).map(([key, label]) => ({ key, label }))].map(({ key, label }) => (
                    <button
                      key={key || 'all'}
                      onClick={() => setActiveCategory(key)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap",
                        (activeCategory === key || (!activeCategory && !key))
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-500 hover:bg-zinc-100"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Docs list */}
              <div className="px-3 py-2">
                {filteredDocs.length > 0 ? (
                  <div className="space-y-0.5">
                    {filteredDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-zinc-50"
                      >
                        <div className="w-8 h-8 bg-zinc-100 group-hover:bg-zinc-800 group-hover:text-white text-zinc-400 rounded-md flex items-center justify-center transition-colors shrink-0">
                          <doc.icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-medium text-zinc-800 truncate">{doc.title}</h4>
                          <p className="text-[11px] text-zinc-400 truncate">{doc.description}</p>
                        </div>
                        <ChevronRight size={12} className="text-zinc-200 group-hover:text-zinc-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <BookOpen size={24} className="mx-auto text-zinc-200 mb-2" />
                    <p className="text-sm text-zinc-400">Nessun risultato</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
