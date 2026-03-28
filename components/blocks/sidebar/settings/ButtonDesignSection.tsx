'use client';

import React from 'react';
import { MousePointer2, MousePointerClick } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { ProjectSettings } from '@/types/editor';
import { t } from '@/lib/i18n';

interface ButtonDesignSectionProps {
   project: any;
   updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
   viewport: string;
}

export const ButtonDesignSection: React.FC<ButtonDesignSectionProps> = ({
   project,
   updateProjectSettings,
   viewport
}) => {
   const lang = project?.settings?.defaultLanguage || 'it';
   const desktopSettings = (project?.settings || {}) as ProjectSettings;
   const isDesktop = viewport === 'desktop';
   const currentViewport = viewport as 'tablet' | 'mobile';
   const currentSettings = (isDesktop ? desktopSettings : (project?.settings?.responsive?.[currentViewport] || {})) as Partial<ProjectSettings>;

   const updateGlobal = (newVal: Partial<ProjectSettings>) => {
      if (isDesktop) {
         updateProjectSettings(newVal);
      } else {
         updateProjectSettings({
            responsive: {
               ...project?.settings?.responsive,
               [currentViewport]: { ...(project?.settings?.responsive?.[currentViewport] || {}), ...newVal }
            }
         });
      }
   };

   const getValue = (key: keyof ProjectSettings) => {
      const val = currentSettings[key];
      if (val !== undefined && val !== null && val !== "") return val as any;
      return "";
   };

   const getPlaceholder = (key: keyof ProjectSettings, fallback: any) => {
      if (isDesktop) return fallback.toString();
      return (desktopSettings[key] ?? fallback).toString();
   };

   return (
      <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
         <SectionHeader icon={MousePointer2} title={t('button_design', lang)} colorClass="text-indigo-500" />
         <div className="space-y-8 mt-6">
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">{t('radius', lang)}</label>
                     <input
                        type="number"
                        className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={getValue('buttonRadius')}
                        placeholder={getPlaceholder('buttonRadius', 0)}
                        onChange={(e) => updateGlobal({ buttonRadius: parseInt(e.target.value) || 0 })}
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">{t('shadow', lang)}</label>
                     <select
                        className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={getValue('buttonShadow')}
                        onChange={(e) => updateGlobal({ buttonShadow: e.target.value as any })}
                     >
                        {!isDesktop && <option value="">{lang === 'en' ? 'Inherit' : 'Eredita'} ({desktopSettings.buttonShadow || (lang === 'en' ? 'None' : 'Nessuna')})</option>}
                        <option value="none">{t('none', lang)}</option>
                        <option value="S">{t('small', lang)}</option>
                        <option value="M">{t('medium', lang)}</option>
                        <option value="L">{t('large', lang)}</option>
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-50">
                  <div className="space-y-4">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">{t('padding_x', lang)}</label>
                     <input type="number" className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none" value={getValue('buttonPaddingX')} placeholder={getPlaceholder('buttonPaddingX', 32)} onChange={(e) => updateGlobal({ buttonPaddingX: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">{t('padding_y', lang)}</label>
                     <input type="number" className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none" value={getValue('buttonPaddingY')} placeholder={getPlaceholder('buttonPaddingY', 12)} onChange={(e) => updateGlobal({ buttonPaddingY: parseInt(e.target.value) || 0 })} />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">{t('font_size', lang)}</label>
                  <input type="number" className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none" value={getValue('buttonFontSize')} placeholder={getPlaceholder('buttonFontSize', 16)} onChange={(e) => updateGlobal({ buttonFontSize: parseInt(e.target.value) || 0 })} />
               </div>

               <div className="space-y-4">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">{t('animation', lang)}</label>
                  <select
                     className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                     value={getValue('buttonAnimation') || 'none'}
                     onChange={(e) => updateGlobal({ buttonAnimation: e.target.value as any })}
                  >
                     <option value="none">{t('none', lang)}</option>
                     <option value="move-up">{lang === 'en' ? 'Move Up' : 'Spostamento in su'}</option>
                     <option value="scale">{lang === 'en' ? 'Scaling' : 'Ingrandimento'}</option>
                  </select>
               </div>

               <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <label className="text-[12px] font-bold text-zinc-900 uppercase tracking-widest cursor-pointer" htmlFor="btn-caps">{t('uppercase', lang)}</label>
                  <input
                     id="btn-caps"
                     type="checkbox"
                     className="w-5 h-5 rounded-lg border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                     checked={currentSettings.buttonUppercase ?? (isDesktop ? false : desktopSettings.buttonUppercase) ?? false}
                     onChange={(e) => updateGlobal({ buttonUppercase: e.target.checked })}
                  />
               </div>
            </div>
         </div>
      </section>
   );
};

