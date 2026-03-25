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
   variant?: 'sidebar' | 'page';
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({
   project,
   updateProjectSettings,
   viewport,
   variant = 'sidebar'
}) => {
   const { isUploading, uploadImage } = useEditorStore();
   const isPage = variant === 'page';

   return (
      <div className={cn("w-full flex flex-col bg-white overflow-hidden relative", isPage ? "" : "h-full shadow-2xl")}>
         {/* Header — hidden in page variant (dashboard has its own) */}
         {!isPage && (
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
               <h2 className="text-sm font-bold text-zinc-900">Design Globale</h2>
               {viewport !== 'desktop' && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[13px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100">
                     <Smartphone size={9} />
                     {viewport}
                  </div>
               )}
            </div>
         )}

         <div className={cn(
            "overflow-y-auto custom-scrollbar bg-white",
            isPage ? "space-y-8 py-2" : "flex-1 p-5 space-y-10"
         )}>
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
      </div>
   );
};

