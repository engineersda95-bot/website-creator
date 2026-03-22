import React from 'react';
import { cn, toPx, formatLink, getButtonStyle } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Page, Block } from '@/types/editor';
import { MobileMenu } from './MobileMenu';

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
  isStatic
}) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');

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
          <img 
            src={content.logoImage} 
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
  const hPadding = style.hPadding !== undefined ? style.hPadding : 20;

  return (
    <nav 
      className="w-full relative z-[9999] transition-all duration-300 mx-auto"
      style={{ 
        backgroundColor: 'var(--block-bg)', 
        color: 'var(--block-color)',
        paddingTop: 'var(--nav-padding)',
        paddingBottom: 'var(--nav-padding)',
        marginLeft: 'var(--block-ml)',
        marginRight: 'var(--block-mr)',
        marginTop: 'var(--block-mt)',
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
          {content.showContact && (
            <a 
              {...formatLink(isEditing ? '#' : (content.ctaUrl || '#'))}
              className="font-bold no-underline transition-all active:scale-95 flex items-center justify-center whitespace-nowrap"
              style={getButtonStyle(project, pColor, (viewport as any) || 'desktop', 'primary', !!(isStatic || !viewport))}
            >
              {content.cta || 'Contattaci'}
            </a>
          )}
        </div>

        {/* MOBILE MENU */}
        {isStatic ? (
          <>
            <button 
              data-menu-toggle
              className="p-2 rounded-lg relative z-[1000] items-center justify-center transition-all active:scale-95"
              style={{ 
                 color: 'inherit',
                 display: 'var(--nav-hamburger-display)' as any
              }}
            >
              <div className="relative w-6 h-6 pointer-events-none">
                 <div className="menu-icon"><StaticMenuIcon /></div>
              </div>
            </button>
            <div 
              data-menu
              className={cn(
                "absolute top-full left-0 w-full shadow-2xl p-8 flex flex-col gap-6 z-[9999] transition-all duration-500 origin-top opacity-0 -translate-y-4 pointer-events-none",
                bg === 'transparent' ? (project?.settings?.appearance === 'dark' ? "bg-[#0c0c0e]" : "bg-white") : "bg-inherit"
              )}
              style={{ 
                backgroundColor: bg !== 'transparent' ? bg : (project?.settings?.appearance === 'dark' ? "#0c0c0e" : "#ffffff"),
              }}
            >
              {links.map((link, i) => (
                <a 
                  key={i} 
                  {...formatLink(link.url)}
                  className={cn(
                    "text-lg border-b py-2 no-underline block hover:translate-x-2 transition-all text-inherit",
                    project?.settings?.appearance === 'dark' ? "border-white/10" : "border-black/5"
                  )}
                  style={{ 
                    fontSize: style.fontSize || 18,
                    fontWeight: style.titleBold ? 700 : 500,
                    fontStyle: style.titleItalic ? 'italic' : 'normal'
                  }}
                >
                  {link.label}
                </a>
              ))}
              {content.showContact && (
                <a 
                  {...formatLink(content.ctaUrl || '#')}
                  className="font-bold no-underline transition-all active:scale-95 flex items-center justify-center"
                  style={getButtonStyle(project, pColor, 'mobile', 'primary', true)}
                >
                  {content.cta || 'Contattaci'}
                </a>
              )}
            </div>
          </>
        ) : (
          <MobileMenu 
            links={links}
            style={style}
            color={color}
            bg={bg}
            project={project}
            cta={content.cta}
            ctaUrl={content.ctaUrl}
            showContact={content.showContact}
            pColor={pColor}
            viewport={viewport}
            isEditing={isEditing}
            isStatic={isStatic}
            layoutType={content.layoutType}
          />
        )}
      </div>
    </nav>
  );
};
