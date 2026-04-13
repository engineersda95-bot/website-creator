'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types/editor';
import { cn } from '@/lib/utils';
import { toast } from '@/components/shared/Toast';
import { confirm } from '@/components/shared/ConfirmDialog';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import { improveTextWithAI, translateBlogPostWithAI, type AITextAction, type AITextTone } from '@/app/actions/ai-generator';
import { marked } from 'marked';
import TipTapImage from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TipTapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';

import { ImageNodeView } from './components/ImageNodeView';
import { BlogPostHeader } from './components/BlogPostHeader';
import { BlogPostToolbar } from './components/BlogPostToolbar';
import { BlogPostSidebar } from './components/BlogPostSidebar';
import { BlogPostPreview } from './components/BlogPostPreview';
import { BlogPostAiModal } from './components/BlogPostAiModal';
import { BlogPostTranslationModal } from './components/BlogPostTranslationModal';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Guard: warn on unsaved changes before leaving
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
  const [createLangModal, setCreateLangModal] = useState<string | null>(null);
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
  const normalizeLang = (lang: string) => lang?.split('-')[0]?.toLowerCase() || 'it';
  const postLang = normalizeLang(post.language || 'it');

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
  const rawBody = (initialPost.blocks?.[0] as any)?.content?.text || '';
  const initialHtml = rawBody.trim().startsWith('<') || rawBody === ''
    ? rawBody
    : marked.parse(rawBody, { breaks: true }) as string;

  // ── Inline image extension ─────────────────────────────────────────────────
  const InlineImage = useMemo(() => TipTapImage.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
          parseHTML: el => { const v = el.getAttribute('data-img-width'); return v ? parseInt(v) : null; },
          renderHTML: attrs => attrs.width != null ? { 'data-img-width': String(attrs.width) } : {},
        },
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
      return ReactNodeViewRenderer((props: any) => <ImageNodeView {...props} project={initialProject} />);
    },
  }), [initialProject]);

  const extensions = useMemo(() => [
    StarterKit,
    Underline,
    TipTapLink.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: 'Scrivi il tuo articolo...' }),
    InlineImage.configure({ inline: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
  ], [InlineImage]);

  const editorProps = useMemo(() => ({
    attributes: { class: 'rt-content prose prose-sm max-w-none outline-none min-h-[500px] px-8 py-6' },
  }), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: "",
    editorProps,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const textBlock = {
        id: post.blocks?.[0]?.id || crypto.randomUUID(),
        type: 'text' as const,
        content: { text: html },
        style: {},
      };
      setTimeout(() => {
        updatePost({ blocks: [textBlock] });
      }, 0);
    },
  });

  // Set initial content after mount
  useEffect(() => {
    if (mounted && editor && !editor.isDestroyed && initialHtml) {
      const timer = setTimeout(() => {
        if (editor.getHTML() === "<p></p>") {
          editor.commands.setContent(initialHtml);
          setTimeout(() => setHasChanges(false), 0);
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [mounted, editor, initialHtml]);

  const editorRef = useRef(editor);
  useEffect(() => { editorRef.current = editor; }, [editor]);

  // ── Speech-to-text ─────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldRecordRef = useRef(false);

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
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const ed = editorRef.current;
      if (!ed) return;

      const session = dictationSessionRef.current;

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

      ed.chain()
        .focus()
        .insertContentAt({ from: session.startPos, to: session.currentEndPos }, fullTextToInsert)
        .run();

      session.currentEndPos = session.startPos + fullTextToInsert.length;
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      if (event.error === 'not-allowed') {
        toast('Permesso microfono negato — abilita il microfono nel browser', 'error');
        shouldRecordRef.current = false;
        setIsRecording(false);
      }
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
      <BlogPostHeader
        post={post}
        hasChanges={hasChanges}
        isSaving={isSaving}
        isMultilingual={isMultilingual}
        postLang={postLang}
        siblingTranslations={siblingTranslations}
        projectId={initialProject.id}
        normalizeLang={normalizeLang}
        onNavigateBack={navigateBack}
        onSave={handleSave}
        onOpenPreview={() => {
          window.history.pushState({ preview: true }, '');
          setShowCanvasPreview(true);
        }}
        onToggleStatus={toggleStatusAndSave}
        onDelete={handleDelete}
      />

      {/* ─── BODY: two columns ─── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ─── MAIN CONTENT (left) ─── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-8 py-8 space-y-6">
            {/* Title */}
            <input
              value={post.title ?? ''}
              onChange={(e) => {
                const newTitle = e.target.value;
                updatePost({ title: newTitle });
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
            <BlogPostToolbar
              editor={editor}
              isRecording={isRecording}
              speechSupported={speechSupported}
              showColorPicker={showColorPicker}
              setShowColorPicker={setShowColorPicker}
              onToggleSpeech={toggleSpeech}
              onImageClick={() => fileInputRef.current?.click()}
              tb={tb}
            />

            {/* TipTap WYSIWYG editor */}
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
        <BlogPostSidebar
          post={post}
          sidebarSection={sidebarSection}
          setSidebarSection={setSidebarSection}
          resolveCover={resolveCover}
          existingCategories={existingCategories}
          existingAuthors={existingAuthors}
          bpd={bpd}
          isSavingProjectSettings={isSavingProjectSettings}
          initialProject={initialProject}
          isUploading={isUploading}
          uploadImage={uploadImage}
          onCoverUpload={handleCoverUpload}
          onUpdatePost={updatePost}
          onUpdateSeo={updateSeo}
          onUpdateBpd={updateBpd}
          onSaveProjectSettings={saveProjectSettings}
          projectSettings={projectSettings}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      </div>

      {/* ─── CANVAS PREVIEW OVERLAY ─── */}
      {showCanvasPreview && (
        <BlogPostPreview
          post={post}
          editor={editor}
          projectSettings={projectSettings}
          bpd={bpd}
          previewViewport={previewViewport}
          setPreviewViewport={setPreviewViewport}
          initialProject={initialProject}
          onClose={() => setShowCanvasPreview(false)}
        />
      )}

      {/* ─── AI IMPROVE MODAL ─── */}
      {aiModalOpen && (
        <BlogPostAiModal
          aiAction={aiAction}
          setAiAction={setAiAction}
          aiTone={aiTone}
          setAiTone={setAiTone}
          aiCustom={aiCustom}
          setAiCustom={setAiCustom}
          aiLoading={aiLoading}
          aiResult={aiResult}
          setAiResult={setAiResult}
          onGenerate={handleAiImprove}
          onApply={applyAiResult}
          onClose={() => { if (!aiLoading) { setAiModalOpen(false); setAiResult(''); } }}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      )}

      {/* ─── CREATE TRANSLATION MODAL ─── */}
      {createLangModal && (
        <BlogPostTranslationModal
          targetLang={createLangModal}
          isCreating={isCreatingTranslation}
          onCreateTranslation={handleCreateTranslation}
          onClose={() => setCreateLangModal(null)}
        />
      )}
    </div>
  );
}
