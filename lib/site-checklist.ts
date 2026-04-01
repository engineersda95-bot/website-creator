/**
 * Site Checklist — Definizione centralizzata dei passaggi per completare un sito.
 * Aggiungi/rimuovi/riordina i check facilmente qui.
 */

import { Project, Page } from '@/types/editor';

export interface CheckItem {
  id: string;
  label: string;
  description: string;
  category: 'content' | 'seo' | 'design' | 'publish';
  scope: 'global' | 'page';
  // Returns true if the check passes
  check: (ctx: CheckContext) => boolean;
  // Optional: link/action to fix
  fix?: {
    label: string;
    action: 'navigate' | 'open-section';
    target: string;
  };
}

export interface CheckContext {
  project: Project;
  pages: Page[];
  // For page-scoped checks
  page?: Page;
}

export interface CheckResult {
  item: CheckItem;
  passed: boolean;
}

// ─── GLOBAL CHECKS (site-level) ─────────────────────────────────────────

const GLOBAL_CHECKS: CheckItem[] = [
  // Content
  {
    id: 'has-pages',
    label: 'Almeno 2 pagine',
    description: 'Un sito completo ha più di una pagina (es. Home + Contatti)',
    category: 'content',
    scope: 'global',
    check: ({ pages }) => pages.length >= 2,
  },
  {
    id: 'has-navigation',
    label: 'Navigazione presente',
    description: 'Aggiungi un blocco navigazione per permettere ai visitatori di muoversi tra le pagine',
    category: 'content',
    scope: 'global',
    check: ({ pages }) => pages.some(p => p.blocks?.some(b => b.type === 'navigation')),
  },
  {
    id: 'has-footer',
    label: 'Footer presente',
    description: 'Un footer con contatti e link migliora la professionalità del sito',
    category: 'content',
    scope: 'global',
    check: ({ pages }) => pages.some(p => p.blocks?.some(b => b.type === 'footer')),
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
    id: 'has-meta-description',
    label: 'Descrizione SEO globale',
    description: 'La descrizione appare sotto il titolo nei risultati di ricerca',
    category: 'seo',
    scope: 'global',
    check: ({ project }) => !!(project.settings as any)?.metaDescription?.trim(),
    fix: { label: 'Imposta descrizione', action: 'open-section', target: 'seo' },
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

  // Design
  {
    id: 'has-custom-font',
    label: 'Font personalizzato',
    description: 'Un font diverso dal default rende il sito più professionale',
    category: 'design',
    scope: 'global',
    check: ({ project }) => {
      const font = (project.settings as any)?.fontFamily;
      return !!font && font !== 'Outfit';
    },
    fix: { label: 'Scegli font', action: 'open-section', target: 'typography' },
  },
  {
    id: 'has-primary-color',
    label: 'Colore primario impostato',
    description: 'Il colore del brand usato per pulsanti e accenti',
    category: 'design',
    scope: 'global',
    check: ({ project }) => {
      const color = (project.settings as any)?.primaryColor;
      return !!color && color !== '#3b82f6';
    },
    fix: { label: 'Scegli colore', action: 'open-section', target: 'theme' },
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
];

// ─── PAGE CHECKS (per-page) ─────────────────────────────────────────────

const PAGE_CHECKS: CheckItem[] = [
  {
    id: 'page-has-hero',
    label: 'Sezione Hero',
    description: 'La prima impressione conta — aggiungi un Hero con titolo e call-to-action',
    category: 'content',
    scope: 'page',
    check: ({ page }) => !!page?.blocks?.some(b => b.type === 'hero'),
  },
  {
    id: 'page-has-3-blocks',
    label: 'Almeno 3 blocchi',
    description: 'Una pagina con più sezioni è più completa e coinvolgente',
    category: 'content',
    scope: 'page',
    check: ({ page }) => (page?.blocks?.length || 0) >= 3,
  },
  {
    id: 'page-has-cta',
    label: 'Call-to-action presente',
    description: 'Ogni pagina dovrebbe avere almeno un pulsante che guida il visitatore',
    category: 'content',
    scope: 'page',
    check: ({ page }) => !!page?.blocks?.some(b => b.content?.cta || b.type === 'contact'),
  },
  {
    id: 'page-seo-title',
    label: 'Titolo SEO della pagina',
    description: 'Un titolo specifico per questa pagina migliora il posizionamento',
    category: 'seo',
    scope: 'page',
    check: ({ page }) => !!(page?.seo as any)?.title?.trim(),
  },
  {
    id: 'page-seo-description',
    label: 'Descrizione SEO della pagina',
    description: 'La descrizione specifica appare nei risultati di ricerca per questa pagina',
    category: 'seo',
    scope: 'page',
    check: ({ page }) => !!(page?.seo as any)?.description?.trim(),
  },
  {
    id: 'page-has-images',
    label: 'Immagini presenti',
    description: 'Le immagini rendono il contenuto più attraente e professionale',
    category: 'content',
    scope: 'page',
    check: ({ page }) => !!page?.blocks?.some(b =>
      b.content?.backgroundImage || b.content?.image || (b.content?.images?.length > 0 && b.content.images.some((i: any) => i.image))
    ),
  },
];

// ─── API ─────────────────────────────────────────────────────────────────

export function getGlobalChecks(): CheckItem[] {
  return GLOBAL_CHECKS;
}

export function getPageChecks(): CheckItem[] {
  return PAGE_CHECKS;
}

export function runGlobalChecks(project: Project, pages: Page[]): CheckResult[] {
  const ctx: CheckContext = { project, pages };
  return GLOBAL_CHECKS.map(item => ({
    item,
    passed: item.check(ctx),
  }));
}

export function runPageChecks(project: Project, pages: Page[], page: Page): CheckResult[] {
  const ctx: CheckContext = { project, pages, page };
  return PAGE_CHECKS.map(item => ({
    item,
    passed: item.check(ctx),
  }));
}

export function getCompletionScore(results: CheckResult[]): number {
  if (results.length === 0) return 100;
  const passed = results.filter(r => r.passed).length;
  return Math.round((passed / results.length) * 100);
}

export const CATEGORY_LABELS: Record<string, string> = {
  content: 'Contenuti',
  seo: 'SEO',
  design: 'Design',
  publish: 'Pubblicazione',
};

export const CATEGORY_COLORS: Record<string, string> = {
  content: 'text-blue-600 bg-blue-50',
  seo: 'text-emerald-600 bg-emerald-50',
  design: 'text-violet-600 bg-violet-50',
  publish: 'text-amber-600 bg-amber-50',
};
