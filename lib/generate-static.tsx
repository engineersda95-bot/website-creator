import 'server-only';
import { Block, Page, Project } from '@/types/editor';
import React from 'react';
// We'll use require later inside the function to avoid Next.js warnings/errors
// import { renderToStaticMarkup } from 'react-dom/server';
import { NavView } from '@/components/blocks/NavView';
import { Hero } from '@/components/blocks/Hero';
import { TextBlock } from '@/components/blocks/TextBlock';
import { FooterBlock } from '@/components/blocks/FooterBlock';

const ICON_SVGS: Record<string, string> = {
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
  smile: '<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>',
  award: '<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
  code: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"></path><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"></path>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
  twitter: '<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>'
};

function toPx(value: any, defaultValue: string = ''): string {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'string' && /^\d+$/.test(value)) return `${value}px`;
  return value;
}

export function generateStaticHtml(page: Page, allPages: Page[] = [], project?: Project): string {
  const blocksHtml = page.blocks.map(block => renderBlock(block, allPages, project)).join('\n');
  const font = project?.settings?.fontFamily || 'Outfit';
  const pColor = project?.settings?.primaryColor || '#3b82f6';
  const sColor = project?.settings?.secondaryColor || '#10b981';
  const floating = project?.settings?.floatingCTA;

  return `
<!DOCTYPE html>
<html lang="it" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.seo?.title || page.title}</title>
    <meta name="description" content="${page.seo?.description || ''}">
    ${page.seo?.image ? `<meta property="og:image" content="${page.seo.image}">` : ''}
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
        
        .glass { 
            background: rgba(255, 255, 255, 0.7); 
            backdrop-filter: blur(12px); 
            -webkit-backdrop-filter: blur(12px); 
        }

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
    </style>
</head>
<body class="antialiased min-h-screen" style="background-color: ${project?.settings?.appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff')}; color: ${project?.settings?.appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000')};">
    <main>
        ${blocksHtml}
    </main>

    ${floating?.enabled ? `
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 md:bottom-10 md:left-auto md:right-10 z-[1000] animate-fade-up" style="${!floating?.enabled ? 'display: none;' : ''}">
        <a href="${floating.url}" class="px-8 py-4 rounded-full text-white font-black text-lg shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-3 border-4 border-white active:scale-95 transition-all no-underline backdrop-blur-sm" 
           style="background-color: ${floating.theme === 'secondary' ? sColor : pColor};">
            <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse-slow"></div>
            ${floating.label}
        </a>
    </div>
    ` : ''}

    <script>
      // Navigation Mobile Menu Toggle - Ultra Centralized Version
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-menu-toggle]');
        if (!btn) return;
        
        const nav = btn.closest('nav');
        const menu = nav ? nav.querySelector('[data-menu]') : null;
        if (!menu) return;

        const isOpen = menu.getAttribute('data-open') === 'true';
        const nextState = !isOpen;
        
        // Centralized attribute update - CSS (Tailwind data-selectors) handles the rest
        menu.setAttribute('data-open', nextState);
        btn.setAttribute('data-open', nextState); // Sync button icons too
        
        console.log('Mobile menu (Attr) set to:', nextState);
      });
    </script>
</body>
</html>
  `.trim();
}

function renderBlock(block: Block, allPages: Page[], project?: Project): string {
  const { renderToStaticMarkup } = require('react-dom/server');
  const { type, content, style } = block;
  const pColor = project?.settings?.primaryColor || '#3b82f6';
  const sColor = project?.settings?.secondaryColor || '#10b981';
  const activeColor = style.buttonTheme === 'secondary' ? sColor : pColor;
  
  const blockId = `block-${block.id.substring(0, 8)}`;
  const responsiveStyles = block.responsiveStyles || {};
  
  const appearance = project?.settings?.appearance || 'light';
  const themeBg = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff');
  const themeText = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000');

  const bgStyle = style.backgroundColor ? `background-color: ${style.backgroundColor};` : `background-color: ${themeBg};`;
  const textStyle = style.textColor ? `color: ${style.textColor};` : `color: ${themeText};`;
  const paddingStyle = `padding-top: ${toPx(style.padding, '6rem')}; padding-bottom: ${toPx(style.padding, '6rem')};`;
  const marginStyle = `margin-top: ${toPx(style.marginTop, '0px')}; margin-bottom: ${toPx(style.marginBottom, '0px')};`;
  const gapStyle = `gap: ${toPx(style.gap, '2rem')};`;
  const alignClass = { left: 'text-left items-start', center: 'text-center items-center', right: 'text-right items-end' }[style.align as string] || 'text-center items-center';
  const fontSizeStyle = `font-size: ${toPx(style.fontSize || style.titleSize)};`;

  const shadowMap = { none: 'shadow-none', S: 'shadow-lg', M: 'shadow-2xl shadow-zinc-200', L: 'shadow-[0_45px_100px_0_rgba(0,0,0,0.2)]' };
  const aspectMap = { original: 'aspect-auto', square: 'aspect-square', video: 'aspect-video', fill: 'aspect-[21/9]' };
  const filters = `${style.grayscale ? 'grayscale(100%)' : ''} ${style.brightness ? `brightness(${style.brightness}%)` : ''} ${style.blur ? `blur(${style.blur}px)` : ''}`.trim();

  // Generate responsive CSS
  let responsiveCss = `
    #${blockId} [style*="url"] {
      background-size: ${style.backgroundSize || 'cover'} !important;
      background-position: ${style.backgroundPosition || 'center'} !important;
      background-repeat: no-repeat !important;
      ${filters ? `filter: ${filters} !important;` : ''}
    }
    #${blockId} section, #${blockId} nav {
      background-color: ${style.backgroundColor || 'transparent'} !important;
      background-size: ${style.backgroundSize || 'cover'} !important;
      background-position: ${style.backgroundPosition || 'center'} !important;
      background-repeat: no-repeat !important;
    }
    #${blockId} [data-menu] {
      background-color: ${style.backgroundColor || (project?.settings?.appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff'))} !important;
    }
  `;
  ['tablet', 'mobile'].forEach(view => {
    const s = responsiveStyles[view as keyof typeof responsiveStyles];
    if (s && Object.keys(s).length > 0) {
      const breakpoint = view === 'tablet' ? '1024px' : '768px';
      responsiveCss += `
        @media (max-width: ${breakpoint}) {
          #${blockId} {
            ${s.marginTop !== undefined ? `margin-top: ${toPx(s.marginTop)} !important;` : ''}
            ${s.marginBottom !== undefined ? `margin-bottom: ${toPx(s.marginBottom)} !important;` : ''}
            ${s.fontSize !== undefined ? `font-size: ${toPx(s.fontSize)} !important;` : ''}
            ${s.titleSize !== undefined ? `font-size: ${toPx(s.titleSize)} !important;` : ''}
            ${s.backgroundColor !== undefined ? `background-color: ${s.backgroundColor} !important;` : ''}
            ${s.textColor !== undefined ? `color: ${s.textColor} !important;` : ''}
            ${s.align !== undefined ? `text-align: ${s.align} !important; align-items: ${s.align === 'center' ? 'center' : s.align === 'right' ? 'flex-end' : 'flex-start'} !important;` : ''}
            ${s.align !== undefined ? `justify-content: ${s.align === 'center' ? 'center' : s.align === 'right' ? 'flex-end' : 'flex-start'} !important;` : ''}
            ${s.maxWidth !== undefined ? `max-width: ${s.maxWidth}${typeof s.maxWidth === 'number' && s.maxWidth <= 100 ? '%' : 'px'} !important;` : ''}
            ${s.gap !== undefined ? `gap: ${toPx(s.gap)} !important;` : ''}
          }
          #${blockId} section, #${blockId} nav { 
             ${s.minHeight !== undefined ? `min-height: ${toPx(s.minHeight)} !important;` : ''}
             ${s.hPadding !== undefined ? `padding-left: ${toPx(s.hPadding)} !important; padding-right: ${toPx(s.hPadding)} !important;` : ''}
             ${s.padding !== undefined ? `padding-top: ${toPx(s.padding)} !important; padding-bottom: ${toPx(s.padding)} !important;` : ''}
          }
          #${blockId} section > div:first-child { 
            ${s.blur !== undefined || s.grayscale !== undefined || s.brightness !== undefined ? 
              `filter: ${s.grayscale ? 'grayscale(100%)' : ''} ${s.brightness ? `brightness(${s.brightness}%)` : ''} ${s.blur !== undefined ? `blur(${s.blur}px)` : ''} !important;` 
              : ''
            }
          }
          #${blockId} .flex { 
            ${s.align !== undefined ? `justify-content: ${s.align === 'center' ? 'center' : s.align === 'right' ? 'flex-end' : 'flex-start'} !important;` : ''}
            ${s.align !== undefined ? `align-items: ${s.align === 'center' ? 'center' : s.align === 'right' ? 'flex-end' : 'flex-start'} !important;` : ''}
          }
          #${blockId} h1 { 
            ${s.titleSize !== undefined ? `font-size: ${toPx(s.titleSize)} !important;` : ''}
            ${s.fontSize !== undefined && s.titleSize === undefined ? `font-size: ${toPx(s.fontSize)} !important;` : ''}
            ${s.titleBold !== undefined ? `font-weight: ${s.titleBold ? '900' : '400'} !important;` : ''}
            ${s.titleItalic !== undefined ? `font-style: ${s.titleItalic ? 'italic' : 'normal'} !important;` : ''}
            ${s.align !== undefined ? `text-align: ${s.align} !important;` : ''}
          }
          #${blockId} p { 
            ${s.subtitleSize !== undefined ? `font-size: ${toPx(s.subtitleSize)} !important;` : ''}
            ${s.fontSize !== undefined && s.subtitleSize === undefined ? `font-size: ${toPx(s.fontSize)} !important;` : ''}
            ${s.subtitleBold !== undefined ? `font-weight: ${s.subtitleBold ? '700' : '500'} !important;` : ''}
            ${s.subtitleItalic !== undefined ? `font-style: ${s.subtitleItalic ? 'italic' : 'normal'} !important;` : ''}
            ${s.align !== undefined ? `text-align: ${s.align} !important;` : ''}
          }
          
          /* Special Nav/Logo overrides */
          ${s.logoSize !== undefined ? `#${blockId} nav img { height: ${toPx(s.logoSize)} !important; }` : ''}
          ${s.logoTextSize !== undefined ? `#${blockId} nav span { font-size: ${toPx(s.logoTextSize)} !important; }` : ''}
          ${s.hPadding !== undefined ? `#${blockId} nav > div { padding-left: ${toPx(s.hPadding)} !important; padding-right: ${toPx(s.hPadding)} !important; }` : ''}
          ${s.hMargin !== undefined ? `#${blockId} nav { padding-left: ${toPx(s.hMargin)} !important; padding-right: ${toPx(s.hMargin)} !important; }` : ''}
        }
      `;
    }
  });

  const styleWrapper = responsiveCss ? `<style>${responsiveCss}</style>` : '';
  const blockWrapper = (inner: string, isNav: boolean = false) => `${styleWrapper}<div id="${blockId}" class="w-full ${isNav ? '' : 'overflow-hidden'} transition-all duration-500">${inner}</div>`;

  switch (type) {
    case 'navigation':
      return blockWrapper(renderToStaticMarkup(
        <NavView 
          content={content} 
          style={style} 
          project={project} 
          allPages={allPages}
        />
      ), true);

    case 'hero':
      return blockWrapper(renderToStaticMarkup(
        <Hero 
          content={content} 
          style={style} 
          project={project} 
        />
      ));

    case 'text':
      return blockWrapper(renderToStaticMarkup(
        <TextBlock 
          content={content} 
          style={style} 
        />
      ));

    case 'footer':
      return blockWrapper(renderToStaticMarkup(
        <FooterBlock 
          content={content} 
          style={style} 
          project={project}
        />
      ));

    case 'image':
      return blockWrapper(`
        <section class="block-image px-8 max-w-[1200px] mx-auto flex ${alignClass.includes('items-start') ? 'justify-start' : alignClass.includes('items-end') ? 'justify-end' : 'justify-center'}" style="${bgStyle} ${paddingStyle} ${marginStyle}">
            <div class="w-full h-full hover-lift group">
                <a ${content.url ? `href="${content.url}"` : ''} class="block border-0">
                  <div class="overflow-hidden ${shadowMap[style.shadow as keyof typeof shadowMap] || 'shadow-2xl'}" style="border-radius: ${style.borderRadius || '2rem'};">
                    <img src="${content.image}" alt="${content.alt || ''}" class="w-full object-cover transition-transform duration-1000 group-hover:scale-110 ${(aspectMap as any)[style.aspectRatio || 'original'] || 'aspect-auto'}" style="filter: ${filters}; object-position: ${style.objectPosition || 'center'};" />
                  </div>
                </a>
                ${content.caption ? `<p class="mt-6 text-sm text-zinc-400 font-bold text-center italic tracking-tight" style="${textStyle}">${content.caption}</p>` : ''}
            </div>
        </section>
      `);

    case 'image-text':
      const isRight = content.imageSide === 'right';
      return blockWrapper(`
        <section class="block-image-text px-8 overflow-hidden transition-all" style="${bgStyle} ${paddingStyle} ${marginStyle}">
            <div class="max-w-[1200px] mx-auto flex flex-col ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'} items-center" style="${gapStyle}">
                <div class="flex-1 w-full">
                  <div class="overflow-hidden ${shadowMap[style.shadow as keyof typeof shadowMap] || 'shadow-2xl'}" style="border-radius: ${style.borderRadius || '2rem'};">
                    <img src="${content.image}" alt="${content.title}" class="w-full aspect-square object-cover" style="filter: ${filters}; object-position: ${style.objectPosition || 'center'};" />
                  </div>
                </div>
                <div class="flex-1 w-full ${alignClass}">
                  <h2 class="font-black tracking-tighter mb-6 leading-tight" style="${fontSizeStyle}">${content.title}</h2>
                  <p class="text-lg opacity-80 leading-relaxed font-semibold mb-8" style="${textStyle}">${content.text}</p>
                  ${content.cta ? `
                    <button class="px-8 py-4 rounded-full text-white font-black shadow-xl hover:brightness-110 active:scale-95 border-0" style="background-color: ${activeColor};">
                      ${content.cta}
                    </button>
                  ` : ''}
                </div>
            </div>
        </section>
      `);

    case 'gallery':
      const cols = content.columns || 3;
      const galleryItems = content.items || [];
      const aspectClass = (({ square: 'aspect-square', video: 'aspect-video', portrait: 'aspect-[3/4]', auto: 'aspect-auto' } as any)[content.aspectRatio || 'square']);
      
      return blockWrapper(`
        <section class="block-gallery w-full" style="${bgStyle} ${paddingStyle} ${marginStyle}">
            <div class="mx-auto px-8" style="max-width: ${toPx(style.maxWidth || 1200)};">
                <div class="grid w-full" style="grid-template-columns: repeat(${cols}, minmax(0, 1fr)); ${gapStyle}">
                    ${galleryItems.map((item: any, i: number) => `
                      <div class="flex flex-col gap-4">
                        <div class="overflow-hidden ${shadowMap[style.shadow as keyof typeof shadowMap] || 'shadow-lg'} ${aspectClass}" style="border-radius: ${toPx(style.borderRadius, '1.5rem')};">
                          <img src="${item.url}" class="w-full h-full object-cover" style="filter: ${filters};" />
                        </div>
                        ${content.showTitles && item.title ? `
                          <div class="${alignClass.split(' ')[0]}">
                            <h4 class="font-bold text-sm" style="${textStyle}">${item.title}</h4>
                            ${item.subtitle ? `<p class="text-[10px] opacity-60 uppercase font-black tracking-widest mt-1" style="${textStyle}">${item.subtitle}</p>` : ''}
                          </div>
                        ` : ''}
                      </div>
                    `).join('')}
                </div>
            </div>
        </section>
      `);

    case 'map':
      const encodedAddr = encodeURIComponent(content.address || 'Milano, Italia');
      const z = content.zoom || 14;
      return blockWrapper(`
        <section class="block-map px-8" style="${bgStyle} ${paddingStyle} ${marginStyle}">
            <div class="max-w-[1200px] mx-auto">
              <div class="w-full h-[500px] overflow-hidden ${shadowMap[style.shadow as keyof typeof shadowMap] || 'shadow-2xl'}" style="border-radius: ${style.borderRadius || '3rem'};">
                <iframe width="100%" height="100%" frameborder="0" src="https://maps.google.com/maps?q=${encodedAddr}&t=&z=${z}&ie=UTF8&iwloc=&output=embed" style="filter: grayscale(0.2) contrast(1.1);"></iframe>
              </div>
            </div>
        </section>
      `);

    case 'features':
      const cardStyleMap: Record<string, string> = {
        none: '',
        flat: 'p-10 rounded-[2.5rem] border border-zinc-100 bg-zinc-50/50',
        elevated: 'p-10 rounded-[2.5rem] border border-white bg-white shadow-2xl shadow-zinc-200/50 hover-lift transition-all duration-500',
        glass: 'p-10 rounded-[2.5rem] border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl'
      };
      const cardClass = cardStyleMap[style.cardStyle as string] || '';

      return blockWrapper(`
        <section class="block-features px-8 max-w-[1200px] mx-auto" style="${bgStyle} ${paddingStyle} ${marginStyle}">
            <div class="grid grid-cols-1 md:grid-cols-4 items-stretch" style="${gapStyle}">
                ${content.items?.map((item: any, i: number) => {
                  const iconSvg = item.icon && (ICON_SVGS as any)[item.icon] 
                    ? `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\${(ICON_SVGS as any)[item.icon]}</svg>`
                    : (i + 1);
                  
                  return `
                    <div class="flex flex-col \${alignClass.includes('items-start') ? 'items-start text-left' : alignClass.includes('items-end') ? 'items-end text-right' : 'items-center text-center'} group \${cardClass} h-full">
                        <div class="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl mb-8 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3 shrink-0" style="background-color: \${activeColor};">
                            \${iconSvg}
                        </div>
                        <h3 class="text-2xl font-black mb-4 tracking-tighter" style="\${textStyle}">\${item.title}</h3>
                        <p class="text-zinc-500 leading-relaxed font-bold text-base opacity-80" style="\${textStyle}">\${item.description}</p>
                        \${item.url ? \`<a href="\${item.url}" class="mt-auto pt-6 text-sm font-black underline underline-offset-4 decoration-current transition-opacity hover:opacity-70" style="\${textStyle}">Scopri di più</a>\` : ''}
                    </div>
                  `;
                }).join('') || ''}
            </div>
        </section>
      `);

    case 'contact':
      return blockWrapper(`
        <section class="block-contact px-8 overflow-hidden" style="${bgStyle} ${paddingStyle} ${marginStyle}">
          <div class="max-w-[1200px] mx-auto flex flex-col ${alignClass.includes('items-start') ? 'items-start text-left' : alignClass.includes('items-end') ? 'items-end text-right' : 'items-center text-center'}">
            <div class="max-w-2xl w-full mb-16">
              <h2 class="font-black tracking-tighter leading-tight" style="font-size: ${toPx(style.titleSize || style.fontSize, '3rem')}; ${textStyle}">${content.title}</h2>
              <p class="mt-4 opacity-80 leading-relaxed font-bold" style="font-size: ${toPx(style.subtitleSize || '1.125rem')}; ${textStyle}">${content.subtitle}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                ${content.email ? `
                  <a href="mailto:${content.email}" class="p-10 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col items-center gap-6 group hover:translate-y-[-5px] transition-all no-underline shadow-2xl" style="${style.backgroundColor === '#ffffff' ? 'background-color: #f8fafc;' : ''}">
                    <div class="w-20 h-20 rounded-[2rem] bg-zinc-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_SVGS.mail}</svg>
                    </div>
                    <div class="text-center">
                       <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2" style="${textStyle}">Email</p>
                       <p class="text-xl font-black tracking-tight" style="${textStyle}">${content.email}</p>
                    </div>
                  </a>
                ` : ''}
                ${content.phone ? `
                   <a href="tel:${content.phone}" class="p-10 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col items-center gap-6 group hover:translate-y-[-5px] transition-all no-underline shadow-2xl" style="${style.backgroundColor === '#ffffff' ? 'background-color: #f8fafc;' : ''}">
                    <div class="w-20 h-20 rounded-[2rem] bg-zinc-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_SVGS.phone}</svg>
                    </div>
                    <div class="text-center">
                       <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2" style="${textStyle}">Telefono</p>
                       <p class="text-xl font-black tracking-tight" style="${textStyle}">${content.phone}</p>
                    </div>
                  </a>
                ` : ''}
                ${content.address ? `
                   <a href="https://maps.google.com/?q=${encodeURIComponent(content.address)}" target="_blank" class="p-10 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col items-center gap-6 group hover:translate-y-[-5px] transition-all no-underline shadow-2xl" style="${style.backgroundColor === '#ffffff' ? 'background-color: #f8fafc;' : ''}">
                    <div class="w-20 h-20 rounded-[2rem] bg-zinc-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_SVGS.layers}</svg>
                    </div>
                    <div class="text-center">
                       <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2" style="${textStyle}">Indirizzo</p>
                       <p class="text-xl font-black tracking-tight" style="${textStyle}">${content.address}</p>
                    </div>
                  </a>
                ` : ''}
              </div>
          </div>
        </section>
      `);

    case 'reviews':
      const isPuzzle = content.layout === 'puzzle';
      return blockWrapper(`
        <section class="block-reviews px-8" style="${bgStyle} ${paddingStyle} ${marginStyle}">
            <div class="max-w-[1200px] mx-auto">
                <div class="max-w-3xl mb-16 text-center mx-auto">
                  <h2 class="font-black tracking-tight" style="font-size: ${toPx(style.titleSize || style.fontSize, '3rem')}; ${textStyle}">${content.title}</h2>
                  <p class="mt-4 leading-relaxed font-bold opacity-80" style="font-size: ${toPx(style.subtitleSize, '1.125rem')}; ${textStyle}">${content.subtitle}</p>
                </div>
                <div class="${isPuzzle ? 'columns-1 md:columns-2 lg:columns-3 space-y-6 gap-6' : 'grid grid-cols-1 md:grid-cols-3 gap-8'}" style="gap: ${toPx(style.gap, '2rem')};">
                    ${content.items?.map((item: any) => `
                      <div class="break-inside-avoid bg-white rounded-3xl p-8 shadow-xl border border-zinc-100 flex flex-col transition-all hover:scale-[1.02] ${isPuzzle ? 'mb-6' : ''}">
                          <div class="text-blue-500/20 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H3c-1.25 0-2 .75-2 2v8c0 1.25.75 2 2 2h3c0 4-4 6-4 6zM14 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-5c-1.25 0-2 .75-2 2v8c0 1.25.75 2 2 2h3c0 4-4 6-4 6z"/></svg>
                          </div>
                          <p class="text-zinc-600 italic leading-relaxed mb-8 flex-1">"\${item.text || item.review}"</p>
                          <div class="flex items-center gap-4">
                            \${(item.image || item.avatar) ? \`<img src="\${item.image || item.avatar}" alt="\${item.name}" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />\` : ''}
                            <div>
                               <h4 class="font-bold text-zinc-900 text-sm">\${item.name}</h4>
                               \${item.role ? \`<p class="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">\${item.role}</p>\` : ''}
                            </div>
                          </div>
                      </div>
                    `).join('')}
                </div>
            </div>
        </section>
      `);

    case 'product-carousel':
      return blockWrapper(`
        <section class="block-product-carousel py-24 overflow-hidden" style="${bgStyle} ${paddingStyle} ${marginStyle}">
            <div class="max-w-7xl mx-auto px-8">
                <h2 class="text-4xl font-black mb-12" style="${textStyle}">${content.title}</h2>
                <div class="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
                    ${content.items?.map((item: any) => `
                        <div class="w-80 shrink-0 bg-white rounded-3xl overflow-hidden shadow-lg border border-zinc-100">
                          <img src="${item.image}" class="w-full aspect-[4/5] object-cover" />
                          <div class="p-6">
                            <h3 class="font-bold text-xl mb-2">${item.title}</h3>
                            <p class="text-sm text-zinc-500 mb-6">${item.description}</p>
                            <a href="${item.url || '#'}" class="px-6 py-2 rounded-full text-white no-underline text-sm font-bold inline-block" style="background-color: ${pColor};">Dettagli</a>
                          </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
      `);

    case 'embed':
      return blockWrapper(`
        <section class="block-embed px-8" style="${bgStyle} ${paddingStyle} ${marginStyle}">
            <div class="max-w-[1200px] mx-auto flex flex-col items-center">
                ${content.title ? `<h3 class="text-center font-bold mb-8" style="${textStyle}">${content.title}</h3>` : ''}
                <div class="w-full flex justify-center">
                   ${content.type === 'instagram' ? `
                      <iframe src="https://www.instagram.com/p/${content.url?.split('/').filter(Boolean).pop()}/embed" width="400" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
                   ` : content.html || `<div class="p-12 border-2 border-dashed border-zinc-100 rounded-3xl text-zinc-400 font-bold bg-zinc-50/50">Embed non ancora configurato: ${content.url || 'Indirizzo assente'}</div>`}
                </div>
            </div>
        </section>
      `);


    default:
      return `<!-- Block ${type} not implemented -->`;
  }
}
