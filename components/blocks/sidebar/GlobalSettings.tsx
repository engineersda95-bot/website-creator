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
   Globe,
   Settings,
   ChevronUp,
   Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '../../shared/ImageUpload';
import { ProjectSettings } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';
import { SectionHeader, SimpleInput } from './SharedSidebarComponents';

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
            {/* 1. SEO & Social Section */}
            <section className="animate-in fade-in slide-in-from-right-4 duration-500">
               <SectionHeader icon={Globe} title="SEO & Social" colorClass="text-teal-500" />
               <div className="space-y-8 mt-6">
                  <div className="flex items-center justify-between gap-2 px-1">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Icone Sito</label>
                     {isUploading && <span className="text-[10px] font-bold text-blue-500 animate-pulse uppercase">Caricamento...</span>}
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
                           "absolute top-1 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase",
                           (project?.settings?.metaTitle?.length || 0) < 40 || (project?.settings?.metaTitle?.length || 0) > 70 ? "bg-red-50 text-red-500" :
                              (project?.settings?.metaTitle?.length || 0) < 50 || (project?.settings?.metaTitle?.length || 0) > 60 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                        )}>
                           {project?.settings?.metaTitle?.length || 0}/60
                        </div>
                     </div>

                     <div className="relative">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block pl-1 mb-2">Meta Description</label>
                        <textarea
                           className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none shadow-inner resize-none min-h-[100px]"
                           value={project?.settings?.metaDescription || ''}
                           onChange={(e) => updateProjectSettings({ metaDescription: e.target.value })}
                           placeholder="Descrizione per motori di ricerca..."
                        />
                        <div className={cn(
                           "absolute top-1 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase",
                           (project?.settings?.metaDescription?.length || 0) < 100 || (project?.settings?.metaDescription?.length || 0) > 200 ? "bg-red-50 text-red-500" :
                              (project?.settings?.metaDescription?.length || 0) < 110 || (project?.settings?.metaDescription?.length || 0) > 160 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                        )}>
                           {project?.settings?.metaDescription?.length || 0}/160
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* 2. Tipografia Section */}
            <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-75">
               <SectionHeader icon={Type} title="Tipografia" colorClass="text-indigo-500" />
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Fonte Principale</label>
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

            {/* 3. Aspetto & Colori Sezione */}
            <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
               <SectionHeader icon={Palette} title="Aspetto & Colori" colorClass="text-amber-500" />
               <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-3">
                     <button
                        onClick={() => updateProjectSettings({ appearance: 'light' })}
                        className={cn("py-4 flex flex-col items-center gap-2 text-[10px] font-bold border-2 rounded-2xl transition-all", project?.settings?.appearance !== 'dark' ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-[1.05]" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}
                     >
                        <Sun size={20} />
                        <span>CHIARO</span>
                     </button>
                     <button
                        onClick={() => updateProjectSettings({ appearance: 'dark' })}
                        className={cn("py-4 flex flex-col items-center gap-2 text-[10px] font-bold border-2 rounded-2xl transition-all", project?.settings?.appearance === 'dark' ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-[1.05]" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}
                     >
                        <Moon size={20} />
                        <span>SCURO</span>
                     </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                           <Sun size={12} className="text-amber-400" /> Colori Tema Light
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo</label>
                              <input type="color" className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent" value={project?.settings?.themeColors?.light?.bg || '#ffffff'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, light: { bg: e.target.value, text: project?.settings?.themeColors?.light?.text || '#000000' } } })} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo</label>
                              <input type="color" className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent" value={project?.settings?.themeColors?.light?.text || '#000000'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, light: { text: e.target.value, bg: project?.settings?.themeColors?.light?.bg || '#ffffff' } } })} />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4 pt-4 border-t border-zinc-50">
                        <h4 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                           <Moon size={12} className="text-indigo-400" /> Colori Tema Dark
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo</label>
                              <input type="color" className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent" value={project?.settings?.themeColors?.dark?.bg || '#0c0c0e'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, dark: { bg: e.target.value, text: project?.settings?.themeColors?.dark?.text || '#ffffff' } } })} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo</label>
                              <input type="color" className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent" value={project?.settings?.themeColors?.dark?.text || '#ffffff'} onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, dark: { text: e.target.value, bg: project?.settings?.themeColors?.dark?.bg || '#0c0c0e' } } })} />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* 4. Stile Bottoni Section */}
            <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
               <SectionHeader icon={MousePointer2} title="Stile Bottoni" colorClass="text-indigo-500" />
               <div className="space-y-8 mt-6">
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
                        <div className="space-y-8">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Arrotondamento</label>
                                 <input
                                    type="number"
                                    className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                                    value={getValue('buttonRadius')}
                                    placeholder={getPlaceholder('buttonRadius', 0)}
                                    onChange={(e) => updateGlobal({ buttonRadius: parseInt(e.target.value) || 0 })}
                                 />
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Ombra</label>
                                 <select
                                    className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
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

                           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-50">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Padding Oriz.</label>
                                 <input type="number" className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none" value={getValue('buttonPaddingX')} placeholder={getPlaceholder('buttonPaddingX', 32)} onChange={(e) => updateGlobal({ buttonPaddingX: parseInt(e.target.value) || 0 })} />
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Padding Vert.</label>
                                 <input type="number" className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none" value={getValue('buttonPaddingY')} placeholder={getPlaceholder('buttonPaddingY', 12)} onChange={(e) => updateGlobal({ buttonPaddingY: parseInt(e.target.value) || 0 })} />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Dimensione Font</label>
                              <input type="number" className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none" value={getValue('buttonFontSize')} placeholder={getPlaceholder('buttonFontSize', 16)} onChange={(e) => updateGlobal({ buttonFontSize: parseInt(e.target.value) || 0 })} />
                           </div>

                           <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                              <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest cursor-pointer" htmlFor="btn-caps">Tutto Maiuscolo</label>
                              <input
                                 id="btn-caps"
                                 type="checkbox"
                                 className="w-5 h-5 rounded-lg border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                 checked={currentSettings.buttonUppercase ?? (isDesktop ? false : desktopSettings.buttonUppercase) ?? false}
                                 onChange={(e) => updateGlobal({ buttonUppercase: e.target.checked })}
                              />
                           </div>
                        </div>
                     );
                  })()}
               </div>
            </section>

            {/* 5. Colori Brand Section */}
            <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
               <SectionHeader icon={Palette} title="Colori Brand" colorClass="text-blue-500" />
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Primario</label>
                        <input
                           type="color"
                           className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                           value={project?.settings?.primaryColor || '#3b82f6'}
                           onChange={(e) => updateProjectSettings({ primaryColor: e.target.value })}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Secondario</label>
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
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo Bottoni</label>
                        <input
                           type="color"
                           className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                           value={project?.settings?.themeColors?.buttonText || '#ffffff'}
                           onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, buttonText: e.target.value } })}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo Bott. Sec.</label>
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

            {/* 6. Avanzate & Script Detail */}
            <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-300 pb-12">
               <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                     <SectionHeader icon={Settings} title="Avanzate & Script" colorClass="text-zinc-500" />
                     <div className="text-zinc-300 group-open:rotate-180 transition-transform mb-6">
                        <ChevronUp size={16} />
                     </div>
                  </summary>
                  
                  <div className="mt-2 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                     <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden group/alert">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                        <p className="text-[10px] text-zinc-400 font-bold leading-relaxed relative z-10 italic">
                           ⚠️ Incolla solo codici fidati. Gli script funzionano solo sul sito pubblicato, non nell'editor.
                        </p>
                     </div>
                     
                     <div className="space-y-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest pl-1 block">Header Script (HEAD)</label>
                           <textarea
                              className="w-full h-40 p-4 border border-zinc-200 rounded-2xl text-[11px] font-mono bg-zinc-900 text-zinc-300 focus:border-zinc-500 transition-all outline-none resize-none shadow-inner"
                              value={project?.settings?.customScriptsHead || ''}
                              onChange={(e) => updateProjectSettings({ customScriptsHead: e.target.value })}
                              placeholder="<script>... analytics, pixel, cookie banner ... </script>"
                           />
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-zinc-50">
                           <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest pl-1 block">Footer Script (BODY)</label>
                           <textarea
                              className="w-full h-40 p-4 border border-zinc-200 rounded-2xl text-[11px] font-mono bg-zinc-900 text-zinc-300 focus:border-zinc-500 transition-all outline-none resize-none shadow-inner"
                              value={project?.settings?.customScriptsBody || ''}
                              onChange={(e) => updateProjectSettings({ customScriptsBody: e.target.value })}
                              placeholder="<!-- widget chat, conversion scripts -->"
                           />
                        </div>
                     </div>
                  </div>
               </details>
            </section>
         </div>

         {/* Footer branding */}
         <div className="p-6 border-t border-zinc-50 bg-zinc-50/30 shrink-0 text-center">
            <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">Proximatica Engine v2.0</p>
         </div>
      </div>
   );
};
