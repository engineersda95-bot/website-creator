'use client';

import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, Trash2, Instagram, Twitter, Layout, Star, Share2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '../ImageUpload';

interface LegacyContentProps {
   selectedBlock: any;
   updateContent: (content: any) => void;
   updateStyle: (style: any) => void;
}

export const LegacyContent: React.FC<LegacyContentProps> = ({
   selectedBlock,
   updateContent,
   updateStyle
}) => {
   if (selectedBlock.type === 'image-text') {
      return (
         <div className="space-y-6">
            <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50" placeholder="Titolo" value={selectedBlock.content.title || ''} onChange={(e) => updateContent({ title: e.target.value })} />
            <textarea className="w-full p-3 border border-zinc-200 rounded-xl text-sm h-32 bg-zinc-50" placeholder="Testo" value={selectedBlock.content.text || ''} onChange={(e) => updateContent({ text: e.target.value })} />
            <input className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-bold bg-zinc-50" placeholder="Testo Bottone" value={selectedBlock.content.cta || ''} onChange={(e) => updateContent({ cta: e.target.value })} />
            <ImageUpload label="Immagine" value={selectedBlock.content.image} onChange={(val: string) => updateContent({ image: val })} />
            <div className="flex items-center justify-between pt-4 border-t">
               <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Posizione Foto</label>
               <div className="flex border rounded-lg overflow-hidden">
                  <button onClick={() => updateContent({ imageSide: 'left' })} className={cn("p-2", selectedBlock.content.imageSide !== 'right' ? "bg-zinc-900 text-white" : "text-zinc-400")}><AlignLeft size={16} /></button>
                  <button onClick={() => updateContent({ imageSide: 'center' })} className={cn("p-2", selectedBlock.content.imageSide === 'center' ? "bg-zinc-900 text-white" : "text-zinc-400")}><AlignCenter size={16} /></button>
                  <button onClick={() => updateContent({ imageSide: 'right' })} className={cn("p-2", selectedBlock.content.imageSide === 'right' ? "bg-zinc-900 text-white" : "text-zinc-400")}><AlignRight size={16} /></button>
               </div>
            </div>
         </div>
      );
   }

   if (selectedBlock.type === 'services') {
      return (
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
      );
   }

   if (selectedBlock.type === 'contact') {
      return (
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
      );
   }

   if (selectedBlock.type === 'map') {
      return (
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
      );
   }

   if (selectedBlock.type === 'embed') {
      return (
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
      );
   }

   if (selectedBlock.type === 'image') {
      return (
         <ImageUpload label="Immagine" value={selectedBlock.content.url} onChange={(val: string) => updateContent({ url: val })} />
      );
   }

   if (selectedBlock.type === 'gallery') {
      return (
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
                     <ImageUpload value={item.url} onChange={(val: string) => {
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
      );
   }

   if (['features', 'reviews', 'product-carousel'].includes(selectedBlock.type)) {
      return (
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
                        <ImageUpload label="Immagine" value={item.image || item.avatar} onChange={(val: string) => {
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
      );
   }

   if (selectedBlock.type === 'pdf-viewer') {
      return (
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
      );
   }

   return null;
};
