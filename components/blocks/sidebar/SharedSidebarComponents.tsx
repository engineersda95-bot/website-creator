'use client';

import React from 'react';
import {
   ChevronDown,
   Palette,
   Bold,
   Italic,
   AlignLeft,
   AlignCenter,
   AlignRight,
   Layers,
   HelpCircle,
   Smile,
   Shield,
   Zap,
   Check,
   Package,
   Star,
   Heart,
   Award,
   Activity,
   Plus,
   Trash2,
   Link as LinkIcon,
   Type,
   Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';

// --- Icon Registry ---
const AVAILABLE_ICONS: Record<string, any> = {
   'help': HelpCircle,
   'smile': Smile,
   'shield': Shield,
   'zap': Zap,
   'check': Check,
   'package': Package,
   'star': Star,
   'heart': Heart,
   'award': Award,
   'activity': Activity
};

export function SectionHeader({ icon: Icon, title, colorClass = "text-zinc-900" }: { icon: any, title: string, colorClass?: string }) {
   return (
      <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
         <Icon size={14} className={colorClass} /> {title}
      </h3>
   );
}

export function AdvancedMargins({ getStyleValue, updateStyle }: any) {
   return (
      <div className="pt-4 border-t border-zinc-50">
         <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">
               <span>Margini Avanzati</span>
               <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
            </summary>
            <div className="grid grid-cols-2 gap-4 mt-6">
               {['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].map((key) => (
                  <div key={key}>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">
                        {key === 'marginTop' ? 'Sup' : key === 'marginBottom' ? 'Inf' : key === 'marginLeft' ? 'Sx' : 'Dx'} (px)
                     </label>
                     <input
                        type="number"
                        className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                        value={getStyleValue(key, 0)}
                        onChange={(e) => updateStyle({ [key]: parseInt(e.target.value) || 0 })}
                     />
                  </div>
               ))}
            </div>
         </details>
      </div>
   );
}

export function LayoutFields({ getStyleValue, updateStyle, showAlign = true, paddingLabel = "Padding Vert", hPaddingLabel = "Spazio Laterale" }: any) {
   return (
      <div className="space-y-6">
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">{paddingLabel} (px)</label>
               <input
                  type="number"
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                  value={getStyleValue('padding', 40)}
                  onChange={(e) => updateStyle({ padding: parseInt(e.target.value) || 0 })}
               />
            </div>
            <div>
               <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">{hPaddingLabel} (px)</label>
               <input
                  type="number"
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                  value={getStyleValue('hPadding', 40)}
                  onChange={(e) => updateStyle({ hPadding: parseInt(e.target.value) || 0 })}
               />
            </div>
         </div>

         {showAlign && (
            <div>
               <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Allineamento</label>
               <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
                  {[
                     { id: 'left', icon: AlignLeft },
                     { id: 'center', icon: AlignCenter },
                     { id: 'right', icon: AlignRight }
                  ].map((item) => (
                     <button
                        key={item.id}
                        onClick={() => updateStyle({ align: item.id })}
                        className={cn("flex-1 p-2.5 flex justify-center transition-all", getStyleValue('align', 'center') === item.id ? "bg-zinc-900 text-white shadow-lg z-10" : "text-zinc-400 hover:text-zinc-600")}
                     >
                        <item.icon size={16} />
                     </button>
                  ))}
               </div>
            </div>
         )}
         <AdvancedMargins getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </div>
   );
}

export function ColorManager({ 
   getStyleValue, 
   updateStyle, 
   project, 
   bgKey = 'backgroundColor', 
   textKey = 'textColor', 
   title = "Colori & Sfondo", 
   icon = Palette, 
   colorClass = "text-pink-500",
   showReset = true
}: any) {
   const appearance = project?.settings?.appearance || 'light';
   const defaultBg = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff');
   const defaultText = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000');

   return (
      <section className="pt-8 border-t border-zinc-100">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
               <Palette size={14} className={colorClass} /> {title}
            </h3>
            <div className="flex bg-zinc-100 p-1 rounded-lg">
               {['solid', 'gradient'].map((t) => (
                  <button
                     key={t}
                     onClick={() => updateStyle({ bgType: t })}
                     className={cn(
                        "px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all",
                        getStyleValue('bgType', 'solid') === t ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                     )}
                  >
                     {t === 'solid' ? 'Tinta Unita' : 'Gradiente'}
                  </button>
               ))}
            </div>
         </div>
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo</label>
                  <input
                     type="color"
                     className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                     value={getStyleValue(bgKey, defaultBg)}
                     onChange={(e) => updateStyle({ [bgKey]: e.target.value })}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo</label>
                  <input
                     type="color"
                     className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                     value={getStyleValue(textKey, defaultText)}
                     onChange={(e) => updateStyle({ [textKey]: e.target.value })}
                  />
               </div>
            </div>

            {getStyleValue('bgType', 'solid') === 'gradient' && (
               <div className="animate-in slide-in-from-top-2 duration-300 space-y-4 pt-4 border-t border-zinc-50">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Punto Fine</label>
                        <input
                           type="color"
                           className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                           value={getStyleValue('backgroundColor2', '#f3f4f6')}
                           onChange={(e) => updateStyle({ backgroundColor2: e.target.value })}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Direzione</label>
                        <select
                           className="w-full p-2.5 border border-zinc-200 rounded-xl text-[10px] font-black uppercase bg-zinc-50 outline-none focus:bg-white transition-all shadow-sm"
                           value={getStyleValue('bgDirection', 'to bottom')}
                           onChange={(e) => updateStyle({ bgDirection: e.target.value })}
                        >
                           <option value="to bottom">Dall'alto ↓</option>
                           <option value="to top">Dal basso ↑</option>
                           <option value="to right">Da sinistra →</option>
                           <option value="to left">Da destra ←</option>
                           <option value="to bottom right">Inclinato</option>
                        </select>
                     </div>
                  </div>
               </div>
            )}

            {showReset && (
               <button
                  onClick={() => updateStyle({ [bgKey]: undefined, [textKey]: undefined, bgType: 'solid', backgroundColor2: undefined, bgDirection: undefined })}
                  className="w-full p-2.5 text-[10px] font-bold text-zinc-400 border border-dashed rounded-xl hover:text-zinc-900 transition-all uppercase tracking-widest"
               >
                  Resetta a Tema Globale
               </button>
            )}
         </div>
      </section>
   );
}

export function BackgroundManager({ selectedBlock, updateContent, updateStyle, getStyleValue }: any) {
   const { uploadImage, isUploading } = useEditorStore();

   return (
      <div className="space-y-6 pt-4 border-t border-zinc-100">
         <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Immagine Sfondo</label>
            <div className="flex items-center gap-2">
               {isUploading && <span className="text-[10px] font-bold text-blue-500 animate-pulse uppercase">Caricamento...</span>}
               {selectedBlock.content.backgroundImage && (
                  <button onClick={() => updateContent({ backgroundImage: undefined })} className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Rimuovi</button>
               )}
            </div>
         </div>
         <ImageUpload
            label="Immagine"
            value={resolveImageUrl(selectedBlock.content.backgroundImage, useEditorStore.getState().project, useEditorStore.getState().imageMemoryCache)}
            onChange={async (val: string, filename?: string) => {
               const relativePath = await uploadImage(val, filename);
               updateContent({ backgroundImage: relativePath });
            }}
         />

         {selectedBlock.content.backgroundImage && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Dimensione</label>
                     <select
                        className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold focus:bg-white transition-all outline-none"
                        value={getStyleValue('backgroundSize', 'cover')}
                        onChange={(e) => updateStyle({ backgroundSize: e.target.value })}
                     >
                        <option value="cover">Pieno (Cover)</option>
                        <option value="contain">Contenuto (Contain)</option>
                        <option value="auto">Originale (Auto)</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Posizione</label>
                     <select
                        className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold focus:bg-white transition-all outline-none"
                        value={getStyleValue('backgroundPosition', 'center')}
                        onChange={(e) => updateStyle({ backgroundPosition: e.target.value })}
                     >
                        <option value="center">Centro</option>
                        <option value="top">In Alto</option>
                        <option value="bottom">In Basso</option>
                        <option value="left">A Sinistra</option>
                        <option value="right">A Destra</option>
                     </select>
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                     <span>Opacità Immagine</span>
                     <span className="text-zinc-900 font-bold">{getStyleValue('opacity', 100)}%</span>
                  </label>
                  <input type="range" min="0" max="100" step="1" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                     value={getStyleValue('opacity', 100)}
                     onChange={(e) => updateStyle({ opacity: parseInt(e.target.value) })}
                  />
               </div>
               <div className="pt-4 border-t border-zinc-50">
                  <div className="flex items-center justify-between mb-4">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tipo Overlay</label>
                     <div className="flex bg-zinc-100 p-1 rounded-lg">
                        {[
                           { id: 'solid', label: 'Tinta Unita' },
                           { id: 'gradient', label: 'Gradiente' }
                        ].map((type) => (
                           <button
                              key={type.id}
                              onClick={() => updateStyle({ overlayType: type.id })}
                              className={cn(
                                 "px-3 py-1 text-[9px] font-black uppercase tracking-tight rounded-md transition-all",
                                 getStyleValue('overlayType', 'solid') === type.id 
                                    ? "bg-zinc-900 text-white shadow-lg z-10 scale-[1.02]" 
                                    : "text-zinc-400 hover:text-zinc-600"
                              )}
                           >
                              {type.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Colore {getStyleValue('overlayType', 'solid') === 'gradient' ? 'Inizio' : 'Overlay'}</label>
                        <input
                           type="color"
                           className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                           value={getStyleValue('overlayColor', '#000000')}
                           onChange={(e) => updateStyle({ overlayColor: e.target.value })}
                        />
                     </div>
                     {getStyleValue('overlayType', 'solid') === 'gradient' && (
                        <div className="animate-in zoom-in-95 duration-200">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Colore Fine</label>
                           <input
                              type="color"
                              className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                              value={getStyleValue('overlayColor2', '#111111')}
                              onChange={(e) => updateStyle({ overlayColor2: e.target.value })}
                           />
                        </div>
                     )}
                  </div>

                  {getStyleValue('overlayType', 'solid') === 'gradient' && (
                     <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Direzione</label>
                        <select
                           className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold focus:bg-white transition-all outline-none"
                           value={getStyleValue('overlayDirection', 'to bottom')}
                           onChange={(e) => updateStyle({ overlayDirection: e.target.value })}
                        >
                           <option value="to bottom">Dall'alto al basso (↓)</option>
                           <option value="to top">Dal basso all'alto (↑)</option>
                           <option value="to right">Da sinistra a destra (→)</option>
                           <option value="to left">Da destra a sinistra (←)</option>
                           <option value="to bottom right">Diagonale (↘)</option>
                           <option value="to top left">Diagonale inversa (↖)</option>
                        </select>
                     </div>
                  )}

                  <div className="mt-6">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                        <span>Opacità Overlay</span>
                        <span className="text-zinc-900 font-bold">{getStyleValue('overlayOpacity', 40)}%</span>
                     </label>
                     <input type="range" min="0" max="100" step="1" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        value={getStyleValue('overlayOpacity', 40)}
                        onChange={(e) => updateStyle({ overlayOpacity: parseInt(e.target.value) })}
                     />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                     <span>Sfocatura (Blur)</span>
                     <span className="text-zinc-900 font-bold">{getStyleValue('blur', 0)}px</span>
                  </label>
                  <input type="range" min="0" max="20" step="1" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                     value={getStyleValue('blur', 0)}
                     onChange={(e) => updateStyle({ blur: parseInt(e.target.value) })}
                  />
               </div>
            </div>
         )}
      </div>
   );
}

export function TypographyFields({ label, sizeKey, boldKey, italicKey, getStyleValue, updateStyle, min = 8, max = 160, defaultValue = 16 }: any) {
   return (
      <div className="pb-6 border-b border-zinc-50 last:border-0 last:pb-0">
         <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
            <span>{label}</span>
            <span className="text-zinc-900 font-bold">{getStyleValue(sizeKey, defaultValue)}px</span>
         </label>
         <div className="flex gap-2">
            <input
               type="range" min={min} max={max} step="1"
               className="flex-1 h-2 mt-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
               value={getStyleValue(sizeKey, defaultValue)}
               onChange={(e) => updateStyle({ [sizeKey]: parseInt(e.target.value) })}
            />
            <div className="flex border rounded-xl overflow-hidden shrink-0">
               <button
                  onClick={() => updateStyle({ [boldKey]: !getStyleValue(boldKey, false) })}
                  className={cn("p-2 px-3 transition-all", getStyleValue(boldKey, false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}
               >
                  <Bold size={16} />
               </button>
               <button
                  onClick={() => updateStyle({ [italicKey]: !getStyleValue(italicKey, false) })}
                  className={cn("p-2 px-3 transition-all", getStyleValue(italicKey, false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}
               >
                  <Italic size={16} />
               </button>
            </div>
         </div>
      </div>
   );
}

export function SimpleSlider({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "px" }: any) {
   return (
      <div className="pb-6 border-b border-zinc-50 last:border-0 last:pb-0">
         <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
            <span>{label}</span>
            <span className="text-zinc-900 font-bold">{value}{suffix}</span>
         </label>
         <input
            type="range" min={min} max={max} step={step}
            className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900 mt-2"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
         />
      </div>
   );
}

export function CTAManager({ content, updateContent, style, updateStyle }: any) {
   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Pulsante (CTA)</label>
            <div className="flex bg-zinc-100 p-1 rounded-lg">
               <button
                  onClick={() => updateStyle?.({ buttonTheme: 'primary' })}
                  className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-tight rounded-md transition-all", (style?.buttonTheme || 'primary') === 'primary' ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
               >
                  Primario
               </button>
               <button
                  onClick={() => updateStyle?.({ buttonTheme: 'secondary' })}
                  className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-tight rounded-md transition-all", style?.buttonTheme === 'secondary' ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
               >
                  Secondario
               </button>
            </div>
         </div>
         <div className="grid gap-3">
            <input
               className="w-full p-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white transition-all outline-none"
               placeholder="Testo Bottone (es: Inizia Ora)"
               value={content.cta || ''}
               onChange={(e) => updateContent({ cta: e.target.value })}
            />
            <div className="flex items-center gap-2 p-3 border border-zinc-200 rounded-xl bg-zinc-50">
               <LinkIcon size={14} className="text-zinc-400" />
               <input
                  className="flex-1 bg-transparent text-xs outline-none"
                  placeholder="Link (es: /contatti o https://...)"
                  value={content.ctaLink || ''}
                  onChange={(e) => updateContent({ ctaLink: e.target.value })}
               />
            </div>
         </div>
      </div>
   );
}

export function SimpleInput({ label, value, onChange, placeholder, icon: Icon }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string, icon?: any }) {
   return (
      <div className="space-y-2">
         <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block pl-1">{label}</label>
         <div className="relative group">
            {Icon && (
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none z-10">
                  <Icon size={16} />
               </div>
            )}
            <input
               className={cn(
                  "w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none shadow-inner relative z-0",
                  Icon && "pl-12"
               )}
               placeholder={placeholder}
               value={value || ''}
               onChange={(e) => onChange(e.target.value)}
            />
         </div>
      </div>
   );
}

export function SocialLinksManager({ links = [], onChange }: { links: any[], onChange: (links: any[]) => void }) {
   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Link Icone Social</label>
            <button
               onClick={() => onChange([...links, { platform: 'instagram', url: 'https://instagram.com' }])}
               className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold"
            >
               <Plus size={10} className="inline mr-1" /> AGGIUNGI
            </button>
         </div>
         <div className="space-y-3">
            {links.map((social: any, i: number) => (
               <div key={i} className="flex gap-2 group animate-in slide-in-from-right-2 duration-200">
                  <select className="p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" value={social.platform} onChange={(e) => {
                     const ns = [...links]; ns[i].platform = e.target.value; onChange(ns);
                  }}>
                     <option value="instagram">Instagram</option>
                     <option value="facebook">Facebook</option>
                     <option value="x">X / Twitter</option>
                     <option value="linkedin">LinkedIn</option>
                     <option value="mail">Mail</option>
                     <option value="phone">Telefono</option>
                  </select>
                  <input className="flex-1 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50" placeholder="URL Profilo..." value={social.url} onChange={(e) => {
                     const ns = [...links]; ns[i].url = e.target.value; onChange(ns);
                  }} />
                  <button onClick={() => onChange(links.filter((_, idx) => idx !== i))} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
               </div>
            ))}
         </div>
      </div>
   );
}

export function LinkListManager({ links = [], onChange, label = "Link Testuali" }: { links: any[], onChange: (links: any[]) => void, label?: string }) {
   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</label>
            <button
               onClick={() => onChange([...links, { label: 'Link', url: '/' }])}
               className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold"
            >
               <Plus size={10} className="inline mr-1" /> AGGIUNGI
            </button>
         </div>
         <div className="space-y-3">
            {links.map((link: any, i: number) => (
               <div key={i} className="flex gap-2 group animate-in slide-in-from-right-2 duration-200">
                  <input className="w-[100px] shrink-0 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50" placeholder="Testo" value={link.label} onChange={(e) => {
                     const nl = [...links]; nl[i].label = e.target.value; onChange(nl);
                  }} />
                  <input className="flex-1 min-w-0 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50" placeholder="URL..." value={link.url} onChange={(e) => {
                     const nl = [...links]; nl[i].url = e.target.value; onChange(nl);
                  }} />
                  <button onClick={() => onChange(links.filter((_, idx) => idx !== i))} className="p-2 shrink-0 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
               </div>
            ))}
         </div>
      </div>
   );
}

export function RichTextarea({ label = "Contenuto Testuale", value, onChange, placeholder }: { label?: string, value: string, onChange: (val: string) => void, placeholder?: string }) {
   const textareaRef = React.useRef<HTMLTextAreaElement>(null);

   const applyFormat = (type: 'bold' | 'italic') => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const text = el.value;
      const selectedText = text.substring(start, end);
      const before = text.substring(0, start);
      const after = text.substring(end);

      let tag = type === 'bold' ? '**' : '*';
      const newVal = `${before}${tag}${selectedText}${tag}${after}`;

      onChange(newVal);

      setTimeout(() => {
         el.focus();
         el.setSelectionRange(start + tag.length, end + tag.length);
      }, 0);
   };

   return (
      <div className="space-y-3">
         <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</label>
            <div className="flex border rounded-lg overflow-hidden bg-white shadow-sm">
               <button
                  onClick={() => applyFormat('bold')}
                  className="p-1.5 px-3 hover:bg-zinc-50 text-zinc-600 border-r border-zinc-100 transition-colors"
                  title="Grassetto"
               >
                  <Bold size={14} />
               </button>
               <button
                  onClick={() => applyFormat('italic')}
                  className="p-1.5 px-3 hover:bg-zinc-50 text-zinc-600 transition-colors"
                  title="Corsivo"
               >
                  <Italic size={14} />
               </button>
            </div>
         </div>
         <div className="relative group">
            <textarea
               ref={textareaRef}
               className="w-full h-48 p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none leading-relaxed resize-none custom-scrollbar shadow-inner"
               placeholder={placeholder}
               value={value || ''}
               onChange={(e) => onChange(e.target.value)}
            />
            {!value && (
               <div className="absolute inset-0 pointer-events-none p-4 text-zinc-300 text-sm">
                  {placeholder || 'Scrivi qui il tuo messaggio...'}
               </div>
            )}
         </div>
         <div className="flex justify-end pr-2">
            <span className="text-[9px] text-zinc-300 uppercase font-bold tracking-tighter">Supporta Bold & Italic</span>
         </div>
      </div>
   );
}

export function BorderShadowManager({ getStyleValue, updateStyle }: any) {
   return (
      <section className="pt-8 border-t border-zinc-100">
         <SectionHeader icon={Layers} title="Bordi" colorClass="text-zinc-500" />
         <div className="space-y-6">
            <div>
               <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Arrotondamento</label>
               <input
                  type="number"
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                  value={getStyleValue('borderRadius', 0)}
                  onChange={(e) => updateStyle({ borderRadius: parseInt(e.target.value) || 0 })}
               />
            </div>
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-bold text-zinc-400 uppercase cursor-pointer" htmlFor="has-border">Bordo</label>
               <input
                  id="has-border"
                  type="checkbox"
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  checked={!!getStyleValue('borderWidth', 0)}
                  onChange={(e) => updateStyle({ borderWidth: e.target.checked ? 1 : 0 })}
               />
            </div>
            {getStyleValue('borderWidth', 0) > 0 && (
               <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Colore Bordo</label>
                     <input
                        type="color"
                        className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                        value={getStyleValue('borderColor', '#e5e7eb')}
                        onChange={(e) => updateStyle({ borderColor: e.target.value })}
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Spessore (px)</label>
                     <input
                        type="number"
                        className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
                        value={getStyleValue('borderWidth', 1)}
                        onChange={(e) => updateStyle({ borderWidth: parseInt(e.target.value) || 0 })}
                     />
                  </div>
               </div>
            )}
         </div>
      </section>
   );
}

export function IconManager({ value, onChange, label = "Icona" }: any) {
   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100">
         <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{label}</label>
         <div className="grid grid-cols-5 gap-2">
            {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => (
               <button
                  key={name}
                  type="button"
                  onClick={() => onChange(name)}
                  className={cn(
                     "p-3 flex justify-center border rounded-2xl transition-all",
                     value === name
                        ? "bg-zinc-900 text-white shadow-lg scale-110 z-10 border-zinc-900"
                        : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:bg-white hover:border-zinc-200"
                  )}
               >
                  <Icon size={18} />
               </button>
            ))}
         </div>
      </div>
   );
}

export function ImageStyleFields({ getStyleValue, updateStyle }: any) {
   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
         <SimpleSlider 
            label="Arrotondamento Immagine" 
            value={getStyleValue('imageBorderRadius', 24)} 
            onChange={(val: number) => updateStyle({ imageBorderRadius: val })} 
            max={100}
         />

         <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 transition-all hover:bg-white hover:shadow-sm">
               <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest leading-none">Ombra</span>
               <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                  checked={!!getStyleValue('imageShadow', true)}
                  onChange={(e) => updateStyle({ imageShadow: e.target.checked })}
               />
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 transition-all hover:bg-white hover:shadow-sm">
               <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest leading-none">Zoom Hover</span>
               <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                  checked={!!getStyleValue('imageHover', true)}
                  onChange={(e) => updateStyle({ imageHover: e.target.checked })}
               />
            </div>
         </div>
      </div>
   );
}
