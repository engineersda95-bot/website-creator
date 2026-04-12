'use client';

import React from 'react';
import { Palette, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '../ui/SectionHeader';
import { ColorInput } from '../ui/ColorInput';
import { ProjectSettings } from '@/types/editor';
import { t } from '@/lib/i18n';

interface ThemeSectionProps {
   project: any;
   updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
}

export const ThemeSection: React.FC<ThemeSectionProps> = ({
   project,
   updateProjectSettings
}) => {
   const lang = project?.settings?.defaultLanguage || 'it';
   return (
      <div className="space-y-12">
         {/* 3. Aspetto & Colori Sezione */}
         <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
            <SectionHeader icon={Palette} title={t('appearance', lang)} colorClass="text-amber-500" />
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-3">
                  <button
                     onClick={() => updateProjectSettings({ appearance: 'light' })}
                     className={cn("py-4 flex flex-col items-center gap-2 text-[12px] font-bold border-2 rounded-2xl transition-all", project?.settings?.appearance !== 'dark' ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-[1.05]" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}
                  >
                     <Sun size={20} />
                     <span>{t('light', lang).toUpperCase()}</span>
                  </button>
                  <button
                     onClick={() => updateProjectSettings({ appearance: 'dark' })}
                     className={cn("py-4 flex flex-col items-center gap-2 text-[12px] font-bold border-2 rounded-2xl transition-all", project?.settings?.appearance === 'dark' ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-[1.05]" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}
                  >
                     <Moon size={20} />
                     <span>{t('dark', lang).toUpperCase()}</span>
                  </button>
               </div>

               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                     <h4 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                        <Sun size={12} className="text-amber-400" /> {t('theme_colors', lang)} {t('light', lang)}
                     </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <ColorInput 
                            label="Sfondo"
                            value={project?.settings?.themeColors?.light?.bg || '#ffffff'}
                            onChange={(val) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, light: { bg: val, text: project?.settings?.themeColors?.light?.text || '#000000' } } })}
                         />
                         <ColorInput 
                            label="Testo"
                            value={project?.settings?.themeColors?.light?.text || '#000000'}
                            onChange={(val) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, light: { text: val, bg: project?.settings?.themeColors?.light?.bg || '#ffffff' } } })}
                         />
                      </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-50">
                     <h4 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                        <Moon size={12} className="text-indigo-400" /> {t('theme_colors', lang)} {t('dark', lang)}
                     </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <ColorInput 
                            label="Sfondo"
                            value={project?.settings?.themeColors?.dark?.bg || '#0c0c0e'}
                            onChange={(val) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, dark: { bg: val, text: project?.settings?.themeColors?.dark?.text || '#ffffff' } } })}
                         />
                         <ColorInput 
                            label="Testo"
                            value={project?.settings?.themeColors?.dark?.text || '#ffffff'}
                            onChange={(val) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, dark: { text: val, bg: project?.settings?.themeColors?.dark?.bg || '#0c0c0e' } } })}
                         />
                      </div>
                  </div>
               </div>
            </div>
         </section>

         {/* 5. Colori Brand Section */}
         <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
            <SectionHeader icon={Palette} title={t('brand_colors', lang)} colorClass="text-blue-500" />
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <ColorInput 
                      label={t('primary', lang)}
                      value={project?.settings?.primaryColor || '#3b82f6'}
                      onChange={(val) => updateProjectSettings({ primaryColor: val })}
                   />
                   <ColorInput 
                      label={t('secondary', lang)}
                      value={project?.settings?.secondaryColor || '#10b981'}
                      onChange={(val) => updateProjectSettings({ secondaryColor: val })}
                   />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-50">
                   <ColorInput 
                      label={`${t('text', lang)} ${t('buttons', lang)}`}
                      value={project?.settings?.themeColors?.buttonText || '#ffffff'}
                      onChange={(val) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, buttonText: val } })}
                   />
                   <ColorInput 
                      label={`${t('text', lang)} ${t('secondary', lang)}`}
                      value={project?.settings?.themeColors?.buttonTextSecondary || '#ffffff'}
                      onChange={(val) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, buttonTextSecondary: val } })}
                   />
                </div>
            </div>
         </section>
      </div>
   );
};
