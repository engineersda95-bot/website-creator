'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
   HelpCircle,
   Smile,
   Shield,
   Zap,
   Check,
   Package,
   Star,
   Heart,
   Award,
   Activity
} from 'lucide-react';

const AVAILABLE_ICONS: Record<string, any> = {
   'help': HelpCircle,
   'smile': Smile,
   'shield': Shield,
   'zap': Zap,
   'check': Check,
   'package': Package,
   'star': Star,
   'heart': Heart,
   'award': Award,
   'activity': Activity
};

export function IconManager({ value, onChange, label = "Icona" }: any) {
   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{label}</label>
         <div className="grid grid-cols-5 gap-2">
            {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => (
               <button
                  key={name}
                  type="button"
                  onClick={() => onChange(name)}
                  className={cn(
                     "p-3 flex justify-center border rounded-2xl transition-all",
                     value === name
                        ? "bg-zinc-900 text-white shadow-lg scale-110 z-10 border-zinc-900"
                        : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:bg-white hover:border-zinc-200"
                  )}
               >
                  <Icon size={18} />
               </button>
            ))}
         </div>
      </div>
   );
}
