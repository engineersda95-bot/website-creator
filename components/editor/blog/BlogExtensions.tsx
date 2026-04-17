import React, { useRef } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { AlignLeft, AlignCenter, AlignRight, Trash2, Youtube, Image as ImageIcon } from 'lucide-react';
import TipTapImage from '@tiptap/extension-image';
import { resolveImageUrl } from '@/lib/image-utils';
import { useEditorStore } from '@/store/useEditorStore';

export const getYouTubeId = (url: string) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/]+)/);
  return match ? match[1] : url;
};

// ── Youtube NodeView ────────────────────────────────────────────────────────
const YoutubeNodeView = ({ node, updateAttributes, deleteNode, selected }: NodeViewProps) => {
  const url = node.attrs.url || '';
  const align = node.attrs.align || 'center';
  const videoWidth = node.attrs.width as number | null;
  const embedUrl = url ? `https://www.youtube.com/embed/${getYouTubeId(url)}` : '';

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    startX.current = e.clientX;
    const el = containerRef.current;
    startWidth.current = el?.offsetWidth ?? 300;
    const parentWidth = el?.parentElement?.offsetWidth ?? 600;

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = ev.clientX - startX.current;
      const newPx = Math.max(100, startWidth.current + dx);
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
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'block',
    width: videoWidth ? `${videoWidth}%` : '80%',
    maxWidth: '100%',
    aspectRatio: '16/9',
    height: 'auto',
    border: selected ? '2px solid #3b82f6' : 'none',
    borderRadius: '12px',
    overflow: 'hidden',
  };

  return (
    <NodeViewWrapper style={wrapperStyle}>
      <style>{`
        @media (max-width: 768px) {
          .youtube-node-container {
            width: 100% !important;
          }
        }
      `}</style>
      <div ref={containerRef} className="youtube-node-container" style={containerStyle}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0 pointer-events-none"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs font-bold">
            URL Youtube non valido
          </div>
        )}

        {/* Overlay to prevent iframe from capturing clicks and allow selection */}
        <div className="absolute inset-0 bg-transparent" />

        {/* Toolbar */}
        {selected && (
          <div
            contentEditable={false}
            style={{
              position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: '2px',
              background: '#18181b', borderRadius: '10px', padding: '4px 6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)', zIndex: 50, whiteSpace: 'nowrap',
            }}
          >
            {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([val, Icon]) => (
              <button
                key={val}
                type="button"
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

            <span style={{ fontSize: '10px', color: '#a1a1aa', padding: '0 4px' }}>
              {videoWidth || 80}%
            </span>

            <div style={{ width: '1px', height: '16px', background: '#3f3f46', margin: '0 2px' }} />

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); deleteNode(); }}
              style={{
                padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center',
                background: 'transparent', color: '#ef4444',
                border: 'none', cursor: 'pointer'
              }}
            ><Trash2 size={12} /></button>
          </div>
        )}

        {/* Resize handle */}
        {selected && (
          <div
            contentEditable={false}
            onMouseDown={handleResizeStart}
            style={{
              position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)',
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

// ── Image NodeView ──────────────────────────────────────────────────────────
const ImageNodeView = ({ node, updateAttributes, deleteNode, selected }: NodeViewProps) => {
  const { imageMemoryCache, project } = useEditorStore.getState();
  const src = node.attrs.src || '';
  const align = node.attrs.align || 'center';
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
    display: 'block',
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
  };

  return (
    <NodeViewWrapper style={wrapperStyle}>
      <style>{`
        @media (max-width: 768px) {
          .image-node-container {
            width: 100% !important;
          }
        }
      `}</style>
      <div ref={containerRef} className="image-node-container" style={imgContainerStyle}>
        <img src={displaySrc} alt={node.attrs.alt || ''} style={imgStyle} />
        
        {selected && (
          <div
            contentEditable={false}
            style={{
              position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: '2px',
              background: '#18181b', borderRadius: '10px', padding: '4px 6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)', zIndex: 50, whiteSpace: 'nowrap',
            }}
          >
            {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([val, Icon]) => (
              <button
                key={val}
                type="button"
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
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); deleteNode(); }}
              style={{
                padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center',
                background: 'transparent', color: '#ef4444',
                border: 'none', cursor: 'pointer'
              }}
            ><Trash2 size={12} /></button>
          </div>
        )}

        {selected && (
          <div
            contentEditable={false}
            onMouseDown={handleResizeStart}
            style={{
              position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)',
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

// ── Extensions ──────────────────────────────────────────────────────────────
export const InlineImage = TipTapImage.extend({
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
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

export const InlineYoutube = Node.create({
  name: 'inlineYoutube',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: el => el.getAttribute('data-youtube-url'),
        renderHTML: attrs => ({ 'data-youtube-url': attrs.url }),
      },
      width: {
        default: 80,
        parseHTML: el => { const v = el.getAttribute('data-youtube-width'); return v ? parseInt(v) : 80; },
        renderHTML: attrs => ({ 'data-youtube-width': String(attrs.width) }),
      },
      align: {
        default: 'center',
        parseHTML: el => el.getAttribute('data-align') ?? 'center',
        renderHTML: attrs => ({ 'data-align': attrs.align || 'center' }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-inline-youtube]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const { 'data-youtube-url': url, 'data-align': align, 'data-youtube-width': width } = HTMLAttributes;
    const embedUrl = url ? `https://www.youtube.com/embed/${getYouTubeId(String(url))}` : '';
    const justifyMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
    
    return ['div', { 
      'data-inline-youtube': '', 
      'data-align': align || 'center', 
      'data-youtube-width': width || '80',
      'data-youtube-url': url || '',
      style: `display: flex; justify-content: ${justifyMap[String(align)] || 'center'}; margin: 1.5em 0;` 
    },
      ['div', { 
        class: 'youtube-node-container',
        style: `width: ${width || '80'}%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; position: relative;` 
      },
        ['iframe', { 
          src: embedUrl, 
          frameborder: '0', 
          allowfullscreen: 'true', 
          style: 'width:100%; height:100%; border:0; display:block;' 
        }]
      ]
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(YoutubeNodeView);
  },
});
