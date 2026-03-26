

import React from 'react';
import { cn, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block } from '@/types/editor';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BlockBackground } from '@/components/shared/BlockBackground';

interface ContactBlockProps {
  content: {
    title?: string;
    subtitle?: string;
    email?: string;
    phone?: string;
    address?: string;
    showMap?: boolean;
    backgroundImage?: string;
  };
  block: Block;
  project?: Project;
  viewport?: string;
  isStatic?: boolean;
}

export const ContactBlock: React.FC<ContactBlockProps> = ({ content, block, project, viewport, isStatic }) => {
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

  return (
    <section 
      id={block.id}
      className={cn("w-full transition-all duration-500 overflow-hidden flex flex-col relative")}
      style={{
        ...style as any,
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
                <TitleTag className="tracking-tighter leading-[0.9]" 
                    style={{ 
                      fontSize: 'var(--title-fs)', 
                      fontWeight: 'var(--title-fw)' as any,
                      fontStyle: 'var(--title-fs-style)' as any,
                      textAlign: 'inherit'
                    }} 
                    dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }} 
                />
              )}
              {content.subtitle && (
                <p className="opacity-60 leading-relaxed max-w-2xl" 
                   style={{ 
                     fontSize: 'var(--subtitle-fs)',
                     fontWeight: 'var(--subtitle-fw)' as any,
                     fontStyle: 'var(--subtitle-fs-style)' as any,
                     textAlign: 'inherit',
                     // Utilizziamo le variabili responsive per centrare anche in statico
                     marginLeft: 'var(--block-ml-auto)',
                     marginRight: 'var(--block-mr-auto)',
                   }}
                   dangerouslySetInnerHTML={{ __html: formatRichText(content.subtitle) }} 
                />
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
                  <div className="flex items-center gap-4 group">
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
                  <div className="flex items-center gap-4 group">
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
                {content.address && (
                  <div className="flex items-center gap-4 group">
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
            className="w-full aspect-video overflow-hidden relative shadow-sm border border-black/5"
            style={{ 
              maxWidth: 'var(--map-width)',
              marginLeft: 'var(--block-ml-auto)',
              marginRight: 'var(--block-mr-auto)',
              borderRadius: 'var(--block-radius, 24px)'
            }}
          >
            <iframe 
              src={mapUrl} 
              className="w-full h-full grayscale-[0.2] filter hover:grayscale-0 transition-all duration-700" 
              frameBorder="0" 
              scrolling="no" 
            ></iframe>
          </div>
        )}
      </div>
    </section>
  );
};
