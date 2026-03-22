'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn, formatLink, getButtonStyle } from '@/lib/utils';
import { Project } from '@/types/editor';

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
  layoutType
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <button 
        data-menu-toggle
        className={cn(
          "p-2 rounded-lg relative z-[1000] items-center justify-center transition-all active:scale-95"
        )}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{ 
          color: 'inherit',
          display: 'var(--nav-hamburger-display)' as any 
        }}
      >
        <div className="relative w-6 h-6 pointer-events-none">
           <div className={cn("absolute inset-0 transition-all duration-300 opacity-0 scale-50 rotate-90", isMenuOpen && "opacity-100 scale-100 rotate-0")}>
              <X />
           </div>
           <div className={cn("absolute inset-0 transition-all duration-300 opacity-100 scale-100 rotate-0", isMenuOpen && "opacity-0 scale-50 -rotate-90")}>
              <Menu />
           </div>
        </div>
      </button>

      {/* MOBILE MENU / HAMBURGER OVERLAY */}
      <div 
        data-menu
        data-open={isMenuOpen}
        className={cn(
          "absolute top-full left-0 w-full shadow-2xl p-8 flex flex-col gap-6 z-[9999] transition-all duration-500 origin-top opacity-0 -translate-y-4 pointer-events-none",
          isMenuOpen && "opacity-100 translate-y-0 pointer-events-auto",
          bg === 'transparent' ? (project?.settings?.appearance === 'dark' ? "bg-[#0c0c0e]" : "bg-white") : "bg-inherit"
        )}
        style={{ 
          backgroundColor: bg !== 'transparent' ? bg : (project?.settings?.appearance === 'dark' ? "#0c0c0e" : "#ffffff"),
        }}
      >
        {links.map((link, i) => (
          <a 
            key={i} 
            {...formatLink(isEditing ? '#' : link.url)}
            className={cn(
              "text-lg border-b py-2 no-underline block hover:translate-x-2 transition-all text-inherit",
              project?.settings?.appearance === 'dark' ? "border-white/10" : "border-black/5"
            )}
            style={{ 
              fontSize: 'var(--nav-link-mobile-fs)',
              fontWeight: 'var(--nav-link-mobile-fw)' as any,
              fontStyle: 'var(--nav-link-mobile-fs-style)' as any
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        {showContact && (
          <a 
            {...formatLink(isEditing ? '#' : (ctaUrl || '#'))}
            className="font-bold no-underline transition-all active:scale-95 flex items-center justify-center"
            style={getButtonStyle(project, pColor, (viewport as any) || 'desktop', 'primary', isStatic)}
            onClick={() => setIsMenuOpen(false)}
          >
            {cta || 'Contattaci'}
          </a>
        )}
      </div>
    </>
  );
};
