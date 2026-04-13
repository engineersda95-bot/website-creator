'use client';

import React, { useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';
import type { Project } from '@/types/editor';

interface ImageNodeViewProps extends NodeViewProps {
  project: Project;
}

export function ImageNodeView({ node, updateAttributes, deleteNode, selected, project }: ImageNodeViewProps) {
  const { imageMemoryCache } = useEditorStore();
  const src = node.attrs.src || '';
  const align = node.attrs.align || 'center';
  const alt = node.attrs.alt || '';
  const imgWidth = node.attrs.width as number | null;
  const displaySrc = resolveImageUrl(src, project, imageMemoryCache, false);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    startX.current = e.clientX;
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

            <span style={{ fontSize: '10px', color: '#a1a1aa', padding: '0 4px', fontVariantNumeric: 'tabular-nums' }}>
              {imgWidth ? `${imgWidth}%` : 'Auto'}
            </span>

            {imgWidth && (
              <button
                onMouseDown={(e) => { e.preventDefault(); updateAttributes({ width: null }); }}
                style={{ padding: '3px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: 'transparent', color: '#a1a1aa', border: 'none', cursor: 'pointer' }}
              >↺</button>
            )}

            <div style={{ width: '1px', height: '16px', background: '#3f3f46', margin: '0 2px' }} />

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

            <button
              onMouseDown={(e) => { e.preventDefault(); deleteNode(); }}
              style={{ padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}
            ><Trash2 size={12} /></button>
          </div>
        )}

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
}
