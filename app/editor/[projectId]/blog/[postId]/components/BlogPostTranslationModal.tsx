'use client';

import React from 'react';
import { X, Sparkles, Loader2, PanelLeft } from 'lucide-react';
import { LANGUAGES } from '@/lib/editor-constants';

interface BlogPostTranslationModalProps {
  targetLang: string;
  isCreating: boolean;
  onCreateTranslation: (targetLang: string, mode: 'blank' | 'ai') => void;
  onClose: () => void;
}

export function BlogPostTranslationModal({
  targetLang,
  isCreating,
  onCreateTranslation,
  onClose,
}: BlogPostTranslationModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !isCreating && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-zinc-900">
            Crea versione {LANGUAGES.find(l => l.value === targetLang)?.flag || targetLang?.toUpperCase()}
          </h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <button
            onClick={() => onCreateTranslation(targetLang, 'ai')}
            disabled={isCreating}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-all text-left disabled:opacity-50"
          >
            {isCreating ? <Loader2 size={18} className="text-violet-500 animate-spin" /> : <Sparkles size={18} className="text-violet-500" />}
            <div>
              <div className="text-[13px] font-bold text-violet-800">Traduci con AI</div>
              <div className="text-[10px] text-violet-500">Traduzione automatica di titolo, estratto e corpo</div>
            </div>
          </button>
          <button
            onClick={() => onCreateTranslation(targetLang, 'blank')}
            disabled={isCreating}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all text-left disabled:opacity-50"
          >
            <PanelLeft size={18} className="text-zinc-400" />
            <div>
              <div className="text-[13px] font-bold text-zinc-700">Articolo vuoto</div>
              <div className="text-[10px] text-zinc-400">Crea un articolo vuoto e traducilo manualmente</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
