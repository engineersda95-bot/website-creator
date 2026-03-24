'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SimpleInputProps } from '@/types/sidebar';

export function SimpleInput({ label, value, onChange, placeholder, icon: Icon }: SimpleInputProps) {
   return (
      <div className="space-y-2">
         <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block pl-1">{label}</label>
         <div className="relative group">
            {Icon && (
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none z-10">
                  <Icon size={16} />
               </div>
            )}
            <input
               className={cn(
                  "w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none shadow-inner relative z-0",
                  Icon && "pl-12"
               )}
               placeholder={placeholder}
               value={value || ''}
               onChange={(e) => onChange(e.target.value)}
            />
         </div>
      </div>
   );
}
