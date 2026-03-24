'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BACKGROUND_PATTERNS, PatternType } from '@/lib/background-patterns';
import { Grid } from 'lucide-react';

interface PatternManagerProps {
  getStyleValue: (key: string, defaultValue: any) => any;
  updateStyle: (style: Record<string, any>) => void;
}

export function PatternManager({ getStyleValue, updateStyle }: PatternManagerProps) {
  const currentPattern = getStyleValue('patternType', 'none') as PatternType;
  const patternColor = getStyleValue('patternColor', '#ffffff');
  const patternOpacity = getStyleValue('patternOpacity', 10);
  const patternScale = getStyleValue('patternScale', 40);

  return (
    <div className="space-y-6 pt-6 border-t border-zinc-100">
      <div className="flex items-center gap-2 mb-4">
        <Grid size={12} className="text-zinc-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Texture & Pattern</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {BACKGROUND_PATTERNS.map((p) => (
          <button
            key={p.id}
            onClick={() => updateStyle({ patternType: p.id })}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all",
              currentPattern === p.id 
                ? "border-zinc-900 bg-zinc-900 text-white shadow-md" 
                : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200"
            )}
          >
            <div 
              className="w-full h-8 rounded-lg overflow-hidden border border-black/5"
              style={{
                ...p.getStyle(currentPattern === p.id ? '#ffffff' : '#000000', 20, 20),
                backgroundColor: currentPattern === p.id ? 'transparent' : '#ffffff'
              }}
            />
            <span className="text-[8px] font-bold uppercase truncate w-full text-center">{p.label}</span>
          </button>
        ))}
      </div>

      {currentPattern !== 'none' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Colore Pattern</label>
              <input
                type="color"
                className="w-full h-10 border-2 border-zinc-50 rounded-xl cursor-pointer bg-transparent"
                value={patternColor}
                onChange={(e) => updateStyle({ patternColor: e.target.value })}
              />
            </div>
            <div>
               <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
                  <span>Opacità</span>
                  <span className="text-zinc-900 font-bold">{patternOpacity}%</span>
               </label>
               <input type="range" min="0" max="100" step="1" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                  value={patternOpacity}
                  onChange={(e) => updateStyle({ patternOpacity: parseInt(e.target.value) })}
               />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
              <span>Dimensione (Scala)</span>
              <span className="text-zinc-900 font-bold">{patternScale}px</span>
            </label>
            <input type="range" min="10" max="200" step="5" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              value={patternScale}
              onChange={(e) => updateStyle({ patternScale: parseInt(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
