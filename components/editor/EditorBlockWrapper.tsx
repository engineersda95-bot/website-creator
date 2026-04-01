'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, ChevronUp, ChevronDown, Copy, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlockComponent } from '@/components/blocks/BlockRegistry';
import { getBlockCSSVariables } from '@/lib/responsive-utils';
import { useEditorStore } from '@/store/useEditorStore';

interface EditorBlockWrapperProps {
  block: any;
  project: any;
  projectPages: any[];
  viewport: 'desktop' | 'tablet' | 'mobile';
  isSelected: boolean;
  index: number;
  totalBlocks: number;
  onSelect: (id: string) => void;
  onCopy: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
  imageMemoryCache: any;
}

export const EditorBlockWrapper = React.memo(({
  block,
  project,
  projectPages,
  viewport,
  isSelected,
  index,
  totalBlocks,
  onSelect,
  onCopy,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onRemove,
  imageMemoryCache
}: EditorBlockWrapperProps) => {
  const Component = getBlockComponent(block.type);
  const vars = getBlockCSSVariables(block, project, viewport || 'desktop');
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Blog posts for blog-list block
  const currentPage = useEditorStore(state => state.currentPage);
  const [editorBlogPosts, setEditorBlogPosts] = useState<any[]>([]);
  useEffect(() => {
    if (block.type !== 'blog-list' || !project?.id) return;
    import('@/lib/supabase').then(({ supabase }) => {
      supabase
        .from('blog_posts')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setEditorBlogPosts(data); });
    });
  }, [block.type, project?.id]);

  // Inject page language into blog-list block for multilingual filtering
  const effectiveBlock = block.type === 'blog-list' && currentPage?.language
    ? { ...block, content: { ...block.content, language: currentPage.language } }
    : block;

  const onInlineEdit = React.useCallback((field: string, value: string) => {
    updateBlock(block.id, { [field]: value });
  }, [block.id, updateBlock]);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 2500);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
      className={cn(
        "group relative transition-all cursor-pointer block-wrapper",
        block.type === 'navigation' ? "z-[500]" : "z-0",
        isSelected ? (block.type === 'navigation' ? "z-[501]" : "z-[40]") : "",
      )}
      style={{
        ...vars,
        borderRadius: 'var(--block-radius)',
        border: 'var(--block-border-w) solid var(--block-border-c)',
        marginTop: 'var(--block-mt)',
        marginBottom: 'var(--block-mb)',
        marginLeft: 'var(--block-ml-auto, 0)',
        marginRight: 'var(--block-mr-auto, 0)',
      } as any}

    >
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none z-20" />
      )}

      <Component
        content={effectiveBlock.content}
        block={effectiveBlock}
        isEditing={true}
        isStatic={false}
        project={project}
        allPages={projectPages}
        viewport={viewport}
        imageMemoryCache={imageMemoryCache}
        onInlineEdit={onInlineEdit}
        allBlogPosts={editorBlogPosts}
      />

      {/* Block Controls */}
      <div className={cn(
        "absolute flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-zinc-900/90 backdrop-blur-md shadow-2xl rounded-2xl p-2 border border-white/20 z-[10001] transform",
        index === 0 ? "left-6 bottom-6 -translate-x-4 group-hover:translate-x-0" : "right-6 top-6 translate-x-4 group-hover:translate-x-0"
      )}>
        <div className="flex items-center gap-1 pr-2 mr-2 border-r border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">
          {block.type}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onCopy(block.id); }}
          className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors"
          title="Copia (Ctrl+C)"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}
          className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors"
          title="Duplica (Ctrl+D)"
        >
          <Layers size={16} />
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(block.id); }}
          className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-20"
          disabled={index === 0}
          title="Sposta Su"
        >
          <ChevronUp size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(block.id); }}
          className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-20"
          disabled={index === totalBlocks - 1}
          title="Sposta Giu"
        >
          <ChevronDown size={18} />
        </button>
        {block.type !== 'blog-list' && (
          confirmDelete ? (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(block.id); setConfirmDelete(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-xl transition-all ml-1 text-[11px] font-semibold animate-in fade-in zoom-in-95 duration-150"
              title="Conferma eliminazione"
            >
              <Trash2 size={14} />
              Elimina?
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              className="p-2 hover:bg-red-500 text-white rounded-xl transition-colors ml-1"
              title="Elimina"
            >
              <Trash2 size={18} />
            </button>
          )
        )}
      </div>
    </div>
  );
});
EditorBlockWrapper.displayName = 'EditorBlockWrapper';
