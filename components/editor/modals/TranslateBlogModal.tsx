'use client';

import React, { useState } from 'react';
import { Globe, X, Loader2, Check, Copy, Sparkles } from 'lucide-react';
import { BlogPost, Project } from '@/types/editor';
import { cn } from '@/lib/utils';

interface TranslateBlogModalProps {
  post: BlogPost;
  project: Project;
  existingLanguages: string[]; // Languages already used by posts in same translation_group
  onClose: () => void;
  onTranslate: (options: {
    lang: string;
    mode: 'blank' | 'copy' | 'ai';
    title: string;
    slug: string;
  }) => Promise<void>;
}

const LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '\u{1F1EE}\u{1F1F9}' },
  { code: 'en', name: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'fr', name: 'Fran\u00e7ais', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'de', name: 'Deutsch', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'es', name: 'Espa\u00f1ol', flag: '\u{1F1EA}\u{1F1F8}' },
];

export function TranslateBlogModal({ post, project, existingLanguages, onClose, onTranslate }: TranslateBlogModalProps) {
  const supportedLanguages = project.settings?.languages || ['it'];
  const [selectedLang, setSelectedLang] = useState('');
  const [mode, setMode] = useState<'blank' | 'copy' | 'ai'>('copy');
  const [newTitle, setNewTitle] = useState(post.title);
  const [newSlug, setNewSlug] = useState(post.slug);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available: project languages minus languages that already have a version
  const availableToTranslate = LANGUAGES.filter(
    l => supportedLanguages.includes(l.code) && !existingLanguages.includes(l.code)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLang || !newTitle.trim() || !newSlug.trim()) return;
    setIsSubmitting(true);
    try {
      await onTranslate({ lang: selectedLang, mode, title: newTitle.trim(), slug: newSlug.trim() });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300 font-medium";
  const labelClass = "block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Traduci Articolo</h3>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Language selection */}
          <div>
            <label className={labelClass}>Lingua di destinazione</label>
            <div className="grid grid-cols-2 gap-2">
              {availableToTranslate.length > 0 ? (
                availableToTranslate.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLang(lang.code)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      selectedLang === lang.code
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200"
                        : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-bold">{lang.name}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-xs text-zinc-400 border-2 border-dashed border-zinc-100 rounded-xl">
                  Tutte le lingue disponibili hanno già una versione.
                </div>
              )}
            </div>
          </div>

          {/* Mode selection */}
          <div>
            <label className={labelClass}>Come vuoi creare la traduzione?</label>
            <div className="space-y-2">
              {([
                { id: 'copy' as const, icon: Copy, label: 'Copia contenuto', desc: 'Copia il testo originale da tradurre manualmente' },
                { id: 'ai' as const, icon: Sparkles, label: 'Traduci con AI', desc: 'Traduzione automatica del contenuto con Gemini' },
                { id: 'blank' as const, icon: X, label: 'Articolo vuoto', desc: 'Crea un articolo vuoto nella nuova lingua' },
              ]).map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    mode === m.id
                      ? "bg-zinc-900 border-zinc-900 text-white"
                      : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300"
                  )}
                >
                  <m.icon size={16} className={mode === m.id ? "text-white" : "text-zinc-400"} />
                  <div>
                    <div className="text-[12px] font-bold">{m.label}</div>
                    <div className={cn("text-[10px]", mode === m.id ? "text-white/60" : "text-zinc-400")}>{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title & slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Titolo</label>
              <input className={inputClass} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Slug URL</label>
              <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden focus-within:border-zinc-400 transition-all">
                <span className="pl-3 pr-1 text-xs text-zinc-400 bg-zinc-50 py-2.5 border-r border-zinc-200 font-mono">/blog/</span>
                <input
                  className="flex-1 px-2 py-2.5 text-xs outline-none font-mono"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedLang || availableToTranslate.length === 0}
            className="flex-[2] px-4 py-3 bg-zinc-900 text-white text-[11px] font-bold rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
            {isSubmitting ? 'Creazione...' : 'Crea Traduzione'}
          </button>
        </div>
      </form>
    </div>
  );
}
