'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';
import { SectionHeader } from '../ui/SectionHeader';
import { SimpleInput } from '../ui/SimpleInput';
import { ProjectSettings } from '@/types/editor';

interface SeoSectionProps {
   project: any;
   updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
   isUploading: boolean;
   uploadImage: (val: string, filename?: string) => Promise<string>;
}

export const SeoSection: React.FC<SeoSectionProps> = ({
   project,
   updateProjectSettings,
   isUploading,
   uploadImage
}) => {
   return (
      <section className="animate-in fade-in slide-in-from-right-4 duration-500">
         <SectionHeader icon={Globe} title="SEO & Social" colorClass="text-teal-500" />
         <div className="space-y-8 mt-6">
            <div className="flex items-center justify-between gap-2 px-1">
               <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Icone Sito</label>
               {isUploading && <span className="text-[12px] font-bold text-blue-500 animate-pulse uppercase">Caricamento...</span>}
            </div>
            
            <div className="grid gap-6">
               <ImageUpload
                  label="Favicon (1:1)"
                  value={resolveImageUrl(project?.settings?.favicon, project, useEditorStore.getState().imageMemoryCache)}
                  onChange={async (val: string, filename?: string) => {
                     const relativePath = await uploadImage(val, filename);
                     updateProjectSettings({ favicon: relativePath });
                  }}
               />
               <ImageUpload
                  label="Social Sharing Image"
                  showSEOStatus={true}
                  value={resolveImageUrl(project?.settings?.metaImage, project, useEditorStore.getState().imageMemoryCache)}
                  onChange={async (val: string, filename?: string) => {
                     const relativePath = await uploadImage(val, filename as string);
                     updateProjectSettings({ metaImage: relativePath });
                  }}
               />
            </div>

            <div className="space-y-6 pt-4 border-t border-zinc-50">
               <div className="relative">
                  <SimpleInput
                     label="Meta Title"
                     placeholder="Titolo per Google..."
                     value={project?.settings?.metaTitle || ''}
                     onChange={(val) => updateProjectSettings({ metaTitle: val })}
                  />
                  <div className={cn(
                     "absolute top-1 right-2 text-[13px] font-black px-1.5 py-0.5 rounded-full uppercase",
                     (project?.settings?.metaTitle?.length || 0) < 40 || (project?.settings?.metaTitle?.length || 0) > 70 ? "bg-red-50 text-red-500" :
                        (project?.settings?.metaTitle?.length || 0) < 50 || (project?.settings?.metaTitle?.length || 0) > 60 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                  )}>
                     {project?.settings?.metaTitle?.length || 0}/60
                  </div>
               </div>

               <div className="relative">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block pl-1 mb-2">Meta Description</label>
                  <textarea
                     className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none shadow-inner resize-none min-h-[100px]"
                     value={project?.settings?.metaDescription || ''}
                     onChange={(e) => updateProjectSettings({ metaDescription: e.target.value })}
                     placeholder="Descrizione per motori di ricerca..."
                  />
                  <div className={cn(
                     "absolute top-1 right-2 text-[13px] font-black px-1.5 py-0.5 rounded-full uppercase",
                     (project?.settings?.metaDescription?.length || 0) < 100 || (project?.settings?.metaDescription?.length || 0) > 200 ? "bg-red-50 text-red-500" :
                        (project?.settings?.metaDescription?.length || 0) < 110 || (project?.settings?.metaDescription?.length || 0) > 160 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                  )}>
                     {project?.settings?.metaDescription?.length || 0}/160
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

