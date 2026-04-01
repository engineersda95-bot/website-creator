'use server';

import { AI_VALIDATION_PROMPT, AI_WEBSITE_GENERATOR_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';
import { canUseAI, canCreateProject } from '@/lib/permissions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY non configurata. Aggiungi la chiave nel file .env');
  return new GoogleGenerativeAI(key);
}

function getContrastColor(hexcolor: string): string {
  if (!hexcolor || !hexcolor.startsWith('#')) return '#ffffff';
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

function getLuminance(hex: string): number {
  if (!hex || !hex.startsWith('#')) return 1;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function darkenHSL(hex: string, amount: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  l = Math.max(0, l - amount / 100);
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let rOut, gOut, bOut;
  if (s === 0) { rOut = gOut = bOut = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    rOut = hue2rgb(p, q, h + 1/3);
    gOut = hue2rgb(p, q, h);
    bOut = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
  return `#${toHex(rOut)}${toHex(gOut)}${toHex(bOut)}`;
}

function parseHexRGB(hex: string): [number, number, number] {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return [0, 0, 0];
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function isInPalette(hex: string, palette: string[]): boolean {
  const [r1, g1, b1] = parseHexRGB(hex);
  return palette.some(c => {
    const [r2, g2, b2] = parseHexRGB(c);
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) < 40;
  });
}

// Available fonts — must match FontManager.tsx exactly
const AVAILABLE_FONTS = [
  'Outfit','Inter','Plus Jakarta Sans','DM Sans','Montserrat','Roboto','Open Sans',
  'Poppins','Lato','Sora','Manrope','Archivo','Lexend','Urbanist','Figtree','Work Sans',
  'Public Sans','Ubuntu','Kanit','Heebo','IBM Plex Sans','Quicksand',
  'Playfair Display','Fraunces','Cormorant Garamond','Lora','Merriweather',
  'Crimson Text','Spectral','Arvo','BioRhyme','Old Standard TT','Cinzel',
  'Unbounded','Bebas Neue','Syne','Space Grotesk','Abril Fatface','Righteous',
  'Comfortaa','Fredoka One','Space Mono','JetBrains Mono','Fira Code',
  'Inconsolata','Caveat','Pacifico','Shadows Into Light','Grand Hotel'
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

// --- AI RESPONSE CACHE (dev/test only) ---
const CACHE_DIR = path.join(process.cwd(), '.ai-cache');

function ensureCacheDir() {
  try { if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true }); } catch {}
}

function getCacheKey(prefix: string, data: object): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 16);
  return path.join(CACHE_DIR, `${prefix}-${hash}.json`);
}

function readCache(key: string): any | null {
  try {
    if (fs.existsSync(key)) return JSON.parse(fs.readFileSync(key, 'utf-8'));
  } catch {}
  return null;
}

function writeCache(key: string, data: any) {
  try { ensureCacheDir(); fs.writeFileSync(key, JSON.stringify(data, null, 2), 'utf-8'); } catch {}
}

export interface AIGenerationData {
  businessName: string;
  businessType: string;
  description: string;
  extraPages?: { name: string; description: string }[];
  logoUrl?: string;
  screenshotUrls?: string[];
  language?: string;
  // Contact & Social
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  socials?: { platform: string; url: string }[];
  // Style (user overrides — NOT passed to AI, applied in post-processing)
  bgColor?: string;      // page background color (was: secondaryColor)
  textColor?: string;    // body text color
  accentColor?: string;  // brand/button accent color (was: primaryColor)
  fontFamily?: string;
  // Content guidance
  siteObjective?: string;
  tone?: string;
  strengths?: string[];
  services?: string[];
  useAnchorNav?: boolean;
  creativeMode?: boolean;
}

async function fetchImageAsBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'image/png';
    const data = Buffer.from(buffer).toString('base64');
    return { mimeType, data };
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error);
    return null;
  }
}

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite-preview';
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_EXTRA_PAGES = 10;
const ALLOWED_DOMAINS = ['supabase.co', 'supabase.in'];

// Deterministic CTA label from site objective
function deriveCTALabel(siteObjective?: string, language?: string): string {
  const isIt = !language || language === 'it';
  const obj = (siteObjective || '').toLowerCase();
  if (obj.includes('prenotat') || obj.includes('book') || obj.includes('reserv')) return isIt ? 'Prenota ora' : 'Book now';
  if (obj.includes('contact') || obj.includes('contat')) return isIt ? 'Contattaci' : 'Contact us';
  if (obj.includes('prevent') || obj.includes('quote')) return isIt ? 'Richiedi preventivo' : 'Get a quote';
  if (obj.includes('acquist') || obj.includes('buy') || obj.includes('shop')) return isIt ? 'Acquista' : 'Buy now';
  return isIt ? 'Scopri di più' : 'Learn more';
}

function deriveCTAUrl(siteObjective?: string, useAnchorNav?: boolean, pages?: any[]): string {
  const obj = (siteObjective || '').toLowerCase();
  const isContact = obj.includes('contact') || obj.includes('contat') || obj.includes('prenotat') || obj.includes('book') || obj.includes('prevent') || obj.includes('quote');
  if (useAnchorNav) return '#contatti';
  if (isContact && pages) {
    const contactPage = pages.find((p: any) => p.slug?.includes('contat') || p.slug?.includes('contact') || p.slug?.includes('prenotat'));
    if (contactPage) return `/${contactPage.slug}`;
  }
  return '#contatti';
}

export async function generateProjectWithAI(data: AIGenerationData) {
  // Input validation
  if (!data.businessName?.trim()) return { success: false, error: 'Nome attività obbligatorio.' };
  if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
    return { success: false, error: `Descrizione troppo lunga (max ${MAX_DESCRIPTION_LENGTH} caratteri).` };
  }
  if (data.extraPages && data.extraPages.length > MAX_EXTRA_PAGES) {
    return { success: false, error: `Massimo ${MAX_EXTRA_PAGES} pagine extra.` };
  }
  // Validate screenshot/logo URLs are from trusted storage only
  const allUrls = [...(data.screenshotUrls || []), ...(data.logoUrl ? [data.logoUrl] : [])];
  for (const url of allUrls) {
    try {
      const hostname = new URL(url).hostname;
      if (!ALLOWED_DOMAINS.some(d => hostname.endsWith(d))) return { success: false, error: 'URL immagine non valida.' };
    } catch { return { success: false, error: 'URL immagine non valida.' }; }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  const aiCheck = await canUseAI(user.id);
  if (!aiCheck.allowed) return { success: false, error: aiCheck.reason };

  const projectCheck = await canCreateProject(user.id);
  if (!projectCheck.allowed) return { success: false, error: projectCheck.reason };

  // Lazy cleanup: remove ai-temp files for this user older than 30 minutes
  // Path: {userId}/ai-temp/{filename}
  try {
    const TTL_MS = 30 * 60 * 1000;
    const prefix = `${user.id}/ai-temp`;
    const { data: staleFiles } = await supabase.storage.from('project-assets').list(prefix);
    if (staleFiles?.length) {
      const toDelete = staleFiles
        .filter(f => f.created_at && Date.now() - new Date(f.created_at).getTime() > TTL_MS)
        .map(f => `${prefix}/${f.name}`);
      if (toDelete.length > 0) await supabase.storage.from('project-assets').remove(toDelete);
    }
  } catch { /* best-effort */ }

  try {
    const cleanPhone = data.phone ? data.phone.replace(/\D/g, '') : '';
    const currentYear = new Date().getFullYear();

    const promptParts: any[] = [
      { text: AI_WEBSITE_GENERATOR_SYSTEM_PROMPT },
      {
        text: `
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
Socials: ${data.socials?.map(s => {
          if (s.platform === 'whatsapp') return `WhatsApp: wa.me/${s.url.replace(/\D/g, '')}`;
          return `${s.platform}: ${s.url}`;
        }).join(', ') || 'None'}

EXTRA PAGES REQUESTED:
${data.extraPages?.map(p => `- ${p.name}: ${p.description}`).join('\n') || 'None'}

### MANDATORY TOTAL PAGES: ${1 + (data.extraPages?.length || 0)}
You MUST return exactly ${1 + (data.extraPages?.length || 0)} pages:
1. Home (slug: "home")
${data.extraPages?.map((p, i) => `${i + 2}. ${p.name} (slug: "${p.name.toLowerCase().replace(/\s+/g, '-')}")`).join('\n') || ''}
${data.useAnchorNav !== undefined ? `
PAGE TYPE: ${data.useAnchorNav ? 'SINGLE PAGE with anchor navigation. Use #section-id format for all internal links (e.g. #chi-siamo, #servizi, #contatti).' : 'SINGLE PAGE without anchor navigation.'}
` : ''}
${!data.fontFamily ? `
FONT: Choose the most appropriate font from the available list based on tone and business type.
` : ''}
${data.creativeMode ? `
### CREATIVE MODE: Be bold and inventive. Use rich, varied content. Max 10 blocks per page.
` : ''}
`
      }
    ];

    // Add Logo (as base64)
    if (data.logoUrl) {
      const logoData = await fetchImageAsBase64(data.logoUrl);
      if (logoData) {
        promptParts.push({ text: "This is the business logo:" });
        promptParts.push({ inlineData: logoData });
      }
    }

    // Add Screenshots (as base64)
    if (data.screenshotUrls && data.screenshotUrls.length > 0) {
      promptParts.push({ text: "Use these screenshots for global design extraction (typography, colors, padding, etc.):" });
      for (const url of data.screenshotUrls) {
        const screenshotData = await fetchImageAsBase64(url);
        if (screenshotData) promptParts.push({ inlineData: screenshotData });
      }
    }

    // --- CACHE CHECK (disabled for production — re-enable for local testing) ---
    // const cacheKey = getCacheKey('gen', {
    //   systemPrompt: AI_WEBSITE_GENERATOR_SYSTEM_PROMPT,
    //   businessName: data.businessName, businessType: data.businessType, description: data.description,
    //   extraPages: data.extraPages, language: data.language, email: data.email, phone: data.phone,
    //   address: data.address, city: data.city, zip: data.zip, country: data.country,
    //   socials: data.socials, siteObjective: data.siteObjective, tone: data.tone,
    //   strengths: data.strengths, services: data.services, useAnchorNav: data.useAnchorNav, creativeMode: data.creativeMode,
    //   fontFamily: data.fontFamily, logoUrl: data.logoUrl, screenshotUrls: data.screenshotUrls,
    // });
    // const cached = readCache(cacheKey);
    // if (cached) { console.log('[AI Generator] Using cached response'); }

    let aiOutput: any = null;

    {
      // Call Gemini with fallback + retry on bad JSON
      const isRetryableError = (err: any) => {
        const status = err?.status || err?.response?.status || err?.httpStatusCode;
        return status === 429 || status === 503 || status === 500 || status === 403;
      };
      const MODEL_TIMEOUT = 360000;
      const callModel = async (modelName: string, parts: any[]) => {
        const model = getGenAI().getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: 'application/json' } });
        const result = await Promise.race([
          model.generateContent(parts),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${modelName}`)), MODEL_TIMEOUT))
        ]);
        return JSON.parse(result.response.text());
      };

      let usedModel = PRIMARY_MODEL;
      // Primary: 1 attempt + 1 JSON retry
      try {
        try {
          aiOutput = await callModel(PRIMARY_MODEL, promptParts);
        } catch (firstErr: any) {
          if (firstErr instanceof SyntaxError) {
            console.warn(`[AI Generator] ${PRIMARY_MODEL} returned invalid JSON, retrying once...`);
            aiOutput = await callModel(PRIMARY_MODEL, promptParts);
          } else { throw firstErr; }
        }
      } catch (primaryErr: any) {
        // Fallback: 1 attempt, no retry
        if (isRetryableError(primaryErr) || primaryErr instanceof SyntaxError) {
          console.warn(`[AI Generator] falling back to ${FALLBACK_MODEL}`);
          usedModel = FALLBACK_MODEL;
          aiOutput = await callModel(FALLBACK_MODEL, promptParts);
        } else { throw primaryErr; }
      }
      // writeCache(cacheKey, aiOutput);
    }

    // Validate structure
    if (!aiOutput.settings || !aiOutput.pages) return { success: false, error: "L'IA ha generato una struttura incompleta. Riprova." };

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
      socialLinks: data.socials || aiDetails.socials || []
    };

    // Nav links (deterministic)
    const allPageLinks = pages.map((p: any) => ({
      label: p.slug === 'home' ? 'Home' : (p.title || p.slug.charAt(0).toUpperCase() + p.slug.slice(1)),
      url: p.slug === 'home' ? '/home' : (p.slug.startsWith('/') ? p.slug : `/${p.slug}`)
    }));
    const finalNavLinks = (pages.length > 1) ? allPageLinks : (aiOutput.settings?.navigation?.links?.length > 0 ? aiOutput.settings.navigation.links : allPageLinks);

    const finalBusinessName = data.businessName || aiDetails.businessName || 'My Website';

    // --- DETERMINISTIC STYLE ---

    // 1. Colors: user overrides > AI output
    const userBG     = data.bgColor     || null;
    const userText   = data.textColor   || null;
    const userAccent = data.accentColor || null;

    // Per-business-type color defaults (used when AI doesn't generate themeColors)
    const DEFAULT_COLORS_BY_TYPE: Record<string, { bg: string; text: string; accent: string }> = {
      Restaurant:                   { bg: '#fdf6f0', text: '#2d1b0e', accent: '#c0392b' },
      LocalBusiness:                { bg: '#f8fafc', text: '#1e293b', accent: '#2563eb' },
      ProfessionalService:          { bg: '#f8fafc', text: '#1e293b', accent: '#2563eb' },
      HealthAndBeautyBusiness:      { bg: '#fdf4f8', text: '#3d1a2e', accent: '#c2185b' },
      HomeAndConstructionBusiness:  { bg: '#f5f7fa', text: '#1c2b3a', accent: '#1565c0' },
      EducationalOrganization:      { bg: '#f0f7ff', text: '#0d2d5e', accent: '#1976d2' },
      SportsActivityLocation:       { bg: '#f0fdf4', text: '#14342b', accent: '#16a34a' },
      TravelAgency:                 { bg: '#f0f9ff', text: '#0c3247', accent: '#0284c7' },
      Store:                        { bg: '#fafaf9', text: '#1c1917', accent: '#d97706' },
      Organization:                 { bg: '#f8fafc', text: '#1e293b', accent: '#7c3aed' },
    };
    const typeColors = DEFAULT_COLORS_BY_TYPE[data.businessType] || { bg: '#f8f9fa', text: '#1a1a2e', accent: '#3b82f6' };

    const aiBG     = aiOutput.settings?.themeColors?.light?.bg   || typeColors.bg;
    const aiText   = aiOutput.settings?.themeColors?.light?.text || typeColors.text;
    const aiAccent = aiOutput.settings?.accentColor              || typeColors.accent;

    const themeBG   = userBG     || aiBG;
    const themeText = userText   || aiText;
    const accentBG  = userAccent || aiAccent;

    // 2. Button colors
    const primaryCTABG   = accentBG;
    const primaryCTAText = getContrastColor(accentBG);
    const secondaryCTABG   = darkenHSL(accentBG, 15);
    const secondaryCTAText = getContrastColor(secondaryCTABG);

    // 3. Appearance: deterministic from luminance
    const isDark = getLuminance(themeBG) < getLuminance(themeText);
    const finalAppearance = isDark ? 'dark' : 'light';

    // 4. Pre-AI deterministic button params (based on tone)
    const tone = data.tone || 'professional';
    const buttonRadiusMap: Record<string, number> = { creativo: 22, creative: 22, amichevole: 14, friendly: 14, professionale: 6, professional: 6, formale: 3, formal: 3 };
    const buttonRadius = buttonRadiusMap[tone] ?? 8;
    const buttonShadow = isDark ? 'none' : (tone === 'formale' || tone === 'formal' ? 'none' : 'M');
    const buttonAnimation = (tone === 'creativo' || tone === 'creative') ? 'bounce' : (tone === 'amichevole' || tone === 'friendly') ? 'pulse' : 'none';

    // 5. Font validation
    const fontFamily = data.fontFamily
      || (AVAILABLE_FONTS.includes(aiOutput.settings?.fontFamily) ? aiOutput.settings.fontFamily : null)
      || TONE_FONT_FALLBACK[tone]
      || 'Outfit';

    const hasUserLogo = !!data.logoUrl;
    const finalLogo = hasUserLogo ? data.logoUrl : '';
    const finalLogoType = hasUserLogo ? 'image' : 'text';

    const finalSettings = {
      ...aiOutput.settings,
      appearance: finalAppearance,
      primaryColor:   primaryCTABG,     // brand/button accent
      secondaryColor: secondaryCTABG,   // secondary button
      fontFamily,
      buttonRadius,
      buttonShadow,
      buttonAnimation,
      logo: finalLogo,
      favicon: finalLogo || undefined,
      metaImage: finalLogo || undefined,
      metaTitle: finalBusinessName,
      metaDescription: aiOutput.settings?.metaDescription || (data.language === 'en' ? `${finalBusinessName} — Official website` : `${finalBusinessName} — Sito ufficiale`),
      languages: [data.language || 'it'],
      defaultLanguage: data.language || 'it',
      businessDetails: { ...aiOutput.settings?.businessDetails, ...finalBusinessDetails, businessName: finalBusinessName },
      themeColors: {
        light: { bg: !isDark ? themeBG : '#ffffff', text: !isDark ? themeText : '#000000' },
        dark:  { bg:  isDark ? themeBG : '#0c0c0e', text:  isDark ? themeText : '#ffffff'  },
        buttonText:          primaryCTAText,
        buttonTextSecondary: secondaryCTAText,
      }
    };

    // --- PAGE ENRICHMENT ---
    const validSlugs = new Set(pages.map((p: any) => p.slug));

    const enrichedPages = pages.map((page: any) => {
      const pageId = uuidv4();
      const slugCounts: Record<string, number> = {};
      const anchorIdsFromNav = finalNavLinks
        .filter((l: any) => l.url?.startsWith('#'))
        .map((l: any) => l.url.slice(1));

      const interiorBlocks = page.blocks?.map((b: any) => {
        // Deterministic Section ID
        let baseSlug = b.content?.title
          ? b.content.title.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')
          : b.type;
        const matchingAnchor = anchorIdsFromNav.find((aId: string) => {
          const aIdSlug = aId.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
          return baseSlug.includes(aIdSlug) || aIdSlug.includes(baseSlug);
        });
        if (matchingAnchor && !Object.values(slugCounts).includes(matchingAnchor as any)) baseSlug = matchingAnchor;
        slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
        const finalSectionId = slugCounts[baseSlug] > 1 ? `${baseSlug}-${slugCounts[baseSlug]}` : baseSlug;

        const blockWithId = {
          ...b,
          id: b.id || uuidv4(),
          content: { ...b.content, sectionId: b.content?.sectionId || finalSectionId },
          style: { ...b.style }
        };

        // Overlay on ANY block with backgroundImage
        if (blockWithId.content?.backgroundImage) {
          blockWithId.style.overlayOpacity = blockWithId.style.overlayOpacity || 65;
          blockWithId.style.overlayColor   = blockWithId.style.overlayColor   || '#000000';
          if (!blockWithId.style.textColor) {
            // Always white text over dark overlay, regardless of theme
            blockWithId.style.textColor = getContrastColor(blockWithId.style.overlayColor || '#000000');
          }
        }

        // Pattern: color and opacity deterministic
        if (blockWithId.style?.patternType && blockWithId.style.patternType !== 'none') {
          blockWithId.style.patternColor   = themeText;
          blockWithId.style.patternOpacity = isDark ? 8 : 7;
        }

        // Block backgroundColor: enforce palette (only colors from theme)
        if (blockWithId.style?.backgroundColor) {
          if (!isInPalette(blockWithId.style.backgroundColor, [themeBG, themeText, accentBG])) {
            // AI used an off-palette color — replace with accent background
            blockWithId.style.backgroundColor = accentBG;
          }
        }

        // Contact block: showMap deterministic — true if address is provided
        if (blockWithId.type === 'contact' && data.address) {
          blockWithId.content.showMap = true;
        }

        // URL validation for internal links
        blockWithId.content = validateBlockLinks(blockWithId.content, blockWithId.type, validSlugs, data.useAnchorNav, finalSectionId);

        return blockWithId;
      });

      // CTA for nav
      const ctaLabel = deriveCTALabel(data.siteObjective, data.language);
      const ctaUrl   = deriveCTAUrl(data.siteObjective, data.useAnchorNav, pages);

      const navBlock = {
        id: uuidv4(),
        type: 'navigation',
        content: {
          ...aiOutput.settings?.navigation,
          logoText:    finalBusinessName,
          logoType:    finalLogoType,
          logoImage:   finalLogo,
          links:       finalNavLinks,
          showContact: true,
          ctaLabel,
          ctaUrl,
          showCTA: true,
        },
        style: { padding: 20, isSticky: true, backgroundColor: undefined, textColor: undefined }
      };

      const footerBlock = {
        id: uuidv4(),
        type: 'footer',
        content: {
          ...aiOutput.settings?.footer,
          logoType:   finalLogoType,
          logoImage:  finalLogo,
          logoText:   finalBusinessName,
          links:      finalNavLinks,
          socialLinks: finalBusinessDetails.socialLinks,
          copyright:  `© ${currentYear} ${finalBusinessName}. Tutti i diritti riservati.`,
        },
        style: { padding: 60, backgroundColor: undefined, textColor: undefined }
      };

      return { ...page, id: pageId, blocks: [navBlock, ...interiorBlocks, footerBlock] };
    });

    // Validate background images (best-effort, non-blocking)
    await validateAndCleanBackgroundImages(enrichedPages, data.businessType);

    // Increment credits
    await supabase.rpc('increment_ai_usage', { p_user_id: user.id });

    return { success: true, data: { settings: finalSettings, pages: enrichedPages } };

  } catch (error: any) {
    console.error('[AI Generator] Error:', error);
    return { success: false, error: error.message || 'Errore durante la generazione con IA.' };
  }
}

// Validate internal links in block content
function validateBlockLinks(content: any, blockType: string, validSlugs: Set<string>, useAnchorNav?: boolean, currentSectionId?: string): any {
  if (!content) return content;
  const validate = (url: string): string => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) return url;
    if (useAnchorNav) {
      // Expect #anchor format
      const anchor = url.startsWith('#') ? url.slice(1) : url.replace(/^\//, '');
      // We can't fully validate anchors at this point (sectionIds generated later), keep as-is
      return url.startsWith('#') ? url : `#${anchor}`;
    } else {
      // Expect /slug format
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

function picsumFallback(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed.toLowerCase().replace(/\s+/g, '-'))}/800/500`;
}

// Best-effort background image URL validation + cards image fallback
async function validateAndCleanBackgroundImages(enrichedPages: any[], businessType?: string) {
  const checks: Promise<void>[] = [];
  for (const page of enrichedPages) {
    for (const block of page.blocks || []) {
      // Hero / section backgroundImage
      if (block.content?.backgroundImage && block.content.backgroundImage.startsWith('http')) {
        checks.push(
          fetch(block.content.backgroundImage, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
            .then(res => {
              if (!res.ok) {
                block.content.backgroundImage = '';
                delete block.style.overlayOpacity;
                delete block.style.overlayColor;
                delete block.style.textColor;
              }
            })
            .catch(() => {
              // Network error: keep the URL (may still work client-side)
            })
        );
      }

      // Cards / any block with items[*].image
      const items = block.content?.items;
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.image && item.image.startsWith('http')) {
            if (item.image.includes('picsum.photos')) continue;
            const seed = (item.title || item.name || businessType || 'business');
            checks.push(
              fetch(item.image, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
                .then(res => { if (!res.ok) item.image = picsumFallback(seed); })
                .catch(() => { item.image = picsumFallback(seed); })
            );
          }
        }
      }

      // image-text block imageUrl
      if (block.type === 'image-text' && block.content?.imageUrl && block.content.imageUrl.startsWith('http')) {
        if (!block.content.imageUrl.includes('picsum.photos')) {
          const seed = (block.content.title || businessType || 'business');
          checks.push(
            fetch(block.content.imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
              .then(res => { if (!res.ok) block.content.imageUrl = picsumFallback(seed); })
              .catch(() => { block.content.imageUrl = picsumFallback(seed); })
          );
        }
      }
    }
  }
  await Promise.allSettled(checks);
}

export async function validateProjectDescription(data: {
  businessName: string;
  businessType: string;
  description: string;
  extraPages?: { name: string; description: string }[];
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  socials?: any[];
}) {
  const cacheKey = getCacheKey('val', {
    prompt: AI_VALIDATION_PROMPT,
    businessName: data.businessName, businessType: data.businessType,
    description: data.description, extraPages: data.extraPages,
    email: data.email, phone: data.phone, address: data.address,
    city: data.city, zip: data.zip, country: data.country, socials: data.socials,
  });
  const cached = readCache(cacheKey);
  if (cached) { console.log('[AI Validation] Using cached response'); return cached; }

  const prompt = `
${AI_VALIDATION_PROMPT}

PROJECT DETAILS:
Business Name: ${data.businessName}
Business Type: ${data.businessType}
Description: ${data.description}
Email: ${data.email || 'Not provided'}
Phone: ${data.phone || 'Not provided'}
Address: ${data.address || 'Not provided'}
City: ${data.city || 'Not provided'}
ZIP/CAP: ${data.zip || 'Not provided'}
Country: ${data.country || 'Italia'}
Socials: ${data.socials?.map(s => `${s.platform}: ${s.url}`).join(', ') || 'None'}
Extra Pages: ${data.extraPages?.map(p => `- ${p.name}: ${p.description}`).join('\n') || 'None'}
  `;

  const isRetryableError = (err: any) => {
    const status = err?.status || err?.response?.status || err?.httpStatusCode;
    return status === 429 || status === 503 || status === 500 || status === 403;
  };

  const callValidation = async (modelName: string) => {
    const model = getGenAI().getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: 'application/json' } });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  };

  try {
    let result: any;
    try {
      result = await callValidation(PRIMARY_MODEL);
    } catch (primaryErr: any) {
      if (isRetryableError(primaryErr) || primaryErr instanceof SyntaxError) {
        console.warn(`[AI Validation] falling back to ${FALLBACK_MODEL}`);
        try { result = await callValidation(FALLBACK_MODEL); }
        catch { return { isReady: true, questions: [] }; }
      } else { throw primaryErr; }
    }
    writeCache(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error('[AI Validation] Error:', error);
    const status = error?.status || error?.response?.status;
    if (status === 401) throw new Error('Servizio IA non disponibile. Controlla la configurazione API.');
    return { isReady: true, questions: [] };
  }
}
