'use client';

import React from 'react';
import { Palette, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '../ui/SectionHeader';
import { ProjectSettings } from '@/types/editor';

interface ThemeSectionProps {
   project: any;
   updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
}

export const ThemeSection: React.FC<ThemeSectionProps> = ({
   project,
   updateProjectSettings
}) => {
   return (
      <div className="space-y-12">
         {/* 3. Aspetto & Colori Sezione */}
         <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
            <SectionHeader icon={Palette} title="Aspetto & Colori" colorClass="text-amber-500" />
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-3">
                  <button
                     onClick={() => updateProjectSettings({ appearance: 'light' })}
                     className={cn("py-4 flex flex-col items-center gap-2 text-[12px] font-bold border-2 rounded-2xl transition-all", project?.settings?.appearance !== 'dark' ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-[1.05]" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}
                  >
                     <Sun size={20} />
                     <span>CHIARO</span>
                  </button>
                  <button
                     onClick={() => updateProjectSettings({ appearance: 'dark' })}
                     className={cn("py-4 flex flex-col items-center gap-2 text-[12px] font-bold border-2 rounded-2xl transition-all", project?.settings?.appearance === 'dark' ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-[1.05]" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}
                  >
                     <Moon size={20} />
                     <span>SCURO</span>
                  </button>
               </div>

               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                     <h4 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                        <Sun size={12} className="text-amber-400" /> Colori Tema Light
                     </h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo</label>
                           <input type="color" className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent" value={project?.settings?.themeColors?.light?.bg || '#ffffff'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, light: { bg: e.target.value, text: project?.settings?.themeColors?.light?.text || '#000000' } } })} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo</label>
                           <input type="color" className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent" value={project?.settings?.themeColors?.light?.text || '#000000'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, light: { text: e.target.value, bg: project?.settings?.themeColors?.light?.bg || '#ffffff' } } })} />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-50">
                     <h4 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                        <Moon size={12} className="text-indigo-400" /> Colori Tema Dark
                     </h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo</label>
                           <input type="color" className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent" value={project?.settings?.themeColors?.dark?.bg || '#0c0c0e'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, dark: { bg: e.target.value, text: project?.settings?.themeColors?.dark?.text || '#ffffff' } } })} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo</label>
                           <input type="color" className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent" value={project?.settings?.themeColors?.dark?.text || '#ffffff'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, dark: { text: e.target.value, bg: project?.settings?.themeColors?.dark?.bg || '#0c0c0e' } } })} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* 5. Colori Brand Section */}
         <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
            <SectionHeader icon={Palette} title="Colori Brand" colorClass="text-blue-500" />
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Primario</label>
                     <input
                        type="color"
                        className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                        value={project?.settings?.primaryColor || '#3b82f6'}
                        onChange={(e) => updateProjectSettings({ primaryColor: e.target.value })}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Secondario</label>
                     <input
                        type="color"
                        className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                        value={project?.settings?.secondaryColor || '#10b981'}
                        onChange={(e) => updateProjectSettings({ secondaryColor: e.target.value })}
                     />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-50">
                  <div className="space-y-2">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo Bottoni</label>
                     <input
                        type="color"
                        className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                        value={project?.settings?.themeColors?.buttonText || '#ffffff'}
                        onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, buttonText: e.target.value } })}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo Secondario</label>
                     <input
                        type="color"
                        className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                        value={project?.settings?.themeColors?.buttonTextSecondary || '#ffffff'}
                        onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, buttonTextSecondary: e.target.value } })}
                     />
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
};

