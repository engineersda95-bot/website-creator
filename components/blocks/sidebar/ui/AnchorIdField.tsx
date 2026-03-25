'use client';

import React from 'react';
import { Hash, Info } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface AnchorIdFieldProps {
  selectedBlock: any;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
}

export function AnchorIdField({ selectedBlock, updateStyle, getStyleValue }: AnchorIdFieldProps) {
  const anchorId = getStyleValue('anchorId', '');
  
  // Suggested ID based on title or text
  const title = selectedBlock.content?.title || selectedBlock.content?.text?.split('\n')[0] || '';
  const suggestedId = slugify(title);

  return (
    <div className="pt-6 border-t border-zinc-100 space-y-4">
      <div className="flex items-center justify-between px-1">
        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <Hash size={12} className="text-zinc-300" />
          Anchor Link (ID)
        </label>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none z-10">
          <Hash size={16} />
        </div>
        <input
          className="w-full pl-12 pr-4 py-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none shadow-inner relative z-0"
          placeholder={suggestedId || "es: chi-siamo"}
          value={anchorId}
          onChange={(e) => updateStyle({ anchorId: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
        />
        {anchorId && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded-lg text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
            Manuale
          </div>
        )}
      </div>

      <div className="flex gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-relaxed text-blue-700/80 font-medium">
          {anchorId 
            ? `Il blocco sarà raggiungibile tramite #${anchorId}`
            : suggestedId 
              ? `ID suggerito: #${suggestedId} (basato sul titolo)`
              : "L'ID permette di creare link diretti a questa sezione (es: un menu che scorre alla sezione)."}
        </p>
      </div>
    </div>
  );
}
