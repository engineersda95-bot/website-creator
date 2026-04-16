'use client';

import React from 'react';
import { Smartphone, Tablet } from 'lucide-react';

interface ViewportBannerProps {
  viewport: 'desktop' | 'tablet' | 'mobile' | string;
}

export function ViewportBanner({ viewport }: ViewportBannerProps) {
  if (viewport === 'desktop') return null;

  const isMobile = viewport === 'mobile';
  const Icon = isMobile ? Smartphone : Tablet;

  return (
    <div className="bg-indigo-600 text-white p-3 px-4 animate-in slide-in-from-top duration-300">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 bg-white/10 rounded-lg shrink-0">
          <Icon size={14} className="text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            Modalità {viewport} Attiva
          </p>
          <p className="text-[10px] leading-relaxed text-indigo-100 font-medium opacity-90">
            Le modifiche effettuate ora verranno salvate come <strong className="text-white">sovrascritture specifiche</strong> per questo dispositivo e non influenzeranno la versione Desktop.
          </p>
        </div>
      </div>
    </div>
  );
}
