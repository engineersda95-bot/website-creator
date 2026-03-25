'use client';

import React from 'react';
import { Bold, Italic, CaseSensitive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypographyFieldsProps } from '@/types/sidebar';
import { useEditorStore } from '@/store/useEditorStore';

export function TypographyFields({ 
  label, 
  sizeKey, 
  boldKey, 
  italicKey, 
  uppercaseKey,
  tagKey,
  showTagSelector,
  defaultTag,
  getStyleValue, 
  updateStyle, 
  min = 8, 
  max = 160, 
  defaultValue = 16 
}: TypographyFieldsProps) {
    const project = useEditorStore((state: any) => state.project);
    const viewport = useEditorStore((state: any) => state.viewport);

    const currentTag = tagKey ? getStyleValue(tagKey, '') : '';
    const displayTag = currentTag || defaultTag;
    
    // Resolve global default size
    const resolveGlobalSize = () => {
      if (!project?.settings) return defaultValue;
      
      const isDesktop = viewport === 'desktop';
      const baseTypo = project.settings.typography || {};
      const respTypo = project.settings.responsive?.[viewport]?.typography || {};
      
      const typo = isDesktop ? baseTypo : { ...baseTypo, ...respTypo };
      
      if (displayTag?.startsWith('h')) {
        const hKey = `${displayTag}Size` as keyof typeof typo;
        if (typo[hKey]) return typo[hKey];
      }
      
      if (displayTag === 'p' || displayTag === 'div' || displayTag === 'span') {
        if (typo.bodySize) return typo.bodySize;
      }

      return defaultValue;
    };

    const globalDefaultSize = resolveGlobalSize();
    const currentSize = getStyleValue(sizeKey, null);
    const displaySize = currentSize !== null ? currentSize : globalDefaultSize;

    return (
       <div className="pb-6 border-b border-zinc-50 last:border-0 last:pb-0">
          <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between items-center">
             <span>{label}</span>
             <div className="flex items-center gap-3">
               {showTagSelector && tagKey && (
                 <select 
                   className="text-[10px] font-black bg-zinc-100 border-none rounded px-1.5 py-0.5 outline-none cursor-pointer hover:bg-zinc-200 transition-colors uppercase tracking-widest"
                   value={currentTag}
                   onChange={(e) => updateStyle({ [tagKey]: e.target.value })}
                 >
                   <option value="">Tag SEO {defaultTag ? `(${defaultTag.toUpperCase()})` : '(Auto)'}</option>
                   <option value="h1">H1</option>
                   <option value="h2">H2</option>
                   <option value="h3">H3</option>
                   <option value="h4">H4</option>
                   <option value="h5">H5</option>
                   <option value="h6">H6</option>
                   <option value="p">P</option>
                   <option value="div">DIV</option>
                   <option value="span">SPAN</option>
                 </select>
               )}
               <span className={cn("font-bold", currentSize === null ? "text-zinc-300" : "text-zinc-900")}>
                 {displaySize}px {currentSize === null ? '(Auto)' : ''}
               </span>
             </div>
          </label>
         <div className="flex gap-2">
            <input
               type="range" min={min} max={max} step="1"
               className="flex-1 h-2 mt-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
               value={displaySize}
               onChange={(e) => updateStyle({ [sizeKey]: parseInt(e.target.value) })}
            />
            <div className="flex border rounded-xl overflow-hidden shrink-0">
               {boldKey && (
                  <button
                     onClick={() => updateStyle({ [boldKey]: !getStyleValue(boldKey, false) })}
                     className={cn("p-2 px-3 transition-all", getStyleValue(boldKey, false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}
                  >
                     <Bold size={14} />
                  </button>
               )}
               {italicKey && (
                  <button
                     onClick={() => updateStyle({ [italicKey]: !getStyleValue(italicKey, false) })}
                     className={cn("p-2 px-3 transition-all", getStyleValue(italicKey, false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}
                  >
                     <Italic size={14} />
                  </button>
               )}
               {uppercaseKey && (
                  <button
                     onClick={() => updateStyle({ [uppercaseKey]: !getStyleValue(uppercaseKey, false) })}
                     className={cn("p-2 px-3 transition-all", getStyleValue(uppercaseKey, false) ? "bg-zinc-900 text-white" : "bg-white text-zinc-400")}
                  >
                     <CaseSensitive size={16} />
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}

