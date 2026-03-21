'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
   X,
   Settings,
   Image as ImageIcon,
   Type,
   AlignLeft,
   AlignCenter,
   AlignRight,
   Layout,
   Palette,
   MousePointer2,
   Globe,
   Plus,
   Trash2,
   Layers,
   Sparkles,
   Zap,
   Maximize,
   Move,
   Star,
   Check,
   Heart,
   Smile,
   Award,
   Briefcase,
   Code,
   Camera,
   Rocket,
   Columns,
   Map as MapIcon,
   LogOut,
   User as UserIcon,
   Instagram,
   Twitter,
   Video,
   Share2,
   Italic,
   Bold,
   Sun,
   Moon,
   Smartphone,
   Tablet,
   Monitor,
   ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from './ImageUpload';

const ICON_MAP: Record<string, any> = {
   star: Star,
   zap: Zap,
   check: Check,
   heart: Heart,
   smile: Smile,
   award: Award,
   briefcase: Briefcase,
   code: Code,
   camera: Camera,
   layers: Layers,
   rocket: Rocket
};

const DEFAULT_CTA = { enabled: false, label: 'Prenota', url: '#', theme: 'primary' as const };

export const ConfigSidebar: React.FC = () => {
   const { project, projectPages, selectedBlockId, currentPage, updateBlock, removeBlock, updateProjectSettings, viewport, updateBlockStyle } = useEditorStore();
   const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');

   const selectedBlock = currentPage?.blocks.find(b => b.id === selectedBlockId);

   if (!selectedBlock) {
      return (
         <div className="w-80 shrink-0 z-20 bg-white border-l border-zinc-200 flex flex-col h-full shadow-sm animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 flex flex-col gap-2">
               <h2 className="text-xl font-black text-zinc-900 tracking-tight">Personalizzazione Sito</h2>
               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Impostazioni Globali & Branding</p>
            </div>

            <div className="p-6 space-y-10">
               <section>
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
               <section>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                     <Palette size={14} className="text-blue-500" /> Colori & Visual
                  </h3>
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Colore Primario</label>
                           <input
                              type="color"
                              className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                              value={project?.settings?.primaryColor || '#3b82f6'}
                              onChange={(e) => updateProjectSettings({ primaryColor: e.target.value })}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Colore Secondario</label>
                           <input
                              type="color"
                              className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                              value={project?.settings?.secondaryColor || '#10b981'}
                              onChange={(e) => updateProjectSettings({ secondaryColor: e.target.value })}
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Testo Bottoni (Globale)</label>
                        <input
                           type="color"
                           className="w-full h-8 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                           value={project?.settings?.themeColors?.buttonText || '#ffffff'}
                           onChange={(e) => updateProjectSettings({ themeColors: { ...project?.settings?.themeColors, buttonText: e.target.value } })}
                        />
                     </div>
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
                     <MousePointer2 size={14} className="text-indigo-500" /> Stile Bottoni
                  </h3>
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Arrotondamento</label>
                           <input
                              type="number"
                              className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                              value={project?.settings?.buttonRadius || 0}
                              onChange={(e) => updateProjectSettings({ buttonRadius: parseInt(e.target.value) || 0 })}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Ombra</label>
                           <select
                              className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                              value={project?.settings?.buttonShadow || 'M'}
                              onChange={(e) => updateProjectSettings({ buttonShadow: e.target.value as any })}
                           >
                              <option value="none">Nessuna</option>
                              <option value="S">Piccola</option>
                              <option value="M">Media</option>
                              <option value="L">Grande</option>
                           </select>
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase cursor-pointer" htmlFor="btn-border">Abilita Bordo</label>
                        <input id="btn-border" type="checkbox" className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" checked={!!project?.settings?.buttonBorder} onChange={(e) => updateProjectSettings({ buttonBorder: e.target.checked })} />
                     </div>

                     {project?.settings?.buttonBorder && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <div>
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Colore Bordo</label>
                              <input
                                 type="color"
                                 className="w-full h-10 border border-zinc-200 rounded-lg cursor-pointer bg-transparent"
                                 value={project?.settings?.buttonBorderColor || '#ffffff'}
                                 onChange={(e) => updateProjectSettings({ buttonBorderColor: e.target.value })}
                              />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Spessore (px)</label>
                              <input
                                 type="number"
                                 className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                                 value={project?.settings?.buttonBorderWidth || 1}
                                 onChange={(e) => updateProjectSettings({ buttonBorderWidth: parseInt(e.target.value) || 1 })}
                              />
                           </div>
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                        <div>
                           <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Larghezza Bottoni (px)</label>
                           <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={project?.settings?.buttonPaddingX || 32} onChange={(e) => updateProjectSettings({ buttonPaddingX: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Altezza Bottoni (px)</label>
                           <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={project?.settings?.buttonPaddingY || 12} onChange={(e) => updateProjectSettings({ buttonPaddingY: parseInt(e.target.value) || 0 })} />
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase cursor-pointer" htmlFor="btn-caps">Tutto Maiuscolo</label>
                        <input id="btn-caps" type="checkbox" className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" checked={!!project?.settings?.buttonUppercase} onChange={(e) => updateProjectSettings({ buttonUppercase: e.target.checked })} />
                     </div>
                  </div>
               </section>


            </div>
         </div>
      );
   }

   const updateContent = (newContent: any) => {
      updateBlock(selectedBlock.id, { ...selectedBlock.content, ...newContent });
   };

   const updateStyle = (newStyle: any) => {
      updateBlockStyle(selectedBlock.id, newStyle);
   };

   // Helper for responsive values
   const getStyleValue = (key: string, defaultValue: any) => {
      if (viewport === 'desktop') return selectedBlock.style?.[key] ?? defaultValue;
      return selectedBlock.responsiveStyles?.[viewport]?.[key] ?? selectedBlock.style?.[key] ?? defaultValue;
   };

   return (
      <div className="w-80 shrink-0 z-20 bg-white border-l border-zinc-200 flex flex-col h-full shadow-sm animate-in slide-in-from-right duration-200">
         <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2">
               <div className="truncate max-w-[150px] uppercase text-[10px] font-black text-zinc-400 tracking-wider">
                  Edit: {selectedBlock.type}
               </div>
            </div>
            <button
               onClick={() => useEditorStore.getState().selectBlock(null)}
               className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400 transition-colors"
            >
               <X size={18} />
            </button>
         </div>

         <div className="flex border-b border-zinc-200 bg-zinc-50/50">
            <button
               onClick={() => setActiveTab('content')}
               className={cn(
                  "flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase tracking-widest",
                  activeTab === 'content' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
               )}
            >
               Contenuto
            </button>
            <button
               onClick={() => setActiveTab('style')}
               className={cn(
                  "flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase tracking-widest",
                  activeTab === 'style' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
               )}
            >
               Stile
            </button>
         </div>

         <div className="flex-1 overflow-y-auto w-full">
            {activeTab === 'content' ? (
               <div className="p-6 space-y-8 animate-in fade-in duration-500">
                  {selectedBlock.type === 'navigation' && (
                     <div className="space-y-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Logo / Brand</label>
                           <div className="grid grid-cols-3 gap-1">
                              <button onClick={() => updateContent({ logoType: 'text' })} className={cn("py-2 text-[10px] font-bold border rounded-lg", (selectedBlock.content.logoType || 'text') === 'text' ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}>TESTO</button>
                              <button onClick={() => updateContent({ logoType: 'image' })} className={cn("py-2 text-[10px] font-bold border rounded-lg", selectedBlock.content.logoType === 'image' ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}>LOGO</button>
                              <button onClick={() => updateContent({ logoType: 'both' })} className={cn("py-2 text-[10px] font-bold border rounded-lg", selectedBlock.content.logoType === 'both' ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}>ENTRAMBI</button>
                           </div>
                           {selectedBlock.content.logoType !== 'image' && (
                              <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm font-bold" placeholder="Testo Logo" value={selectedBlock.content.logoText || ''} onChange={(e) => updateContent({ logoText: e.target.value })} />
                           )}
                           {selectedBlock.content.logoType !== 'text' && (
                              <ImageUpload label="File Logo" value={selectedBlock.content.logoImage} onChange={(val) => updateContent({ logoImage: val })} />
                           )}
                           <div className="p-3 bg-zinc-50 rounded-2xl space-y-4 border border-zinc-100">
                              <div className="flex items-center justify-between gap-4">
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase">Dim. Testo Logo (px)</label>
                                 <input
                                    type="number"
                                    className="w-20 p-2 border rounded-lg text-xs"
                                    value={getStyleValue('logoTextSize', selectedBlock.content?.logoTextSize || 24)}
                                    onChange={(e) => updateStyle({ logoTextSize: parseInt(e.target.value) })}
                                 />
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase">Dim. Immagine Logo (px)</label>
                                 <input
                                    type="number"
                                    className="w-20 p-2 border rounded-lg text-xs"
                                    value={getStyleValue('logoSize', selectedBlock.content?.logoSize || 40)}
                                    onChange={(e) => updateStyle({ logoSize: parseInt(e.target.value) })}
                                 />
                              </div>
                           </div>
                           <div className="pt-2">
                              <div className="flex items-center justify-between mb-2">
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Link Logo a Home</label>
                                 <input type="checkbox" className="w-5 h-5 rounded border-zinc-300" checked={!!selectedBlock.content.logoLinkHome} onChange={(e) => updateContent({ logoLinkHome: e.target.checked })} />
                              </div>
                              {selectedBlock.content.logoLinkHome && (
                                 <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-[10px]" placeholder="URL personalizzato (default: /)" value={selectedBlock.content.logoUrl || '/'} onChange={(e) => updateContent({ logoUrl: e.target.value })} />
                              )}
                           </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Link Menu</label>
                           <div className="space-y-3">
                              {(selectedBlock.content.links || []).map((link: any, i: number) => (
                                 <div key={i} className="space-y-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <div className="flex gap-2">
                                       <input className="flex-1 p-1.5 bg-white border border-zinc-200 rounded text-xs font-bold" placeholder="Etichetta" value={link.label} onChange={(e) => {
                                          const nl = [...selectedBlock.content.links]; nl[i].label = e.target.value; updateContent({ links: nl });
                                       }} />
                                       <button onClick={() => updateContent({ links: selectedBlock.content.links.filter((_: any, idx: number) => idx !== i) })} className="p-1 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                    <input className="w-full p-1.5 bg-white border border-zinc-200 rounded text-[10px]" placeholder="URL (es: /chi-siamo o https://...)" value={link.url} onChange={(e) => {
                                       const nl = [...selectedBlock.content.links]; nl[i].url = e.target.value; updateContent({ links: nl });
                                    }} />
                                 </div>
                              ))}
                              <button onClick={() => updateContent({ links: [...(selectedBlock.content.links || []), { label: 'Nuovo Link', url: '#' }] })} className="w-full p-2 border-2 border-dashed rounded-xl text-xs text-zinc-400 hover:bg-zinc-50 transition-colors font-black">+ AGGIUNGI LINK</button>
                           </div>
                        </div>

                        <div className="pt-4 border-t space-y-4">
                           <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mostra Bottone CTA</label>
                              <input type="checkbox" className="w-5 h-5 rounded border-zinc-300" checked={!!selectedBlock.content.showContact} onChange={(e) => updateContent({ showContact: e.target.checked })} />
                           </div>
                           {selectedBlock.content.showContact && (
                              <>
                                 <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm font-bold" placeholder="Testo Bottone (es: Prenota)" value={selectedBlock.content.cta || ''} onChange={(e) => updateContent({ cta: e.target.value })} />
                                 <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-[10px]" placeholder="URL Bottone" value={selectedBlock.content.ctaUrl || ''} onChange={(e) => updateContent({ ctaUrl: e.target.value })} />
                              </>
                           )}
                        </div>

                        <div className="pt-4 border-t">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Layout Menu</label>
                           <div className="grid grid-cols-2 gap-2">
                              <button onClick={() => updateContent({ layoutType: 'standard' })} className={cn("py-2.5 text-[10px] font-bold border-2 rounded-xl transition-all", (selectedBlock.content.layoutType || 'standard') === 'standard' ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-400 border-zinc-100")}>LISTA</button>
                              <button onClick={() => updateContent({ layoutType: 'hamburger' })} className={cn("py-2.5 text-[10px] font-bold border-2 rounded-xl transition-all", selectedBlock.content.layoutType === 'hamburger' ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-400 border-zinc-100")}>HAMBURGER</button>
                           </div>
                        </div>
                     </div>
                  )}

                  {selectedBlock.type === 'hero' && (
                     <div className="space-y-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Testi Hero</label>
                           <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50" placeholder="Titolo" value={selectedBlock.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} />
                           <textarea className="w-full p-3 border border-zinc-200 rounded-xl text-sm h-32 bg-zinc-50" placeholder="Sottotitolo" value={selectedBlock.content.subtitle || ''} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Azione (CTA)</label>
                           <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50" placeholder="Testo Bottone" value={selectedBlock.content.cta || ''} onChange={(e) => updateContent({ cta: e.target.value })} />
                           <input className="w-full p-3 border border-zinc-200 rounded-xl text-[10px] bg-zinc-50" placeholder="URL Destinazione (es: #contatti)" value={selectedBlock.content.ctaUrl || ''} onChange={(e) => updateContent({ ctaUrl: e.target.value })} />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sfondo</label>
                           <ImageUpload label="Immagine" value={selectedBlock.content.backgroundImage} onChange={(val) => updateContent({ backgroundImage: val })} />

                           {selectedBlock.content.backgroundImage && (
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Dimensione Immagine</label>
                                 <div className="grid grid-cols-3 gap-1">
                                    {['cover', 'contain', 'auto'].map(sz => (
                                       <button
                                          key={sz}
                                          onClick={() => updateStyle({ backgroundSize: sz })}
                                          className={cn("py-2 text-[10px] font-bold border rounded-lg uppercase", getStyleValue('backgroundSize', 'cover') === sz ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}
                                       >
                                          {sz}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>

                        {selectedBlock.content.backgroundImage && (
                           <div className="space-y-6 pt-4 border-t border-zinc-100">
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                                    <span>Opacità Overlay</span>
                                    <span className="text-zinc-900 font-bold">{getStyleValue('overlayOpacity', 40)}%</span>
                                 </label>
                                 <input type="range" min="0" max="100" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900" value={getStyleValue('overlayOpacity', 40)} onChange={(e) => updateStyle({ overlayOpacity: parseInt(e.target.value) })} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Luminosità</label>
                                    <input type="range" min="0" max="200" className="w-full h-1.5 bg-zinc-100 rounded-lg accent-zinc-900" value={getStyleValue('brightness', 100)} onChange={(e) => updateStyle({ brightness: parseInt(e.target.value) })} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Sfocatura</label>
                                    <input type="range" min="0" max="20" className="w-full h-1.5 bg-zinc-100 rounded-lg accent-zinc-900" value={getStyleValue('blur', 0)} onChange={(e) => updateStyle({ blur: parseInt(e.target.value) })} />
                                 </div>
                              </div>
                              <div className="flex items-center justify-between">
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bianco e Nero</label>
                                 <input type="checkbox" className="w-5 h-5 rounded border-zinc-300" checked={!!getStyleValue('grayscale', false)} onChange={(e) => updateStyle({ grayscale: e.target.checked })} />
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {selectedBlock.type === 'image-text' && (
                     <div className="space-y-6">
                        <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50" placeholder="Titolo" value={selectedBlock.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} />
                        <textarea className="w-full p-3 border border-zinc-200 rounded-xl text-sm h-32 bg-zinc-50" placeholder="Testo" value={selectedBlock.content.text || ''} onChange={(e) => updateContent({ text: e.target.value })} />
                        <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50" placeholder="Testo Bottone" value={selectedBlock.content.cta || ''} onChange={(e) => updateContent({ cta: e.target.value })} />
                        <ImageUpload label="Immagine" value={selectedBlock.content.image} onChange={(val) => updateContent({ image: val })} />
                        <div className="flex items-center justify-between pt-4 border-t">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Posizione Foto</label>
                           <div className="flex border rounded-lg overflow-hidden">
                              <button onClick={() => updateContent({ imageSide: 'left' })} className={cn("p-2", selectedBlock.content.imageSide !== 'right' ? "bg-zinc-900 text-white" : "text-zinc-400")}><AlignLeft size={16} /></button>
                              <button onClick={() => updateContent({ imageSide: 'center' })} className={cn("p-2", selectedBlock.content.imageSide === 'center' ? "bg-zinc-900 text-white" : "text-zinc-400")}><AlignCenter size={16} /></button>
                              <button onClick={() => updateContent({ imageSide: 'right' })} className={cn("p-2", selectedBlock.content.imageSide === 'right' ? "bg-zinc-900 text-white" : "text-zinc-400")}><AlignRight size={16} /></button>
                           </div>
                        </div>
                     </div>
                  )}

                  {selectedBlock.type === 'services' && (
                     <div className="space-y-6">
                        <input className="w-full p-3 border rounded-xl text-sm font-bold bg-zinc-50" placeholder="Titolo Sezione" value={selectedBlock.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} />
                        <textarea className="w-full p-3 border rounded-xl text-sm bg-zinc-50" placeholder="Sottotitolo" value={selectedBlock.content.subtitle || ''} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                        <div className="space-y-4 pt-4 border-t">
                           <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-zinc-400 uppercase">Servizi Elencati</label>
                              <button onClick={() => updateContent({ items: [...(selectedBlock.content.items || []), { title: 'Nuovo Servizio', description: '', icon: 'star' }] })} className="p-1 px-3 bg-zinc-900 text-white rounded-lg text-[10px] uppercase font-bold">+ AGGIUNGI</button>
                           </div>
                           <div className="space-y-4">
                              {(selectedBlock.content.items || []).map((item: any, i: number) => (
                                 <div key={i} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                       <input className="flex-1 bg-transparent border-none text-xs font-bold outline-none" value={item.title} onChange={(e) => {
                                          const ni = [...selectedBlock.content.items]; ni[i].title = e.target.value; updateContent({ items: ni });
                                       }} />
                                       <button onClick={() => updateContent({ items: selectedBlock.content.items.filter((_: any, idx: number) => idx !== i) })} className="text-zinc-300 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                    <textarea className="w-full p-2 text-[10px] border border-zinc-100 rounded-lg bg-white h-20" placeholder="Descrizione..." value={item.description} onChange={(e) => {
                                       const ni = [...selectedBlock.content.items]; ni[i].description = e.target.value; updateContent({ items: ni });
                                    }} />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {selectedBlock.type === 'contact' && (
                     <div className="space-y-6">
                        <div>
                           <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block">Modo Contatto</label>
                           <div className="grid grid-cols-2 gap-2">
                              <button onClick={() => updateContent({ type: 'form' })} className={cn("py-2.5 text-[10px] font-bold border-2 rounded-xl transition-all", (selectedBlock.content.type || 'form') === 'form' ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "text-zinc-400 border-zinc-100")}>MODULO MAIL</button>
                              <button onClick={() => updateContent({ type: 'info' })} className={cn("py-2.5 text-[10px] font-bold border-2 rounded-xl transition-all", selectedBlock.content.type === 'info' ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "text-zinc-400 border-zinc-100")}>INFO & CONTATTI</button>
                           </div>
                        </div>

                        <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm font-bold bg-zinc-50" placeholder="Titolo" value={selectedBlock.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} />
                        <textarea className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm h-32 bg-zinc-50" placeholder="Sottotitolo" value={selectedBlock.content.subtitle || ''} onChange={(e) => updateContent({ subtitle: e.target.value })} />

                        {selectedBlock.content.type === 'info' ? (
                           <div className="space-y-4">
                              <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50" placeholder="Email (es: info@proximatica.it)" value={selectedBlock.content.email || ''} onChange={(e) => updateContent({ email: e.target.value })} />
                              <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50" placeholder="Telefono" value={selectedBlock.content.phone || ''} onChange={(e) => updateContent({ phone: e.target.value })} />
                              <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50" placeholder="Indirizzo" value={selectedBlock.content.address || ''} onChange={(e) => updateContent({ address: e.target.value })} />
                           </div>
                        ) : (
                           <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50" placeholder="Email ricezione (FormSubmit)" value={selectedBlock.content.email || ''} onChange={(e) => updateContent({ email: e.target.value })} />
                        )}
                     </div>
                  )}

                  {selectedBlock.type === 'map' && (
                     <div className="space-y-6">
                        <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50" placeholder="Indirizzo (es: Via Torino 1, Milano)" value={selectedBlock.content.address || ''} onChange={(e) => updateContent({ address: e.target.value })} />
                        <div className="flex items-center justify-between pt-2">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Marker Fluttuante</label>
                           <input type="checkbox" className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-0" checked={selectedBlock.content.showOverlay !== false} onChange={(e) => updateContent({ showOverlay: e.target.checked })} />
                        </div>
                        {selectedBlock.content.showOverlay !== false && (
                           <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50" placeholder="Titolo Marker (es: Nostra Sede)" value={selectedBlock.content.overlayTitle || ''} onChange={(e) => updateContent({ overlayTitle: e.target.value })} />
                        )}
                     </div>
                  )}

                  {selectedBlock.type === 'embed' && (
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-2">
                           {[
                              { id: 'instagram', icon: <Instagram size={14} /> },
                              { id: 'x', icon: <Twitter size={14} /> },
                              { id: 'x-timeline', icon: <Layout size={14} /> },
                              { id: 'google-review', icon: <Star size={14} /> },
                              { id: 'generic', icon: <Share2 size={14} /> }
                           ].map(t => (
                              <button key={t.id} onClick={() => updateContent({ type: t.id })} className={cn("py-2.5 flex items-center justify-center gap-2 text-[10px] font-bold border-2 rounded-xl transition-all", selectedBlock.content.type === t.id ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "text-zinc-400 border-zinc-100 hover:border-zinc-200")}>
                                 {t.icon} <span className="uppercase">{t.id.split('-')[1] ? 'FEED' : t.id.split('-')[0]}</span>
                              </button>
                           ))}
                        </div>

                        <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50" placeholder="Titolo (Opzionale)" value={selectedBlock.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} />

                        {selectedBlock.content.type === 'instagram' && (
                           <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                              <Sparkles size={16} className="text-amber-500 mt-1 shrink-0" />
                              <div className="text-[10px] text-amber-900 leading-relaxed italic">
                                 <b>NOTA:</b> Instagram permette di incorporare solo <b>singoli post o reel pubblici</b>. Profilo e griglia intera non sono supportati gratuitamente.
                              </div>
                           </div>
                        )}

                        {selectedBlock.content.type !== 'generic' && selectedBlock.content.type !== 'google-review' ? (
                           <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50" placeholder="URL Post o Profilo" value={selectedBlock.content.url || ''} onChange={(e) => updateContent({ url: e.target.value })} />
                        ) : (
                           <textarea className="w-full p-2.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 h-32" placeholder="Incolla qui il codice HTML o Iframe" value={selectedBlock.content.html || ''} onChange={(e) => updateContent({ html: e.target.value })} />
                        )}
                     </div>
                  )}

                  {selectedBlock.type === 'text' && (
                     <textarea
                        className="w-full h-64 p-4 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white transition-all outline-none"
                        placeholder="Inserisci il tuo testo..."
                        value={selectedBlock.content.text || ''}
                        onChange={(e) => updateContent({ text: e.target.value })}
                     />
                  )}

                  {selectedBlock.type === 'image' && (
                     <ImageUpload label="Immagine" value={selectedBlock.content.url} onChange={(val) => updateContent({ url: val })} />
                  )}

                  {selectedBlock.type === 'gallery' && (
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-black text-zinc-400 uppercase">Immagini Galleria</label>
                           <button onClick={() => updateContent({ items: [...(selectedBlock.content.items || []), { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', title: 'Nuova Immagine' }] })} className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] uppercase font-bold">+ AGGIUNGI</button>
                        </div>

                        <div className="space-y-4 pt-2">
                           <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mostra Titoli</label>
                              <input type="checkbox" className="w-5 h-5 rounded border-zinc-300" checked={!!selectedBlock.content.showTitles} onChange={(e) => updateContent({ showTitles: e.target.checked })} />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Aspect Ratio</label>
                              <select
                                 className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                                 value={selectedBlock.content.aspectRatio || 'square'}
                                 onChange={(e) => updateContent({ aspectRatio: e.target.value })}
                              >
                                 <option value="square">Quadrato (1:1)</option>
                                 <option value="video">Orizzontale (16:9)</option>
                                 <option value="portrait">Verticale (3:4)</option>
                                 <option value="auto">Originale</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-4">
                           {(selectedBlock.content.items || []).map((item: any, i: number) => (
                              <div key={i} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-sm group">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Immagine #{i + 1}</span>
                                    <button onClick={() => updateContent({ items: selectedBlock.content.items.filter((_: any, idx: number) => idx !== i) })} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                 </div>
                                 <ImageUpload value={item.url} onChange={(val) => {
                                    const ni = [...selectedBlock.content.items]; ni[i].url = val; updateContent({ items: ni });
                                 }} hidePreview />
                                 <input className="w-full p-2 text-[10px] border border-zinc-100 rounded-lg bg-white font-bold" placeholder="Titolo (Opzionale)..." value={item.title || ''} onChange={(e) => {
                                    const ni = [...selectedBlock.content.items]; ni[i].title = e.target.value; updateContent({ items: ni });
                                 }} />
                                 <input className="w-full p-2 text-[10px] border border-zinc-100 rounded-lg bg-white" placeholder="Sottotitolo (Opzionale)..." value={item.subtitle || ''} onChange={(e) => {
                                    const ni = [...selectedBlock.content.items]; ni[i].subtitle = e.target.value; updateContent({ items: ni });
                                 }} />
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {['features', 'reviews', 'product-carousel'].includes(selectedBlock.type) && (
                     <div className="space-y-6">
                        <input className="w-full p-3 border rounded-xl text-sm font-bold bg-zinc-50" placeholder="Titolo Sezione" value={selectedBlock.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} />
                        <textarea className="w-full p-3 border rounded-xl text-sm bg-zinc-50" placeholder="Sottotitolo" value={selectedBlock.content.subtitle || ''} onChange={(e) => updateContent({ subtitle: e.target.value })} />
                        <div className="space-y-4 pt-4 border-t">
                           <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Elementi</label>
                              <button onClick={() => updateContent({ items: [...(selectedBlock.content.items || []), { title: 'Nuovo Elemento', text: '', image: '' }] })} className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold">+ AGGIUNGI</button>
                           </div>
                           <div className="space-y-4">
                              {(selectedBlock.content.items || []).map((item: any, i: number) => (
                                 <div key={i} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                       <input className="flex-1 bg-transparent border-none text-xs font-bold outline-none" value={item.title || item.name} onChange={(e) => {
                                          const ni = [...selectedBlock.content.items];
                                          if (selectedBlock.content.items[i].name !== undefined) ni[i].name = e.target.value;
                                          else ni[i].title = e.target.value;
                                          updateContent({ items: ni });
                                       }} />
                                       <button onClick={() => updateContent({ items: selectedBlock.content.items.filter((_: any, idx: number) => idx !== i) })} className="text-zinc-300 hover:text-red-500"><Trash2 size={12} /></button>
                                    </div>
                                    <textarea className="w-full p-2 text-[10px] border border-zinc-100 rounded-lg bg-white h-20" placeholder="Descrizione..." value={item.text || item.review} onChange={(e) => {
                                       const ni = [...selectedBlock.content.items];
                                       if (selectedBlock.content.items[i].review !== undefined) ni[i].review = e.target.value;
                                       else ni[i].text = e.target.value;
                                       updateContent({ items: ni });
                                    }} />
                                    <ImageUpload label="Immagine" value={item.image || item.avatar} onChange={(val) => {
                                       const ni = [...selectedBlock.content.items];
                                       if (selectedBlock.content.items[i].avatar !== undefined) ni[i].avatar = val;
                                       else ni[i].image = val;
                                       updateContent({ items: ni });
                                    }} />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {selectedBlock.type === 'pdf-viewer' && (
                     <div className="space-y-6">
                        <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50" placeholder="Nome Documento" value={selectedBlock.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} />
                        <input className="w-full p-2.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50" placeholder="URL File PDF (Google Drive, Dropbox, etc)" value={selectedBlock.content.url || ''} onChange={(e) => updateContent({ url: e.target.value })} />
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                           <Sparkles size={16} className="text-blue-500 mt-1 shrink-0" />
                           <div className="text-[10px] text-blue-900 leading-relaxed italic">
                              <b>CONSIGLIO:</b> Carica il PDF su Google Drive, clicca "Condividi" &rarr; "Chiunque abbia il link" e copia l'indirizzo qui sopra.
                           </div>
                        </div>
                     </div>
                  )}

                  {selectedBlock.type === 'footer' && (
                     <div className="space-y-8">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mostra Logo</label>
                              <div
                                 className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", selectedBlock.content.showLogo !== false ? "bg-zinc-900" : "bg-zinc-200")}
                                 onClick={() => updateContent({ showLogo: selectedBlock.content.showLogo === false ? true : false })}
                              >
                                 <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", selectedBlock.content.showLogo !== false && "translate-x-5")} />
                              </div>
                           </div>

                           {selectedBlock.content.showLogo !== false && (
                              <div className="space-y-4 pt-2 border-t border-zinc-100">
                                 <div className="flex gap-2">
                                    <button onClick={() => updateContent({ logoType: 'text' })} className={cn("flex-1 py-2 text-xs font-bold rounded-lg border transition-all", selectedBlock.content.logoType !== 'image' && selectedBlock.content.logoType !== 'both' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500')}>Testo</button>
                                    <button onClick={() => updateContent({ logoType: 'image' })} className={cn("flex-1 py-2 text-xs font-bold rounded-lg border transition-all", selectedBlock.content.logoType === 'image' || selectedBlock.content.logoType === 'both' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500')}>Immagine</button>
                                 </div>

                                 {selectedBlock.content.logoType !== 'image' && (
                                    <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50" placeholder="Testo Logo (es: SitiVetrina)" value={selectedBlock.content.logoText || ''} onChange={(e) => updateContent({ logoText: e.target.value })} />
                                 )}
                                 {(selectedBlock.content.logoType === 'image' || selectedBlock.content.logoType === 'both') && (
                                    <ImageUpload value={selectedBlock.content.logoImage || projectPages.flatMap(p => p.blocks).find(b => b.type === 'navigation')?.content?.logoImage} onChange={(url: string) => updateContent({ logoImage: url })} />
                                 )}
                              </div>
                           )}

                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-6 block">Testo Copyright</label>
                           <input className="w-full p-3 border border-zinc-200 rounded-xl text-xs bg-zinc-50" placeholder="Copyright (es: © 2026 Nome)" value={selectedBlock.content.copyright || ''} onChange={(e) => updateContent({ copyright: e.target.value })} />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                           <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Link Icone Social</label>
                              <button onClick={() => updateContent({ socialLinks: [...(selectedBlock.content.socialLinks || []), { platform: 'instagram', url: 'https://instagram.com' }] })} className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold">+ AGGIUNGI</button>
                           </div>
                           <div className="space-y-3">
                              {(selectedBlock.content.socialLinks || []).map((social: any, i: number) => (
                                 <div key={i} className="flex gap-2">
                                    <select className="p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={social.platform} onChange={(e) => {
                                       const ns = [...selectedBlock.content.socialLinks]; ns[i].platform = e.target.value; updateContent({ socialLinks: ns });
                                    }}>
                                       <option value="instagram">Instagram</option>
                                       <option value="facebook">Facebook</option>
                                       <option value="x">X / Twitter</option>
                                       <option value="linkedin">LinkedIn</option>
                                       <option value="mail">Mail</option>
                                       <option value="phone">Telefono</option>
                                    </select>
                                    <input className="flex-1 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50" placeholder="URL Profilo..." value={social.url} onChange={(e) => {
                                       const ns = [...selectedBlock.content.socialLinks]; ns[i].url = e.target.value; updateContent({ socialLinks: ns });
                                    }} />
                                    <button onClick={() => updateContent({ socialLinks: selectedBlock.content.socialLinks.filter((_: any, idx: number) => idx !== i) })} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                           <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Link Testuali Bottom</label>
                              <button onClick={() => updateContent({ links: [...(selectedBlock.content.links || []), { label: 'Link', url: '/' }] })} className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold">+ AGGIUNGI</button>
                           </div>
                           <div className="space-y-3">
                              {(selectedBlock.content.links || []).map((link: any, i: number) => (
                                 <div key={i} className="flex gap-2">
                                    <input className="w-[100px] shrink-0 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" placeholder="Testo" value={link.label} onChange={(e) => {
                                       const nl = [...selectedBlock.content.links]; nl[i].label = e.target.value; updateContent({ links: nl });
                                    }} />
                                    <input className="flex-1 min-w-0 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50" placeholder="URL..." value={link.url} onChange={(e) => {
                                       const nl = [...selectedBlock.content.links]; nl[i].url = e.target.value; updateContent({ links: nl });
                                    }} />
                                    <button onClick={() => updateContent({ links: selectedBlock.content.links.filter((_: any, idx: number) => idx !== i) })} className="p-2 shrink-0 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            ) : (
               /* STYLE TAB */
               <div className="space-y-10 focus:animate-in fade-in duration-500 p-6">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                     {viewport === 'desktop' ? <Monitor size={18} className="text-blue-500" /> : viewport === 'tablet' ? <Tablet size={18} className="text-blue-500" /> : <Smartphone size={18} className="text-blue-500" />}
                     <div className="text-[10px] text-blue-900 leading-tight uppercase font-black tracking-widest">
                        Stai modificando: {viewport === 'desktop' ? 'DESKTOP' : viewport === 'tablet' ? 'TABLET' : 'MOBILE'}
                     </div>
                  </div>

                  <section>
                     <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Layers size={14} className="text-blue-500" /> Layout & Spaziatura
                     </h3>
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Padding Vert (px)</label>
                              <input
                                 type="number"
                                 className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                                 value={getStyleValue('padding', selectedBlock.type === 'navigation' ? 20 : 40)}
                                 onChange={(e) => updateStyle({ padding: parseInt(e.target.value) || 0 })}
                              />
                           </div>
                           {selectedBlock.type === 'navigation' ? (
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Padding Oriz (px)</label>
                                 <input
                                    type="number"
                                    className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                                    value={getStyleValue('hPadding', 20)}
                                    onChange={(e) => updateStyle({ hPadding: parseInt(e.target.value) || 0 })}
                                 />
                              </div>
                           ) : (
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Spazio Laterale (px)</label>
                                 <input
                                    type="number"
                                    className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                                    value={getStyleValue('hPadding', 40)}
                                    onChange={(e) => updateStyle({ hPadding: parseInt(e.target.value) || 0 })}
                                 />
                              </div>
                           )}
                        </div>
                        {selectedBlock.type === 'hero' && (
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Altezza (px)</label>
                                 <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getStyleValue('minHeight', 600)} onChange={(e) => updateStyle({ minHeight: parseInt(e.target.value) || 0 })} />
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Spazio Int (Gap)</label>
                                 <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getStyleValue('gap', 32)} onChange={(e) => updateStyle({ gap: parseInt(e.target.value) || 0 })} />
                              </div>
                           </div>
                        )}

                        {selectedBlock.type === 'navigation' ? (
                           <div>
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Margine Oriz (px)</label>
                              <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={getStyleValue('hMargin', 0)} onChange={(e) => updateStyle({ hMargin: parseInt(e.target.value) || 0 })} />
                           </div>
                        ) : (
                           <div>
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Allineamento</label>
                              <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
                                 <button onClick={() => updateStyle({ align: 'left' })} className={cn("flex-1 p-2.5 flex justify-center", getStyleValue('align', 'center') === 'left' ? "bg-zinc-900 text-white shadow-lg z-10" : "text-zinc-400 hover:text-zinc-600")}><AlignLeft size={16} /></button>
                                 <button onClick={() => updateStyle({ align: 'center' })} className={cn("flex-1 p-2.5 flex justify-center", getStyleValue('align', 'center') === 'center' ? "bg-zinc-900 text-white shadow-lg z-10" : "text-zinc-400 hover:text-zinc-600")}><AlignCenter size={16} /></button>
                                 <button onClick={() => updateStyle({ align: 'right' })} className={cn("flex-1 p-2.5 flex justify-center", getStyleValue('align', 'center') === 'right' ? "bg-zinc-900 text-white shadow-lg z-10" : "text-zinc-400 hover:text-zinc-600")}><AlignRight size={16} /></button>
                              </div>
                           </div>
                        )}

                        <div className="pt-4 border-t border-zinc-50">
                           <details className="group">
                              <summary className="flex items-center justify-between cursor-pointer text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">
                                 <span>Margini Avanzati</span>
                                 <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                              </summary>
                              <div className="grid grid-cols-2 gap-4 mt-6">
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Sup (px)</label>
                                    <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50" value={getStyleValue('marginTop', 0)} onChange={(e) => updateStyle({ marginTop: parseInt(e.target.value) || 0 })} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Inf (px)</label>
                                    <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50" value={getStyleValue('marginBottom', 0)} onChange={(e) => updateStyle({ marginBottom: parseInt(e.target.value) || 0 })} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Sx (px)</label>
                                    <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50" value={getStyleValue('marginLeft', 0)} onChange={(e) => updateStyle({ marginLeft: parseInt(e.target.value) || 0 })} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Dx (px)</label>
                                    <input type="number" className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50" value={getStyleValue('marginRight', 0)} onChange={(e) => updateStyle({ marginRight: parseInt(e.target.value) || 0 })} />
                                 </div>
                              </div>
                           </details>
                        </div>
                     </div>
                  </section>

                  <section className="pt-8 border-t border-zinc-100">
                     <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Palette size={14} className="text-pink-500" /> Colori & Sfondo
                     </h3>
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Sfondo</label>
                              <input
                                 type="color"
                                 className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                                 value={getStyleValue('backgroundColor', project?.settings?.appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff'))}
                                 onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                              />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Testo</label>
                              <input
                                 type="color"
                                 className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                                 value={getStyleValue('textColor', project?.settings?.appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000'))}
                                 onChange={(e) => updateStyle({ textColor: e.target.value })}
                              />
                           </div>
                        </div>
                        <button onClick={() => updateStyle({ backgroundColor: undefined, textColor: undefined })} className="w-full p-2.5 text-[10px] font-bold text-zinc-400 border border-dashed rounded-xl hover:text-zinc-900 transition-all uppercase tracking-widest">Resetta a Tema Globale</button>
                     </div>
                  </section>

                  <section className="pt-8 border-t border-zinc-100">
                     <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Type size={14} className="text-indigo-500" /> Stile Testi
                     </h3>
                     <div className="space-y-6">
                        {selectedBlock.type === 'footer' ? (
                           <>
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                                    <span>Dimensione Logo</span>
                                    <span className="text-zinc-900 font-bold">{getStyleValue('titleSize', 24)}px</span>
                                 </label>
                                 <input type="range" min="10" max="120" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900" value={getStyleValue('titleSize', 24)} onChange={(e) => updateStyle({ titleSize: parseInt(e.target.value) })} />
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                                    <span>Dimensione Copyright / Link</span>
                                    <span className="text-zinc-900 font-bold">{getStyleValue('fontSize', 14)}px</span>
                                 </label>
                                 <input type="range" min="8" max="40" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900" value={getStyleValue('fontSize', 14)} onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })} />
                              </div>
                           </>
                        ) : (
                           <div>
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                                 <span>{['navigation', 'text'].includes(selectedBlock.type) ? 'Dimensione Testo' : 'Dimensione Titolo'}</span>
                                 <span className="text-zinc-900 font-bold">{getStyleValue(['navigation', 'text'].includes(selectedBlock.type) ? 'fontSize' : 'titleSize', ['navigation', 'text'].includes(selectedBlock.type) ? 14 : 40)}px</span>
                              </label>
                              <div className="flex gap-2">
                                 <input
                                    type="range" min="8" max="160" step="1"
                                    className="flex-1 h-2 mt-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                                    value={getStyleValue(['navigation', 'text'].includes(selectedBlock.type) ? 'fontSize' : 'titleSize', ['navigation', 'text'].includes(selectedBlock.type) ? 14 : 40)}
                                    onChange={(e) => updateStyle({ [['navigation', 'text'].includes(selectedBlock.type) ? 'fontSize' : 'titleSize']: parseInt(e.target.value) })}
                                 />
                                 <div className="flex border rounded-xl overflow-hidden shrink-0">
                                    <button onClick={() => updateStyle({ titleBold: !getStyleValue('titleBold', true) })} className={cn("p-2 px-3 transition-all", getStyleValue('titleBold', true) !== false ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}><Bold size={16} /></button>
                                    <button onClick={() => updateStyle({ titleItalic: !getStyleValue('titleItalic', false) })} className={cn("p-2 px-3 transition-all", getStyleValue('titleItalic', false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}><Italic size={16} /></button>
                                 </div>
                              </div>
                           </div>
                        )}

                        {['hero', 'services', 'features', 'reviews', 'embed', 'pdf-viewer', 'product-carousel', 'contact', 'image-text'].includes(selectedBlock.type) && (
                           <div className="pt-4 border-t border-zinc-50">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                                 <span>Dimensione Sottotitolo</span>
                                 <span className="text-zinc-900 font-bold">{getStyleValue('subtitleSize', 18)}px</span>
                              </label>
                              <div className="flex gap-2">
                                 <input
                                    type="range" min="10" max="80" step="1"
                                    className="flex-1 h-2 mt-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                                    value={getStyleValue('subtitleSize', 18)}
                                    onChange={(e) => updateStyle({ subtitleSize: parseInt(e.target.value) })}
                                 />
                                 <div className="flex border rounded-xl overflow-hidden shrink-0">
                                    <button onClick={() => updateStyle({ subtitleBold: !getStyleValue('subtitleBold', false) })} className={cn("p-2 px-3 transition-all", getStyleValue('subtitleBold', false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}><Bold size={16} /></button>
                                    <button onClick={() => updateStyle({ subtitleItalic: !getStyleValue('subtitleItalic', false) })} className={cn("p-2 px-3 transition-all", getStyleValue('subtitleItalic', false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}><Italic size={16} /></button>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </section>
               </div>
            )}
         </div>
      </div>
   );
};
