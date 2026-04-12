'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * ColorInput Component
 * 
 * A centralized color picker that allows:
 * 1. Visual selection via native browser color picker
 * 2. Direct Hexadecimal input
 */

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorInput({ value, onChange, label }: ColorInputProps) {
  // Local state to handle typing without immediate validation errors
  const [localValue, setLocalValue] = useState(value || '');

  // Keep local state in sync with external value
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    
    // Ensure it starts with #
    if (newVal && !newVal.startsWith('#')) {
      newVal = '#' + newVal;
    }
    
    setLocalValue(newVal);

    // Validate hex (3 or 6 digits, must start with #)
    const isValidHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newVal);
    
    if (isValidHex) {
      onChange(newVal);
    }
  };

  return (
    <div className="group/field space-y-1.5 min-w-0">
      {label && (
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.12em] pl-1 block group-focus-within/field:text-zinc-600 transition-colors truncate">
          {label}
        </label>
      )}
      <div className={cn(
        "flex bg-white border border-zinc-200 rounded-xl h-10 overflow-hidden transition-all duration-300",
        "hover:border-zinc-300 hover:shadow-sm",
        "focus-within:ring-4 focus-within:ring-zinc-900/5 focus-within:border-zinc-900/10"
      )}>
        {/* Color Swatch / Area */}
        <div className="relative w-10 h-full shrink-0 group/swatch border-r border-zinc-100">
          <input 
            type="color" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
          />
          <div 
            className="w-full h-full transition-opacity duration-300 group-hover/swatch:opacity-90" 
            style={{ backgroundColor: value || '#000000' }}
          />
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.05)]" />
        </div>
        
        {/* Hex Text Input */}
        <input 
          type="text"
          className={cn(
            "flex-1 min-w-0 px-2 text-[11px] font-mono font-black outline-none bg-transparent text-zinc-900 uppercase tracking-tight",
            "placeholder:text-zinc-400"
          )}
          value={localValue}
          onChange={handleTextChange}
          placeholder="#HEX"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
