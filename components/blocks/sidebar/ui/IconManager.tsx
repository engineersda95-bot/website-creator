'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { Search, ChevronDown } from 'lucide-react';

// Get all icon names once
const ALL_ICON_NAMES = Object.keys(LucideIcons).filter(key => 
   typeof (LucideIcons as any)[key] === 'function' || 
   (typeof (LucideIcons as any)[key] === 'object' && (LucideIcons as any)[key].render)
);

interface IconManagerProps {
   value: string;
   onChange: (val: string) => void;
   label?: string;
}

export function IconManager({ value, onChange, label = "Icona" }: IconManagerProps) {
    const [searchTerm, setSearchTerm] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const normalizeName = (name: string) => {
        if (!name) return "";
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    const currentIconName = normalizeName(value);
    const PreviewIcon = (LucideIcons as any)[currentIconName];
    const isMatched = !!PreviewIcon;

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    useEffect(() => {
        if (searchTerm.length >= 1) {
            const matches = ALL_ICON_NAMES.filter(name => 
                name.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 40); 
            setFilteredIcons(matches);
        } else {
            setFilteredIcons(ALL_ICON_NAMES.slice(0, 40));
        }
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

   return (
      <div className="space-y-4 pt-4 border-t border-zinc-100" ref={wrapperRef}>
         <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest block">{label}</label>
                {isMatched && <span className="text-[12px] font-bold text-green-500 uppercase tracking-tight">Selezionata</span>}
            </div>
            
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" size={14} />
                        <input 
                            type="text"
                            value={searchTerm}
                            onFocus={() => setIsOpen(true)}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsOpen(true);
                            }}
                            placeholder="Cerca un'icona..."
                            className="w-full pl-9 pr-8 py-3 text-[13px] bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:text-zinc-300"
                        />
                        <ChevronDown className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 transition-transform",
                            isOpen && "rotate-180"
                        )} size={14} />
                    </div>
                    <div className={cn(
                        "w-12 h-12 border rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-sm",
                        isMatched ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 border-dashed border-zinc-200 text-zinc-300"
                    )}>
                        {PreviewIcon ? <PreviewIcon size={24} /> : <div className="text-sm font-bold opacity-30">?</div>}
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-zinc-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] rounded-2xl z-[999] max-h-[320px] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                        <div className="p-3 grid grid-cols-4 gap-2">
                            {filteredIcons.length > 0 ? (
                                filteredIcons.map((name) => {
                                    const Icon = (LucideIcons as any)[name];
                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => {
                                                onChange(name);
                                                setSearchTerm(name);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "aspect-square flex flex-col items-center justify-center gap-1.5 border rounded-xl transition-all hover:bg-zinc-900 hover:text-white group/icon-btn p-1",
                                                currentIconName === name 
                                                    ? "bg-zinc-900 text-white border-zinc-900" 
                                                    : "bg-zinc-50 border-transparent text-zinc-700 hover:scale-105"
                                            )}
                                            title={name}
                                        >
                                            <Icon size={20} className="shrink-0" />
                                            <span className="text-[7px] truncate w-full text-center opacity-70 group-hover/icon-btn:opacity-100 font-medium">{name}</span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-10 text-center text-[12px] text-zinc-400 font-bold uppercase tracking-widest">
                                    Nessun risultato
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
         </div>
      </div>
   );
}

