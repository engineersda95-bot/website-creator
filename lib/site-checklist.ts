/**
 * Site Checklist — Definizione centralizzata dei passaggi per completare un sito.
 * Aggiungi/rimuovi/riordina i check facilmente qui.
 */

import { Project, Page, SiteGlobal, BlockType } from '@/types/editor';

export interface CheckItem {
  id: string;
  label: string;
  description: string;
  category: 'content' | 'seo' | 'publish';
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
      : pages.some(p => p.blocks?.some(b => b.type === 'navigation')),
  },
  {
    id: 'has-footer',
    label: 'Footer presente',
    description: 'Un footer con contatti e link migliora la professionalità del sito',
    category: 'content',
    scope: 'global',
    check: ({ pages, siteGlobals }) => siteGlobals !== undefined
      ? siteGlobals.some(g => g.type === 'footer')
      : pages.some(p => p.blocks?.some(b => b.type === 'footer')),
  },
  {
    id: 'has-contact',
    label: 'Sezione contatti',
    description: 'I visitatori devono poter contattarti facilmente',
    category: 'content',
    scope: 'global',
    check: ({ pages }) => pages.some(p => p.blocks?.some(b => b.type === 'contact')),
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

// ─── API ─────────────────────────────────────────────────────────────────

export function getGlobalChecks(): CheckItem[] {
  return GLOBAL_CHECKS;
}

export function getPageChecks(): CheckItem[] {
  return PAGE_CHECKS;
}

export function runGlobalChecks(project: Project, pages: Page[], siteGlobals?: SiteGlobal[]): CheckResult[] {
  const ctx: CheckContext = { project, pages, siteGlobals };
  return GLOBAL_CHECKS
    .filter(item => !item.skipIf || !item.skipIf(ctx))
    .map(item => ({
      item,
      passed: item.check(ctx),
      href: item.href ? item.href(ctx) : undefined,
    }));
}

export function runPageChecks(project: Project, pages: Page[], page: Page): CheckResult[] {
  const ctx: CheckContext = { project, pages, page };
  return PAGE_CHECKS
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
  publish: 'Pubblicazione',
};

export const CATEGORY_COLORS: Record<string, string> = {
  content: 'text-blue-600 bg-blue-50',
  seo: 'text-emerald-600 bg-emerald-50',
  publish: 'text-amber-600 bg-amber-50',
};