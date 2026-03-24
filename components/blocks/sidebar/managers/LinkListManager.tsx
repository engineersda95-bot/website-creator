'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface LinkListManagerProps {
   links: any[];
   onChange: (links: any[]) => void;
   label?: string;
}

export function LinkListManager({ links = [], onChange, label = "Link Testuali" }: LinkListManagerProps) {
   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</label>
            <button
               onClick={() => onChange([...links, { label: 'Link', url: '/' }])}
               className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold"
            >
               <Plus size={10} className="inline mr-1" /> AGGIUNGI
            </button>
         </div>
         <div className="space-y-3">
            {links.map((link: any, i: number) => (
               <div key={i} className="flex gap-2 group animate-in slide-in-from-right-2 duration-200">
                  <input className="w-[100px] shrink-0 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50" placeholder="Testo" value={link.label} onChange={(e) => {
                     const nl = [...links]; nl[i].label = e.target.value; onChange(nl);
                  }} />
                  <input className="flex-1 min-w-0 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50" placeholder="URL..." value={link.url} onChange={(e) => {
                     const nl = [...links]; nl[i].url = e.target.value; onChange(nl);
                  }} />
                  <button onClick={() => onChange(links.filter((_, idx) => idx !== i))} className="p-2 shrink-0 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
               </div>
            ))}
         </div>
      </div>
   );
}
