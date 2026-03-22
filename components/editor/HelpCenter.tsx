'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  ChevronRight,
  ArrowLeft,
  HelpCircle,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { cn, fuzzySearch, formatRichText } from '@/lib/utils';
import { HELP_DOCS } from '@/lib/help-docs';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    if (!searchQuery) return HELP_DOCS;
    return HELP_DOCS.filter(doc =>
      fuzzySearch(searchQuery, doc.title) ||
      fuzzySearch(searchQuery, doc.description) ||
      fuzzySearch(searchQuery, doc.content)
    );
  }, [searchQuery]);

  const selectedDoc = useMemo(() =>
    HELP_DOCS.find(d => d.id === selectedDocId),
    [selectedDocId]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">

        {/* Header */}
        <header className="p-10 pb-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-2xl">
              <HelpCircle size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 tracking-tight leading-none mb-1.5">Centro Assistenza</h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.25em] opacity-60">Guida rapida alla creazione</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-zinc-100 rounded-2xl transition-all text-zinc-300 hover:text-zinc-600"
          >
            <X size={24} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 pt-0 custom-scrollbar">

          {selectedDoc ? (
            /* DETAIL VIEW */
            <div className="flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
              <button
                onClick={() => setSelectedDocId(null)}
                className="self-start flex items-center gap-2 px-5 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all mb-8 shadow-sm cursor-pointer"
              >
                <ArrowLeft size={14} /> Torna all'elenco
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-zinc-900 text-white rounded-xl shadow-lg">
                  <selectedDoc.icon size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Guida {selectedDoc.category}
                </span>
              </div>

              <h3 className="text-3xl font-bold text-zinc-900 tracking-tight leading-tight mb-8">
                {selectedDoc.title}
              </h3>

              <div
                className="prose prose-zinc prose-lg max-w-none text-zinc-600 font-medium leading-[1.8] space-y-4"
                dangerouslySetInnerHTML={{ __html: formatRichText(selectedDoc.content) }}
              />

            </div>
          ) : (
            /* LIST VIEW */
            <div className="flex flex-col animate-in slide-in-from-left-4 fade-in duration-300">
              {/* Search Bar */}
              <div className="relative mb-10 sticky top-0 z-10 bg-white pb-6">
                <Search className="absolute left-6 top-[37%] -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="text"
                  placeholder="Cerca un argomento (es. cookie, design, mobile...)"
                  className="w-full bg-zinc-50 border border-zinc-100/50 p-6 pl-16 rounded-[2rem] text-sm font-semibold focus:ring-0 focus:border-zinc-900 outline-none transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Docs List */}
              <div className="space-y-4 pb-10">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className="w-full group bg-white border border-zinc-100/50 hover:bg-zinc-50 p-8 rounded-[2.5rem] text-left transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex items-center gap-8 cursor-pointer active:scale-[0.99]"
                    >
                      <div className="w-16 h-16 bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white rounded-[1.25rem] flex items-center justify-center transition-all duration-300 shrink-0 shadow-sm group-hover:shadow-xl">
                        <doc.icon size={28} className="transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-zinc-900 tracking-tight mb-2 group-hover:text-zinc-900 transition-colors">{doc.title}</h4>
                        <p className="text-xs text-zinc-500 font-medium line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                          {doc.description}
                        </p>
                      </div>
                      <div className="w-10 h-10 border border-zinc-100 rounded-full flex items-center justify-center text-zinc-200 group-hover:text-zinc-900 group-hover:border-zinc-900 group-hover:bg-white transition-all transition-transform group-hover:translate-x-1 shadow-sm">
                        <ChevronRight size={18} />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-24 text-center text-zinc-300 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center">
                      <BookOpen size={48} className="opacity-20" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-1">Nessun risultato</p>
                      <p className="text-xs font-medium text-zinc-400">Prova con termini più generici</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-10 py-6 border-t border-zinc-100 flex items-center justify-between text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em] shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Supporto</span>
          </div>
          <span className="text-zinc-400">v1.0 &bull; 2026</span>
        </footer>
      </div>
    </div>
  );
};
