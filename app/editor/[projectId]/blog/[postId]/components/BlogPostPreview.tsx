'use client';

import React from 'react';
import { cn, toPx } from '@/lib/utils';
import { ArrowLeft, MonitorPlay, Monitor, Tablet, Smartphone } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import type { BlogPost, Project } from '@/types/editor';
import type { Editor } from '@tiptap/react';

interface BlogPostPreviewProps {
  post: BlogPost;
  editor: Editor | null;
  projectSettings: any;
  bpd: Record<string, any>;
  previewViewport: 'desktop' | 'tablet' | 'mobile';
  setPreviewViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  initialProject: Project;
  onClose: () => void;
}

export function BlogPostPreview({
  post,
  editor,
  projectSettings,
  bpd,
  previewViewport,
  setPreviewViewport,
  initialProject,
  onClose,
}: BlogPostPreviewProps) {
  const maxWidth = bpd.bodyMaxWidth ?? null;
  const paddingX = previewViewport === 'mobile' ? (bpd.bodyPaddingXMobile ?? 16) : (bpd.bodyPaddingX ?? 24);
  const coverMode = bpd.coverImageMode ?? 'hero';
  const showToc = bpd.showToc === true;

  const font = projectSettings?.fontFamily || 'Outfit';
  const isDark = projectSettings?.appearance === 'dark';
  const themeBg = isDark ? (projectSettings?.themeColors?.dark?.bg || '#0c0c0e') : (projectSettings?.themeColors?.light?.bg || '#ffffff');
  const themeText = isDark ? (projectSettings?.themeColors?.dark?.text || '#ffffff') : (projectSettings?.themeColors?.light?.text || '#000000');
  const pColor = projectSettings?.primaryColor || '#3b82f6';
  const coverSrc = post.cover_image ? resolveImageUrl(post.cover_image, initialProject, useEditorStore.getState().imageMemoryCache, false) : '';
  const rawBodyHtml = editor ? editor.getHTML() : ((post.blocks?.[0] as any)?.content?.text || '');
  const cache = useEditorStore.getState().imageMemoryCache;
  const bodyHtml = rawBodyHtml
    .replace(/src="([^"]+)"/g, (_: string, src: string) => {
      const resolved = resolveImageUrl(src, initialProject, cache, false);
      return `src="${resolved}"`;
    })
    .replace(/<div([^>]*data-inline-image-wrap[^>]*)>/g, (_: string, attrs: string) => {
      const alignMatch = attrs.match(/data-align="([^"]+)"/);
      const align = alignMatch ? alignMatch[1] : 'center';
      const justifyMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
      const justify = justifyMap[align] || 'center';
      return `<div${attrs} style="display:flex;justify-content:${justify};margin:1em 0;">`;
    });

  let tocHtml = '';
  if (showToc && bodyHtml) {
    const headingMatches = [...bodyHtml.matchAll(/<(h[234])[^>]*>([\s\S]*?)<\/h[234]>/gi)];
    if (headingMatches.length > 0) {
      const items = headingMatches.map((m, i) => {
        const level = parseInt(m[1][1]);
        const text = m[2].replace(/<[^>]+>/g, '').trim();
        return { level, text, id: `toc-${i}` };
      });
      tocHtml = `<nav class="blog-toc"><ul>${items.map(it =>
        `<li style="padding-left:${(it.level - 2) * 16}px"><a href="#${it.id}">${it.text}</a></li>`
      ).join('')}</ul></nav>`;
    }
  }

  const typo = projectSettings?.typography || {};
  const typoTablet = projectSettings?.responsive?.tablet?.typography || {};
  const typoMobile = projectSettings?.responsive?.mobile?.typography || {};
  const activeTypo = previewViewport === 'mobile'
    ? { ...typo, ...typoMobile }
    : previewViewport === 'tablet'
    ? { ...typo, ...typoTablet }
    : typo;

  const previewCss = `
    @import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&display=swap');

    .blog-preview-root {
      --global-h1-fs: ${activeTypo.h1Size ? toPx(activeTypo.h1Size) : '2.5rem'};
      --global-h2-fs: ${activeTypo.h2Size ? toPx(activeTypo.h2Size) : '1.75rem'};
      --global-h3-fs: ${activeTypo.h3Size ? toPx(activeTypo.h3Size) : '1.35rem'};
      --global-h4-fs: ${activeTypo.h4Size ? toPx(activeTypo.h4Size) : '1.05rem'};
      --global-body-fs: ${activeTypo.bodySize ? toPx(activeTypo.bodySize) : '1rem'};
    }

    .blog-preview-root * { box-sizing: border-box; }
    .blog-preview-root { font-family: '${font}', sans-serif; background: ${themeBg}; color: ${themeText}; font-size: var(--global-body-fs); }

    .blog-body { text-align: left; }
    .blog-body h1 { font-size: var(--global-h1-fs); font-weight: 800; margin: 0 0 0.4em; line-height: 1.1; letter-spacing: -0.02em; }
    .blog-body h2 { font-size: var(--global-h2-fs); font-weight: 700; margin: 0 0 0.3em; line-height: 1.2; }
    .blog-body h3 { font-size: var(--global-h3-fs); font-weight: 600; margin: 0 0 0.25em; line-height: 1.2; }
    .blog-body h4 { font-size: var(--global-h4-fs); font-weight: 600; margin: 0 0 0.2em; line-height: 1.2; }
    .blog-body p { font-size: var(--global-body-fs); line-height: 1.7; margin-bottom: 0.6em; }
    .blog-body br { display: block; content: ''; margin-top: 0.3em; }
    .blog-body a { color: ${pColor}; text-decoration: underline; }
    .blog-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.2em; }
    .blog-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.2em; }
    .blog-body ul ul { list-style-type: circle; }
    .blog-body ul ul ul { list-style-type: square; }
    .blog-body li { font-size: var(--global-body-fs); margin-bottom: 0.4em; display: list-item; }
    .blog-body strong { font-weight: 600; }
    .blog-body blockquote { border-left: 3px solid ${pColor}; padding-left: 1em; margin: 1.5em 0; opacity: 0.8; font-style: italic; }
    .blog-body pre, .blog-body code { font-family: monospace; background: color-mix(in srgb, ${themeText} 8%, transparent); border-radius: 6px; padding: 0.2em 0.5em; font-size: 0.9em; }
    .blog-body pre { padding: 1em; overflow-x: auto; }
    .blog-body hr { border: none; border-top: 1px solid color-mix(in srgb, ${themeText} 12%, transparent); margin: 2em 0; }
    .blog-body img:not([data-inline-image]) { max-width: 100%; border-radius: 12px; margin: 1.5em 0; }
    .blog-body [data-inline-image-wrap] { display: flex !important; margin: 1em 0; }
    .blog-body [data-inline-image-wrap][data-align="left"] { justify-content: flex-start !important; }
    .blog-body [data-inline-image-wrap][data-align="center"] { justify-content: center !important; }
    .blog-body [data-inline-image-wrap][data-align="right"] { justify-content: flex-end !important; }
    .blog-body [data-inline-image] { height: auto !important; border-radius: 8px; display: block !important; max-width: 100%; }
    .blog-toc { background: color-mix(in srgb, ${themeText} 4%, transparent); border-radius: 12px; padding: 16px 20px; margin: 0 0 40px; }
    .blog-toc ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .blog-toc li { margin: 0; font-size: 0.85rem; }
    .blog-toc a { color: inherit; text-decoration: none; opacity: 0.7; }
    .blog-toc a:hover { opacity: 1; }
    .cover-contained { border-radius: 16px; overflow: hidden; margin-bottom: 2em; }
  `;

  const paddingY = previewViewport === 'mobile' ? (bpd.bodyPaddingYMobile ?? 48) : (bpd.bodyPaddingY ?? 80);
  const articleStyle: React.CSSProperties = {
    maxWidth: maxWidth ? `${maxWidth}px` : '100%',
    margin: '0 auto',
    padding: `${paddingY}px ${paddingX}px`,
  };

  const viewportWidths = { desktop: '100%', tablet: '768px', mobile: '390px' };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ fontFamily: `'${font}', sans-serif`, background: '#e5e7eb' }}>
      {/* Preview header */}
      <div className="flex items-center h-14 bg-white border-b border-zinc-200 px-4 shrink-0 z-[210] gap-3">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all font-semibold text-[13px] group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Torna all'editor
        </button>
        <div className="w-px h-5 bg-zinc-200" />
        <span className="text-[12px] text-zinc-400 font-medium flex items-center gap-1.5">
          <MonitorPlay size={13} /> Anteprima articolo
        </span>
        {/* Viewport switcher */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-zinc-100 rounded-lg p-0.5">
          {([
            { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
            { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
            { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
          ]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setPreviewViewport(key)}
              title={label}
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all", previewViewport === key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
            >
              <Icon size={14} />
              <span className="hidden lg:inline text-[11px]">{label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto flex justify-center items-start" style={{ background: previewViewport === 'desktop' ? themeBg : '#e5e7eb' }}>
        <div className="blog-preview-root w-full transition-all duration-300" style={{ maxWidth: viewportWidths[previewViewport], background: themeBg, color: themeText, minHeight: '100vh' }}>
          <style>{previewCss}</style>

          {coverSrc && coverMode === 'hero' && (
            <div style={{ width: '100%', aspectRatio: '3/1', overflow: 'hidden', marginBottom: '2em' }}>
              <img src={coverSrc} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={articleStyle}>
            {coverSrc && coverMode === 'contained' && (
              <div className="cover-contained" style={{ aspectRatio: '16/6' }}>
                <img src={coverSrc} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {(post.categories || []).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>
                  {(post.categories || []).join(' · ')}
                </span>
              </div>
            )}

            <h1 style={{ fontSize: 'var(--global-h1-fs)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 16 }}>
              {post.title}
            </h1>

            {post.excerpt && (
              <p style={{ fontSize: '1.15rem', opacity: 0.5, lineHeight: 1.6, marginBottom: 24 }}>{post.excerpt}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, opacity: 0.5, marginBottom: 48, paddingBottom: 24, borderBottom: `1px solid color-mix(in srgb, ${themeText} 8%, transparent)` }}>
              {(post.authors || []).length > 0 && <><span style={{ fontWeight: 600 }}>{post.authors!.map(a => a.name).join(', ')}</span><span>&middot;</span></>}
              {post.published_at && <span>{new Date(post.published_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
            </div>

            {tocHtml && <div dangerouslySetInnerHTML={{ __html: tocHtml }} />}

            <div
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
