'use client';

import React from 'react';
import { Globe, Search, Info, CheckCircle2, Languages, Store, MapPin, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';
import { SectionHeader } from '../ui/SectionHeader';
import { SimpleInput } from '../ui/SimpleInput';
import { ProjectSettings, Page } from '@/types/editor';
import { BUSINESS_TYPES, LANGUAGES } from '@/lib/editor-constants';

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
      <section className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
         <div className="space-y-8">
            <SectionHeader icon={Globe} title="SEO & Social Globali" colorClass="text-teal-500" />

            <div className="space-y-6">
               <div className="relative">
                  <SimpleInput
                     label="Meta Title (Default)"
                     placeholder="Titolo per Google..."
                     value={project?.settings?.metaTitle || ''}
                     onChange={(val) => updateProjectSettings({ metaTitle: val })}
                  />
                  <div className={cn(
                     "absolute top-1 right-2 text-[11px] font-black px-1.5 py-0.5 rounded-full uppercase",
                     (project?.settings?.metaTitle?.length || 0) < 40 || (project?.settings?.metaTitle?.length || 0) > 70 ? "bg-red-50 text-red-500" :
                        (project?.settings?.metaTitle?.length || 0) < 50 || (project?.settings?.metaTitle?.length || 0) > 60 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                  )}>
                     {project?.settings?.metaTitle?.length || 0}/60
                  </div>
               </div>

               <div className="relative">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block pl-1 mb-2">Meta Description (Default)</label>
                  <textarea
                     className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none shadow-inner resize-none min-h-[100px]"
                     value={project?.settings?.metaDescription || ''}
                     onChange={(e) => updateProjectSettings({ metaDescription: e.target.value })}
                     placeholder="Descrizione per motori di ricerca..."
                  />
                  <div className={cn(
                     "absolute top-1 right-2 text-[11px] font-black px-1.5 py-0.5 rounded-full uppercase",
                     (project?.settings?.metaDescription?.length || 0) < 100 || (project?.settings?.metaDescription?.length || 0) > 200 ? "bg-red-50 text-red-500" :
                        (project?.settings?.metaDescription?.length || 0) < 110 || (project?.settings?.metaDescription?.length || 0) > 160 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                  )}>
                     {project?.settings?.metaDescription?.length || 0}/160
                  </div>
               </div>

               <ImageUpload
                  label="Immagine Social Globale"
                  showSEOStatus={true}
                  value={resolveImageUrl(project?.settings?.metaImage, project, useEditorStore.getState().imageMemoryCache)}
                  onChange={async (val: string, filename?: string) => {
                     const relativePath = await uploadImage(val, filename as string);
                     updateProjectSettings({ metaImage: relativePath });
                  }}
               />
            </div>
         </div>

         {/* Global Project SEO */}
         <div className="space-y-8 pt-10 border-t border-zinc-100">
            <SectionHeader icon={Languages} title="Impostazioni Globali" colorClass="text-indigo-500" />

            <div className="space-y-6">
               {/* Language Selection */}
               <div className="space-y-2">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block pl-1">Lingua Sito</label>
                  <select
                     className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none cursor-pointer"
                     value={project?.settings?.language || 'it'}
                     onChange={(e) => updateProjectSettings({ language: e.target.value })}
                  >
                     {LANGUAGES.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                     ))}
                  </select>
               </div>

               <ImageUpload
                  label="Favicon Globale (1:1)"
                  value={resolveImageUrl(project?.settings?.favicon, project, useEditorStore.getState().imageMemoryCache)}
                  onChange={async (val: string, filename?: string) => {
                     const relativePath = await uploadImage(val, filename);
                     updateProjectSettings({ favicon: relativePath });
                  }}
               />
            </div>
         </div>

         {/* Structured Data (Schema.org) */}
         <div className="space-y-8 pt-10 border-t border-zinc-100">
            <div className="flex items-center justify-between">
               <SectionHeader icon={Store} title="Dati Attività" colorClass="text-amber-500" />
               <div className="group relative">
                  <Info size={14} className="text-zinc-300 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                     Aiuta Google a capire chi sei e mostrare correttamente le tue info nei risultati di ricerca.
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block pl-1">Tipo di Attività</label>
                     <select
                        className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none cursor-pointer"
                        value={project?.settings?.businessType || 'LocalBusiness'}
                        onChange={(e) => updateProjectSettings({ businessType: e.target.value })}
                     >
                        {BUSINESS_TYPES.map(type => (
                           <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                     </select>
                  </div>

                  {project?.settings?.businessType === 'Restaurant' && (
                     <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block pl-1">Tipo di Cucina</label>
                        <input
                           type="text"
                           placeholder="es. Pizza, Sushi, Mediterranea"
                           className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                           value={project?.settings?.businessDetails?.servesCuisine || ''}
                           onChange={(e) => updateProjectSettings({
                              businessDetails: { ...(project?.settings?.businessDetails || {}), servesCuisine: e.target.value }
                           })}
                        />
                     </div>
                  )}
               </div>

               <div className="grid gap-6">
                  <div className="relative">
                     <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                     <input
                        type="text"
                        placeholder="Nome Pubblico Azienda"
                        className="w-full pl-12 pr-4 py-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={project?.settings?.businessDetails?.businessName || ''}
                        onChange={(e) => updateProjectSettings({
                           businessDetails: { ...(project?.settings?.businessDetails || {}), businessName: e.target.value }
                        })}
                     />
                  </div>

                  <div className="relative">
                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                     <input
                        type="text"
                        placeholder="Via e Numero Civico"
                        className="w-full pl-12 pr-4 py-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={project?.settings?.businessDetails?.address || ''}
                        onChange={(e) => updateProjectSettings({
                           businessDetails: { ...(project?.settings?.businessDetails || {}), address: e.target.value }
                        })}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <input
                        type="text"
                        placeholder="Città"
                        className="w-full px-4 py-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={project?.settings?.businessDetails?.city || ''}
                        onChange={(e) => updateProjectSettings({
                           businessDetails: { ...(project?.settings?.businessDetails || {}), city: e.target.value }
                        })}
                     />
                     <input
                        type="text"
                        placeholder="CAP"
                        className="w-full px-4 py-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={project?.settings?.businessDetails?.postalCode || ''}
                        onChange={(e) => updateProjectSettings({
                           businessDetails: { ...(project?.settings?.businessDetails || {}), postalCode: e.target.value }
                        })}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <input
                        type="text"
                        placeholder="Paese (es: Italia)"
                        className="w-full px-4 py-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={project?.settings?.businessDetails?.country || ''}
                        onChange={(e) => updateProjectSettings({
                           businessDetails: { ...(project?.settings?.businessDetails || {}), country: e.target.value }
                        })}
                     />
                     <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                           type="text"
                           placeholder="Telefono"
                           className="w-full pl-12 pr-4 py-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                           value={project?.settings?.businessDetails?.phone || ''}
                           onChange={(e) => updateProjectSettings({
                              businessDetails: { ...(project?.settings?.businessDetails || {}), phone: e.target.value }
                           })}
                        />
                     </div>
                  </div>

                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                     <input
                        type="email"
                        placeholder="Email"
                        className="w-full pl-12 pr-4 py-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        value={project?.settings?.businessDetails?.email || ''}
                        onChange={(e) => updateProjectSettings({
                           businessDetails: { ...(project?.settings?.businessDetails || {}), email: e.target.value }
                        })}
                     />
                  </div>
               </div>

               <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                     Compila per massimizzare la visibilità locale su Google e altri motori di ricerca.
                  </p>
               </div>
            </div>
         </div>
      </section>
   );
};
