import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { cn, formatLink } from '@/lib/utils';
import { Project, Page } from '@/types/editor';

interface LanguageSelectorProps {
  project?: Project;
  currentLanguage?: string;
  isStatic?: boolean;
  isEditing?: boolean;
  isMobile?: boolean;
  className?: string;
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  project,
  currentLanguage,
  isStatic,
  isEditing,
  className,
  style,
  isMobile
}) => {
  const languages = project?.settings?.languages || [];
  const defLang = project?.settings?.defaultLanguage || 'it';
  const currentLang = currentLanguage || defLang;

  // Se non ci sono almeno 2 lingue, non mostriamo il selettore
  if (languages.length <= 1) return null;

  // Fallback iniziale (verrà sovrascritto dallo script Vanilla JS in Navigation.tsx nel sito live)
  const getInitialUrl = (lang: string) => lang === defLang ? '/' : `/${lang}`;

  if (isMobile) {
    return (
      <div className={cn("flex items-center justify-center gap-8", className)} style={style}>
        {languages.map(lang => (
          <a
            key={lang}
            data-lang-link={lang}
            {...formatLink(getInitialUrl(lang), !isEditing)}
            className={cn(
              "flex flex-col items-center gap-1 no-underline transition-all duration-300",
              lang === currentLang ? "opacity-100" : "opacity-30 hover:opacity-100"
            )}
          >
             <span className="font-black uppercase tracking-[0.2em]">{lang}</span>
             {lang === currentLang && <div className="w-1 h-1 rounded-full bg-current" />}
          </a>
        ))}
      </div>
    );
  }

  // Se ci sono esattamente 2 lingue, usiamo un selettore inline molto pulito
  if (languages.length === 2 && !isMobile) {
    return (
      <div className={cn("flex items-center gap-2.5", className)} style={style}>
        {languages.map((lang, idx) => (
          <React.Fragment key={lang}>
            <a
              data-lang-link={lang}
              {...formatLink(getInitialUrl(lang), !isEditing)}
              className={cn(
                "font-bold uppercase tracking-widest no-underline transition-all leading-none",
                lang === currentLang ? "opacity-100" : "opacity-35 hover:opacity-100 hover:scale-110"
              )}
            >
              {lang}
            </a>
            {idx === 0 && <span className="w-[1px] h-[0.7em] bg-current opacity-20" />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative group/lang cursor-pointer flex items-center justify-center", className)} style={style}>
      <div className="flex items-center gap-1 opacity-60 group-hover/lang:opacity-100 transition-all leading-none">
        <span className="font-bold uppercase tracking-widest leading-none">{currentLang}</span>
        <ChevronDown size={10} className="transition-transform group-hover/lang:rotate-180 duration-500" />
      </div>
      
      {/* Dropdown Desktop (per 3+ lingue) */}
      <div className="absolute top-[100%] right-0 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] opacity-0 translate-y-2 pointer-events-none group-hover/lang:opacity-100 group-hover/lang:translate-y-0 group-hover/lang:pointer-events-auto transition-all duration-300 min-w-[100px] z-[1000] overflow-hidden">
        {/* Invisible bridge to prevent hover loss */}
        <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />
        
        {languages.map(lang => (
          <a
            key={lang}
            data-lang-link={lang}
            {...formatLink(getInitialUrl(lang), !isEditing)}
            className={cn(
              "flex items-center justify-between px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all no-underline text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-widest relative z-10",
              lang === currentLang && "bg-zinc-50 dark:bg-zinc-800/50 text-blue-600"
            )}
            style={{ fontSize: '0.9em' }}
          >
            {lang}
            {lang === currentLang && <div className="w-1 h-1 rounded-full bg-blue-600" />}
          </a>
        ))}
      </div>
    </div>
  );
};
