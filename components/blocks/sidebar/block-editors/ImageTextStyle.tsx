'use client';

import React from 'react';
import { Layers, Type, MoreVertical, MoveHorizontal } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager } from '../SharedSidebarComponents';
import { cn } from '@/lib/utils';

interface ImageTextStyleProps {
  selectedBlock: any;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const ImageTextStyle: React.FC<ImageTextStyleProps> = ({
  selectedBlock,
  updateStyle,
  getStyleValue,
  project
}) => {
  return (
    <div className="space-y-10">
      <section>
        <SectionHeader icon={Layers} title="Layout & Spaziatura" colorClass="text-blue-500" />
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />

        {/* <div className="mt-6 flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Larghezza Piena (Full Width)</label>
          <button
            onClick={() => updateStyle({ maxWidth: Number(getStyleValue('maxWidth', '')) === 100 ? '' : 100 })}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
              Number(getStyleValue('maxWidth', '')) === 100
                ? "bg-zinc-900 text-white"
                : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300"
            )}
          >
            {Number(getStyleValue('maxWidth', '')) === 100 ? 'ON' : 'OFF'}
          </button>
        </div> */}

        <div className="space-y-6 mt-8 pt-8 border-t border-zinc-50">
          {/* Posizione Immagine */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex items-center gap-2">
              <MoveHorizontal size={12} /> Posizione Immagine
            </label>
            <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
              {[
                { id: 'left', label: 'Sinistra' },
                { id: 'right', label: 'Destra' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateStyle({ imagePosition: item.id })}
                  className={cn(
                    "flex-1 p-2.5 text-[10px] font-bold uppercase transition-all",
                    getStyleValue('imagePosition', 'left') === item.id
                      ? "bg-zinc-900 text-white shadow-lg z-10"
                      : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Allineamento Verticale */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex items-center gap-2">
              <MoreVertical size={12} /> Allineamento Verticale
            </label>
            <div className="flex border rounded-xl overflow-hidden bg-zinc-50">
              {[
                { id: 'top', label: 'Sopra' },
                { id: 'center', label: 'Centro' },
                { id: 'bottom', label: 'Sotto' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateStyle({ verticalAlign: item.id })}
                  className={cn(
                    "flex-1 p-2.5 text-[10px] font-bold uppercase transition-all",
                    getStyleValue('verticalAlign', 'center') === item.id
                      ? "bg-zinc-900 text-white shadow-lg z-10"
                      : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block tracking-widest">Gap Colonne (px)</label>
            <input
              type="number"
              className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold"
              value={getStyleValue('gap', 60)}
              onChange={(e) => updateStyle({ gap: parseInt(e.target.value) || 0 })}
            />
            <p className="text-[9px] text-zinc-400 mt-2 italic px-1">Lo spazio orizzontale tra immagine e testo.</p>
          </div>
        </div>
      </section>

      <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />

      <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Type} title="Stile Testi" colorClass="text-indigo-500" />
        <div className="space-y-8">
          <TypographyFields
            label="Dimensione Titolo"
            sizeKey="titleSize"
            boldKey="titleBold"
            italicKey="titleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={48}
          />
          <TypographyFields
            label="Dimensione Testo"
            sizeKey="subtitleSize"
            boldKey="subtitleBold"
            italicKey="subtitleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={18}
          />
        </div>
      </section>
    </div>
  );
};
