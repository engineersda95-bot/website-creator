'use client';

import React from 'react';
import { Share2, Youtube, MapPin, Instagram, Code, Twitter } from 'lucide-react';
import { SectionHeader, SimpleInput } from '@/components/blocks/sidebar/SharedSidebarComponents';
import { cn } from '@/lib/utils';

export function EmbedContent({ selectedBlock, updateContent }: any) {
  const content = selectedBlock?.content;
  if (!content) return null;

  const types = [
    { id: 'youtube', label: 'YouTube', icon: Youtube },
    { id: 'map', label: 'Google Maps', icon: MapPin },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'custom', label: 'Custom / Iframe', icon: Code },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <section className="mb-12 pb-8 border-b border-zinc-100">
        <SimpleInput
          label="Titolo Sezione (Opzionale)"
          placeholder="Es: Seguici su Instagram"
          value={content.title || ''}
          onChange={(val) => updateContent({ title: val })}
        />
      </section>

      <section>
        <SectionHeader icon={Share2} title="Configurazione Embed" colorClass="text-blue-500" />

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => updateContent({ type: type.id })}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group",
                  content.type === type.id
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-xl scale-[1.02]"
                    : "bg-zinc-50 border-transparent text-zinc-400 hover:bg-white hover:border-zinc-200"
                )}
              >
                <type.icon size={20} className={cn(content.type === type.id ? "text-white" : "group-hover:text-zinc-600")} />
                <span className="text-[10px] font-black uppercase tracking-tight">{type.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 space-y-6">
            <SimpleInput
              label={
                content.type === 'youtube' ? "Video URL o ID" :
                  content.type === 'map' ? "Indirizzo" :
                    content.type === 'instagram' ? "URL Post Instagram" :
                      "URL o Codice Iframe"
              }
              placeholder={
                content.type === 'youtube' ? "URL Video o ID (es: dQw4w9WgXcQ)" :
                  content.type === 'map' ? "Inserisci Indirizzo (es: Via Roma 1, Milano)" :
                    content.type === 'instagram' ? "URL Post Instagram" :
                      "Inserisci URL o intero tag <iframe>"
              }
              value={content.url || ''}
              onChange={(val) => updateContent({ url: val })}
            />
          </div>

          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <p className="text-[10px] text-blue-600 font-medium leading-relaxed space-y-2">
              {content.type === 'youtube' && "💡 Inserisci l'indirizzo del video o solo l'ID finale. L'aspect ratio verrà mantenuto a 16:9."}
              {content.type === 'map' && "Scrivi semplicemente l'indirizzo dell'attività o del luogo. Il sistema genererà la mappa automaticamente."}
              {content.type === 'instagram' && "📸 Copia l'URL del post. Verrà visualizzato centrato con un formato ottimizzato per i social."}
              {content.type === 'custom' && "🛠 Puoi incollare l'intero codice HTML dell'iframe o semplicemente l'URL."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
