/**
 * Site Checklist — Definizione centralizzata dei passaggi per completare un sito.
 * Aggiungi/rimuovi/riordina i check facilmente qui.
 */

import { Project, Page, SiteGlobal, BlockType, BlogPost } from '@/types/editor';

export interface CheckItem {
  id: string;
  label: string;
  description: string;
  category: 'content' | 'seo' | 'publish' | 'a11y';
  scope: 'global' | 'page';
  // Returns true if the check passes
  check: (ctx: CheckContext) => boolean;
  // If true, shown as reminder but not counted in the score
  informational?: boolean;
  // If returns true, the check is skipped entirely (not shown, not counted)
  skipIf?: (ctx: CheckContext) => boolean;
  // Optional: link/action to fix
  fix?: {
    label: string;
    action: 'navigate' | 'open-section' | 'open-url';
    target: string;
  };
  // Optional: external link computed from context (e.g. sitemap URL)
  href?: (ctx: CheckContext) => string | undefined;
}

export interface CheckContext {
  project: Project;
  pages: Page[];
  siteGlobals?: SiteGlobal[];
  // For page-scoped checks
  page?: Page;
  // For blog-scoped checks
  blogPost?: BlogPost;
}

export interface CheckResult {
  item: CheckItem;
  passed: boolean;
  href?: string;
}

// ─── GLOBAL CHECKS (site-level) ─────────────────────────────────────────

const GLOBAL_CHECKS: CheckItem[] = [
  // Content
  {
    id: 'has-navigation',
    label: 'Navigazione presente',
    description: 'Aggiungi un blocco navigazione per permettere ai visitatori di muoversi tra le pagine',
    category: 'content',
    scope: 'global',
    check: ({ pages, siteGlobals }) => siteGlobals !== undefined
      ? siteGlobals.some(g => g.type === 'navigation')
      : pages.some(p => p.blocks?.some(b => b?.type === 'navigation')),
  },
  {
    id: 'has-footer',
    label: 'Footer presente',
    description: 'Un footer con contatti e link migliora la professionalità del sito',
    category: 'content',
    scope: 'global',
    check: ({ pages, siteGlobals }) => siteGlobals !== undefined
      ? siteGlobals.some(g => g.type === 'footer')
      : pages.some(p => p.blocks?.some(b => b?.type === 'footer')),
  },
  {
    id: 'has-contact',
    label: 'Sezione contatti',
    description: 'I visitatori devono poter contattarti facilmente',
    category: 'content',
    scope: 'global',
    check: ({ pages }) => pages.some(p => p.blocks?.some(b => b?.type === 'contact')),
  },

  // SEO
  {
    id: 'has-meta-title',
    label: 'Titolo SEO globale',
    description: 'Il titolo del sito appare nei risultati di ricerca Google',
    category: 'seo',
    scope: 'global',
    check: ({ project }) => !!(project.settings as any)?.metaTitle?.trim(),
    fix: { label: 'Imposta titolo', action: 'open-section', target: 'seo' },
  },
  {
    id: 'meta-title-quality',
    label: 'Lunghezza titolo SEO ottimale',
    description: 'Il titolo dovrebbe essere tra 40 e 70 caratteri (ideale: 50-60). Attuale: troppo corto o lungo.',
    category: 'seo',
    scope: 'global',
    skipIf: ({ project }) => !((project.settings as any)?.metaTitle?.trim()),
    check: ({ project }) => {
      const title = (project.settings as any)?.metaTitle?.trim() || '';
      return title.length >= 40 && title.length <= 70;
    },
    fix: { label: 'Correggi titolo', action: 'open-section', target: 'seo' },
  },
  {
    id: 'has-meta-description',
    label: 'Descrizione SEO globale',
    description: 'La descrizione appare sotto il titolo nei risultati di ricerca',
    category: 'seo',
    scope: 'global',
    check: ({ project }) => !!(project.settings as any)?.metaDescription?.trim(),
    fix: { label: 'Imposta descrizione', action: 'open-section', target: 'seo' },
  },
  {
    id: 'meta-desc-quality',
    label: 'Lunghezza descrizione SEO ottimale',
    description: 'La descrizione dovrebbe essere tra 110 e 160 caratteri. Attuale: troppo corta o lunga.',
    category: 'seo',
    scope: 'global',
    skipIf: ({ project }) => !((project.settings as any)?.metaDescription?.trim()),
    check: ({ project }) => {
      const desc = (project.settings as any)?.metaDescription?.trim() || '';
      return desc.length >= 110 && desc.length <= 160;
    },
    fix: { label: 'Correggi descrizione', action: 'open-section', target: 'seo' },
  },
  {
    id: 'has-favicon',
    label: 'Favicon / Logo',
    description: 'L\'icona che appare nella tab del browser',
    category: 'seo',
    scope: 'global',
    check: ({ project }) => !!(project.settings as any)?.favicon || !!(project.settings as any)?.logo,
    fix: { label: 'Carica logo', action: 'open-section', target: 'seo' },
  },
  {
    id: 'has-og-image',
    label: 'Immagine social (Open Graph)',
    description: 'Aggiunge un\'anteprima visiva quando il sito viene condiviso su social network e chat',
    category: 'seo',
    scope: 'global',
    check: ({ project }) => !!(project.settings as any)?.metaImage?.trim(),
    fix: { label: 'Aggiungi immagine', action: 'open-section', target: 'seo' },
  },
  {
    id: 'has-business-info',
    label: 'Dati attività (JSON-LD)',
    description: 'Il nome e i contatti dell\'attività aiutano Google a mostrare info nei risultati locali',
    category: 'seo',
    scope: 'global',
    check: ({ project }) => {
      const bd = (project.settings as any)?.businessDetails;
      return !!(bd?.businessName?.trim());
    },
    fix: { label: 'Compila dati attività', action: 'open-section', target: 'seo' },
  },

  // Publish
  {
    id: 'is-published',
    label: 'Sito pubblicato',
    description: 'Pubblica il sito per renderlo visibile online',
    category: 'publish',
    scope: 'global',
    check: ({ project }) => !!(project as any).live_url,
  },
  {
    id: 'sitemap-google',
    label: 'Sitemap inviata a Google Search Console',
    description: 'Invia la sitemap a Google Search Console per accelerare l\'indicizzazione su Google',
    category: 'publish',
    scope: 'global',
    informational: true,
    check: ({ project }) => !(project as any).live_url,
    href: ({ project }) => {
      const url = (project as any).live_url;
      return url ? `${url}/sitemap.xml` : undefined;
    },
    fix: { label: 'Apri Google Search Console', action: 'open-url', target: 'https://search.google.com/search-console' },
  },
  {
    id: 'sitemap-bing',
    label: 'Sitemap inviata a Bing Webmaster Tools',
    description: 'Bing alimenta la ricerca di Copilot, Perplexity e altri LLM — vale la pena indicizzarsi anche lì',
    category: 'publish',
    scope: 'global',
    informational: true,
    check: ({ project }) => !(project as any).live_url,
    href: ({ project }) => {
      const url = (project as any).live_url;
      return url ? `${url}/sitemap.xml` : undefined;
    },
    fix: { label: 'Apri Bing Webmaster Tools', action: 'open-url', target: 'https://www.bing.com/webmasters' },
  },
];

// ─── PAGE CHECKS (per-page) ─────────────────────────────────────────────

const CONTENT_BLOCKS: BlockType[] = ['hero', 'text', 'image', 'image-text', 'gallery', 'features', 'contact', 'reviews', 'product-carousel', 'faq', 'quote', 'cards', 'benefits', 'how-it-works', 'pricing', 'promo', 'blog-list', 'logos'];

const PAGE_CHECKS: CheckItem[] = [
  {
    id: 'page-seo-title',
    label: 'Titolo SEO della pagina',
    description: 'Un titolo specifico per questa pagina migliora il posizionamento',
    category: 'seo',
    scope: 'page',
    check: ({ page }) => !!(page?.seo as any)?.title?.trim(),
    fix: { label: 'Modifica SEO pagina', action: 'open-section', target: 'seo' },
  },
  {
    id: 'page-seo-title-quality',
    label: 'Lunghezza titolo SEO ottimale',
    description: 'Il titolo della pagina dovrebbe essere tra 40 e 70 caratteri (ideale: 50-60)',
    category: 'seo',
    scope: 'page',
    skipIf: ({ page }) => !((page?.seo as any)?.title?.trim()),
    check: ({ page }) => {
      const title = (page?.seo as any)?.title?.trim() || '';
      return title.length >= 40 && title.length <= 70;
    },
    fix: { label: 'Modifica SEO pagina', action: 'open-section', target: 'seo' },
  },
  {
    id: 'page-seo-description',
    label: 'Descrizione SEO della pagina',
    description: 'La descrizione specifica appare nei risultati di ricerca per questa pagina',
    category: 'seo',
    scope: 'page',
    check: ({ page }) => !!(page?.seo as any)?.description?.trim(),
    fix: { label: 'Modifica SEO pagina', action: 'open-section', target: 'seo' },
  },
  {
    id: 'page-seo-desc-quality',
    label: 'Lunghezza descrizione SEO ottimale',
    description: 'La descrizione della pagina dovrebbe essere tra 110 e 160 caratteri',
    category: 'seo',
    scope: 'page',
    skipIf: ({ page }) => !((page?.seo as any)?.description?.trim()),
    check: ({ page }) => {
      const desc = (page?.seo as any)?.description?.trim() || '';
      return desc.length >= 110 && desc.length <= 160;
    },
    fix: { label: 'Modifica SEO pagina', action: 'open-section', target: 'seo' },
  },
  {
    id: 'page-seo-image',
    label: 'Immagine social della pagina',
    description: 'Aggiungi un\'immagine specifica per questa pagina per il social sharing e i risultati Google',
    category: 'seo',
    scope: 'page',
    check: ({ page }) => !!(page?.seo as any)?.image?.trim(),
    fix: { label: 'Modifica SEO pagina', action: 'open-section', target: 'seo' },
  },
];

// ─── BLOG CHECKS (per-post) ─────────────────────────────────────────────

const BLOG_POST_CHECKS: CheckItem[] = [
  {
    id: 'blog-seo-title',
    label: 'Titolo SEO articolo',
    description: 'Un titolo specifico per questo articolo migliora il posizionamento',
    category: 'seo',
    scope: 'page', // using 'page' scope conceptually for localized checking
    check: ({ blogPost }) => !!(blogPost?.seo as any)?.title?.trim() || !!blogPost?.title?.trim(),
    fix: { label: 'Modifica SEO articolo', action: 'open-section', target: 'seo' },
  },
  {
    id: 'blog-seo-title-quality',
    label: 'Lunghezza titolo SEO ottimale',
    description: 'Il titolo dell\'articolo dovrebbe essere tra 40 e 70 caratteri (ideale: 50-60)',
    category: 'seo',
    scope: 'page',
    skipIf: ({ blogPost }) => !((blogPost?.seo as any)?.title?.trim() || blogPost?.title?.trim()),
    check: ({ blogPost }) => {
      const title = (blogPost?.seo as any)?.title?.trim() || blogPost?.title?.trim() || '';
      return title.length >= 40 && title.length <= 70;
    },
    fix: { label: 'Modifica SEO articolo', action: 'open-section', target: 'seo' },
  },
  {
    id: 'blog-seo-description',
    label: 'Descrizione SEO articolo',
    description: 'La descrizione appare nei risultati di ricerca per questo articolo',
    category: 'seo',
    scope: 'page',
    check: ({ blogPost }) => !!(blogPost?.seo as any)?.description?.trim() || !!blogPost?.excerpt?.trim(),
    fix: { label: 'Modifica SEO articolo', action: 'open-section', target: 'seo' },
  },
  {
    id: 'blog-seo-desc-quality',
    label: 'Lunghezza descrizione SEO ottimale',
    description: 'La descrizione dell\'articolo dovrebbe essere tra 110 e 160 caratteri',
    category: 'seo',
    scope: 'page',
    skipIf: ({ blogPost }) => !((blogPost?.seo as any)?.description?.trim() || blogPost?.excerpt?.trim()),
    check: ({ blogPost }) => {
      const desc = (blogPost?.seo as any)?.description?.trim() || blogPost?.excerpt?.trim() || '';
      return desc.length >= 110 && desc.length <= 160;
    },
    fix: { label: 'Modifica SEO articolo', action: 'open-section', target: 'seo' },
  },
  {
    id: 'blog-seo-image',
    label: 'Immagine social articolo',
    description: 'Aggiungi un\'immagine di copertina o specifica per social network (Anteprime link)',
    category: 'seo',
    scope: 'page',
    check: ({ blogPost }) => !!(blogPost?.seo as any)?.image?.trim() || !!blogPost?.cover_image?.trim(),
    fix: { label: 'Aggiungi copertina o SEO', action: 'open-section', target: 'seo' },
  },
];

// ─── ACCESSIBILITY UTILITIES ────────────────────────────────────────────

/** Parse hex color (#rgb or #rrggbb) to [r, g, b] in 0-255 range */
function parseHexColor(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return null;
}

/** Relative luminance per WCAG 2.x (0 = darkest, 1 = lightest) */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG contrast ratio between two hex colors (1:1 to 21:1) */
export function getContrastRatio(color1: string, color2: string): number {
  const c1 = parseHexColor(color1);
  const c2 = parseHexColor(color2);
  if (!c1 || !c2) return 0;
  const l1 = getLuminance(...c1);
  const l2 = getLuminance(...c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Blocks that contain images requiring alt text */
const IMAGE_BLOCK_TYPES: BlockType[] = ['hero', 'image', 'image-text', 'gallery', 'promo', 'quote', 'cards'];

/** Check whether a block has images without alt text */
function blockHasImageWithoutAlt(block: any): boolean {
  if (!block || !block.content) return false;
  const c = block.content;
  const type = block.type as string;

  // Single image blocks: image field + alt field
  if (type === 'image') {
    return !!c.image && !c.alt?.trim();
  }

  // Hero / image-text / contact: backgroundImage + backgroundAlt
  if (type === 'hero' || type === 'image-text' || type === 'contact') {
    if (c.backgroundImage && !c.backgroundAlt?.trim()) return true;
    return false;
  }

  // Gallery: items with image but no alt
  if (type === 'gallery' && Array.isArray(c.items)) {
    return c.items.some((item: any) => item.image && !item.alt?.trim());
  }

  // Promo: items with image but no alt
  if (type === 'promo' && Array.isArray(c.items)) {
    return c.items.some((item: any) => item.image && !item.alt?.trim());
  }

  // Cards: items with image but no alt
  if (type === 'cards' && Array.isArray(c.items)) {
    return c.items.some((item: any) => item.image && !item.alt?.trim());
  }

  // Quote: items with avatar but no avatarAlt
  if (type === 'quote' && Array.isArray(c.items)) {
    return c.items.some((item: any) => item.avatar && !item.avatarAlt?.trim() && !item.name?.trim());
  }

  return false;
}

/** Count how many image blocks exist in a page */
function countImageBlocks(blocks: any[]): number {
  return (blocks || []).filter(b => IMAGE_BLOCK_TYPES.includes(b?.type)).length;
}

/** Check heading hierarchy: should have at most one h1, and levels should not skip */
function hasHeadingIssues(blocks: any[]): boolean {
  if (!blocks || blocks.length === 0) return false;
  const headingLevels: number[] = [];
  for (const block of blocks) {
    const tag = block?.style?.titleTag;
    if (tag && typeof tag === 'string' && tag.startsWith('h')) {
      const level = parseInt(tag[1]);
      if (!isNaN(level)) headingLevels.push(level);
    }
  }
  if (headingLevels.length === 0) return false;
  // Multiple h1s
  if (headingLevels.filter(l => l === 1).length > 1) return true;
  // Skipping levels (e.g., h1 → h3 without h2)
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) return true;
  }
  return false;
}

/** Check for CTA buttons with URL but empty text */
function hasCTAWithoutText(blocks: any[]): boolean {
  if (!blocks) return false;
  return blocks.some(b => {
    const c = b?.content;
    if (!c) return false;
    if (c.ctaUrl?.trim() && !c.cta?.trim() && !c.ctaText?.trim()) return true;
    if (c.cta2Url?.trim() && !c.cta2?.trim() && !c.cta2Text?.trim()) return true;
    return false;
  });
}

/** Generic/vague CTA text patterns that are bad for accessibility */
const GENERIC_CTA_PATTERNS = /^(clicca qui|click here|leggi|leggi di più|leggi tutto|scopri|scopri di più|read more|learn more|more|vai|vedi|qui|here|link)$/i;

/** Check if any CTA has generic/non-descriptive text */
function hasGenericCTAText(blocks: any[]): boolean {
  if (!blocks) return false;
  return blocks.some(b => {
    const c = b?.content;
    if (!c) return false;
    const cta1 = (c.cta || c.ctaText || '').trim();
    const cta2 = (c.cta2 || c.cta2Text || '').trim();
    if (cta1 && c.ctaUrl?.trim() && GENERIC_CTA_PATTERNS.test(cta1)) return true;
    if (cta2 && c.cta2Url?.trim() && GENERIC_CTA_PATTERNS.test(cta2)) return true;
    return false;
  });
}

/** Check if navigation block has links without visible text */
function navHasEmptyLinks(blocks: any[]): boolean {
  if (!blocks) return false;
  return blocks.some(b => {
    if (b?.type !== 'navigation') return false;
    const links = b.content?.links;
    if (!Array.isArray(links)) return false;
    return links.some((link: any) => link.url?.trim() && !link.label?.trim());
  });
}

/** Check if a block has custom colors that violate contrast */
function blockHasContrastIssue(block: any, project: any): boolean {
  const s = block?.style;
  if (!s) return false;
  const blockBg = s.backgroundColor;
  const blockText = s.textColor;
  // Only check if the block explicitly overrides BOTH bg and text
  if (!blockBg || !blockText) return false;
  // Skip transparent / inherit / css variable values
  if (blockBg === 'transparent' || blockBg === 'inherit' || blockBg.startsWith('var(')) return false;
  if (blockText === 'transparent' || blockText === 'inherit' || blockText.startsWith('var(')) return false;
  // Only check hex colors
  if (!blockBg.startsWith('#') || !blockText.startsWith('#')) return false;
  return getContrastRatio(blockText, blockBg) < 4.5;
}

/** Check if embed blocks exist (for informational a11y reminder) */
function hasEmbedBlocks(blocks: any[]): boolean {
  return (blocks || []).some(b => b?.type === 'embed');
}

/** Get project theme background color */
function getThemeBg(project: any): string {
  const s = project?.settings;
  const isDark = s?.appearance === 'dark';
  return isDark ? (s?.themeColors?.dark?.bg || '#0c0c0e') : (s?.themeColors?.light?.bg || '#ffffff');
}

// ─── ACCESSIBILITY CHECKS ──────────────────────────────────────────────

const GLOBAL_A11Y_CHECKS: CheckItem[] = [
  {
    id: 'a11y-contrast-primary',
    label: 'Contrasto colore primario',
    description: 'Il colore primario deve avere un contrasto sufficiente sullo sfondo (minimo 4.5:1 WCAG AA)',
    category: 'a11y',
    scope: 'global',
    check: ({ project }) => {
      const s = project.settings as any;
      const primary = s?.primaryColor || '#3b82f6';
      const isDark = s?.appearance === 'dark';
      const bg = isDark ? (s?.themeColors?.dark?.bg || '#0c0c0e') : (s?.themeColors?.light?.bg || '#ffffff');
      return getContrastRatio(primary, bg) >= 4.5;
    },
  },
  {
    id: 'a11y-contrast-text',
    label: 'Contrasto testo su sfondo',
    description: 'Il colore del testo deve avere un contrasto sufficiente sullo sfondo (minimo 4.5:1 WCAG AA)',
    category: 'a11y',
    scope: 'global',
    check: ({ project }) => {
      const s = project.settings as any;
      const isDark = s?.appearance === 'dark';
      const bg = isDark ? (s?.themeColors?.dark?.bg || '#0c0c0e') : (s?.themeColors?.light?.bg || '#ffffff');
      const text = isDark ? (s?.themeColors?.dark?.text || '#ffffff') : (s?.themeColors?.light?.text || '#000000');
      return getContrastRatio(text, bg) >= 4.5;
    },
  },
  {
    id: 'a11y-font-size',
    label: 'Dimensione testo minima',
    description: 'Il body text dovrebbe essere almeno 16px per una buona leggibilità',
    category: 'a11y',
    scope: 'global',
    check: ({ project }) => {
      const s = project.settings as any;
      const bodySize = s?.typography?.bodySize;
      if (!bodySize) return true; // default is usually 16px (1rem)
      const px = typeof bodySize === 'number' ? bodySize : parseInt(String(bodySize));
      return isNaN(px) || px >= 16;
    },
  },
  {
    id: 'a11y-lang-set',
    label: 'Lingua del sito impostata',
    description: 'La lingua del sito è fondamentale per gli screen reader e la pronuncia corretta del contenuto',
    category: 'a11y',
    scope: 'global',
    check: ({ project }) => {
      const s = project.settings as any;
      return !!(s?.defaultLanguage?.trim());
    },
  },
  {
    id: 'a11y-contrast-buttons',
    label: 'Contrasto testo bottoni primari',
    description: 'Il testo dei bottoni deve essere leggibile sul colore di sfondo del bottone (minimo 4.5:1)',
    category: 'a11y',
    scope: 'global',
    skipIf: ({ project }) => {
      const s = project.settings as any;
      return !s?.buttonText?.trim();
    },
    check: ({ project }) => {
      const s = project.settings as any;
      const btnText = s?.buttonText || '#ffffff';
      const btnBg = s?.primaryColor || '#3b82f6';
      return getContrastRatio(btnText, btnBg) >= 4.5;
    },
  },
  {
    id: 'a11y-contrast-secondary',
    label: 'Contrasto colore secondario',
    description: 'Il colore secondario deve avere un contrasto sufficiente sullo sfondo (minimo 4.5:1 WCAG AA)',
    category: 'a11y',
    scope: 'global',
    skipIf: ({ project }) => {
      const s = project.settings as any;
      return !s?.secondaryColor?.trim();
    },
    check: ({ project }) => {
      const s = project.settings as any;
      const secondary = s?.secondaryColor || '#10b981';
      const bg = getThemeBg(project);
      return getContrastRatio(secondary, bg) >= 4.5;
    },
  },
  {
    id: 'a11y-contrast-buttons-secondary',
    label: 'Contrasto testo bottoni secondari',
    description: 'Il testo dei bottoni secondari deve essere leggibile sul colore secondario (minimo 4.5:1)',
    category: 'a11y',
    scope: 'global',
    skipIf: ({ project }) => {
      const s = project.settings as any;
      return !s?.buttonTextSecondary?.trim() && !s?.secondaryColor?.trim();
    },
    check: ({ project }) => {
      const s = project.settings as any;
      const btnText = s?.buttonTextSecondary || '#ffffff';
      const btnBg = s?.secondaryColor || '#10b981';
      return getContrastRatio(btnText, btnBg) >= 4.5;
    },
  },
  {
    id: 'a11y-font-size-mobile',
    label: 'Dimensione testo mobile',
    description: 'Il body text su mobile dovrebbe essere almeno 14px per una buona leggibilità su schermi piccoli',
    category: 'a11y',
    scope: 'global',
    skipIf: ({ project }) => {
      const s = project.settings as any;
      return !s?.responsive?.mobile?.typography?.bodySize;
    },
    check: ({ project }) => {
      const s = project.settings as any;
      const mobileBody = s?.responsive?.mobile?.typography?.bodySize;
      if (!mobileBody) return true;
      const px = typeof mobileBody === 'number' ? mobileBody : parseInt(String(mobileBody));
      return isNaN(px) || px >= 14;
    },
  },
];

const PAGE_A11Y_CHECKS: CheckItem[] = [
  {
    id: 'a11y-images-alt',
    label: 'Testo alternativo immagini',
    description: 'Tutte le immagini devono avere un testo alternativo (alt) per screen reader e SEO',
    category: 'a11y',
    scope: 'page',
    skipIf: ({ page }) => countImageBlocks(page?.blocks || []) === 0,
    check: ({ page }) => {
      return !(page?.blocks || []).some(b => blockHasImageWithoutAlt(b));
    },
  },
  {
    id: 'a11y-heading-hierarchy',
    label: 'Gerarchia titoli corretta',
    description: 'I titoli devono seguire una gerarchia logica (un solo H1, senza saltare livelli) per la navigazione assistita',
    category: 'a11y',
    scope: 'page',
    check: ({ page }) => !hasHeadingIssues(page?.blocks || []),
  },
  {
    id: 'a11y-cta-text',
    label: 'Bottoni con testo descrittivo',
    description: 'I bottoni con link devono avere testo visibile — un bottone vuoto è inaccessibile',
    category: 'a11y',
    scope: 'page',
    check: ({ page }) => !hasCTAWithoutText(page?.blocks || []),
  },
  {
    id: 'a11y-has-content',
    label: 'Contenuto testuale presente',
    description: 'La pagina deve avere almeno un blocco con contenuto testuale, non solo immagini o elementi visivi',
    category: 'a11y',
    scope: 'page',
    check: ({ page }) => {
      return (page?.blocks || []).some(b => {
        const c = b?.content;
        if (!c) return false;
        return c.title?.trim() || c.subtitle?.trim() || c.text?.trim();
      });
    },
  },
  {
    id: 'a11y-generic-cta',
    label: 'Testo bottoni descrittivo',
    description: 'Evita testi generici come "Clicca qui" o "Leggi di più" — usa testo che descriva l\'azione (es. "Prenota una consulenza")',
    category: 'a11y',
    scope: 'page',
    check: ({ page }) => !hasGenericCTAText(page?.blocks || []),
  },
  {
    id: 'a11y-nav-links',
    label: 'Link navigazione con testo',
    description: 'Tutti i link nella navigazione devono avere un\'etichetta visibile per gli screen reader',
    category: 'a11y',
    scope: 'page',
    skipIf: ({ page }) => !(page?.blocks || []).some(b => b?.type === 'navigation'),
    check: ({ page }) => !navHasEmptyLinks(page?.blocks || []),
  },
  {
    id: 'a11y-block-contrast',
    label: 'Contrasto colori nei blocchi',
    description: 'I blocchi con colori personalizzati (sfondo + testo) devono rispettare il contrasto minimo WCAG AA (4.5:1)',
    category: 'a11y',
    scope: 'page',
    check: ({ page, project }) => {
      return !(page?.blocks || []).some(b => blockHasContrastIssue(b, project));
    },
  },
  {
    id: 'a11y-contact-info',
    label: 'Blocco contatti accessibile',
    description: 'Il modulo contatti deve avere almeno un metodo di contatto (email, telefono o indirizzo) per utenti che non possono compilare il form',
    category: 'a11y',
    scope: 'page',
    skipIf: ({ page }) => !(page?.blocks || []).some(b => b?.type === 'contact'),
    check: ({ page }) => {
      const contact = (page?.blocks || []).find(b => b?.type === 'contact');
      if (!contact) return true;
      const c = contact.content;
      return !!(c?.email?.trim() || c?.phone?.trim() || c?.address?.trim());
    },
  },
  {
    id: 'a11y-embed-reminder',
    label: 'Contenuti embed accessibili',
    description: 'I video e contenuti incorporati dovrebbero avere sottotitoli o trascrizioni per utenti non udenti',
    category: 'a11y',
    scope: 'page',
    informational: true,
    skipIf: ({ page }) => !hasEmbedBlocks(page?.blocks || []),
    check: () => false, // Always shows as reminder when embed is present
  },
];

const BLOG_A11Y_CHECKS: CheckItem[] = [
  {
    id: 'blog-a11y-cover-alt',
    label: 'Immagine copertina con testo alternativo',
    description: 'L\'immagine di copertina dovrebbe avere un titolo o un\'immagine SEO con descrizione',
    category: 'a11y',
    scope: 'page',
    skipIf: ({ blogPost }) => !blogPost?.cover_image?.trim(),
    check: ({ blogPost }) => {
      // The cover image uses post.title as alt in generate-blog-static, so as long as title exists it's ok
      return !!blogPost?.title?.trim();
    },
  },
  {
    id: 'blog-a11y-heading-structure',
    label: 'Struttura heading nell\'articolo',
    description: 'Gli heading nel corpo dell\'articolo non dovrebbero saltare livelli (es. H2 → H4 senza H3)',
    category: 'a11y',
    scope: 'page',
    check: ({ blogPost }) => {
      const body = (blogPost?.blocks?.[0] as any)?.content?.text || '';
      if (!body) return true;
      // Extract heading levels from HTML
      const headingRegex = /<h([2-6])[^>]*>/gi;
      const levels: number[] = [];
      let match;
      while ((match = headingRegex.exec(body)) !== null) {
        levels.push(parseInt(match[1]));
      }
      if (levels.length === 0) return true;
      // Check for level skipping
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) return false;
      }
      return true;
    },
  },
  {
    id: 'blog-a11y-excerpt',
    label: 'Estratto / descrizione presente',
    description: 'Un estratto aiuta gli screen reader e i motori di ricerca a comprendere il contenuto dell\'articolo',
    category: 'a11y',
    scope: 'page',
    check: ({ blogPost }) => !!blogPost?.excerpt?.trim(),
  },
  {
    id: 'blog-a11y-inline-images-alt',
    label: 'Alt text immagini nel corpo',
    description: 'Le immagini inserite nel testo dell\'articolo devono avere un testo alternativo (attributo alt)',
    category: 'a11y',
    scope: 'page',
    check: ({ blogPost }) => {
      const body = (blogPost?.blocks?.[0] as any)?.content?.text || '';
      if (!body) return true;
      // Find all inline images and check for empty/missing alt
      const imgRegex = /<img[^>]*>/gi;
      let match;
      while ((match = imgRegex.exec(body)) !== null) {
        const tag = match[0];
        // Extract alt attribute
        const altMatch = tag.match(/alt\s*=\s*["']([^"']*)["']/i);
        if (!altMatch || !altMatch[1].trim()) return false;
      }
      return true;
    },
  },
  {
    id: 'blog-a11y-wall-of-text',
    label: 'Testo suddiviso con heading',
    description: 'Articoli lunghi (>300 parole) dovrebbero avere almeno un heading intermedio per facilitare la navigazione',
    category: 'a11y',
    scope: 'page',
    check: ({ blogPost }) => {
      const body = (blogPost?.blocks?.[0] as any)?.content?.text || '';
      if (!body) return true;
      // Strip HTML tags and count words
      const textOnly = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordCount = textOnly.split(' ').filter((w: string) => w.length > 0).length;
      if (wordCount < 300) return true;
      // Check for at least one heading in the body
      return /<h[2-6][^>]*>/i.test(body);
    },
  },
];

// ─── API ─────────────────────────────────────────────────────────────────

export function getGlobalChecks(): CheckItem[] {
  return GLOBAL_CHECKS;
}

export function getPageChecks(): CheckItem[] {
  return PAGE_CHECKS;
}

export function runGlobalChecks(project: Project, pages: Page[], siteGlobals?: SiteGlobal[]): CheckResult[] {
  const ctx: CheckContext = { project, pages, siteGlobals };
  const allChecks = [...GLOBAL_CHECKS, ...GLOBAL_A11Y_CHECKS];
  return allChecks
    .filter(item => !item.skipIf || !item.skipIf(ctx))
    .map(item => ({
      item,
      passed: item.check(ctx),
      href: item.href ? item.href(ctx) : undefined,
    }));
}

export function runPageChecks(project: Project, pages: Page[], page: Page): CheckResult[] {
  const ctx: CheckContext = { project, pages, page };
  const allChecks = [...PAGE_CHECKS, ...PAGE_A11Y_CHECKS];
  return allChecks
    .filter(item => !item.skipIf || !item.skipIf(ctx))
    .map(item => ({
      item,
      passed: item.check(ctx),
      href: item.href ? item.href(ctx) : undefined,
    }));
}

export function runBlogPostChecks(project: Project, post: BlogPost): CheckResult[] {
  const ctx: CheckContext = { project, pages: [], blogPost: post };
  const allChecks = [...BLOG_POST_CHECKS, ...BLOG_A11Y_CHECKS];
  return allChecks
    .filter(item => !item.skipIf || !item.skipIf(ctx))
    .map(item => ({
      item,
      passed: item.check(ctx),
      href: item.href ? item.href(ctx) : undefined,
    }));
}

export function getCompletionScore(results: CheckResult[]): number {
  const scored = results.filter(r => !r.item.informational);
  if (scored.length === 0) return 100;
  const passed = scored.filter(r => r.passed).length;
  return Math.round((passed / scored.length) * 100);
}

export const CATEGORY_LABELS: Record<string, string> = {
  content: 'Contenuti',
  seo: 'SEO',
  a11y: 'Accessibilità',
  publish: 'Pubblicazione',
};

export const CATEGORY_COLORS: Record<string, string> = {
  content: 'text-blue-600 bg-blue-50',
  seo: 'text-emerald-600 bg-emerald-50',
  a11y: 'text-violet-600 bg-violet-50',
  publish: 'text-amber-600 bg-amber-50',
};