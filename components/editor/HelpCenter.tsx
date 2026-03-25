'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  ChevronRight,
  ArrowLeft,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { cn, fuzzySearch, formatRichText } from '@/lib/utils';
import { HELP_DOCS, HELP_CATEGORIES } from '@/lib/help-docs';

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

  const handleBack = () => {
    setSelectedDocId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-3 duration-300">

        {/* Header */}
        <header className="px-6 py-5 flex items-center justify-between border-b border-zinc-100 shrink-0">
          {selectedDoc ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Tutte le guide
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-900 text-white rounded-xl flex items-center justify-center">
                <HelpCircle size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 leading-none">Centro Assistenza</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{HELP_DOCS.length} guide disponibili</p>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-600"
          >
            <X size={18} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {selectedDoc ? (
            /* DETAIL VIEW */
            <div className="p-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-zinc-100 rounded-lg">
                  <selectedDoc.icon size={16} className="text-zinc-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {HELP_CATEGORIES[selectedDoc.category]}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
                {selectedDoc.title}
              </h3>
              <p className="text-sm text-zinc-500 mb-6">{selectedDoc.description}</p>

              <div
                className="prose prose-zinc prose-sm max-w-none text-zinc-600 leading-relaxed [&_strong]:text-zinc-900 [&_li]:marker:text-zinc-400"
                dangerouslySetInnerHTML={{ __html: formatRichText(selectedDoc.content) }}
              />
            </div>
          ) : (
            /* LIST VIEW */
            <div className="p-6">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  type="text"
                  placeholder="Cerca una guida..."
                  className="w-full bg-zinc-50 border border-zinc-200 py-2.5 pl-10 pr-4 rounded-lg text-sm focus:border-zinc-400 focus:bg-white outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Category filters */}
              <div className="flex items-center gap-1.5 mb-5 overflow-x-auto">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                    !activeCategory
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  )}
                >
                  Tutte
                </button>
                {Object.entries(HELP_CATEGORIES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                      activeCategory === key
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Docs grid */}
              {filteredDocs.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className="w-full group flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-zinc-50 active:scale-[0.99]"
                    >
                      <div className="w-10 h-10 bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white rounded-lg flex items-center justify-center transition-colors shrink-0">
                        <doc.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-900 truncate">{doc.title}</h4>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{doc.description}</p>
                      </div>
                      <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-500 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <BookOpen size={32} className="mx-auto text-zinc-200 mb-3" />
                  <p className="text-sm font-medium text-zinc-500">Nessun risultato</p>
                  <p className="text-xs text-zinc-400 mt-1">Prova con termini diversi</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
