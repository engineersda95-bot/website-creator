'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Settings, Search, Layout, Save, Loader2, X } from 'lucide-react';
import { SeoFields } from '@/components/shared/SeoFields';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { SimpleSlider } from '@/components/blocks/sidebar/ui/SimpleSlider';
import type { BlogPost, Project } from '@/types/editor';

interface BlogPostSidebarProps {
  post: BlogPost;
  sidebarSection: 'config' | 'seo' | 'style';
  setSidebarSection: (s: 'config' | 'seo' | 'style') => void;
  resolveCover: (path: string) => string;
  existingCategories: string[];
  existingAuthors: string[];
  bpd: Record<string, any>;
  isSavingProjectSettings: boolean;
  initialProject: Project;
  isUploading: boolean;
  uploadImage: (base64: string) => Promise<string>;
  onCoverUpload: (base64: string) => void;
  onUpdatePost: (updates: Partial<BlogPost>) => void;
  onUpdateSeo: (updates: Partial<BlogPost['seo']>) => void;
  onUpdateBpd: (updates: Record<string, any>) => void;
  onSaveProjectSettings: (settings: any) => void;
  projectSettings: any;
  inputClass: string;
  labelClass: string;
}

export function BlogPostSidebar({
  post,
  sidebarSection,
  setSidebarSection,
  resolveCover,
  existingCategories,
  existingAuthors,
  bpd,
  isSavingProjectSettings,
  initialProject,
  isUploading,
  uploadImage,
  onCoverUpload,
  onUpdatePost,
  onUpdateSeo,
  onUpdateBpd,
  onSaveProjectSettings,
  projectSettings,
  inputClass,
  labelClass,
}: BlogPostSidebarProps) {
  return (
    <div className="w-72 bg-white border-l border-zinc-200/80 flex flex-col shrink-0 overflow-hidden">
      {/* Sidebar tabs */}
      <div className="flex border-b border-zinc-100 shrink-0">
        <button
          onClick={() => setSidebarSection('config')}
          className={cn("flex-1 py-2.5 text-[11px] font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5",
            sidebarSection === 'config' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400"
          )}
        >
          <Settings size={12} /> Dettagli
        </button>
        <button
          onClick={() => setSidebarSection('seo')}
          className={cn("flex-1 py-2.5 text-[11px] font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5",
            sidebarSection === 'seo' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400"
          )}
        >
          <Search size={12} /> SEO
        </button>
        <button
          onClick={() => setSidebarSection('style')}
          className={cn("flex-1 py-2.5 text-[11px] font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5",
            sidebarSection === 'style' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400"
          )}
        >
          <Layout size={12} /> Stile
        </button>
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {sidebarSection === 'config' && (
          <>
            <ImageUpload
              label="Immagine di copertina"
              value={post.cover_image ? resolveCover(post.cover_image) : ''}
              onChange={onCoverUpload}
            />
            <div>
              <label className={labelClass}>Slug (URL)</label>
              <div className="flex items-center">
                <span className="text-[10px] text-zinc-300 font-mono shrink-0 mr-1">/blog/</span>
                <input value={post.slug ?? ''} onChange={(e) => onUpdatePost({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Categorie</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {(post.categories || []).map((cat, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 text-[11px] font-semibold rounded-lg">
                      {cat}
                      <button onClick={() => onUpdatePost({ categories: (post.categories || []).filter((_, idx) => idx !== i) })} className="text-zinc-400 hover:text-red-500 transition-colors">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  className={inputClass}
                  placeholder="Scrivi e premi Invio..."
                  list="existing-categories"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !(post.categories || []).includes(val)) {
                        onUpdatePost({ categories: [...(post.categories || []), val] });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <datalist id="existing-categories">
                  {existingCategories.filter(c => !(post.categories || []).includes(c)).map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
            <div>
              <label className={labelClass}>Autori</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {(post.authors || []).map((author, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 text-[11px] font-semibold rounded-lg">
                      {author.name}
                      <button onClick={() => onUpdatePost({ authors: (post.authors || []).filter((_, idx) => idx !== i) })} className="text-zinc-400 hover:text-red-500 transition-colors">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  className={inputClass}
                  placeholder="Scrivi e premi Invio..."
                  list="existing-authors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !(post.authors || []).some(a => a.name === val)) {
                        onUpdatePost({ authors: [...(post.authors || []), { name: val, slug: val.toLowerCase().replace(/\s+/g, '-') }] });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <datalist id="existing-authors">
                  {existingAuthors.filter(a => !(post.authors || []).some(auth => auth.name === a)).map(a => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
            </div>
          </>
        )}

        {sidebarSection === 'style' && (
          <>
            <p className="text-[9px] text-zinc-400 bg-zinc-50 rounded-lg px-3 py-2">Queste impostazioni si applicano a tutti gli articoli del progetto.</p>
            <div>
              <label className={labelClass}>Copertina</label>
              <div className="grid grid-cols-2 gap-1">
                {([['hero', 'Tutta larghezza'], ['contained', 'Contenuta']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => onUpdateBpd({ coverImageMode: val })}
                    className={cn("p-2 text-[11px] font-bold rounded-xl border transition-all", (bpd.coverImageMode || 'hero') === val ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 text-zinc-400 border-zinc-100 hover:text-zinc-600")}
                  >{label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Larghezza max corpo (px)</label>
              <input
                type="number"
                className={inputClass}
                value={bpd.bodyMaxWidth ?? ''}
                placeholder="Auto (100%)"
                min={320}
                max={1800}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseInt(e.target.value) || undefined;
                  onUpdateBpd({ bodyMaxWidth: val });
                }}
              />
              <p className="text-[9px] text-zinc-400 mt-1">Vuoto = larghezza piena. Esempio: 720</p>
            </div>
            <SimpleSlider label="Padding verticale" value={bpd.bodyPaddingY ?? 80} onChange={(v) => onUpdateBpd({ bodyPaddingY: v })} min={0} max={200} step={8} />
            <SimpleSlider label="Padding verticale mobile" value={bpd.bodyPaddingYMobile ?? 48} onChange={(v) => onUpdateBpd({ bodyPaddingYMobile: v })} min={0} max={200} step={8} />
            <SimpleSlider label="Padding laterale desktop" value={bpd.bodyPaddingX ?? 24} onChange={(v) => onUpdateBpd({ bodyPaddingX: v })} min={0} max={120} step={4} />
            <SimpleSlider label="Padding laterale mobile" value={bpd.bodyPaddingXMobile ?? 16} onChange={(v) => onUpdateBpd({ bodyPaddingXMobile: v })} min={0} max={120} step={4} />
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
              <div>
                <div className="text-[10px] font-bold text-zinc-700">Indice dei contenuti</div>
              </div>
              <input
                type="checkbox"
                checked={bpd.showToc === true}
                onChange={(e) => onUpdateBpd({ showToc: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300"
              />
            </div>
            <button
              onClick={() => onSaveProjectSettings(projectSettings)}
              disabled={isSavingProjectSettings}
              className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-[11px] font-bold hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSavingProjectSettings ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Salva impostazioni articoli
            </button>
          </>
        )}

        {sidebarSection === 'seo' && (
          <>
            <SeoFields
              seo={post.seo || {}}
              onChange={(updates) => onUpdateSeo(updates)}
              project={initialProject}
              uploadImage={uploadImage}
              isUploading={isUploading}
              compact={true}
              allowIndexToggle={true}
              defaultImage={post.cover_image || ''}
              titlePlaceholder={post.title || 'Titolo per Google...'}
              descriptionPlaceholder={post.excerpt || 'Descrizione per Google...'}
            />

            {/* Google preview */}
            <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Anteprima Google</p>
              <p className="text-blue-700 text-xs font-medium truncate">{post.seo?.title || post.title || 'Titolo'}</p>
              <p className="text-emerald-700 text-[10px] font-mono truncate">tuosito.it/blog/{post.slug}</p>
              <p className="text-zinc-500 text-[10px] line-clamp-2">{post.seo?.description || post.excerpt || 'Descrizione...'}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
