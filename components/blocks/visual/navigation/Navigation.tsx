import React from 'react';
import { cn, toPx, formatLink } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Page, Block } from '@/types/editor';
import { MobileMenu } from './MobileMenu';
import { resolveImageUrl } from '@/lib/image-utils';
import { SitiImage } from '@/components/shared/SitiImage';
import { CTA } from '@/components/shared/CTA';

export interface NavigationProps {
  content: {
    logoText?: string;
    logoImage?: string;
    logoType?: 'text' | 'image' | 'both';
    logoSize?: number;
    logoTextSize?: number;
    logoLinkHome?: boolean;
    logoUrl?: string;
    links?: { label: string; url: string }[];
    cta?: string;
    ctaUrl?: string;
    showContact?: boolean;
    layoutType?: 'standard' | 'hamburger';
  };
  block: Block;
  isEditing?: boolean;
  project?: Project;
  allPages?: Page[];
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

const StaticMenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const StaticXIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export const Navigation: React.FC<NavigationProps> = ({ 
  content, 
  block, 
  isEditing, 
  project, 
  allPages,
  viewport,
  isStatic,
  imageMemoryCache
}) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const blockId = `nav-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const links = (content.links && content.links.length > 0) 
    ? content.links 
    : (allPages || []).map(p => ({
        label: p.title,
        url: p.slug === 'home' ? '/' : `/${p.slug}`
      }));

  const logoSize = style.logoSize ?? content.logoSize ?? 40;
  const logoTextSize = style.logoTextSize ?? content.logoTextSize ?? 24;

  const bg = style.backgroundColor;
  const color = style.textColor;

  const renderLogo = () => {
    const type = content.logoType || 'text';
    return (
      <div className="flex items-center gap-3">
        {(type === 'image' || type === 'both') && content.logoImage && (
          <SitiImage 
            src={content.logoImage} 
            project={project}
            isStatic={isStatic}
            imageMemoryCache={imageMemoryCache}
            alt="Logo" 
            style={{ height: 'var(--logo-fs)', width: 'auto' }} 
            className="object-contain shrink-0" 
          />
        )}
        {(type === 'text' || type === 'both') && (
          <span className="font-bold tracking-tighter whitespace-nowrap" style={{ 
            fontSize: 'var(--logo-text-fs)', 
            color: 'var(--logo-color)' 
          }}>
            {content.logoText || 'SitiVetrina'}
          </span>
        )}
      </div>
    );
  };

  const LogoWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isEditing) return <div className="cursor-pointer flex items-center gap-3">{children}</div>;
    return (
      <a 
        {...formatLink(content.logoLinkHome ? (content.logoUrl || '/') : undefined)} 
        className={cn("no-underline flex items-center gap-3", !content.logoLinkHome && "pointer-events-none")}
      >
        {children}
      </a>
    );
  };

  const pColor = project?.settings?.primaryColor || '#3b82f6';
  const secondaryColor = project?.settings?.secondaryColor || '#10b981';
  const activeColor = style.buttonTheme === 'secondary' ? secondaryColor : pColor;
  const ctaUrl = content.ctaUrl || (content as any).ctaLink || '#';

  const NavContent = (
    <nav 
      id={blockId}
      data-transparent={style.isTransparent ? 'true' : 'false'}
      data-sticky={style.isSticky ? 'true' : 'false'}
      className={cn(
        "w-full z-[9999] transition-all duration-300 mx-auto",
        (!isEditing && style.isSticky) ? "sticky top-0" : "relative",
        (style.isTransparent && !isEditing) ? "absolute top-0 left-0 right-0" : ""
      )}
      style={{ 
        background: style.isTransparent ? 'transparent' : 'var(--block-bg)', 
        color: 'var(--block-color)',
        paddingTop: 'var(--nav-padding)',
        paddingBottom: 'var(--nav-padding)',
        marginLeft: 'var(--block-ml)',
        marginRight: 'var(--block-mr)',
        marginTop: style.isSticky ? 0 : 'var(--block-mt)',
        marginBottom: 'var(--block-mb)',
        width: 'var(--block-width)'
      }}
    >
      <div 
        className="mx-auto flex items-center justify-between transition-all duration-300 w-full"
        style={{ 
          paddingLeft: 'var(--nav-hpadding)',
          paddingRight: 'var(--nav-hpadding)'
        }}
      >
        {/* LOGO AREA */}
        <LogoWrapper>
          {renderLogo()}
        </LogoWrapper>

        {/* DESKTOP (AND MOBILE IF STANDARD) LINKS */}
        <div 
          className={cn("items-center gap-8 ml-auto text-inherit")}
          style={{ display: 'var(--nav-links-display)' }}
        >
          {links.map((link, i) => (
            <a 
              key={i} 
              {...formatLink(isEditing ? '#' : link.url)}
              className="font-medium transition-all hover:opacity-70 no-underline text-inherit whitespace-nowrap"
              style={{ 
                fontSize: 'var(--base-fs)', 
                fontWeight: 'var(--title-fw)' as any,
                fontStyle: 'var(--title-fs-style)' as any
              }}
            >
              {link.label}
            </a>
          ))}
          {content.cta && (
            <CTA 
              label={content.cta} 
              url={ctaUrl} 
              project={project} 
              viewport={(viewport as any) || 'desktop'} 
              theme={style.buttonTheme || 'primary'} 
              isStatic={!!(isStatic || !viewport)} 
            />
          )}
        </div>

        {/* MOBILE MENU / DESKTOP HAMBURGER */}
        {isStatic ? (
          <>
            {/* Hamburger Button (Static) */}
            <button 
              data-menu-toggle
              className="p-2 rounded-lg relative z-[10005] flex items-center justify-center transition-all active:scale-95 text-inherit outline-none"
              style={{ display: 'var(--nav-hamburger-display)' as any }}
            >
              <StaticMenuIcon />
              <div data-menu-x className="hidden">
                 <StaticXIcon />
              </div>
            </button>

            {/* Sidebar (Static) */}
            <div 
              data-menu
              className="fixed top-0 right-0 h-full z-[10002] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[-40px_0_80px_rgba(0,0,0,0.35)] flex flex-col translate-x-full opacity-0 overflow-hidden"
              style={{ 
                backgroundColor: bg !== 'transparent' ? bg : (project?.settings?.appearance === 'dark' ? "#0a0a0c" : "#ffffff"),
                color: color !== 'transparent' ? color : (project?.settings?.appearance === 'dark' ? "#ffffff" : "#0a0a0c"),
                width: 'var(--hamburger-width, 450px)',
                maxWidth: '100vw'
              }}
            >
               {/* Sidebar CSS Overrides for Mobile (Static) */}
               <style dangerouslySetInnerHTML={{ __html: `
                 @media (max-width: 768px) {
                   [data-menu] { width: 100% !important; }
                   [data-menu-overlay] { display: block !important; }
                 }
               ` }} />

               {/* Espaziatore superiore statico */}
               <div className="w-full shrink-0 h-4 md:h-8" />
               <div className="h-10 md:h-12 shrink-0" />

               {/* Sidebar Links (Static) */}
               <div className="flex-1 overflow-y-auto px-12 md:px-20">
                  <div className="flex flex-col">
                    {links.map((link, i) => (
                      <a 
                        key={i} 
                        {...formatLink(link.url)}
                        className="group flex items-center justify-between py-8 no-underline border-b text-inherit hover:opacity-70 transition-all duration-500 ease-out"
                        style={{ 
                          borderColor: project?.settings?.appearance === 'dark' ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                          fontFamily: 'var(--title-ff)',
                          fontWeight: 'var(--title-fw)' as any,
                          fontStyle: 'var(--title-fs-style)' as any,
                          textTransform: 'var(--title-upper)' as any,
                          fontSize: 'var(--base-fs)',
                          lineHeight: '1.2'
                        }}
                      >
                        {link.label}
                      </a>
                    ))}
                    {content.cta && (
                      <div className="py-12 flex justify-center">
                        <CTA 
                          label={content.cta} 
                          url={ctaUrl} 
                          project={project} 
                          viewport="desktop"
                          theme={style.buttonTheme || 'primary'} 
                          isStatic={true} 
                        />
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Static Overlay Dimmer */}
            <div 
              data-menu-overlay
              className="fixed inset-0 bg-black/85 z-[10001] transition-opacity duration-700 opacity-0 pointer-events-none backdrop-blur-sm"
            />
          </>
        ) : (
          <MobileMenu 
            links={links}
            style={style}
            color={color}
            bg={bg}
            project={project}
            cta={content.cta}
            ctaUrl={ctaUrl}
            showContact={true}
            pColor={activeColor}
            viewport={viewport}
            isEditing={isEditing}
            isStatic={isStatic}
            layoutType={content.layoutType}
            buttonTheme={style.buttonTheme}
          />
        )}
      </div>
      {!isEditing && (
        <div dangerouslySetInnerHTML={{ __html: `<script>
          (function() {
            const nav = document.getElementById('${blockId}');
            if (!nav) return;
            const isSticky = nav.getAttribute('data-sticky') === 'true';
            const isTransparent = nav.getAttribute('data-transparent') === 'true';

            const update = (scrolled) => {
              const bg = getComputedStyle(nav).getPropertyValue('--block-bg').trim() || '#ffffff';
              const opacity = getComputedStyle(nav).getPropertyValue('--scrolled-opacity') || '0';
              
              if (scrolled && isSticky) {
                nav.style.position = 'fixed';
                nav.style.top = '0';
                
                // Helper to parse color (hex or rgb)
                let r=255, g=255, b=255;
                if (bg.startsWith('#')) {
                  r = parseInt(bg.slice(1, 3), 16);
                  g = parseInt(bg.slice(3, 5), 16);
                  b = parseInt(bg.slice(5, 7), 16);
                } else if (bg.startsWith('rgb')) {
                  const match = bg.match(/\d+/g);
                  if (match) { r=match[0]; g=match[1]; b=match[2]; }
                }

                nav.style.background = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
                nav.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.1)';
                nav.style.backdropFilter = 'blur(10px)';
                nav.style.paddingTop = 'var(--nav-padding)';
                nav.style.paddingBottom = 'var(--nav-padding)';
              } else {
                if (isTransparent) {
                  nav.style.position = 'absolute';
                  nav.style.background = 'transparent';
                } else if (isSticky) {
                  nav.style.position = 'sticky';
                  nav.style.background = 'var(--block-bg)';
                } else {
                  nav.style.position = 'relative';
                  nav.style.background = 'var(--block-bg)';
                }
                nav.style.top = '0';
                nav.style.boxShadow = 'none';
                nav.style.backdropFilter = 'none';
                nav.style.paddingTop = 'var(--nav-padding)';
                nav.style.paddingBottom = 'var(--nav-padding)';
              }
            };

            const onScroll = () => {
               const scrolled = window.scrollY > 20;
               update(scrolled);
            };

            window.addEventListener('scroll', onScroll);
            update(window.scrollY > 20);

            // HAMBURGER TOGGLE (Static only)
            const toggle = nav.querySelector('[data-menu-toggle]');
            const menu = nav.querySelector('[data-menu]');
            const close = nav.querySelector('[data-menu-close]');
            const overlay = nav.querySelector('[data-menu-overlay]');

            if (toggle && menu) {
              const xIcon = toggle.querySelector('[data-menu-x]');
              const updateIcon = (isOpen) => {
                 if (xIcon) {
                   xIcon.classList.toggle('hidden', !isOpen);
                   xIcon.classList.toggle('block', isOpen);
                 }
                 const svgs = toggle.querySelectorAll('svg');
                 svgs.forEach(s => {
                   if (s.parentElement.hasAttribute('data-menu-x')) return;
                   s.style.display = isOpen ? 'none' : 'block';
                 });
              };
              const openMenu = () => {
                menu.classList.remove('translate-x-full', 'opacity-0');
                if (overlay) {
                  overlay.classList.remove('opacity-0', 'pointer-events-none');
                  overlay.classList.add('opacity-100', 'pointer-events-auto');
                }
                document.body.style.overflow = 'hidden';
                updateIcon(true);
              };
              const closeMenu = () => {
                menu.classList.add('translate-x-full', 'opacity-0');
                if (overlay) {
                  overlay.classList.add('opacity-0', 'pointer-events-none');
                  overlay.classList.remove('opacity-100', 'pointer-events-auto');
                }
                document.body.style.overflow = '';
                updateIcon(false);
              };

              toggle.addEventListener('click', (e) => { 
                e.stopPropagation(); 
                const isOpen = !menu.classList.contains('translate-x-full');
                if (isOpen) closeMenu(); else openMenu(); 
              });
              if (overlay) overlay.addEventListener('click', closeMenu);
            }
          })();
        </script>`}} />
      )}
    </nav>
  );

  // SE SIAMO IN EDITOR ED E' TRASPARENTE:
  // Forziamo altezza 0 del contenitore + STICKY top-0 per restare visibili e sovrapposti.
  if (isEditing && style.isTransparent) {
    return (
      <div className="h-0 sticky top-0 z-[10000]">
        <div className="absolute top-0 left-0 right-0 overflow-visible">
           {NavContent}
        </div>
      </div>
    );
  }

  return NavContent;
};
