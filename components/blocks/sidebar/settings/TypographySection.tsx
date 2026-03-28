'use client';

import React from 'react';
import { Type } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { SimpleSlider } from '../ui/SimpleSlider';
import { ProjectSettings } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { FontManager } from '../ui/FontManager';
import { t } from '@/lib/i18n';

interface TypographySectionProps {
   project: any;
   updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
}

export const TypographySection: React.FC<TypographySectionProps> = ({
   project,
   updateProjectSettings
}) => {
   const viewport = useEditorStore((state: any) => state.viewport);
   const lang = project?.settings?.defaultLanguage || 'it';
   
   // Handle responsive settings
   const isDesktop = viewport === 'desktop';
   const baseTypography = project?.settings?.typography || {};
   const responsiveTypography = project?.settings?.responsive?.[viewport]?.typography || {};
   
   // Current settings being edited
   const typography = isDesktop ? baseTypography : { ...baseTypography, ...responsiveTypography };

   const updateTypography = (updates: any) => {
      if (isDesktop) {
         updateProjectSettings({
            typography: { ...baseTypography, ...updates }
         });
      } else {
         updateProjectSettings({
            typography: { ...responsiveTypography, ...updates }
         });
      }
   };

   return (
      <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-75">
         <SectionHeader icon={Type} title={`${t('typography', lang)} ${!isDesktop ? `(${viewport.toUpperCase()})` : ''}`} colorClass="text-indigo-500" />
         
         <div className="space-y-8">
            <div className="space-y-4">
               <FontManager 
                  value={project?.settings?.fontFamily || 'Outfit'} 
                  onChange={(val: string) => updateProjectSettings({ fontFamily: val })} 
                  label={t('font_family', lang)}
               />
            </div>

            <div className="space-y-6 pt-6 border-t border-zinc-50">
               <label className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em] block mb-2">
                  {t('default_sizes', lang)} {!isDesktop ? `SEO (${viewport})` : ''}
               </label>
               
               <SimpleSlider 
                  label="Titolo H1" 
                  value={typography.h1Size || (isDesktop ? 64 : 40)} 
                  onChange={(val) => updateTypography({ h1Size: val })} 
                  min={24} max={120} 
               />
               <SimpleSlider 
                  label="Titolo H2" 
                  value={typography.h2Size || (isDesktop ? 48 : 32)} 
                  onChange={(val) => updateTypography({ h2Size: val })} 
                  min={20} max={96} 
               />
               <SimpleSlider 
                  label="Titolo H3" 
                  value={typography.h3Size || (isDesktop ? 32 : 24)} 
                  onChange={(val) => updateTypography({ h3Size: val })} 
                  min={18} max={72} 
               />
               <SimpleSlider 
                  label="Titolo H4" 
                  value={typography.h4Size || (isDesktop ? 24 : 20)} 
                  onChange={(val) => updateTypography({ h4Size: val })} 
                  min={16} max={64} 
               />
               <SimpleSlider 
                  label="Titolo H5" 
                  value={typography.h5Size || (isDesktop ? 20 : 18)} 
                  onChange={(val) => updateTypography({ h5Size: val })} 
                  min={14} max={48} 
               />
               <SimpleSlider 
                  label="Titolo H6" 
                  value={typography.h6Size || (isDesktop ? 16 : 16)} 
                  onChange={(val) => updateTypography({ h6Size: val })} 
                  min={12} max={32} 
               />
               <SimpleSlider 
                  label="Testo Corpo" 
                  value={typography.bodySize || (isDesktop ? 16 : 14)} 
                  onChange={(val) => updateTypography({ bodySize: val })} 
                  min={12} max={24} 
               />
            </div>
         </div>
      </section>
   );
};

