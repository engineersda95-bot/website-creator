
import React from 'react';
import { cn, formatLink, formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block, Page } from '@/types/editor';
import { resolveImageUrl } from '@/lib/image-utils';
import { SitiImage } from '@/components/shared/SitiImage';
import { BACKGROUND_PATTERNS } from '@/lib/background-patterns';
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

const SOCIAL_ICONS: Record<string, any> = {
   facebook: Facebook,
   instagram: Instagram,
   x: BrandX,
   linkedin: Linkedin,
   mail: Mail,
   phone: Phone,
   twitter: BrandX,
};

interface FooterProps {
   content: {
      logoType?: 'text' | 'image' | 'both';
      logoImage?: string;
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
}

export const FooterBlock: React.FC<FooterProps> = ({ 
  content, 
  block, 
  project, 
  allPages,
  viewport,
  isStatic,
  imageMemoryCache
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

   const isCentered = style.align === 'center';

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
            alignItems: 'var(--block-items)' as any,
            textAlign: 'var(--block-align)' as any
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
                                alt="Logo" 
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

                      {content.description && (
                        <div 
                          className="rt-content opacity-70"
                          style={{ fontSize: 'var(--description-fs)', fontWeight: 'var(--description-fw)' as any, fontStyle: 'var(--description-fst)' as any }}
                          dangerouslySetInnerHTML={{ __html: formatRichText(content.description) }}
                        />
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

                  <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 list-none p-0 m-0 pt-4">
                     {links.map((link, i) => (
                        <li key={i}>
                           <a {...formatLink(link.url, isStatic)} className="opacity-70 hover:opacity-100 transition-opacity no-underline text-inherit font-medium border-b border-transparent hover:border-current pb-1" style={{ fontSize: 'var(--base-fs)' }}>
                              {link.label}
                           </a>
                        </li>
                     ))}
                  </ul>
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
                                 alt="Logo" 
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

                     {content.description && (
                        <div 
                          className="rt-content opacity-70 w-full break-words"
                          style={{ fontSize: 'var(--description-fs)', fontWeight: 'var(--description-fw)' as any, fontStyle: 'var(--description-fst)' as any }}
                          dangerouslySetInnerHTML={{ __html: formatRichText(content.description) }}
                        />
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
                      <h4 className="tracking-widest opacity-30" style={{ fontSize: 'var(--links-title-fs)', fontWeight: 'var(--links-title-fw)' as any, fontStyle: 'var(--links-title-fst)' as any }}>
                        {content.linksTitle || 'Link Rapidi'}
                     </h4>
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
