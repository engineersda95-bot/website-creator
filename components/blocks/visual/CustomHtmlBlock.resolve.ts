import { resolveImageUrl } from '@/lib/image-utils';
import { getButtonStyle, getButtonClass, formatLink } from '@/lib/utils';
import { Project } from '@/types/editor';

export interface ChbImgMeta { index: number; ratio: string; alt: string }
export interface ChbCtaMeta { index: number; label: string; url: string }
export interface ChbSvgMeta { index: number; markup: string }
export interface ChbIconMeta { iconName: string }

// kebab-case → PascalCase: "arrow-right" → "ArrowRight"
function kebabToPascal(name: string): string {
  return name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

// Renders a Lucide icon as a raw SVG string.
// Server-side: uses react-dom/server renderToStaticMarkup.
// Client-side: deferred — returns empty string and the CustomHtmlBlock useEffect resolves them via DOM.
function lucideIconToSvg(iconName: string, size = 24): string {
  if (typeof window !== 'undefined') return ''; // resolved client-side via useEffect in CustomHtmlBlock
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LucideIcons = require('lucide-react');
    const pascalName = kebabToPascal(iconName);
    const IconComponent = LucideIcons[pascalName] ?? LucideIcons[iconName];
    if (!IconComponent) return '';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { renderToStaticMarkup } = require('react-dom/server');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    return renderToStaticMarkup(
      React.createElement(IconComponent, { size, strokeWidth: 1.5 })
    );
  } catch {
    return '';
  }
}

export function parseChbPlaceholders(html: string): { images: ChbImgMeta[]; ctas: ChbCtaMeta[]; svgs: ChbSvgMeta[]; icons: ChbIconMeta[] } {
  const images: ChbImgMeta[] = [];
  const ctas: ChbCtaMeta[] = [];
  const svgs: ChbSvgMeta[] = [];
  const icons: ChbIconMeta[] = [];
  if (!html) return { images, ctas, svgs, icons };

  const imgRe = /<div[^>]*data-chb-img="(\d+)"[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html)) !== null) {
    const tag = m[0];
    const index = parseInt(m[1]);
    const ratio = tag.match(/data-chb-ratio="([^"]*)"/i)?.[1] || '16:9';
    const alt = tag.match(/data-chb-alt="([^"]*)"/i)?.[1] || '';
    if (!images.find(i => i.index === index)) images.push({ index, ratio, alt });
  }

  const ctaRe = /<a[^>]*data-chb-cta="(\d+)"[^>]*>/gi;
  while ((m = ctaRe.exec(html)) !== null) {
    const tag = m[0];
    const index = parseInt(m[1]);
    const label = tag.match(/data-chb-label="([^"]*)"/i)?.[1] || 'Scopri di più';
    const url = tag.match(/data-chb-url="([^"]*)"/i)?.[1] || '#';
    if (!ctas.find(c => c.index === index)) ctas.push({ index, label, url });
  }

  // SVG: data-chb-svg-markup may contain > inside path data, so parse via DOM when available
  if (typeof window !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    doc.querySelectorAll('[data-chb-svg]').forEach(el => {
      const index = parseInt(el.getAttribute('data-chb-svg') || '0');
      const markup = el.getAttribute('data-chb-svg-markup') ?? '';
      if (!svgs.find(s => s.index === index)) svgs.push({ index, markup });
    });
  } else {
    // Server-side fallback: with proper encoding (<, > as &lt;/&gt;) the attribute value has no raw > chars
    const svgRe = /data-chb-svg="(\d+)"[^>]*?data-chb-svg-markup="([^"]*)"/gi;
    while ((m = svgRe.exec(html)) !== null) {
      const index = parseInt(m[1]);
      const encodedMarkup = m[2] || '';
      const markup = encodedMarkup
        .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
      if (!svgs.find(s => s.index === index)) svgs.push({ index, markup });
    }
  }

  // Icons: <span data-chb-icon="ICONNAME">
  const iconRe = /data-chb-icon="([^"]*)"/gi;
  while ((m = iconRe.exec(html)) !== null) {
    const iconName = m[1].trim();
    if (iconName && !icons.find(i => i.iconName === iconName)) icons.push({ iconName });
  }

  return { images, ctas, svgs, icons };
}

function ratioToPaddingBottom(ratio: string): string {
  const [w, h] = ratio.split(':').map(Number);
  if (!w || !h) return '56.25%';
  return `${((h / w) * 100).toFixed(4)}%`;
}

export function resolveHtml(
  html: string,
  content: Record<string, any>,
  project: Project | undefined,
  isStatic: boolean,
  imageMemoryCache: Record<string, string>,
): string {
  if (!html) return '';

  // Replace <div data-chb-img="N" ...></div>
  let out = html.replace(
    /<div([^>]*?)data-chb-img="(\d+)"([^>]*)>\s*<\/div>/gi,
    (_match, before, indexStr, after) => {
      const index = parseInt(indexStr);
      const allAttrs = before + after;
      const defaultRatio = allAttrs.match(/data-chb-ratio="([^"]*)"/i)?.[1] || '16:9';
      const ratio = content[`cbImg_${index}_ratio`] ?? defaultRatio;
      const alt = content[`cbImg_${index}_alt`] ?? allAttrs.match(/data-chb-alt="([^"]*)"/i)?.[1] ?? '';
      const src = content[`cbImg_${index}_src`] ?? '';
      const resolvedSrc = src ? resolveImageUrl(src, project ?? null, imageMemoryCache, isStatic) : '';
      const pb = ratioToPaddingBottom(ratio);
      const radiusVal = content[`cbImg_${index}_radius`];
      const radius = (radiusVal !== undefined && radiusVal !== null) ? `${radiusVal}px` : undefined;
      const widthVal = content[`cbImg_${index}_width`];
      const widthPct = (widthVal !== undefined && widthVal !== null && widthVal !== 100) ? `${widthVal}%` : null;

      const cleanAttrs = allAttrs
        .replace(/\s*data-chb-img="[^"]*"/gi, '')
        .replace(/\s*data-chb-ratio="[^"]*"/gi, '')
        .replace(/\s*data-chb-alt="[^"]*"/gi, '')
        .trim();

      const radiusStyle = radius ? `border-radius:${radius};` : '';
      const outerStyle = `position:relative;width:100%;padding-bottom:${pb};overflow:hidden;${radiusStyle}`;
      const wrapperStyle = widthPct ? `width:${widthPct};margin-left:auto;margin-right:auto;` : '';

      const imgEl = resolvedSrc
        ? `<div ${cleanAttrs} style="${outerStyle}"><img src="${resolvedSrc}" alt="${alt}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" loading="lazy"/></div>`
        : `<div ${cleanAttrs} style="${outerStyle}background:#e4e4e7;"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#a1a1aa;"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span style="font-size:11px;font-weight:600;">${alt || 'Carica immagine'}</span></div></div>`;

      const linkUrl = content[`cbImg_${index}_link`];
      const inner = linkUrl
        ? (() => {
            const linkAttrs = formatLink(linkUrl, isStatic);
            const href = `href="${linkAttrs.href || '#'}"`;
            const target = (linkAttrs as any).target ? `target="${(linkAttrs as any).target}" rel="${(linkAttrs as any).rel}"` : '';
            return `<a ${href} ${target} style="display:block;text-decoration:none;">${imgEl}</a>`;
          })()
        : imgEl;

      return widthPct ? `<div style="${wrapperStyle}">${inner}</div>` : inner;
    }
  );

  // Replace <a data-chb-cta="N" ...>...</a> — consume any hardcoded content inside
  out = out.replace(
    /<a([^>]*?)data-chb-cta="(\d+)"([^>]*)>[\s\S]*?<\/a>/gi,
    (_match, before, indexStr, after) => {
      const index = parseInt(indexStr);
      const allAttrs = before + after;
      const label = content[`cbCta_${index}_label`] ?? allAttrs.match(/data-chb-label="([^"]*)"/i)?.[1] ?? 'Scopri di più';
      const url = content[`cbCta_${index}_url`] ?? allAttrs.match(/data-chb-url="([^"]*)"/i)?.[1] ?? '#';
      const theme = content[`cbCta_${index}_theme`] ?? 'primary';

      const projectSettings = (project?.settings ?? {}) as any;
      const activeColor = theme === 'secondary'
        ? (projectSettings.secondaryColor || '#10b981')
        : (projectSettings.primaryColor || '#3b82f6');

      const btnStyle = getButtonStyle(project, activeColor, 'desktop', theme, isStatic, {});
      const styleStr = Object.entries(btnStyle)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`)}:${v}`)
        .join(';');
      const btnClass = getButtonClass(project);
      const linkAttrs = formatLink(url, isStatic);
      const hrefAttr = `href="${linkAttrs.href || '#'}"`;
      const targetAttr = (linkAttrs as any).target ? `target="${(linkAttrs as any).target}" rel="${(linkAttrs as any).rel}"` : '';

      return `<a data-chb-cta="${index}" ${hrefAttr} ${targetAttr} class="${btnClass}" style="${styleStr};display:inline-flex;align-items:center;justify-content:center;text-decoration:none;">${label}</a>`;
    }
  );

  // Replace <div data-chb-svg="N" ...></div> with SVG markup (from content override or default)
  // Note: data-chb-svg-markup can contain > inside SVG path data, so we use a DOM parser when possible.
  if (typeof window !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${out}</div>`, 'text/html');
    const root = doc.querySelector('div')!;
    root.querySelectorAll('[data-chb-svg]').forEach(el => {
      const index = parseInt(el.getAttribute('data-chb-svg') || '0');
      const defaultMarkup = el.getAttribute('data-chb-svg-markup') ?? '';
      const markup = content[`cbSvg_${index}_markup`] ?? defaultMarkup;
      el.removeAttribute('data-chb-svg-markup');
      el.innerHTML = markup;
    });
    out = root.innerHTML;
  } else {
    // Server-side: find each <div ... data-chb-svg="N" ...></div> and replace with markup.
    // We process the string tag by tag: find opening tags that contain data-chb-svg, then
    // extract data-chb-svg-markup value (which is properly HTML-encoded, no raw > chars).
    let svgOut = '';
    let pos = 0;
    const svgTagRe = /<div\b([^>]*?\bdata-chb-svg="(\d+)"[^>]*?)>\s*<\/div>/gi;
    let svgM: RegExpExecArray | null;
    while ((svgM = svgTagRe.exec(out)) !== null) {
      svgOut += out.slice(pos, svgM.index);
      const index = parseInt(svgM[2]);
      const attrs = svgM[1];
      // Extract data-chb-svg-markup value (encoded — no raw " or > in value)
      const encodedDefault = attrs.match(/\bdata-chb-svg-markup="([^"]*)"/i)?.[1] ?? '';
      const defaultMarkup = encodedDefault
        .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
      const markup = content[`cbSvg_${index}_markup`] ?? defaultMarkup;
      // Clean attrs for output
      const cleanAttrs = attrs
        .replace(/\s*\bdata-chb-svg-markup="[^"]*"/gi, '')
        .trim();
      svgOut += `<div ${cleanAttrs}>${markup}</div>`;
      pos = svgM.index + svgM[0].length;
    }
    svgOut += out.slice(pos);
    out = svgOut;
  }

  // Replace <span data-chb-icon="ICONNAME"> with Lucide SVG (respects content overrides)
  out = out.replace(
    /<span([^>]*?)data-chb-icon="([^"]*)"([^>]*)>([\s\S]*?)<\/span>/gi,
    (_match, before, originalName, after, _inner) => {
      const resolvedName = (content[`cbIcon_${originalName.trim()}`] ?? originalName).trim();
      const allAttrs = (before + after)
        .replace(/\s*data-chb-icon="[^"]*"/gi, '')
        .trim();
      const svg = lucideIconToSvg(resolvedName);
      if (!svg) return `<span${allAttrs ? ' ' + allAttrs : ''} data-chb-icon="${originalName}"></span>`;
      return `<span${allAttrs ? ' ' + allAttrs : ''} data-chb-icon="${originalName}">${svg}</span>`;
    }
  );

  return out;
}
