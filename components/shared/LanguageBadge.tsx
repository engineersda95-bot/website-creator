import React from 'react';
import { LANGUAGES } from '@/lib/editor-constants';
import { cn } from '@/lib/utils';

interface LanguageBadgeProps {
  languageCode: string;
  className?: string;
  showCode?: boolean;
}

export function LanguageBadge({ languageCode, className, showCode }: LanguageBadgeProps) {
  const code = languageCode?.split('-')[0]?.toLowerCase() || 'it';
  const langObj = LANGUAGES.find(l => l.value === code);
  
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center px-1.5 py-0.5 flex-shrink-0 bg-white border border-zinc-200 rounded-md shadow-sm font-bold text-zinc-600 hover:border-zinc-300 transition-all",
        className
      )}
      title={langObj?.label || code.toUpperCase()}
    >
      <span className="text-[10px] uppercase">{code}</span>
    </div>
  );
}
