'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockVariant } from '@/types/block-definition';

interface VariantPickerProps {
  blockLabel: string;
  variants: BlockVariant[];
  onSelect: (variant: BlockVariant) => void;
  onClose: () => void;
}

export function VariantPicker({ blockLabel, variants, onSelect, onClose }: VariantPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Scegli uno stile</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">{blockLabel} &mdash; seleziona la variante che preferisci</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => onSelect(variant)}
              className="group text-left p-3 rounded-xl border-2 border-zinc-100 hover:border-zinc-900 hover:shadow-md transition-all"
            >
              <div className="w-full aspect-[16/10] bg-zinc-50 rounded-lg overflow-hidden mb-2.5 flex items-center justify-center border border-zinc-100">
                <variant.preview className="w-full h-full" />
              </div>
              <div className="text-[12px] font-semibold text-zinc-800 group-hover:text-zinc-900">{variant.label}</div>
              {variant.description && (
                <div className="text-[10px] text-zinc-400 mt-0.5">{variant.description}</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
