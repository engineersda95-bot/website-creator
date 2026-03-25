'use client';

import React, { useState, useEffect } from 'react';
import { Hash, Copy, Check, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnchorManagerProps {
   selectedBlock: any;
   updateContent: (content: Record<string, any>) => void;
}

export function AnchorManager({ selectedBlock, updateContent }: AnchorManagerProps) {
   const [copied, setCopied] = useState(false);

   // Formatta lo slug pulito (minuscolo, senza spazi, solo alfanumerico e trattini, rimosso accenti)
   const formatSlug = (val: string) => {
      if (!val) return '';
      return val
         .normalize("NFD")
         .replace(/[\u0300-\u036f]/g, "") // Rimuove gli accenti correttamente
         .toLowerCase()
         .trim()
         // Rimuove tag HTML
         .replace(/<[^>]*>?/gm, '')
         .replace(/\s+/g, '-')
         .replace(/[^a-z0-9-]/g, '')
         .substring(0, 50);
   };

   // Estrapoliamo il titolo per suggerire l'ancora parlante
   const blockTitle = selectedBlock.content?.title || selectedBlock.type || 'sezione';
   const suggestedSlug = formatSlug(blockTitle);
   const currentId = selectedBlock.content?.sectionId;

   // Auto-valorizzazione se assente (richiesta utente per default "parlante")
   useEffect(() => {
      if (!currentId && suggestedSlug) {
         updateContent({ sectionId: suggestedSlug });
      }
   }, [currentId, suggestedSlug, updateContent]);

   const handleCopy = (idToCopy: string) => {
      navigator.clipboard.writeText(`#${idToCopy}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   // Se l'ID è vuoto o mancante, lo inizializziamo col suggerito quando l'utente clicca lo Sparkles
   // Ma l'utente ha chiesto di metterlo pre-valorizzato se possibile.
   const applySuggestion = () => {
      updateContent({ sectionId: suggestedSlug });
   };

   return (
      <div className="space-y-6 pt-8 mt-10 border-t border-zinc-100/80 pb-10">
         <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
               <div className="p-1.5 bg-zinc-900 text-white rounded-lg">
                  <Hash size={12} />
               </div>
               <label className="text-[12px] font-black text-zinc-900 uppercase tracking-wider">Anchor Link</label>
            </div>


         </div>

         <div className="space-y-4">
            <div className="relative group">
               <input
                  className={cn(
                     "w-full h-14 p-4 pr-12 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-sm transition-all outline-none font-bold placeholder:text-zinc-300 focus:bg-white focus:border-zinc-900 focus:shadow-xl focus:shadow-zinc-200/50",
                     currentId ? "text-zinc-900" : "italic text-zinc-400 border-dashed"
                  )}
                  placeholder={`es. ${suggestedSlug || 'chi-siamo'}`}
                  value={currentId || ''}
                  onChange={(e) => updateContent({ sectionId: formatSlug(e.target.value) })}
               />

               {currentId && (
                  <button
                     onClick={() => handleCopy(currentId)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-900 active:scale-95"
                  >
                     {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
               )}
            </div>


         </div>

         <div className="flex gap-4 p-5 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
            <div className="w-10 h-10 shrink-0 bg-white rounded-2xl border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm shadow-zinc-200/50">
               <Info size={18} />
            </div>
            <div className="space-y-1.5">
               <p className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">Gestione Ancore</p>
               <p className="text-[12px] leading-relaxed text-zinc-500 font-medium">
                  {currentId ? (
                     <>
                        <strong>Collegamento attivo!</strong> Usa l'indirizzo <span className="text-zinc-900 font-bold mx-1">#{currentId}</span> nel campo link di qualsiasi bottone o voce di menu per far scorrere automaticamente la pagina fino a questa sezione.
                     </>
                  ) : (
                     "Inserisci un nome semplice (es. 'prodotti' o 'chi-siamo') per poter creare link diretti a questa sezione da altre parti del sito."
                  )}
               </p>
            </div>
         </div>
      </div>
   );
}
