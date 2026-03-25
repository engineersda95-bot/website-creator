'use client';

import React from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdvancedMargins } from './AdvancedMargins';

import { LayoutFieldsProps } from '@/types/sidebar';

export function LayoutFields({ getStyleValue, updateStyle, showAlign = true, paddingLabel = "Padding Vert", hPaddingLabel = "Spazio Laterale" }: LayoutFieldsProps) {
   return (
      <div className="space-y-6">
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block">{paddingLabel} (px)</label>
               <input
                  type="number"
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                  value={getStyleValue('padding', 40)}
                  onChange={(e) => updateStyle({ padding: parseInt(e.target.value) || 0 })}
               />
            </div>
            <div>
               <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block">{hPaddingLabel} (px)</label>
               <input
                  type="number"
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                  value={getStyleValue('hPadding', 40)}
                  onChange={(e) => updateStyle({ hPadding: parseInt(e.target.value) || 0 })}
               />
            </div>
         </div>

         {showAlign && (
            <div>
               <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block">Allineamento</label>
               <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
                  {[
                     { id: 'left', icon: AlignLeft },
                     { id: 'center', icon: AlignCenter },
                     { id: 'right', icon: AlignRight }
                  ].map((item) => (
                     <button
                        key={item.id}
                        onClick={() => updateStyle({ align: item.id })}
                        className={cn("flex-1 p-2.5 flex justify-center transition-all", getStyleValue('align', 'center') === item.id ? "bg-zinc-900 text-white shadow-lg z-10" : "text-zinc-400 hover:text-zinc-600")}
                     >
                        <item.icon size={16} />
                     </button>
                  ))}
               </div>
            </div>
         )}
         <AdvancedMargins getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </div>
   );
}

