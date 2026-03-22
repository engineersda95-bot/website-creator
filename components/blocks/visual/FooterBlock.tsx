import React from 'react';
import { cn, toPx, formatLink } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { Project, Block, Page } from '@/types/editor';
import {
   Facebook,
   Instagram,
   Linkedin,
   Mail,
   Phone
} from 'lucide-react';

const BrandX = ({ size = 20 }: { size?: number }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
   </svg>
);

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
      copyright?: string;
      socialLinks?: Array<{ platform: string; url: string }>;
      links?: Array<{ label: string; url: string }>;
   };
   block: Block;
   project?: Project;
   allPages?: Page[];
   viewport?: string;
   isStatic?: boolean;
}

export const FooterBlock: React.FC<FooterProps> = ({ 
  content, 
  block, 
  project, 
  allPages,
  viewport,
  isStatic
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
         className={cn("w-full transition-all duration-300 mx-auto overflow-hidden")}
         style={{
            backgroundColor: 'var(--block-bg)',
            color: 'var(--block-color)',
            paddingTop: 'var(--block-pt)',
            paddingBottom: 'var(--block-pb)',
          }}
      >
         <div className={cn(
            "w-full max-w-7xl mx-auto px-8 flex flex-col gap-12",
         )} style={{
            alignItems: 'var(--block-items)' as any,
            textAlign: 'var(--block-align)' as any
         }}>
            {isCentered ? (
               /* CENTERED LAYOUT (Stacked) */
               <div className="flex flex-col items-center gap-8 w-full">
                  {content.showLogo !== false && (
                     <div className="flex flex-col items-center gap-3">
                        {(content.logoType === 'image' || content.logoType === 'both') && displayLogoImage && (
                           <img src={displayLogoImage} alt="Logo" style={{ height: 'var(--logo-fs)', width: 'auto' }} className="object-contain shrink-0" />
                        )}
                        {content.logoType !== 'image' && (
                           <div className="font-black tracking-tighter" style={{ fontSize: 'var(--logo-text-fs)', color: 'inherit' }}>
                              {content.logoText || (project?.name ? project.name : 'SitiVetrina')}
                           </div>
                         )}
                      </div>
                   )}

                   {content.socialLinks && content.socialLinks.length > 0 && (
                      <div className="flex gap-8 items-center justify-center">
                         {content.socialLinks.map((social, i) => {
                            const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Mail;
                            return (
                               <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 hover:scale-110 transition-all text-inherit">
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

                   <ul className="flex flex-col items-center gap-3 list-none p-0 m-0">
                      {links.map((link, i) => (
                         <li key={i}>
                            <a href={link.url} className="opacity-70 hover:opacity-100 transition-opacity no-underline text-inherit font-medium" style={{ fontSize: 'var(--base-fs)' }}>
                               {link.label}
                            </a>
                         </li>
                      ))}
                   </ul>

                   <p className="opacity-50 text-xs tracking-widest uppercase font-bold" style={{ fontSize: 'var(--copyright-fs)' }}>
                      {content.copyright || `© ${new Date().getFullYear()} ${project?.name || 'SitiVetrina'}`}
                   </p>
                </div>
            ) : (
               /* GRID LAYOUT (Left/Right) */
               <div className={cn(
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 w-full items-start",
                  style.align === 'right' ? "text-right" : "text-left"
               )}>
                  <div className={cn(
                    "lg:col-span-2 space-y-6 flex flex-col", 
                    style.align === 'right' ? "items-end order-1 lg:order-4" : "items-start order-1"
                  )}>
                     {content.showLogo !== false && (
                        <div className={cn("flex flex-col gap-3", style.align === 'right' ? "items-end" : "items-start")}>
                           {(content.logoType === 'image' || content.logoType === 'both') && displayLogoImage && (
                              <img src={displayLogoImage} alt="Logo" style={{ height: 'var(--logo-fs)', width: 'auto' }} className="object-contain shrink-0" />
                           )}
                           {content.logoType !== 'image' && (
                              <div className="font-black tracking-tighter" style={{ fontSize: 'var(--logo-text-fs)', color: 'inherit' }}>
                                 {content.logoText || (project?.name ? project.name : 'SitiVetrina')}
                              </div>
                           )}
                        </div>
                     )}
                     
                     {content.socialLinks && content.socialLinks.length > 0 && (
                        <div className={cn("flex gap-6 items-center", style.align === 'right' ? "justify-end" : "justify-start")}>
                           {content.socialLinks.map((social, i) => {
                              const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Mail;
                              return (
                                 <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 hover:scale-110 transition-all text-inherit">
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
                  </div>

                  <div className={cn(
                    "space-y-6",
                    style.align === 'right' ? "order-2 lg:order-3" : "order-2"
                  )}>
                     <h4 className="font-bold text-xs uppercase tracking-widest opacity-50">Link Rapidi</h4>
                     <ul className="space-y-3 list-none p-0 m-0">
                        {links.map((link, i) => (
                           <li key={i}>
                              <a href={link.url} className="opacity-70 hover:opacity-100 transition-opacity no-underline text-inherit font-medium text-sm" style={{ fontSize: 'var(--base-fs)' }}>
                                 {link.label}
                              </a>
                           </li>
                        ))}
                     </ul>
                  </div>

                  <div className={cn(
                    "lg:col-span-1 space-y-6 flex flex-col items-center md:items-start",
                    style.align === 'right' ? "order-3 lg:order-1 items-end md:items-end" : "order-3"
                  )}>
                    <p className="opacity-50 text-[10px] tracking-widest uppercase font-bold" style={{ fontSize: 'var(--copyright-fs)' }}>
                      {content.copyright || `© ${new Date().getFullYear()} ${project?.name || 'SitiVetrina'}`}
                    </p>
                  </div>
               </div>
            )}
         </div>
      </footer>
   );
};
