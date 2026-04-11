import 'server-only';
import { BlogPost, Project, ProjectSettings, SiteGlobal } from '@/types/editor';
import { toPx } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/image-utils';
import { getProjectDomain } from '@/lib/url-utils';
import { generateStaticHtml, renderBlock } from './generate-static';
import { marked } from 'marked';

/**
 * Generate the blog listing page (/blog/index.html)
 * Pure static HTML with vanilla JS for filtering
 */
export function generateBlogListingHtml(
  posts: BlogPost[],
  project: Project,
  langPrefix: string = '',
  siteGlobals: SiteGlobal[] = []
): string {
  const settings = (project?.settings || {}) as ProjectSettings;
  const font = settings?.fontFamily || 'Outfit';
  const pColor = settings?.primaryColor || '#3b82f6';
  const baseUrl = getProjectDomain(project);
  const siteName = settings?.metaTitle || project?.name || '';
  const appearance = settings?.appearance || 'light';
  const isDark = appearance === 'dark';
  const themeBg = isDark ? (settings?.themeColors?.dark?.bg || '#0c0c0e') : (settings?.themeColors?.light?.bg || '#ffffff');
  const themeText = isDark ? (settings?.themeColors?.dark?.text || '#ffffff') : (settings?.themeColors?.light?.text || '#000000');

  const pageLang = langPrefix.replace(/^\//, '') || settings?.defaultLanguage || 'it';

  // Render nav and footer from siteGlobals
  let listingNavHtml = '';
  let listingFooterHtml = '';
  {
    const { renderToStaticMarkup } = require('react-dom/server');
    const navGlobal = siteGlobals.find(g => g.language === pageLang && g.type === 'navigation');
    const footerGlobal = siteGlobals.find(g => g.language === pageLang && g.type === 'footer');
    if (navGlobal) {
      const navBlock = { id: 'global-nav', type: 'navigation', content: navGlobal.content, style: navGlobal.style };
      listingNavHtml = renderBlock(navBlock as any, project, renderToStaticMarkup);
    }
    if (footerGlobal) {
      const footerBlock = { id: 'global-footer', type: 'footer', content: { ...footerGlobal.content, _navLogoFallback: footerGlobal.content?.logoImage ? undefined : siteGlobals.find(g => g.language === pageLang && g.type === 'navigation')?.content?.logoImage, _language: pageLang }, style: footerGlobal.style };
      listingFooterHtml = renderBlock(footerBlock as any, project, renderToStaticMarkup);
    }
  }

  const publishedPosts = posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());

  const categories = [...new Set(publishedPosts.flatMap(p => p.categories || []).filter(Boolean))];

  const postCards = publishedPosts.map(post => {
    const date = new Date(post.published_at || post.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    const coverUrl = post.cover_image ? resolveImageUrl(post.cover_image, project, {}, true) : '';

    return `
      <article class="blog-card" data-category="${(post.categories || []).map(c => c.toLowerCase()).join(',')}" data-authors="${(post.authors || []).map(a => a.name.toLowerCase()).join(',')}" data-title="${(post.title || '').toLowerCase()}">
        <a href="${langPrefix}/blog/${post.slug}" class="block group">
          <div class="aspect-[16/10] rounded-2xl overflow-hidden mb-4" style="background: color-mix(in srgb, ${themeText} 5%, transparent);">
            ${coverUrl ? `<img src="${coverUrl}" alt="${post.title}" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />` : `<div class="w-full h-full flex items-center justify-center"><svg width="32" height="32" fill="none" stroke="${themeText}" stroke-width="1.5" opacity="0.15"><rect x="4" y="4" width="24" height="24" rx="4"/><circle cx="12" cy="12" r="3"/><path d="M4 20l6-6 4 4 4-4 6 6"/></svg></div>`}
          </div>
          <div class="space-y-2">
            ${(post.categories || []).length > 0 ? `<span class="text-xs font-bold uppercase tracking-wider" style="opacity: 0.5;">${(post.categories || []).join(' · ')}</span>` : ''}
            <h2 class="text-lg font-bold leading-tight transition-colors group-hover:opacity-80">${post.title}</h2>
            ${post.excerpt ? `<p class="text-sm leading-relaxed" style="opacity: 0.6;">${post.excerpt}</p>` : ''}
            <div class="flex items-center gap-3 text-xs" style="opacity: 0.4;">
              ${(post.authors || []).length > 0 ? `<span>${(post.authors || []).join(', ')}</span><span>&middot;</span>` : ''}
              <span>${date}</span>
            </div>
          </div>
        </a>
      </article>
    `;
  }).join('\n');

  const categoryFilters = categories.length > 0 ? `
    <div class="flex flex-wrap gap-2" id="blog-filters" style="margin-bottom: 16px;">
      <button class="blog-filter active" data-filter="all" style="padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid color-mix(in srgb, ${themeText} 15%, transparent); transition: all 0.2s;">Tutti</button>
      ${categories.map(cat => `<button class="blog-filter" data-filter="${cat.toLowerCase()}" style="padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid color-mix(in srgb, ${themeText} 15%, transparent); transition: all 0.2s;">${cat}</button>`).join('\n')}
    </div>
  ` : '';


  return `<!DOCTYPE html>
<html lang="${settings?.defaultLanguage || 'it'}" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — ${siteName}</title>
  <meta name="description" content="Tutti gli articoli del blog di ${siteName}">
  <link rel="canonical" href="${baseUrl}${langPrefix}/blog">
  <meta property="og:title" content="Blog — ${siteName}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}${langPrefix}/blog">
  <link rel="icon" href="${resolveImageUrl(settings?.favicon, project || null, {}, true) || '/favicon.ico'}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
  <style>
    :root {
      --primary: ${pColor};
      --font-main: '${font}', sans-serif;
      --global-h1-fs: ${toPx(settings?.typography?.h1Size, '2.5rem')};
      --global-h2-fs: ${toPx(settings?.typography?.h2Size, '1.75rem')};
      --global-h3-fs: ${toPx(settings?.typography?.h3Size, '1.35rem')};
      --global-body-fs: ${toPx(settings?.typography?.bodySize, '1rem')};
    }
    ${settings?.responsive?.tablet?.typography ? `@media (max-width: 1024px) { :root {
      ${settings.responsive.tablet.typography.h1Size ? `--global-h1-fs: ${toPx(settings.responsive.tablet.typography.h1Size)};` : ''}
      ${settings.responsive.tablet.typography.h2Size ? `--global-h2-fs: ${toPx(settings.responsive.tablet.typography.h2Size)};` : ''}
      ${settings.responsive.tablet.typography.h3Size ? `--global-h3-fs: ${toPx(settings.responsive.tablet.typography.h3Size)};` : ''}
      ${settings.responsive.tablet.typography.bodySize ? `--global-body-fs: ${toPx(settings.responsive.tablet.typography.bodySize)};` : ''}
    } }` : ''}
    ${settings?.responsive?.mobile?.typography ? `@media (max-width: 768px) { :root {
      ${settings.responsive.mobile.typography.h1Size ? `--global-h1-fs: ${toPx(settings.responsive.mobile.typography.h1Size)};` : ''}
      ${settings.responsive.mobile.typography.h2Size ? `--global-h2-fs: ${toPx(settings.responsive.mobile.typography.h2Size)};` : ''}
      ${settings.responsive.mobile.typography.h3Size ? `--global-h3-fs: ${toPx(settings.responsive.mobile.typography.h3Size)};` : ''}
      ${settings.responsive.mobile.typography.bodySize ? `--global-body-fs: ${toPx(settings.responsive.mobile.typography.bodySize)};` : ''}
    } }` : ''}
    .blog-page, .blog-page * { font-family: inherit; box-sizing: border-box; }
    body { font-family: var(--font-main); background: ${themeBg}; color: ${themeText}; font-size: var(--global-body-fs); }
    a { color: inherit; text-decoration: none; }
    .blog-filter.active { background: ${themeText}; color: ${themeBg}; border-color: ${themeText}; }
    .blog-filter:not(.active):hover { background: color-mix(in srgb, ${themeText} 8%, transparent); }
    .blog-card.hidden { display: none; }
    .blog-search { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid color-mix(in srgb, ${themeText} 12%, transparent); background: transparent; font-size: 14px; outline: none; transition: border-color 0.2s; color: inherit; }
    .blog-search:focus { border-color: ${pColor}; }
    .blog-search::placeholder { opacity: 0.3; }
  </style>
</head>
<body>
  ${listingNavHtml}
  <div class="blog-page" style="max-width: 1100px; margin: 0 auto; padding: 60px 24px;">
    <div style="margin-bottom: 40px;">
      <a href="${langPrefix || '/'}" style="font-size: 12px; font-weight: 600; opacity: 0.4; margin-bottom: 12px; display: inline-block;">&larr; Torna al sito</a>
      <h1 style="font-size: var(--global-h1-fs); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;">Blog</h1>
      ${publishedPosts.length > 0 ? `<p style="margin-top: 8px; opacity: 0.5; font-size: 14px;">${publishedPosts.length} ${publishedPosts.length === 1 ? 'articolo' : 'articoli'}</p>` : ''}
    </div>

    ${publishedPosts.length > 3 ? `<input type="text" class="blog-search" id="blog-search" placeholder="Cerca articoli..." style="margin-bottom: 24px;" />` : ''}

    ${categoryFilters}

    ${publishedPosts.length === 0 ? `
      <div style="text-align: center; padding: 80px 0; opacity: 0.3;">
        <p style="font-size: 14px; font-weight: 600;">Nessun articolo pubblicato</p>
      </div>
    ` : `
      <div id="blog-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px;">
        ${postCards}
      </div>
      <div id="blog-empty" style="display: none; text-align: center; padding: 60px 0; opacity: 0.3;">
        <p style="font-size: 14px; font-weight: 600;">Nessun risultato trovato</p>
      </div>
    `}
  </div>

  ${listingFooterHtml}
  <script>
    (function() {
      var cards = document.querySelectorAll('.blog-card');
      var catFilters = document.querySelectorAll('[data-filter]');
      var search = document.getElementById('blog-search');
      var empty = document.getElementById('blog-empty');
      var activeCat = 'all';

      try {
        var urlCat = new URLSearchParams(window.location.search).get('category');
        if (urlCat) activeCat = decodeURIComponent(urlCat).toLowerCase();
      } catch(e) {}

      function applyFilters() {
        var query = (search ? search.value : '').toLowerCase();
        var visible = 0;
        cards.forEach(function(card) {
          var cats = (card.getAttribute('data-category') || '').split(',');
          var title = card.getAttribute('data-title');
          var matchCat = activeCat === 'all' || cats.indexOf(activeCat) !== -1;
          var matchSearch = !query || title.indexOf(query) !== -1;
          if (matchCat && matchSearch) { card.classList.remove('hidden'); visible++; }
          else { card.classList.add('hidden'); }
        });
        if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
      }

      catFilters.forEach(function(btn) {
        btn.addEventListener('click', function() {
          catFilters.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          activeCat = btn.getAttribute('data-filter');
          applyFilters();
        });
      });

      if (activeCat !== 'all') {
        catFilters.forEach(function(b) {
          b.classList.remove('active');
          if (b.getAttribute('data-filter') === activeCat) b.classList.add('active');
        });
      }

      if (search) search.addEventListener('input', applyFilters);
      applyFilters();
    })();
  </script>
</body>
</html>`;
}

/**
 * Generate a single blog post page (/blog/[slug].html)
 */
/** Inject id attributes into h2/h3/h4 headings for TOC anchor links */
function injectHeadingIds(html: string): string {
  const counts: Record<string, number> = {};
  return html.replace(/<(h[234])(.*?)>([\s\S]*?)<\/\1>/gi, (_, tag, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'heading';
    counts[base] = (counts[base] || 0) + 1;
    const id = counts[base] === 1 ? base : `${base}-${counts[base]}`;
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
}

/** Extract TOC items from HTML with injected ids */
function extractTocItems(html: string): { level: number; text: string; id: string }[] {
  const items: { level: number; text: string; id: string }[] = [];
  const regex = /<h([234])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[234]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    items.push({ level: parseInt(match[1]), text: match[3].replace(/<[^>]+>/g, '').trim(), id: match[2] });
  }
  return items;
}

export function generateBlogPostHtml(
  post: BlogPost,
  project: Project,
  langPrefix: string = '',
  postSiblings: BlogPost[] = [],
  siteGlobals: SiteGlobal[] = [],
  isStatic: boolean = true
): string {
  const settings = (project?.settings || {}) as ProjectSettings;
  const font = settings?.fontFamily || 'Outfit';
  const pColor = settings?.primaryColor || '#3b82f6';
  const baseUrl = getProjectDomain(project);
  const appearance = settings?.appearance || 'light';
  const isDark = appearance === 'dark';
  const themeBg = isDark ? (settings?.themeColors?.dark?.bg || '#0c0c0e') : (settings?.themeColors?.light?.bg || '#ffffff');
  const themeText = isDark ? (settings?.themeColors?.dark?.text || '#ffffff') : (settings?.themeColors?.light?.text || '#000000');

  const bpd = settings?.blogPostDisplay || {};
  const coverMode = bpd.coverImageMode || 'hero';
  const bodyMaxWidth = bpd.bodyMaxWidth ?? null; // null = 100% width
  const bodyPaddingX = bpd.bodyPaddingX ?? 24;
  const bodyPaddingXMobile = bpd.bodyPaddingXMobile ?? 16;
  const bodyPaddingY = bpd.bodyPaddingY ?? 80;
  const bodyPaddingYMobile = bpd.bodyPaddingYMobile ?? 48;
  const bodyMaxWidthCss = bodyMaxWidth ? `max-width: ${bodyMaxWidth}px;` : 'max-width: 100%;';

  const date = new Date(post.published_at || post.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const coverUrl = post.cover_image ? resolveImageUrl(post.cover_image, project, {}, isStatic) : '';
  const ogImage = post.seo?.image || coverUrl || '';
  const seoTitle = post.seo?.title || post.title;
  const seoDesc = post.seo?.description || post.excerpt;

  // Render nav and footer from siteGlobals
  let navHtml = '';
  let footerHtml = '';
  {
    const { renderToStaticMarkup } = require('react-dom/server');
    const postLang = post.language || settings?.defaultLanguage || 'it';
    const navGlobal = siteGlobals.find(g => g.language === postLang && g.type === 'navigation');
    const footerGlobal = siteGlobals.find(g => g.language === postLang && g.type === 'footer');
    if (navGlobal) {
      const navBlock = { id: 'global-nav', type: 'navigation', content: navGlobal.content, style: navGlobal.style };
      navHtml = renderBlock(navBlock as any, project, renderToStaticMarkup);
    }
    if (footerGlobal) {
      const footerBlock = { id: 'global-footer', type: 'footer', content: { ...footerGlobal.content, _navLogoFallback: footerGlobal.content?.logoImage ? undefined : navGlobal?.content?.logoImage, _language: postLang }, style: footerGlobal.style };
      footerHtml = renderBlock(footerBlock as any, project, renderToStaticMarkup);
    }
  }

  // Render body blocks (markdown → HTML), inject heading ids
  const rawBodyHtml = (post.blocks || []).map(block => {
    if (block.type === 'text' && block.content?.text) {
      const text = block.content.text;
      const isMarkdown = !/<[a-z][\s\S]*>/i.test(text.trim().slice(0, 50));
      const rendered = isMarkdown ? marked.parse(text, { breaks: true }) as string : text;
      return rendered;
    }
    return '';
  }).join('\n');

  const bodyHtmlWithIds = injectHeadingIds(rawBodyHtml);
  const bodyHtml = `<div class="blog-body rt-content" style="max-width: 100%;">${bodyHtmlWithIds}</div>`;

  // TOC
  const showToc = bpd.showToc === true;
  const tocItems = showToc ? extractTocItems(bodyHtmlWithIds) : [];
  const tocHtml = tocItems.length > 0 ? `
    <nav class="blog-toc" aria-label="Indice dei contenuti">
      <ol class="blog-toc-list">
        ${tocItems.map(item => `<li class="blog-toc-item blog-toc-level-${item.level}"><a href="#${item.id}" class="blog-toc-link">${item.text}</a></li>`).join('\n        ')}
      </ol>
    </nav>
  ` : '';

  return `<!DOCTYPE html>
<html lang="${post.language || settings?.defaultLanguage || 'it'}" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}">
  <link rel="canonical" href="${baseUrl}${langPrefix}/blog/${post.slug}">
  ${postSiblings.length > 1 ? postSiblings.map(s => {
    const sLang = s.language || settings?.defaultLanguage || 'it';
    const sPrefix = sLang === (settings?.defaultLanguage || 'it') ? '' : `/${sLang}`;
    return `<link rel="alternate" hreflang="${sLang}" href="${baseUrl}${sPrefix}/blog/${s.slug}" />`;
  }).join('\n  ') : ''}
  ${postSiblings.length > 1 ? (() => {
    const defSibling = postSiblings.find(s => (s.language || settings?.defaultLanguage || 'it') === (settings?.defaultLanguage || 'it')) || postSiblings[0];
    return `<link rel="alternate" hreflang="x-default" href="${baseUrl}/blog/${defSibling.slug}" />`;
  })() : ''}
  ${post.seo?.indexable === false ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}

  <meta property="og:title" content="${seoTitle}">
  <meta property="og:description" content="${seoDesc}">
  <meta property="og:url" content="${baseUrl}/blog/${post.slug}">
  <meta property="og:type" content="article">
  ${ogImage ? `<meta property="og:image" content="${ogImage.startsWith('http') ? ogImage : baseUrl + ogImage}">` : ''}
  <meta property="article:published_time" content="${post.published_at || post.created_at}">
  ${(post.categories || []).length > 0 ? (post.categories || []).map(c => `<meta property="article:section" content="${c}">`).join('\n  ') : ''}
  ${(post.authors || []).length > 0 ? (post.authors || []).map(a => `<meta property="article:author" content="${a.name}">`).join('\n  ') : ''}

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${seoTitle}">
  <meta name="twitter:description" content="${seoDesc}">

  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": ogImage ? (ogImage.startsWith('http') ? ogImage : baseUrl + ogImage) : undefined,
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at,
    "author": (post.authors || []).length > 0 ? (post.authors || []).map(a => ({ "@type": "Person", "name": a.name })) : undefined,
    "publisher": { "@type": "Organization", "name": settings?.metaTitle || project?.name },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${baseUrl}/blog/${post.slug}` }
  })}
  </script>

  <link rel="icon" href="${resolveImageUrl(settings?.favicon, project || null, {}, isStatic) || '/favicon.ico'}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
  ${coverUrl ? `<link rel="preload" as="image" href="${coverUrl}" fetchpriority="high">` : ''}
  <style>
    :root {
      --primary: ${pColor};
      --font-main: '${font}', sans-serif;
      --global-h1-fs: ${toPx(settings?.typography?.h1Size, '2.5rem')};
      --global-h2-fs: ${toPx(settings?.typography?.h2Size, '1.75rem')};
      --global-h3-fs: ${toPx(settings?.typography?.h3Size, '1.35rem')};
      --global-h4-fs: ${toPx(settings?.typography?.h4Size, '1.05rem')};
      --global-body-fs: ${toPx(settings?.typography?.bodySize, '1rem')};
    }
    ${settings?.responsive?.tablet?.typography ? `@media (max-width: 1024px) { :root {
      ${settings.responsive.tablet.typography.h1Size ? `--global-h1-fs: ${toPx(settings.responsive.tablet.typography.h1Size)};` : ''}
      ${settings.responsive.tablet.typography.h2Size ? `--global-h2-fs: ${toPx(settings.responsive.tablet.typography.h2Size)};` : ''}
      ${settings.responsive.tablet.typography.h3Size ? `--global-h3-fs: ${toPx(settings.responsive.tablet.typography.h3Size)};` : ''}
      ${settings.responsive.tablet.typography.bodySize ? `--global-body-fs: ${toPx(settings.responsive.tablet.typography.bodySize)};` : ''}
    } }` : ''}
    ${settings?.responsive?.mobile?.typography ? `@media (max-width: 768px) { :root {
      ${settings.responsive.mobile.typography.h1Size ? `--global-h1-fs: ${toPx(settings.responsive.mobile.typography.h1Size)};` : ''}
      ${settings.responsive.mobile.typography.h2Size ? `--global-h2-fs: ${toPx(settings.responsive.mobile.typography.h2Size)};` : ''}
      ${settings.responsive.mobile.typography.h3Size ? `--global-h3-fs: ${toPx(settings.responsive.mobile.typography.h3Size)};` : ''}
      ${settings.responsive.mobile.typography.bodySize ? `--global-body-fs: ${toPx(settings.responsive.mobile.typography.bodySize)};` : ''}
    } }` : ''}
    body { font-family: var(--font-main); background: ${themeBg}; color: ${themeText}; font-size: var(--global-body-fs); }
    article, article * { font-family: inherit; box-sizing: border-box; }
    .blog-body p { font-size: var(--global-body-fs); margin-bottom: 0.6em; line-height: 1.7; }
    .blog-body br { display: block; content: ''; margin-top: 0.3em; }
    .blog-body h1 { font-size: var(--global-h1-fs); font-weight: 800; margin: 0 0 0.4em; line-height: 1.1; letter-spacing: -0.02em; }
    .blog-body h2 { font-size: var(--global-h2-fs); font-weight: 700; margin: 0 0 0.3em; line-height: 1.2; }
    .blog-body h3 { font-size: var(--global-h3-fs); font-weight: 600; margin: 0 0 0.25em; line-height: 1.2; }
    .blog-body h4 { font-size: var(--global-h4-fs); font-weight: 600; margin: 0 0 0.2em; line-height: 1.2; }
    .blog-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.2em; }
    .blog-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.2em; }
    .blog-body ul ul { list-style-type: circle; }
    .blog-body ul ul ul { list-style-type: square; }
    .blog-body li { font-size: var(--global-body-fs); margin-bottom: 0.4em; display: list-item; }
    .blog-body blockquote { border-left: 3px solid ${pColor}; padding-left: 1em; margin: 1.5em 0; opacity: 0.8; font-style: italic; }
    .blog-body img:not([data-inline-image]) { max-width: 100%; border-radius: 12px; margin: 1.5em 0; }
    .blog-body a { color: ${pColor}; text-decoration: underline; }
    .blog-body strong { font-weight: 600; }
    .blog-body [data-inline-image-wrap] { display: flex; margin: 1.5em 0; }
    .blog-body [data-inline-image-wrap][data-align="left"] { justify-content: flex-start; }
    .blog-body [data-inline-image-wrap][data-align="center"] { justify-content: center; }
    .blog-body [data-inline-image-wrap][data-align="right"] { justify-content: flex-end; }
    .blog-body [data-inline-image] { height: auto; border-radius: 8px; display: block; max-width: 100%; }
    .blog-toc { background: color-mix(in srgb, ${themeText} 4%, transparent); border-radius: 12px; padding: 16px 20px; margin: 0 0 40px; }
    .blog-toc-title { display: none; }
    .blog-toc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .blog-toc-item { margin: 0; }
    .blog-toc-level-3 { padding-left: 12px; }
    .blog-toc-level-4 { padding-left: 24px; }
    .blog-toc-link { font-size: 0.85rem; color: inherit; text-decoration: none; opacity: 0.7; transition: opacity 0.15s; }
    .blog-toc-link:hover { opacity: 1; }
    @media (max-width: 768px) { article { padding-left: ${bodyPaddingXMobile}px !important; padding-right: ${bodyPaddingXMobile}px !important; padding-top: ${bodyPaddingYMobile}px !important; padding-bottom: ${bodyPaddingYMobile}px !important; } }
  </style>
</head>
<body>
  ${navHtml}

  ${coverUrl && coverMode === 'hero' ? `<div style="width: 100%; aspect-ratio: 3/1; overflow: hidden;"><img src="${coverUrl}" alt="${post.title}" loading="eager" fetchpriority="high" style="width: 100%; height: 100%; object-fit: cover;" /></div>` : ''}

  <article style="${bodyMaxWidthCss} margin: 0 auto; padding: ${bodyPaddingY}px ${bodyPaddingX}px;">
    ${coverUrl && coverMode === 'contained' ? `<div style="border-radius: 16px; overflow: hidden; margin-bottom: 40px; aspect-ratio: 3/1;"><img src="${coverUrl}" alt="${post.title}" loading="eager" fetchpriority="high" style="width: 100%; height: 100%; object-fit: cover;" /></div>` : ''}

    ${(post.categories || []).length > 0 ? `<div style="margin-bottom: 12px;"><span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">${(post.categories || []).join(' · ')}</span></div>` : ''}

    <h1 style="font-size: var(--global-h1-fs); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 16px;">${post.title}</h1>

    ${post.excerpt ? `<p style="font-size: 1.15rem; opacity: 0.5; line-height: 1.6; margin-bottom: 24px;">${post.excerpt}</p>` : ''}

    <div style="display: flex; align-items: center; gap: 12px; font-size: 15px; opacity: 0.5; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 1px solid color-mix(in srgb, ${themeText} 8%, transparent);">
      ${(post.authors || []).length > 0 ? `<span style="font-weight: 600;">${(post.authors || []).map(a => a.name).join(', ')}</span><span>&middot;</span>` : ''}
      <span>${date}</span>
    </div>

    ${tocHtml}

    ${bodyHtml}
  </article>

  ${footerHtml}
</body>
</html>`;
}

/**
 * Generate author filter pages (/blog/author/[slug].html)
 * Returns a map of slug -> html for each unique author
 */
export function generateBlogAuthorPages(
  posts: BlogPost[],
  allPages: Page[],
  project: Project,
  langPrefix: string = '',
  siteGlobals: SiteGlobal[] = []
): Record<string, string> {
  const publishedPosts = posts.filter(p => p.status === 'published');
  const allAuthors = [...new Set(publishedPosts.flatMap(p => p.authors || []).filter(Boolean))];
  const pages: Record<string, string> = {};

  for (const author of allAuthors) {
    const slug = author.name.toLowerCase().replace(/\s+/g, '-');
    const filtered = publishedPosts.filter(p => (p.authors || []).some(a => a.name === author.name));
    const settings = (project?.settings || {}) as ProjectSettings;
    const font = settings?.fontFamily || 'Outfit';
    const pColor = settings?.primaryColor || '#3b82f6';
    const baseUrl = getProjectDomain(project);
    const siteName = settings?.metaTitle || project?.name || '';
    const appearance = settings?.appearance || 'light';
    const isDark = appearance === 'dark';
    const themeBg = isDark ? (settings?.themeColors?.dark?.bg || '#0c0c0e') : (settings?.themeColors?.light?.bg || '#ffffff');
    const themeText = isDark ? (settings?.themeColors?.dark?.text || '#ffffff') : (settings?.themeColors?.light?.text || '#000000');

    // Render nav and footer from siteGlobals
    let authorNavHtml = '';
    let authorFooterHtml = '';
    {
      const { renderToStaticMarkup } = require('react-dom/server');
      const pageLang = langPrefix.replace(/^\//, '') || settings?.defaultLanguage || 'it';
      const navGlobal = siteGlobals.find(g => g.language === pageLang && g.type === 'navigation');
      const footerGlobal = siteGlobals.find(g => g.language === pageLang && g.type === 'footer');
      if (navGlobal) {
        const navBlock = { id: 'global-nav', type: 'navigation', content: navGlobal.content, style: navGlobal.style };
        authorNavHtml = renderBlock(navBlock as any, allPages, project, renderToStaticMarkup);
      }
      if (footerGlobal) {
        const footerBlock = { id: 'global-footer', type: 'footer', content: { ...footerGlobal.content, _navLogoFallback: footerGlobal.content?.logoImage ? undefined : navGlobal?.content?.logoImage, _language: pageLang }, style: footerGlobal.style };
        authorFooterHtml = renderBlock(footerBlock as any, allPages, project, renderToStaticMarkup);
      }
    }

    const postCards = filtered.map(post => {
      const date = new Date(post.published_at || post.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
      const coverUrl = post.cover_image ? resolveImageUrl(post.cover_image, project, {}, true) : '';
      return `
        <article class="blog-card">
          <a href="${langPrefix}/blog/${post.slug}" class="block group">
            <div class="aspect-[16/10] rounded-2xl overflow-hidden mb-4" style="background: color-mix(in srgb, ${themeText} 5%, transparent);">
              ${coverUrl ? `<img src="${coverUrl}" alt="${post.title}" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />` : `<div class="w-full h-full flex items-center justify-center"><svg width="32" height="32" fill="none" stroke="${themeText}" stroke-width="1.5" opacity="0.15"><rect x="4" y="4" width="24" height="24" rx="4"/></svg></div>`}
            </div>
            <div class="space-y-2">
              ${(post.categories || []).length > 0 ? `<span class="text-xs font-bold uppercase tracking-wider" style="color: ${pColor};">${(post.categories || []).join(' · ')}</span>` : ''}
              <h2 class="text-lg font-bold leading-tight transition-colors group-hover:opacity-80">${post.title}</h2>
              ${post.excerpt ? `<p class="text-sm leading-relaxed" style="opacity: 0.6;">${post.excerpt}</p>` : ''}
              <div class="flex items-center gap-3 text-xs" style="opacity: 0.4;">
                <span>${(post.authors || []).map(a => `<a href="/blog/author/${a.name.toLowerCase().replace(/\s+/g, '-')}" style="text-decoration:none;color:inherit;">${a.name}</a>`).join(', ')}</span>
                <span>&middot;</span>
                <span>${date}</span>
              </div>
            </div>
          </a>
        </article>
      `;
    }).join('\n');

    pages[slug] = `<!DOCTYPE html>
<html lang="${settings?.defaultLanguage || 'it'}" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Articoli di ${author} — ${siteName}</title>
  <meta name="description" content="Tutti gli articoli scritti da ${author}">
  <link rel="canonical" href="${baseUrl}/blog/author/${slug}">
  <link rel="icon" href="${resolveImageUrl(settings?.favicon, project || null, {}, true) || '/favicon.ico'}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
  <style>
    :root {
      --primary: ${pColor};
      --font-main: '${font}', sans-serif;
      --global-h1-fs: ${toPx(settings?.typography?.h1Size, '2.5rem')};
      --global-h2-fs: ${toPx(settings?.typography?.h2Size, '1.75rem')};
      --global-h3-fs: ${toPx(settings?.typography?.h3Size, '1.35rem')};
      --global-body-fs: ${toPx(settings?.typography?.bodySize, '1rem')};
    }
    ${settings?.responsive?.mobile?.typography ? `@media (max-width: 768px) { :root {
      ${settings.responsive.mobile.typography.h1Size ? `--global-h1-fs: ${toPx(settings.responsive.mobile.typography.h1Size)};` : ''}
      ${settings.responsive.mobile.typography.bodySize ? `--global-body-fs: ${toPx(settings.responsive.mobile.typography.bodySize)};` : ''}
    } }` : ''}
    .blog-page, .blog-page * { font-family: inherit; box-sizing: border-box; }
    body { font-family: var(--font-main); background: ${themeBg}; color: ${themeText}; font-size: var(--global-body-fs); }
    a { color: inherit; text-decoration: none; }
  </style>
</head>
<body>
  ${authorNavHtml}
  <div class="blog-page" style="max-width: 1100px; margin: 0 auto; padding: 60px 24px;">
    <div style="margin-bottom: 40px;">
      <a href="${langPrefix}/blog" style="font-size: 12px; font-weight: 600; opacity: 0.4; margin-bottom: 12px; display: inline-block;">&larr; Torna al blog</a>
      <h1 style="font-size: var(--global-h1-fs); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;">Articoli di ${author}</h1>
      <p style="margin-top: 8px; opacity: 0.5; font-size: 14px;">${filtered.length} ${filtered.length === 1 ? 'articolo' : 'articoli'}</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px;">
      ${postCards}
    </div>
  </div>
  ${authorFooterHtml}
</body>
</html>`;
  }

  return pages;
}
