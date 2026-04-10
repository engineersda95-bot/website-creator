'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function ScoreBadge({ score, onClick }: { score: number; onClick?: () => void }) {
  if (score === undefined) return null;

  return (
    <button
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all hover:shadow-sm",
        score === 100 ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" :
        score >= 60 ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" :
        "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
      )}
      title="Punteggio SEO"
    >
      {score}%
    </button>
  );
}
