
import React from 'react';
import { formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { Plus, Minus, ChevronDown } from 'lucide-react';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';

interface FAQBlockProps {
  content: {
    title?: string;
    variant?: 'accordion' | 'classic' | 'side-by-side' | 'numbered';
    items: Array<{ question: string; answer: string }>;
    backgroundImage?: string;
    sectionId?: string;
    backgroundAlt?: string;
  };
  block: Block;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  onInlineEdit?: (field: string, value: string) => void;
}

const FAQWrapper: React.FC<{
  content: FAQBlockProps['content'];
  block: Block;
  style: any;
  project?: Project;
  isStatic?: boolean;
  onInlineEdit?: (field: string, value: string) => void;
  children: React.ReactNode;
}> = ({ content, block, style, project, isStatic, onInlineEdit, children }) => (
  <section
    id={block.id}
    className="relative transition-all duration-500 overflow-hidden"
    style={{
      background: 'var(--block-bg)',
      paddingTop: 'var(--block-pt)',
      paddingBottom: 'var(--block-pb)',
      paddingLeft: 'var(--block-px)',
      paddingRight: 'var(--block-px)',
      color: 'var(--block-color)',
    }}
  >
    {content.sectionId && (
      <span id={content.sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
    )}
    <BlockBackground
      backgroundImage={content.backgroundImage}
      backgroundAlt={content.backgroundAlt}
      style={style}
      project={project}
      isStatic={isStatic}
    />
    <div
      className="mx-auto flex flex-col transition-all duration-500 relative z-10"
      style={{
        gap: 'var(--block-gap)',
        alignItems: 'var(--block-items)' as any,
        textAlign: 'var(--block-align)' as any,
      }}
    >
      {content.title && (
        onInlineEdit ? (
          <InlineEditable
            value={content.title || ''}
            onChange={(v) => onInlineEdit('title', v)}
            className="tracking-tight transition-all duration-500 w-full rt-content"
            style={{
              fontSize: 'var(--title-fs)',
              fontWeight: 'var(--title-fw)' as any,
              fontStyle: 'var(--title-fs-style)' as any,
              letterSpacing: 'var(--title-ls)',
              lineHeight: 'var(--title-lh)',
              textTransform: 'var(--title-upper)' as any,
              color: 'inherit'
            }}
            placeholder="Titolo..."
          />
        ) : (
          <div
            className="tracking-tight transition-all duration-500 w-full rt-content"
            style={{
              fontSize: 'var(--title-fs)',
              fontWeight: 'var(--title-fw)' as any,
              fontStyle: 'var(--title-fs-style)' as any,
              letterSpacing: 'var(--title-ls)',
              lineHeight: 'var(--title-lh)',
              textTransform: 'var(--title-upper)' as any,
              color: 'inherit'
            }}
            dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
          />
        )
      )}
      {children}
    </div>
  </section>
);

// ─── ACCORDION — Stripe/Linear style with +/- icon ─────────────────────
const AccordionVariant: React.FC<{ items: FAQBlockProps['content']['items']; blockColor: string; blockId: string }> = ({ items, blockColor, blockId }) => (
  <>
    <div className="w-full" style={{ maxWidth: 'var(--block-max-width)' }}>
      {items.map((item, index) => (
        <details
          key={index}
          className="group border-b last:border-b-0 transition-colors"
          style={{ borderColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}
        >
          <summary
            className="list-none cursor-pointer w-full flex items-center justify-between py-6 gap-4 transition-all"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{ fontSize: 'var(--item-title-fs)', fontWeight: 'var(--item-title-fw)', fontStyle: 'var(--item-title-is)', color: blockColor }}
              className="flex-1 rt-content transition-opacity opacity-90 group-hover:opacity-100"
              dangerouslySetInnerHTML={{ __html: formatRichText(item.question) }}
            />
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-all" style={{ background: 'color-mix(in srgb, currentColor 8%, transparent)' }}>
              <Plus size={14} className="block group-open:hidden" style={{ color: blockColor, opacity: 0.5 }} />
              <Minus size={14} className="hidden group-open:block" style={{ color: blockColor, opacity: 0.5 }} />
            </div>
          </summary>
          <div className="pb-6 pr-12" style={{ textAlign: 'left' }}>
            <div
              style={{ fontSize: 'var(--faq-a-fs)', fontWeight: 'var(--faq-a-fw)' as any, color: blockColor, opacity: 0.6 }}
              className="rt-content leading-[1.8]"
              dangerouslySetInnerHTML={{ __html: formatRichText(item.answer) }}
            />
          </div>
        </details>
      ))}
    </div>
    <style>{`
      #${blockId.replace(/([^\w-])/g, '\\\\$1')} details summary::-webkit-details-marker { display: none; }
    `}</style>
  </>
);

// ─── CLASSIC — Original rounded container with chevron ──────────────────
const ClassicVariant: React.FC<{ items: FAQBlockProps['content']['items']; blockColor: string; blockId: string }> = ({ items, blockColor, blockId }) => (
  <>
    <div
      className="w-full rounded-[2rem] overflow-hidden"
      style={{ maxWidth: 'var(--block-max-width)', background: 'color-mix(in srgb, currentColor 4%, transparent)', border: '1px solid color-mix(in srgb, currentColor 6%, transparent)' }}
    >
      {items.map((item, index) => (
        <details
          key={index}
          className="group transition-all duration-300 border-b last:border-b-0"
          style={{ borderColor: 'color-mix(in srgb, currentColor 6%, transparent)' }}
        >
          <summary
            className="list-none cursor-pointer w-full flex items-center justify-between py-6 px-7 gap-4 transition-all"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{ fontSize: 'var(--item-title-fs)', fontWeight: 'var(--item-title-fw)', fontStyle: 'var(--item-title-is)', color: blockColor }}
              className="flex-1 rt-content transition-opacity opacity-85 group-hover:opacity-100"
              dangerouslySetInnerHTML={{ __html: formatRichText(item.question) }}
            />
            <ChevronDown
              size={18}
              className="shrink-0 transition-transform duration-300 opacity-35 group-hover:opacity-70 group-open:rotate-180 group-open:opacity-70"
              style={{ color: 'currentColor' }}
            />
          </summary>
          <div className="px-7 pb-6" style={{ textAlign: 'left' }}>
            <div
              style={{ fontSize: 'var(--faq-a-fs)', fontWeight: 'var(--faq-a-fw)' as any, color: blockColor, opacity: 0.6 }}
              className="rt-content leading-[1.8]"
              dangerouslySetInnerHTML={{ __html: formatRichText(item.answer) }}
            />
          </div>
        </details>
      ))}
    </div>
    <style>{`
      #${blockId.replace(/([^\w-])/g, '\\\\$1')} details summary::-webkit-details-marker { display: none; }
      #${blockId.replace(/([^\w-])/g, '\\\\$1')} details[open] { background: color-mix(in srgb, currentColor 3%, transparent); }
    `}</style>
  </>
);

// ─── SIDE BY SIDE — Vercel docs style ──────────────────────────────────
const SideBySideVariant: React.FC<{ items: FAQBlockProps['content']['items']; blockColor: string; viewport?: string }> = ({ items, blockColor, viewport }) => {
  const isMobile = viewport === 'mobile';
  return (
    <div className="w-full" style={{ maxWidth: 'var(--block-max-width)' }}>
      {items.map((item, index) => (
        <div
          key={index}
          className={isMobile
            ? "flex flex-col gap-2 py-5 first:pt-0 last:pb-0 border-b last:border-b-0"
            : "grid grid-cols-[2fr_3fr] gap-12 py-7 first:pt-0 last:pb-0 border-b last:border-b-0"
          }
          style={{ borderColor: 'color-mix(in srgb, currentColor 8%, transparent)' }}
        >
          <div
            style={{ fontSize: 'var(--item-title-fs)', fontWeight: 'var(--item-title-fw)', color: blockColor }}
            className="rt-content"
            dangerouslySetInnerHTML={{ __html: formatRichText(item.question) }}
          />
          <div
            style={{ fontSize: 'var(--faq-a-fs)', fontWeight: 'var(--faq-a-fw)' as any, color: blockColor, opacity: 0.6 }}
            className="rt-content leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: formatRichText(item.answer) }}
          />
        </div>
      ))}
    </div>
  );
};

// ─── NUMBERED — Minimal with accent numbers ────────────────────────────
const NumberedVariant: React.FC<{ items: FAQBlockProps['content']['items']; blockColor: string }> = ({ items, blockColor }) => (
  <div className="w-full" style={{ maxWidth: 'var(--block-max-width)' }}>
    {items.map((item, index) => (
      <div
        key={index}
        className="flex gap-6 py-7 first:pt-0 last:pb-0 border-b last:border-b-0"
        style={{ borderColor: 'color-mix(in srgb, currentColor 8%, transparent)' }}
      >
        <span
          className="text-3xl font-black tabular-nums shrink-0 leading-none pt-1"
          style={{ color: blockColor, opacity: 0.12 }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <div
            style={{ fontSize: 'var(--item-title-fs)', fontWeight: 'var(--item-title-fw)', color: blockColor }}
            className="rt-content mb-2"
            dangerouslySetInnerHTML={{ __html: formatRichText(item.question) }}
          />
          <div
            style={{ fontSize: 'var(--faq-a-fs)', fontWeight: 'var(--faq-a-fw)' as any, color: blockColor, opacity: 0.55 }}
            className="rt-content leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: formatRichText(item.answer) }}
          />
        </div>
      </div>
    ))}
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────
export const FAQBlock: React.FC<FAQBlockProps> = ({ content, block, project, viewport, isStatic, onInlineEdit }) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const items = content.items || [];
  const blockColor = 'var(--block-color)';
  const variant = content.variant || 'accordion';

  if (items.length === 0) {
    return (
      <FAQWrapper content={content} block={block} style={style} project={project} isStatic={isStatic} onInlineEdit={onInlineEdit}>
        <div className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px] opacity-20">
          Nessuna domanda aggiunta
        </div>
      </FAQWrapper>
    );
  }

  return (
    <FAQWrapper content={content} block={block} style={style} project={project} isStatic={isStatic} onInlineEdit={onInlineEdit}>
      {variant === 'accordion' && <AccordionVariant items={items} blockColor={blockColor} blockId={block.id} />}
      {variant === 'classic' && <ClassicVariant items={items} blockColor={blockColor} blockId={block.id} />}
      {variant === 'side-by-side' && <SideBySideVariant items={items} blockColor={blockColor} viewport={viewport} />}
      {variant === 'numbered' && <NumberedVariant items={items} blockColor={blockColor} />}
    </FAQWrapper>
  );
};
