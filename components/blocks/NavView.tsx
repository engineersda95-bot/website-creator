import React from 'react';
import { Menu, X } from 'lucide-react';
import { cn, toPx, formatLink } from '@/lib/utils';
import { Project, Page } from '@/types/editor';

export interface NavViewProps {
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
  style: any;
  isEditing?: boolean;
  project?: Project;
  allPages?: Page[];
  isMenuOpen?: boolean;
  toggleMenu?: () => void;
  viewport?: string;
}

export const NavView: React.FC<NavViewProps> = ({ 
  content, 
  style, 
  isEditing, 
  project, 
  allPages,
  isMenuOpen = false,
  toggleMenu,
  viewport
}) => {
  const links = (content.links && content.links.length > 0) 
    ? content.links 
    : (allPages || []).map(p => ({
        label: p.title,
        url: p.slug === 'home' ? '/' : `/${p.slug}`
      }));
  const logoType = content.logoType || 'text';
  const isDark = project?.settings?.appearance === 'dark';
  const themeColors = project?.settings?.themeColors;
  const defaultText = isDark 
    ? (themeColors?.dark?.text || '#ffffff') 
    : (themeColors?.light?.text || '#000000');
  
  const logoSize = style.logoSize ?? content.logoSize ?? 40;
  const logoTextSize = style.logoTextSize ?? content.logoTextSize ?? 24;

  const bg = style.backgroundColor || 'transparent';
  const color = style.textColor || defaultText;

  const renderLogo = () => {
    const type = content.logoType || 'text';
    return (
      <>
        {(type === 'image' || type === 'both') && content.logoImage && (
          <img src={content.logoImage} alt="Logo" style={{ height: logoSize, width: 'auto' }} className="object-contain shrink-0" />
        )}
        {(type === 'text' || type === 'both') && (
          <span className="font-bold tracking-tighter whitespace-nowrap" style={{ color: color === 'transparent' ? 'inherit' : color, fontSize: toPx(logoTextSize) }}>
            {content.logoText || 'SitiVetrina'}
          </span>
        )}
      </>
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
  const hPadding = style.hPadding !== undefined ? style.hPadding : 20; // Default horizontal padding 20
  const hMargin = style.hMargin !== undefined ? style.hMargin : 0; // Margine orizzontale

  return (
    <nav 
      className="w-full relative z-[9999] transition-all duration-300 mx-auto"
      style={{ 
        backgroundColor: bg, 
        color,
        paddingTop: toPx(style.padding, '16px'),
        paddingBottom: toPx(style.padding, '16px'),
        paddingLeft: '0px',
        paddingRight: '0px',
        marginLeft: toPx(style.marginLeft, '0px'),
        marginRight: toPx(style.marginRight, '0px'),
        marginTop: toPx(style.marginTop, '0px'),
        marginBottom: toPx(style.marginBottom, '0px'),
        width: (style.marginLeft || style.marginRight) ? `calc(100% - ${toPx(style.marginLeft || 0)} - ${toPx(style.marginRight || 0)})` : '100%'
      }}
    >
      <div 
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-300 w-full"
        )}
        style={{ 
          paddingLeft: toPx(hPadding),
          paddingRight: toPx(hPadding)
        }}
      >
        {/* LOGO AREA */}
        <LogoWrapper>
          {renderLogo()}
        </LogoWrapper>

        {/* DESKTOP LINKS */}
        {content.layoutType !== 'hamburger' && (
          <div className="hidden md:flex items-center gap-8 ml-auto">
            {links.map((link, i) => (
              <a 
                key={i} 
                {...formatLink(isEditing ? '#' : link.url)}
                className="font-medium transition-all hover:opacity-70 no-underline"
                style={{ fontSize: style.fontSize || 14, color }}
              >
                {link.label}
              </a>
            ))}
            {content.showContact && (
              <a 
                {...formatLink(isEditing ? '#' : (content.ctaUrl || '#'))}
                className="font-bold no-underline transition-all active:scale-95 flex items-center justify-center whitespace-nowrap"
                style={require('@/lib/utils').getButtonStyle(project, pColor, (viewport as any))}
              >
                {content.cta || 'Contattaci'}
              </a>
            )}
          </div>
        )}

         {/* MOBILE / HAMBURGER TOGGLE */}
        <button 
          data-menu-toggle
          data-open={isMenuOpen}
          className={cn(
            "p-2 rounded-lg relative z-[1000]",
            content.layoutType === 'hamburger' ? "flex" : "md:hidden flex"
          )}
          onClick={toggleMenu}
          style={{ color }}
        >
          <div className="relative w-6 h-6 pointer-events-none">
             <div className="absolute inset-0 transition-all duration-300 opacity-0 scale-50 rotate-90 data-[open=true]:opacity-100 data-[open=true]:scale-100 data-[open=true]:rotate-0">
                <X />
             </div>
             <div className="absolute inset-0 transition-all duration-300 opacity-100 scale-100 rotate-0 data-[open=true]:opacity-0 data-[open=true]:scale-50 data-[open=true]:-rotate-90">
                <Menu />
             </div>
          </div>
        </button>

        {/* MOBILE MENU / HAMBURGER OVERLAY */}
        <div 
          data-menu
          data-open={isMenuOpen}
          className={cn(
            "absolute top-full left-0 w-full shadow-2xl p-8 flex flex-col gap-6 z-[9999] transition-all duration-500 origin-top opacity-0 -translate-y-4 pointer-events-none data-[open=true]:opacity-100 data-[open=true]:translate-y-0 data-[open=true]:pointer-events-auto",
            bg === 'transparent' ? (isDark ? "bg-[#0c0c0e]" : "bg-white") : "bg-inherit"
          )}
          style={{ 
            backgroundColor: bg !== 'transparent' ? bg : (isDark ? "#0c0c0e" : "#ffffff"),
          }}
        >
          {links.map((link, i) => (
            <a 
              key={i} 
              {...formatLink(isEditing ? '#' : link.url)}
              className={cn(
                "text-lg font-medium border-b py-2 no-underline block hover:translate-x-2 transition-all",
                isDark ? "border-white/10" : "border-black/5"
              )}
              style={{ color }}
              onClick={toggleMenu}
            >
              {link.label}
            </a>
          ))}
          {content.showContact && (
            <a 
              {...formatLink(isEditing ? '#' : (content.ctaUrl || '#'))}
              className="font-bold no-underline transition-all active:scale-95 flex items-center justify-center"
              style={require('@/lib/utils').getButtonStyle(project, pColor, (viewport as any) || 'desktop')}
              onClick={toggleMenu}
            >
              {content.cta || 'Contattaci'}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};
