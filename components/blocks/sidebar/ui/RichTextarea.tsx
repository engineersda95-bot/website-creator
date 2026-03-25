'use client';

import React from 'react';
import { Bold, Italic } from 'lucide-react';
import { RichTextareaProps } from '@/types/sidebar';

export function RichTextarea({ label = "Contenuto Testuale", value, onChange, placeholder }: RichTextareaProps) {
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
            <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">{label}</label>
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
      </div>
   );
}

