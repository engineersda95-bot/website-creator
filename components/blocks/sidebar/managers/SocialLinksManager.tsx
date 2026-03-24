'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface SocialLinksManagerProps {
   links: any[];
   onChange: (links: any[]) => void;
}

export function SocialLinksManager({ links = [], onChange }: SocialLinksManagerProps) {
   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Link Icone Social</label>
            <button
               onClick={() => onChange([...links, { platform: 'instagram', url: 'https://instagram.com' }])}
               className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold"
            >
               <Plus size={10} className="inline mr-1" /> AGGIUNGI
            </button>
         </div>
         <div className="space-y-3">
            {links.map((social: any, i: number) => (
               <div key={i} className="flex gap-2 group animate-in slide-in-from-right-2 duration-200">
                  <select className="p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={social.platform} onChange={(e) => {
                     const ns = [...links]; ns[i].platform = e.target.value; onChange(ns);
                  }}>
                     <option value="instagram">Instagram</option>
                     <option value="facebook">Facebook</option>
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
