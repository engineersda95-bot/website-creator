import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRichText = (text: string = '') => {
  if (!text) return '';

  const youtubeTransform = (t: string) => t.replace(/\[youtube:(.*?)\]/g, '<div class="relative pb-[56.25%] h-0 my-8 rounded-2xl overflow-hidden shadow-xl"><iframe src="https://www.youtube.com/embed/$1" class="absolute top-0 left-0 w-full h-full" frameborder="0" allowfullscreen></iframe></div>');
  
  const linkTransform = (t: string) => t.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/gi, (match, href, rest) => {
    if (rest.includes('target=')) return match;

    // Consistency with formatLink: ensure relative links have a leading slash
    let cleanHref = href;
    if (!href.startsWith('http') && !href.startsWith('/') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      cleanHref = `/${href}`;
    }

    const isAbsolute = cleanHref.startsWith('http') || cleanHref.startsWith('mailto:') || cleanHref.startsWith('tel:');
    if (isAbsolute) {
      return `<a href="${cleanHref}" target="_blank" rel="noopener noreferrer"${rest}>`;
    }
    return `<a href="${cleanHref}"${rest}>`;
  });

  const hasHtml = /<[a-z][\s\S]*>/i.test(text);

  if (hasHtml) {
    return linkTransform(youtubeTransform(text));
  }

  // Legacy Markdown path
  const inline = (t: string) =>
    youtubeTransform(t
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>'));

  if (!text.includes('\n')) {
    return linkTransform(inline(text));
  }

  const lines = text.split('\n');
  const htmlOutput: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { htmlOutput.push('</ul>'); inUl = false; }
    if (inOl) { htmlOutput.push('</ol>'); inOl = false; }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { closeLists(); continue; }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inOl) { htmlOutput.push('</ol>'); inOl = false; }
      if (!inUl) { htmlOutput.push('<ul>'); inUl = true; }
      htmlOutput.push(`<li>${inline(line.slice(2))}</li>`); continue;
    }
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (inUl) { htmlOutput.push('</ul>'); inUl = false; }
      if (!inOl) { htmlOutput.push('<ol>'); inOl = true; }
      htmlOutput.push(`<li>${inline(olMatch[2])}</li>`); continue;
    }
    closeLists();
    htmlOutput.push(`<p>${inline(line)}</p>`);
  }
  closeLists();
  return linkTransform(htmlOutput.join(''));
};

export const toPx = (value: any, defaultValue: string = ''): string => {
  if (value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value))) return defaultValue;
  if (typeof value === 'number') return `${value}px`;
  if (!isNaN(Number(value))) return `${value}px`;
  return value;
};

export function getButtonStyle(
  project: any, 
  activeColor: string, 
  viewportOverride?: 'desktop' | 'tablet' | 'mobile', 
  theme: 'primary' | 'secondary' = 'primary', 
  isStatic: boolean = false,
  overrides: Record<string, any> = {}
) {
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

  // Specific overrides logic
  const bg = overrides.bgColor || activeColor;
  const color = overrides.textColor || buttonTextColor;
  const radius = overrides.radius !== undefined ? toPx(overrides.radius) : `var(--btn-radius, ${toPx(settings.buttonRadius, '24px')})`;
  const py = overrides.paddingY !== undefined ? toPx(overrides.paddingY) : `var(--btn-py, ${toPx(settings.buttonPaddingY, '12px')})`;
  const px = overrides.paddingX !== undefined ? toPx(overrides.paddingX) : `var(--btn-px, ${toPx(settings.buttonPaddingX, '32px')})`;
  const fs = overrides.fontSize !== undefined ? toPx(overrides.fontSize) : `var(--btn-fs, ${toPx(settings.buttonFontSize, '1rem')})`;
  
  const shadowValue = overrides.shadow || settings.buttonShadow || 'none';
  const shadowValueMap = {
    none: 'none',
    S: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    M: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    L: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  };
  const shadow = shadowValueMap[shadowValue as keyof typeof shadowValueMap] || 'none';

  const uppercase = (overrides.uppercase !== undefined || overrides.Uppercase !== undefined)
    ? ((overrides.uppercase || overrides.Uppercase) ? 'uppercase' : 'none')
    : `var(--btn-upper, ${settings.buttonUppercase ? 'uppercase' : 'none'})`;

  return {
    backgroundColor: bg,
    color: color,
    borderRadius: radius,
    boxShadow: shadow,
    border: settings.buttonBorder ? `${settings.buttonBorderWidth || 1}px solid ${settings.buttonBorderColor || (buttonTextColor + '44')}` : 'none',
    textTransform: uppercase as any,
    padding: `${py} ${px}`,
    fontSize: fs,
    width: settings.buttonWidth === 'full' ? '100%' : settings.buttonWidth === 'auto' ? 'auto' : toPx(settings.buttonWidth),
    fontWeight: '700',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  };
}

export function getButtonClass(project: any, animationOverride?: string) {
  const settings = project?.settings || {};
  const animation = animationOverride || settings.buttonAnimation || 'none';

  let animClass = '';
  if (animation === 'move-up') {
    animClass = 'hover:-translate-y-1 hover:shadow-md';
  } else if (animation === 'scale') {
    animClass = 'hover:scale-105 hover:shadow-md';
  }

  return cn(
    "font-bold transition-all active:scale-95 border-0 outline-none no-underline inline-flex items-center justify-center",
    animClass
  );
}

/** Normalizes a WhatsApp value (phone number or existing URL) to https://wa.me/<digits> */
export function normalizeWhatsAppUrl(value: string | undefined): string {
  if (!value) return '';
  const v = value.trim();
  if (v.startsWith('https://wa.me/') || v.startsWith('http://wa.me/')) return v;
  // Strip everything except digits and leading +
  const digits = v.replace(/[^\d+]/g, '').replace(/^\+/, '');
  if (!digits) return v;
  return `https://wa.me/${digits}`;
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

/**
 * Optimizes user-inserted HTML scripts by adding 'defer' to any <script src="..."> tag
 * that doesn't already have it or 'async'. This improves Lighthouse scores.
 */
export function optimizeScripts(html: string): string {
  if (!html) return '';
  
  // Search for script tags with a src attribute
  return html.replace(/<script\s+([^>]*?)src=["'](.*?)["']([^>]*?)>/gi, (match, before, src, after) => {
    const combinedAttrs = (before + ' ' + after).toLowerCase();
    
    // If it already has defer or async, or is not a JS file (unlikely), leave it alone
    if (combinedAttrs.includes('defer') || combinedAttrs.includes('async')) {
      return match;
    }
    
    // Add defer attribute
    return `<script ${before.trim()} src="${src}" ${after.trim()} defer>`;
  });
}


