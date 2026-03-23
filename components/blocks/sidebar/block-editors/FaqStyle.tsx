'use client';

import React from 'react';
import { Type, Palette, AlignLeft, Layers } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager } from '../SharedSidebarComponents';

interface FAQStyleProps {
  selectedBlock: any;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const FAQStyle: React.FC<FAQStyleProps> = ({
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
          paddingLabel="Padding Sezione"
        />
        
        <div className="mt-8 pt-8 border-t border-zinc-50 space-y-6">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block flex justify-between">
            <span>Larghezza Massima Sezione</span>
            <span className="text-zinc-900 font-bold">{getStyleValue('maxWidth', 800)}px</span>
          </label>
          <input 
            type="range" min="400" max="1400" step="50" 
            className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
            value={getStyleValue('maxWidth', 800)}
            onChange={(e) => updateStyle({ maxWidth: parseInt(e.target.value) })}
          />
        </div>
      </section>

      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Type} title="Stile Testi" colorClass="text-indigo-500" />
        
        <div className="space-y-8">
          <TypographyFields 
            label="Titolo Sezione" 
            sizeKey="titleSize" 
            boldKey="titleBold" 
            italicKey="titleItalic" 
            getStyleValue={getStyleValue} 
            updateStyle={updateStyle} 
            defaultValue={48} 
          />
          
          <TypographyFields 
            label="Dimensione Domande" 
            sizeKey="questionSize" 
            boldKey="questionBold" 
            italicKey="questionItalic" 
            getStyleValue={getStyleValue} 
            updateStyle={updateStyle} 
            defaultValue={18} 
            min={12}
            max={40}
          />

          <TypographyFields 
            label="Dimensione Risposte" 
            sizeKey="answerSize" 
            boldKey="answerBold" 
            italicKey="answerItalic" 
            getStyleValue={getStyleValue} 
            updateStyle={updateStyle} 
            defaultValue={16} 
            min={12}
            max={32}
          />
        </div>
      </section>

      <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />

      <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
    </div>
  );
};
