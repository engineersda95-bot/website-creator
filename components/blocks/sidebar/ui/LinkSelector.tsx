'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Link as LinkIcon, X, ExternalLink, FileText, ChevronDown, Hash } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { Page } from '@/types/editor';

interface LinkSelectorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    inputClassName?: string;
    size?: 'sm' | 'md';
}

export function LinkSelector({ 
    value = '', 
    onChange, 
    placeholder = "URL...", 
    label, 
    className,
    inputClassName,
    size = 'md'
}: LinkSelectorProps) {
    const { projectPages, currentPage } = useEditorStore();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const isSmall = size === 'sm';

    // Get current language to filter pages
    const currentLang = currentPage?.language || 'it';

    // Filter pages by language and the text already in the input
    const filteredPages = useMemo(() => {
        const val = value || '';
        const searchTerm = val.startsWith('/') ? val.slice(1) : val;
        return projectPages
            .filter(p => p.language === currentLang)
            .filter(p => 
                !val || 
                p.title.toLowerCase().includes(val.toLowerCase()) || 
                p.slug.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [projectPages, currentLang, value]);

    // Handle clicks outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectPage = (page: Page) => {
        const path = page.slug === 'home' ? '/' : `/${page.slug}`;
        onChange(path);
        setIsOpen(false);
    };

    const isExternal = (value || '').startsWith('http') || (value || '').startsWith('mailto:') || (value || '').startsWith('tel:');
    const isAnchor = (value || '').startsWith('#');
    const shouldShowDropdown = isOpen && (!isAnchor);

    return (
        <div className={cn("space-y-1.5", className)} ref={wrapperRef}>
            {label && (
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block pl-1">
                    {label}
                </label>
            )}
            
            <div className="relative group/ls flex items-center">
                {/* Left Icon */}
                <div className={cn(
                    "absolute left-3 text-zinc-400 group-focus-within/ls:text-zinc-900 transition-colors z-[21] pointer-events-none",
                    isSmall && "left-2"
                )}>
                    {isExternal ? <ExternalLink size={isSmall ? 10 : 14} /> : isAnchor ? <Hash size={isSmall ? 10 : 14} /> : <LinkIcon size={isSmall ? 10 : 14} />}
                </div>
                
                <input
                    className={cn(
                        "w-full border border-zinc-200 rounded-2xl transition-all outline-none text-zinc-900 bg-white placeholder:text-zinc-300",
                        isSmall 
                            ? "pl-7 pr-10 py-2 text-[11px] font-medium" 
                            : "pl-10 pr-14 py-3 text-[13px] bg-zinc-50 font-bold focus:bg-white focus:border-zinc-900 focus:shadow-sm",
                        isOpen && shouldShowDropdown && "border-zinc-900 bg-white shadow-md relative z-20",
                        inputClassName
                    )}
                    placeholder={placeholder}
                    value={value || ''}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete="off"
                />

                {/* Right Controls */}
                <div className={cn(
                    "absolute right-3 flex items-center gap-0.5 z-[21]",
                    isSmall && "right-1"
                )}>
                    {value && (
                        <button 
                            type="button"
                            onClick={() => onChange('')}
                            className="p-1 text-zinc-300 hover:text-red-500 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    )}
                    <button 
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn("p-1 text-zinc-300 hover:text-zinc-900 transition-all", (isOpen && shouldShowDropdown) && "rotate-180")}
                    >
                        <ChevronDown size={isSmall ? 12 : 14} />
                    </button>
                </div>

                {isOpen && shouldShowDropdown && (
                    <div className={cn(
                        "absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-2xl z-[9999] max-h-[250px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5",
                    )}>
                        <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 scroll-py-1">
                            <div className="px-2 py-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-tight flex items-center justify-between border-b border-zinc-50 mb-1 sticky top-0 bg-white z-10">
                                <span>Pagine ({currentLang.toUpperCase()})</span>
                            </div>
                            
                            <div className="space-y-0.5">
                                {filteredPages.length > 0 ? (
                                    filteredPages.map(page => {
                                        const path = page.slug === 'home' ? '/' : `/${page.slug}`;
                                        const isActive = value === path;
                                        
                                        return (
                                            <button
                                                key={page.id}
                                                type="button"
                                                onClick={() => handleSelectPage(page)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left transition-all",
                                                    isActive ? "bg-zinc-900 text-white shadow-md font-bold" : "hover:bg-zinc-50 text-zinc-700 hover:translate-x-1"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                                                    isActive ? "bg-white/10" : "bg-zinc-100"
                                                )}>
                                                    <FileText size={12} className={isActive ? "text-white" : "text-zinc-400"} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[12px] font-bold truncate tracking-tight">{page.title}</div>
                                                    <div className={cn("text-[10px] font-medium opacity-50 truncate", isActive ? "text-zinc-200" : "text-zinc-400")}>
                                                        {path}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-zinc-400">
                                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1">Cerca pagina...</div>
                                        <p className="text-[9px] leading-tight opacity-70">Usa il campo sopra per un link libero.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
