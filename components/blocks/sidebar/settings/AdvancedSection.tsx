'use client';

import React from 'react';
import { Settings, ChevronUp } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { ProjectSettings } from '@/types/editor';

interface AdvancedSectionProps {
   project: any;
   updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
   canCustomScripts?: boolean;
}

export const AdvancedSection: React.FC<AdvancedSectionProps> = ({
   project,
   updateProjectSettings,
   canCustomScripts = true,
}) => {
   return (
      <section className="pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-right-4 duration-500 delay-300 pb-12">
         <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
               <SectionHeader icon={Settings} title="Avanzate & Script" colorClass="text-zinc-500" />
               <div className="text-zinc-300 group-open:rotate-180 transition-transform mb-6">
                  <ChevronUp size={16} />
               </div>
            </summary>

            <div className="mt-2 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
               {!canCustomScripts ? (
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex items-start gap-3">
                     <Settings size={16} className="text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-[12px] font-medium text-amber-700">
                        Gli script personalizzati non sono disponibili nel tuo piano attuale. Effettua un upgrade per aggiungere analytics, pixel e altri script.
                     </p>
                  </div>
               ) : (
                  <>
                     <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden group/alert">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                        <p className="text-[12px] text-zinc-400 font-bold leading-relaxed relative z-10 italic">
                           ⚠️ Incolla solo codici fidati. Gli script funzionano solo sul sito pubblicato, non nell'editor.
                        </p>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-4">
                           <label className="text-[12px] font-black text-zinc-900 uppercase tracking-widest pl-1 block">Header Script (HEAD)</label>
                           <textarea
                              className="w-full h-40 p-4 border border-zinc-200 rounded-2xl text-[13px] font-mono bg-zinc-900 text-zinc-300 focus:border-zinc-500 transition-all outline-none resize-none shadow-inner"
                              value={project?.settings?.customScriptsHead || ''}
                              onChange={(e) => updateProjectSettings({ customScriptsHead: e.target.value })}
                              placeholder="<script>... analytics, pixel, cookie banner ... </script>"
                           />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-50">
                           <label className="text-[12px] font-black text-zinc-900 uppercase tracking-widest pl-1 block">Footer Script (BODY)</label>
                           <textarea
                              className="w-full h-40 p-4 border border-zinc-200 rounded-2xl text-[13px] font-mono bg-zinc-900 text-zinc-300 focus:border-zinc-500 transition-all outline-none resize-none shadow-inner"
                              value={project?.settings?.customScriptsBody || ''}
                              onChange={(e) => updateProjectSettings({ customScriptsBody: e.target.value })}
                              placeholder="<!-- widget chat, conversion scripts -->"
                           />
                        </div>
                     </div>
                  </>
               )}
            </div>
         </details>
      </section>
   );
};

