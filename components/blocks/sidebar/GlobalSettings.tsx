'use client';

import React from 'react';
import {
   Type,
   Palette,
   Sun,
   Moon,
   MousePointer2,
   Monitor,
   Smartphone,
   Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '../../shared/ImageUpload';
import { ProjectSettings } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

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
      <div className="w-full flex flex-col h-full overflow-y-auto">
         <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-black text-zinc-900 tracking-tight">Design Globale</h2>
               <div className={cn(
                  "px-2 py-1 rounded-md flex items-center gap-1.5 border animate-in fade-in zoom-in duration-300",
                  viewport === 'desktop' ? "bg-zinc-100 border-zinc-200 text-zinc-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"
               )}>
                  {viewport === 'desktop' ? <Monitor size={10} /> : <Smartphone size={10} />}
                  <span className="text-[9px] font-black uppercase tracking-tight">Stai modificando: {viewport}</span>
               </div>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Personalizza l'estetica del tuo sito</p>
         </div>

         <div className="p-6 space-y-10">
            <section>
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Globe size={14} className="text-teal-500" /> SEO GLOBALE
               </h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between gap-2 px-1">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Favicon & Meta</label>
                     {isUploading && <span className="text-[10px] font-bold text-blue-500 animate-pulse uppercase">Caricamento...</span>}
                  </div>
                  <ImageUpload
                     label={
                        <div className="flex items-center justify-between w-full">
                           <span>Favicon Sito (immagine quadrata)</span>
                        </div>
                     }
                     value={resolveImageUrl(project?.settings?.favicon, project, useEditorStore.getState().imageMemoryCache)}
                     onChange={async (val: string, filename?: string) => {
                        const relativePath = await uploadImage(val, filename);
                        updateProjectSettings({ favicon: relativePath });
                     }}
                  />
                  <ImageUpload
                     label="Social Meta Image"
                     showSEOStatus={true}
                     value={resolveImageUrl(project?.settings?.metaImage, project, useEditorStore.getState().imageMemoryCache)}
                     onChange={async (val: string, filename?: string) => {
                        const relativePath = await uploadImage(val, filename as string);
                        updateProjectSettings({ metaImage: relativePath });
                     }}
                  />
                  <div className="space-y-2">
                     <div className="flex items-center justify-between pl-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Meta Title</label>
                        <span className={cn(
                           "text-[9px] font-bold",
                           (project?.settings?.metaTitle?.length || 0) < 40 || (project?.settings?.metaTitle?.length || 0) > 70 ? "text-red-500" :
                              (project?.settings?.metaTitle?.length || 0) < 50 || (project?.settings?.metaTitle?.length || 0) > 60 ? "text-amber-500" : "text-emerald-500"
                        )}>
                           {project?.settings?.metaTitle?.length || 0} / 60
                        </span>
                     </div>
                     <input
                        type="text"
                        className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold focus:ring-0 outline-none"
                        value={project?.settings?.metaTitle || ''}
                        onChange={(e) => updateProjectSettings({ metaTitle: e.target.value })}
                        placeholder="Titolo del sito"
                     />
                     <p className="text-[9px] text-zinc-400 px-1 font-medium">Consigliato: 50-60 caratteri. Attuale: {project?.settings?.metaTitle?.length || 0}</p>
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between pl-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Meta Description</label>
                        <span className={cn(
                           "text-[9px] font-bold",
                           (project?.settings?.metaDescription?.length || 0) < 100 || (project?.settings?.metaDescription?.length || 0) > 200 ? "text-red-500" :
                              (project?.settings?.metaDescription?.length || 0) < 110 || (project?.settings?.metaDescription?.length || 0) > 160 ? "text-amber-500" : "text-emerald-500"
                        )}>
                           {project?.settings?.metaDescription?.length || 0} / 160
                        </span>
                     </div>
                     <textarea
                        className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-medium focus:ring-0 outline-none resize-none"
                        rows={3}
                        value={project?.settings?.metaDescription || ''}
                        onChange={(e) => updateProjectSettings({ metaDescription: e.target.value })}
                        placeholder="Descrizione per i motori di ricerca..."
                     />
                     <p className="text-[9px] text-zinc-400 px-1 font-medium">Consigliato: 110-160 caratteri. Attuale: {project?.settings?.metaDescription?.length || 0}</p>
                  </div>
               </div>
            </section>

            <section className="pt-8 border-t border-zinc-100">
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Type size={14} className="text-indigo-500" /> Carattere (Font)
               </h3>
               <div className="p-1 bg-zinc-50 rounded-2xl border border-zinc-100 mb-6 font-bold">
                  <select
                     className="w-full p-4 bg-transparent text-sm font-black focus:ring-0 outline-none cursor-pointer"
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
            </section>

            <section className="pt-8 border-t border-zinc-100">
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Moon size={14} className="text-amber-500" /> Tema Globale
               </h3>
               <div className="grid grid-cols-2 gap-2">
                  <button
                     onClick={() => updateProjectSettings({ appearance: 'light' })}
                     className={cn("py-4 flex flex-col items-center gap-2 text-[10px] font-bold border-2 rounded-2xl transition-all", project?.settings?.appearance !== 'dark' ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-[1.05]" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}
                  >
                     <Sun size={20} />
                     <span>LUCE (LIGHT)</span>
                  </button>
                  <button
                     onClick={() => updateProjectSettings({ appearance: 'dark' })}
                     className={cn("py-4 flex flex-col items-center gap-2 text-[10px] font-bold border-2 rounded-2xl transition-all", project?.settings?.appearance === 'dark' ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-[1.05]" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}
                  >
                     <Moon size={20} />
                     <span>BUIO (DARK)</span>
                  </button>
               </div>
            </section>

            <section className="pt-8 border-t border-zinc-100">
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Sun size={14} className="text-amber-500" /> Colori Tema Light
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Sfondo</label>
                     <input type="color" className="w-full h-10 border border-zinc-200 rounded-lg" value={project?.settings?.themeColors?.light?.bg || '#ffffff'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, light: { bg: e.target.value, text: project?.settings?.themeColors?.light?.text || '#000000' } } })} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Testo</label>
                     <input type="color" className="w-full h-10 border border-zinc-200 rounded-lg" value={project?.settings?.themeColors?.light?.text || '#000000'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, light: { text: e.target.value, bg: project?.settings?.themeColors?.light?.bg || '#ffffff' } } })} />
                  </div>
               </div>
            </section>

            <section className="pt-8 border-t border-zinc-100">
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Moon size={14} className="text-indigo-500" /> Colori Tema Dark
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Sfondo</label>
                     <input type="color" className="w-full h-10 border border-zinc-200 rounded-lg" value={project?.settings?.themeColors?.dark?.bg || '#0c0c0e'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, dark: { bg: e.target.value, text: project?.settings?.themeColors?.dark?.text || '#ffffff' } } })} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Testo</label>
                     <input type="color" className="w-full h-10 border border-zinc-200 rounded-lg" value={project?.settings?.themeColors?.dark?.text || '#ffffff'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, dark: { text: e.target.value, bg: project?.settings?.themeColors?.dark?.bg || '#0c0c0e' } } })} />
                  </div>
               </div>
            </section>


            <section className="pt-8 border-t border-zinc-100">
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <MousePointer2 size={14} className="text-indigo-500" /> Stile Bottoni
               </h3>
               <div className="space-y-6">
                  {(() => {
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
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Arrotondamento</label>
                                 <input
                                    type="number"
                                    className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                                    value={getValue('buttonRadius')}
                                    placeholder={getPlaceholder('buttonRadius', 0)}
                                    onChange={(e) => updateGlobal({ buttonRadius: parseInt(e.target.value) || 0 })}
                                 />
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Ombra</label>
                                 <select
                                    className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                                    value={getValue('buttonShadow')}
                                    onChange={(e) => updateGlobal({ buttonShadow: e.target.value as any })}
                                 >
                                    {!isDesktop && <option value="">Eredita ({desktopSettings.buttonShadow || 'Nessuna'})</option>}
                                    <option value="none">Nessuna</option>
                                    <option value="S">Piccola</option>
                                    <option value="M">Media</option>
                                    <option value="L">Grande</option>
                                 </select>
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase cursor-pointer" htmlFor="btn-border">Abilita Bordo</label>
                              <input
                                 id="btn-border"
                                 type="checkbox"
                                 className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                 checked={currentSettings.buttonBorder ?? (isDesktop ? false : desktopSettings.buttonBorder) ?? false}
                                 onChange={(e) => updateGlobal({ buttonBorder: e.target.checked })}
                              />
                           </div>

                           {(currentSettings.buttonBorder ?? (isDesktop ? false : desktopSettings.buttonBorder)) && (
                              <div className="grid grid-cols-2 gap-4 pt-2">
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Colore Bordo</label>
                                    <input
                                       type="color"
                                       className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                                       value={getValue('buttonBorderColor') || (isDesktop ? '#ffffff' : desktopSettings.buttonBorderColor || '#ffffff')}
                                       onChange={(e) => updateGlobal({ buttonBorderColor: e.target.value })}
                                    />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Spessore (px)</label>
                                    <input
                                       type="number"
                                       className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                                       value={getValue('buttonBorderWidth')}
                                       placeholder={getPlaceholder('buttonBorderWidth', 1)}
                                       onChange={(e) => updateGlobal({ buttonBorderWidth: parseInt(e.target.value) || 1 })}
                                    />
                                 </div>
                              </div>
                           )}

                           <div className="pt-4 border-t border-zinc-100 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Padding Oriz (px)</label>
                                    <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getValue('buttonPaddingX')} placeholder={getPlaceholder('buttonPaddingX', 32)} onChange={(e) => updateGlobal({ buttonPaddingX: parseInt(e.target.value) || 0 })} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Padding Vert (px)</label>
                                    <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getValue('buttonPaddingY')} placeholder={getPlaceholder('buttonPaddingY', 12)} onChange={(e) => updateGlobal({ buttonPaddingY: parseInt(e.target.value) || 0 })} />
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Dimensione Testo (px)</label>
                                    <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getValue('buttonFontSize')} placeholder={getPlaceholder('buttonFontSize', 16)} onChange={(e) => updateGlobal({ buttonFontSize: parseInt(e.target.value) || 0 })} />
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase cursor-pointer" htmlFor="btn-caps">Tutto Maiuscolo</label>
                              <input
                                 id="btn-caps"
                                 type="checkbox"
                                 className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                 checked={currentSettings.buttonUppercase ?? (isDesktop ? false : desktopSettings.buttonUppercase) ?? false}
                                 onChange={(e) => updateGlobal({ buttonUppercase: e.target.checked })}
                              />
                           </div>
                        </div>
                     );
                  })()}
               </div>
            </section>
            <section>
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Palette size={14} className="text-blue-500" /> Colori Bottoni
               </h3>
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Sfondo Primario</label>
                        <input
                           type="color"
                           className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                           value={project?.settings?.primaryColor || '#3b82f6'}
                           onChange={(e) => updateProjectSettings({ primaryColor: e.target.value })}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Sfondo Secondario</label>
                        <input
                           type="color"
                           className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                           value={project?.settings?.secondaryColor || '#10b981'}
                           onChange={(e) => updateProjectSettings({ secondaryColor: e.target.value })}
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Testo Primario</label>
                        <input
                           type="color"
                           className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                           value={project?.settings?.themeColors?.buttonText || '#ffffff'}
                           onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, buttonText: e.target.value } })}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Testo Secondario</label>
                        <input
                           type="color"
                           className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                           value={project?.settings?.themeColors?.buttonTextSecondary || '#ffffff'}
                           onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, buttonTextSecondary: e.target.value } })}
                        />
                     </div>
                  </div>
               </div>
            </section>
         </div>
      </div>
   );
};
