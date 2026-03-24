'use client';

import React from 'react';
import { Bold, Italic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypographyFieldsProps } from '@/types/sidebar';

export function TypographyFields({ label, sizeKey, boldKey, italicKey, getStyleValue, updateStyle, min = 8, max = 160, defaultValue = 16 }: TypographyFieldsProps) {
   return (
      <div className="pb-6 border-b border-zinc-50 last:border-0 last:pb-0">
         <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
            <span>{label}</span>
            <span className="text-zinc-900 font-bold">{getStyleValue(sizeKey, defaultValue)}px</span>
         </label>
         <div className="flex gap-2">
            <input
               type="range" min={min} max={max} step="1"
               className="flex-1 h-2 mt-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
               value={getStyleValue(sizeKey, defaultValue)}
               onChange={(e) => updateStyle({ [sizeKey]: parseInt(e.target.value) })}
            />
            <div className="flex border rounded-xl overflow-hidden shrink-0">
               {boldKey && (
                  <button
                     onClick={() => updateStyle({ [boldKey]: !getStyleValue(boldKey, false) })}
                     className={cn("p-2 px-3 transition-all", getStyleValue(boldKey, false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}
                  >
                     <Bold size={16} />
                  </button>
               )}
               {italicKey && (
                  <button
                     onClick={() => updateStyle({ [italicKey]: !getStyleValue(italicKey, false) })}
                     className={cn("p-2 px-3 transition-all", getStyleValue(italicKey, false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}
                  >
                     <Italic size={16} />
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}
