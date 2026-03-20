import React from 'react';
import { cn } from '@/lib/utils';
import { Project } from '@/types/editor';
import { 
  Facebook, 
  Instagram, 
  X, 
  Linkedin, 
  Mail, 
  Phone,
  ArrowRight
} from 'lucide-react';

interface FooterProps {
  content: {
    logoText?: string;
    copyright?: string;
    layout?: 'simple' | 'columns' | 'social';
    socialLinks?: Array<{ platform: string; url: string }>;
    columns?: Array<{ title: string; links: Array<{ label: string; url: string }> }>;
  };
  style: {
    padding?: string;
    backgroundColor?: string;
    textColor?: string;
    align?: 'left' | 'center' | 'right';
  };
  project?: Project;
}

const SOCIAL_ICONS: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  x: X,
  linkedin: Linkedin,
  mail: Mail,
  phone: Phone
};

export const FooterBlock: React.FC<FooterProps> = ({ content, style, project }) => {
  const layout = content.layout || 'simple';

    const appearance = project?.settings?.appearance || 'light';
    const themeBg = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e') : (project?.settings?.themeColors?.light?.bg || '#ffffff');
    const themeText = appearance === 'dark' ? (project?.settings?.themeColors?.dark?.text || '#ffffff') : (project?.settings?.themeColors?.light?.text || '#000000');

    return (
      <footer 
        className={cn("border-t", appearance === 'dark' ? "border-zinc-800" : "border-zinc-100")}
        style={{ 
          backgroundColor: style.backgroundColor || themeBg, 
          color: style.textColor || themeText,
          paddingTop: style.padding,
          paddingBottom: style.padding,
        }}
      >
      <div className="max-w-7xl mx-auto px-8">
        {layout === 'simple' && (
          <div className={cn(
            "flex flex-col items-center text-center",
            style.align === 'left' && "items-start text-left",
            style.align === 'right' && "items-end text-right"
          )}>
            <div className="text-2xl font-black tracking-tighter mb-6">{content.logoText || 'SV'}</div>
            <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest">{content.copyright || `© ${new Date().getFullYear()} SitiVetrina`}</p>
          </div>
        )}

        {layout === 'social' && (
           <div className="flex flex-col items-center gap-10">
              <div className="text-3xl font-black tracking-tighter">{content.logoText || 'SV'}</div>
              <div className="flex gap-4">
                 {(content.socialLinks || []).map((social, i) => (
                   <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-sm">
                      {React.createElement(SOCIAL_ICONS[social.platform.toLowerCase()] || Mail, { size: 20 })}
                   </a>
                 ))}
              </div>
              <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.2em] pt-10 border-t border-zinc-200 w-full text-center">
                {content.copyright || `© ${new Date().getFullYear()} SitiVetrina`}
              </p>
           </div>
        )}

        {layout === 'columns' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
            <div className="col-span-1 md:col-span-1">
               <div className="text-2xl font-black tracking-tighter mb-4">{content.logoText || 'SV'}</div>
               <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6 italic opacity-80">
                 Progettiamo il futuro della tua immagine digitale con amore e precisione.
               </p>
               <div className="flex gap-3">
                 {(content.socialLinks || []).map((social, i) => (
                   <a key={i} href={social.url} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                      {React.createElement(SOCIAL_ICONS[social.platform.toLowerCase()] || Mail, { size: 18 })}
                   </a>
                 ))}
               </div>
            </div>
            
            {(content.columns || [
              { title: 'Servizi', links: [{ label: 'Web Design', url: '#' }, { label: 'SEO', url: '#' }] },
              { title: 'Azienda', links: [{ label: 'Chi Siamo', url: '#' }, { label: 'Contatti', url: '#' }] }
            ]).map((col, i) => (
              <div key={i} className="space-y-6">
                <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{col.title}</h4>
                <ul className="space-y-3">
                   {col.links.map((link, j) => (
                     <li key={j}>
                        <a href={link.url} className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2 group">
                          <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
                          {link.label}
                        </a>
                     </li>
                   ))}
                </ul>
              </div>
            ))}

            <div className="col-span-full pt-16 mt-16 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">{content.copyright || `© ${new Date().getFullYear()} SitiVetrina`}</p>
              <p className="text-zinc-300 font-bold text-[10px] uppercase tracking-widest">Built with Proximatica</p>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};
