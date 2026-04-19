import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as LucideIcons from 'lucide-react';
import { callJsonModel, isRetryable, PRIMARY_MODEL, FALLBACK_MODEL } from './gemini';
import { getContrastColor, getLuminance, darkenHSL, isInPalette } from './color-utils';
import { validateAndCleanBackgroundImages } from './image-pipeline';
import {
  SITE_SYSTEM_PROMPT,
  SITE_VALIDATION_PROMPT,
  CONTENT_QUALITY_SECTION,
  CREATIVE_MODE_SECTION,
  IMAGE_GENERATION_SECTION,
  STYLE_EXTRACTION_SECTION,
  COLORS_AND_FONT_SECTION,
} from './prompts/site';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIGenerationData {
  businessName: string;
  businessType: string;
  description: string;
  extraPages?: { name: string; description: string }[];
  logoUrl?: string;
  screenshotUrls?: string[];
  language?: string;
  logoStoragePath?: string;
  screenshotStoragePaths?: string[];
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  socials?: { platform: string; url: string }[];
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  siteObjective?: string;
  tone?: string;
  strengths?: string[];
  services?: string[];
  useAnchorNav?: boolean;
  creativeMode?: boolean;
  imageGenMode?: 'stock' | 'ai';
  validationAnswers?: { question: string; answer: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Available fonts — must match FontManager.tsx exactly
export const AVAILABLE_FONTS = [
  'Outfit', 'Inter', 'Plus Jakarta Sans', 'DM Sans', 'Montserrat', 'Roboto', 'Open Sans',
  'Poppins', 'Lato', 'Sora', 'Manrope', 'Archivo', 'Lexend', 'Urbanist', 'Figtree', 'Work Sans',
  'Public Sans', 'Ubuntu', 'Kanit', 'Heebo', 'IBM Plex Sans', 'Quicksand',
  'Playfair Display', 'Fraunces', 'Cormorant Garamond', 'Lora', 'Merriweather',
  'Crimson Text', 'Spectral', 'Arvo', 'BioRhyme', 'Old Standard TT', 'Cinzel',
  'Unbounded', 'Bebas Neue', 'Syne', 'Space Grotesk', 'Abril Fatface', 'Righteous',
  'Comfortaa', 'Fredoka One', 'Space Mono', 'JetBrains Mono', 'Fira Code',
  'Inconsolata', 'Caveat', 'Pacifico', 'Shadows Into Light', 'Grand Hotel',
];

const TONE_FONT_FALLBACK: Record<string, string> = {
  professional: 'Montserrat',
  professionale: 'Montserrat',
  friendly: 'Poppins',
  amichevole: 'Poppins',
  creative: 'Syne',
  creativo: 'Syne',
  formal: 'Lora',
  formale: 'Lora',
};

const DEFAULT_COLORS_BY_TYPE: Record<string, { bg: string; text: string; accent: string }> = {
  Restaurant:                  { bg: '#fdf6f0', text: '#2d1b0e', accent: '#c0392b' },
  LocalBusiness:               { bg: '#f8fafc', text: '#1e293b', accent: '#2563eb' },
  ProfessionalService:         { bg: '#f8fafc', text: '#1e293b', accent: '#2563eb' },
  HealthAndBeautyBusiness:     { bg: '#fdf4f8', text: '#3d1a2e', accent: '#c2185b' },
  HomeAndConstructionBusiness: { bg: '#f5f7fa', text: '#1c2b3a', accent: '#1565c0' },
  EducationalOrganization:     { bg: '#f0f7ff', text: '#0d2d5e', accent: '#1976d2' },
  SportsActivityLocation:      { bg: '#f0fdf4', text: '#14342b', accent: '#16a34a' },
  TravelAgency:                { bg: '#f0f9ff', text: '#0c3247', accent: '#0284c7' },
  Store:                       { bg: '#fafaf9', text: '#1c1917', accent: '#d97706' },
  Organization:                { bg: '#f8fafc', text: '#1e293b', accent: '#7c3aed' },
};

// Canonical sectionId per block type
const BLOCK_TYPE_CANONICAL_ID: Record<string, string> = {
  contact: 'contatti',
  faq: 'faq',
  benefits: 'vantaggi',
  cards: 'servizi',
  'how-it-works': 'come-funziona',
  quote: 'recensioni',
  pricing: 'prezzi',
  promo: 'offerte',
  text: 'chi-siamo',
  'image-text': 'info',
  hero: 'hero',
  navigation: 'nav',
  footer: 'footer',
};

const PATTERN_CYCLE: string[] = ['dots', 'topography', 'grid', 'waves', 'diagonal'];
const PATTERN_SKIP_TYPES = new Set(['hero', 'navigation', 'footer']);

const BLOCK_TYPE_CANONICAL_LABEL: Record<string, string> = {
  contact: 'Contatti',
  faq: 'FAQ',
  benefits: 'Vantaggi',
  cards: 'Servizi',
  'how-it-works': 'Come funziona',
  quote: 'Recensioni',
  pricing: 'Prezzi',
  promo: 'Offerte',
  text: 'Chi siamo',
  'image-text': 'Info',
};

const DEFAULT_TYPOGRAPHY = {
  h1Size: 64, h2Size: 48, h3Size: 32, h4Size: 24, h5Size: 20, h6Size: 16, bodySize: 16,
};
const DEFAULT_TYPOGRAPHY_MOBILE = {
  h1Size: 40, h2Size: 32, h3Size: 24, h4Size: 20, h5Size: 18, h6Size: 16, bodySize: 14,
};

const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_EXTRA_PAGES = 10;
const ALLOWED_DOMAINS = ['supabase.co', 'supabase.in'];
const MODEL_TIMEOUT = 360000;

// ─── Debug helpers ────────────────────────────────────────────────────────────

const AI_DEBUG_SAVE = process.env.AI_DEBUG_SAVE_PROMPTS === 'true';
const AI_DEBUG_DIR = path.join(process.cwd(), '.ai-debug');

function aiDebugSave(
  type: 'validation' | 'generation',
  stage: 'prompt' | 'response' | 'meta',
  data: any,
) {
  if (!AI_DEBUG_SAVE) return;
  try {
    if (!fs.existsSync(AI_DEBUG_DIR)) fs.mkdirSync(AI_DEBUG_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = stage === 'prompt' ? 'txt' : 'json';
    const filePath = path.join(AI_DEBUG_DIR, `${ts}-${type}-${stage}.${ext}`);
    const content = stage === 'prompt' ? String(data) : JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (e) {
    console.warn('[AI Debug] Could not save debug file:', e);
  }
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

async function fetchImageAsBase64(
  url: string,
): Promise<{ mimeType: string; data: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'image/png';
    return { mimeType, data: Buffer.from(buffer).toString('base64') };
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error);
    return null;
  }
}

async function buildGenerationParts(data: AIGenerationData): Promise<any[]> {
  const currentYear = new Date().getFullYear();
  const hasStyleReference = !!(data.screenshotUrls?.length || data.logoUrl);
  const cleanPhone = data.phone ? data.phone.replace(/\D/g, '') : '';

  const userInputSection = `
USER INPUT:
Current Year: ${currentYear}
Business Name: ${data.businessName}
Business Type: ${data.businessType}
Main Description: ${data.description}
Target Language: ${data.language || 'it'}

SITE OBJECTIVE (main CTA): ${data.siteObjective || 'General information'}
TONE OF VOICE: ${data.tone || 'professional'}
KEY STRENGTHS / USP: ${data.strengths?.join(' | ') || 'Not provided — use generic professional copy'}
SERVICES OFFERED: ${data.services?.filter(s => s.trim()).join(' | ') || 'Not provided — infer from description and business type'}

CONTACT INFO:
Email: ${data.email || 'Not provided'}
Phone: ${data.phone || 'Not provided'} (Clean: ${cleanPhone})
Address: ${data.address || ''}, ${data.city || ''} ${data.zip || ''}, ${data.country || 'Italia'}
Socials: ${data.socials?.map(s => `${s.platform}: ${s.url}`).join(', ') || 'None'}
`;

  const additionalInfoSection =
    data.validationAnswers?.length
      ? `
ADDITIONAL INFO PROVIDED BY USER (answers to pre-generation questions — treat as authoritative):
${data.validationAnswers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n')}
If any answer contains contact details (phone, email, address, city, zip) that are missing from the CONTACT INFO fields above, extract them into businessDetails in settings.
`
      : '';

  const pagesSection = `
EXTRA PAGES REQUESTED:
${data.extraPages?.map(p => `- ${p.name}: ${p.description}`).join('\n') || 'None'}

### MANDATORY TOTAL PAGES: ${1 + (data.extraPages?.length || 0)}
You MUST return exactly ${1 + (data.extraPages?.length || 0)} pages:
1. Home (slug: "home")
${data.extraPages?.map((p, i) => `${i + 2}. ${p.name} (slug: "${p.name.toLowerCase().replace(/\s+/g, '-')}")`).join('\n') || ''}
${
  data.useAnchorNav !== undefined
    ? `
PAGE TYPE: ${
        data.useAnchorNav
          ? `SINGLE PAGE with anchor navigation. Use these exact anchor IDs for internal links:
  #vantaggi (benefits), #servizi (cards), #come-funziona (how-it-works), #recensioni (quote), #faq (faq), #contatti (contact), #prezzi (pricing), #offerte (promo), #chi-siamo (text), #info (image-text).
  If the same block type appears more than once, append -2, -3, etc. (e.g. #info-2).
  hero.ctaUrl MUST use one of these anchors — choose the one most relevant to the site objective.`
          : 'MULTI-PAGE. Use /slug links for ctaUrl.'
      }`
    : ''
}
`;

  const contentModeSection = data.creativeMode
    ? CREATIVE_MODE_SECTION
    : CONTENT_QUALITY_SECTION;

  const imageSection = data.imageGenMode === 'ai' ? IMAGE_GENERATION_SECTION : '';

  const styleSection = hasStyleReference
    ? STYLE_EXTRACTION_SECTION
    : COLORS_AND_FONT_SECTION;

  const dynamicText =
    userInputSection +
    additionalInfoSection +
    pagesSection +
    contentModeSection +
    imageSection +
    styleSection;

  const parts: any[] = [
    { text: SITE_SYSTEM_PROMPT },
    { text: dynamicText },
  ];

  if (data.logoUrl) {
    const logoData = await fetchImageAsBase64(data.logoUrl);
    if (logoData) {
      parts.push({ text: 'This is the business logo:' });
      parts.push({ inlineData: logoData });
    }
  }

  if (data.screenshotUrls?.length) {
    parts.push({
      text: 'Style reference screenshot attached. Extract its dominant colors (background, text, accent) — output them as bg, text, accentColor in settings.',
    });
    for (const url of data.screenshotUrls) {
      const screenshotData = await fetchImageAsBase64(url);
      if (screenshotData) parts.push({ inlineData: screenshotData });
    }
  }

  return parts;
}

// ─── Internal link validation ─────────────────────────────────────────────────

function validateBlockLinks(
  content: any,
  _blockType: string,
  validSlugs: Set<string>,
  useAnchorNav?: boolean,
): any {
  if (!content) return content;
  const validate = (url: string): string => {
    if (!url) return url;
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:')
    )
      return url;
    if (useAnchorNav) {
      const anchor = url.startsWith('#') ? url.slice(1) : url.replace(/^\//, '');
      return url.startsWith('#') ? url : `#${anchor}`;
    } else {
      const slug = url.replace(/^\//, '');
      if (slug && !validSlugs.has(slug) && slug !== 'home') return '';
      return url;
    }
  };
  const result = { ...content };
  if (result.ctaUrl) result.ctaUrl = validate(result.ctaUrl);
  if (result.url) result.url = validate(result.url);
  return result;
}

// ─── Page enrichment (post-processing) ───────────────────────────────────────

function enrichPages(
  pages: any[],
  aiOutput: any,
  data: AIGenerationData,
  _finalSettings: any,
  themeBG: string,
  themeText: string,
  accentBG: string,
  isDark: boolean,
  finalBusinessDetails: any,
  finalBusinessName: string,
  finalLogo: string,
  finalLogoType: string,
  finalNavLinks: any[],
  whatsappUrl: string | null,
  currentYear: number,
): any[] {
  const validSlugs = new Set<string>(pages.map((p: any) => p.slug));

  return pages.map((page: any) => {
    const pageId = uuidv4();
    const slugCounts: Record<string, number> = {};
    let patternEligibleIdx = 0;

    const interiorBlocks = page.blocks?.map((b: any) => {
      const canonical = BLOCK_TYPE_CANONICAL_ID[b.type] || b.type;
      slugCounts[canonical] = (slugCounts[canonical] || 0) + 1;
      const finalSectionId =
        slugCounts[canonical] > 1 ? `${canonical}-${slugCounts[canonical]}` : canonical;

      const blockWithId = {
        ...b,
        id: b.id || uuidv4(),
        content: { ...b.content, sectionId: b.content?.sectionId || finalSectionId },
        style: { ...b.style },
      };

      if (blockWithId.content?.backgroundImage) {
        blockWithId.style.overlayOpacity = blockWithId.style.overlayOpacity || 65;
        blockWithId.style.overlayColor = blockWithId.style.overlayColor || '#000000';
        if (!blockWithId.style.textColor) {
          blockWithId.style.textColor = getContrastColor(
            blockWithId.style.overlayColor || '#000000',
          );
        }
      }

      if (!PATTERN_SKIP_TYPES.has(blockWithId.type)) {
        const shouldHavePattern = patternEligibleIdx % 3 === 1;
        blockWithId.style.patternType = shouldHavePattern
          ? PATTERN_CYCLE[patternEligibleIdx % PATTERN_CYCLE.length]
          : 'none';
        if (shouldHavePattern) {
          blockWithId.style.patternColor = themeText;
          blockWithId.style.patternOpacity = isDark ? 8 : 7;
          blockWithId.style.patternScale = 15;
        } else {
          delete blockWithId.style.patternColor;
          delete blockWithId.style.patternOpacity;
          delete blockWithId.style.patternScale;
        }
        patternEligibleIdx++;
      }

      if (blockWithId.style?.backgroundColor) {
        if (!isInPalette(blockWithId.style.backgroundColor, [themeBG, themeText, accentBG])) {
          blockWithId.style.backgroundColor = accentBG;
        }
      }

      if (blockWithId.type === 'contact' && data.address) {
        blockWithId.content.showMap = true;
      }

      const itemCount = blockWithId.content?.items?.length;
      if (itemCount && ['benefits', 'cards', 'how-it-works'].includes(blockWithId.type)) {
        let cols = 3;
        if (itemCount === 2) cols = 2;
        else if (itemCount === 3) cols = 3;
        else if (itemCount === 4) cols = blockWithId.type === 'cards' ? 2 : 4;
        else if (itemCount >= 5) cols = 3;
        blockWithId.style.columns = cols;
        blockWithId.responsiveStyles = {
          tablet: { columns: Math.min(cols, 2), ...(blockWithId.responsiveStyles?.tablet || {}) },
          mobile: { columns: 1, ...(blockWithId.responsiveStyles?.mobile || {}) },
        };
      }

      blockWithId.content = validateBlockLinks(
        blockWithId.content,
        blockWithId.type,
        validSlugs,
        data.useAnchorNav,
      );

      sanitizeBlockIcons(blockWithId);

      return blockWithId;
    });

    // Alternate imageSide for consecutive image-text blocks
    let lastImageTextSide: 'left' | 'right' | null = null;
    for (const b of interiorBlocks) {
      if (b.type === 'image-text') {
        if (lastImageTextSide === null) {
          lastImageTextSide = b.content?.imageSide === 'left' ? 'left' : 'right';
        } else {
          const nextSide: 'left' | 'right' = lastImageTextSide === 'left' ? 'right' : 'left';
          b.content = { ...b.content, imageSide: nextSide };
          lastImageTextSide = nextSide;
        }
      } else {
        lastImageTextSide = null;
      }
    }

    const heroBlock = interiorBlocks.find((b: any) => b.type === 'hero');
    const finalCtaLabel = heroBlock?.content?.cta || '';
    const finalCtaUrl = heroBlock?.content?.ctaUrl || '';

    let finalSocialLinks = [...(finalBusinessDetails.socialLinks || [])];
    if (whatsappUrl && !finalSocialLinks.some((s: any) => s.platform === 'whatsapp')) {
      finalSocialLinks.push({ platform: 'whatsapp', url: whatsappUrl });
    }

    const navBlock = {
      id: uuidv4(),
      type: 'navigation',
      content: {
        ...aiOutput.settings?.navigation,
        logoText: finalBusinessName,
        logoType: finalLogoType,
        logoImage: finalLogo,
        links: finalNavLinks,
        showContact: true,
        cta: finalCtaLabel,
        ctaUrl: finalCtaUrl,
        showCTA: true,
      },
      style: { padding: 20, isSticky: true, backgroundColor: themeBG, textColor: themeText },
    };

    const footerBlock = {
      id: uuidv4(),
      type: 'footer',
      content: {
        ...aiOutput.settings?.footer,
        logoType: finalLogoType,
        logoImage: finalLogo,
        logoText: finalBusinessName,
        links: finalNavLinks,
        socialLinks: finalSocialLinks,
        copyright: `© ${currentYear} ${finalBusinessName}. Tutti i diritti riservati.`,
      },
      style: { padding: 60, backgroundColor: themeBG, textColor: themeText },
    };

    return { ...page, id: pageId, blocks: [navBlock, ...interiorBlocks, footerBlock] };
  });
}

// ─── Lucide icon sanitization ─────────────────────────────────────────────────

const ICON_FALLBACK = 'Star';

function sanitizeBlockIcons(block: any): void {
  if (!Array.isArray(block.content?.items)) return;
  for (const item of block.content.items) {
    if (!item.icon) continue;
    const normalized = item.icon.charAt(0).toUpperCase() + item.icon.slice(1);
    const exists = !!(LucideIcons as any)[normalized] || !!(LucideIcons as any)[item.icon];
    if (!exists) item.icon = ICON_FALLBACK;
  }
}

// ─── Anchor / link post-assembly validation ───────────────────────────────────

function validateAllLinks(enrichedPages: any[], pagesCount: number): void {
  const LINKABLE_TYPES = [
    'benefits', 'cards', 'how-it-works', 'image-text', 'text',
    'faq', 'contact', 'quote', 'pricing', 'promo',
  ];

  for (const enrichedPage of enrichedPages) {
    const allBlocks: any[] = enrichedPage.blocks || [];
    const navBlock = allBlocks.find((b: any) => b.type === 'navigation');

    const validSectionIds = new Set<string>(
      allBlocks.filter(b => b.content?.sectionId).map((b: any) => b.content.sectionId as string),
    );

    if (pagesCount === 1 && navBlock) {
      const anchorLinks = allBlocks
        .filter((b: any) => LINKABLE_TYPES.includes(b.type) && b.content?.sectionId)
        .slice(0, 6)
        .map((b: any) => ({
          label: BLOCK_TYPE_CANONICAL_LABEL[b.type] || String(b.content.title || b.type),
          url: `#${b.content.sectionId}`,
        }));
      if (anchorLinks.length > 0) {
        navBlock.content = { ...navBlock.content, links: anchorLinks };
      }
    }

    for (const block of allBlocks) {
      if (!block.content) continue;
      for (const field of ['ctaUrl', 'url', 'ctaUrl2']) {
        const val = block.content[field];
        if (val && val.startsWith('#')) {
          if (!validSectionIds.has(val.slice(1))) block.content[field] = '';
        }
      }
      if (Array.isArray(block.content.items)) {
        for (const item of block.content.items) {
          if (item.url && item.url.startsWith('#')) {
            if (!validSectionIds.has(item.url.slice(1))) item.url = '';
          }
        }
      }
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GenerateProjectResult {
  success: true;
  projectId: string;
  aiImageCount: number;
  finalSettings: any;
  pagesToInsert: any[];
  globalsToInsert: any[];
  subdomain: string;
  cleanBusinessName: string;
  projId: string;
  processedSettings: any;
  processedPages: any[];
  logoStoragePath?: string;
  logoOldUrl?: string;
  logoNewRelativePath?: string;
}

export async function generateProject(
  data: AIGenerationData,
  userId?: string,
  supabase?: any,
): Promise<GenerateProjectResult | { success: false; error: string }> {
  // Input validation
  if (!data.businessName?.trim()) return { success: false, error: 'Nome attività obbligatorio.' };
  if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
    return { success: false, error: `Descrizione troppo lunga (max ${MAX_DESCRIPTION_LENGTH} caratteri).` };
  }
  if (data.extraPages && data.extraPages.length > MAX_EXTRA_PAGES) {
    return { success: false, error: `Massimo ${MAX_EXTRA_PAGES} pagine extra.` };
  }
  const allUrls = [...(data.screenshotUrls || []), ...(data.logoUrl ? [data.logoUrl] : [])];
  for (const url of allUrls) {
    try {
      const hostname = new URL(url).hostname;
      if (!ALLOWED_DOMAINS.some(d => hostname.endsWith(d)))
        return { success: false, error: 'URL immagine non valida.' };
    } catch {
      return { success: false, error: 'URL immagine non valida.' };
    }
  }

  const hasStyleReference = !!(data.screenshotUrls?.length || data.logoUrl);
  const currentYear = new Date().getFullYear();

  // Build prompt parts
  const promptParts = await buildGenerationParts(data);

  aiDebugSave(
    'generation',
    'prompt',
    promptParts.filter((p: any) => typeof p.text === 'string').map((p: any) => p.text).join('\n\n---\n\n'),
  );

  // Call model with retry
  let aiOutput: any = null;
  let usedModel = PRIMARY_MODEL;
  const genStartMs = Date.now();

  try {
    try {
      aiOutput = await callJsonModel(PRIMARY_MODEL, promptParts, MODEL_TIMEOUT);
    } catch (firstErr: any) {
      if (firstErr instanceof SyntaxError) {
        console.warn(`[AI Generator] ${PRIMARY_MODEL} returned invalid JSON, retrying once...`);
        aiOutput = await callJsonModel(PRIMARY_MODEL, promptParts, MODEL_TIMEOUT);
      } else {
        throw firstErr;
      }
    }
  } catch (primaryErr: any) {
    if (isRetryable(primaryErr) || primaryErr instanceof SyntaxError) {
      console.warn(`[AI Generator] falling back to ${FALLBACK_MODEL}`);
      usedModel = FALLBACK_MODEL;
      aiOutput = await callJsonModel(FALLBACK_MODEL, promptParts, MODEL_TIMEOUT);
    } else {
      throw primaryErr;
    }
  }

  aiDebugSave('generation', 'response', aiOutput);
  aiDebugSave('generation', 'meta', { model: usedModel, elapsedMs: Date.now() - genStartMs });
  console.log(`[AI Generator] Model used: ${usedModel}`);

  if (!aiOutput.settings || !aiOutput.pages)
    return { success: false, error: "L'IA ha generato una struttura incompleta. Riprova." };

  // Parse pages
  const rawPages = Array.isArray(aiOutput.pages) ? aiOutput.pages : [];
  const pages = rawPages
    .filter((p: any) => p && typeof p === 'object' && typeof p.slug === 'string')
    .map((p: any) => ({
      ...p,
      title: p.title || p.slug.charAt(0).toUpperCase() + p.slug.slice(1),
      blocks: Array.isArray(p.blocks) ? p.blocks.filter((b: any) => b && b.type) : [],
    }));
  if (pages.length === 0) pages.push({ title: 'Home', slug: 'home', blocks: [] });

  // Business details
  const aiDetails = aiOutput.settings?.businessDetails || {};
  const finalBusinessDetails = {
    businessName: aiDetails.businessName || data.businessName,
    email: data.email || aiDetails.email || '',
    phone: data.phone || aiDetails.phone || '',
    address: data.address || aiDetails.address || '',
    city: data.city || aiDetails.city || '',
    postalCode: data.zip || aiDetails.zip || '',
    country: data.country || aiDetails.country || 'Italia',
    socialLinks: data.socials || aiDetails.socials || [],
  };

  // Nav links
  const allPageLinks = pages
    .filter((p: any) => p.slug !== 'home')
    .map((p: any) => ({
      label: p.title || p.slug.charAt(0).toUpperCase() + p.slug.slice(1),
      url: p.slug.startsWith('/') ? p.slug : `/${p.slug}`,
    }));
  const finalNavLinks = pages.length > 1 ? allPageLinks : [];
  const finalBusinessName = data.businessName || aiDetails.businessName || 'My Website';

  // Deterministic style
  const userBG = data.bgColor || null;
  const userText = data.textColor || null;
  const userAccent = data.accentColor || null;
  const typeColors =
    DEFAULT_COLORS_BY_TYPE[data.businessType] || { bg: '#f8f9fa', text: '#1a1a2e', accent: '#3b82f6' };

  const aiBG = hasStyleReference
    ? aiOutput.settings?.bg || aiOutput.settings?.themeColors?.light?.bg || null
    : null;
  const aiText = hasStyleReference
    ? aiOutput.settings?.text || aiOutput.settings?.themeColors?.light?.text || null
    : null;
  const aiAccent = hasStyleReference ? aiOutput.settings?.accentColor || null : null;

  const themeBG = userBG || aiBG || typeColors.bg;
  const themeText = userText || aiText || typeColors.text;
  const accentBG = userAccent || aiAccent || typeColors.accent;

  console.log('[AI Generator] Colors — BG:', userBG ? 'user' : aiBG ? 'AI' : 'default', themeBG);
  console.log('[AI Generator] Colors — Text:', userText ? 'user' : aiText ? 'AI' : 'default', themeText);
  console.log('[AI Generator] Colors — Accent:', userAccent ? 'user' : aiAccent ? 'AI' : 'default', accentBG);

  const primaryCTABG = accentBG;
  const primaryCTAText = getContrastColor(accentBG);
  const secondaryCTABG = darkenHSL(accentBG, 15);
  const secondaryCTAText = getContrastColor(secondaryCTABG);

  const isDark = getLuminance(themeBG) < getLuminance(themeText);
  const finalAppearance = isDark ? 'dark' : 'light';

  const tone = data.tone || 'professional';
  const buttonRadiusMap: Record<string, number> = {
    creativo: 22, creative: 22, amichevole: 14, friendly: 14,
    professionale: 6, professional: 6, formale: 3, formal: 3,
  };
  const buttonRadius = buttonRadiusMap[tone] ?? 8;
  const buttonShadow =
    isDark ? 'none' : tone === 'formale' || tone === 'formal' ? 'none' : 'M';
  const buttonAnimation =
    tone === 'creativo' || tone === 'creative'
      ? 'bounce'
      : tone === 'amichevole' || tone === 'friendly'
      ? 'pulse'
      : 'none';

  const aiFontValid = hasStyleReference && AVAILABLE_FONTS.includes(aiOutput.settings?.fontFamily);
  const fontFamily =
    data.fontFamily ||
    (aiFontValid ? aiOutput.settings.fontFamily : null) ||
    TONE_FONT_FALLBACK[tone] ||
    'Outfit';
  console.log(
    '[AI Generator] Font:',
    data.fontFamily ? 'user' : aiFontValid ? 'AI' : TONE_FONT_FALLBACK[tone] ? 'tone-fallback' : 'hardcoded',
    fontFamily,
  );

  const hasUserLogo = !!data.logoUrl;
  const finalLogo = hasUserLogo ? data.logoUrl! : '';
  const finalLogoType = hasUserLogo ? 'image' : 'text';

  const whatsappSocial = data.socials?.find(s => s.platform === 'whatsapp');
  const whatsappNumber = whatsappSocial?.url ? whatsappSocial.url.replace(/\D/g, '') : null;
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

  const finalSettings = {
    ...aiOutput.settings,
    appearance: finalAppearance,
    primaryColor: primaryCTABG,
    secondaryColor: secondaryCTABG,
    fontFamily,
    buttonRadius,
    buttonShadow,
    buttonAnimation,
    logo: finalLogo,
    favicon: finalLogo || undefined,
    metaImage: finalLogo || undefined,
    metaTitle: finalBusinessName,
    metaDescription:
      aiOutput.settings?.metaDescription ||
      (data.language === 'en'
        ? `${finalBusinessName} — Official website`
        : `${finalBusinessName} — Sito ufficiale`),
    languages: [data.language || 'it'],
    defaultLanguage: data.language || 'it',
    businessDetails: {
      ...aiOutput.settings?.businessDetails,
      ...finalBusinessDetails,
      businessName: finalBusinessName,
    },
    themeColors: {
      light: { bg: !isDark ? themeBG : '#ffffff', text: !isDark ? themeText : '#000000' },
      dark: { bg: isDark ? themeBG : '#0c0c0e', text: isDark ? themeText : '#ffffff' },
      buttonText: primaryCTAText,
      buttonTextSecondary: secondaryCTAText,
    },
    typography: { ...DEFAULT_TYPOGRAPHY, ...(aiOutput.settings?.typography || {}) },
    responsive: {
      mobile: { typography: DEFAULT_TYPOGRAPHY_MOBILE },
      tablet: {},
    },
  };

  const enrichedPages = enrichPages(
    pages,
    aiOutput,
    data,
    finalSettings,
    themeBG,
    themeText,
    accentBG,
    isDark,
    finalBusinessDetails,
    finalBusinessName,
    finalLogo,
    finalLogoType,
    finalNavLinks,
    whatsappUrl,
    currentYear,
  );

  validateAllLinks(enrichedPages, pages.length);

  const projId = uuidv4();
  const { aiImageCount } = await validateAndCleanBackgroundImages(
    enrichedPages,
    data.businessType,
    data.creativeMode,
    projId,
    data.imageGenMode,
    userId,
    supabase,
  );

  const cleanBusinessName = (data.businessName || 'Nuovo Sito').trim();
  const subdomain =
    cleanBusinessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') +
    '-' +
    projId.substring(0, 6);

  const lang = data.language || 'it';
  const firstBlocks: any[] = enrichedPages[0]?.blocks || [];
  const aiNav = firstBlocks.find((b: any) => b.type === 'navigation');
  const aiFooter = firstBlocks.find((b: any) => b.type === 'footer');

  const globalsToInsert: any[] = [];
  if (aiNav)
    globalsToInsert.push({
      project_id: projId, language: lang, type: 'navigation',
      content: aiNav.content, style: aiNav.style,
    });
  if (aiFooter)
    globalsToInsert.push({
      project_id: projId, language: lang, type: 'footer',
      content: aiFooter.content, style: aiFooter.style,
    });

  const pagesToInsert = enrichedPages.map((p: any) => ({
    id: p.id,
    project_id: projId,
    title: p.slug === 'home' ? 'Home' : p.title,
    slug: p.slug,
    blocks: (p.blocks || []).filter((b: any) => b.type !== 'navigation' && b.type !== 'footer'),
    seo: {
      title: p.seo?.title || `${p.title} — ${cleanBusinessName}`,
      description: p.seo?.description || `${p.title} di ${cleanBusinessName}`,
    },
    language: lang,
  }));

  return {
    success: true,
    projectId: projId,
    aiImageCount,
    finalSettings,
    pagesToInsert,
    globalsToInsert,
    subdomain,
    cleanBusinessName,
    projId,
    processedSettings: finalSettings,
    processedPages: enrichedPages,
    logoStoragePath: data.logoStoragePath,
    logoOldUrl: finalLogo || undefined,
    logoNewRelativePath: data.logoStoragePath
      ? `/assets/${data.logoStoragePath.split('/').pop()}`
      : undefined,
  };
}

export async function validateDescription(data: {
  businessName: string;
  businessType: string;
  description: string;
  extraPages?: { name: string; description: string }[];
  siteObjective?: string;
  tone?: string;
  strengths?: string[];
  services?: string[];
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  socials?: any[];
}): Promise<any> {
  const prompt = `
${SITE_VALIDATION_PROMPT}

PROJECT DETAILS:
Business Name: ${data.businessName}
Business Type: ${data.businessType}
Description: ${data.description}
Site Objective: ${data.siteObjective || 'Not provided'}
Tone of Voice: ${data.tone || 'Not provided'}
Key Strengths / USP: ${data.strengths?.filter(s => s.trim()).join(' | ') || 'Not provided'}
Services Offered: ${data.services?.filter(s => s.trim()).join(' | ') || 'Not provided'}
Email: ${data.email || 'Not provided'}
Phone: ${data.phone || 'Not provided'}
Address: ${data.address || 'Not provided'}
City: ${data.city || 'Not provided'}
ZIP/CAP: ${data.zip || 'Not provided'}
Country: ${data.country || 'Italia'}
Socials: ${data.socials?.map(s => `${s.platform}: ${s.url}`).join(', ') || 'None'}
Extra Pages: ${data.extraPages?.map(p => `- ${p.name}: ${p.description}`).join('\n') || 'None'}
  `;

  aiDebugSave('validation', 'prompt', prompt);

  const validationStartMs = Date.now();
  let usedModel = PRIMARY_MODEL;
  let result: any;

  try {
    result = await callJsonModel(PRIMARY_MODEL, [{ text: prompt }], MODEL_TIMEOUT);
  } catch (primaryErr: any) {
    if (isRetryable(primaryErr) || primaryErr instanceof SyntaxError) {
      console.warn(`[AI Validation] falling back to ${FALLBACK_MODEL}`);
      usedModel = FALLBACK_MODEL;
      try {
        result = await callJsonModel(FALLBACK_MODEL, [{ text: prompt }], MODEL_TIMEOUT);
      } catch {
        return { isReady: true, questions: [] };
      }
    } else {
      throw primaryErr;
    }
  }

  aiDebugSave('validation', 'response', result);
  aiDebugSave('validation', 'meta', {
    model: usedModel,
    elapsedMs: Date.now() - validationStartMs,
    isReady: result?.isReady,
    questions: result?.questions?.length ?? 0,
  });
  console.log(`[AI Validation] isReady: ${result?.isReady}, questions: ${result?.questions?.length ?? 0}`);

  return result;
}
