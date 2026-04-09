'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types/editor';
import { cn } from '@/lib/utils';
import { toast } from '@/components/shared/Toast';
import { confirm } from '@/components/shared/ConfirmDialog';
import {
  ArrowLeft, Save, Loader2, Eye, EyeOff, Trash2,
  Settings, Search,
  X, Mic, MicOff, Sparkles, RotateCcw,
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Code, Minus
} from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { improveTextWithAI, translateBlogPostWithAI, type AITextAction, type AITextTone } from '@/app/actions/ai-generator';
import { marked } from 'marked';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TipTapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

interface BlogPostEditorClientProps {
  initialUser: any;
  initialProject: any;
  initialPost: BlogPost;
}

export function BlogPostEditorClient({ initialUser, initialProject, initialPost }: BlogPostEditorClientProps) {
  const router = useRouter();
  const { setProject, uploadImage } = useEditorStore();

  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  const handleCoverUpload = async (base64: string) => {
    const path = await uploadImage(base64);
    if (path && !path.startsWith('data:')) updatePost({ cover_image: path });
    else toast('Errore upload immagine', 'error');
  };

  const [post, setPost] = useState<BlogPost>(initialPost);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [sidebarSection, setSidebarSection] = useState<'config' | 'seo'>('config');
  // showSource removed — editor is now TipTap WYSIWYG
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
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
          const allAuthors = [...new Set(data.flatMap((p: any) => p.authors || []).filter(Boolean))];
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
  const langNames: Record<string, string> = { it: '🇮🇹 IT', en: '🇬🇧 EN', fr: '🇫🇷 FR', de: '🇩🇪 DE', es: '🇪🇸 ES' };
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
          excerpt: post.excerpt,
          body: (post.blocks[0] as any)?.content?.text || '',
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
  const rawBody = (initialPost.blocks[0] as any)?.content?.text || '';
  const initialHtml = rawBody.trim().startsWith('<') || rawBody === ''
    ? rawBody
    : marked.parse(rawBody, { breaks: true }) as string;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Scrivi il tuo articolo...' }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: 'rt-content prose prose-sm max-w-none outline-none min-h-[500px] px-8 py-6' },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const textBlock = {
        id: post.blocks[0]?.id || crypto.randomUUID(),
        type: 'text' as const,
        content: { text: html },
        style: {},
      };
      updatePost({ blocks: [textBlock] });
    },
  });

  // Keep editor ref for voice dictation (avoids stale closure)
  const editorRef = useRef(editor);
  useEffect(() => { editorRef.current = editor; }, [editor]);

  // ── Speech-to-text ─────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  // Ref-based "should be recording" flag — lets onend restart without stale closure
  const shouldRecordRef = useRef(false);
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
    recognition.interimResults = false; // only finals → cleaner, no duplicates

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        editorRef.current?.chain().focus().insertContent(' ' + transcript.trim()).run();
      }
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
      // Browser stopped recognition (silence timeout, network hiccup, etc.)
      // If user hasn't manually stopped, restart immediately
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

    shouldRecordRef.current = true;
    setIsRecording(true);
    startRecognition(postLang);
  }, [postLang, startRecognition]);

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
      id: post.blocks[0]?.id || crypto.randomUUID(),
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
    ul:      () => editor?.chain().focus().toggleBulletList().run(),
    ol:      () => editor?.chain().focus().toggleOrderedList().run(),
    quote:   () => editor?.chain().focus().toggleBlockquote().run(),
    hr:      () => editor?.chain().focus().setHorizontalRule().run(),
    link:    () => {
      const url = window.prompt('URL del link:');
      if (!url) return;
      editor?.chain().focus().setLink({ href: url }).run();
    },
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

  const togglePublish = () => {
    if (post.status === 'published') {
      updatePost({ status: 'draft', published_at: null });
    } else {
      updatePost({ status: 'published', published_at: new Date().toISOString() });
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
          <Link
            href={`/editor/${initialProject.id}`}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
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
            <div className="flex items-center gap-0.5 ml-2">
              {/* Current language */}
              <span className="text-[10px] font-bold text-white bg-zinc-900 px-2 py-0.5 rounded">
                {langNames[postLang] || postLang.toUpperCase()}
              </span>
              {/* Existing translations */}
              {siblingTranslations.map(s => (
                <Link
                  key={s.id}
                  href={`/editor/${initialProject.id}/blog/${s.id}`}
                  className="text-[10px] font-bold text-zinc-500 hover:text-zinc-700 px-2 py-0.5 rounded hover:bg-zinc-100 transition-all"
                  title={s.title}
                >
                  {langNames[normalizeLang(s.language)] || normalizeLang(s.language).toUpperCase()}
                </Link>
              ))}
              {/* Traduzione articolo: disponibile dalla scheda nella lista articoli del progetto */}
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
            onClick={togglePublish}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all",
              post.status === 'published'
                ? "text-amber-700 hover:bg-amber-50"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
          >
            {post.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}
            {post.status === 'published' ? 'Bozza' : 'Pubblica'}
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
          {/* Cover image — display only; upload is in sidebar */}
          {post.cover_image && (
            <div className="relative group w-full aspect-[3/1] bg-zinc-100">
              <img src={resolveCover(post.cover_image)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <button
                  onClick={() => updatePost({ cover_image: '' })}
                  className="px-3 py-1.5 bg-white/90 text-zinc-700 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white flex items-center gap-1.5"
                >
                  <X size={12} /> Rimuovi
                </button>
              </div>
            </div>
          )}

          {/* Title + Excerpt + Body */}
          <div className="px-8 py-8 space-y-6">
            {/* Title */}
            <input
              value={post.title ?? ''}
              onChange={(e) => {
                const newTitle = e.target.value;
                updatePost({ title: newTitle });
                if (!post.slug || post.slug.startsWith('post-')) {
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

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              <button onMouseDown={(e) => { e.preventDefault(); tb.ul(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('bulletList') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Lista puntata"><List size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.ol(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('orderedList') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Lista numerata"><ListOrdered size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.quote(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('blockquote') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Citazione"><Quote size={14} /></button>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              <button onMouseDown={(e) => { e.preventDefault(); tb.link(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('link') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Link"><LinkIcon size={14} /></button>
              <button onMouseDown={(e) => { e.preventDefault(); tb.hr(); }} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 transition-all" title="Separatore"><Minus size={14} /></button>

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

            {/* TipTap WYSIWYG editor */}
            <div className="blog-tiptap-editor border border-t-0 border-zinc-200 rounded-b-xl bg-white overflow-hidden">
              <EditorContent editor={editor} />
            </div>

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
                          {author}
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
                          if (val && !(post.authors || []).includes(val)) {
                            updatePost({ authors: [...(post.authors || []), val] });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <datalist id="existing-authors">
                      {existingAuthors.filter(a => !(post.authors || []).includes(a)).map(a => (
                        <option key={a} value={a} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Stato</label>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border",
                    post.status === 'published' ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", post.status === 'published' ? "bg-emerald-500" : "bg-amber-400")} />
                    <span className="text-xs font-semibold">{post.status === 'published' ? 'Pubblicato' : 'Bozza'}</span>
                    {post.published_at && (
                      <span className="text-[10px] text-zinc-400 ml-auto">
                        {new Date(post.published_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {sidebarSection === 'seo' && (
              <>
                <div>
                  <label className={labelClass}>Titolo SEO</label>
                  <input value={post.seo?.title || ''} onChange={(e) => updateSeo({ title: e.target.value })} className={inputClass} placeholder={post.title || 'Titolo per Google'} />
                  <p className="text-[9px] text-zinc-400 mt-1">{(post.seo?.title || post.title || '').length}/60</p>
                </div>
                <div>
                  <label className={labelClass}>Descrizione SEO</label>
                  <textarea value={post.seo?.description || ''} onChange={(e) => updateSeo({ description: e.target.value })} className={cn(inputClass, "h-20 resize-none")} placeholder={post.excerpt || 'Descrizione per Google'} />
                  <p className="text-[9px] text-zinc-400 mt-1">{(post.seo?.description || '').length}/160</p>
                </div>
                <div>
                  <label className={labelClass}>Immagine OG</label>
                  <input value={post.seo?.image || ''} onChange={(e) => updateSeo({ image: e.target.value })} className={inputClass} placeholder="Default: cover image" />
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-700">Indicizzabile</div>
                    <div className="text-[9px] text-zinc-400">Visibile su Google</div>
                  </div>
                  <input type="checkbox" checked={post.seo?.indexable !== false} onChange={(e) => updateSeo({ indexable: e.target.checked })} className="w-4 h-4 rounded border-zinc-300 text-zinc-900" />
                </div>

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
                Crea versione {langNames[createLangModal] || createLangModal.toUpperCase()}
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
