'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Page, Project, BlogPost } from '@/types/editor';
import { cn, toPx } from '@/lib/utils';
import { toast } from '@/components/shared/Toast';
import { SeoFields } from '@/components/shared/SeoFields';
import { confirm } from '@/components/shared/ConfirmDialog';
import {
  ArrowLeft, Save, Loader2, Eye, EyeOff, Trash2,
  Settings, Search, Layout, MonitorPlay,
  X, Mic, MicOff, Sparkles, RotateCcw,
  Bold, Italic, Heading2, Heading3, Heading4, List, ListOrdered, Quote, Link as LinkIcon, Code, Minus,
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  PanelLeft, Palette, Monitor, Tablet, Smartphone
} from 'lucide-react';
import TipTapImage from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { improveTextWithAI, translateBlogPostWithAI, type AITextAction, type AITextTone } from '@/app/actions/ai-generator';
import { SimpleSlider } from '@/components/blocks/sidebar/ui/SimpleSlider';
import { LanguageBadge } from '@/components/shared/LanguageBadge';
import { ColorInput } from '@/components/blocks/sidebar/ui/ColorInput';
import { marked } from 'marked';
import { LANGUAGES } from '@/lib/editor-constants';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TipTapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';

interface BlogPostEditorClientProps {
  initialUser: any;
  initialProject: any;
  initialPost: BlogPost;
}

/**
 * Dedicated sub-component to handle the TipTap EditorContent.
 * This decouples the editor's internal lifecycle from the main component's render phases,
 * effectively preventing the 'flushSync' error in React 19.
 */
function SafeEditorContent({ editor }: { editor: any }) {
  if (!editor || editor.isDestroyed) return null;
  return <EditorContent editor={editor} />;
}

export function BlogPostEditorClient({ initialUser, initialProject, initialPost }: BlogPostEditorClientProps) {
  const router = useRouter();
  const { setProject, uploadImage, isUploading } = useEditorStore();

  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  const handleCoverUpload = async (base64: string) => {
    if (!base64) {
      updatePost({ cover_image: '' });
      return;
    }
    const path = await uploadImage(base64);
    if (path && !path.startsWith('data:')) {
      const updates: Partial<BlogPost> = { cover_image: path };
      // Se non c'è un'immagine SEO impostata, usiamo la copertina come default anche esplicito
      if (!post.seo?.image) {
        updates.seo = { ...(post.seo || {}), image: path };
      }
      updatePost(updates);
    } else {
      toast('Errore upload immagine', 'error');
    }
  };

  const [post, setPost] = useState<BlogPost>(initialPost);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [sidebarSection, setSidebarSection] = useState<'config' | 'seo' | 'style'>('config');
  const [showCanvasPreview, setShowCanvasPreview] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Project-level blog post display settings (shared across all articles)
  const [projectSettings, setProjectSettings] = useState(() => initialProject.settings || {});
  const [isSavingProjectSettings, setIsSavingProjectSettings] = useState(false);
  const bpd = (projectSettings.blogPostDisplay || {}) as NonNullable<typeof projectSettings.blogPostDisplay>;
  const updateBpd = useCallback((updates: Record<string, any>) => {
    setProjectSettings((prev: any) => ({
      ...prev,
      blogPostDisplay: { ...(prev.blogPostDisplay || {}), ...updates },
    }));
    setHasChanges(true);
  }, []);
  const saveProjectSettings = useCallback(async (settings: any) => {
    setIsSavingProjectSettings(true);
    const { error } = await supabase.from('projects').update({ settings }).eq('id', initialProject.id);
    setIsSavingProjectSettings(false);
    if (error) toast('Errore nel salvataggio impostazioni', 'error');
    else toast('Impostazioni articoli salvate', 'success');
  }, [initialProject.id]);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // showSource removed — editor is now TipTap WYSIWYG
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Guard: warn on unsaved changes before leaving (refresh/close tab)
  const hasChangesRef = useRef(false);
  useEffect(() => { hasChangesRef.current = hasChanges; }, [hasChanges]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const navigateBack = useCallback(async () => {
    // Forzevolmente spengo il microfono prima di uscire o aprire il popup
    shouldRecordRef.current = false;
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch(e) {}
    }

    if (hasChangesRef.current) {
      const ok = await confirm({ title: 'Modifiche non salvate', message: 'Hai delle modifiche non salvate. Sei sicuro di voler lasciare la pagina?', confirmLabel: 'Lascia', variant: 'danger' });
      if (!ok) return;
    }
    router.push(`/editor/${initialProject.id}`);
  }, []);


  const [existingAuthors, setExistingAuthors] = useState<string[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [siblingTranslations, setSiblingTranslations] = useState<{ id: string; language: string; title: string }[]>([]);
  const [createLangModal, setCreateLangModal] = useState<string | null>(null); // target lang for new translation
  const [isCreatingTranslation, setIsCreatingTranslation] = useState(false);

  // Fetch existing authors and categories from other posts in this project
  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('authors, categories')
      .eq('project_id', initialProject.id)
      .then(({ data }) => {
        if (data) {
          const allAuthors = [...new Set(data.flatMap((p: any) => (p.authors || []).map((a: any) => typeof a === 'string' ? a : a?.name).filter(Boolean)))];
          setExistingAuthors(allAuthors);
          const allCategories = [...new Set(data.flatMap((p: any) => p.categories || []).filter(Boolean))];
          setExistingCategories(allCategories);
        }
      });
  }, [initialProject.id]);

  // Fetch sibling translations
  useEffect(() => {
    const group = initialPost.translation_group;
    if (!group) return;
    supabase
      .from('blog_posts')
      .select('id, language, title')
      .eq('translation_group', group)
      .neq('id', initialPost.id)
      .then(({ data }) => { if (data) setSiblingTranslations(data as any); });
  }, [initialPost.id, initialPost.translation_group]);

  const siteLanguages: string[] = initialProject.settings?.languages || [initialProject.settings?.defaultLanguage || 'it'];
  const isMultilingual = siteLanguages.length > 1;
  // Normalize language codes to short form (e.g. "en-gb" → "en")
  const normalizeLang = (lang: string) => lang?.split('-')[0]?.toLowerCase() || 'it';
  const postLang = normalizeLang(post.language || 'it');
  const existingLangs = [postLang, ...siblingTranslations.map(s => normalizeLang(s.language))];
  // missingLangs not used here — translation is available from the article card in the project dashboard

  const handleCreateTranslation = async (targetLang: string, mode: 'blank' | 'ai') => {
    setIsCreatingTranslation(true);
    try {
      const group = post.translation_group || post.id;
      const id = crypto.randomUUID();
      const slug = `${post.slug}-${targetLang}`;
      let body = '';
      let title = post.title;
      let excerpt = post.excerpt;

      if (mode === 'ai') {
        const translated = await translateBlogPostWithAI({
          title: post.title,
          excerpt: post.excerpt ?? '',
          body: (post.blocks?.[0] as any)?.content?.text || '',
          sourceLang: post.language || 'it',
          targetLang,
        });
        title = translated.title;
        excerpt = translated.excerpt;
        body = translated.body;
      }

      const blocks = body ? [{ id: crypto.randomUUID(), type: 'text' as const, content: { text: body }, style: {} }] : [];
      const payload: any = {
        id, project_id: initialProject.id, slug, title, excerpt,
        cover_image: post.cover_image, categories: post.categories, authors: post.authors,
        status: 'draft', blocks, seo: {}, language: targetLang, translation_group: group,
      };

      let { data } = await supabase.from('blog_posts').insert(payload).select().single();
      if (!data) {
        delete payload.translation_group;
        ({ data } = await supabase.from('blog_posts').insert(payload).select().single());
      }

      if (data) {
        toast(mode === 'ai' ? 'Traduzione AI creata' : 'Articolo creato', 'success');
        router.push(`/editor/${initialProject.id}/blog/${id}`);
      }
    } catch (err: any) {
      toast(err.message || 'Errore', 'error');
    } finally {
      setIsCreatingTranslation(false);
      setCreateLangModal(null);
    }
  };

  const resolveCover = (path: string) => resolveImageUrl(path, initialProject, {}, false);

  // ── TipTap WYSIWYG editor ──────────────────────────────────────────────────
  // Convert legacy markdown to HTML on first load (backward compat)
  const rawBody = (initialPost.blocks?.[0] as any)?.content?.text || '';
  const initialHtml = rawBody.trim().startsWith('<') || rawBody === ''
    ? rawBody
    : marked.parse(rawBody, { breaks: true }) as string;

  // ── Inline image NodeView ─────────────────────────────────────────────────
  const ImageNodeView = ({ node, updateAttributes, deleteNode, selected }: NodeViewProps) => {
    const { imageMemoryCache } = useEditorStore();
    const src = node.attrs.src || '';
    const align = node.attrs.align || 'center';
    const alt = node.attrs.alt || '';
    const imgWidth = node.attrs.width as number | null; // percentage, null = natural size
    const displaySrc = resolveImageUrl(src, initialProject, imageMemoryCache, false);

    // Drag-to-resize state
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleResizeStart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
      startX.current = e.clientX;
      // Current width in px, or natural width of image
      const imgEl = containerRef.current?.querySelector('img');
      startWidth.current = imgEl?.offsetWidth ?? 300;
      const parentWidth = containerRef.current?.parentElement?.offsetWidth ?? 600;

      const onMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = ev.clientX - startX.current;
        const newPx = Math.max(60, startWidth.current + dx);
        const newPct = Math.min(100, Math.round((newPx / parentWidth) * 100));
        updateAttributes({ width: newPct });
      };
      const onUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    };

    const wrapperStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
      margin: '1.5em 0',
    };
    const imgContainerStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-block',
      width: imgWidth ? `${imgWidth}%` : 'auto',
      maxWidth: '100%',
    };
    const imgStyle: React.CSSProperties = {
      display: 'block',
      width: imgWidth ? '100%' : 'auto',
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px',
      outline: selected ? '2px solid #3b82f6' : 'none',
      outlineOffset: '2px',
    };

    return (
      <NodeViewWrapper style={wrapperStyle} data-inline-image-wrap="" data-align={align}>
        <div ref={containerRef} style={imgContainerStyle}>
          <img src={displaySrc} alt={alt} style={imgStyle} data-inline-image="" data-img-width={imgWidth ?? ''} />

          {/* Floating toolbar — visible only when selected */}
          {selected && (
            <div
              contentEditable={false}
              style={{
                position: 'absolute', top: '-44px', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: '2px',
                background: '#18181b', borderRadius: '10px', padding: '4px 6px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)', zIndex: 50, whiteSpace: 'nowrap',
              }}
            >
              {/* Alignment */}
              {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([val, Icon]) => (
                <button
                  key={val}
                  onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: val }); }}
                  style={{
                    padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center',
                    background: align === val ? '#ffffff' : 'transparent',
                    color: align === val ? '#18181b' : '#a1a1aa',
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                ><Icon size={12} /></button>
              ))}

              <div style={{ width: '1px', height: '16px', background: '#3f3f46', margin: '0 2px' }} />

              {/* Width display */}
              <span style={{ fontSize: '10px', color: '#a1a1aa', padding: '0 4px', fontVariantNumeric: 'tabular-nums' }}>
                {imgWidth ? `${imgWidth}%` : 'Auto'}
              </span>

              {/* Reset width */}
              {imgWidth && (
                <button
                  onMouseDown={(e) => { e.preventDefault(); updateAttributes({ width: null }); }}
                  style={{ padding: '3px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: 'transparent', color: '#a1a1aa', border: 'none', cursor: 'pointer' }}
                >↺</button>
              )}

              <div style={{ width: '1px', height: '16px', background: '#3f3f46', margin: '0 2px' }} />

              {/* Alt text */}
              <input
                value={alt}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => updateAttributes({ alt: e.target.value })}
                placeholder="Alt text..."
                style={{
                  background: 'transparent', border: '1px solid #3f3f46', borderRadius: '6px',
                  color: '#e4e4e7', fontSize: '10px', padding: '2px 6px', width: '90px', outline: 'none',
                }}
              />

              <div style={{ width: '1px', height: '16px', background: '#3f3f46', margin: '0 2px' }} />

              {/* Delete */}
              <button
                onMouseDown={(e) => { e.preventDefault(); deleteNode(); }}
                style={{ padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}
              ><Trash2 size={12} /></button>
            </div>
          )}

          {/* Resize handle — right edge, visible when selected */}
          {selected && (
            <div
              contentEditable={false}
              onMouseDown={handleResizeStart}
              style={{
                position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)',
                width: '10px', height: '32px', background: '#3b82f6', borderRadius: '4px',
                cursor: 'ew-resize', zIndex: 51,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{ width: '2px', height: '16px', background: 'rgba(255,255,255,0.7)', borderRadius: '1px' }} />
            </div>
          )}
        </div>
      </NodeViewWrapper>
    );
  };

  const InlineImage = TipTapImage.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        // width: percentage (number) or null = natural size
        width: {
          default: null,
          parseHTML: el => { const v = el.getAttribute('data-img-width'); return v ? parseInt(v) : null; },
          renderHTML: attrs => attrs.width != null ? { 'data-img-width': String(attrs.width) } : {},
        },
        // align: stored as 'data-align' on wrapper — we emit it on the img so it round-trips
        align: {
          default: 'center',
          parseHTML: el => el.getAttribute('data-align') ?? 'center',
          renderHTML: attrs => ({ 'data-align': attrs.align || 'center' }),
        },
      };
    },
    renderHTML({ HTMLAttributes }) {
      const { 'data-align': align, 'data-img-width': imgWidth, ...rest } = HTMLAttributes;
      const w = imgWidth ? parseInt(String(imgWidth)) : null;
      const imgStyle = w ? `width: ${w}%; max-width: 100%; height: auto;` : 'max-width: 100%; height: auto;';
      return ['div', { 'data-inline-image-wrap': '', 'data-align': align || 'center' },
        ['img', mergeAttributes(rest, { 'data-inline-image': '', ...(w ? { 'data-img-width': String(w) } : {}), style: imgStyle })]
      ];
    },
    parseHTML() {
      return [{ tag: 'img[data-inline-image]' }];
    },
    addNodeView() {
      return ReactNodeViewRenderer(ImageNodeView);
    },
  });

  const extensions = useMemo(() => [
    StarterKit,
    Underline,
    TipTapLink.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: 'Scrivi il tuo articolo...' }),
    InlineImage.configure({ inline: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
  ], []);

  const editorProps = useMemo(() => ({
    attributes: { class: 'rt-content prose prose-sm max-w-none outline-none min-h-[500px] px-8 py-6' },
  }), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: "", // Start empty to avoid flushSync during initial mount in React 19
    editorProps,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const textBlock = {
        id: post.blocks?.[0]?.id || crypto.randomUUID(),
        type: 'text' as const,
        content: { text: html },
        style: {},
      };
      // Defer state update to avoid "flushSync" warning during render
      setTimeout(() => {
        updatePost({ blocks: [textBlock] });
      }, 0);
    },
  });

  // Set initial content after mount to avoid React 19 rendering conflicts
  useEffect(() => {
    if (mounted && editor && !editor.isDestroyed && initialHtml) {
      const timer = setTimeout(() => {
        if (editor.getHTML() === "<p></p>") { // Only if still empty
          editor.commands.setContent(initialHtml);
          // setContent triggers onUpdate → setHasChanges(true) — reset it
          setTimeout(() => setHasChanges(false), 0);
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [mounted, editor, initialHtml]);

  // Keep editor ref for voice dictation (avoids stale closure)
  const editorRef = useRef(editor);
  useEffect(() => { editorRef.current = editor; }, [editor]);

  // ── Speech-to-text ─────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  // Ref-based "should be recording" flag — lets onend restart without stale closure
  const shouldRecordRef = useRef(false);

  // Tracking state for real-time dictation session
  const dictationSessionRef = useRef({
    startPos: -1,
    currentEndPos: -1,
    finalizedText: '',
    needsSpace: false
  });

  const speechSupported = mounted && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const langToSpeechCode = (lang: string) => {
    const map: Record<string, string> = { it: 'it-IT', en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES' };
    return map[lang?.split('-')[0]] || 'it-IT';
  };

  const startRecognition = useCallback((lang: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = langToSpeechCode(lang);
    recognition.continuous = true;
    recognition.interimResults = true; // REALE-TIME ORA!

    recognition.onresult = (event: any) => {
      const ed = editorRef.current;
      if (!ed) return;

      const session = dictationSessionRef.current;

      // Initialize session if needed (first callback of a continuous session)
      if (session.startPos === -1) {
        const { from } = ed.state.selection;
        session.startPos = from;
        session.currentEndPos = from;
        const charBefore = from > 1 ? ed.state.doc.textBetween(from - 1, from) : '';
        session.needsSpace = charBefore !== '' && charBefore !== ' ' && charBefore !== '\n';
      }

      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          session.finalizedText += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentTranscription = (session.finalizedText + interimTranscript).trim();
      if (!currentTranscription) return;

      const fullTextToInsert = (session.needsSpace ? ' ' : '') + currentTranscription;
      
      // Update editor content at the tracked position
      ed.chain()
        .focus()
        .insertContentAt({ from: session.startPos, to: session.currentEndPos }, fullTextToInsert)
        .run();
      
      // Update end position based on newly inserted text length
      session.currentEndPos = session.startPos + fullTextToInsert.length;
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return; // non-fatal
      if (event.error === 'not-allowed') {
        toast('Permesso microfono negato — abilita il microfono nel browser', 'error');
        shouldRecordRef.current = false;
        setIsRecording(false);
      }
      // 'network' and other transient errors: let onend restart silently
    };

    recognition.onend = () => {
      if (shouldRecordRef.current) {
        try { recognition.start(); } catch { /* already started */ }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const toggleSpeech = useCallback(() => {
    if (shouldRecordRef.current) {
      shouldRecordRef.current = false;
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast('Speech-to-text non supportato dal browser', 'error'); return; }

    // Reset session tracking
    dictationSessionRef.current = {
      startPos: -1,
      currentEndPos: -1,
      finalizedText: '',
      needsSpace: false
    };

    shouldRecordRef.current = true;
    setIsRecording(true);
    startRecognition(postLang);
  }, [postLang, startRecognition]);

  // Cleanup microphone on unmount
  useEffect(() => {
    return () => {
      shouldRecordRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
      }
    };
  }, []);

  // AI Improve modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiAction, setAiAction] = useState<AITextAction>('improve');
  const [aiTone, setAiTone] = useState<AITextTone>('professional');
  const [aiCustom, setAiCustom] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const handleAiImprove = async () => {
    const currentText = editor?.getText() || '';
    if (!currentText || currentText.trim().length < 10) {
      toast('Scrivi almeno qualche frase prima di usare l\'AI', 'error');
      return;
    }
    setAiLoading(true);
    setAiResult('');
    try {
      const { result } = await improveTextWithAI({
        text: currentText,
        action: aiAction,
        tone: aiTone,
        language: post.language || 'it',
        customInstruction: aiCustom || undefined,
      });
      setAiResult(result);
    } catch (err: any) {
      toast(err.message || 'Errore AI', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiResult = () => {
    // AI returns markdown → convert to HTML for TipTap
    const html = marked.parse(aiResult, { breaks: true }) as string;
    editor?.commands.setContent(html);
    const textBlock = {
      id: post.blocks?.[0]?.id || crypto.randomUUID(),
      type: 'text' as const,
      content: { text: html },
      style: {},
    };
    updatePost({ blocks: [textBlock] });
    setAiModalOpen(false);
    setAiResult('');
    toast('Testo aggiornato', 'success');
  };


  const updatePost = useCallback((updates: Partial<BlogPost>) => {
    setPost(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  // TipTap toolbar helpers
  const tb = {
    bold:    () => editor?.chain().focus().toggleBold().run(),
    italic:  () => editor?.chain().focus().toggleItalic().run(),
    code:    () => editor?.chain().focus().toggleCode().run(),
    h2:      () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    h3:      () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    h4:      () => editor?.chain().focus().toggleHeading({ level: 4 }).run(),
    ul:      () => editor?.chain().focus().toggleBulletList().run(),
    ol:      () => editor?.chain().focus().toggleOrderedList().run(),
    quote:   () => editor?.chain().focus().toggleBlockquote().run(),
    hr:      () => editor?.chain().focus().setHorizontalRule().run(),
    alignLeft:    () => editor?.chain().focus().setTextAlign('left').run(),
    alignCenter:  () => editor?.chain().focus().setTextAlign('center').run(),
    alignRight:   () => editor?.chain().focus().setTextAlign('right').run(),
    alignJustify: () => editor?.chain().focus().setTextAlign('justify').run(),
    setColor:     (color: string) => editor?.chain().focus().setColor(color).run(),
    unsetColor:   () => editor?.chain().focus().unsetColor().run(),
    link:    () => {
      const url = window.prompt('URL del link:');
      if (!url) return;
      editor?.chain().focus().setLink({ href: url }).run();
    },
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      if (!base64) return;
      const path = await uploadImage(base64);
      if (path && !path.startsWith('data:')) {
        // Store the /assets/ relative path — NodeView resolves it to displayable URL at render time
        editor?.chain().focus().setImage({ src: path, alt: file.name.replace(/\.[^.]+$/, '') } as any).run();
      } else {
        toast('Errore upload immagine', 'error');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const updateSeo = useCallback((updates: Partial<BlogPost['seo']>) => {
    setPost(prev => ({ ...prev, seo: { ...prev.seo, ...updates } }));
    setHasChanges(true);
  }, []);


  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('blog_posts')
      .update({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        cover_image: post.cover_image,
        categories: post.categories,
        authors: post.authors,
        status: post.status,
        published_at: post.published_at,
        blocks: post.blocks,
        seo: post.seo,
        language: post.language,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id);

    if (error) toast('Errore nel salvataggio', 'error');
    else setHasChanges(false);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!await confirm({ title: 'Elimina articolo', message: `Vuoi eliminare "${post.title}"?`, confirmLabel: 'Elimina', variant: 'danger' })) return;
    await supabase.from('blog_posts').delete().eq('id', post.id);
    router.push(`/editor/${initialProject.id}`);
  };

  const toggleStatusAndSave = async () => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';

    // Confirm before changing status
    const confirmed = await confirm({
      title: newStatus === 'published' ? 'Pubblica articolo' : 'Rimetti in bozza',
      message: newStatus === 'published'
        ? `Vuoi pubblicare "${post.title}"? Sarà visibile sul sito dopo il prossimo deploy.`
        : `Vuoi rimettere "${post.title}" in bozza? Non sarà più visibile sul sito.`,
      confirmLabel: newStatus === 'published' ? 'Pubblica' : 'Metti in bozza',
      variant: newStatus === 'published' ? 'default' : 'danger',
    });
    if (!confirmed) return;

    const finalSlug = post.slug || generateSlug(post.title || 'articolo');

    const newPublishedAt = newStatus === 'published'
      ? (post.published_at || new Date().toISOString())
      : null;

    // Update state directly — don't go through updatePost to avoid setting hasChanges
    setPost(prev => ({ ...prev, status: newStatus, published_at: newPublishedAt, slug: finalSlug }));

    const { error } = await supabase
      .from('blog_posts')
      .update({ status: newStatus, published_at: newPublishedAt, slug: finalSlug })
      .eq('id', post.id);
    if (error) {
      setPost(prev => ({ ...prev, status: post.status, published_at: post.published_at, slug: post.slug }));
      if (error.code === '23505' || error.message?.includes('slug')) {
        toast('URL già usato da un altro articolo — modifica lo slug nella sidebar prima di pubblicare', 'error');
      } else {
        toast('Errore nel cambio stato', 'error');
      }
    } else {
      toast(newStatus === 'published' ? 'Articolo pubblicato' : 'Articolo riportato in bozza', 'success');
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);

  const inputClass = "w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300";
  const labelClass = "block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="h-screen flex flex-col bg-zinc-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ─── HEADER ─── */}
      <header className="h-12 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={navigateBack}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-[13px] font-semibold text-zinc-700 truncate max-w-[250px]">
            {post.title || 'Nuovo Articolo'}
          </span>
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
            post.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          )}>
            {post.status === 'published' ? 'Pubblicato' : 'Bozza'}
          </span>
          {/* Language switcher */}
          {isMultilingual && (
            <div className="flex items-center bg-zinc-100 p-0.5 ml-3 rounded-md border border-zinc-200/50">
              {/* Current language */}
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white text-zinc-900 rounded-[4px] shadow-sm border border-zinc-200/50">
                {postLang.split('-')[0]}
              </div>
              {/* Existing translations */}
              {siblingTranslations.map(s => (
                <Link
                  key={s.id}
                  href={`/editor/${initialProject.id}/blog/${s.id}`}
                  title={s.title}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-800 transition-colors block"
                >
                  {normalizeLang(s.language).split('-')[0]}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSave}
            disabled={!hasChanges && !isSaving}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all",
              hasChanges ? "bg-blue-600 text-white hover:bg-blue-700" : "text-zinc-400"
            )}
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {isSaving ? 'Salvo...' : hasChanges ? 'Salva' : 'Salvato'}
          </button>

          <button
            onClick={() => {
              window.history.pushState({ preview: true }, '');
              setShowCanvasPreview(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
            title="Anteprima articolo"
          >
            <MonitorPlay size={13} />
            Anteprima
          </button>

          <button
            onClick={toggleStatusAndSave}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all",
              post.status === 'published'
                ? "text-amber-700 hover:bg-amber-50"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
          >
            {post.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}
            {post.status === 'published' ? 'Metti in bozza' : 'Pubblica'}
          </button>

          <button onClick={handleDelete} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </header>

      {/* ─── BODY: cover + two columns ─── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ─── MAIN CONTENT (left) ─── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Title + Excerpt + Body */}
          <div className="px-8 py-8 space-y-6">
            {/* Title */}
            <input
              value={post.title ?? ''}
              onChange={(e) => {
                const newTitle = e.target.value;
                updatePost({ title: newTitle });
                // Follow title until first publish — after that slug is locked
                if (!post.published_at) {
                  updatePost({ slug: generateSlug(newTitle) });
                }
              }}
              placeholder="Titolo dell'articolo"
              className="w-full text-4xl font-bold text-zinc-900 placeholder:text-zinc-200 outline-none bg-transparent leading-tight"
            />

            {/* Excerpt */}
            <div>
              <textarea
                value={post.excerpt ?? ''}
                onChange={(e) => updatePost({ excerpt: e.target.value })}
                placeholder="Scrivi un breve estratto..."
                className="w-full text-lg text-zinc-400 placeholder:text-zinc-200 outline-none bg-transparent resize-none leading-relaxed"
                rows={2}
              />
              <p className="text-[10px] text-zinc-300 mt-1">
                L'estratto appare nella lista del blog, nelle condivisioni social e nei risultati di ricerca. Massimo 2-3 frasi che riassumono l'articolo.
              </p>
            </div>

            {/* Rich text toolbar */}
            <div className="sticky top-0 z-20 flex items-center gap-0.5 px-2 py-1.5 border border-zinc-200 rounded-t-xl bg-white/95 backdrop-blur-sm flex-wrap">
              <button onMouseDown={(e) => { e.preventDefault(); tb.bold(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('bold') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Grassetto (⌘B)"><Bold size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.italic(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('italic') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Corsivo (⌘I)"><Italic size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.code(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('code') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Codice inline"><Code size={14} /></button>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              <button onMouseDown={(e) => { e.preventDefault(); tb.h2(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('heading', { level: 2 }) ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Titolo H2"><Heading2 size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.h3(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('heading', { level: 3 }) ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Titolo H3"><Heading3 size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.h4(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('heading', { level: 4 }) ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Titolo H4"><Heading4 size={14} /></button>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              <button onMouseDown={(e) => { e.preventDefault(); tb.ul(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('bulletList') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Lista puntata"><List size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.ol(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('orderedList') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Lista numerata"><ListOrdered size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.quote(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('blockquote') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Citazione"><Quote size={14} /></button>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              <button onMouseDown={(e) => { e.preventDefault(); tb.link(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('link') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Link"><LinkIcon size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.hr(); }} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 transition-all" title="Separatore"><Minus size={14} /></button>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              <button
                onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 transition-all"
                title="Inserisci immagine"
              >
                <ImageIcon size={14} />
              </button>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              {/* Text alignment */}
              {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight], ['justify', AlignJustify]] as const).map(([val, Icon]) => (
                <button
                  key={val}
                  onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setTextAlign(val).run(); }}
                  className={cn("p-1.5 rounded-md transition-all", editor?.isActive({ textAlign: val }) ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")}
                  title={`Allinea ${val}`}
                ><Icon size={14} /></button>
              ))}

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              {/* Text color */}
              <div className="relative flex items-center">
                <button
                  onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); }}
                  className={cn(
                    "p-1.5 rounded-md transition-all relative",
                    showColorPicker ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60"
                  )}
                  title="Colore testo"
                >
                  <Palette size={14} />
                  {/* Color indicator underline */}
                  <span
                    className="absolute bottom-1 left-1 right-1 h-[2px] rounded-full"
                    style={{ background: editor?.getAttributes('textStyle').color || 'transparent', border: editor?.getAttributes('textStyle').color ? 'none' : '1px solid #d4d4d8' }}
                  />
                </button>
                <button
                  onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                  className="p-1 rounded-md text-zinc-300 hover:text-zinc-500 transition-all text-[10px] font-bold"
                  title="Rimuovi colore"
                >✕</button>

                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-zinc-200 rounded-xl shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200 w-[180px]">
                    <ColorInput 
                      value={editor?.getAttributes('textStyle').color || '#000000'}
                      onChange={(val) => {
                        editor?.chain().focus().setColor(val).run();
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Voice dictation inline with toolbar */}
              {speechSupported && (
                <>
                  <div className="w-px h-4 bg-zinc-200 mx-1" />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); toggleSpeech(); }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                      isRecording
                        ? "bg-red-500 text-white animate-pulse"
                        : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60"
                    )}
                    title={isRecording ? 'Ferma registrazione' : 'Dettatura vocale'}
                  >
                    {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
                    {isRecording ? 'Ascolto...' : 'Voce'}
                  </button>
                </>
              )}
            </div>

            {/* TipTap WYSIWYG editor - Encapsulated in SafeEditorContent to prevent React 19 flushSync errors */}
            <div className={cn("blog-tiptap-editor border border-t-0 border-zinc-200 rounded-b-xl bg-white overflow-hidden", isRecording && "is-recording")}>
              {isRecording && <style>{`.is-recording .ProseMirror p.is-editor-empty:first-child::before { content: '🎙 Sto ascoltando...'; }`}</style>}
              <SafeEditorContent editor={editor} />
            </div>

            {/* Hidden file input for inline image upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {/* Floating AI button */}
            <div className="fixed bottom-6 right-[312px] z-40 flex items-center gap-2">
              {/* TODO: attivare quando improveTextWithAI ha quota check tarata — vedi docs/merge-feature-blog.md
              <button
                onClick={() => setAiModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-[12px] font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-all"
              >
                <Sparkles size={15} />
                Migliora con AI
              </button>
              */}
            </div>
          </div>
        </div>

        {/* ─── SIDEBAR (right) ─── */}
        <div className="w-72 bg-white border-l border-zinc-200/80 flex flex-col shrink-0 overflow-hidden">
          {/* Sidebar tabs */}
          <div className="flex border-b border-zinc-100 shrink-0">
            <button
              onClick={() => setSidebarSection('config')}
              className={cn("flex-1 py-2.5 text-[11px] font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5",
                sidebarSection === 'config' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400"
              )}
            >
              <Settings size={12} /> Dettagli
            </button>
            <button
              onClick={() => setSidebarSection('seo')}
              className={cn("flex-1 py-2.5 text-[11px] font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5",
                sidebarSection === 'seo' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400"
              )}
            >
              <Search size={12} /> SEO
            </button>
            <button
              onClick={() => setSidebarSection('style')}
              className={cn("flex-1 py-2.5 text-[11px] font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5",
                sidebarSection === 'style' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400"
              )}
            >
              <Layout size={12} /> Stile
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {sidebarSection === 'config' && (
              <>
                <ImageUpload
                  label="Immagine di copertina"
                  value={post.cover_image ? resolveCover(post.cover_image) : ''}
                  onChange={handleCoverUpload}
                />
                <div>
                  <label className={labelClass}>Slug (URL)</label>
                  <div className="flex items-center">
                    <span className="text-[10px] text-zinc-300 font-mono shrink-0 mr-1">/blog/</span>
                    <input value={post.slug ?? ''} onChange={(e) => updatePost({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Categorie</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(post.categories || []).map((cat, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 text-[11px] font-semibold rounded-lg">
                          {cat}
                          <button onClick={() => updatePost({ categories: (post.categories || []).filter((_, idx) => idx !== i) })} className="text-zinc-400 hover:text-red-500 transition-colors">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      className={inputClass}
                      placeholder="Scrivi e premi Invio..."
                      list="existing-categories"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && !(post.categories || []).includes(val)) {
                            updatePost({ categories: [...(post.categories || []), val] });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <datalist id="existing-categories">
                      {existingCategories.filter(c => !(post.categories || []).includes(c)).map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Autori</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(post.authors || []).map((author, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 text-[11px] font-semibold rounded-lg">
                          {author.name}
                          <button onClick={() => updatePost({ authors: (post.authors || []).filter((_, idx) => idx !== i) })} className="text-zinc-400 hover:text-red-500 transition-colors">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      className={inputClass}
                      placeholder="Scrivi e premi Invio..."
                      list="existing-authors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && !(post.authors || []).some(a => a.name === val)) {
                            updatePost({ authors: [...(post.authors || []), { name: val, slug: val.toLowerCase().replace(/\s+/g, '-') }] });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <datalist id="existing-authors">
                      {existingAuthors.filter(a => !(post.authors || []).some(auth => auth.name === a)).map(a => (
                        <option key={a} value={a} />
                      ))}
                    </datalist>
                  </div>
                </div>

              </>
            )}

            {sidebarSection === 'style' && (
              <>
                <p className="text-[9px] text-zinc-400 bg-zinc-50 rounded-lg px-3 py-2">Queste impostazioni si applicano a tutti gli articoli del progetto.</p>
                <div>
                  <label className={labelClass}>Copertina</label>
                  <div className="grid grid-cols-2 gap-1">
                    {([['hero', 'Tutta larghezza'], ['contained', 'Contenuta']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => updateBpd({ coverImageMode: val })}
                        className={cn("p-2 text-[11px] font-bold rounded-xl border transition-all", (bpd.coverImageMode || 'hero') === val ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 text-zinc-400 border-zinc-100 hover:text-zinc-600")}
                      >{label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Larghezza max corpo (px)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={bpd.bodyMaxWidth ?? ''}
                    placeholder="Auto (100%)"
                    min={320}
                    max={1800}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value) || undefined;
                      updateBpd({ bodyMaxWidth: val });
                    }}
                  />
                  <p className="text-[9px] text-zinc-400 mt-1">Vuoto = larghezza piena. Esempio: 720</p>
                </div>
                <SimpleSlider label="Padding verticale" value={bpd.bodyPaddingY ?? 80} onChange={(v) => updateBpd({ bodyPaddingY: v })} min={0} max={200} step={8} />
                <SimpleSlider label="Padding verticale mobile" value={bpd.bodyPaddingYMobile ?? 48} onChange={(v) => updateBpd({ bodyPaddingYMobile: v })} min={0} max={200} step={8} />
                <SimpleSlider label="Padding laterale desktop" value={bpd.bodyPaddingX ?? 24} onChange={(v) => updateBpd({ bodyPaddingX: v })} min={0} max={120} step={4} />
                <SimpleSlider label="Padding laterale mobile" value={bpd.bodyPaddingXMobile ?? 16} onChange={(v) => updateBpd({ bodyPaddingXMobile: v })} min={0} max={120} step={4} />
                <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-700">Indice dei contenuti</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bpd.showToc === true}
                    onChange={(e) => updateBpd({ showToc: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-300"
                  />
                </div>
                <button
                  onClick={() => saveProjectSettings(projectSettings)}
                  disabled={isSavingProjectSettings}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-[11px] font-bold hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingProjectSettings ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Salva impostazioni articoli
                </button>
              </>
            )}

            {sidebarSection === 'seo' && (
              <>
                <SeoFields
                  seo={post.seo || {}}
                  onChange={(updates) => updateSeo(updates)}
                  project={initialProject}
                  uploadImage={uploadImage}
                  isUploading={isUploading}
                  compact={true}
                  allowIndexToggle={true}
                  defaultImage={post.cover_image || ''}
                  titlePlaceholder={post.title || 'Titolo per Google...'}
                  descriptionPlaceholder={post.excerpt || 'Descrizione per Google...'}
                />

                {/* Google preview */}
                <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Anteprima Google</p>
                  <p className="text-blue-700 text-xs font-medium truncate">{post.seo?.title || post.title || 'Titolo'}</p>
                  <p className="text-emerald-700 text-[10px] font-mono truncate">tuosito.it/blog/{post.slug}</p>
                  <p className="text-zinc-500 text-[10px] line-clamp-2">{post.seo?.description || post.excerpt || 'Descrizione...'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── CANVAS PREVIEW OVERLAY ─── */}
      {showCanvasPreview && (() => {
        const maxWidth = bpd.bodyMaxWidth ?? null;
        const paddingX = previewViewport === 'mobile' ? (bpd.bodyPaddingXMobile ?? 16) : (bpd.bodyPaddingX ?? 24);
        const coverMode = bpd.coverImageMode ?? 'hero';
        const showToc = bpd.showToc === true;

        const font = projectSettings?.fontFamily || 'Outfit';
        const isDark = projectSettings?.appearance === 'dark';
        const themeBg = isDark ? (projectSettings?.themeColors?.dark?.bg || '#0c0c0e') : (projectSettings?.themeColors?.light?.bg || '#ffffff');
        const themeText = isDark ? (projectSettings?.themeColors?.dark?.text || '#ffffff') : (projectSettings?.themeColors?.light?.text || '#000000');
        const pColor = projectSettings?.primaryColor || '#3b82f6';
        const coverSrc = post.cover_image ? resolveImageUrl(post.cover_image, initialProject, useEditorStore.getState().imageMemoryCache, false) : '';
        // Read directly from editor to get latest state including image attr changes
        const rawBodyHtml = editor ? editor.getHTML() : ((post.blocks?.[0] as any)?.content?.text || '');
        // Resolve /assets/ paths to Supabase public URLs, and inject flex alignment styles on image wrappers
        const cache = useEditorStore.getState().imageMemoryCache;
        const bodyHtml = rawBodyHtml
          .replace(/src="([^"]+)"/g, (_: string, src: string) => {
            const resolved = resolveImageUrl(src, initialProject, cache, false);
            return `src="${resolved}"`;
          })
          .replace(/<div([^>]*data-inline-image-wrap[^>]*)>/g, (_: string, attrs: string) => {
            const alignMatch = attrs.match(/data-align="([^"]+)"/);
            const align = alignMatch ? alignMatch[1] : 'center';
            const justifyMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
            const justify = justifyMap[align] || 'center';
            return `<div${attrs} style="display:flex;justify-content:${justify};margin:1em 0;">`;
          });

        // Simple TOC extraction for preview
        let tocHtml = '';
        if (showToc && bodyHtml) {
          const headingMatches = [...bodyHtml.matchAll(/<(h[234])[^>]*>([\s\S]*?)<\/h[234]>/gi)];
          if (headingMatches.length > 0) {
            const items = headingMatches.map((m, i) => {
              const level = parseInt(m[1][1]);
              const text = m[2].replace(/<[^>]+>/g, '').trim();
              return { level, text, id: `toc-${i}` };
            });
            tocHtml = `<nav class="blog-toc"><ul>${items.map(it =>
              `<li style="padding-left:${(it.level - 2) * 16}px"><a href="#${it.id}">${it.text}</a></li>`
            ).join('')}</ul></nav>`;
          }
        }

        // Typography from project settings — same values as generate-blog-static
        const typo = projectSettings?.typography || {};
        const typoTablet = projectSettings?.responsive?.tablet?.typography || {};
        const typoMobile = projectSettings?.responsive?.mobile?.typography || {};

        // Pick the right typography set based on selected viewport (media queries don't work on divs)
        const activeTypo = previewViewport === 'mobile'
          ? { ...typo, ...typoMobile }
          : previewViewport === 'tablet'
          ? { ...typo, ...typoTablet }
          : typo;

        const previewCss = `
          @import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&display=swap');

          .blog-preview-root {
            --global-h1-fs: ${activeTypo.h1Size ? toPx(activeTypo.h1Size) : '2.5rem'};
            --global-h2-fs: ${activeTypo.h2Size ? toPx(activeTypo.h2Size) : '1.75rem'};
            --global-h3-fs: ${activeTypo.h3Size ? toPx(activeTypo.h3Size) : '1.35rem'};
            --global-h4-fs: ${activeTypo.h4Size ? toPx(activeTypo.h4Size) : '1.05rem'};
            --global-body-fs: ${activeTypo.bodySize ? toPx(activeTypo.bodySize) : '1rem'};
          }

          .blog-preview-root * { box-sizing: border-box; }
          .blog-preview-root { font-family: '${font}', sans-serif; background: ${themeBg}; color: ${themeText}; font-size: var(--global-body-fs); }

          .blog-body { text-align: left; }
          .blog-body h1 { font-size: var(--global-h1-fs); font-weight: 800; margin: 0 0 0.4em; line-height: 1.1; letter-spacing: -0.02em; }
          .blog-body h2 { font-size: var(--global-h2-fs); font-weight: 700; margin: 0 0 0.3em; line-height: 1.2; }
          .blog-body h3 { font-size: var(--global-h3-fs); font-weight: 600; margin: 0 0 0.25em; line-height: 1.2; }
          .blog-body h4 { font-size: var(--global-h4-fs); font-weight: 600; margin: 0 0 0.2em; line-height: 1.2; }
          .blog-body p { font-size: var(--global-body-fs); line-height: 1.7; margin-bottom: 0.6em; }
          .blog-body br { display: block; content: ''; margin-top: 0.3em; }
          .blog-body a { color: ${pColor}; text-decoration: underline; }
          .blog-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.2em; }
          .blog-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.2em; }
          .blog-body ul ul { list-style-type: circle; }
          .blog-body ul ul ul { list-style-type: square; }
          .blog-body li { font-size: var(--global-body-fs); margin-bottom: 0.4em; display: list-item; }
          .blog-body strong { font-weight: 600; }
          .blog-body blockquote { border-left: 3px solid ${pColor}; padding-left: 1em; margin: 1.5em 0; opacity: 0.8; font-style: italic; }
          .blog-body pre, .blog-body code { font-family: monospace; background: color-mix(in srgb, ${themeText} 8%, transparent); border-radius: 6px; padding: 0.2em 0.5em; font-size: 0.9em; }
          .blog-body pre { padding: 1em; overflow-x: auto; }
          .blog-body hr { border: none; border-top: 1px solid color-mix(in srgb, ${themeText} 12%, transparent); margin: 2em 0; }
          .blog-body img:not([data-inline-image]) { max-width: 100%; border-radius: 12px; margin: 1.5em 0; }
          .blog-body [data-inline-image-wrap] { display: flex !important; margin: 1em 0; }
          .blog-body [data-inline-image-wrap][data-align="left"] { justify-content: flex-start !important; }
          .blog-body [data-inline-image-wrap][data-align="center"] { justify-content: center !important; }
          .blog-body [data-inline-image-wrap][data-align="right"] { justify-content: flex-end !important; }
          .blog-body [data-inline-image] { height: auto !important; border-radius: 8px; display: block !important; max-width: 100%; }
          .blog-toc { background: color-mix(in srgb, ${themeText} 4%, transparent); border-radius: 12px; padding: 16px 20px; margin: 0 0 40px; }
          .blog-toc ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
          .blog-toc li { margin: 0; font-size: 0.85rem; }
          .blog-toc a { color: inherit; text-decoration: none; opacity: 0.7; }
          .blog-toc a:hover { opacity: 1; }
          .cover-contained { border-radius: 16px; overflow: hidden; margin-bottom: 2em; }
        `;

        const paddingY = previewViewport === 'mobile' ? (bpd.bodyPaddingYMobile ?? 48) : (bpd.bodyPaddingY ?? 80);
        const articleStyle: React.CSSProperties = {
          maxWidth: maxWidth ? `${maxWidth}px` : '100%',
          margin: '0 auto',
          padding: `${paddingY}px ${paddingX}px`,
        };

        const viewportWidths = { desktop: '100%', tablet: '768px', mobile: '390px' };

        return (
          <div className="fixed inset-0 z-[200] flex flex-col" style={{ fontFamily: `'${font}', sans-serif`, background: '#e5e7eb' }}>
            {/* Preview header */}
            <div className="flex items-center h-14 bg-white border-b border-zinc-200 px-4 shrink-0 z-[210] gap-3">
              <button
                onClick={() => setShowCanvasPreview(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all font-semibold text-[13px] group"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                Torna all'editor
              </button>
              <div className="w-px h-5 bg-zinc-200" />
              <span className="text-[12px] text-zinc-400 font-medium flex items-center gap-1.5">
                <MonitorPlay size={13} /> Anteprima articolo
              </span>
              {/* Viewport switcher — centrato */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-zinc-100 rounded-lg p-0.5">
                {([
                  { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                  { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                  { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
                ]).map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setPreviewViewport(key)}
                    title={label}
                    className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all", previewViewport === key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
                  >
                    <Icon size={14} />
                    <span className="hidden lg:inline text-[11px]">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1" />
            </div>

            {/* Scrollable content wrapper — grey bg, centered viewport */}
            <div className="flex-1 overflow-y-auto flex justify-center items-start" style={{ background: previewViewport === 'desktop' ? themeBg : '#e5e7eb' }}>
              <div className="blog-preview-root w-full transition-all duration-300" style={{ maxWidth: viewportWidths[previewViewport], background: themeBg, color: themeText, minHeight: '100vh' }}>
              <style>{previewCss}</style>

              {/* Cover hero */}
              {coverSrc && coverMode === 'hero' && (
                <div style={{ width: '100%', aspectRatio: '3/1', overflow: 'hidden', marginBottom: '2em' }}>
                  <img src={coverSrc} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Article */}
              <div style={articleStyle}>
                {coverSrc && coverMode === 'contained' && (
                  <div className="cover-contained" style={{ aspectRatio: '16/6' }}>
                    <img src={coverSrc} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Categories */}
                {(post.categories || []).length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>
                      {(post.categories || []).join(' · ')}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h1 style={{ fontSize: 'var(--global-h1-fs)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 16 }}>
                  {post.title}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                  <p style={{ fontSize: '1.15rem', opacity: 0.5, lineHeight: 1.6, marginBottom: 24 }}>{post.excerpt}</p>
                )}

                {/* Meta + divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, opacity: 0.5, marginBottom: 48, paddingBottom: 24, borderBottom: `1px solid color-mix(in srgb, ${themeText} 8%, transparent)` }}>
                  {(post.authors || []).length > 0 && <><span style={{ fontWeight: 600 }}>{post.authors!.map(a => a.name).join(', ')}</span><span>&middot;</span></>}
                  {post.published_at && <span>{new Date(post.published_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                </div>

                {/* TOC */}
                {tocHtml && <div dangerouslySetInnerHTML={{ __html: tocHtml }} />}

                {/* Body */}
                <div
                  className="blog-body"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── AI IMPROVE MODAL ─── */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { if (!aiLoading) { setAiModalOpen(false); setAiResult(''); } }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-600" />
                <h2 className="text-[15px] font-bold text-zinc-900">Migliora con AI</h2>
              </div>
              <button onClick={() => { if (!aiLoading) { setAiModalOpen(false); setAiResult(''); } }} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>

            {!aiResult ? (
              /* ── Configuration step ── */
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Action */}
                <div>
                  <label className={labelClass}>Cosa vuoi fare?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: 'improve' as const, label: 'Migliora scrittura', desc: 'Più fluido e coinvolgente' },
                      { id: 'expand' as const, label: 'Espandi', desc: 'Aggiungi dettagli e paragrafi' },
                      { id: 'summarize' as const, label: 'Riassumi', desc: 'Accorcia mantenendo il senso' },
                      { id: 'rewrite' as const, label: 'Riscrivi', desc: 'Riscrittura completa' },
                    ] as const).map(a => (
                      <button
                        key={a.id}
                        onClick={() => setAiAction(a.id)}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                          aiAction === a.id
                            ? "border-violet-500 bg-violet-50"
                            : "border-zinc-200 hover:border-zinc-300"
                        )}
                      >
                        <span className="text-[12px] font-bold text-zinc-800">{a.label}</span>
                        <span className="text-[10px] text-zinc-400">{a.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className={labelClass}>Tono</label>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      { id: 'professional' as const, label: 'Professionale' },
                      { id: 'casual' as const, label: 'Informale' },
                      { id: 'formal' as const, label: 'Formale' },
                      { id: 'persuasive' as const, label: 'Persuasivo' },
                      { id: 'technical' as const, label: 'Tecnico' },
                    ] as const).map(t => (
                      <button
                        key={t.id}
                        onClick={() => setAiTone(t.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all",
                          aiTone === t.id
                            ? "border-violet-500 bg-violet-600 text-white"
                            : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom instruction */}
                <div>
                  <label className={labelClass}>Istruzione aggiuntiva (opzionale)</label>
                  <textarea
                    value={aiCustom}
                    onChange={(e) => setAiCustom(e.target.value)}
                    className={cn(inputClass, "h-20 resize-none")}
                    placeholder='Es. "Aggiungi un paragrafo sulla SEO", "Rendi più adatto per un pubblico giovane"...'
                  />
                </div>

                {/* Generate button */}
                <button
                  onClick={handleAiImprove}
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-white font-semibold text-[13px] hover:bg-violet-700 transition-all disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {aiLoading ? 'Generazione in corso...' : 'Genera'}
                </button>
              </div>
            ) : (
              /* ── Result step ── */
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-700">Anteprima risultato</span>
                  <span className="text-[10px] text-amber-500">— Applicando sovrascriverai il testo attuale</span>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div
                    className="prose prose-sm max-w-none prose-headings:tracking-tight prose-headings:text-zinc-900 prose-p:text-zinc-600 prose-a:text-blue-600 prose-strong:text-zinc-800"
                    dangerouslySetInnerHTML={{ __html: marked.parse(aiResult, { breaks: true }) as string }}
                  />
                </div>

                <div className="flex items-center gap-2 px-6 py-4 border-t border-zinc-100 bg-zinc-50">
                  <button
                    onClick={() => setAiResult('')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 text-[12px] font-semibold text-zinc-600 hover:bg-zinc-100 transition-all"
                  >
                    <RotateCcw size={13} />
                    Rigenera
                  </button>
                  <button
                    onClick={() => { setAiModalOpen(false); setAiResult(''); }}
                    className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-zinc-500 hover:bg-zinc-100 transition-all"
                  >
                    Annulla
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={applyAiResult}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[12px] font-semibold hover:bg-violet-700 transition-all"
                  >
                    Applica al testo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── CREATE TRANSLATION MODAL ─── */}
      {createLangModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !isCreatingTranslation && setCreateLangModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-zinc-900">
                Crea versione {LANGUAGES.find(l => l.value === createLangModal)?.flag || createLangModal?.toUpperCase()}
              </h2>
              <button onClick={() => setCreateLangModal(null)} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => handleCreateTranslation(createLangModal, 'ai')}
                disabled={isCreatingTranslation}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-all text-left disabled:opacity-50"
              >
                {isCreatingTranslation ? <Loader2 size={18} className="text-violet-500 animate-spin" /> : <Sparkles size={18} className="text-violet-500" />}
                <div>
                  <div className="text-[13px] font-bold text-violet-800">Traduci con AI</div>
                  <div className="text-[10px] text-violet-500">Traduzione automatica di titolo, estratto e corpo</div>
                </div>
              </button>
              <button
                onClick={() => handleCreateTranslation(createLangModal, 'blank')}
                disabled={isCreatingTranslation}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all text-left disabled:opacity-50"
              >
                <PanelLeft size={18} className="text-zinc-400" />
                <div>
                  <div className="text-[13px] font-bold text-zinc-700">Articolo vuoto</div>
                  <div className="text-[10px] text-zinc-400">Crea un articolo vuoto e traducilo manualmente</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
