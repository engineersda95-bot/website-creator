import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRichText = (text: string = '') => {
  if (!text) return '';

  // Fast path: single-line text (titles, labels) — no <p> wrapping to avoid browser margin side effects
  if (!text.includes('\n')) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[youtube:(.*?)\]/g, '<div class="relative pb-[56.25%] h-0 my-8 rounded-2xl overflow-hidden shadow-xl"><iframe src="https://www.youtube.com/embed/$1" class="absolute top-0 left-0 w-full h-full" frameborder="0" allowfullscreen></iframe></div>');
  }

  // Multi-line: full block parser with <p>, <ul>, <ol>
  const lines = text.split('\n');
  const html: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { html.push('</ul>'); inUl = false; }
    if (inOl) { html.push('</ol>'); inOl = false; }
  };

  const inline = (t: string) =>
    t
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[youtube:(.*?)\]/g, '<div class="relative pb-[56.25%] h-0 my-8 rounded-2xl overflow-hidden shadow-xl"><iframe src="https://www.youtube.com/embed/$1" class="absolute top-0 left-0 w-full h-full" frameborder="0" allowfullscreen></iframe></div>');

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      closeLists();
      continue;
    }

    // Unordered list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inOl) { html.push('</ol>'); inOl = false; }
      if (!inUl) { html.push('<ul>'); inUl = true; }
      html.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (inUl) { html.push('</ul>'); inUl = false; }
      if (!inOl) { html.push('<ol>'); inOl = true; }
      html.push(`<li>${inline(olMatch[2])}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p>${inline(line)}</p>`);
  }

  closeLists();
  return html.join('');
};

export const toPx = (value: any, defaultValue: string = ''): string => {
  if (value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value))) return defaultValue;
  if (typeof value === 'number') return `${value}px`;
  if (!isNaN(Number(value))) return `${value}px`;
  return value;
};

export function getButtonStyle(project: any, activeColor: string, viewportOverride?: 'desktop' | 'tablet' | 'mobile', theme: 'primary' | 'secondary' = 'primary', isStatic: boolean = false) {
  // Se isStatic è true, usiamo direttamente l'override (solitamente mobile per link hamburger) o desktop
  let viewport: 'desktop' | 'tablet' | 'mobile' = viewportOverride || 'desktop';

  let settings = project?.settings || {};

  // Merge responsive overrides if any
  if (viewport !== 'desktop' && settings.responsive?.[viewport]) {
    settings = { ...settings, ...settings.responsive[viewport] };
  }

  const buttonTextColor = theme === 'secondary'
    ? (project?.settings?.themeColors?.buttonTextSecondary || project?.settings?.themeColors?.buttonText || '#ffffff')
    : (project?.settings?.themeColors?.buttonText || '#ffffff');

  // Se non abbiamo un viewport forzato, usiamo le variabili CSS per la reattività dinamica (Live Site)

  return {
    backgroundColor: activeColor,
    color: buttonTextColor,
    borderRadius: `var(--btn-radius, ${toPx(settings.buttonRadius, '9999px')})`,
    boxShadow: {
      none: 'none',
      S: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      M: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      L: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    }[settings.buttonShadow as 'none' | 'S' | 'M' | 'L' || 'none'],
    border: settings.buttonBorder ? `${settings.buttonBorderWidth || 1}px solid ${settings.buttonBorderColor || (buttonTextColor + '44')}` : 'none',
    textTransform: `var(--btn-upper, ${settings.buttonUppercase ? 'uppercase' : 'none'})` as any,
    padding: `var(--btn-py, ${toPx(settings.buttonPaddingY, '12px')}) var(--btn-px, ${toPx(settings.buttonPaddingX, '32px')})`,
    fontSize: `var(--btn-fs, ${toPx(settings.buttonFontSize, '1rem')})`,
    width: settings.buttonWidth === 'full' ? '100%' : settings.buttonWidth === 'auto' ? 'auto' : toPx(settings.buttonWidth),
    fontWeight: '700',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  };
}

export function getButtonClass(project: any) {
  const settings = project?.settings || {};
  const animation = settings.buttonAnimation || 'none';

  let animClass = '';
  if (animation === 'move-up') {
    animClass = 'hover:-translate-y-1 hover:shadow-md';
  } else if (animation === 'scale') {
    animClass = 'hover:scale-105 hover:shadow-md';
  }

  return cn(
    "font-bold transition-all active:scale-95 border-0 outline-none no-underline inline-flex items-center justify-center shadow-sm",
    animClass
  );
}

export function formatLink(url: string | undefined, isStatic: boolean = true): { href: string; target?: string; rel?: string; onClick?: (e: any) => void } {
  if (!isStatic) {
    return { 
      href: '#', 
      onClick: (e: any) => {
        // Prevent navigation in editor
        if (e && e.preventDefault) e.preventDefault();
        return false;
      }
    };
  }

  if (!url || url === '#' || url === '') return { href: '#' };

  if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return { href: url, target: '_blank', rel: 'noopener noreferrer' };
  }

  if (url.startsWith('#')) return { href: url };

  // Internal links: Ensure starts with / and remove .html
  let clean = url.startsWith('/') ? url : `/${url}`;
  if (clean.endsWith('.html')) {
    clean = clean.replace('.html', '');
  }

  return { href: clean };
}
export function getStyleValue(block: any, viewport: string | undefined, key: string, defaultValue: any) {
  if (!block || !block.style) return defaultValue;
  const vp = viewport || 'desktop';
  if (vp === 'desktop') return block.style?.[key] ?? defaultValue;
  return block.responsiveStyles?.[vp]?.[key] ?? block.style?.[key] ?? defaultValue;
}

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function fuzzySearch(query: string, text: string): boolean {
  const normQuery = normalizeText(query);
  const normText = normalizeText(text);
  if (!normQuery) return true;
  return normText.includes(normQuery);
}

