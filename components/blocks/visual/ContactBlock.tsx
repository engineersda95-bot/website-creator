

import React from 'react';
import { cn, formatRichText, normalizeWhatsAppUrl } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { Mail, Phone, MapPin } from 'lucide-react';

const WhatsAppIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';

interface ContactBlockProps {
  content: {
    title?: string;
    subtitle?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    showMap?: boolean;
    backgroundImage?: string;
  };
  block: Block;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
  onInlineEdit?: (field: string, value: string) => void;
}

export const ContactBlock: React.FC<ContactBlockProps> = ({ content, block, project, viewport, isStatic, onInlineEdit }) => {
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  
  // Mappa visibile se c'è un indirizzo e showMap non è esplicitamente falso
  const isMapVisible = content.address && content.showMap !== false;
  const mapUrl = content.address ? `https://maps.google.com/maps?q=${encodeURIComponent(content.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : null;

  // Utilizziamo le variabili dello style mapper direttamente
  const contactStyles = !isStatic ? {
    '--icon-size': `${style.iconSize || 20}px`,
    '--map-width': `${style.mapWidth !== undefined ? style.mapWidth : 100}%`,
    '--block-gap': `${style.gap !== undefined ? style.gap : 64}px`,
  } : {} as React.CSSProperties;

  // Destrutturiamo per evitare conflitti shorthand/longhand (fix console error)
  const { 
    padding, paddingLeft, paddingRight, paddingTop, paddingBottom,
    margin, marginLeft, marginRight, marginTop, marginBottom,
    background, backgroundColor,
    ...safeStyle
  } = style as any;

  const alignment = style.align || 'center';

  // Animation attributes
  const animType = style.animationType || 'none';
  const animDuration = style.animationDuration || 0.8;
  const baseDelay = style.animationDelay || 0;
  const animKey = !isStatic ? `${block.id}-${animType}-${animDuration}-${baseDelay}` : 'static';

  return (
    <section 
      key={animKey}
      id={block.id}
      className={cn(
        "w-full overflow-hidden flex flex-col relative",
        alignment === 'center' ? "mx-auto" : alignment === 'right' ? "ml-auto mr-0" : "ml-0 mr-auto"
      )}
      style={{
        ...contactStyles,
        background: 'var(--block-bg)',
        color: 'var(--block-color)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        paddingLeft: 'var(--block-px)',
        paddingRight: 'var(--block-px)',
        marginTop: 'var(--block-mt)',
        marginBottom: 'var(--block-mb)',
        marginLeft: 'var(--block-ml)',
        marginRight: 'var(--block-mr)',
        alignItems: 'var(--block-items)' as any,
        textAlign: 'var(--block-align)' as any,
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
        className={cn("w-full flex flex-col relative z-10")}
        style={{ 
            gap: 'var(--block-gap)',
            alignItems: 'var(--block-items)' as any,
        }}
      >
        {/* Header */}
        {(content.title || content.subtitle) && (() => {
          const TitleTag = (style.titleTag || 'h2') as any;
          return (
            <div className="w-full flex flex-col" style={{ gap: '1rem', alignItems: 'inherit' }}>
              {content.title && (
                <div
                  data-siti-anim={animType}
                  data-siti-anim-duration={animDuration}
                  data-siti-anim-delay={baseDelay}
                  style={{
                    '--siti-anim-duration': animDuration + 's',
                    '--siti-anim-delay': baseDelay + 's'
                  } as any}
                  className="w-full"
                >
                  {onInlineEdit ? (
                    <InlineEditable
                      fieldId="title"
                      value={content.title || ''}
                      onChange={(v) => onInlineEdit('title', v)}
                      className="tracking-tighter leading-[0.9] rt-content"
                      style={{
                        fontSize: 'var(--title-fs)',
                        fontWeight: 'var(--title-fw)' as any,
                        fontStyle: 'var(--title-fs-style)' as any,
                        textAlign: 'inherit',
                        color: 'inherit'
                      }}
                      placeholder="Titolo..."
                    />
                  ) : (
                    <div className="tracking-tighter leading-[0.9] rt-content"
                        style={{
                          fontSize: 'var(--title-fs)',
                          fontWeight: 'var(--title-fw)' as any,
                          fontStyle: 'var(--title-fs-style)' as any,
                          textAlign: 'inherit',
                          color: 'inherit'
                        }}
                        dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }}
                    />
                  )}
                </div>
              )}
              {content.subtitle && (
                <div
                  data-siti-anim={animType}
                  data-siti-anim-duration={animDuration}
                  data-siti-anim-delay={baseDelay + 0.1}
                  style={{
                    '--siti-anim-duration': animDuration + 's',
                    '--siti-anim-delay': (baseDelay + 0.1) + 's'
                  } as any}
                  className="w-full"
                >
                  {onInlineEdit ? (
                    <InlineEditable
                      fieldId="subtitle"
                      value={content.subtitle || ''}
                      onChange={(v) => onInlineEdit('subtitle', v)}
                      className="opacity-60 leading-relaxed max-w-2xl rt-content"
                      style={{
                        fontSize: 'var(--subtitle-fs)',
                        fontWeight: 'var(--subtitle-fw)' as any,
                        fontStyle: 'var(--subtitle-fs-style)' as any,
                        textAlign: 'inherit',
                        color: 'inherit',
                        marginLeft: 'var(--block-ml-auto)',
                        marginRight: 'var(--block-mr-auto)',
                      }}
                      placeholder="Sottotitolo..."
                      richText
                      multiline
                    />
                  ) : (
                    <div className="opacity-60 leading-relaxed max-w-2xl rt-content"
                       style={{
                         fontSize: 'var(--subtitle-fs)',
                         fontWeight: 'var(--subtitle-fw)' as any,
                         fontStyle: 'var(--subtitle-fs-style)' as any,
                         textAlign: 'inherit',
                         color: 'inherit',
                         marginLeft: 'var(--block-ml-auto)',
                         marginRight: 'var(--block-mr-auto)',
                       }}
                       dangerouslySetInnerHTML={{ __html: formatRichText(content.subtitle) }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Info Grid (Row or Stacked) */}
        <div className={cn(
          "flex flex-wrap w-full",
          "justify-[var(--block-justify)]"
        )} style={{ 
            gap: 'calc(var(--block-gap) / 1.5)',
            justifyContent: 'var(--block-justify)' as any
        }}>
          {(() => {
            const LabelTag = (style.itemTitleTag || 'h3') as any;
            return (
              <>
                {content.email && (
                  <div 
                    className="flex items-center gap-4 group"
                    data-siti-anim={animType}
                    data-siti-anim-duration={animDuration}
                    data-siti-anim-delay={baseDelay + 0.15}
                    style={{
                      '--siti-anim-duration': animDuration + 's',
                      '--siti-anim-delay': (baseDelay + 0.15) + 's'
                    } as any}
                  >
                    <div className="flex items-center justify-center shrink-0" style={{ color: 'inherit', width: 'var(--icon-size)', height: 'var(--icon-size)' }}>
                      <Mail size={parseInt(String(style.iconSize || 20))} />
                    </div>
                    <div style={{ textAlign: 'var(--block-align)' as any }}>
                      <LabelTag className="uppercase font-black text-inherit opacity-40 block tracking-widest leading-none mb-1" 
                            style={{ 
                              fontSize: 'var(--label-fs)', 
                              fontWeight: 'var(--label-fw)' as any,
                              fontStyle: 'var(--label-is)' as any
                            }}>E-mail</LabelTag>
                      <a href={`mailto:${content.email}`} className="hover:underline transition-all block leading-tight"
                         style={{ 
                           fontSize: 'var(--value-fs)', 
                           fontWeight: 'var(--value-fw)' as any,
                           fontStyle: 'var(--value-is)' as any
                         }}>{content.email}</a>
                    </div>
                  </div>
                )}
                {content.phone && (
                  <div 
                    className="flex items-center gap-4 group"
                    data-siti-anim={animType}
                    data-siti-anim-duration={animDuration}
                    data-siti-anim-delay={baseDelay + 0.2}
                    style={{
                      '--siti-anim-duration': animDuration + 's',
                      '--siti-anim-delay': (baseDelay + 0.2) + 's'
                    } as any}
                  >
                    <div className="flex items-center justify-center shrink-0" style={{ color: 'inherit', width: 'var(--icon-size)', height: 'var(--icon-size)' }}>
                      <Phone size={parseInt(String(style.iconSize || 20))} />
                    </div>
                    <div style={{ textAlign: 'var(--block-align)' as any }}>
                      <LabelTag className="uppercase font-black text-inherit opacity-40 block tracking-widest leading-none mb-1"
                            style={{ 
                              fontSize: 'var(--label-fs)', 
                              fontWeight: 'var(--label-fw)' as any,
                              fontStyle: 'var(--label-is)' as any
                            }}>Telefono</LabelTag>
                      <a href={`tel:${content.phone}`} className="hover:underline transition-all block leading-tight"
                         style={{ 
                           fontSize: 'var(--value-fs)', 
                           fontWeight: 'var(--value-fw)' as any,
                           fontStyle: 'var(--value-is)' as any
                         }}>{content.phone}</a>
                    </div>
                  </div>
                )}
                {content.whatsapp && (
                  <div
                    className="flex items-center gap-4 group"
                    data-siti-anim={animType}
                    data-siti-anim-duration={animDuration}
                    data-siti-anim-delay={baseDelay + 0.25}
                    style={{
                      '--siti-anim-duration': animDuration + 's',
                      '--siti-anim-delay': (baseDelay + 0.25) + 's'
                    } as any}
                  >
                    <div className="flex items-center justify-center shrink-0" style={{ color: 'inherit', width: 'var(--icon-size)', height: 'var(--icon-size)' }}>
                      <WhatsAppIcon size={parseInt(String(style.iconSize || 20))} />
                    </div>
                    <div style={{ textAlign: 'var(--block-align)' as any }}>
                      <LabelTag className="uppercase font-black text-inherit opacity-40 block tracking-widest leading-none mb-1"
                            style={{
                              fontSize: 'var(--label-fs)',
                              fontWeight: 'var(--label-fw)' as any,
                              fontStyle: 'var(--label-is)' as any
                            }}>WhatsApp</LabelTag>
                      <a href={normalizeWhatsAppUrl(content.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:underline transition-all block leading-tight"
                         style={{
                           fontSize: 'var(--value-fs)',
                           fontWeight: 'var(--value-fw)' as any,
                           fontStyle: 'var(--value-is)' as any
                         }}>{content.whatsapp}</a>
                    </div>
                  </div>
                )}
                {content.address && (
                  <div
                    className="flex items-center gap-4 group"
                    data-siti-anim={animType}
                    data-siti-anim-duration={animDuration}
                    data-siti-anim-delay={baseDelay + 0.3}
                    style={{
                      '--siti-anim-duration': animDuration + 's',
                      '--siti-anim-delay': (baseDelay + 0.3) + 's'
                    } as any}
                  >
                    <div className="flex items-center justify-center shrink-0" style={{ color: 'inherit', width: 'var(--icon-size)', height: 'var(--icon-size)' }}>
                      <MapPin size={parseInt(String(style.iconSize || 20))} />
                    </div>
                    <div style={{ textAlign: 'var(--block-align)' as any }}>
                      <LabelTag className="uppercase font-black text-inherit opacity-40 block tracking-widest leading-none mb-1"
                            style={{ 
                              fontSize: 'var(--label-fs)', 
                              fontWeight: 'var(--label-fw)' as any,
                              fontStyle: 'var(--label-is)' as any
                            }}>Indirizzo</LabelTag>
                      <p className="block leading-tight" style={{ 
                        fontSize: 'var(--value-fs)', 
                        fontWeight: 'var(--value-fw)' as any,
                        fontStyle: 'var(--value-is)' as any
                      }}>{content.address}</p>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Map Section - Always BELOW and Centered/Aligned */}
        {isMapVisible && mapUrl && (
          <div 
            data-siti-anim={animType}
            data-siti-anim-duration={animDuration}
            data-siti-anim-delay={baseDelay + 0.3}
            className="w-full aspect-video overflow-hidden relative shadow-sm border border-black/5"
            style={{ 
              maxWidth: 'var(--map-width)',
              marginLeft: 'var(--block-ml-auto)',
              marginRight: 'var(--block-mr-auto)',
              borderRadius: 'var(--block-radius, 24px)',
              '--siti-anim-duration': animDuration + 's',
              '--siti-anim-delay': (baseDelay + 0.3) + 's'
            } as any}
          >
            <iframe 
              src={mapUrl} 
              title="Mappa di Google"
              className="w-full h-full grayscale-[0.2] filter hover:grayscale-0 transition-[filter] duration-700" 
              frameBorder="0" 
              scrolling="no" 
            ></iframe>
          </div>
        )}
      </div>
    </section>
  );
};
