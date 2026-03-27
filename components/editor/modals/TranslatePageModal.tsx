'use client';

import React, { useState } from 'react';
import { Globe, X, Loader2, Check } from 'lucide-react';
import { Page, Project } from '@/types/editor';
import { cn } from '@/lib/utils';

interface TranslatePageModalProps {
  page: Page;
  project: Project;
  onClose: () => void;
  onTranslate: (options: { 
    lang: string; 
    title: string; 
    slug: string;
    seoTitle?: string;
    seoDescription?: string;
  }) => Promise<void>;
}

const LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function TranslatePageModal({ page, project, onClose, onTranslate }: TranslatePageModalProps) {
  const supportedLanguages = project.settings?.languages || ['it'];
  const [selectedLang, setSelectedLang] = useState('');
  const [newTitle, setNewTitle] = useState(page.title);
  const [newSlug, setNewSlug] = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState(page.seo?.title || '');
  const [seoDescription, setSeoDescription] = useState(page.seo?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out the current page language and languages that only exist once (if needed)
  const availableToTranslate = LANGUAGES.filter(l => supportedLanguages.includes(l.code) && l.code !== page.language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLang || !newTitle.trim() || !newSlug.trim()) return;

    setIsSubmitting(true);
    try {
      await onTranslate({
        lang: selectedLang,
        title: newTitle.trim(),
        slug: newSlug.trim(),
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Traduci Pagina</h3>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              La nuova pagina sarà una <strong>copia indipendente</strong>. Potrai modificare i testi e i blocchi senza influenzare la versione originale.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Lingua di destinazione</label>
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
                    Abilita altre lingue nelle impostazioni del sito.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Titolo Pagina</label>
                <input
                  className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300 font-medium"
                  placeholder="Es. About Us"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Slug URL</label>
                <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden focus-within:border-zinc-400 transition-all">
                  <span className="pl-3 pr-1 text-xs text-zinc-400 bg-zinc-50 py-2.5 border-r border-zinc-200 font-mono">/</span>
                  <input
                    className="flex-1 px-2 py-2.5 text-xs outline-none font-mono"
                    placeholder="about"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-teal-500" />
                <label className="block text-[10px] font-black text-zinc-900 uppercase tracking-widest">Metadati SEO Tradotti</label>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block pl-1 mb-2">Meta Title</label>
                  <input
                    className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                    placeholder="Titolo per Google..."
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                  <div className={cn(
                    "absolute top-0 right-1 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase",
                    seoTitle.length < 40 || seoTitle.length > 70 ? "bg-red-50 text-red-500" :
                    seoTitle.length < 50 || seoTitle.length > 60 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                  )}>
                    {seoTitle.length}/60
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block pl-1 mb-2">Meta Description</label>
                  <textarea
                    className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none shadow-inner resize-none min-h-[100px]"
                    placeholder="Descrizione per motori di ricerca..."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                  />
                  <div className={cn(
                    "absolute top-0 right-1 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase",
                    seoDescription.length < 100 || seoDescription.length > 200 ? "bg-red-50 text-red-500" :
                    seoDescription.length < 110 || seoDescription.length > 160 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                  )}>
                    {seoDescription.length}/160
                  </div>
                </div>
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
            className="flex-[2] px-4 py-3 bg-zinc-900 text-white text-[11px] font-bold rounded-xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
            {isSubmitting ? 'Traduzione...' : 'Crea Traduzione'}
          </button>
        </div>
      </form>
    </div>
  );
}
