import React from 'react';
import { cn, toPx, formatLink } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Page, Block } from '@/types/editor';
import { MobileMenu } from './MobileMenu';
import { resolveImageUrl } from '@/lib/image-utils';
import { SitiImage } from '@/components/shared/SitiImage';
import { CTA, getCTAOverrides } from '@/components/shared/CTA';
import { BACKGROUND_PATTERNS } from '@/lib/background-patterns';
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone
} from 'lucide-react';

const BrandX = ({ size, style }: any) => {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" style={{ ...style, width: s, height: s }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
};

const WhatsAppIcon = ({ size, style }: any) => {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" style={{ ...style, width: s, height: s }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
};

const SOCIAL_ICONS: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  x: BrandX,
  linkedin: Linkedin,
  mail: Mail,
  phone: Phone,
  twitter: BrandX,
  whatsapp: WhatsAppIcon,
};

export interface NavigationProps {
  content: {
    logoText?: string;
    logoImage?: string;
    logoAlt?: string;
    logoType?: 'text' | 'image' | 'both';
    logoSize?: number;
    logoTextSize?: number;
    logoLinkHome?: boolean;
    logoUrl?: string;
    links?: { label: string; url: string }[];
    cta?: string;
    ctaUrl?: string;
    ctaTheme?: 'primary' | 'secondary' | 'custom';
    showContact?: boolean;
    layoutType?: 'standard' | 'hamburger';
    showSocial?: boolean;
    socialLinks?: Array<{ platform: string; url: string }>;
  };
  block: Block;
  isEditing?: boolean;
  project?: Project;
  allPages?: Page[];
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  language?: string;
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
  imageMemoryCache,
  language
}) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const blockId = `nav-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const links = content.links || [];

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
            alt={content.logoAlt || content.logoText || 'Logo'} 
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
    
    const defLang = project?.settings?.defaultLanguage || 'it';
    const currentLang = language || (content as any)._language || defLang;
    const homeUrl = currentLang === defLang ? '/' : `/${currentLang}`;
    
    return (
      <a 
        {...formatLink(content.logoLinkHome !== false ? (content.logoUrl || homeUrl) : undefined, !isEditing)} 
        className={cn("no-underline flex items-center gap-3", content.logoLinkHome === false && "pointer-events-none")}
      >
        {children}
      </a>
    );
  };

  const pColor = project?.settings?.primaryColor || '#3b82f6';
  const secondaryColor = project?.settings?.secondaryColor || '#10b981';
  const activeColor = style.buttonTheme === 'secondary' ? secondaryColor : pColor;
  const ctaUrl = content.ctaUrl || (content as any).ctaLink || '#';

   const getRGBA = (hex: string, opacity: number) => {
     if (!hex || hex === 'transparent') return 'transparent';
     let r = 255, g = 255, b = 255;
     if (hex.startsWith('#')) {
       r = parseInt(hex.slice(1, 3), 16) || 255;
       g = parseInt(hex.slice(3, 5), 16) || 255;
       b = parseInt(hex.slice(5, 7), 16) || 255;
     } else if (hex.startsWith('rgb')) {
       const match = hex.match(/\d+/g);
       if (match) { r = parseInt(match[0]); g = parseInt(match[1]); b = parseInt(match[2]); }
     }
     return `rgba(${r}, ${g}, ${b}, ${opacity})`;
   };

   const currentOpacity = (style.scrolledOpacity ?? 100) / 100;
   const bgColor = getRGBA(bg || '#ffffff', currentOpacity);

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
        color: 'var(--block-color)',
        '--block-bg': bg || '#ffffff',
        '--scrolled-opacity': ((style.scrolledOpacity ?? 100) / 100).toString(),
        paddingTop: 'var(--nav-padding)',
        paddingBottom: 'var(--nav-padding)',
        marginLeft: 'var(--block-ml)',
        marginRight: 'var(--block-mr)',
        marginTop: style.isSticky ? 0 : 'var(--block-mt)',
        marginBottom: 'var(--block-mb)',
        width: 'var(--block-width)'
      } as React.CSSProperties}
    >
      {/* Background Layer (Handles sticky background and blur) */}
      <div 
        data-nav-bg
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-300"
        style={{
          background: style.isTransparent ? 'transparent' : bgColor,
        }}
      />
      {/* Pattern Layer */}
      {style.patternType && style.patternType !== 'none' && (
        <div 
          className="absolute inset-0 pointer-events-none z-[1] background-pattern"
          style={BACKGROUND_PATTERNS.find(p => p.id === style.patternType)?.getStyle(
            style.patternColor || style.textColor || '#000000',
            style.patternOpacity || 10,
            style.patternScale || 40
          )}
        />
      )}
      <div 
        className="relative z-[2] mx-auto flex items-center justify-between transition-all duration-300 w-full"
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
          className={cn("items-center ml-auto text-inherit")}
          style={{ 
            display: 'var(--nav-links-display)',
            gap: 'var(--nav-links-cta-gap, 32px)'
          }}
        >
          <div 
            className="flex items-center"
            style={{ gap: 'var(--nav-links-gap, 32px)' }}
          >
            {links.map((link, i) => (
              <a 
                key={i} 
                {...formatLink(isEditing ? '#' : link.url, !isEditing)}
                className="font-medium transition-all hover:opacity-70 no-underline text-inherit whitespace-nowrap leading-none"
                style={{ 
                  fontSize: 'var(--base-fs)', 
                  fontWeight: 'var(--title-fw)' as any,
                  fontStyle: 'var(--title-fs-style)' as any
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* SOCIAL LINKS (IF STANDARD AND ENABLED) */}
          {content.showSocial && content.socialLinks && content.socialLinks.length > 0 && (
            <div 
              className="flex items-center"
              style={{ gap: 'var(--social-links-gap, 24px)' }}
            >
              {content.socialLinks.map((social: any, i: number) => {
                const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Mail;
                return (
                  <a 
                    key={i} 
                    {...formatLink(social.url, isStatic)} 
                    aria-label={social.platform}
                    className="opacity-70 hover:opacity-100 hover:scale-110 transition-all text-inherit flex items-center justify-center p-0"
                    style={{ fontSize: '0px', height: 'var(--social-icon-size, 20px)' }}
                  >
                    <Icon 
                      size={style.socialIconSize || 20}
                      style={{ 
                        width: 'var(--social-icon-size, 20px)', 
                        height: 'var(--social-icon-size, 20px)' 
                      }} 
                    />
                  </a>
                );
              })}
            </div>
          )}

          {content.cta && (
            <CTA 
              label={content.cta} 
              url={ctaUrl} 
              project={project} 
              viewport={(viewport as any) || 'desktop'} 
              theme={content.ctaTheme || style.buttonTheme || 'primary'} 
              isStatic={!!(isStatic || !viewport)} 
              {...getCTAOverrides(content, style, 'cta', content.ctaTheme || style.buttonTheme || 'primary')}
            />
          )}
        </div>

        {/* MOBILE MENU / DESKTOP HAMBURGER */}
        {isStatic ? (
          <>
            {/* Hamburger Button (Static) */}
            <button 
              data-menu-toggle
              aria-label="Apri menu"
              className="rounded-lg relative z-[10005] flex items-center justify-center transition-all active:scale-95 text-inherit outline-none"
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
                        {...formatLink(link.url, true)}
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

                    {/* SOCIAL LINKS (IF STATIC AND ENABLED) */}
                    {content.showSocial && content.socialLinks && content.socialLinks.length > 0 && (
                      <div 
                        className="flex items-center py-10 justify-center"
                        style={{ gap: 'var(--social-links-gap, 32px)' }}
                      >
                        {content.socialLinks.map((social, i) => {
                          const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Mail;
                          return (
                            <a 
                              key={i} 
                              {...formatLink(social.url, true)} 
                              aria-label={social.platform}
                              className="opacity-70 hover:opacity-100 hover:scale-110 transition-all text-inherit flex items-center justify-center"
                              style={{ height: 'var(--social-icon-size, 24px)', width: 'var(--social-icon-size, 24px)' }}
                            >
                              <Icon 
                                size={style.socialIconSize || 24} 
                                style={{ 
                                  width: 'var(--social-icon-size, 24px)', 
                                  height: 'var(--social-icon-size, 24px)' 
                                }} 
                              />
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {content.cta && (
                      <div className="py-12 flex justify-center">
                        <CTA 
                          label={content.cta} 
                          url={ctaUrl} 
                          project={project} 
                          viewport="desktop"
                          theme={content.ctaTheme || style.buttonTheme || 'primary'} 
                          isStatic={true} 
                          {...getCTAOverrides(content, style, 'cta', content.ctaTheme || style.buttonTheme || 'primary')}
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
            buttonTheme={content.ctaTheme || style.buttonTheme || 'primary'}
            ctaOverrides={getCTAOverrides(content, style, 'cta', content.ctaTheme || style.buttonTheme || 'primary')}
            showSocial={content.showSocial}
            socialLinks={content.socialLinks}
            socialIconSize={style.socialIconSize}
            SOCIAL_ICONS={SOCIAL_ICONS}
            MailIcon={Mail}
          />
        )}
      </div>
      {!isEditing && (
        <div dangerouslySetInnerHTML={{ __html: `<script>(function(){var n=document.getElementById('${blockId}');if(!n)return;var st=n.getAttribute('data-sticky')==='true',tr=n.getAttribute('data-transparent')==='true';function upd(sc){var nb=n.querySelector('[data-nav-bg]'),bg=getComputedStyle(n).getPropertyValue('--block-bg').trim()||'#ffffff',op=getComputedStyle(n).getPropertyValue('--scrolled-opacity')||'1',r=255,g=255,b=255;if(bg.startsWith('#')){r=parseInt(bg.slice(1,3),16)||255;g=parseInt(bg.slice(3,5),16)||255;b=parseInt(bg.slice(5,7),16)||255;}else if(bg.startsWith('rgb')){var m=bg.match(/\d+/g);if(m){r=m[0];g=m[1];b=m[2];}}if(sc&&st){n.style.position='fixed';n.style.top='0';if(nb){nb.style.background='rgba('+r+','+g+','+b+','+op+')';nb.style.backdropFilter='blur(10px)';}n.style.boxShadow='0 10px 30px -10px rgba(0,0,0,0.1)';}else{if(tr){n.style.position='absolute';if(nb)nb.style.background='transparent';}else{n.style.position=st?'sticky':'relative';if(nb)nb.style.background='rgba('+r+','+g+','+b+','+op+')';}n.style.top='0';n.style.boxShadow='none';if(nb)nb.style.backdropFilter='none';}n.style.paddingTop='var(--nav-padding)';n.style.paddingBottom='var(--nav-padding)';}window.addEventListener('scroll',function(){upd(window.scrollY>20);});upd(window.scrollY>20);var tg=n.querySelector('[data-menu-toggle]'),mn=n.querySelector('[data-menu]'),ov=n.querySelector('[data-menu-overlay]');if(tg&&mn){var xi=tg.querySelector('[data-menu-x]');function ui(o){if(xi){xi.classList.toggle('hidden',!o);xi.classList.toggle('block',o);}tg.querySelectorAll('svg').forEach(function(s){if(!s.parentElement.hasAttribute('data-menu-x'))s.style.display=o?'none':'block';});}function om(){mn.classList.remove('translate-x-full','opacity-0');if(ov){ov.classList.remove('opacity-0','pointer-events-none');ov.classList.add('opacity-100','pointer-events-auto');}document.body.style.overflow='hidden';ui(true);}function cm(){mn.classList.add('translate-x-full','opacity-0');if(ov){ov.classList.add('opacity-0','pointer-events-none');ov.classList.remove('opacity-100','pointer-events-auto');}document.body.style.overflow='';ui(false);}tg.addEventListener('click',function(e){e.stopPropagation();!mn.classList.contains('translate-x-full')?cm():om();});if(ov)ov.addEventListener('click',cm);mn.querySelectorAll('a[href^="#"]').forEach(function(l){l.addEventListener('click',function(){setTimeout(cm,100);});});}})();</script>`}} />
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
