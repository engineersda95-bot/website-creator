'use client';

import React from 'react';
import { SimpleSliderProps } from '@/types/sidebar';

export function SimpleSlider({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "px" }: SimpleSliderProps) {
   return (
      <div className="pb-6 border-b border-zinc-50 last:border-0 last:pb-0">
         <label className="text-[12px] font-bold text-zinc-400 uppercase mb-3 block flex justify-between">
            <span>{label}</span>
            <span className="text-zinc-900 font-bold">{value}{suffix}</span>
         </label>
         <input
            type="range" min={min} max={max} step={step}
            className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900 mt-2"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
         />
      </div>
   );
}

