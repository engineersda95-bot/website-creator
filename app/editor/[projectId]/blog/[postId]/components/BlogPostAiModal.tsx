'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { X, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { marked } from 'marked';
import type { AITextAction, AITextTone } from '@/app/actions/ai-generator';

interface BlogPostAiModalProps {
  aiAction: AITextAction;
  setAiAction: (a: AITextAction) => void;
  aiTone: AITextTone;
  setAiTone: (t: AITextTone) => void;
  aiCustom: string;
  setAiCustom: (s: string) => void;
  aiLoading: boolean;
  aiResult: string;
  setAiResult: (s: string) => void;
  onGenerate: () => void;
  onApply: () => void;
  onClose: () => void;
  inputClass: string;
  labelClass: string;
}

export function BlogPostAiModal({
  aiAction,
  setAiAction,
  aiTone,
  setAiTone,
  aiCustom,
  setAiCustom,
  aiLoading,
  aiResult,
  setAiResult,
  onGenerate,
  onApply,
  onClose,
  inputClass,
  labelClass,
}: BlogPostAiModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { if (!aiLoading) { onClose(); } }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-600" />
            <h2 className="text-[15px] font-bold text-zinc-900">Migliora con AI</h2>
          </div>
          <button onClick={() => { if (!aiLoading) { onClose(); } }} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all">
            <X size={16} />
          </button>
        </div>

        {!aiResult ? (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Action */}
            <div>
              <label className={labelClass}>Cosa vuoi fare?</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'improve' as const, label: 'Migliora scrittura', desc: 'Più fluido e coinvolgente' },
                  { id: 'expand' as const, label: 'Espandi', desc: 'Aggiungi dettagli e paragrafi' },
                  { id: 'summarize' as const, label: 'Riassumi', desc: 'Accorcia mantenendo il senso' },
                  { id: 'rewrite' as const, label: 'Riscrivi', desc: 'Riscrittura completa' },
                ] as const).map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAiAction(a.id)}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                      aiAction === a.id
                        ? "border-violet-500 bg-violet-50"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <span className="text-[12px] font-bold text-zinc-800">{a.label}</span>
                    <span className="text-[10px] text-zinc-400">{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className={labelClass}>Tono</label>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { id: 'professional' as const, label: 'Professionale' },
                  { id: 'casual' as const, label: 'Informale' },
                  { id: 'formal' as const, label: 'Formale' },
                  { id: 'persuasive' as const, label: 'Persuasivo' },
                  { id: 'technical' as const, label: 'Tecnico' },
                ] as const).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setAiTone(t.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all",
                      aiTone === t.id
                        ? "border-violet-500 bg-violet-600 text-white"
                        : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom instruction */}
            <div>
              <label className={labelClass}>Istruzione aggiuntiva (opzionale)</label>
              <textarea
                value={aiCustom}
                onChange={(e) => setAiCustom(e.target.value)}
                className={cn(inputClass, "h-20 resize-none")}
                placeholder='Es. "Aggiungi un paragrafo sulla SEO", "Rendi più adatto per un pubblico giovane"...'
              />
            </div>

            {/* Generate button */}
            <button
              onClick={onGenerate}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-white font-semibold text-[13px] hover:bg-violet-700 transition-all disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {aiLoading ? 'Generazione in corso...' : 'Genera'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-700">Anteprima risultato</span>
              <span className="text-[10px] text-amber-500">— Applicando sovrascriverai il testo attuale</span>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div
                className="prose prose-sm max-w-none prose-headings:tracking-tight prose-headings:text-zinc-900 prose-p:text-zinc-600 prose-a:text-blue-600 prose-strong:text-zinc-800"
                dangerouslySetInnerHTML={{ __html: marked.parse(aiResult, { breaks: true }) as string }}
              />
            </div>

            <div className="flex items-center gap-2 px-6 py-4 border-t border-zinc-100 bg-zinc-50">
              <button
                onClick={() => setAiResult('')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 text-[12px] font-semibold text-zinc-600 hover:bg-zinc-100 transition-all"
              >
                <RotateCcw size={13} />
                Rigenera
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-zinc-500 hover:bg-zinc-100 transition-all"
              >
                Annulla
              </button>
              <div className="flex-1" />
              <button
                onClick={onApply}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[12px] font-semibold hover:bg-violet-700 transition-all"
              >
                Applica al testo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
