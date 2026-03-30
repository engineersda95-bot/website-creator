
import React from 'react';
import { cn, formatLink, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block, Page } from '@/types/editor';
import { resolveImageUrl } from '@/lib/image-utils';
import { SitiImage } from '@/components/shared/SitiImage';
import { BACKGROUND_PATTERNS } from '@/lib/background-patterns';
import { InlineEditable } from '@/components/shared/InlineEditable';
import {
   Facebook,
   Instagram,
   Linkedin,
   Mail,
   Phone
} from 'lucide-react';

const BrandX = ({ size, width, height, style }: any) => {
   const s = size || width || height || 20;
   return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" style={{ ...style, width: s, height: s }}>
         <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
   );
};

const WhatsAppIcon = ({ size, width, height, style }: any) => {
   const s = size || width || height || 20;
   return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" style={{ ...style, width: s, height: s }}>
         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
   );
};

const SOCIAL_ICONS: Record<string, any> = {
   facebook: Facebook,
   instagram: Instagram,
   x: BrandX,
   linkedin: Linkedin,
   mail: Mail,
   phone: Phone,
   twitter: BrandX,
   whatsapp: WhatsAppIcon,
};

interface FooterProps {
   content: {
      logoType?: 'text' | 'image' | 'both';
      logoImage?: string;
      logoAlt?: string;
      logoText?: string;
      showLogo?: boolean;
      description?: string;
      copyright?: string;
      linksTitle?: string;
      socialLinks?: Array<{ platform: string; url: string }>;
      links?: Array<{ label: string; url: string }>;
   };
   block: Block;
   project?: Project;
   allPages?: Page[];
   viewport?: string;
   isStatic?: boolean;
   imageMemoryCache?: Record<string, string>;
   onInlineEdit?: (field: string, value: string) => void;
}

export const FooterBlock: React.FC<FooterProps> = ({ 
  content, 
  block, 
  project, 
  allPages,
  viewport,
  isStatic,
  imageMemoryCache,
  onInlineEdit
}) => {
   const { style } = getBlockStyles(block, project, viewport || 'desktop');

   const navLogoImage = allPages?.flatMap(p => p.blocks).find(b => b.type === 'navigation')?.content?.logoImage;
   const displayLogoImage = content.logoImage || navLogoImage;

   const links = (content.links && content.links.length > 0) 
     ? content.links 
     : (allPages || []).map(p => ({
         label: p.title,
         url: p.slug === 'home' ? '/' : `/${p.slug}`
       }));

    const alignValue = (style.align || 'center').toLowerCase();
    const isCentered = alignValue === 'center' || alignValue === 'centrale';

    return (
       <footer
          className={cn("w-full transition-all duration-300 mx-auto overflow-hidden relative")}
          style={{
             background: 'var(--block-bg)',
             color: 'var(--block-color)',
             paddingTop: 'var(--block-pt)',
             paddingBottom: 'var(--block-pb)',
           }}
       >
          {/* Pattern Layer */}
          {style.patternType && style.patternType !== 'none' && (
            <div 
              className="absolute inset-0 pointer-events-none z-0 background-pattern"
              style={BACKGROUND_PATTERNS.find(p => p.id === style.patternType)?.getStyle(
                style.patternColor || '#ffffff',
                style.patternOpacity || 10,
                style.patternScale || 40
              )}
            />
          )}
          <div className={cn(
             "w-full mx-auto flex flex-col gap-12",
          )} style={{
             maxWidth: 'var(--block-max-width)',
             paddingLeft: 'var(--block-px)',
             paddingRight: 'var(--block-px)',
             alignItems: (isCentered ? 'center' : (alignValue === 'right' ? 'flex-end' : 'flex-start')) as any,
             textAlign: (isCentered ? 'center' : (alignValue === 'right' ? 'right' : 'left')) as any
          }}>
             {isCentered ? (
                /* CENTERED LAYOUT (Stacked) */
                <div className="flex flex-col items-center gap-10 w-full relative z-10">
                   <div className="flex flex-col items-center gap-6 w-full max-w-2xl text-center">
                     {content.showLogo !== false && (
                         <div className="flex flex-col items-center gap-3">
                           {(content.logoType === 'image' || content.logoType === 'both') && displayLogoImage && (
                               <SitiImage 
                                 src={displayLogoImage} 
                                 project={project}
                                 isStatic={isStatic}
                                 imageMemoryCache={imageMemoryCache}
                                 alt={content.logoAlt || content.logoText || 'Logo'} 
                                 style={{ height: 'var(--logo-fs)', width: 'auto' }} 
                                 className="object-contain shrink-0" 
                               />
                           )}
                           {content.logoType !== 'image' && (
                               <div className="font-black tracking-tighter" style={{ fontSize: 'var(--logo-text-fs)', color: 'inherit', fontWeight: 'var(--logo-fw)' as any, fontStyle: 'var(--logo-fst)' as any }}>
                                 {content.logoText || (project?.name ? project.name : 'SitiVetrina')}
                               </div>
                             )}
                         </div>
                       )}

                       {(content.description || onInlineEdit) && (
                         onInlineEdit ? (
                           <InlineEditable
                             value={content.description || ''}
                             onChange={(v) => onInlineEdit('description', v)}
                             className="rt-content opacity-70"
                             style={{ fontSize: 'var(--description-fs)', fontWeight: 'var(--description-fw)' as any, fontStyle: 'var(--description-fst)' as any }}
                             placeholder="Descrizione..."
                             richText
                             multiline
                           />
                         ) : (
                           <div
                             className="rt-content opacity-70"
                             style={{ fontSize: 'var(--description-fs)', fontWeight: 'var(--description-fw)' as any, fontStyle: 'var(--description-fst)' as any }}
                             dangerouslySetInnerHTML={{ __html: formatRichText(content.description) }}
                           />
                         )
                       )}
                   </div>

                   <div className="flex flex-col items-center gap-6 pt-4">
                     {content.socialLinks && content.socialLinks.length > 0 && (
                         <div className="flex gap-8 items-center justify-center">
                           {content.socialLinks.map((social, i) => {
                               const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Mail;
                               return (
                                 <a key={i} {...formatLink(social.url, isStatic)} className="opacity-70 hover:opacity-100 hover:scale-110 transition-all text-inherit">
                                     <Icon 
                                       width="var(--social-icon-size, 20px)" 
                                       height="var(--social-icon-size, 20px)" 
                                       style={{ width: 'var(--social-icon-size, 20px)', height: 'var(--social-icon-size, 20px)' }}
                                     />
                                 </a>
                               );
                           })}
                         </div>
                       )}

                       <p className="opacity-50 text-[10px] tracking-widest uppercase font-bold text-center" style={{ fontSize: 'var(--copyright-fs)', fontWeight: 'var(--copyright-fw)' as any, fontStyle: 'var(--copyright-fst)' as any }}>
                         {content.copyright || `© ${new Date().getFullYear()} ${project?.name || 'SitiVetrina'}`}
                       </p>
                   </div>

                   <div className="flex flex-col items-center gap-6 w-full max-w-2xl text-center pt-4">
                      {content.linksTitle && (
                        <h4 className="tracking-widest opacity-30" style={{ fontSize: 'var(--links-title-fs)', fontWeight: 'var(--links-title-fw)' as any, fontStyle: 'var(--links-title-fst)' as any }}>
                          {content.linksTitle}
                        </h4>
                      )}
                      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 list-none p-0 m-0">
                        {links.map((link, i) => (
                            <li key={i}>
                              <a {...formatLink(link.url, isStatic)} className="opacity-70 hover:opacity-100 transition-opacity no-underline text-inherit font-medium border-b border-transparent hover:border-current pb-1" style={{ fontSize: 'var(--base-fs)' }}>
                                  {link.label}
                              </a>
                            </li>
                        ))}
                      </ul>
                   </div>
                </div>
            ) : (
               /* STACKED LAYOUT (Left/Right) */
               <div className={cn(
                  "flex flex-col gap-12 md:gap-16 lg:gap-24 w-full relative z-10",
                  style.align === 'right' ? "items-end text-right" : "items-start text-left"
               )}>
                  <div className={cn(
                    "w-full space-y-8 flex flex-col", 
                    style.align === 'right' ? "items-end" : "items-start"
                  )}>
                     {content.showLogo !== false && (
                        <div className={cn("flex flex-col gap-3", style.align === 'right' ? "items-end" : "items-start")}>
                           {(content.logoType === 'image' || content.logoType === 'both') && displayLogoImage && (
                              <SitiImage 
                                 src={displayLogoImage} 
                                 project={project}
                                 isStatic={isStatic}
                                 imageMemoryCache={imageMemoryCache}
                                 alt={content.logoAlt || content.logoText || 'Logo'} 
                                 style={{ height: 'var(--logo-fs)', width: 'auto' }} 
                                 className="object-contain shrink-0" 
                              />
                           )}
                           {content.logoType !== 'image' && (
                              <div className="font-black tracking-tighter" style={{ fontSize: 'var(--logo-text-fs)', color: 'inherit', fontWeight: 'var(--logo-fw)' as any, fontStyle: 'var(--logo-fst)' as any }}>
                                 {content.logoText || (project?.name ? project.name : 'SitiVetrina')}
                              </div>
                           )}
                        </div>
                     )}

                     {(content.description || onInlineEdit) && (
                        onInlineEdit ? (
                          <InlineEditable
                            value={content.description || ''}
                            onChange={(v) => onInlineEdit('description', v)}
                            className="rt-content opacity-70 w-full break-words"
                            style={{ fontSize: 'var(--description-fs)', fontWeight: 'var(--description-fw)' as any, fontStyle: 'var(--description-fst)' as any }}
                            placeholder="Descrizione..."
                            richText
                            multiline
                          />
                        ) : (
                          <div
                            className="rt-content opacity-70 w-full break-words"
                            style={{ fontSize: 'var(--description-fs)', fontWeight: 'var(--description-fw)' as any, fontStyle: 'var(--description-fst)' as any }}
                            dangerouslySetInnerHTML={{ __html: formatRichText(content.description) }}
                          />
                        )
                      )}
                     
                     <div className={cn("flex flex-col gap-6 w-full", style.align === 'right' ? "items-end" : "items-start")}>
                        {content.socialLinks && content.socialLinks.length > 0 && (
                          <div className={cn("flex gap-6 items-center", style.align === 'right' ? "justify-end" : "justify-start")}>
                              {content.socialLinks.map((social, i) => {
                                 const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Mail;
                                 return (
                                    <a key={i} {...formatLink(social.url, isStatic)} className="opacity-70 hover:opacity-100 hover:scale-110 transition-all text-inherit">
                                       <Icon 
                                          width="var(--social-icon-size, 20px)" 
                                          height="var(--social-icon-size, 20px)" 
                                          style={{ width: 'var(--social-icon-size, 20px)', height: 'var(--social-icon-size, 20px)' }}
                                       />
                                    </a>
                                 );
                              })}
                          </div>
                        )}

                        <p className="opacity-50 text-[10px] tracking-widest uppercase" style={{ fontSize: 'var(--copyright-fs)', fontWeight: 'var(--copyright-fw)' as any, fontStyle: 'var(--copyright-fst)' as any }}>
                          {content.copyright || `© ${new Date().getFullYear()} ${project?.name || 'SitiVetrina'}`}
                        </p>
                     </div>
                  </div>

                  <div className={cn(
                    "w-full space-y-8 flex flex-col",
                    style.align === 'right' ? "items-end" : "items-start"
                  )}>
                      {content.linksTitle && (
                        <h4 className="tracking-widest opacity-30" style={{ fontSize: 'var(--links-title-fs)', fontWeight: 'var(--links-title-fw)' as any, fontStyle: 'var(--links-title-fst)' as any }}>
                          {content.linksTitle}
                        </h4>
                      )}
                     <ul className={cn("flex flex-col gap-4 list-none p-0 m-0 w-full", style.align === 'right' ? "items-end text-right" : "items-start text-left")}>
                        {links.map((link, i) => (
                           <li key={i} className="w-full">
                              <a {...formatLink(link.url, isStatic)} className="opacity-70 hover:opacity-100 transition-opacity no-underline text-inherit font-medium text-sm border-b border-transparent hover:border-current pb-1 inline-block break-words" style={{ fontSize: 'var(--base-fs)' }}>
                                 {link.label}
                              </a>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            )}
         </div>
      </footer>
   );
};
