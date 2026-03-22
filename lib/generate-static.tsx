import 'server-only';
import { Block, Page, Project } from '@/types/editor';
import React from 'react';
import { Navigation } from '@/components/blocks/visual/navigation/Navigation';
import { Hero } from '@/components/blocks/visual/Hero';
import { TextBlock } from '@/components/blocks/visual/TextBlock';
import { FooterBlock } from '@/components/blocks/visual/FooterBlock';
import { toPx } from '@/lib/utils';
import { generateBlockCSS } from '@/lib/responsive-utils';
import { resolveImageUrl } from '@/lib/image-utils';
import { getProjectDomain } from '@/lib/url-utils';

export function generateStaticHtml(page: Page, allPages: Page[] = [], project?: Project): string {
  const { renderToStaticMarkup } = require('react-dom/server');
  const blocksHtml = page.blocks.map(block => renderBlock(block, allPages, project, renderToStaticMarkup)).join('\n');
  const font = project?.settings?.fontFamily || 'Outfit';
  const pColor = project?.settings?.primaryColor || '#3b82f6';
  const sColor = project?.settings?.secondaryColor || '#10b981';
  const floating = project?.settings?.floatingCTA;

  const baseUrl = getProjectDomain(project);
  return `
<!DOCTYPE html>
<html lang="it" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="canonical" href="${baseUrl}${page.slug === 'home' ? '' : '/' + page.slug}">
    
    <title>${page.seo?.title || project?.settings?.metaTitle || page.title}</title>
    <meta name="description" content="${page.seo?.description || project?.settings?.metaDescription || ''}">
    
    <!-- Open Graph -->
    <meta property="og:site_name" content="${project?.settings?.metaTitle || 'Sito Vetrina'}">
    <meta property="og:title" content="${page.seo?.title || project?.settings?.metaTitle || page.title}">
    <meta property="og:description" content="${page.seo?.description || project?.settings?.metaDescription || ''}">
    <meta property="og:url" content="${baseUrl}${page.slug === 'home' ? '' : '/' + page.slug}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="it_IT">
    ${(() => {
      const ogImageUrl = resolveImageUrl(page.seo?.image || project?.settings?.metaImage, project || null, {}, true);
      if (!ogImageUrl) return '';
      // Cache buster to force social crawlers to refresh
      const v = project?.last_published_at ? `?v=${new Date(project.last_published_at).getTime()}` : '';
      const fullOgUrl = `${baseUrl}${ogImageUrl}${v}`;
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
    <meta name="twitter:title" content="${page.seo?.title || project?.settings?.metaTitle || page.title}">
    <meta name="twitter:description" content="${page.seo?.description || project?.settings?.metaDescription || ''}">
    <meta name="twitter:image" content="${fullOgUrl}">
      `;
    })()}

    <link rel="icon" href="${resolveImageUrl(project?.settings?.favicon, project || null, {}, true) || '/favicon.ico'}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --primary: ${pColor};
            --secondary: ${sColor};
            --font-main: '${font}', sans-serif;
        }
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

        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
            background: ${project?.settings?.appearance === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}; 
            border-radius: 10px; 
        }
        * { scrollbar-width: thin; scrollbar-color: ${project?.settings?.appearance === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'} transparent; }

        /* Mobile Menu Visibility */
        [data-menu][data-open="true"] {
            opacity: 1 !important;
            transform: translateY(0) !important;
            vertical-align: top !important;
            pointer-events: auto !important;
        }
    </style>
</head>
<body class="antialiased min-h-screen" style="background-color: ${project?.settings?.appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff')}; color: ${project?.settings?.appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000')};">
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

    <script>
      // Navigation Mobile Menu Toggle
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-menu-toggle]');
        if (!btn) return;
        
        const nav = btn.closest('nav');
        const menu = nav ? nav.querySelector('[data-menu]') : null;
        if (!menu) return;

        const isOpen = menu.getAttribute('data-open') === 'true';
        const nextState = !isOpen;
        
        menu.setAttribute('data-open', nextState);
        btn.setAttribute('data-open', nextState);
      });
    </script>
</body>
</html>
  `.trim();
}

const StaticRegistry: Record<string, React.FC<any>> = {
  navigation: Navigation,
  hero: Hero,
  text: TextBlock,
  footer: FooterBlock,
};

function renderBlock(block: Block, allPages: Page[], project: Project | undefined, renderToStaticMarkup: any): string {
  const { type, content } = block;
  const blockId = `block-${block.id.substring(0, 8)}`;

  // Generate responsive CSS using the new unified utility
  const responsiveCss = generateBlockCSS(blockId, block, project);
  const styleWrapper = `<style>${responsiveCss}</style>`;
  const isNav = type === 'navigation';
  const blockWrapper = (inner: string) => `${styleWrapper}<div id="${blockId}" class="w-full transition-all duration-500">${inner}</div>`;
  
  const Component = StaticRegistry[type];
  
  if (!Component) {
    return `<!-- Block type ${type} ignored in static generation -->`;
  }

  return blockWrapper(renderToStaticMarkup(
    <Component 
      content={content} 
      block={block} 
      project={project} 
      allPages={allPages}
      isStatic={true}
      imageMemoryCache={{}}
    />
  ));
}

export function generateSitemap(pages: Page[], project: Project): string {
  const baseUrl = getProjectDomain(project);
  const now = new Date().toISOString().split('T')[0];

  const urls = pages.map(page => {
    const url = page.slug === 'home' ? baseUrl : `${baseUrl}/${page.slug}`;
    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.slug === 'home' ? '1.0' : '0.8'}</priority>
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`.trim();
}

export function generateRobotsTxt(project: Project): string {
  const baseUrl = getProjectDomain(project);
  return `
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`.trim();
}
