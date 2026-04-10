import 'server-only';
import { Block, Page, Project, ProjectSettings, SiteGlobal } from '@/types/editor';
import React from 'react';
import { toPx } from '@/lib/utils';
import { generateBlockCSS, computeCommonVars } from '@/lib/responsive-utils';
import { resolveImageUrl } from '@/lib/image-utils';
import { getProjectDomain } from '@/lib/url-utils';

export function generateStaticHtml(page: Page, allPages: Page[] = [], project?: Project, siteGlobals: SiteGlobal[] = [], blogPosts?: any[]): string {
  const { renderToStaticMarkup } = require('react-dom/server');

  const settings = (project?.settings || {}) as ProjectSettings;
  const defLang = settings.defaultLanguage || 'it';
  const pageLang = page.language || defLang;

  // Build the full block list: inject nav/footer from siteGlobals around page content
  const navGlobal = siteGlobals.find(g => g.language === pageLang && g.type === 'navigation');
  const footerGlobal = siteGlobals.find(g => g.language === pageLang && g.type === 'footer');
  const navBlock: Block | undefined = navGlobal
    ? { id: 'global-nav', type: 'navigation', content: navGlobal.content, style: navGlobal.style }
    : undefined;
  const footerBlock: Block | undefined = footerGlobal
    ? {
        id: 'global-footer',
        type: 'footer',
        content: {
          ...footerGlobal.content,
          _navLogoFallback: footerGlobal.content?.logoImage ? undefined : navGlobal?.content?.logoImage,
          _language: pageLang,
        },
        style: footerGlobal.style,
      }
    : undefined;
  const pageContent = page.blocks.filter(b => b.type !== 'navigation' && b.type !== 'footer');
  const allBlocksToRender: Block[] = [
    ...(navBlock ? [navBlock] : []),
    ...pageContent,
    ...(footerBlock ? [footerBlock] : []),
  ];

  // Compute common CSS variables for deduplication
  const commonVars = computeCommonVars(allBlocksToRender, project);
  const commonVarsCss = Object.entries(commonVars).map(([k, v]) => `${k}:${v};`).join('');

  const blocksHtml = allBlocksToRender.map(block => renderBlock(block, allPages, project, renderToStaticMarkup, commonVars, blogPosts, pageLang)).join('\n');
  const font = settings.fontFamily || 'Outfit';
  const pColor = settings.primaryColor || '#3b82f6';
  const sColor = settings.secondaryColor || '#10b981';
  const floating = settings.floatingCTA;

  const bDetails = settings.businessDetails || {};
  const bType = settings.businessType || 'LocalBusiness';

  const baseUrl = getProjectDomain(project);
  const pagePath = page.slug === 'home' ? '' : `/${page.slug}`;
  const langSubpath = pageLang === defLang ? '' : `/${pageLang}`;
  const fullPageUrl = `${baseUrl}${langSubpath}${pagePath}`;

  // Find all variants: prefer translations_group_id, fallback to slug matching
  const allVariants = allPages.filter(p => {
    if (page.translations_group_id && p.translations_group_id) {
      return page.translations_group_id === p.translations_group_id;
    }
    if (page.slug === 'home' && p.slug === 'home') return true;
    return p.slug === page.slug;
  });

  // x-default points to the default-language variant
  const defaultVariant = allVariants.find(v => (v.language || defLang) === defLang) || allVariants[0];
  const xDefaultPath = defaultVariant?.slug === 'home' ? '' : `/${defaultVariant?.slug || page.slug}`;

  return `
<!DOCTYPE html>
<html lang="${pageLang}" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="canonical" href="${fullPageUrl}">

    ${allVariants.map(v => {
      const vLang = v.language || defLang;
      const vSubpath = vLang === defLang ? '' : `/${vLang}`;
      const vPath = v.slug === 'home' ? '' : `/${v.slug}`;
      return `<link rel="alternate" hreflang="${vLang}" href="${baseUrl}${vSubpath}${vPath}" />`;
    }).join('\n    ')}
    <link rel="alternate" hreflang="x-default" href="${baseUrl}${xDefaultPath}" />

    <title>${page.seo?.title || settings?.metaTitle || page.title}</title>
    <meta name="description" content="${page.seo?.description || settings?.metaDescription || ''}">
    <meta name="author" content="${bDetails?.businessName || project?.name || 'Siti Vetrina'}">
    
    <!-- Robots -->
    <meta name="robots" content="${page.seo?.indexable === false ? 'noindex, nofollow' : 'index, follow'}">
    <meta name="googlebot" content="${page.seo?.indexable === false ? 'noindex, nofollow' : 'index, follow'}">
    <meta name="bingbot" content="${page.seo?.indexable === false ? 'noindex, nofollow' : 'index, follow'}">

    <!-- Open Graph -->
    <meta property="og:site_name" content="${settings?.metaTitle || 'Sito Vetrina'}">
    <meta property="og:title" content="${page.seo?.title || settings?.metaTitle || page.title}">
    <meta property="og:description" content="${page.seo?.description || settings?.metaDescription || ''}">
    <meta property="og:url" content="${fullPageUrl}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${(pageLang === 'en' ? 'en_US' : pageLang === 'it' ? 'it_IT' : 'it_IT')}">
    ${(() => {
      const ogImageUrl = resolveImageUrl(page.seo?.image || settings?.metaImage, project || null, {}, true);
      if (!ogImageUrl) return '';
      const v = project?.last_published_at ? `?v=${new Date(project.last_published_at).getTime()}` : '';
      const fullOgUrl = ogImageUrl.startsWith('http') ? ogImageUrl : `${baseUrl}${ogImageUrl}${v}`;
      const isPng = fullOgUrl.toLowerCase().includes('.png');
      const isJpg = fullOgUrl.toLowerCase().includes('.jpg') || fullOgUrl.toLowerCase().includes('.jpeg');
      const contentType = isPng ? 'image/png' : isJpg ? 'image/jpeg' : 'image/png';

      return `
    <meta property="og:image" content="${fullOgUrl}">
    <meta property="og:image:secure_url" content="${fullOgUrl}">
    <meta property="og:image:type" content="${contentType}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${page.seo?.title || settings?.metaTitle || page.title}">
    <meta name="twitter:description" content="${page.seo?.description || settings?.metaDescription || ''}">
    <meta name="twitter:image" content="${fullOgUrl}">
      `;
    })()}

    <link rel="icon" href="${resolveImageUrl(settings?.favicon, project || null, {}, true) || '/favicon.ico'}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    ${(() => {
      // Preload the first above-fold image for faster LCP.
      // Priority: hero background → first promo item image → first image-text image.
      const heroBlock = allBlocksToRender.find((b: any) => b.type === 'hero');
      const heroImg = heroBlock?.content?.backgroundImage;
      if (heroImg) {
        const resolved = resolveImageUrl(heroImg, project || null, {}, true);
        return `<link rel="preload" as="image" href="${resolved}" fetchpriority="high">`;
      }
      const promoBlock = allBlocksToRender.find((b: any) => b.type === 'promo');
      const promoImg = promoBlock?.content?.items?.[0]?.image;
      if (promoImg) {
        const resolved = resolveImageUrl(promoImg, project || null, {}, true);
        return `<link rel="preload" as="image" href="${resolved}" fetchpriority="high">`;
      }
      const imageTextBlock = allBlocksToRender.find((b: any) => b.type === 'image-text' || b.type === 'imagetext');
      const imageTextImg = imageTextBlock?.content?.backgroundImage || imageTextBlock?.content?.image;
      if (imageTextImg) {
        const resolved = resolveImageUrl(imageTextImg, project || null, {}, true);
        return `<link rel="preload" as="image" href="${resolved}" fetchpriority="high">`;
      }
      return '';
    })()}
    
    ${(() => {
      if (!bDetails?.address && !bDetails?.phone && !bDetails?.businessName) return '';
      
      return `
    <script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": bType,
      "name": bDetails?.businessName || project?.name || "Sito Vetrina",
      "url": baseUrl,
      ...(bDetails.address || bDetails.city || bDetails.postalCode || bDetails.country ? {
        "address": {
          "@type": "PostalAddress",
          "streetAddress": bDetails.address || "",
          "addressLocality": bDetails.city || "",
          "postalCode": bDetails.postalCode || "",
          "addressCountry": bDetails.country || ""
        }
      } : {}),
      ...(bDetails.phone ? { "telephone": bDetails.phone } : {}),
      ...(bDetails.email ? { "email": bDetails.email } : {}),
      ...(settings?.logo ? { "image": resolveImageUrl(settings?.logo, project || null, {}, true) || "" } : {}),
      ...(bType === 'Restaurant' && bDetails.servesCuisine ? { "servesCuisine": bDetails.servesCuisine } : {})
    }, null, 2)}
    </script>
      `;
    })()}

    <link rel="stylesheet" href="/assets/styles.css">
    <style>
        :root {
            --primary: ${pColor};
            --secondary: ${sColor};
            --font-main: '${font}', sans-serif;
            --global-h1-fs: ${toPx(settings?.typography?.h1Size, '4rem')};
            --global-h2-fs: ${toPx(settings?.typography?.h2Size, '3rem')};
            --global-h3-fs: ${toPx(settings?.typography?.h3Size, '2rem')};
            --global-h4-fs: ${toPx(settings?.typography?.h4Size, '1.5rem')};
            --global-body-fs: ${toPx(settings?.typography?.bodySize, '1rem')};
            ${commonVarsCss}
        }
        ${settings?.responsive?.tablet?.typography ? `
        @media (max-width: 1024px) {
            :root {
                ${settings.responsive.tablet.typography.h1Size ? `--global-h1-fs: ${toPx(settings.responsive.tablet.typography.h1Size)};` : ''}
                ${settings.responsive.tablet.typography.h2Size ? `--global-h2-fs: ${toPx(settings.responsive.tablet.typography.h2Size)};` : ''}
                ${settings.responsive.tablet.typography.h3Size ? `--global-h3-fs: ${toPx(settings.responsive.tablet.typography.h3Size)};` : ''}
                ${settings.responsive.tablet.typography.h4Size ? `--global-h4-fs: ${toPx(settings.responsive.tablet.typography.h4Size)};` : ''}
                ${settings.responsive.tablet.typography.bodySize ? `--global-body-fs: ${toPx(settings.responsive.tablet.typography.bodySize)};` : ''}
            }
        }` : ''}
        ${settings?.responsive?.mobile?.typography ? `
        @media (max-width: 768px) {
            :root {
                ${settings.responsive.mobile.typography.h1Size ? `--global-h1-fs: ${toPx(settings.responsive.mobile.typography.h1Size)};` : ''}
                ${settings.responsive.mobile.typography.h2Size ? `--global-h2-fs: ${toPx(settings.responsive.mobile.typography.h2Size)};` : ''}
                ${settings.responsive.mobile.typography.h3Size ? `--global-h3-fs: ${toPx(settings.responsive.mobile.typography.h3Size)};` : ''}
                ${settings.responsive.mobile.typography.h4Size ? `--global-h4-fs: ${toPx(settings.responsive.mobile.typography.h4Size)};` : ''}
                ${settings.responsive.mobile.typography.bodySize ? `--global-body-fs: ${toPx(settings.responsive.mobile.typography.bodySize)};` : ''}
            }
        }` : ''}
        * { font-family: inherit; }
        body { font-family: var(--font-main); }
        .bg-primary { background-color: var(--primary); }
        .bg-secondary { background-color: var(--secondary); }
        .text-primary { color: var(--primary); }
        .text-secondary { color: var(--secondary); }
        .border-primary { border-color: var(--primary); }
        
        .hover-lift { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .hover-lift:hover { transform: translateY(-10px) scale(1.02); }
        
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-in-up 0.8s ease-out forwards; }

        @keyframes pulse-white {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-pulse-slow { animation: pulse-white 2s infinite; }
        
        /* --- Block Animations --- */
        [data-siti-anim] {
            opacity: 0;
            transition-property: opacity, transform, filter;
            transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
            transition-duration: var(--siti-anim-duration, 0.8s);
            transition-delay: var(--siti-anim-delay, 0s);
            will-change: transform, opacity;
            backface-visibility: hidden;
        }

        [data-siti-anim="none"] {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
            will-change: auto !important;
        }

        [data-siti-anim="slide-up"]    { transform: translate3d(0, 30px, 0); }
        [data-siti-anim="slide-down"]  { transform: translate3d(0, -30px, 0); }
        [data-siti-anim="slide-left"]  { transform: translate3d(30px, 0, 0); }
        [data-siti-anim="slide-right"] { transform: translate3d(-30px, 0, 0); }
        [data-siti-anim="zoom-in"]     { transform: scale3d(0.95, 0.95, 1); }

        [data-siti-anim].siti-anim-active {
            opacity: 1 !important;
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1) !important;
        }

        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
            background: ${settings?.appearance === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}; 
            border-radius: 10px; 
        }
        * { scrollbar-width: thin; scrollbar-color: ${settings?.appearance === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'} transparent; }

        .no-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }

        .rt-content p { margin: 0; padding: 0; line-height: inherit; }
        .rt-content p + p { margin-top: 0.5em; }
        .rt-content p:empty { display: none !important; }
        .rt-content ul, .rt-content ol { margin: 0.4em 0 !important; padding: 0 !important; list-style-position: inside !important; display: block !important; }
        .rt-content li { margin: 0.25em 0 !important; display: list-item !important; }
        .rt-content li > p { display: inline !important; }
        .rt-content ul { list-style-type: disc !important; }
        .rt-content ol { list-style-type: decimal !important; }
        .rt-content ul ul, .rt-content ul ol, .rt-content ol ul, .rt-content ol ol { margin: 0.25em 0 !important; }
        .rt-content strong { font-weight: 700; }
        .rt-content em { font-style: italic; }
        .rt-content u { text-decoration: underline; }
        .rt-content a { color: inherit; text-decoration: underline; }

        [data-menu][data-open="true"] {
            opacity: 1 !important;
            transform: translateY(0) !important;
            vertical-align: top !important;
            pointer-events: auto !important;
        }

        .img-ready { background: transparent !important; }
    </style>
    ${settings?.customScriptsHead || ''}
</head>
<body class="antialiased min-h-screen" style="background-color: ${settings?.appearance === 'dark' ? (settings?.themeColors?.dark?.bg || '#0c0c0e') : (settings?.themeColors?.light?.bg || '#ffffff')}; color: ${settings?.appearance === 'dark' ? (settings?.themeColors?.dark?.text || '#ffffff') : (settings?.themeColors?.light?.text || '#000000')};">
    <main>
        ${blocksHtml}
    </main>

    ${floating?.enabled ? `
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 md:bottom-10 md:left-auto md:right-10 z-[1000] animate-fade-up">
        <a href="${floating.url}" class="px-8 py-4 rounded-full text-white font-black text-lg shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-3 border-4 border-white active:scale-95 transition-all no-underline backdrop-blur-sm" 
           style="background-color: ${floating.theme === 'secondary' ? sColor : pColor};">
            <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse-slow"></div>
            ${floating.label}
        </a>
    </div>
    ` : ''}

    <script>var _hs=function(){var ns=document.querySelectorAll('nav.fixed'),sc=window.scrollY>20;ns.forEach(function(n){if(sc){n.style.background='var(--block-bg)';n.style.boxShadow='0 10px 30px -10px rgba(0,0,0,0.1)';n.style.backdropFilter='blur(10px)';n.style.paddingTop='12px';n.style.paddingBottom='12px';}else{var t=n.getAttribute('data-transparent')==='true';n.style.background=t?'transparent':'var(--block-bg)';n.style.boxShadow='none';n.style.backdropFilter='none';n.style.paddingTop='var(--nav-padding)';n.style.paddingBottom='var(--nav-padding)';}});};window.addEventListener('load',_hs);_hs();document.addEventListener('click',function(e){var b=e.target.closest('[data-menu-toggle]');if(!b)return;var n=b.closest('nav'),m=n?n.querySelector('[data-menu]'):null;if(!m)return;var o=m.getAttribute('data-open')==='true',s=!o;m.setAttribute('data-open',s);b.setAttribute('data-open',s);});var _vh=window.innerHeight,_ao=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var el=e.target;requestAnimationFrame(function(){el.classList.add('siti-anim-active');});_ao.unobserve(el);}});},{threshold:0.05,rootMargin:'0px 0px -60px 0px'});document.querySelectorAll('[data-siti-anim]').forEach(function(el){var a=el.getAttribute('data-siti-anim');if(a==='none'){el.classList.add('siti-anim-active');return;}var r=el.getBoundingClientRect();if(r.top<_vh&&r.bottom>0){el.classList.add('siti-anim-active');}else{_ao.observe(el);}});</script>
    ${settings?.customScriptsBody || ''}
</body>
</html>
  `.trim();
}

import { BLOCK_DEFINITIONS } from './block-definitions';

const StaticRegistry: Record<string, React.FC<any>> = Object.entries(BLOCK_DEFINITIONS).reduce((acc, [type, def]) => {
  if (def.visual) acc[type] = def.visual;
  return acc;
}, {} as Record<string, React.FC<any>>);

export function renderBlock(block: Block, allPages: Page[], project: Project | undefined, renderToStaticMarkup: any, commonVars?: Record<string, string>, blogPosts?: any[], pageLang?: string): string {
  const { type } = block;
  const blockId = `block-${block.id.substring(0, 8)}`;
  const responsiveCss = generateBlockCSS(blockId, block, project, commonVars);
  const styleWrapper = `<style>${responsiveCss}</style>`;
  const blockWrapper = (inner: string) => `${styleWrapper}<div id="${blockId}">${inner}</div>`;

  const Component = StaticRegistry[type];
  if (!Component) return `<!-- Block type ${type} ignored in static generation -->`;

  // Inject page language into blog-list blocks for multilingual filtering
  const effectiveBlock = type === 'blog-list' && pageLang
    ? { ...block, content: { ...block.content, language: pageLang } }
    : block;

  return blockWrapper(renderToStaticMarkup(
    <Component
      content={effectiveBlock.content}
      block={effectiveBlock}
      project={project}
      allPages={allPages}
      isStatic={true}
      imageMemoryCache={{}}
      allBlogPosts={blogPosts || []}
      language={pageLang}
    />
  ));
}

export function generateSitemap(pages: Page[], project: Project, blogPosts?: any[]): string {
  const baseUrl = getProjectDomain(project);
  const defLang = project.settings?.defaultLanguage || 'it';
  const now = new Date().toISOString().split('T')[0];

  const urls = pages
    .filter(page => page?.seo?.indexable !== false)
    .map(page => {
      const pageLang = page.language || defLang;
      const langSubpath = pageLang === defLang ? '' : `/${pageLang}`;
      const pagePath = page.slug === 'home' ? '' : `/${page.slug}`;
      const url = `${baseUrl}${langSubpath}${pagePath}`;

      const allVariants = pages.filter(p => {
        if (page.translations_group_id && p.translations_group_id) {
          return page.translations_group_id === p.translations_group_id;
        }
        if (page.slug === 'home' && p.slug === 'home') return true;
        return p.slug === page.slug;
      });
      const alternateLinks = allVariants.map(v => {
        const vLang = v.language || defLang;
        const vSubpath = vLang === defLang ? '' : `/${vLang}`;
        const vPath = v.slug === 'home' ? '' : `/${v.slug}`;
        return `    <xhtml:link rel="alternate" hreflang="${vLang}" href="${baseUrl}${vSubpath}${vPath}" />`;
      }).join('\n');

      const defaultVar = allVariants.find(v => (v.language || defLang) === defLang) || allVariants[0];
      const xDefaultPath = defaultVar?.slug === 'home' ? '' : `/${defaultVar?.slug || page.slug}`;
      const xDefaultLink = `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${xDefaultPath}" />`;

      return `
  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.slug === 'home' ? '1.0' : '0.8'}</priority>
${alternateLinks}
${xDefaultLink}
  </url>`;
    }).join('');

  // Blog post URLs
  const blogUrls = (blogPosts || [])
    .filter(p => p.status === 'published' && p.seo?.indexable !== false)
    .map(post => {
      const postLang = post.language || defLang;
      const langPrefix = postLang === defLang ? '' : `/${postLang}`;
      return `
  <url>
    <loc>${baseUrl}${langPrefix}/blog/${post.slug}</loc>
    <lastmod>${post.updated_at ? post.updated_at.split('T')[0] : now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join('');

  // Blog listing URLs per language (one entry per language that has published posts)
  const siteLanguages = project.settings?.languages || [defLang];
  const blogListUrls = (blogPosts && blogPosts.length > 0)
    ? siteLanguages
        .filter(lang => (blogPosts || []).some((p: any) => (p.language || defLang) === lang && p.status === 'published'))
        .map(lang => {
          const langPrefix = lang === defLang ? '' : `/${lang}`;
          return `
  <url>
    <loc>${baseUrl}${langPrefix}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }).join('')
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}${blogListUrls}${blogUrls}
</urlset>`.trim();
}

export function generateRobotsTxt(project: Project, pages: Page[] = []): string {
  const baseUrl = getProjectDomain(project);
  const disallows = pages
    .filter(p => p?.seo?.indexable === false)
    .map(p => `Disallow: /${p.slug === 'home' ? '' : p.slug}`)
    .join('\n');

  return `
User-agent: *
Allow: /
${disallows}

Sitemap: ${baseUrl}/sitemap.xml
`.trim();
}
