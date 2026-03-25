'use client';

import React from 'react';
import { SimpleSlider } from '../ui/SimpleSlider';
import { StyleEditorProps } from '@/types/sidebar';

export function ImageStyleFields({ getStyleValue, updateStyle }: StyleEditorProps) {
   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
         <SimpleSlider 
            label="Arrotondamento Immagine" 
            value={getStyleValue('imageBorderRadius', 24)} 
            onChange={(val: number) => updateStyle({ imageBorderRadius: val })} 
            max={100}
         />

         <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 transition-all hover:bg-white hover:shadow-sm">
               <span className="text-[12px] font-black text-zinc-900 uppercase tracking-widest leading-none">Ombra</span>
               <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                  checked={!!getStyleValue('imageShadow', true)}
                  onChange={(e) => updateStyle({ imageShadow: e.target.checked })}
               />
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 transition-all hover:bg-white hover:shadow-sm">
               <span className="text-[12px] font-black text-zinc-900 uppercase tracking-widest leading-none">Zoom Hover</span>
               <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                  checked={!!getStyleValue('imageHover', true)}
                  onChange={(e) => updateStyle({ imageHover: e.target.checked })}
               />
            </div>
         </div>
      </div>
   );
}

