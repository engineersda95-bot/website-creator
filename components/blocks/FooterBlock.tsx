import React from 'react';
import { cn, toPx } from '@/lib/utils';
import { Project } from '@/types/editor';
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
   style: any;
   project?: Project;
   allPages?: any[];
}

const SOCIAL_ICONS: Record<string, any> = {
   facebook: Facebook,
   instagram: Instagram,
   x: BrandX,
   linkedin: Linkedin,
   mail: Mail,
   phone: Phone,
   twitter: BrandX,
};

export const FooterBlock: React.FC<FooterProps> = ({ content, style, project, allPages }) => {
   const appearance = project?.settings?.appearance || 'light';
   const themeBg = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff');
   const themeText = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000');

   const navLogoImage = allPages?.flatMap(p => p.blocks).find(b => b.type === 'navigation')?.content?.logoImage;
   const displayLogoImage = content.logoImage || navLogoImage;

   return (
      <footer
         className={cn("w-full transition-all duration-300 mx-auto", appearance === 'dark' ? "border-t border-zinc-800" : "border-t border-zinc-100")}
         style={{
            backgroundColor: style.backgroundColor || themeBg,
            color: style.textColor || themeText,
            paddingTop: toPx(style.padding, '16px'),
            paddingBottom: toPx(style.padding, '16px'),
            paddingLeft: toPx(style.hPadding, '0px'),
            paddingRight: toPx(style.hPadding, '0px'),
            marginLeft: toPx(style.marginLeft, '0px'),
            marginRight: toPx(style.marginRight, '0px'),
            marginTop: toPx(style.marginTop, '0px'),
            marginBottom: toPx(style.marginBottom, '0px'),
            width: (style.marginLeft || style.marginRight) ? `calc(100% - ${toPx(style.marginLeft || 0)} - ${toPx(style.marginRight || 0)})` : '100%'
         }}
      >
         <div className={cn(
            "flex flex-col text-center w-full max-w-7xl mx-auto px-8 gap-6",
            style.align === 'left' ? "items-start text-left" : style.align === 'right' ? "items-end text-right" : "items-center text-center"
         )}>
            {content.showLogo !== false && (
               <div
                  className="flex flex-col gap-2"
                  style={{
                     alignItems: style.align === 'left' ? 'flex-start' : style.align === 'right' ? 'flex-end' : 'center'
                  }}
               >
                  {(content.logoType === 'image' || content.logoType === 'both') && displayLogoImage && (
                     <img src={displayLogoImage} alt="Logo" style={{ height: toPx(style.titleSize, '24px'), width: 'auto' }} className="object-contain" />
                  )}
                  {content.logoType !== 'image' && (
                     <div className="font-black tracking-tighter" style={{ fontSize: toPx(style.titleSize, '24px') }}>
                        {content.logoText || (project?.name ? project.name : 'SitiVetrina')}
                     </div>
                  )}
               </div>
            )}

            {content.socialLinks && content.socialLinks.length > 0 && (
               <div className={cn("flex gap-4", style.align === 'left' ? "justify-start" : style.align === 'right' ? "justify-end" : "justify-center")}>
                  {content.socialLinks.map((social, i) => {
                     const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Mail;
                     return (
                        <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 hover:scale-110 transition-all p-1">
                           <Icon size={20} />
                        </a>
                     );
                  })}
               </div>
            )}

            {content.links && content.links.length > 0 && (
               <div className={cn("flex flex-wrap gap-4 md:gap-8", style.align === 'left' ? "justify-start" : style.align === 'right' ? "justify-end" : "justify-center")}>
                  {content.links.map((link, i) => (
                     <a key={i} href={link.url} className="font-medium opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap" style={{ fontSize: toPx(style.fontSize, '14px') }}>
                        {link.label}
                     </a>
                  ))}
               </div>
            )}

            <p
               className="font-bold uppercase tracking-widest opacity-50"
               style={{ fontSize: toPx(style.fontSize, '14px') }}
            >
               {content.copyright || `© ${new Date().getFullYear()} ${project?.name || 'SitiVetrina'}`}
            </p>
         </div>
      </footer>
   );
};
