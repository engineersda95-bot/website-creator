'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SeoFields } from '@/components/shared/SeoFields';
import { BlogPost } from '@/types/editor';

interface BlogPostSeoModalProps {
  post: BlogPost;
  project: any;
  onClose: () => void;
  updateBlogPostSEO: (postId: string, seo: any) => Promise<void>;
  uploadImage: (val: string, filename?: string) => Promise<string>;
  isUploading: boolean;
}

export const BlogPostSeoModal = ({ post, project, onClose, updateBlogPostSEO, uploadImage, isUploading }: BlogPostSeoModalProps) => {
  const [localSeo, setLocalSeo] = React.useState({
    title: post.seo?.title || post.title || '',
    description: post.seo?.description || post.excerpt || '',
    image: post.seo?.image || '',
    indexable: post.seo?.indexable !== false
  });

  const [isSavingSeo, setIsSavingSeo] = React.useState(false);

  const handleSaveSeo = async () => {
    setIsSavingSeo(true);
    await updateBlogPostSEO(post.id, localSeo);
    setIsSavingSeo(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-zinc-200/50 flex flex-col max-h-full">
        <div className="px-8 py-6 flex items-center justify-between border-b border-zinc-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Impostazioni SEO</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-bold uppercase">{post.title || 'Articolo'}</span>
              <span className="text-zinc-300">/</span>
              <span className="font-mono">/blog/{post.slug}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-600 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          <SeoFields
            seo={localSeo}
            onChange={(updates) => setLocalSeo(prev => ({ ...prev, ...updates }))}
            project={project}
            uploadImage={uploadImage}
            isUploading={isUploading}
            compact={false}
            allowIndexToggle={true}
            defaultImage={post.cover_image || ''}
            titlePlaceholder={post.title || 'Titolo per Google...'}
            descriptionPlaceholder={post.excerpt || 'Descrizione per Google...'}
          />
        </div>

        <div className="px-8 py-6 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest active:scale-95"
          >
            Annulla
          </button>
          <button
            onClick={handleSaveSeo}
            disabled={isSavingSeo}
            className="flex items-center gap-2 px-8 py-2.5 text-sm font-black bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
          >
            {isSavingSeo ? <Loader2 size={16} className="animate-spin" /> : 'Salva SEO'}
          </button>
        </div>
      </div>
    </div>
  );
};
