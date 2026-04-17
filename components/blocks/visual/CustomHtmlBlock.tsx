'use client';

import React, { useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { resolveHtml } from './CustomHtmlBlock.resolve';
import { scopeBlockCss } from './CustomHtmlBlock.scope';
import { Project, Block } from '@/types/editor';

function kebabToPascal(name: string): string {
  return name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function resolveChbIcons(container: HTMLElement, content: Record<string, any>) {
  container.querySelectorAll<HTMLElement>('[data-chb-icon]').forEach(el => {
    const originalName = el.getAttribute('data-chb-icon') ?? '';
    const resolvedName = (content[`cbIcon_${originalName}`] ?? originalName).trim();
    const pascalName = kebabToPascal(resolvedName);
    const IconComponent = (LucideIcons as any)[pascalName] ?? (LucideIcons as any)[resolvedName];
    if (!IconComponent) return;
    el.innerHTML = renderToStaticMarkup(
      React.createElement(IconComponent as any, { size: 24, strokeWidth: 1.5 })
    );
  });
}

interface CustomHtmlBlockProps {
  content: {
    html?: string;
    css?: string;
    js?: string;
    sectionId?: string;
    backgroundImage?: string;
    backgroundAlt?: string;
    [key: string]: any;
  };
  block: Block;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

export const CustomHtmlBlock: React.FC<CustomHtmlBlockProps> = ({
  content,
  block,
  project,
  viewport,
  isStatic,
  imageMemoryCache = {},
}) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const blockId = `chb-${block.id?.substring(0, 8) ?? 'x'}`;
  const styleTagRef = useRef<HTMLStyleElement | null>(null);

  const hasContent = !!(content.html || content.css);

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    background: 'var(--block-bg)',
    color: 'var(--block-color)',
    paddingTop: 'var(--block-pt)',
    paddingBottom: 'var(--block-pb)',
    paddingLeft: 'var(--block-px)',
    paddingRight: 'var(--block-px)',
    marginTop: 'var(--block-mt)',
    marginBottom: 'var(--block-mb)',
    borderRadius: 'var(--block-radius)',
    borderWidth: 'var(--block-border-w)',
    borderColor: 'var(--block-border-c)',
    borderStyle: style.borderWidth ? 'solid' : undefined,
    minHeight: 'var(--block-min-height)',
    overflow: 'hidden',
    containerType: 'inline-size',
    textTransform: 'none',
  } as React.CSSProperties;

  if (isStatic) {
    const resolved = resolveHtml(content.html ?? '', content, project, true, imageMemoryCache);
    const sizeDefaults = `#${blockId} h1{font-size:var(--global-h1-fs);}#${blockId} h2{font-size:var(--global-h2-fs);}#${blockId} h3{font-size:var(--global-h3-fs);}#${blockId} h4{font-size:var(--global-h4-fs);}#${blockId} h5{font-size:var(--global-h5-fs);}#${blockId} h6{font-size:var(--global-h6-fs);}`;
    const safeOverride = `#${blockId} .cb-wrap{text-transform:none!important;padding:0!important;margin:0!important;background:none!important;}`;
    const staticHtml = [
      `<style>${sizeDefaults}${scopeBlockCss(content.css ?? '', blockId)}${safeOverride}</style>`,
      resolved,
      content.js ? `<script defer>(function(){\n${content.js}\n})();</script>` : '',
    ].join('');

    return (
      <div id={blockId} style={wrapperStyle}>
        <BlockBackground
          backgroundImage={content.backgroundImage}
          backgroundAlt={content.backgroundAlt}
          style={style}
          project={project}
          isStatic={true}
          imageMemoryCache={imageMemoryCache}
        />
        <div style={{ position: 'relative', zIndex: 1 }} dangerouslySetInnerHTML={{ __html: staticHtml }} />
      </div>
    );
  }

  const runJs = React.useCallback(() => {
    if (!content.js) return;
    try {
      // eslint-disable-next-line no-new-func
      new Function(content.js)();
    } catch (e) {
      console.warn('[CustomHtmlBlock] JS exec error:', e);
    }
  }, [content.js]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!content.css) {
      styleTagRef.current?.remove();
      styleTagRef.current = null;
    } else {
      if (!styleTagRef.current) {
        const tag = document.createElement('style');
        tag.setAttribute('data-chb', blockId);
        document.head.appendChild(tag);
        styleTagRef.current = tag;
      }
      const sizeDefaults = `#${blockId} h1{font-size:var(--global-h1-fs);}#${blockId} h2{font-size:var(--global-h2-fs);}#${blockId} h3{font-size:var(--global-h3-fs);}#${blockId} h4{font-size:var(--global-h4-fs);}#${blockId} h5{font-size:var(--global-h5-fs);}#${blockId} h6{font-size:var(--global-h6-fs);}`;
      const safeOverride = `#${blockId} .cb-wrap{text-transform:none!important;padding:0!important;margin:0!important;background:none!important;}`;
      styleTagRef.current.textContent = sizeDefaults + scopeBlockCss(content.css, blockId) + safeOverride;
    }
    return () => {
      styleTagRef.current?.remove();
      styleTagRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.css, blockId]);

  // Resolve data-chb-icon spans client-side after each render
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const el = document.getElementById(blockId);
    if (el) resolveChbIcons(el, content);
  }); // intentionally runs after every render

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { runJs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const el = document.getElementById(blockId);
    if (!el) return;
    const handler = () => runJs();
    el.addEventListener('chb-replay', handler);
    return () => el.removeEventListener('chb-replay', handler);
  }, [blockId, runJs]);

  if (hasContent) {
    const resolved = resolveHtml(content.html ?? '', content, project, false, imageMemoryCache);
    return (
      <div id={blockId} style={wrapperStyle}>
        <BlockBackground
          backgroundImage={content.backgroundImage}
          backgroundAlt={content.backgroundAlt}
          style={style}
          project={project}
          isStatic={false}
          imageMemoryCache={imageMemoryCache}
        />
        <div style={{ position: 'relative', zIndex: 1 }} dangerouslySetInnerHTML={{ __html: resolved }} />
      </div>
    );
  }

  return (
    <div id={blockId} style={{ ...wrapperStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
      <span style={{ color: '#a1a1aa', fontSize: 13 }}>
        Blocco HTML personalizzato — scrivi codice nella sidebar o genera con AI
      </span>
    </div>
  );
};

export default CustomHtmlBlock;
