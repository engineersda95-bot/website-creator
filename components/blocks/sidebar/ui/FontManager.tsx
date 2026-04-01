'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, Check, Type } from 'lucide-react';

const RAW_FONTS = [
  // Sans Serif
  "Outfit", "Inter", "Plus Jakarta Sans", "DM Sans", "Montserrat", "Roboto", "Open Sans", 
  "Poppins", "Lato", "Sora", "Manrope", "Archivo", "Lexend", "Urbanist", "Figtree",
  "Work Sans", "Public Sans", "Ubuntu", "Kanit", "Heebo", "IBM Plex Sans", "Quicksand",
  // Serif
  "Playfair Display", "Fraunces", "Cormorant Garamond", "Lora", "Merriweather", 
  "Crimson Text", "Spectral", "Arvo", "BioRhyme", "Old Standard TT", "Cinzel",
  // Display
  "Unbounded", "Bebas Neue", "Syne", "Space Grotesk", "Abril Fatface", "Righteous", 
  "Comfortaa", "Fredoka One",
  // Mono
  "Space Mono", "JetBrains Mono", "Fira Code", "Inconsolata",
  // Handwriting
  "Caveat", "Pacifico", "Shadows Into Light", "Grand Hotel"
];

const POPULAR_FONTS = Array.from(new Set(RAW_FONTS)).sort();

interface FontManagerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export function FontManager({ value, onChange, label = "Fonte Principale" }: FontManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredFonts, setFilteredFonts] = useState<string[]>(POPULAR_FONTS);
  const [hoveredFont, setHoveredFont] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = POPULAR_FONTS.filter(font => 
      font.toLowerCase().includes(term)
    );
    setFilteredFonts(filtered);
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Generate unique set of fonts to load (selected + hovered)
  const fontsToLoad = Array.from(new Set([value, hoveredFont].filter(Boolean) as string[]));

  return (
    <div className="space-y-3" ref={wrapperRef}>
      {/* Dynamic Font Loading */}
      {fontsToLoad.map(font => (
        <link 
          key={font}
          rel="stylesheet" 
          href={`https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700&display=swap`} 
        />
      ))}

      <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between p-3.5 bg-zinc-50 border-2 border-zinc-50 rounded-2xl transition-all text-left group hover:border-zinc-200",
            isOpen && "border-zinc-900 bg-white ring-4 ring-zinc-900/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shrink-0">
               <Type size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter leading-none mb-1">Font Attuale</p>
              <p className="text-sm font-black text-zinc-900 tracking-tight">{value}</p>
            </div>
          </div>
          <ChevronDown className={cn("text-zinc-400 transition-transform duration-300", isOpen && "rotate-180 text-zinc-900")} size={16} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-zinc-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] rounded-3xl z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="p-3 border-b border-zinc-100">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" size={14} />
                <input 
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca un font..."
                  className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:text-zinc-300 font-bold"
                />
              </div>
            </div>
            
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2 space-y-1">
              {filteredFonts.length > 0 ? (
                filteredFonts.map((font) => (
                  <button
                    key={font}
                    type="button"
                    onMouseEnter={() => setHoveredFont(font)}
                    onMouseLeave={() => setHoveredFont(null)}
                    onClick={() => {
                      onChange(font);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-all group/font-item",
                      value === font 
                        ? "bg-zinc-900 text-white" 
                        : "hover:bg-zinc-50 text-zinc-700"
                    )}
                  >
                    <div className="flex flex-col text-left">
                       <span className="text-xs font-black tracking-tight">{font}</span>
                       <span 
                         className={cn(
                           "text-sm mt-0.5 opacity-60",
                           value === font ? "text-white" : "text-zinc-500"
                         )}
                         style={{ fontFamily: `'${font}', sans-serif` }}
                       >
                         {font} Example
                       </span>
                    </div>
                    {value === font && <Check size={14} className="text-white" />}
                  </button>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest px-4">Nessun font trovato per "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
