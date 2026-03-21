'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn, toPx, getButtonStyle } from '@/lib/utils';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

interface ContactProps {
  content: {
    title: string;
    subtitle: string;
    email?: string;
    phone?: string;
    address?: string;
    type?: 'form' | 'info';
  };
  style: {
    padding?: string;
    marginTop?: string;
    marginBottom?: string;
    backgroundColor?: string;
    textColor?: string;
    minHeight?: string;
    align?: 'left' | 'center' | 'right';
    fontSize?: string;
    titleSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
    subtitleSize?: string;
    subtitleBold?: boolean;
    subtitleItalic?: boolean;
    buttonTheme?: 'primary' | 'secondary';
  };
}

export const ContactBlock: React.FC<ContactProps & { viewport?: string }> = ({ content, style, viewport }) => {
  const { project } = useEditorStore();
  const primaryColor = project?.settings?.primaryColor || '#3b82f6';
  const secondaryColor = project?.settings?.secondaryColor || '#10b981';
  const activeColor = style.buttonTheme === 'secondary' ? secondaryColor : primaryColor;
  
  const { type = 'form' } = content;

  return (
    <section 
      className="py-24 transition-all duration-500 overflow-hidden flex flex-col justify-center"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        paddingTop: toPx(style.padding),
        paddingBottom: toPx(style.padding),
        marginTop: toPx(style.marginTop),
        marginBottom: toPx(style.marginBottom),
        minHeight: toPx(style.minHeight)
      }}
    >
      <div className={cn(
        "max-w-7xl mx-auto px-8 w-full flex flex-col",
        style.align === 'center' ? "items-center text-center" : style.align === 'right' ? "items-end text-right" : "items-start text-left"
      )}>
        <div className={cn(
          "max-w-2xl w-full flex flex-col mb-16",
          style.align === 'center' ? "items-center" : style.align === 'right' ? "items-end" : "items-start"
        )}>
          <h2 className={cn(
            "tracking-tight leading-tight transition-all duration-500",
            style.titleSize ? "" : "text-4xl md:text-5xl"
          )} style={{ 
            fontSize: toPx(style.titleSize || style.fontSize), 
            fontWeight: style.titleBold === false ? 400 : 900,
            fontStyle: style.titleItalic ? 'italic' : 'normal'
          }}>
            {content.title}
          </h2>
          <p className={cn(
            "mt-4 opacity-80 leading-relaxed transition-all duration-500",
            style.subtitleSize ? "" : "text-lg",
          )} style={{ 
            fontSize: toPx(style.subtitleSize),
            fontWeight: style.subtitleBold ? 700 : 500,
            fontStyle: style.subtitleItalic ? 'italic' : 'normal'
          }}>
            {content.subtitle}
          </p>
        </div>

        {type === 'info' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {[
                { icon: <Mail size={32}/>, label: 'Email', value: content.email || 'info@esempio.it', link: (i: string) => i ? `mailto:${i}` : '#' },
                { icon: <Phone size={32}/>, label: 'Telefono', value: content.phone || '+39 011 123 4567', link: (i: string) => i ? `tel:${i}` : '#' },
                { icon: <MapPin size={32}/>, label: 'Indirizzo', value: content.address || 'Via Torino, 1', link: (i: string) => i ? `https://maps.google.com/?q=${encodeURIComponent(i)}` : '#' }
              ].map((item, index) => {
               const val = item.value;
               if (!val && index > 0) return null;
               
               return (
                 <a 
                  key={index}
                  href={item.link(val)}
                  className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] flex flex-col items-center gap-6 hover:bg-white/10 transition-all group no-underline text-inherit shadow-2xl"
                  style={{ backgroundColor: style.backgroundColor === '#ffffff' ? '#f8fafc' : undefined }}
                 >
                   <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                     {item.icon}
                   </div>
                   <div className="text-center group-hover:translate-y-1 transition-transform">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">{item.label}</p>
                      <p className="text-xl font-black tracking-tight">{val}</p>
                   </div>
                 </a>
               );
             })}
          </div>
        ) : (
          <div className="max-w-3xl w-full mx-auto p-12 bg-white rounded-[3rem] shadow-2xl border border-zinc-100 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <form action={`https://formsubmit.co/${content.email || 'vostra-email@esempio.it'}`} method="POST" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Il tuo Nome</label>
                  <input type="text" name="name" required placeholder="Mario Rossi" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Email</label>
                  <input type="email" name="email" required placeholder="mario@email.it" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Messaggio</label>
                <textarea name="message" required rows={4} placeholder="Come possiamo aiutarti?" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold resize-none" />
              </div>
              <div className="pt-4 flex justify-center">
                <button 
                  type="submit" 
                  className="font-bold transition-all active:scale-95 flex items-center justify-center gap-3 group"
                  style={getButtonStyle(project, activeColor, viewport as any)}
                >
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  INVIA MESSAGGIO
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
