import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { resolveImageUrl } from '@/lib/image-utils';

export const PdfBlock = ({ block, project, isStatic, viewport }: any) => {
  const { content } = block;
  const { style, isDark } = getBlockStyles(block, project, viewport);
  
  const { 
    url = '', 
    title = 'Il nostro catalogo', 
    subtitle = 'Scarica o visualizza il PDF completo',
    ctaLabel = 'Apri PDF',
  } = content;

  const pdfUrl = url;
  
  // LOGICA DI TRASFORMAZIONE ROBUSTA PER GOOGLE DRIVE
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    
    // Gestione link Google Drive
    if (rawUrl.includes('drive.google.com')) {
      // Caso 1: /file/d/ID/view... o /edit...
      if (rawUrl.includes('/file/d/')) {
        const fileId = rawUrl.split('/file/d/')[1]?.split('/')[0]?.split('?')[0];
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      // Caso 2: ?id=ID
      if (rawUrl.includes('?id=')) {
        const fileId = new URL(rawUrl).searchParams.get('id');
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(pdfUrl);
  
  // LOGICA PER COLORE AUTOMATICO: Segue il pattern del blocco Hero
  const hasBg = !!content.backgroundImage || (style.bgType === 'solid' && style.backgroundColor && style.backgroundColor !== 'transparent');

  const containerStyle = {
    paddingTop: 'var(--block-pt)',
    paddingBottom: 'var(--block-pb)',
    paddingLeft: 'var(--block-px)',
    paddingRight: 'var(--block-px)',
    background: style.background || 'var(--block-bg)',
    backgroundColor: style.backgroundColor || 'var(--block-bg)',
    color: style.textColor || (hasBg ? '#ffffff' : 'inherit'),
    textAlign: 'var(--block-align, center)' as any,
    marginTop: 'var(--block-mt, 0)',
    marginBottom: 'var(--block-mb, 0)',
  };

  const titleStyle = {
    fontSize: 'var(--title-fs)',
    fontWeight: 'var(--title-fw)' as any,
    fontStyle: 'var(--title-fs-style)' as any,
    letterSpacing: 'var(--title-ls)',
    lineHeight: 'var(--title-lh)',
    textTransform: 'var(--title-upper)' as any,
    color: 'inherit',
    textAlign: 'inherit' as any,
  };

  const subtitleStyle = {
    fontSize: 'var(--subtitle-fs)',
    fontWeight: 'var(--subtitle-fw)' as any,
    fontStyle: 'var(--subtitle-fs-style)' as any,
    textTransform: 'var(--subtitle-upper)' as any,
    color: 'inherit',
    opacity: 0.9,
    textAlign: 'inherit' as any,
    marginLeft: 'var(--block-ml-auto)',
    marginRight: 'var(--block-mr-auto)',
  };

  const embedContainerStyle = {
    height: 'var(--embed-height, 800px)',
    marginLeft: 'var(--block-ml-auto)',
    marginRight: 'var(--block-mr-auto)',
  };

  return (
    <section 
      style={containerStyle} 
      className={cn(
        "w-full relative overflow-hidden group/pdf transition-all duration-500",
        hasBg && !style.textColor && "text-white"
      )}
    >
      <BlockBackground 
        backgroundImage={content.backgroundImage} 
        backgroundAlt={content.backgroundAlt}
        style={style} 
        project={project} 
        isStatic={isStatic} 
        imageMemoryCache={undefined}
      />
      
      <div className="max-w-[var(--container-width,100%)] mx-auto relative z-10">
        {(title || subtitle) && (
          <div className="mb-12 last:mb-0 flex flex-col w-full" style={{ alignItems: 'var(--block-items)' as any }}>
            {title && (
              <div 
                style={titleStyle} 
                className="mb-4 w-full rt-content"
                dangerouslySetInnerHTML={{ __html: formatRichText(title) }}
              />
            )}
            {subtitle && (
              <div 
                style={subtitleStyle} 
                className="max-w-2xl rt-content"
                dangerouslySetInnerHTML={{ __html: formatRichText(subtitle) }}
              />
            )}
          </div>
        )}

        {pdfUrl ? (
          <div className={cn("relative rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm", (title || subtitle) && "mt-8")} style={embedContainerStyle}>
            <iframe
              src={embedUrl}
              className="w-full h-full border-none"
              title={title || 'PDF Viewer'}
              allow="autoplay"
            />
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center opacity-30 italic text-sm">
             Carica un link PDF per visualizzare l'anteprima
          </div>
        )}
      </div>
    </section>
  );
};
