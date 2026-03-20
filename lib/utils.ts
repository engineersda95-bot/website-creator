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

export function getButtonStyle(project: any, activeColor: string) {
  const settings = project?.settings || {};
  const buttonTextColor = settings.themeColors?.buttonText || '#ffffff';
  
  return {
    backgroundColor: activeColor,
    color: buttonTextColor,
    borderRadius: toPx(settings.buttonRadius, '9999px'),
    boxShadow: {
      none: 'none',
      S: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      M: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      L: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    }[settings.buttonShadow as 'none'|'S'|'M'|'L' || 'M'],
    border: settings.buttonBorder ? `${settings.buttonBorderWidth || 1}px solid ${settings.buttonBorderColor || (buttonTextColor + '44')}` : 'none',
    textTransform: settings.buttonUppercase ? 'uppercase' : 'none',
    padding: `${settings.buttonPaddingY || 12}px ${settings.buttonPaddingX || 32}px`,
    fontWeight: '700',
    transition: 'all 0.3s ease',
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
