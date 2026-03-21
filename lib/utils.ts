import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toPx(val: string | number | undefined, defaultVal?: string) {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'number') return `${val}px`;
  if (!isNaN(Number(val))) return `${val}px`;
  return val;
}

export function getButtonStyle(project: any, activeColor: string, viewportOverride?: 'desktop' | 'tablet' | 'mobile') {
  let viewport: 'desktop' | 'tablet' | 'mobile' = viewportOverride || 'desktop';

  // Se siamo sul client e non è forzato un viewport, rileviamo quello reale
  if (!viewportOverride && typeof window !== 'undefined') {
    if (window.innerWidth < 768) viewport = 'mobile';
    else if (window.innerWidth < 1024) viewport = 'tablet';
  }

  let settings = project?.settings || {};
  
  // Merge responsive overrides if any
  if (viewport !== 'desktop' && settings.responsive?.[viewport]) {
    settings = { ...settings, ...settings.responsive[viewport] };
  }
  
  const buttonTextColor = settings.themeColors?.buttonText || '#ffffff';
  
  // Se non abbiamo un viewport forzato, usiamo le variabili CSS per la reattività dinamica (Live Site)
  const isStatic = !viewportOverride;

  return {
    backgroundColor: activeColor,
    color: buttonTextColor,
    borderRadius: isStatic ? `var(--btn-radius, ${toPx(settings.buttonRadius, '9999px')})` : toPx(settings.buttonRadius, '9999px'),
    boxShadow: {
      none: 'none',
      S: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      M: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      L: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    }[settings.buttonShadow as 'none'|'S'|'M'|'L' || 'none'],
    border: settings.buttonBorder ? `${settings.buttonBorderWidth || 1}px solid ${settings.buttonBorderColor || (buttonTextColor + '44')}` : 'none',
    textTransform: isStatic 
      ? `var(--btn-upper, ${settings.buttonUppercase ? 'uppercase' : 'none'})` 
      : (settings.buttonUppercase ? 'uppercase' : 'none'),
    padding: isStatic 
      ? `var(--btn-py, ${settings.buttonPaddingY || 12}px) var(--btn-px, ${settings.buttonPaddingX || 32}px)`
      : `${settings.buttonPaddingY || 12}px ${settings.buttonPaddingX || 32}px`,
    fontSize: isStatic ? `var(--btn-fs, ${toPx(settings.buttonFontSize, '1rem')})` : toPx(settings.buttonFontSize, '1rem'),
    width: settings.buttonWidth === 'full' ? '100%' : settings.buttonWidth === 'auto' ? 'auto' : toPx(settings.buttonWidth),
    fontWeight: '700',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  };
}

export function formatLink(url: string | undefined): { href: string; target?: string; rel?: string } {
  if (!url || url === '#' || url === '') return { href: '#' };
  
  if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return { href: url, target: '_blank', rel: 'noopener noreferrer' };
  }
  
  // Internal links: Ensure starts with / and remove .html
  let clean = url.startsWith('/') ? url : `/${url}`;
  if (clean.endsWith('.html')) {
    clean = clean.replace('.html', '');
  }
  
  return { href: clean };
}
