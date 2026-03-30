'use client';

import React from 'react';
import { Play, Timer } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { cn } from '@/lib/utils';

interface AnimationManagerProps {
  getStyleValue: (key: string, defaultValue: any) => any;
  updateStyle: (style: any) => void;
}

export const AnimationManager: React.FC<AnimationManagerProps> = ({
  getStyleValue,
  updateStyle
}) => {
  const currentType = getStyleValue('animationType', 'none');
  const duration = getStyleValue('animationDuration', 0.8);

  const animationTypes = [
    { id: 'none', label: 'Nessuna' },
    { id: 'slide-up', label: 'Slide Up' },
    { id: 'slide-down', label: 'Slide Down' },
    { id: 'slide-left', label: 'Slide Left' },
    { id: 'slide-right', label: 'Slide Right' },
    { id: 'zoom-in', label: 'Zoom In' },
  ];

  return (
    <section className="pt-8 border-t border-zinc-100">
      <SectionHeader icon={Play} title="Animazioni Ingresso" />
      
      <div className="space-y-6">
        <div>
          <label className="text-[11px] font-black text-zinc-400 uppercase mb-3 block tracking-wider font-black">
            Tipo di Animazione
          </label>
          <div className="grid grid-cols-3 gap-2">
            {animationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => updateStyle({ animationType: type.id })}
                className={cn(
                  "p-2.5 text-[10px] font-bold uppercase border rounded-xl transition-all",
                  currentType === type.id
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-md scale-[1.02]"
                    : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {currentType !== 'none' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Timer size={12} /> Durata: <span className="text-zinc-900 font-black">{duration.toFixed(1)}s</span>
              </label>
            </div>
            <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={duration}
                onChange={(e) => updateStyle({ animationDuration: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900 mt-2"
              />
          </div>
        )}
      </div>
    </section>
  );
};
