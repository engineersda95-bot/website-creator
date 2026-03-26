

import React from 'react';
import { cn, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { ChevronDown } from 'lucide-react';
import { BlockBackground } from '@/components/shared/BlockBackground';

interface FAQBlockProps {
  content: {
    title?: string;
    items: Array<{ question: string; answer: string }>;
    backgroundImage?: string;
  };
  block: Block;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
}

export const FAQBlock: React.FC<FAQBlockProps> = ({ content, block, project, viewport, isStatic }) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const items = content.items || [];
  const blockColor = 'var(--block-color)';

  return (
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
      {(content as any).sectionId && (
        <span id={(content as any).sectionId} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      <BlockBackground
        backgroundImage={content.backgroundImage}
        backgroundAlt={(content as any).backgroundAlt}
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
        {content.title && (() => {
          const TitleTag = (style.titleTag || 'h2') as any;
          return (
            <TitleTag
              className="tracking-tight transition-all duration-500 w-full"
              style={{
                fontSize: 'var(--title-fs)',
                fontWeight: 'var(--title-fw)' as any,
                fontStyle: 'var(--title-fs-style)' as any,
                letterSpacing: 'var(--title-ls)',
                lineHeight: 'var(--title-lh)',
                textTransform: 'var(--title-upper)' as any,
                marginBottom: '0'
              }}
              dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
            />
          );
        })()}

        <div
          className="w-full bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden divide-y divide-white/5"
          style={{
            maxWidth: 'var(--block-max-width)',
          }}
        >
          {items.map((item, index) => (
            <details
              key={index}
              className="group transition-all duration-300"
            >
              <summary
                className="list-none cursor-pointer w-full flex items-center justify-between py-8 px-8 group transition-all"
                style={{ textAlign: 'left' }}
              >
                {(() => {
                  const ItemTitleTag = (style.itemTitleTag || 'h3') as any;
                  return (
                    <ItemTitleTag
                      style={{
                        fontSize: 'var(--item-title-fs)',
                        fontWeight: 'var(--item-title-fw)',
                        fontStyle: 'var(--item-title-is)',
                        color: blockColor,
                        textAlign: 'left'
                      }}
                      className="transition-all opacity-80 group-hover:opacity-100 flex-1 pr-6"
                      dangerouslySetInnerHTML={{ __html: formatRichText(item.question) }}
                    />
                  );
                })()}
                <ChevronDown
                  className="w-6 h-6 shrink-0 transition-all duration-500 ease-out opacity-40 group-hover:opacity-100 group-open:rotate-180 group-open:opacity-100"
                  style={{ color: 'currentColor' }}
                />
              </summary>
              <div
                className="overflow-hidden transition-all px-8 pb-10"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    fontSize: 'var(--faq-a-fs)',
                    fontWeight: 'var(--faq-a-fw)' as any,
                    color: blockColor,
                    opacity: 0.75,
                    textAlign: 'left'
                  }}
                  className="rt-content leading-relaxed max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatRichText(item.answer) }}
                />
              </div>
            </details>
          ))}

          {items.length === 0 && (
            <div className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px] opacity-20">
              Nessuna domanda aggiunta
            </div>
          )}
        </div>
      </div>

      <style>{`
        details summary::-webkit-details-marker {
          display: none;
        }
        details[open] {
          background-color: rgba(255, 255, 255, 0.04);
        }
        details:hover:not([open]) {
          background-color: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </section>
  );
};
