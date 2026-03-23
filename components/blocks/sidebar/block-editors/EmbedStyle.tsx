'use client';

import React from 'react';
import { Type } from 'lucide-react';
import { LayoutFields, ColorManager, BorderShadowManager, TypographyFields, SectionHeader } from '@/components/blocks/sidebar/SharedSidebarComponents';

export function EmbedStyle({ getStyleValue, updateStyle, project }: any) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <section>
        <SectionHeader icon={Type} title="Titolo Sezione" colorClass="text-indigo-500" />
        <TypographyFields 
          label="Grandezza Titolo" 
          sizeKey="titleSize" 
          boldKey="titleBold" 
          italicKey="titleItalic" 
          getStyleValue={getStyleValue} 
          updateStyle={updateStyle} 
          defaultValue={32} 
        />
      </section>

      <section>
        <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <div className="grid grid-cols-1 gap-4 mt-6 pt-6 border-t border-zinc-50">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Altezza (px)</label>
            <input 
              type="number" 
              className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" 
              value={getStyleValue('minHeight', 450)} 
              onChange={(e) => updateStyle({ minHeight: parseInt(e.target.value) || 0 })} 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Larghezza Max Embed (px)</label>
            <input 
              type="number" 
              className="w-full p-2.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 font-bold" 
              value={getStyleValue('contentWidth', '')} 
              placeholder="Esempio: 540"
              onChange={(e) => updateStyle({ contentWidth: parseInt(e.target.value) || undefined })} 
            />
          </div>
        </div>
      </section>

      <section>
        <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </section>

      <section>
        <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
      </section>
    </div>
  );
}
