import React from 'react';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { resolveHtml } from './CustomHtmlBlock.resolve';
import { scopeBlockCss } from './CustomHtmlBlock.scope';
import { Project, Block } from '@/types/editor';

interface Props {
  content: {
    html?: string;
    css?: string;
    js?: string;
    backgroundImage?: string;
    backgroundAlt?: string;
    [key: string]: any;
  };
  block: Block;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  [key: string]: any;
}

export const CustomHtmlBlockStatic: React.FC<Props> = ({
  content,
  block,
  project,
  viewport = 'desktop',
  imageMemoryCache = {},
}) => {
  const { style } = getBlockStyles(block, project, viewport);
  const blockId = `chb-${block.id?.substring(0, 8) ?? 'x'}`;

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
};

export default CustomHtmlBlockStatic;
