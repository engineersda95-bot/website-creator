import React from 'react';
import { Layers, Type, Palette, Star } from 'lucide-react';
import { LayoutFields, TypographyFields, ColorManager, SectionHeader, BorderShadowManager, SimpleSlider, BackgroundManager, PatternManager, AnchorManager, AnimationManager } from '../SharedSidebarComponents';

interface PricingStyleProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const PricingStyle: React.FC<PricingStyleProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* 1. Layout & Spaziatura (Blocco) */}
      <section>
        <SectionHeader icon={Layers} title="Layout & Spaziatura" />
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
        
        <div className="pt-8 mt-8 border-t border-zinc-100 space-y-8">
           <SimpleSlider 
              label="Spaziatura tra Piani (Gap)" 
              value={getStyleValue('gap', 32)} 
              onChange={(val: number) => updateStyle({ gap: val })} 
              max={100} step={4}
           />
        </div>
      </section>

      {/* 2. Colori & Sfondo (Blocco) */}
      <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} />
      <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

      <BackgroundManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
        updateStyle={updateStyle} 
        getStyleValue={getStyleValue} 
      />

      {/* 3. Bordi e Ombre (Blocco) */}
      <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />

      {/* 4. Stile Card (Contenitore Interno) */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Palette} title="Stile Card & Piani" />
        <div className="space-y-10">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                 <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Sfondo Card</label>
                 <input
                    type="color"
                    className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                    value={getStyleValue('cardBgColor', '#ffffff')}
                    onChange={(e) => updateStyle({ cardBgColor: e.target.value })}
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">Testo Card</label>
                 <input
                    type="color"
                    className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                    value={getStyleValue('cardTextColor', '#000000')}
                    onChange={(e) => updateStyle({ cardTextColor: e.target.value })}
                 />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block flex items-center gap-2">
                <Star size={12} className="text-amber-400 fill-amber-400" /> Colore Evidenziatore (Piani Pro)
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                  value={getStyleValue('highlightColor', '#000000')}
                  onChange={(e) => updateStyle({ highlightColor: e.target.value })}
                />
                <button 
                  onClick={() => updateStyle({ highlightColor: project?.settings?.primaryColor || '#000000' })}
                  className="px-4 py-2 border rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-zinc-50 transition-all"
                >
                  Usa Colore Brand
                </button>
              </div>
           </div>

           <SimpleSlider 
              label="Arrotondamento Card" 
              value={getStyleValue('cardBorderRadius', 24)} 
              onChange={(val: number) => updateStyle({ cardBorderRadius: val })} 
              max={100}
           />

           <SimpleSlider 
              label="Padding Interno Card" 
              value={getStyleValue('cardPadding', 40)} 
              onChange={(val: number) => updateStyle({ cardPadding: val })} 
              max={100} step={4}
           />
           
           <button
             onClick={() => updateStyle({ cardBgColor: undefined, cardTextColor: undefined, highlightColor: undefined, cardBorderRadius: undefined, cardPadding: undefined })}
             className="w-full p-2.5 text-[12px] font-bold text-zinc-400 border border-dashed rounded-xl hover:text-zinc-900 transition-all uppercase tracking-widest"
           >
             Resetta Stili Card
           </button>
        </div>
      </section>

      {/* 5. Stile Testi */}
      <section className="pt-8 border-t border-zinc-100">
        <SectionHeader icon={Type} title="Stile Testi" />
        <div className="space-y-8">
          <TypographyFields
            label="Dimensione Titolo Sezione"
            sizeKey="titleSize"
            boldKey="titleBold"
            italicKey="titleItalic"
            tagKey="titleTag"
            showTagSelector={true}
            defaultTag="h2"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={48}
          />
          <TypographyFields
            label="Dimensione Sottotitolo Sezione"
            sizeKey="subtitleSize"
            boldKey="subtitleBold"
            italicKey="subtitleItalic"
            getStyleValue={getStyleValue}
            updateStyle={updateStyle}
            defaultValue={18}
          />

          <div className="pt-8 mt-8 border-t border-zinc-100 space-y-8">
            <TypographyFields
              label="Nome Piano (Card)"
              sizeKey="planNameSize"
              boldKey="planNameBold"
              italicKey="planNameItalic"
              getStyleValue={getStyleValue}
              updateStyle={updateStyle}
              defaultValue={14}
            />
            <TypographyFields
              label="Prezzo (Card)"
              sizeKey="priceSize"
              boldKey="priceBold"
              italicKey="priceItalic"
              getStyleValue={getStyleValue}
              updateStyle={updateStyle}
              defaultValue={40}
            />
            <TypographyFields
              label="Recorrenza (Card)"
              sizeKey="periodSize"
              boldKey="periodBold"
              italicKey="periodItalic"
              getStyleValue={getStyleValue}
              updateStyle={updateStyle}
              defaultValue={18}
            />
            <TypographyFields
              label="Caratteristiche (Card)"
              sizeKey="featuresSize"
              boldKey="featuresBold"
              italicKey="featuresItalic"
              getStyleValue={getStyleValue}
              updateStyle={updateStyle}
              defaultValue={14}
            />
            <TypographyFields
              label="Etichetta Consigliato (Card)"
              sizeKey="labelSize"
              boldKey="labelBold"
              italicKey="labelItalic"
              getStyleValue={getStyleValue}
              updateStyle={updateStyle}
              defaultValue={10}
            />
          </div>
        </div>
      </section>
      <AnimationManager 
        getStyleValue={getStyleValue} 
        updateStyle={updateStyle} 
      />

      <AnchorManager 
        selectedBlock={selectedBlock} 
        updateContent={updateContent} 
      />
    </div>
  );
};
