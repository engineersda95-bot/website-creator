'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedSectionProps {
  icon: any;
  id: string;
  label: string;
  children: React.ReactNode;
  badge?: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

export const UnifiedSection: React.FC<UnifiedSectionProps> = ({
  icon: Icon, id, label, children, badge, isOpen, onToggle
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isOpen]);

  return (
    <div ref={ref} className={cn("transition-all", isOpen && "bg-zinc-50/30")}>
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 transition-all"
      >
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
          isOpen ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
        )}>
          <Icon size={13} />
        </div>
        <span className={cn("text-[12px] font-semibold flex-1 text-left transition-colors", isOpen ? "text-zinc-900" : "text-zinc-600")}>{label}</span>
        {badge && (
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors",
            isOpen ? "bg-zinc-200 text-zinc-600" : "bg-zinc-100 text-zinc-400"
          )}>{badge}</span>
        )}
        <ChevronDown size={12} className={cn("text-zinc-300 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-2 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200 border-t border-zinc-100/50 mx-5">
          {children}
        </div>
      )}
      {!isOpen && <div className="h-px bg-zinc-100 mx-5" />}
    </div>
  );
};

// Event name for canvas → sidebar communication
export const SECTION_FOCUS_EVENT = 'block-section-focus';

// Hook for section state management + canvas event listener
export function useUnifiedSections() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = useCallback((id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  }, []);

  // Listen for focus events from InlineEditable on canvas
  useEffect(() => {
    const handler = (e: Event) => {
      const sectionId = (e as CustomEvent).detail;
      if (sectionId) setOpenSection(sectionId);
    };
    window.addEventListener(SECTION_FOCUS_EVENT, handler);
    // Also listen to legacy event for backwards compat
    window.addEventListener('hero-section-focus', handler);
    return () => {
      window.removeEventListener(SECTION_FOCUS_EVENT, handler);
      window.removeEventListener('hero-section-focus', handler);
    };
  }, []);

  return { openSection, setOpenSection, toggleSection };
}

// Category header
export const CategoryHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-5 pt-4 pb-1">
    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{label}</span>
  </div>
);

// Wrapper to hide internal headers of shared managers
export const ManagerWrapper: React.FC<{
  label: string;
  children: React.ReactNode;
  hideHeader?: boolean;
}> = ({ label, children, hideHeader = true }) => (
  <div className={cn(
    hideHeader && "[&>section]:pt-0 [&>section]:border-t-0 [&>section>h3]:hidden [&>section>div:first-child]:mt-0 [&>div]:pt-0 [&>div]:border-t-0 [&>div>div:first-child]:hidden [&>div]:space-y-4"
  )}>
    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">{label}</label>
    {children}
  </div>
);
