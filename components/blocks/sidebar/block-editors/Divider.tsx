'use client';

import React from 'react';
import {
  Layers,
  Palette,
  Settings,
} from 'lucide-react';
import {
  AnchorManager,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  LayoutFields,
  PatternManager,
  UnifiedSection as Section, 
  useUnifiedSections, 
  CategoryHeader, 
  ManagerWrapper
} from '../SharedSidebarComponents';

interface DividerProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const Divider: React.FC<DividerProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const { openSection, toggleSection } = useUnifiedSections();

  const appearance = project?.settings?.appearance || 'light';
  const defaultTextColor = appearance === 'dark'
    ? (project?.settings?.themeColors?.dark?.text || '#ffffff')
    : (project?.settings?.themeColors?.light?.text || '#000000');

  return (
    <div>
      {/* Components */}
      <CategoryHeader label="Componenti" />

      <Section icon={Palette} label="Elemento Visivo" id="visual" isOpen={openSection === 'visual'} onToggle={toggleSection}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Larghezza (%)</label>
              <span className="text-[10px] font-bold text-zinc-900 bg-white px-2 py-0.5 rounded-full border border-zinc-200">{getStyleValue('dividerWidth', 100)}%</span>
            </div>
            <input type="range" min="5" max="100" step="1" className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              value={getStyleValue('dividerWidth', 100)}
              onChange={(e) => updateStyle({ dividerWidth: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Spessore (px)</label>
              <span className="text-[10px] font-bold text-zinc-900 bg-white px-2 py-0.5 rounded-full border border-zinc-200">{getStyleValue('dividerStroke', 1)}px</span>
            </div>
            <input type="range" min="0.5" max="20" step="0.5" className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              value={getStyleValue('dividerStroke', 1)}
              onChange={(e) => updateStyle({ dividerStroke: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase block">Colore Linea</label>
            <input
              type="color"
              className="w-full h-8 border-2 border-zinc-50 rounded-lg cursor-pointer bg-transparent"
              value={getStyleValue('dividerColor', defaultTextColor)}
              onChange={(e) => updateStyle({ dividerColor: e.target.value })}
            />
            <button
              onClick={() => updateStyle({ dividerColor: undefined })}
              className="w-full p-2.5 text-[10px] font-black text-zinc-400 border border-zinc-100 border-dashed rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all uppercase tracking-widest bg-white/50"
            >
              Resetta a Tema Globale
            </button>
          </div>
        </div>
      </Section>

      {/* Style */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
        />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} showTitle={false} />
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Immagine Sfondo">
          <BackgroundManager
            selectedBlock={selectedBlock}
            updateContent={updateContent}
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
          />
        </ManagerWrapper>
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Pattern Decorativo">
          <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </ManagerWrapper>
      </Section>

      <Section icon={Settings} label="Avanzate" id="advanced" isOpen={openSection === 'advanced'} onToggle={toggleSection}>
        <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <AnchorManager selectedBlock={selectedBlock} updateContent={updateContent} />
      </Section>
    </div>
  );
};
