'use client';

import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Type, Link as LinkIcon } from 'lucide-react';
import { LinkSelector } from '../ui/LinkSelector';
import { cn } from '@/lib/utils';

interface LinkListManagerProps {
   links: any[];
   onChange: (links: any[]) => void;
   label?: string;
}

export function LinkListManager({ links = [], onChange, label = "Link Testuali" }: LinkListManagerProps) {
   const move = (index: number, direction: 'up' | 'down') => {
      const newLinks = [...links];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= links.length) return;
      [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
      onChange(newLinks);
   };

   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{label}</label>
            <button
               onClick={() => onChange([...links, { label: 'Nuovo Link', url: '/' }])}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            >
               <Plus size={12} /> Aggiungi
            </button>
         </div>

         <div className="space-y-4">
            {links.map((link: any, i: number) => (
               <div 
                  key={i} 
                  className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl relative group/item animate-in slide-in-from-right-2 duration-300 hover:border-zinc-200 hover:bg-white transition-all shadow-sm !overflow-visible"
               >
                  {/* Header with reorder/delete */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
                     <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Link #{i + 1}</span>
                     <div className="flex items-center gap-1">
                        <button 
                           onClick={() => move(i, 'up')}
                           disabled={i === 0}
                           className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-0 transition-colors"
                        >
                           <ArrowUp size={14} />
                        </button>
                        <button 
                           onClick={() => move(i, 'down')}
                           disabled={i === links.length - 1}
                           className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-0 transition-colors"
                        >
                           <ArrowDown size={14} />
                        </button>
                        <div className="w-px h-3 bg-zinc-200 mx-1" />
                        <button 
                           onClick={() => onChange(links.filter((_, idx) => idx !== i))} 
                           className="p-1 text-zinc-300 hover:text-red-500 transition-colors"
                        >
                           <Trash2 size={14} />
                        </button>
                     </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-3">
                     <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                           <Type size={10} /> Etichetta
                        </label>
                        <input 
                           className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:border-zinc-900 transition-all outline-none md:text-[13px]" 
                           placeholder="es. Home, Contatti..." 
                           value={link.label} 
                           onChange={(e) => {
                              const nl = [...links]; nl[i].label = e.target.value; onChange(nl);
                           }} 
                        />
                     </div>

                     <LinkSelector 
                        label="URL Destinazione"
                        value={link.url} 
                        onChange={(val) => {
                           const nl = [...links]; nl[i].url = val; onChange(nl);
                        }}
                        placeholder="/... o https://..."
                        size="md" // Switch back to md because now we have space
                     />
                  </div>
               </div>
            ))}

            {links.length === 0 && (
               <div className="py-12 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                  <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest leading-relaxed">
                     Nessun link presente.<br/>Clicca aggiungi per iniziare.
                  </p>
               </div>
            )}
         </div>
      </div>
   );
}
