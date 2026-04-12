import { Link as LinkIcon, Palette, Settings2, MousePointer2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CTAManagerProps } from '@/types/sidebar';
import { SectionHeader } from '../ui/SectionHeader';
import { ColorInput } from '../ui/ColorInput';

export function CTAManager({ 
   content, 
   updateContent, 
   style,
   updateStyle,
   getStyleValue,
   label = "CTA",
   ctaKey = "cta",
   urlKey = "ctaUrl",
   themeKey = "ctaTheme"
}: CTAManagerProps) {
   // Determiniamo il tema attivo (primary, secondary, custom)
   const currentTheme = content[themeKey!] || (ctaKey === 'cta' ? 'primary' : 'secondary');
   const isCustom = currentTheme === 'custom';

   // Chiavi per gli override indipendenti (es: ctaBgColor, cta2BgColor)
   const valKey = (key: string) => `${ctaKey}${key}`;

   const getVal = (key: string, def: any) => {
      const fullKey = valKey(key);
      if (getStyleValue) {
         // Prioritize style (which supports responsive overrides) over content
         return getStyleValue(fullKey, content[fullKey] ?? def);
      }
      return content[fullKey] !== undefined ? content[fullKey] : def;
   };

   const updateVal = (key: string, val: any) => {
      const fullKey = valKey(key);
      // Visual properties are routed to style if updateStyle is available to enable responsive overrides
      const isVisualStyle = ['BgColor', 'TextColor', 'Radius', 'PaddingX', 'PaddingY', 'FontSize', 'Shadow', 'Animation', 'Uppercase'].includes(key);
      
      if (isVisualStyle && updateStyle) {
         updateStyle({ [fullKey]: val });
      } else {
         updateContent({ [fullKey]: val });
      }
   };

   return (
      <div className="space-y-10 pt-4">
         {/* 1. Configurazione Base */}
         <section>
            <div className="space-y-4 mb-8">
               <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block pl-1">{label}</label>
               <div className="grid grid-cols-3 bg-zinc-100 p-1 rounded-2xl gap-1">
                  <button
                     onClick={() => updateContent({ [themeKey!]: 'primary' })}
                     className={cn("px-1 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl transition-all", currentTheme === 'primary' ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600")}
                  >
                     Primary
                  </button>
                  <button
                     onClick={() => updateContent({ [themeKey!]: 'secondary' })}
                     className={cn("px-1 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl transition-all", currentTheme === 'secondary' ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600")}
                  >
                     Secondary
                  </button>
                  <button
                     onClick={() => updateContent({ [themeKey!]: 'custom' })}
                     className={cn("px-1 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl transition-all", isCustom ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600")}
                  >
                     Custom
                  </button>
               </div>
            </div>

            {isCustom && (
               <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-10 mb-10 overflow-hidden">
                  {/* 2. Colori Personalizzati */}
                  <section className="pt-8 border-t border-zinc-100">
                     <SectionHeader icon={Palette} title="Colori Personalizzati" colorClass="text-blue-500" />
                     <div className="grid grid-cols-2 gap-4 mt-6">
                        <ColorInput 
                           label="Sfondo"
                           value={getVal('BgColor', '#3b82f6')}
                           onChange={(val) => updateVal('BgColor', val)}
                        />
                        <ColorInput 
                           label="Testo"
                           value={getVal('TextColor', '#ffffff')}
                           onChange={(val) => updateVal('TextColor', val)}
                        />
                     </div>
                  </section>

                  {/* 3. Design & Forma */}
                  <section className="pt-8 border-t border-zinc-100">
                     <SectionHeader icon={MousePointer2} title="Design & Forma" colorClass="text-indigo-500" />
                     <div className="space-y-8 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 block">Arrotondamento</label>
                              <input
                                 type="number"
                                 className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                                 value={getVal('Radius', 24)}
                                 placeholder="24"
                                 onChange={(e) => updateVal('Radius', parseInt(e.target.value) || 0)}
                              />
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 block">Ombra</label>
                              <select 
                                 className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                                 value={getVal('Shadow', 'none')}
                                 onChange={(e) => updateVal('Shadow', e.target.value)}
                              >
                                 <option value="none">Nessuna</option>
                                 <option value="S">Piccola</option>
                                 <option value="M">Media</option>
                                 <option value="L">Grande</option>
                              </select>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-50">
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 block">Padding X</label>
                              <input
                                 type="number"
                                 className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                                 value={getVal('PaddingX', 32)}
                                 placeholder="32"
                                 onChange={(e) => updateVal('PaddingX', parseInt(e.target.value) || 0)}
                              />
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 block">Padding Y</label>
                              <input
                                 type="number"
                                 className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                                 value={getVal('PaddingY', 12)}
                                 placeholder="12"
                                 onChange={(e) => updateVal('PaddingY', parseInt(e.target.value) || 0)}
                              />
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 block">Dimensione Testo (px)</label>
                           <input
                              type="number"
                              className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                              value={getVal('FontSize', 16)}
                              placeholder="16"
                              onChange={(e) => updateVal('FontSize', parseInt(e.target.value) || 0)}
                           />
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 block">Animazione</label>
                           <select 
                              className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                              value={getVal('Animation', 'none')}
                              onChange={(e) => updateVal('Animation', e.target.value)}
                           >
                              <option value="none">Nessuna</option>
                              <option value="move-up">Spostamento in su</option>
                              <option value="scale">Ingrandimento</option>
                           </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                           <label className="text-[12px] font-bold text-zinc-900 uppercase tracking-widest cursor-pointer">Tutto Maiuscolo</label>
                           <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                              checked={getVal('Uppercase', false)}
                              onChange={(e) => updateVal('Uppercase', e.target.checked)}
                           />
                        </div>
                     </div>
                  </section>
               </div>
            )}

            <div className="space-y-4">
               <div className="space-y-4">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo Bottone</label>
                  <input
                     className="w-full p-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                     placeholder="Es: Inizia Ora"
                     value={content[ctaKey!] || ''}
                     onChange={(e) => updateContent({ [ctaKey!]: e.target.value })}
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Link / URL</label>
                  <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                        <LinkIcon size={16} />
                     </div>
                     <input
                        className="w-full pl-12 pr-4 py-4 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 font-black focus:bg-white focus:border-zinc-900 transition-all outline-none"
                        placeholder="Es: /servizi o https://..."
                        value={content[urlKey!] || (ctaKey === 'cta' ? content.ctaLink : '') || ''}
                        onChange={(e) => updateContent({ [urlKey!]: e.target.value })}
                     />
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
}
