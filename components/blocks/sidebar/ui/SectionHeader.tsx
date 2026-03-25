'use client';

import React from 'react';

interface SectionHeaderProps {
   icon: any;
   title: string;
   colorClass?: string;
}

export function SectionHeader({ icon: Icon, title, colorClass = "text-zinc-900" }: SectionHeaderProps) {
   return (
      <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
         <Icon size={14} className={colorClass} /> {title}
      </h3>
   );
}

