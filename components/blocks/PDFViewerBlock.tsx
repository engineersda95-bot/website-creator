'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn, toPx } from '@/lib/utils';
import { FileText, ExternalLink, Download } from 'lucide-react';

interface PDFViewerProps {
  content: {
    title: string;
    subtitle: string;
    pdfUrl: string;
    label: string;
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    titleSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
    minHeight?: string;
  };
}

export const PDFViewerBlock: React.FC<PDFViewerProps> = ({ content, style }) => {
  const { project } = useEditorStore();
  const primaryColor = project?.settings?.primaryColor || '#3b82f6';
  
  // Button global settings
  const btnRadius = project?.settings?.buttonRadius || '9999px';
  const btnShadow = {
    none: 'none',
    S: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    M: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    L: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }[project?.settings?.buttonShadow || 'M'];
  const btnBorder = project?.settings?.buttonBorder ? '1px solid currentColor' : 'none';
  const btnUpper = project?.settings?.buttonUppercase ? 'uppercase' : 'none';

  return (
    <section 
      className="py-24 transition-all duration-500 overflow-hidden flex flex-col justify-center"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        paddingTop: toPx(style.padding),
        paddingBottom: toPx(style.padding),
        marginTop: toPx(style.marginTop),
        marginBottom: toPx(style.marginBottom),
        minHeight: toPx(style.minHeight)
      }}
    >
      <div className={cn(
        "max-w-7xl mx-auto px-8 w-full flex flex-col items-center text-center",
        style.align === 'center' ? "items-center text-center" : style.align === 'right' ? "items-end text-right" : "items-start text-left"
      )}>
        <div className={cn(
          "max-w-2xl w-full flex flex-col mb-12",
          style.align === 'center' ? "items-center" : style.align === 'right' ? "items-end" : "items-start"
        )}>
          <h2 className={cn(
            "tracking-tight leading-tight transition-all duration-500",
            style.titleSize ? "" : "text-4xl md:text-5xl",
            style.titleBold === false ? "font-normal" : "font-black",
            style.titleItalic && "italic"
          )} style={{ fontSize: toPx(style.titleSize), textAlign: style.align || 'center' }}>
            {content.title}
          </h2>
          <p className={cn(
            "mt-4 text-lg opacity-80 leading-relaxed font-medium transition-all duration-500",
            style.align === 'center' ? "mx-auto" : style.align === 'right' ? "ml-auto" : ""
          )} style={{ textAlign: style.align || 'center' }}>
            {content.subtitle}
          </p>
        </div>

        <div className="w-full max-w-xl bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-12 transition-all hover:bg-zinc-100/50 hover:border-zinc-300 group flex flex-col items-center text-center shadow-inner">
           <div className="w-20 h-20 rounded-3xl bg-white border border-zinc-100 shadow-xl flex items-center justify-center text-blue-500 mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-blue-500/10">
              <FileText size={40} strokeWidth={1.5}/>
           </div>
           
           <h3 className="text-xl font-bold text-zinc-900 mb-6">Visualizza o Scarica il Catalogo</h3>
           
           <div className="flex flex-wrap items-center justify-center gap-4 w-full">
              <a 
                 href={content.pdfUrl || '#'} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-3 px-10 py-5 text-white font-black text-sm transition-all hover:brightness-110 active:scale-95"
                 style={{ 
                   backgroundColor: primaryColor,
                   borderRadius: btnRadius,
                   boxShadow: btnShadow,
                   border: btnBorder,
                   textTransform: btnUpper as any
                 }}
              >
                <ExternalLink size={18} />
                {content.label || 'Sfoglia Catalogo'}
              </a>
              
              <a 
                 href={content.pdfUrl} 
                 download
                 className="flex items-center gap-3 px-8 py-4 bg-white text-zinc-900 font-bold text-sm rounded-full border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
              >
                <Download size={18} />
                Scarica
              </a>
           </div>
           
           <p className="mt-8 text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
             Compatibile con tutti i dispositivi.<br/>
             Formato PDF High Quality.
           </p>
        </div>
      </div>
    </section>
  );
};
