'use client';

import React, { useState } from 'react';
import { X, Globe, Loader2 } from 'lucide-react';
import { Page } from '@/types/editor';
import { LANGUAGES } from '@/lib/editor-constants';
import { translatePage } from '@/app/actions/pages';
import { toast } from '@/components/shared/Toast';
import { cn } from '@/lib/utils';

interface TranslatePageModalProps {
  page: Page;
  projectId: string;
  availableLanguages: string[];
  onClose: () => void;
  onSuccess: (newPage: Page, sourceGroupId: string) => void;
}

export function TranslatePageModal({ page, projectId, availableLanguages, onClose, onSuccess }: TranslatePageModalProps) {
  const otherLanguages = availableLanguages.filter(l => l !== page.language);
  const [targetLang, setTargetLang] = useState(otherLanguages[0] || '');
  const [title, setTitle] = useState(page.title || '');
  const [slug, setSlug] = useState(page.slug || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (otherLanguages.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-zinc-200">
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Nessuna lingua disponibile</h3>
          <p className="text-sm text-zinc-500 mb-4">Abilita altre lingue nelle impostazioni del progetto per poter creare traduzioni.</p>
          <button onClick={onClose} className="w-full px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg">Chiudi</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLang || !title.trim() || !slug.trim()) return;
    setIsSubmitting(true);
    const result = await translatePage({
      sourcePageId: page.id,
      projectId,
      targetLanguage: targetLang,
      title: title.trim(),
      slug: slug.trim(),
    }) as any;
    setIsSubmitting(false);
    if (!result.success) {
      toast(result.error || 'Errore durante la traduzione', 'error');
      return;
    }
    toast('Pagina tradotta creata con successo', 'success');
    onSuccess(result.page, result.sourceGroupId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-zinc-200"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-all">
          <X size={16} />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Globe size={18} className="text-blue-500" />
          <h3 className="text-lg font-bold text-zinc-900">Traduci pagina</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-5">
          Verrà creata una copia di <strong>{page.title}</strong> nella lingua selezionata, collegata all&apos;originale per il multilingua.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Lingua target</label>
            <div className="flex gap-2 flex-wrap">
              {otherLanguages.map((langCode) => {
                const langDef = LANGUAGES.find(l => l.value === langCode);
                return (
                  <button
                    key={langCode}
                    type="button"
                    onClick={() => setTargetLang(langCode)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold transition-all",
                      targetLang === langCode
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                        : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                    )}
                  >
                    <span>{langDef?.flag || '🌐'}</span>
                    <span className="uppercase">{langCode}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Titolo</label>
            <input
              autoFocus
              className="w-full px-4 py-2 text-sm border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none transition-all"
              placeholder="Es. About Us"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Slug URL</label>
            <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden focus-within:border-zinc-400 transition-all">
              <span className="px-2.5 text-sm text-zinc-400 bg-zinc-50 py-2 border-r border-zinc-200 font-mono">/</span>
              <input
                className="flex-1 px-3 py-2 text-sm outline-none font-mono"
                placeholder="about-us"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={!targetLang || !title.trim() || !slug.trim() || isSubmitting}
            className="flex-1 px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Crea traduzione
          </button>
        </div>
      </form>
    </div>
  );
}
