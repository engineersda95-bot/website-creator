'use client';

import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  Code2, Sparkles, ImagePlus, X, Loader2,
  ChevronDown, ChevronRight, Layers, Palette, Settings, Send,
  Type, Image as ImageIcon, MousePointer2, Shapes, Trash2,
} from 'lucide-react';
import { generateHtmlBlock } from '@/app/actions/ai-html-block';
import { friendlyAiError } from '@/lib/ai/gemini';
import { parseChbPlaceholders } from '@/components/blocks/visual/CustomHtmlBlock.resolve';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { resolveImageUrl } from '@/lib/image-utils';
import { TypographyFields } from '../ui/TypographyFields';
import { ChbTextEditor } from '../ui/ChbTextEditor';
import { LinkSelector } from '../ui/LinkSelector';
import { CTAManager } from '../managers/CTAManager';
import { IconManager } from '../ui/IconManager';
import { useEditorStore } from '@/store/useEditorStore';
import {
  UnifiedSection as Section,
  useUnifiedSections,
  CategoryHeader,
  ManagerWrapper,
  BackgroundManager,
  BorderShadowManager,
  ColorManager,
  LayoutFields,
  PatternManager,
  AnchorManager,
} from '../SharedSidebarComponents';

interface CustomHtmlEditorProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

// ─── Text node parsing (stamps data-chb-text for typography overrides) ────────

interface TextNode { index: number; tag: string; value: string }

function parseTextNodes(html: string): { texts: TextNode[]; stampedHtml: string } {
  if (typeof window === 'undefined' || !html) return { texts: [], stampedHtml: html };
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.querySelector('div')!;

  const STRUCTURAL = new Set(['h1','h2','h3','h4','h5','h6','p','li','figcaption','blockquote','dt','dd']);
  const TEXT_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,span,li,figcaption,blockquote,dt,dd';

  const candidates: Element[] = [];
  root.querySelectorAll(TEXT_SELECTOR).forEach(el => {
    if (el.closest('[data-chb-cta]')) return;
    if (el.parentElement?.closest(TEXT_SELECTOR)) return;
    if ([...STRUCTURAL].some(t => el.querySelector(t))) return;
    const text = el.innerHTML?.trim() ?? '';
    if (text.length > 0 && text.length < 2000) candidates.push(el);
  });

  // Reuse existing stamps if all candidates already have them; otherwise re-index
  const alreadyStamped = candidates.length > 0 && candidates.every(el => el.hasAttribute('data-chb-text'));
  if (!alreadyStamped) {
    root.querySelectorAll('[data-chb-text]').forEach(el => el.removeAttribute('data-chb-text'));
    candidates.forEach((el, idx) => el.setAttribute('data-chb-text', String(idx)));
  }

  const texts: TextNode[] = candidates.map((el, idx) => ({
    index: Number(el.getAttribute('data-chb-text') ?? idx),
    tag: el.tagName.toLowerCase(),
    value: el.innerHTML?.trim() ?? '',
  }));

  return { texts, stampedHtml: root.innerHTML };
}

function patchTextNode(html: string, index: number, newHtml: string): string {
  if (typeof window === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.querySelector('div')!;
  const el = root.querySelector(`[data-chb-text="${index}"]`);
  if (el) el.innerHTML = newHtml;
  return root.innerHTML;
}

function removeChbElement(html: string, attr: string, index: number): string {
  if (typeof window === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.querySelector('div')!;
  const el = root.querySelector(`[${attr}="${index}"]`);
  if (el) el.remove();
  return root.innerHTML;
}

function patchTextTag(html: string, index: number, newTag: string): string {
  if (typeof window === 'undefined' || !newTag) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.querySelector('div')!;
  const el = root.querySelector(`[data-chb-text="${index}"]`);
  if (!el) return html;
  const replacement = doc.createElement(newTag);
  // Copy all attributes
  Array.from(el.attributes).forEach(attr => replacement.setAttribute(attr.name, attr.value));
  replacement.innerHTML = el.innerHTML;
  el.replaceWith(replacement);
  return root.innerHTML;
}



// ─── Typography bridge ────────────────────────────────────────────────────────

function makeNodeStyleBridge(
  index: number,
  totalNodes: number,
  blockStyle: Record<string, any>,
  updateStyle: (s: any) => void,
  content: any,
  updateContent: (c: any) => void,
) {
  const prefix = `cbText${index}`;
  const nodeGetStyleValue = (key: string, def: any) =>
    blockStyle[key] !== undefined ? blockStyle[key] : def;

  const nodeUpdateStyle = (partial: Record<string, any>) => {
    updateStyle(partial);
    const merged = { ...blockStyle, ...partial };
    const rules: string[] = [];
    for (let i = 0; i < totalNodes; i++) {
      const size = merged[`cbText${i}Size`];
      const bold = merged[`cbText${i}Bold`];
      const italic = merged[`cbText${i}Italic`];
      if (size !== undefined || bold !== undefined || italic !== undefined) {
        rules.push(
          `[data-chb-text="${i}"] {` +
          (size !== undefined ? ` font-size: ${size}px !important;` : '') +
          (bold !== undefined ? ` font-weight: ${bold ? '700' : '400'} !important;` : '') +
          (italic !== undefined ? ` font-style: ${italic ? 'italic' : 'normal'} !important;` : '') +
          ' }'
        );
      }
    }
    const baseCss = (content.css ?? '').replace(/\/\* chb-typo \*\/[\s\S]*/m, '').trimEnd();
    updateContent({ css: rules.length ? `${baseCss}\n/* chb-typo */\n${rules.join('\n')}` : baseCss });
  };

  return { nodeGetStyleValue, nodeUpdateStyle, prefix };
}

// ─── Code textarea ────────────────────────────────────────────────────────────

function CodeTextarea({ label, value, language, onChange, defaultOpen = false }: {
  label: string; value: string; language: 'html' | 'css' | 'js';
  onChange: (v: string) => void; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const dotColor = language === 'html' ? '#f97316' : language === 'css' ? '#38bdf8' : '#a78bfa';
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #3f3f46' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-mono font-semibold"
        style={{ background: '#27272a', color: '#e4e4e7' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
          {label}
          {value.trim() && <span className="ml-1 text-zinc-400 font-normal">{value.split('\n').length} righe</span>}
        </span>
        {open ? <ChevronDown size={12} style={{ color: '#a1a1aa' }} /> : <ChevronRight size={12} style={{ color: '#a1a1aa' }} />}
      </button>
      {open && (
        <textarea value={value} onChange={e => onChange(e.target.value)} spellCheck={false}
          rows={language === 'html' ? 12 : 8}
          className="w-full font-mono text-[11px] leading-relaxed px-3 py-2.5 resize-y outline-none border-t border-zinc-700"
          style={{ minHeight: language === 'html' ? 180 : 110, background: '#09090b', color: '#f4f4f5', caretColor: '#a78bfa' }}
        />
      )}
    </div>
  );
}

// ─── Chat bubble ─────────────────────────────────────────────────────────────

function ChatBubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
        isUser ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-zinc-100 text-zinc-700 rounded-bl-sm'
      }`}>{text}</div>
    </div>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export const CustomHtmlEditor: React.FC<CustomHtmlEditorProps> = ({
  selectedBlock, updateContent, updateStyle, getStyleValue, project,
}) => {
  const content = selectedBlock.content;
  const { openSection, toggleSection } = useUnifiedSections();
  const { uploadImage, imageMemoryCache } = useEditorStore();

  const [inputText, setInputText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [hasGenerated, setHasGenerated] = useState(!!(content.html || content.css));

  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null);
  const [refImageMime, setRefImageMime] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const projectColors = project?.settings?.themeColors ? {
    bg: project.settings.themeColors.light?.bg ?? '#ffffff',
    text: project.settings.themeColors.light?.text ?? '#000000',
    accent: project.settings.primaryColor ?? '#3b82f6',
  } : undefined;
  const projectFont: string | undefined = project?.settings?.fontFamily;

  // Parse text nodes — stampedHtml has data-chb-text attrs; used as base for all patches
  const { texts, stampedHtml } = useMemo(() => parseTextNodes(content.html ?? ''), [content.html]);

  // Parse image/cta/svg/icon placeholders
  const { images: chbImages, ctas: chbCtas, svgs: chbSvgs, icons: chbIcons } = useMemo(
    () => parseChbPlaceholders(content.html ?? ''), [content.html],
  );

  const handleTextChange = useCallback((node: TextNode, newHtml: string) => {
    const patched = patchTextNode(stampedHtml, node.index, newHtml);
    updateContent({ html: patched });
  }, [stampedHtml, updateContent]);

  const handleTagChange = useCallback((node: TextNode, newTag: string) => {
    const patched = patchTextTag(stampedHtml, node.index, newTag);
    updateContent({ html: patched });
  }, [stampedHtml, updateContent]);

  function handleRefImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      const [header, base64] = dataUrl.split(',');
      setRefImagePreview(dataUrl);
      setRefImageBase64(base64);
      setRefImageMime(header.match(/:(.*?);/)?.[1] ?? 'image/jpeg');
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveRefImage() {
    setRefImagePreview(null); setRefImageBase64(null); setRefImageMime(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text && !refImageBase64) return;
    const userMessage = text || '[Immagine di riferimento]';
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    setAiError(null);

    setIsPending(true);
    generateHtmlBlock({
      prompt: text || "Genera una sezione basata sull'immagine di riferimento.",
      referenceImageBase64: refImageBase64 ?? undefined,
      referenceImageMime: refImageMime ?? undefined,
      projectColors,
      projectFont,
      history: chatHistory,
      currentHtml: hasGenerated ? (content.html ?? '') : undefined,
      currentCss: hasGenerated ? (content.css ?? '') : undefined,
      currentJs: hasGenerated ? (content.js ?? '') : undefined,
    }).then(result => {
      if (result.success) {
        useEditorStore.getState().incrementAiUsed();
        // Strip any stale chb-typo overrides — new HTML has different node structure
        const cleanCss = (result.data.css ?? '').replace(/\/\* chb-typo \*\/[\s\S]*/m, '').trimEnd();
        updateContent({ html: result.data.html, css: cleanCss, js: result.data.js });
        setHasGenerated(true);
        handleRemoveRefImage();
        setChatHistory(prev => [...prev, { role: 'assistant', text: 'Sezione generata! Dimmi se vuoi modifiche.' }]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        setAiError(friendlyAiError(result.error ?? ''));
        setChatHistory(prev => prev.slice(0, -1));
      }
    }).finally(() => setIsPending(false));
  }

  const isFirstMessage = chatHistory.length === 0 && !hasGenerated;

  return (
    <div>
      {/* ── AI Chat ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-100">
        <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
          <Sparkles size={13} className="text-violet-500" />
          <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
            {isFirstMessage ? 'Genera con AI' : 'Chat AI'}
          </span>
        </div>

        {chatHistory.length > 0 && (
          <div className="px-4 pb-2 space-y-2 max-h-48 overflow-y-auto">
            {chatHistory.map((msg, i) => <ChatBubble key={i} role={msg.role} text={msg.text} />)}
            <div ref={chatEndRef} />
          </div>
        )}

        {refImagePreview && (
          <div className="px-4 pb-2">
            <div className="relative rounded-lg overflow-hidden border border-zinc-200 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={refImagePreview} alt="Riferimento" className="max-h-28 object-cover block" />
              <button type="button" onClick={handleRemoveRefImage}
                className="absolute top-1 right-1 bg-zinc-900/70 rounded-full p-0.5 hover:bg-zinc-900">
                <X size={11} className="text-white" />
              </button>
            </div>
          </div>
        )}

        <div className="px-4 pb-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <textarea value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={isFirstMessage ? 'Es: sezione servizi con icone, testo e CTA…' : 'Scrivi una modifica… (Invio per inviare)'}
                rows={isFirstMessage ? 3 : 2} disabled={isPending}
                className="w-full text-[12px] text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 resize-none outline-none placeholder-zinc-400 focus:border-violet-400 transition-colors disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button type="button" onClick={() => fileInputRef.current?.click()} title="Immagine di riferimento"
                className="p-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400 hover:text-violet-600 hover:border-violet-300 transition-colors">
                <ImagePlus size={14} />
              </button>
              <button type="button" onClick={handleSend}
                disabled={isPending || (!inputText.trim() && !refImageBase64)}
                className="p-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors">
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleRefImageUpload} />
          {aiError && <p className="mt-2 text-[11px] text-red-500 bg-red-50 rounded px-2 py-1">{aiError}</p>}
          {isPending && (
            <p className="mt-1.5 text-[10px] text-violet-500 flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" /> Generazione in corso…
            </p>
          )}
        </div>
      </div>

      {/* ── Contenuto editabile ──────────────────────────────────────────────── */}
      {(texts.length > 0 || chbImages.length > 0 || chbCtas.length > 0 || chbSvgs.length > 0 || chbIcons.length > 0 || content.js) && (
        <>
          <CategoryHeader label="Contenuto" />


          {/* Testi — RichEditor per ogni nodo */}
          {texts.length > 0 && (
            <Section icon={Type} label="Testi" id="texts"
              isOpen={openSection === 'texts'} onToggle={() => toggleSection('texts')}>
              <div className="space-y-5">
                {texts.map(node => {
                  const { nodeGetStyleValue, nodeUpdateStyle, prefix } = makeNodeStyleBridge(
                    node.index, texts.length, selectedBlock.style ?? {}, updateStyle, content, updateContent,
                  );
                  const TAG_OPTIONS = ['h1','h2','h3','h4','h5','h6','p','span'];
                  const defaultSize =
                    node.tag === 'h1' ? (project?.settings?.typography?.h1Size ?? 64) :
                    node.tag === 'h2' ? (project?.settings?.typography?.h2Size ?? 48) :
                    node.tag === 'h3' ? (project?.settings?.typography?.h3Size ?? 32) :
                    node.tag === 'h4' ? (project?.settings?.typography?.h4Size ?? 24) :
                    node.tag === 'h5' ? (project?.settings?.typography?.h5Size ?? 20) :
                    node.tag === 'h6' ? (project?.settings?.typography?.h6Size ?? 16) :
                    (project?.settings?.typography?.bodySize ?? 16);
                  return (
                    <div key={node.index} className="pb-5 border-b border-zinc-100 last:border-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">
                          Testo {node.index + 1}
                        </p>
                        <select
                          value={node.tag}
                          onChange={e => handleTagChange(node, e.target.value)}
                          className="text-[10px] font-black bg-zinc-100 border-none rounded px-1.5 py-0.5 outline-none cursor-pointer hover:bg-zinc-200 transition-colors uppercase tracking-widest"
                        >
                          {TAG_OPTIONS.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                        </select>
                      </div>
                      <ChbTextEditor
                        value={node.value}
                        onChange={v => handleTextChange(node, v)}
                      />
                      <TypographyFields
                        label="Dimensione"
                        sizeKey={`${prefix}Size`}
                        boldKey={`${prefix}Bold`}
                        italicKey={`${prefix}Italic`}
                        getStyleValue={nodeGetStyleValue}
                        updateStyle={nodeUpdateStyle}
                        defaultValue={defaultSize}
                        min={8} max={160}
                      />
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Immagini */}
          {chbImages.length > 0 && (
            <Section icon={ImageIcon} label="Immagini" id="images"
              isOpen={openSection === 'images'} onToggle={() => toggleSection('images')}>
              <div className="space-y-6">
                {chbImages.map(img => {
                  const ratioKey = `cbImg_${img.index}_ratio`;
                  const radiusKey = `cbImg_${img.index}_radius`;
                  const widthKey = `cbImg_${img.index}_width`;
                  const currentRatio = content[ratioKey] ?? img.ratio;
                  const currentRadius = content[radiusKey] ?? 0;
                  const currentWidth = content[widthKey] ?? 100;
                  const RATIOS = [
                    { label: '16:9', value: '16:9' },
                    { label: '4:3', value: '4:3' },
                    { label: '1:1', value: '1:1' },
                    { label: '3:4', value: '3:4' },
                    { label: '9:16', value: '9:16' },
                    { label: '21:9', value: '21:9' },
                  ];
                  return (
                    <div key={img.index} className="pb-5 border-b border-zinc-100 last:border-0 last:pb-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">
                          {img.alt || `Immagine ${img.index + 1}`}
                        </p>
                        <button type="button"
                          onClick={() => updateContent({ html: removeChbElement(content.html ?? '', 'data-chb-img', img.index) })}
                          className="p-1 text-zinc-300 hover:text-red-500 transition-colors" title="Rimuovi dal blocco">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {/* Ratio selector */}
                      <div className="grid grid-cols-3 gap-1">
                        {RATIOS.map(r => (
                          <button key={r.label} type="button"
                            onClick={() => updateContent({ [ratioKey]: r.value })}
                            className={`py-1 text-[9px] font-black rounded border transition-all ${currentRatio === r.value ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-400 border-zinc-100 hover:text-zinc-600'}`}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                      {/* Width */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Larghezza</span>
                          <span className="text-[10px] text-zinc-500">{currentWidth}%</span>
                        </div>
                        <input type="range" min={10} max={100} step={5}
                          value={currentWidth}
                          onChange={e => updateContent({ [widthKey]: Number(e.target.value) })}
                          className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        />
                      </div>
                      {/* Border radius */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Arrotondamento</span>
                          <span className="text-[10px] text-zinc-500">{currentRadius}px</span>
                        </div>
                        <input type="range" min={0} max={64} step={2}
                          value={currentRadius}
                          onChange={e => updateContent({ [radiusKey]: Number(e.target.value) })}
                          className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        />
                      </div>
                      <ImageUpload
                        value={resolveImageUrl(content[`cbImg_${img.index}_src`] ?? '', project, imageMemoryCache)}
                        onChange={async (base64, filename) => {
                          const path = await uploadImage(base64, filename);
                          updateContent({ [`cbImg_${img.index}_src`]: path });
                        }}
                        altValue={content[`cbImg_${img.index}_alt`] ?? img.alt}
                        onAltChange={alt => updateContent({ [`cbImg_${img.index}_alt`]: alt })}
                        previewAspect={currentRatio.replace(':', '/')}
                      />
                      <LinkSelector
                        label="Link immagine"
                        value={content[`cbImg_${img.index}_link`] ?? ''}
                        onChange={val => updateContent({ [`cbImg_${img.index}_link`]: val })}
                        size="sm"
                      />
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* CTA */}
          {chbCtas.length > 0 && (
            <Section icon={MousePointer2} label="CTA" id="ctas"
              isOpen={openSection === 'ctas'} onToggle={() => toggleSection('ctas')}>
              <div className="space-y-6">
                {chbCtas.map(cta => {
                  const labelKey = `cbCta_${cta.index}_label`;
                  const urlKey = `cbCta_${cta.index}_url`;
                  const themeKey = `cbCta_${cta.index}_theme`;
                  return (
                    <div key={cta.index} className="pb-4 border-b border-zinc-100 last:border-0 last:pb-0">
                      {chbCtas.length > 1 && (
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">CTA {cta.index + 1}</p>
                      )}
                      <CTAManager
                        content={{
                          cta: content[labelKey] ?? cta.label,
                          ctaUrl: content[urlKey] ?? cta.url,
                          [themeKey]: content[themeKey] ?? 'primary',
                        }}
                        updateContent={(patch: any) => {
                          const mapped: any = {};
                          if ('cta' in patch) mapped[labelKey] = patch.cta;
                          if ('ctaUrl' in patch) mapped[urlKey] = patch.ctaUrl;
                          if (themeKey in patch) mapped[themeKey] = patch[themeKey];
                          updateContent(mapped);
                        }}
                        style={selectedBlock.style ?? {}}
                        updateStyle={updateStyle}
                        getStyleValue={getStyleValue}
                        label={chbCtas.length > 1 ? `CTA ${cta.index + 1}` : 'CTA'}
                        ctaKey="cta"
                        urlKey="ctaUrl"
                        themeKey={themeKey}
                      />
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Icone */}
          {chbIcons.length > 0 && (
            <Section icon={Shapes} label="Icone" id="icons"
              isOpen={openSection === 'icons'} onToggle={() => toggleSection('icons')}>
              <div className="space-y-2">
                {chbIcons.map(icon => {
                  const key = `cbIcon_${icon.iconName}`;
                  const current = content[key] ?? icon.iconName;
                  return (
                    <div key={icon.iconName}>
                      <IconManager
                        label={`Icona: ${icon.iconName}`}
                        value={current}
                        onChange={val => updateContent({ [key]: val })}
                      />
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* SVG */}
          {chbSvgs.length > 0 && (
            <Section icon={Shapes} label="SVG" id="svgs"
              isOpen={openSection === 'svgs'} onToggle={() => toggleSection('svgs')}>
              <div className="space-y-4">
                {chbSvgs.map(svg => {
                  const markupKey = `cbSvg_${svg.index}_markup`;
                  const current = content[markupKey] ?? svg.markup;
                  return (
                    <div key={svg.index} className="pb-4 border-b border-zinc-100 last:border-0 last:pb-0">
                      {chbSvgs.length > 1 && (
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">SVG {svg.index + 1}</p>
                      )}
                      <div className="rounded overflow-hidden" style={{ border: '1px solid #3f3f46' }}>
                        <textarea
                          value={current}
                          onChange={e => updateContent({ [markupKey]: e.target.value })}
                          spellCheck={false}
                          rows={6}
                          className="w-full font-mono text-[11px] leading-relaxed px-3 py-2.5 resize-y outline-none"
                          style={{ background: '#09090b', color: '#f4f4f5', caretColor: '#a78bfa' }}
                        />
                      </div>
                      {current && (
                        <div className="mt-2 p-2 bg-zinc-50 rounded border border-zinc-100 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: current }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </>
      )}

      {/* ── Codice grezzo ────────────────────────────────────────────────────── */}
      <CategoryHeader label="Codice" />

      <Section icon={Code2} label="HTML / CSS / JS" id="code"
        isOpen={openSection === 'code'} onToggle={() => toggleSection('code')}>
        <div className="space-y-2">
          <CodeTextarea label="HTML" value={content.html ?? ''} language="html" defaultOpen
            onChange={v => updateContent({ html: v })} />
          <CodeTextarea label="CSS" value={content.css ?? ''} language="css"
            onChange={v => updateContent({ css: v })} />
          <CodeTextarea label="JavaScript" value={content.js ?? ''} language="js"
            onChange={v => updateContent({ js: v })} />
        </div>
        <p className="mt-2 text-[10px] text-zinc-400 leading-relaxed">
          Usa prefissi <code className="bg-zinc-100 px-1 rounded">cb-</code> per evitare conflitti. Il JS gira in un IIFE isolato.
        </p>
      </Section>

      {/* ── Stile della Sezione ──────────────────────────────────────────────── */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout"
        isOpen={openSection === 'layout'} onToggle={() => toggleSection('layout')}>
        <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background"
        isOpen={openSection === 'background'} onToggle={() => toggleSection('background')}>
        <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} showTitle={false} />
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Immagine Sfondo">
          <BackgroundManager selectedBlock={selectedBlock} updateContent={updateContent}
            updateStyle={updateStyle} getStyleValue={getStyleValue} />
        </ManagerWrapper>
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Pattern Decorativo">
          <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </ManagerWrapper>
      </Section>

      <Section icon={Settings} label="Avanzate" id="advanced"
        isOpen={openSection === 'advanced'} onToggle={() => toggleSection('advanced')}>
        <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <AnchorManager selectedBlock={selectedBlock} updateContent={updateContent} />
      </Section>
    </div>
  );
};
