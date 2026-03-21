'use client';

import React from 'react';
import {
   ChevronDown,
   Palette,
   Type,
   Bold,
   Italic,
   AlignLeft,
   AlignCenter,
   AlignRight,
   Monitor,
   Smartphone,
   Trash2,
   Plus,
   Link as LinkIcon,
   Image as ImageIcon,
   Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '../ImageUpload';

// --- UI Layout & Containers ---

export const SectionHeader = ({ icon: Icon, title, colorClass = "text-zinc-900" }: { icon: any, title: string, colorClass?: string }) => (
   <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
      <Icon size={14} className={colorClass} /> {title}
   </h3>
);

// --- Style Fields ---

export const AdvancedMargins = ({ getStyleValue, updateStyle }: any) => (
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

export const LayoutFields = ({ getStyleValue, updateStyle, showAlign = true, paddingLabel = "Padding Vert", hPaddingLabel = "Spazio Laterale" }: any) => (
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

export const ColorManager = ({ getStyleValue, updateStyle, project }: any) => {
   const appearance = project?.settings?.appearance || 'light';
   const defaultBg = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff');
   const defaultText = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000');

   return (
      <section className="pt-8 border-t border-zinc-100">
         <SectionHeader icon={Palette} title="Colori & Sfondo" colorClass="text-pink-500" />
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Sfondo</label>
                  <input
                     type="color"
                     className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                     value={getStyleValue('backgroundColor', defaultBg)}
                     onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Testo</label>
                  <input
                     type="color"
                     className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                     value={getStyleValue('textColor', defaultText)}
                     onChange={(e) => updateStyle({ textColor: e.target.value })}
                  />
               </div>
            </div>
            <button
               onClick={() => updateStyle({ backgroundColor: undefined, textColor: undefined })}
               className="w-full p-2.5 text-[10px] font-bold text-zinc-400 border border-dashed rounded-xl hover:text-zinc-900 transition-all uppercase tracking-widest"
            >
               Resetta a Tema Globale
            </button>
         </div>
      </section>
   );
};

export const BackgroundManager = ({ selectedBlock, updateContent, updateStyle, getStyleValue }: any) => (
   <div className="space-y-6 pt-4 border-t border-zinc-100">
      <div className="flex items-center justify-between mb-2">
         <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Immagine Sfondo</label>
         {selectedBlock.content.backgroundImage && (
            <button onClick={() => updateContent({ backgroundImage: undefined })} className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Rimuovi</button>
         )}
      </div>
      <ImageUpload
         label="Immagine"
         value={selectedBlock.content.backgroundImage}
         onChange={(val: string) => updateContent({ backgroundImage: val })}
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
                  <span>Opacità Overlay</span>
                  <span className="text-zinc-900 font-bold">{getStyleValue('overlayOpacity', 40)}%</span>
               </label>
               <input type="range" min="0" max="100" step="1" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                  value={getStyleValue('overlayOpacity', 40)}
                  onChange={(e) => updateStyle({ overlayOpacity: parseInt(e.target.value) })}
               />
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

export const TypographyFields = ({ label, sizeKey, boldKey, italicKey, getStyleValue, updateStyle, min = 8, max = 160, defaultValue = 16 }: any) => (
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
               onClick={() => updateStyle({ [boldKey]: !getStyleValue(boldKey, true) })}
               className={cn("p-2 px-3 transition-all", getStyleValue(boldKey, true) !== false ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}
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

// --- Content Fields ---

export const CTAManager = ({ content, updateContent, style, updateStyle }: any) => (
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
            className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50 focus:bg-white transition-all outline-none"
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

// --- Simple Text Input (No formatting) ---

export const SimpleInput = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string }) => (
   <div className="space-y-2">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{label}</label>
      <input
         className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none font-bold shadow-inner"
         placeholder={placeholder}
         value={value || ''}
         onChange={(e) => onChange(e.target.value)}
      />
   </div>
);

export const SocialLinksManager = ({ links = [], onChange }: { links: any[], onChange: (links: any[]) => void }) => (
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

export const LinkListManager = ({ links = [], onChange, label = "Link Testuali" }: { links: any[], onChange: (links: any[]) => void, label?: string }) => (
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
               <input className="w-[100px] shrink-0 p-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" placeholder="Testo" value={link.label} onChange={(e) => {
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

// --- Advanced Text Editor ---

export const RichTextarea = ({ label = "Contenuto Testuale", value, onChange, placeholder }: { label?: string, value: string, onChange: (val: string) => void, placeholder?: string }) => {
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
};
