import React from 'react';
import { Block, Project, BlogPost } from '@/types/editor';
import { cn, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';
import { CTA, getCTAOverrides } from '@/components/shared/CTA';
import { resolveImageUrl } from '@/lib/image-utils';

interface BlogListBlockProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
  // Blog posts injected at render time (editor: from store/prop, static: from deploy)
  allBlogPosts?: BlogPost[];
}

export const BlogListBlock: React.FC<BlogListBlockProps> = ({
  block, project, viewport, isStatic, imageMemoryCache, onInlineEdit, allBlogPosts = []
}) => {
  const { content } = block;
  const { style } = getBlockStyles(block, project, viewport || 'desktop');

  const isBlogPage = content.isBlogPage === true;
  const maxPosts = content.maxPosts ?? (isBlogPage ? 100 : 6);
  const filterMode = content.filterMode || 'all';
  const filterCategory = content.filterCategory || '';

  // Filter by language when multilingual
  const blockLang = content.language || '';
  const defaultLang = project?.settings?.defaultLanguage || 'it';
  const siteLanguages = project?.settings?.languages || [defaultLang];
  const isMultilingual = siteLanguages.length > 1;

  // Filter posts
  let posts = allBlogPosts.filter(p => isStatic ? p.status === 'published' : true);
  if (isMultilingual && blockLang) {
    posts = posts.filter(p => (p.language || defaultLang) === blockLang);
  }
  if (filterMode === 'category' && filterCategory) {
    posts = posts.filter(p => (p.categories || []).some(c => c.toLowerCase() === filterCategory.toLowerCase()));
  }
  posts = posts.slice(0, maxPosts);

  const colsD = block.style?.columns || 3;
  const colsT = block.responsiveStyles?.tablet?.columns || 2;
  const colsM = block.responsiveStyles?.mobile?.columns || 1;
  const currentCols = viewport === 'desktop' ? colsD : viewport === 'tablet' ? colsT : viewport === 'mobile' ? colsM : colsD;

  const animType = style.animationType || 'none';
  const animDuration = style.animationDuration || 0.8;
  const baseDelay = style.animationDelay || 0;

  const pColor = project?.settings?.primaryColor || '#3b82f6';
  const appearance = project?.settings?.appearance || 'light';
  const isDark = appearance === 'dark';
  const themeBg = isDark ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff');
  const themeText = isDark ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000');
  const tagColorMode = content.tagColorMode || 'primary';
  const tagColor = tagColorMode === 'primary' ? pColor : tagColorMode === 'text' ? 'currentColor' : (content.tagColor || '#3b82f6');
  const filterActiveBg = content.filterActiveColor || '';
  const filterActiveText = content.filterActiveTextColor || '';
  const filterInactiveBorder = content.filterInactiveColor || '';
  const blogLangPrefix = isMultilingual && blockLang && blockLang !== defaultLang ? `/${blockLang}` : '';
  const showAuthor = content.showAuthor !== false;
  const showDate = content.showDate !== false;

  // Filter pill styles — font size now from style (TypographyFields), rest from content
  const filterFontSize = style.filterFontSize || 11;
  const filterBorderRadius = content.filterBorderRadius !== undefined ? content.filterBorderRadius : 999;
  const filterPaddingX = content.filterPaddingX || 12;
  const filterPaddingY = content.filterPaddingY || 6;
  const filterPillStyle = {
    fontSize: `${filterFontSize}px`,
    fontWeight: style.filterFontBold ? 700 : 700,
    fontStyle: style.filterFontItalic ? 'italic' : 'normal',
    borderRadius: `${filterBorderRadius}px`,
    padding: `${filterPaddingY}px ${filterPaddingX}px`,
  };

  // Author/date typography
  const authorStyle: React.CSSProperties = {
    fontSize: style.authorSize ? `${style.authorSize}px` : '0.875rem',
    fontWeight: style.authorBold ? 700 : 600,
    fontStyle: style.authorItalic ? 'italic' : 'normal',
  };
  const dateStyle: React.CSSProperties = {
    fontSize: style.dateSize ? `${style.dateSize}px` : '0.875rem',
    fontWeight: style.dateBold ? 700 : 400,
    fontStyle: style.dateItalic ? 'italic' : 'normal',
  };

  // CTA "vedi tutti"
  const showViewAll = content.showViewAll !== false && !isBlogPage;
  const viewAllCtaLabel = content.viewAllCta || 'Vedi tutti gli articoli';
  const viewAllCtaUrl = content.viewAllCtaUrl || `${blogLangPrefix}/blog`;
  const viewAllCtaTheme = content.viewAllCtaTheme || 'primary';

  const PostCard = ({ post, index }: { post: BlogPost; index: number }) => {
    const coverUrl = post.cover_image ? resolveImageUrl(post.cover_image, project, imageMemoryCache, isStatic) : '';
    const date = post.published_at || post.created_at;
    const formattedDate = date ? new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const itemDelay = baseDelay + 0.1 + (index * 0.05);

    const Wrapper = isStatic ? 'a' : 'div';
    const wrapperProps = isStatic ? { href: `${blogLangPrefix}/blog/${post.slug}` } : {};

    return (
      <Wrapper
        {...wrapperProps as any}
        data-siti-anim={animType}
        data-siti-anim-duration={animDuration}
        data-siti-anim-delay={itemDelay}
        className="group flex flex-col transition-all duration-500"
        style={{
          '--siti-anim-duration': animDuration + 's',
          '--siti-anim-delay': itemDelay + 's',
        } as any}
      >
        {/* Cover */}
        <div
          className="w-full rounded-2xl overflow-hidden mb-4"
          style={{ aspectRatio: '16/10', background: 'color-mix(in srgb, currentColor 5%, transparent)' }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ opacity: 0.1 }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="24" height="24" rx="4"/></svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {(post.categories?.length ?? 0) > 0 && (
            <span className="font-bold uppercase tracking-wider mb-1.5" style={{ fontSize: `${filterFontSize}px`, fontStyle: style.filterFontItalic ? 'italic' : 'normal', opacity: 0.5 }}>
              {(post.categories || []).join(' · ')}
            </span>
          )}
          <h3
            className="font-bold leading-tight mb-2 transition-colors rt-content"
            style={{ fontSize: 'var(--item-title-fs)', fontWeight: 'var(--item-title-fw)', color: 'inherit' }}
          >
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="leading-relaxed mb-3 rt-content" style={{ opacity: 0.6, fontSize: '0.875rem' }}>
              {post.excerpt}
            </p>
          )}
          {(showAuthor || showDate) && (
            <div className="flex items-center gap-3 mt-auto" style={{ opacity: 0.5 }}>
              {showAuthor && (post.authors || []).length > 0 && (
                <span style={authorStyle}>{(post.authors || []).map((a: any) => typeof a === 'string' ? a : a?.name).join(', ')}</span>
              )}
              {showAuthor && (post.authors || []).length > 0 && showDate && formattedDate && <span>&middot;</span>}
              {showDate && formattedDate && <span style={dateStyle}>{formattedDate}</span>}
            </div>
          )}
        </div>
      </Wrapper>
    );
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'var(--block-bg)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
        color: 'var(--block-color)',
      }}
    >
      {content.sectionId && (
        <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      <BlockBackground
        backgroundImage={content.backgroundImage}
        backgroundAlt={content.backgroundAlt}
        style={style}
        project={project}
        isStatic={isStatic}
        imageMemoryCache={imageMemoryCache}
      />

      <div className="relative z-10 w-full mx-auto">
        {/* Title row: title+subtitle left, CTA right */}
        {(content.title || content.subtitle || showViewAll) && (
          <div
            data-siti-anim={animType}
            data-siti-anim-duration={animDuration}
            data-siti-anim-delay={baseDelay}
            className={cn(
              "flex items-start gap-6",
              (content.showSearch !== false || content.showCategoryFilter !== false) ? "mb-8" : content.subtitle ? "mb-8" : "mb-6",
              style.align === 'center' ? "justify-center" : style.align === 'right' ? "flex-row-reverse" : "justify-between"
            )}
            style={{ '--siti-anim-duration': animDuration + 's', '--siti-anim-delay': baseDelay + 's' } as any}
          >
            {/* Title + subtitle */}
            <div className={cn("flex-1", style.align === 'center' ? "text-center" : style.align === 'right' ? "text-right" : "text-left")}>
              {content.title && (
                onInlineEdit ? (
                  <InlineEditable
                    fieldId="title"
                    value={content.title || ''}
                    onChange={(v) => onInlineEdit('title', v)}
                    className="mb-3 tracking-tighter transition-all duration-500 leading-tight rt-content"
                    style={{ fontSize: 'var(--title-fs)', fontWeight: 'var(--title-fw)', color: 'inherit' }}
                    placeholder="Titolo..."
                  />
                ) : (
                  <div
                    className="mb-3 tracking-tighter transition-all duration-500 leading-tight rt-content"
                    style={{ fontSize: 'var(--title-fs)', fontWeight: 'var(--title-fw)', color: 'inherit' }}
                    dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
                  />
                )
              )}
              {content.subtitle && (
                onInlineEdit ? (
                  <InlineEditable
                    fieldId="subtitle"
                    value={content.subtitle || ''}
                    onChange={(v) => onInlineEdit('subtitle', v)}
                    className="opacity-60 max-w-2xl leading-relaxed transition-all duration-500 rt-content"
                    style={{ fontSize: 'var(--subtitle-fs)', color: 'inherit', marginLeft: style.align === 'center' ? 'auto' : '0', marginRight: style.align === 'center' ? 'auto' : '0' }}
                    placeholder="Sottotitolo..."
                    richText
                    multiline
                  />
                ) : (
                  <div
                    className="opacity-60 max-w-2xl leading-relaxed transition-all duration-500 rt-content"
                    style={{ fontSize: 'var(--subtitle-fs)', color: 'inherit', marginLeft: style.align === 'center' ? 'auto' : '0', marginRight: style.align === 'center' ? 'auto' : '0' }}
                    dangerouslySetInnerHTML={{ __html: formatRichText(content.subtitle) }}
                  />
                )
              )}
            </div>

            {/* CTA "Vedi tutti" — aligned to top-right of title row */}
            {showViewAll && viewAllCtaLabel && (
              <div className="flex-shrink-0 self-start pt-1">
                <CTA
                  label={viewAllCtaLabel}
                  url={viewAllCtaUrl}
                  project={project}
                  viewport={viewport}
                  theme={viewAllCtaTheme as any}
                  isStatic={isStatic}
                  {...getCTAOverrides(content, style, 'viewAllCta', viewAllCtaTheme)}
                />
              </div>
            )}
          </div>
        )}

        {/* Filters — search and category pills */}
        {filterMode === 'all' && posts.length > 0 && (() => {
          const showSearch = content.showSearch !== false;
          const showCats = content.showCategoryFilter !== false;
          const allCategories = [...new Set(allBlogPosts.flatMap(p => p.categories || []).filter(Boolean))];
          if (!showSearch && !showCats) return null;
          return (
            <div className="mb-8 space-y-4">
              {showSearch && (
                <input
                  type="text"
                  data-blog-search
                  placeholder="Cerca articoli..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1px solid color-mix(in srgb, currentColor 12%, transparent)', background: 'transparent', color: 'inherit' }}
                  readOnly={!isStatic}
                />
              )}
              {/* Inject filter color CSS */}
              <style dangerouslySetInnerHTML={{ __html: `
                .siti-filter-pill { border: 1px solid ${filterInactiveBorder || 'color-mix(in srgb, currentColor 15%, transparent)'}; background: transparent; color: inherit; cursor: pointer; font-weight: 700; transition: all 0.2s; }
                .siti-filter-pill.active { background: ${filterActiveBg || themeText}; color: ${filterActiveText || themeBg}; border-color: ${filterActiveBg || themeText}; }
                .siti-filter-pill:not(.active):hover { background: color-mix(in srgb, currentColor 6%, transparent); }
              ` }} />
              {showCats && allCategories.length > 0 && (
                <div className="flex flex-wrap gap-2" data-blog-filters>
                  <button data-filter="all" className="siti-filter-pill active" style={filterPillStyle}>Tutti</button>
                  {allCategories.map(cat => (
                    <button key={cat} data-filter={cat.toLowerCase()} className="siti-filter-pill" style={filterPillStyle}>{cat}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Posts grid */}
        {posts.length > 0 ? (
          <div className="grid gap-8" data-blog-grid style={{ gridTemplateColumns: isStatic ? `repeat(var(--blog-columns, ${colsD}), minmax(0, 1fr))` : `repeat(${currentCols}, minmax(0, 1fr))` }}>
            {posts.map((post, i) => (
              <div key={post.id} data-blog-card data-categories={(post.categories || []).map(c => c.toLowerCase()).join(',')} data-authors={(post.authors || []).map(a => a.name.toLowerCase()).join(',')} data-title={(post.title || '').toLowerCase()}>
                <PostCard post={post} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16" style={{ opacity: 0.25 }}>
            <p className="text-sm font-bold uppercase tracking-widest">
              {isStatic ? 'Nessun articolo pubblicato' :
               filterMode === 'category' && filterCategory ? `Nessun articolo nella categoria "${filterCategory}"` :
               allBlogPosts.length === 0 ? 'Nessun articolo. Crea post dal tab Blog nella dashboard.' :
               'Nessun articolo trovato con i filtri attuali'}
            </p>
          </div>
        )}

        {/* Vanilla JS for static filtering */}
        {isStatic && (
          <div dangerouslySetInnerHTML={{ __html: `<script>
            (function(){
              var cards=document.querySelectorAll('[data-blog-card]');
              var filters=document.querySelectorAll('[data-filter]');
              var search=document.querySelector('[data-blog-search]');
              var activeCat='all';
              try{
                var uc=new URLSearchParams(window.location.search).get('category');
                if(uc)activeCat=decodeURIComponent(uc).toLowerCase();
              }catch(e){}
              function run(){
                var q=(search?search.value:'').toLowerCase();
                cards.forEach(function(c){
                  var cats=(c.getAttribute('data-categories')||'').split(',');
                  var t=c.getAttribute('data-title')||'';
                  var mc=activeCat==='all'||cats.indexOf(activeCat)!==-1;
                  var ms=!q||t.indexOf(q)!==-1;
                  c.style.display=(mc&&ms)?'':'none';
                });
              }
              filters.forEach(function(b){
                b.addEventListener('click',function(){
                  filters.forEach(function(x){x.classList.remove('active');});
                  b.classList.add('active');
                  activeCat=b.getAttribute('data-filter');
                  run();
                });
              });
              if(activeCat!=='all'){
                filters.forEach(function(b){
                  b.classList.remove('active');
                  if(b.getAttribute('data-filter')===activeCat)b.classList.add('active');
                });
              }
              if(search)search.addEventListener('input',run);
              run();
            })();
          </script>` }} />
        )}
      </div>
    </section>
  );
};
