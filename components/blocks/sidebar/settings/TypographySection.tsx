'use client';

import React from 'react';
import { Type } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { ProjectSettings } from '@/types/editor';

interface TypographySectionProps {
   project: any;
   updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
}

export const TypographySection: React.FC<TypographySectionProps> = ({
   project,
   updateProjectSettings
}) => {
   return (
      <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-75">
         <SectionHeader icon={Type} title="Tipografia" colorClass="text-indigo-500" />
         <div className="space-y-4">
            <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Fonte Principale</label>
            <div className="p-1 bg-zinc-50 rounded-2xl border border-zinc-100 font-bold">
               <select
                  className="w-full p-3 bg-transparent text-sm font-black focus:ring-0 outline-none cursor-pointer"
                  value={project?.settings?.fontFamily || 'Outfit'}
                  onChange={(e) => updateProjectSettings({ fontFamily: e.target.value })}
               >
                  <option value="Outfit">Outfit</option>
                  <option value="Inter">Inter</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Bebas Neue">Bebas Neue</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Unbounded">Unbounded</option>
                  <option value="DM Sans">DM Sans</option>
                  <option value="Montserrat">Montserrat</option>
               </select>
            </div>
         </div>
      </section>
   );
};

