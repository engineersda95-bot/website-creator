'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types/editor';
import { cn, toPx } from '@/lib/utils';
import { toast } from '@/components/shared/Toast';
import { confirm } from '@/components/shared/ConfirmDialog';
import { ArrowLeft, Monitor, Tablet, Smartphone, MonitorPlay } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import { InlineImage, InlineYoutube } from '@/components/editor/blog/BlogExtensions';
import { improveTextWithAI, translateBlogPostWithAI } from '@/app/actions/ai-blog';
import { friendlyAiError } from '@/lib/ai/gemini';
import type { AITextAction, AITextTone } from '@/lib/ai/blog';
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
import { BlogPostHeader } from './components/BlogPostHeader';
import { BlogPostToolbar } from './components/BlogPostToolbar';
import { BlogPostSidebar } from './components/BlogPostSidebar';
import { BlogPostAiModal, BlogPostTranslationModal } from './components/BlogPostAiModal';

interface BlogPostEditorClientProps {
  initialUser: any;
  initialProject: any;
  initialPost: BlogPost;
}

function SafeEditorContent({ editor }: { editor: any }) {
  if (!editor || editor.isDestroyed) {
    return <div className="min-h-[500px] bg-white" />;
  }
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [projectSettings, setProjectSettings] = useState(() => initialProject.settings || {});
  const [isSavingProjectSettings, setIsSavingProjectSettings] = useState(false);
  const bpd = (projectSettings.blogPostDisplay || {}) as any;

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
        useEditorStore.getState().incrementAiUsed();
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

  const rawBody = (initialPost.blocks?.[0] as any)?.content?.text || '';
  const initialHtml = rawBody.trim().startsWith('<') || rawBody === ''
    ? rawBody
    : marked.parse(rawBody, { breaks: true }) as string;

  const updatePost = useCallback((updates: Partial<BlogPost>) => {
    setPost(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  const updateSeo = useCallback((updates: Partial<BlogPost['seo']>) => {
    setPost(prev => ({ ...prev, seo: { ...prev.seo, ...updates } }));
    setHasChanges(true);
  }, []);

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
    else {
      setHasChanges(false);
      toast('Articolo salvato', 'success');
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!await confirm({ title: 'Elimina articolo', message: `Vuoi eliminare "${post.title}"?`, confirmLabel: 'Elimina', variant: 'danger' })) return;
    await supabase.from('blog_posts').delete().eq('id', post.id);
    router.push(`/editor/${initialProject.id}`);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);

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

  // ── TipTap ────────────────────────────────────────────────────────────────

  const extensions = useMemo(() => [
    StarterKit,
    Underline,
    TipTapLink.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: 'Scrivi il tuo articolo...' }),
    InlineImage.configure({ inline: false }),
    InlineYoutube,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
  ] as any[], []);

  const editorProps = useMemo(() => ({
    attributes: { class: 'rt-content prose prose-sm max-w-none outline-none min-h-[500px] px-8 py-6' },
  }), []);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions,
    content: "",
    editorProps,
    onUpdate: ({ editor }: { editor: any }) => {
      const html = editor.getHTML();
      const textBlock = {
        id: post.blocks?.[0]?.id || crypto.randomUUID(),
        type: 'text' as const,
        content: { text: html },
        style: {},
      };
      setTimeout(() => { updatePost({ blocks: [textBlock] }); }, 0);
    },
  } as any);

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

  // ── Speech-to-text ────────────────────────────────────────────────────────

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldRecordRef = useRef(false);
  const dictationSessionRef = useRef({ startPos: -1, currentEndPos: -1, finalizedText: '', needsSpace: false });
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
        if (event.results[i].isFinal) session.finalizedText += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
      }
      const currentTranscription = (session.finalizedText + interimTranscript).trim();
      if (!currentTranscription) return;
      const fullTextToInsert = (session.needsSpace ? ' ' : '') + currentTranscription;
      ed.chain().focus().insertContentAt({ from: session.startPos, to: session.currentEndPos }, fullTextToInsert).run();
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
    dictationSessionRef.current = { startPos: -1, currentEndPos: -1, finalizedText: '', needsSpace: false };
    shouldRecordRef.current = true;
    setIsRecording(true);
    startRecognition(postLang);
  }, [postLang, startRecognition]);

  useEffect(() => {
    return () => {
      shouldRecordRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
      }
    };
  }, []);

  // ── AI modal state ────────────────────────────────────────────────────────

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiAction, setAiAction] = useState<AITextAction>('improve');
  const [aiTone, setAiTone] = useState<AITextTone>('professional');
  const [aiCustom, setAiCustom] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const handleAiImprove = async () => {
    const currentText = editor?.getText() || '';
    if (!currentText || currentText.trim().length < 10) {
      toast("Scrivi almeno qualche frase prima di usare l'AI", 'error');
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
      useEditorStore.getState().incrementAiUsed();
      setAiResult(result);
    } catch (err: any) {
      toast(friendlyAiError(err.message || 'Errore AI'), 'error');
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-zinc-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <BlogPostHeader
        post={post}
        projectId={initialProject.id}
        hasChanges={hasChanges}
        isSaving={isSaving}
        isMultilingual={isMultilingual}
        postLang={postLang}
        siblingTranslations={siblingTranslations}
        normalizeLang={normalizeLang}
        onNavigateBack={navigateBack}
        onSave={handleSave}
        onToggleStatus={toggleStatusAndSave}
        onDelete={handleDelete}
        onShowPreview={() => { window.history.pushState({ preview: true }, ''); setShowCanvasPreview(true); }}
      />

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-8 py-8 space-y-6">
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

            <BlogPostToolbar
              editor={editor}
              isRecording={isRecording}
              speechSupported={speechSupported}
              fileInputRef={fileInputRef}
              onToggleSpeech={toggleSpeech}
            />

            <div className={cn("blog-tiptap-editor border border-t-0 border-zinc-200 rounded-b-xl bg-white overflow-hidden", isRecording && "is-recording")}>
              {isRecording && <style>{`.is-recording .ProseMirror p.is-editor-empty:first-child::before { content: '🎙 Sto ascoltando...'; }`}</style>}
              <style>{`
                @media (max-width: 768px) {
                  .youtube-node-container, .image-node-container {
                    width: 100% !important;
                  }
                }
              `}</style>
              {mounted && <SafeEditorContent editor={editor} />}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            <div className="fixed bottom-6 right-[312px] z-40 flex items-center gap-2">
              {/* TODO: attivare quando improveTextWithAI ha quota check tarata — vedi docs/merge-feature-blog.md */}
            </div>
          </div>
        </div>

        <BlogPostSidebar
          post={post}
          sidebarSection={sidebarSection}
          projectSettings={projectSettings}
          isSavingProjectSettings={isSavingProjectSettings}
          existingAuthors={existingAuthors}
          existingCategories={existingCategories}
          project={initialProject}
          uploadImage={uploadImage}
          isUploading={isUploading}
          resolveCover={resolveCover}
          onSetSidebarSection={setSidebarSection}
          onCoverUpload={handleCoverUpload}
          onUpdatePost={updatePost}
          onUpdateSeo={updateSeo}
          onUpdateBpd={updateBpd}
          onSaveProjectSettings={saveProjectSettings}
        />
      </div>

      {/* Canvas preview */}
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
        const rawBodyHtml = editor ? editor.getHTML() : ((post.blocks?.[0] as any)?.content?.text || '');
        const cache = useEditorStore.getState().imageMemoryCache;
        const bodyHtml = rawBodyHtml
          .replace(/src="([^"]+)"/g, (_: string, src: string) => {
            const resolved = resolveImageUrl(src, initialProject, cache, false);
            return `src="${resolved}"`;
          })
          .replace(/<div([^>]*data-inline-youtube[^>]*)>([\s\S]*?)<\/div>/g, (_: string, attrs: string, content: string) => {
            if (content.includes('youtube-node-container')) return `<div${attrs}>${content}</div>`;
            const widthMatch = attrs.match(/data-youtube-width="([^"]+)"/);
            const width = widthMatch ? widthMatch[1] : '80';
            return `<div${attrs}><div class="youtube-node-container" style="width:${width}%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);position:relative;">${content}</div></div>`;
          });

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

        const typo = projectSettings?.typography || {};
        const typoTablet = projectSettings?.responsive?.tablet?.typography || {};
        const typoMobile = projectSettings?.responsive?.mobile?.typography || {};
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
          ${previewViewport !== 'desktop' ? `.youtube-node-container, .blog-body [data-inline-image] { width: 100% !important; }` : ''}
          @media (max-width: 768px) { .youtube-node-container, .blog-body [data-inline-image] { width: 100% !important; } }
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

            <div className="flex-1 overflow-y-auto flex justify-center items-start" style={{ background: previewViewport === 'desktop' ? themeBg : '#e5e7eb' }}>
              <div className="blog-preview-root w-full transition-all duration-300" style={{ maxWidth: viewportWidths[previewViewport], background: themeBg, color: themeText, minHeight: '100vh' }}>
                <style>{previewCss}</style>
                {coverSrc && coverMode === 'hero' && (
                  <div style={{ width: '100%', aspectRatio: '3/1', overflow: 'hidden', marginBottom: '2em' }}>
                    <img src={coverSrc} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={articleStyle}>
                  {coverSrc && coverMode === 'contained' && (
                    <div className="cover-contained" style={{ aspectRatio: '16/6' }}>
                      <img src={coverSrc} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  {(post.categories || []).length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>
                        {(post.categories || []).join(' · ')}
                      </span>
                    </div>
                  )}
                  <h1 style={{ fontSize: 'var(--global-h1-fs)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 16 }}>
                    {post.title}
                  </h1>
                  {post.excerpt && (
                    <p style={{ fontSize: '1.15rem', opacity: 0.5, lineHeight: 1.6, marginBottom: 24 }}>{post.excerpt}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, opacity: 0.5, marginBottom: 48, paddingBottom: 24, borderBottom: `1px solid color-mix(in srgb, ${themeText} 8%, transparent)` }}>
                    {(post.authors || []).length > 0 && <><span style={{ fontWeight: 600 }}>{post.authors!.map(a => a.name).join(', ')}</span><span>&middot;</span></>}
                    {post.published_at && <span>{new Date(post.published_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                  </div>
                  {tocHtml && <div dangerouslySetInnerHTML={{ __html: tocHtml }} />}
                  <div className="blog-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {aiModalOpen && (
        <BlogPostAiModal
          aiAction={aiAction}
          aiTone={aiTone}
          aiCustom={aiCustom}
          aiLoading={aiLoading}
          aiResult={aiResult}
          onSetAiAction={setAiAction}
          onSetAiTone={setAiTone}
          onSetAiCustom={setAiCustom}
          onGenerate={handleAiImprove}
          onApply={applyAiResult}
          onClose={() => { setAiModalOpen(false); setAiResult(''); }}
        />
      )}

      {createLangModal && (
        <BlogPostTranslationModal
          targetLang={createLangModal}
          isCreating={isCreatingTranslation}
          onCreate={(mode) => handleCreateTranslation(createLangModal, mode)}
          onClose={() => setCreateLangModal(null)}
        />
      )}
    </div>
  );
}
