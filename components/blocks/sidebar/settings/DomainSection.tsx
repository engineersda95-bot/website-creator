'use client';

import React, { useState } from 'react';
import { Globe, AlertCircle, Copy, HelpCircle, Check, Trash2 } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { ProjectSettings } from '@/types/editor';
import { toast } from '@/components/shared/Toast';
import { confirm } from '@/components/shared/ConfirmDialog';

interface DomainSectionProps {
   project: any;
   updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
   canCustomDomain?: boolean;
}

export const DomainSection: React.FC<DomainSectionProps> = ({
   project,
   updateProjectSettings,
   canCustomDomain = true,
}) => {
   const [domain, setDomain] = useState(project?.settings?.customDomain || '');
   const [copied, setCopied] = useState<string | null>(null);

   const liveUrl = project?.live_url;
   const targetDomain = liveUrl ? liveUrl.replace('https://', '').replace(/\/$/, '') : null;

   const handleCopy = (text: string, label: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
      toast(`Copiato: ${label}`, 'success');
   };

   return (
      <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="flex items-center justify-between">
            <SectionHeader icon={Globe} title="Dominio Personalizzato" colorClass="text-blue-500" />
         </div>

         {!canCustomDomain ? (
         <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-start gap-4">
            <div className="p-2 bg-white rounded-2xl shadow-sm text-amber-500 shrink-0">
               <AlertCircle size={20} />
            </div>
            <div className="space-y-1">
               <h5 className="text-[13px] font-bold text-amber-900 uppercase tracking-wide">Funzione non disponibile</h5>
               <p className="text-[12px] text-amber-700/80 leading-relaxed font-medium">
                  Il dominio personalizzato non è incluso nel tuo piano attuale. Effettua un upgrade per collegare il tuo dominio.
               </p>
            </div>
         </div>
      ) : !liveUrl ? (
            <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-start gap-4">
               <div className="p-2 bg-white rounded-2xl shadow-sm text-amber-500 shrink-0">
                  <AlertCircle size={20} />
               </div>
               <div className="space-y-1">
                  <h5 className="text-[13px] font-bold text-amber-900 uppercase tracking-wide">Prima Pubblicazione Necessaria</h5>
                  <p className="text-[12px] text-amber-700/80 leading-relaxed font-medium">
                     Il sito non è ancora stato pubblicato. Per collegare un dominio personalizzato, devi prima effettuare una pubblicazione sulla dashboard.
                  </p>
               </div>
            </div>
         ) : (
            <div className="space-y-6">
               {/* Input Phase */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block">Il tuo dominio</label>
                  </div>
                  <div className="flex gap-2">
                     <div className="relative flex-1 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                           <Globe size={16} />
                        </div>
                        <input
                           type="text"
                           placeholder="es. mioristorante.it"
                           className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-2xl text-[14px] focus:border-blue-500 transition-all outline-none bg-zinc-50/50 shadow-inner"
                           value={domain}
                           onChange={(e) => {
                              const val = e.target.value.toLowerCase().replace('https://', '').replace('http://', '').trim();
                              setDomain(val);
                           }}
                           onBlur={() => {
                              // Trigger store update on blur to enable the "Save" button in the dashboard
                              if (domain !== project?.settings?.customDomain) {
                                 updateProjectSettings({ customDomain: domain });
                              }
                           }}
                        />
                     </div>

                     {project?.settings?.customDomain && (
                        <button
                           onClick={async () => {
                              if (await confirm({ title: 'Rimuovi dominio', message: 'Vuoi davvero rimuovere il dominio personalizzato? Il sito tornerà visibile solo sul sottodominio gratuito.', confirmLabel: 'Rimuovi', variant: 'danger' })) {
                                 setDomain('');
                                 updateProjectSettings({
                                    customDomain: '',
                                    domainStatus: undefined
                                 });
                                 toast('Dominio rimosso con successo', 'success');
                              }
                           }}
                           className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                           title="Rimuovi dominio"
                        >
                           <Trash2 size={20} />
                        </button>
                     )}
                  </div>
               </div>

               {domain && targetDomain && (
                  <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden space-y-6">
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                     <div className="relative z-10 space-y-4">
                        <h4 className="text-white text-[13px] font-bold flex items-center gap-2">
                           <HelpCircle size={16} className="text-blue-400" />
                           Istruzioni Configurazione DNS
                        </h4>

                        <div className="space-y-4">
                           <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl">
                              <p className="text-zinc-300 text-[13px] leading-relaxed mb-4">
                                 Crea questi record <span className="text-white font-bold">CNAME</span> nel tuo pannello DNS:
                              </p>
                              <div className="space-y-4">
                                 {[
                                    { host: '@ / root', val: targetDomain, label: 'Host Principale' },
                                    { host: 'www', val: targetDomain, label: 'Host WWW' }
                                 ].map((rec, i) => (
                                    <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-700/50">
                                       <div className="space-y-1">
                                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest pl-1">Host</span>
                                          <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900 rounded-lg border border-zinc-700/50">
                                             <code className="text-emerald-400 text-[11px] font-bold">{rec.host === '@ / root' ? '@' : 'www'}</code>
                                             <button onClick={() => handleCopy(rec.host === '@ / root' ? '@' : 'www', rec.label)} className="text-zinc-600 hover:text-white transition-colors">
                                                {copied === rec.label ? <Check size={12} /> : <Copy size={12} />}
                                             </button>
                                          </div>
                                       </div>
                                       <div className="space-y-1">
                                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest pl-1">Target</span>
                                          <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900 rounded-lg border border-zinc-700/50">
                                             <code className="text-white text-[11px] font-bold truncate pr-3">{rec.val}</code>
                                             <button onClick={() => handleCopy(rec.val, rec.label + ' Val')} className="text-zinc-600 hover:text-white transition-colors">
                                                {copied === rec.label + ' Val' ? <Check size={12} /> : <Copy size={12} />}
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Info Box */}
               <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
                  <div className="p-2 bg-white rounded-2xl shadow-sm text-blue-500 shrink-0">
                     <AlertCircle size={20} />
                  </div>
                  <div className="space-y-1">
                     <h5 className="text-[13px] font-bold text-blue-900 uppercase tracking-wide">Importante</h5>
                     <p className="text-[12px] text-blue-700/80 leading-relaxed font-medium">
                        Il sito sarà accessibile sia su <span className="font-bold">www.{domain || 'tuodominio.it'}</span> che sulla versione senza www (root),
                        purché il tuo provider supporti il redirect automatico o il CNAME Flattening (es. Cloudflare).
                     </p>
                  </div>
               </div>
            </div>
         )}
      </section>
   );
};
