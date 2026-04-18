'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, BookOpen, Eye, EyeOff, Calendar, Loader2, Trash2, Languages, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlogPost, Project } from '@/types/editor';
import { toast } from '@/components/shared/Toast';
import { LanguageBadge } from '@/components/shared/LanguageBadge';
import { resolveImageUrl } from '@/lib/image-utils';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { getCompletionScore, runBlogPostChecks } from '@/lib/site-checklist';
import { confirm } from '@/components/shared/ConfirmDialog';
import type { UserLimits } from '@/lib/permissions';

interface BlogTabProps {
  project: Project;
  pages: { slug: string }[];
  blogPosts: BlogPost[];
  blogLangFilter: string;
  deletingBlogPostId: string | null;
  userLimits: UserLimits | null;
  onSetBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  onSetBlogLangFilter: (v: string) => void;
  onSetDeletingBlogPostId: (v: string | null) => void;
  onSetPages: React.Dispatch<React.SetStateAction<any[]>>;
  onOpenSeo: (postId: string) => void;
  onTranslate: (post: BlogPost) => void;
  onChecklistClick: (post: BlogPost) => void;
}

export function BlogTab({
  project,
  pages,
  blogPosts,
  blogLangFilter,
  deletingBlogPostId,
  userLimits,
  onSetBlogPosts,
  onSetBlogLangFilter,
  onSetDeletingBlogPostId,
  onSetPages,
  onOpenSeo,
  onTranslate,
  onChecklistClick,
}: BlogTabProps) {
  const router = useRouter();

  const defaultLang = project.settings?.defaultLanguage || 'it';
  const siteLanguages = project.settings?.languages || [defaultLang];
  const isMultilingual = siteLanguages.length > 1;
  const filteredPosts = blogLangFilter === 'all' ? blogPosts : blogPosts.filter(p => (p.language || defaultLang) === blogLangFilter);
  const atArticleLimit = userLimits?.max_articles_per_project !== null && blogPosts.length >= (userLimits?.max_articles_per_project ?? Infinity);

  const handleCreatePost = async () => {
    if (atArticleLimit) {
      toast(`Hai raggiunto il limite di ${userLimits?.max_articles_per_project} articoli per sito del tuo piano`, 'error');
      return;
    }
    const hasBlogPage = pages.some(p => p.slug === 'blog');
    if (!hasBlogPage) {
      const blogPageId = crypto.randomUUID();
      const blogListBlock = {
        id: crypto.randomUUID(),
        type: 'blog-list',
        content: { title: 'Il nostro Blog', maxPosts: 100, isBlogPage: true },
        style: {},
      };
      await supabase.from('pages').insert({
        id: blogPageId,
        project_id: project.id,
        slug: 'blog',
        title: 'Blog',
        blocks: [blogListBlock],
        seo: { title: `Blog — ${project.name}`, description: 'Tutti gli articoli del nostro blog.' },
      });
      onSetPages(prev => [...prev, { id: blogPageId, slug: 'blog', title: 'Blog', blocks: [blogListBlock] }]);
    }
    const postLang = blogLangFilter !== 'all' ? blogLangFilter : defaultLang;
    const postId = crypto.randomUUID();
    const { data } = await supabase.from('blog_posts').insert({
      id: postId,
      project_id: project.id,
      slug: `articolo-${Date.now()}`,
      title: 'Nuovo Articolo',
      status: 'draft',
      language: postLang,
      blocks: [],
    }).select('id, slug, title, excerpt, cover_image, language, status, published_at, authors, categories, translation_group, created_at, updated_at').single();
    if (data) {
      onSetBlogPosts(prev => [data as BlogPost, ...prev]);
      router.push(`/editor/${project.id}/blog/${postId}`);
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    if (!await (confirm as any)({ title: 'Elimina articolo', message: `Vuoi eliminare "${post.title}"?`, confirmLabel: 'Elimina', variant: 'danger' })) return;
    onSetDeletingBlogPostId(post.id);
    await supabase.from('blog_posts').delete().eq('id', post.id);
    onSetBlogPosts(prev => prev.filter(p => p.id !== post.id));
    onSetDeletingBlogPostId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Blog</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {blogPosts.length === 0
              ? 'Crea il tuo primo articolo'
              : `${blogPosts.length}${userLimits?.max_articles_per_project ? ` / ${userLimits.max_articles_per_project}` : ''} ${blogPosts.length === 1 ? 'articolo' : 'articoli'}`}
          </p>
        </div>
        <button
          disabled={atArticleLimit}
          onClick={handleCreatePost}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-lg transition-all",
            atArticleLimit
              ? "bg-zinc-50 border-zinc-200 text-zinc-300 cursor-not-allowed"
              : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
          )}
        >
          <Plus size={16} />
          Nuovo Articolo
        </button>
      </div>

      {isMultilingual && blogPosts.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button onClick={() => onSetBlogLangFilter('all')} className={cn("px-3 py-1 rounded-full text-xs font-bold border transition-all", blogLangFilter === 'all' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400")}>Tutti</button>
          {siteLanguages.map((lang: string) => (
            <button key={lang} onClick={() => onSetBlogLangFilter(lang)} className={cn("px-3 py-1 rounded-full text-xs font-bold border transition-all uppercase", blogLangFilter === lang ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400")}>{lang}</button>
          ))}
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">{blogPosts.length === 0 ? 'Nessun articolo ancora' : 'Nessun articolo in questa lingua'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className={cn(
                "group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all flex flex-col",
                deletingBlogPostId === post.id && "opacity-50 pointer-events-none"
              )}
            >
              <Link href={`/editor/${project.id}/blog/${post.id}`} className="flex-1">
                {post.cover_image && (
                  <div className="aspect-video bg-zinc-100 overflow-hidden">
                    <img
                      src={resolveImageUrl(post.cover_image, project, {}, false)}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {post.status === 'published'
                      ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><Eye size={10} />Pubblicato</span>
                      : <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><EyeOff size={10} />Bozza</span>
                    }
                    {isMultilingual && post.language && (
                      <LanguageBadge languageCode={post.language} showCode={true} className="shadow-none border-none bg-zinc-100 rounded-full px-2" />
                    )}
                  </div>
                  <h3 className="font-bold text-zinc-900 text-sm line-clamp-2 mb-1">{post.title}</h3>
                  {post.excerpt && <p className="text-xs text-zinc-500 line-clamp-2">{post.excerpt}</p>}
                  {post.published_at && (
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-zinc-400">
                      <Calendar size={10} />
                      {new Date(post.published_at).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </div>
              </Link>

              <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-mono">/blog/{post.slug}</span>
                  <ScoreBadge score={getCompletionScore(runBlogPostChecks(project, post))} onClick={() => onChecklistClick(post)} />
                </div>
                <div className="flex items-center gap-1">
                  {isMultilingual && (
                    <button
                      onClick={(e) => { e.preventDefault(); onTranslate(post); }}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-blue-500 hover:bg-white transition-all shadow-sm"
                      title="Traduci articolo"
                    >
                      <Languages size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); onOpenSeo(post.id); }}
                    className="p-1.5 rounded-md text-zinc-300 hover:text-zinc-500 hover:bg-white transition-all shadow-sm"
                    title="Impostazioni SEO"
                  >
                    <div className="flex items-center gap-1 px-1">
                      <Search size={14} />
                      <span className="text-[10px] font-bold uppercase">SEO</span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDeletePost(post); }}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                    title="Elimina articolo"
                  >
                    {deletingBlogPostId === post.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
