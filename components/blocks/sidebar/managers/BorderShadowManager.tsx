'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';

import { BorderShadowManagerProps } from '@/types/sidebar';
import { ColorInput } from '../ui/ColorInput';

export function BorderShadowManager({ getStyleValue, updateStyle }: BorderShadowManagerProps) {
   return (
      <section className="pt-8 border-t border-zinc-100">
         <SectionHeader icon={Layers} title="Bordi" colorClass="text-zinc-500" />
         <div className="space-y-6">
            <div>
               <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block">Arrotondamento</label>
               <input
                  type="number"
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                  value={getStyleValue('borderRadius', 0)}
                  onChange={(e) => updateStyle({ borderRadius: parseInt(e.target.value) || 0 })}
               />
            </div>
            <div className="flex items-center justify-between">
               <label className="text-[12px] font-bold text-zinc-400 uppercase cursor-pointer" htmlFor="has-border">Bordo</label>
               <input
                  id="has-border"
                  type="checkbox"
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  checked={!!getStyleValue('borderWidth', 0)}
                  onChange={(e) => updateStyle({ borderWidth: e.target.checked ? 1 : 0 })}
               />
            </div>
            {getStyleValue('borderWidth', 0) > 0 && (
               <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <ColorInput 
                     label="Colore Bordo"
                     value={getStyleValue('borderColor', '#e5e7eb')}
                     onChange={(val) => updateStyle({ borderColor: val })}
                  />
                  <div>
                     <label className="text-[12px] font-bold text-zinc-400 uppercase mb-2 block">Spessore (px)</label>
                     <input
                        type="number"
                        className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                        value={getStyleValue('borderWidth', 1)}
                        onChange={(e) => updateStyle({ borderWidth: parseInt(e.target.value) || 0 })}
                     />
                  </div>
               </div>
            )}
         </div>
      </section>
   );
}

