'use client';

import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/useEditorStore';
import { ProjectSettings } from '@/types/editor';

// Modular Sections
import { SeoSection } from './settings/SeoSection';
import { ThemeSection } from './settings/ThemeSection';
import { ButtonDesignSection } from './settings/ButtonDesignSection';
import { TypographySection } from './settings/TypographySection';
import { AdvancedSection } from './settings/AdvancedSection';

interface GlobalSettingsProps {
   project: any;
   updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
   viewport: string;
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({
   project,
   updateProjectSettings,
   viewport
}) => {
   const { isUploading, uploadImage } = useEditorStore();

   return (
      <div className="w-full flex flex-col h-full bg-white overflow-hidden shadow-2xl relative">
         <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-black text-zinc-900 tracking-tight">Design Globale</h2>
               <div className={cn(
                  "px-2 py-1 rounded-md flex items-center gap-1.5 border animate-in fade-in zoom-in duration-300",
                  viewport === 'desktop' ? "bg-zinc-100 border-zinc-200 text-zinc-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"
               )}>
                  {viewport === 'desktop' ? <Monitor size={10} /> : <Smartphone size={10} />}
                  <span className="text-[10px] font-black uppercase tracking-wider">
                     {viewport}
                  </span>
               </div>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Personalizza l'estetica del tuo sito</p>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-12 bg-white">
            <SeoSection
               project={project}
               updateProjectSettings={updateProjectSettings}
               isUploading={isUploading}
               uploadImage={uploadImage}
            />

            <TypographySection
               project={project}
               updateProjectSettings={updateProjectSettings}
            />

            <ThemeSection
               project={project}
               updateProjectSettings={updateProjectSettings}
            />

            <ButtonDesignSection
               project={project}
               updateProjectSettings={updateProjectSettings}
               viewport={viewport}
            />

            <AdvancedSection
               project={project}
               updateProjectSettings={updateProjectSettings}
            />
         </div>

         {/* Footer branding */}
         <div className="p-6 border-t border-zinc-50 bg-zinc-50/30 shrink-0 text-center">
            <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">v2.0</p>
         </div>
      </div>
   );
};
