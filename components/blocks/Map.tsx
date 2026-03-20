'use client';

import React from 'react';
import { cn, toPx } from '@/lib/utils';
import { MapPin, Maximize2 } from 'lucide-react';

interface MapProps {
  content: {
    address: string;
    zoom?: number;
    showOverlay?: boolean;
    overlayTitle?: string;
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    backgroundColor?: string;
    borderRadius?: string;
    shadow?: 'none' | 'S' | 'M' | 'L';
    minHeight?: string;
  };
}

export const Map: React.FC<MapProps> = ({ content, style }) => {
  const address = content.address || 'Milano, Italia';
  const zoom = content.zoom || 14;
  const showOverlay = content.showOverlay !== false;
  
  // URL safe address
  const encodedAddress = encodeURIComponent(address);
  // Using a cleaner embed parameters
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  const shadowMap = { 
    none: 'shadow-none', 
    S: 'shadow-md', 
    M: 'shadow-2xl shadow-zinc-200', 
    L: 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]' 
  };

  return (
    <section 
      className="py-12 transition-all duration-500"
      style={{
        backgroundColor: style.backgroundColor,
        paddingTop: toPx(style.padding),
        paddingBottom: toPx(style.padding),
        marginTop: toPx(style.marginTop),
        marginBottom: toPx(style.marginBottom),
        minHeight: toPx(style.minHeight)
      }}
    >
      <div className="max-w-7xl mx-auto px-8 w-full h-full">
        <div 
          className={cn(
            "rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-200 aspect-video w-full bg-zinc-100 relative group transition-all duration-700",
            shadowMap[style.shadow as keyof typeof shadowMap] || 'shadow-2xl'
          )}
          style={{ borderRadius: style.borderRadius || '3rem' }}
        >
          <iframe
            title="Google Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={mapUrl}
            className="filter grayscale-[10%] contrast-[1.1] transition-all group-hover:grayscale-0 pointer-events-auto"
          />
          
          {showOverlay && (
            <div className="absolute bottom-10 left-10 bg-white/95 backdrop-blur-md px-6 py-5 rounded-3xl shadow-2xl border border-white flex items-center gap-4 z-10 translate-y-0 opacity-100 group-hover:-translate-y-2 transition-all duration-500 max-w-[calc(100%-80px)]">
               <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg">
                  <MapPin size={24} />
               </div>
               <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{content.overlayTitle || 'Nostra Sede'}</p>
                  <p className="text-sm font-bold text-zinc-900 truncate">{address}</p>
               </div>
               <a 
                 href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                 target="_blank"
                 className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <Maximize2 size={16} />
               </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
