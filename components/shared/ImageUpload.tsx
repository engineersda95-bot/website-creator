'use client';

import React, { useRef } from 'react';
import { Upload, X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/shared/Toast';
import { useEditorStore } from '@/store/useEditorStore';

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string, filename?: string) => void;
  label?: React.ReactNode;
  hidePreview?: boolean;
  onImageLoad?: (dimensions: { width: number; height: number }) => void;
  showSEOStatus?: boolean;
  /** Current alt text value – renders an inline alt-text field when provided */
  altValue?: string;
  /** Called when the user edits the alt text */
  onAltChange?: (alt: string) => void;
  /** Called once right after the user picks a file, with the cleaned filename */
  onFilenameSelect?: (filename: string) => void;
  /** CSS aspect-ratio string for the preview, e.g. "16/9", "9/16", "1/1". Defaults to "16/9" */
  previewAspect?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Immagine",
  hidePreview = false,
  onImageLoad,
  showSEOStatus = false,
  altValue,
  onAltChange,
  onFilenameSelect,
  previewAspect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = React.useState<{width: number, height: number} | null>(null);
  const [tab, setTab] = React.useState<'upload' | 'ai'>('upload');
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);

  const defaultAiRatio = (previewAspect ?? '16/9').replace('/', ':');
  const [aiRatio, setAiRatio] = React.useState(defaultAiRatio);
  React.useEffect(() => { setAiRatio((previewAspect ?? '16/9').replace('/', ':')); }, [previewAspect]);

  React.useEffect(() => {
    if (value && typeof value === 'string' && (value.startsWith('http') || value.startsWith('/assets') || value.startsWith('data:'))) {
      const img = new Image();
      img.onload = () => {
        const dims = { width: img.naturalWidth, height: img.naturalHeight };
        setDimensions(dims);
        if (onImageLoad) onImageLoad(dims);
      };
      img.src = value;
    } else if (!value) {
      setDimensions(null);
    }
  }, [value, onImageLoad]);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, aspectRatio: aiRatio }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Errore generazione');
      const { data, mimeType } = json;
      const dataUri = `data:${mimeType};base64,${data}`;
      useEditorStore.getState().incrementAiUsed(2);
      if (onFilenameSelect) onFilenameSelect(aiPrompt);
      onChange(dataUri, aiPrompt);
      setTab('upload');
    } catch (err: any) {
      toast(err?.message || 'Generazione fallita, riprova', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast("L'immagine è troppo grande (max 10MB)", 'error');
      return;
    }

    // Auto-fill alt text with filename (no extension) if field is empty
    if (onFilenameSelect) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      onFilenameSelect(nameWithoutExt);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onChange(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const seoStatus = dimensions ? (
    dimensions.width < 600 || dimensions.height < 315 ? { color: 'text-red-500', bg: 'bg-red-500', label: 'Non verrà visualizzata' } : 
    dimensions.width < 1200 || dimensions.height < 630 ? { color: 'text-amber-500', bg: 'bg-amber-500', label: 'Non ottimizzata' } : 
    { color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Qualità Ottimale (OK)' }
  ) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{label}</label>
        <div className="flex gap-1">
          <button
            onClick={() => setTab('upload')}
            className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md transition-colors", tab === 'upload' ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600")}
          >
            Carica
          </button>
          <button
            onClick={() => setTab('ai')}
            className={cn("flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md transition-colors", tab === 'ai' ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-violet-500")}
          >
            <Sparkles size={9} />
            AI
          </button>
        </div>
      </div>

      {tab === 'ai' && (
        <div className="space-y-2">
          <div className="relative">
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value.slice(0, 300))}
              placeholder="Descrivi l'immagine da generare..."
              rows={3}
              maxLength={300}
              className="w-full p-2.5 border border-zinc-200 rounded-xl text-[12px] bg-zinc-50 focus:bg-white focus:border-violet-400 transition-all outline-none resize-none"
            />
            <span className={cn("absolute bottom-2 right-2.5 text-[9px]", aiPrompt.length >= 280 ? "text-amber-500" : "text-zinc-300")}>
              {aiPrompt.length}/300
            </span>
          </div>
          <select
            value={aiRatio}
            onChange={e => setAiRatio(e.target.value)}
            className="w-full p-2 border border-zinc-200 rounded-xl text-[11px] bg-zinc-50 focus:bg-white focus:border-violet-400 transition-all outline-none"
          >
            {[['16:9', 'Orizzontale (16:9)'], ['4:3', 'Orizzontale (4:3)'], ['1:1', 'Quadrato (1:1)'], ['9:16', 'Verticale (9:16)']].map(([val, lbl]) => (
              <option key={val} value={val}>{lbl}</option>
            ))}
          </select>
          <button
            onClick={handleAiGenerate}
            disabled={aiLoading || !aiPrompt.trim()}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-violet-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wide hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {aiLoading ? <><Loader2 size={13} className="animate-spin" /> Generazione in corso...</> : <><Sparkles size={13} /> Genera immagine</>}
          </button>
          <p className="text-[9px] text-zinc-400 text-center">Utilizza 2 crediti AI</p>
        </div>
      )}

      {tab === 'upload' && (
        !hidePreview && value ? (
          <div className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm"
            style={{ aspectRatio: previewAspect ?? '16/9' }}>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full text-zinc-900 hover:scale-110 transition-transform"
              >
                <Upload size={18} />
              </button>
              <button
                onClick={() => onChange('')}
                className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : !hidePreview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all group"
            style={{ aspectRatio: previewAspect ?? '16/9' }}
          >
            <div className="p-3 bg-zinc-50 rounded-full group-hover:bg-blue-100 transition-colors mb-2">
              <Upload size={20} />
            </div>
            <span className="text-xs font-medium">Carica Immagine</span>
            <span className="text-[10px] opacity-60 mt-1">PNG, JPG fino a 10MB</span>
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-2 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase transition-all hover:bg-zinc-800"
          >
            Sostituisci Immagine
          </button>
        )
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Inline Alt Text field */}
      {onAltChange !== undefined && (
        <div className="space-y-1 pt-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1">
            Testo Alternativo (Alt / SEO)
          </label>
          <input
            type="text"
            value={altValue ?? ''}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder=""
            className="w-full p-2.5 border border-zinc-200 rounded-xl text-[12px] bg-zinc-50 focus:bg-white focus:border-zinc-400 transition-all outline-none"
          />
        </div>
      )}

      {showSEOStatus && seoStatus && dimensions && (
        <div className="mt-2 p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
          <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-200/50">
             <div className={cn("w-2 h-2 rounded-full", seoStatus.bg)} />
             <span className={cn("text-[10px] font-bold uppercase tracking-tight", seoStatus.color)}>
               {dimensions.width} x {dimensions.height} px: {seoStatus.label}
             </span>
          </div>
          <div className="space-y-1.5">
             <p className="text-[10px] text-zinc-600 leading-tight">
                <span className="font-bold text-blue-600">GOAL:</span> Target ottimale <span className="font-bold">1200 x 630 px</span>.
             </p>
             <p className="text-[9px] text-zinc-400 leading-tight italic">
                Un titolo chiaro e una CTA (Call to Action) nell'immagine aumentano drasticamente i clic!
             </p>
          </div>
        </div>
      )}
    </div>
  );
};
