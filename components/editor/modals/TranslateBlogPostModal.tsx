'use client';

import React, { useState } from 'react';
import { X, Globe, Loader2 } from 'lucide-react';
import { BlogPost } from '@/types/editor';
import { LANGUAGES } from '@/lib/editor-constants';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/shared/Toast';
import { cn } from '@/lib/utils';

interface TranslateBlogPostModalProps {
  post: BlogPost;
  allPosts: BlogPost[];           // tutti gli articoli del progetto (per controllo duplicati)
  projectId: string;
  availableLanguages: string[];
  onClose: () => void;
  onSuccess: (newPost: BlogPost) => void;
}

export function TranslateBlogPostModal({
  post,
  allPosts,
  projectId,
  availableLanguages,
  onClose,
  onSuccess,
}: TranslateBlogPostModalProps) {
  // Collect languages already covered by this article's translation group
  const siblingLangs = allPosts
    .filter(p =>
      p.id !== post.id &&
      p.translation_group != null &&
      p.translation_group === (post.translation_group ?? post.id)
    )
    .map(p => (p.language || 'it').split('-')[0]);

  const currentLang = (post.language || 'it').split('-')[0];
  const occupiedLangs = new Set([currentLang, ...siblingLangs]);
  const otherLanguages = availableLanguages.filter(l => !occupiedLangs.has(l.split('-')[0]));

  const [targetLang, setTargetLang] = useState(otherLanguages[0] || '');
  const [title, setTitle] = useState(post.title || '');
  const [slug, setSlug] = useState(`${post.slug}-${otherLanguages[0] || ''}` );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (otherLanguages.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-zinc-200">
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Tutte le lingue già tradotte</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Questo articolo ha già una versione in tutte le lingue abilitate per il sito.
            Per aggiungere nuove lingue vai nelle impostazioni del progetto.
          </p>
          <button onClick={onClose} className="w-full px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg">
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  const handleLangChange = (lang: string) => {
    setTargetLang(lang);
    setSlug(`${post.slug}-${lang}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLang || !title.trim() || !slug.trim()) return;
    setIsSubmitting(true);

    try {
      const group = post.translation_group || post.id;
      const newId = crypto.randomUUID();
      const normalizedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-|-$/g, '');

      const payload: any = {
        id: newId,
        project_id: projectId,
        slug: normalizedSlug,
        title: title.trim(),
        excerpt: '',
        cover_image: post.cover_image || null,
        categories: post.categories || [],
        authors: post.authors || [],
        status: 'draft',
        blocks: [],
        seo: {},
        language: targetLang,
        translation_group: group,
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(payload)
        .select('id, slug, title, excerpt, cover_image, language, status, published_at, authors, categories, translation_group, created_at, updated_at')
        .single();

      if (error) {
        // If translation_group column doesn't exist yet, retry without it
        if (error.code === '42703') {
          delete payload.translation_group;
          const { data: data2, error: err2 } = await supabase
            .from('blog_posts')
            .insert(payload)
            .select('id, slug, title, excerpt, cover_image, language, status, published_at, authors, categories, translation_group, created_at, updated_at')
            .single();
          if (err2 || !data2) { toast(err2?.message || 'Errore nella creazione', 'error'); return; }
          toast('Articolo tradotto creato', 'success');
          onSuccess(data2 as BlogPost);
          return;
        }
        toast(error.message || 'Errore nella creazione', 'error');
        return;
      }

      // Update source post's translation_group if it didn't have one
      if (!post.translation_group) {
        await supabase.from('blog_posts').update({ translation_group: group }).eq('id', post.id);
      }

      toast('Articolo tradotto creato', 'success');
      onSuccess(data as BlogPost);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-all"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Globe size={18} className="text-blue-500" />
          <h3 className="text-lg font-bold text-zinc-900">Traduci articolo</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-5">
          Verrà creata una bozza vuota di <strong>{post.title}</strong> nella lingua selezionata,
          collegata all&apos;originale per il multilingua.
        </p>

        <div className="space-y-4">
          {/* Target language selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
              Lingua target
            </label>
            <div className="flex gap-2 flex-wrap">
              {otherLanguages.map((langCode) => {
                const langDef = LANGUAGES.find(l => l.value === langCode.split('-')[0]);
                return (
                  <button
                    key={langCode}
                    type="button"
                    onClick={() => handleLangChange(langCode)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold transition-all',
                      targetLang === langCode
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                        : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300',
                    )}
                  >
                    <span>{langDef?.flag || '🌐'}</span>
                    <span className="uppercase">{langCode}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
              Titolo
            </label>
            <input
              autoFocus
              className="w-full px-4 py-2 text-sm border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none transition-all"
              placeholder="Es. Our Story"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">
              Slug URL
            </label>
            <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden focus-within:border-zinc-400 transition-all">
              <span className="px-2.5 text-sm text-zinc-400 bg-zinc-50 py-2 border-r border-zinc-200 font-mono">
                /blog/
              </span>
              <input
                className="flex-1 px-3 py-2 text-sm outline-none font-mono"
                placeholder="our-story"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
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
