'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export function AdvancedMargins({ getStyleValue, updateStyle }: any) {
   return (
      <div className="pt-4 border-t border-zinc-50">
         <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">
               <span>Margini Avanzati</span>
               <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
            </summary>
            <div className="grid grid-cols-2 gap-4 mt-6">
               {['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].map((key) => (
                  <div key={key}>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">
                        {key === 'marginTop' ? 'Sup' : key === 'marginBottom' ? 'Inf' : key === 'marginLeft' ? 'Sx' : 'Dx'} (px)
                     </label>
                     <input
                        type="number"
                        className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                        value={getStyleValue(key, 0)}
                        onChange={(e) => updateStyle({ [key]: parseInt(e.target.value) || 0 })}
                     />
                  </div>
               ))}
            </div>
         </details>
      </div>
   );
}
