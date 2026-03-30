'use client';

import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface SocialLinksManagerProps {
   links: any[];
   onChange: (links: any[]) => void;
}

export function SocialLinksManager({ links = [], onChange }: SocialLinksManagerProps) {
   const move = (index: number, direction: 'up' | 'down') => {
      const newLinks = [...links];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= links.length) return;
      [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
      onChange(newLinks);
   };

   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <div className="flex items-center justify-between">
            <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Link Icone Social</label>
            <button
               onClick={() => onChange([...links, { platform: 'instagram', url: 'https://instagram.com' }])}
               className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[12px] font-bold"
            >
               <Plus size={10} className="inline mr-1" /> AGGIUNGI
            </button>
         </div>
         <div className="space-y-3">
            {links.map((social: any, i: number) => (
               <div key={i} className="flex gap-2 group animate-in slide-in-from-right-2 duration-200 items-center">
                  <div className="flex flex-col gap-0.5 shrink-0 -ml-1">
                     <button 
                        onClick={() => move(i, 'up')}
                        disabled={i === 0}
                        className="p-0.5 bg-white border border-zinc-100 rounded-full shadow-sm text-zinc-400 hover:text-zinc-900 disabled:opacity-0 transition-all active:scale-90"
                     >
                        <ArrowUp size={12} />
                     </button>
                     <button 
                        onClick={() => move(i, 'down')}
                        disabled={i === links.length - 1}
                        className="p-0.5 bg-white border border-zinc-100 rounded-full shadow-sm text-zinc-400 hover:text-zinc-900 disabled:opacity-0 transition-all active:scale-90"
                     >
                        <ArrowDown size={12} />
                     </button>
                  </div>
                  <select className="p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold focus:bg-white transition-all outline-none" value={social.platform} onChange={(e) => {
                     const ns = [...links]; ns[i].platform = e.target.value; onChange(ns);
                  }}>
                     <option value="instagram">Instagram</option>
                     <option value="facebook">Facebook</option>
                     <option value="whatsapp">WhatsApp</option>
                     <option value="x">X / Twitter</option>
                     <option value="linkedin">LinkedIn</option>
                     <option value="mail">Mail</option>
                     <option value="phone">Telefono</option>
                  </select>
                  <input className="flex-1 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50" placeholder="URL Profilo..." value={social.url} onChange={(e) => {
                     const ns = [...links]; ns[i].url = e.target.value; onChange(ns);
                  }} />
                  <button onClick={() => onChange(links.filter((_, idx) => idx !== i))} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
               </div>
            ))}
         </div>
      </div>
   );
}

