'use client';

import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SectionHeader, SimpleInput, RichTextarea } from '@/components/blocks/sidebar/SharedSidebarComponents';

export function ContactContent({ selectedBlock, updateContent }: any) {
  const content = selectedBlock?.content;
  if (!content) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      
      {/* 1. Informazioni di Contatto */}
      <section>
        <SectionHeader icon={Mail} title="Informazioni Aziendali" colorClass="text-zinc-500" />
        <div className="space-y-6">
          <SimpleInput 
            label="Titolo Sezione" 
            value={content.title || ''} 
            onChange={(val) => updateContent({ title: val })} 
          />
          <RichTextarea 
            label="Sottotitolo" 
            value={content.subtitle || ''} 
            onChange={(val) => updateContent({ subtitle: val })} 
          />
          
          <div className="pt-6 grid gap-6">
            <SimpleInput 
              label="E-mail" 
              placeholder="info@tuaazienda.it" 
              value={content.email || ''} 
              onChange={(val) => updateContent({ email: val })} 
              icon={Mail}
            />
            <SimpleInput 
              label="Telefono" 
              placeholder="+39 02 1234567" 
              value={content.phone || ''} 
              onChange={(val) => updateContent({ phone: val })} 
              icon={Phone}
            />
            <SimpleInput 
              label="Indirizzo" 
              placeholder="Via Roma 1, Milano" 
              value={content.address || ''} 
              onChange={(val) => updateContent({ address: val })} 
              icon={MapPin}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl mt-4">
            <div className="space-y-1">
              <label className="text-[12px] font-black uppercase text-zinc-900 tracking-widest leading-none">Mostra Mappa Google</label>
              <p className="text-[13px] text-zinc-400 font-bold uppercase tracking-tight">Verrà mostrata se inserisci l'indirizzo</p>
            </div>
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
              checked={content.showMap !== false}
              onChange={(e) => updateContent({ showMap: e.target.checked })}
            />
          </div>
        </div>
      </section>

    </div>
  );
}

