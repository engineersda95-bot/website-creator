'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn, formatLink } from '@/lib/utils';
import { Project } from '@/types/editor';
import { CTA } from '@/components/shared/CTA';

interface MobileMenuProps {
  links: Array<{ label: string; url: string }>;
  style: any;
  color: string;
  bg: string;
  project?: Project;
  cta?: string;
  ctaUrl?: string;
  showContact?: boolean;
  pColor: string;
  viewport?: string;
  isEditing?: boolean;
  isStatic?: boolean;
  layoutType?: string;
  buttonTheme?: 'primary' | 'secondary';
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  links,
  style,
  color,
  bg,
  project,
  cta,
  ctaUrl,
  showContact,
  pColor,
  viewport,
  isEditing,
  isStatic,
  layoutType,
  buttonTheme
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // NEVER use 'transparent' for the sidebar background.
  const menuBgColor = (bg && bg !== 'transparent') 
    ? bg 
    : (project?.settings?.appearance === 'dark' ? "#0a0a0c" : "#ffffff");
    
  const menuTextColor = (color && color !== 'transparent')
    ? color
    : (project?.settings?.appearance === 'dark' ? "#ffffff" : "#0a0a0c");

  const borderColor = project?.settings?.appearance === 'dark' ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

  const isMobileViewport = viewport === 'mobile' || viewport === 'tablet';

  // Dynamic Typography from global settings (using CSS variables set in body/base-style-mapper)
  const linkStyle = {
    fontFamily: 'var(--title-ff)',
    fontWeight: 'var(--title-fw)' as any,
    fontStyle: 'var(--title-fs-style)' as any,
    textTransform: 'var(--title-upper)' as any,
    fontSize: 'var(--base-fs)',
    lineHeight: '1.2'
  };

  return (
    <>
      {/* Hamburger Toggle Button */}
      <button 
        data-menu-toggle
        className={cn(
          "p-2 rounded-lg relative z-[10005] flex items-center justify-center transition-all active:scale-95 outline-none"
        )}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{ 
          color: isMenuOpen ? menuTextColor : color,
          display: 'var(--nav-hamburger-display)' as any 
        }}
      >
        <div className="relative w-6 h-6 pointer-events-none text-current">
           <div className={cn("absolute inset-0 transition-all duration-500 opacity-0 scale-50 rotate-90", isMenuOpen && "opacity-100 scale-100 rotate-0" )}>
              <X strokeWidth={2.5} />
           </div>
           <div className={cn("absolute inset-0 transition-all duration-300 opacity-100 scale-100 rotate-0", isMenuOpen && "opacity-0 scale-50 -rotate-90")}>
              <Menu strokeWidth={2.5} />
           </div>
        </div>
      </button>

      {/* SIDEBAR (SLIDE FROM RIGHT) */}
      <div 
        className={cn(
          "z-[10002] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[-40px_0_80px_rgba(0,0,0,0.35)] flex flex-col translate-x-full opacity-0 overflow-hidden",
          isEditing ? "absolute top-0 right-0 h-screen" : "fixed top-0 right-0 h-full",
          isMenuOpen && "translate-x-0 opacity-100 pointer-events-auto",
          !isMenuOpen && "pointer-events-none",
          isMobileViewport ? "flex" : "hidden md:flex"
        )}
        style={{ 
          backgroundColor: menuBgColor,
          color: menuTextColor,
          width: isMobileViewport ? '100%' : 'var(--hamburger-width, 450px)',
          maxWidth: isMobileViewport ? '100vw' : '85vw'
        }}
      >
        {/* Espaziatore per compensare l'altezza della navbar */}
        <div 
          className="w-full shrink-0" 
          style={{ height: 'var(--nav-padding, 20px)' }}
        />

        {/* Espaziatore superiore per compensare l'altezza della navbar */}
        <div 
          className="w-full shrink-0 h-4 md:h-8" 
        />

        {/* Sidebar Header Padding - Ridotto per avvicinare il primo link */}
        <div className="h-10 md:h-12 shrink-0" />

        {/* Sidebar Links Area */}
        <div className="flex-1 overflow-y-auto px-12 md:px-20 custom-scrollbar">
           <div className="flex flex-col space-y-0">
              {links.map((link, i) => (
                <a 
                  key={i} 
                  {...formatLink(isEditing ? '#' : link.url, !isEditing)}
                  className="group flex items-center justify-between py-8 no-underline border-b text-inherit hover:opacity-70 transition-all duration-500"
                  style={{ borderColor, ...linkStyle }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {cta && (
                <div className="py-12 flex justify-center">
                  <CTA 
                    label={cta} 
                    url={ctaUrl} 
                    project={project} 
                    viewport={isMobileViewport ? 'mobile' : 'desktop'} 
                    theme={buttonTheme || 'primary'} 
                    isStatic={isStatic} 
                    onClick={() => setIsMenuOpen(false)}
                  />
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Dimmer Overlay (Scurisce il resto della pagina) */}
      <div 
        className={cn(
          "bg-black/85 z-[10001] transition-opacity duration-700 opacity-0 pointer-events-none backdrop-blur-sm",
          isEditing ? "absolute top-[-5000px] left-[-5000px] w-[10000px] h-[10000px]" : "fixed inset-0",
          !isMobileViewport && "hidden md:block",
          isMenuOpen && "opacity-100 pointer-events-auto"
        )}
        onClick={() => setIsMenuOpen(false)}
      />
    </>
  );
};
