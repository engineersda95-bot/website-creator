'use server';

import { AI_VALIDATION_PROMPT, AI_WEBSITE_GENERATOR_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY non configurata. Aggiungi la chiave nel file .env');
  return new GoogleGenerativeAI(key);
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
  // Style forcing
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  appearance?: 'light' | 'dark' | 'auto';
  // Content guidance
  siteObjective?: string;
  tone?: string;
  strengths?: string[];
  useAnchorNav?: boolean;
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

export async function generateProjectWithAI(data: AIGenerationData) {
  // Input validation
  if (!data.businessName?.trim()) {
    return { success: false, error: 'Nome attività obbligatorio.' };
  }
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
      if (!ALLOWED_DOMAINS.some(d => hostname.endsWith(d))) {
        return { success: false, error: 'URL immagine non valida.' };
      }
    } catch {
      return { success: false, error: 'URL immagine non valida.' };
    }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  // 1. Check Credits
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('ai_generations_used, max_ai_generations')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: 'Could not verify user profile' };
  }

  try {
    // 2. Construct Prompt Parts (built once, reused on fallback)
    const cleanPhone = data.phone ? data.phone.replace(/\D/g, '') : '';

    const currentYear = new Date().getFullYear();
    const promptParts: any[] = [
      { text: AI_WEBSITE_GENERATOR_SYSTEM_PROMPT },
      { text: `
        USER INPUT:
        Current Year: ${currentYear}
        Business Name: ${data.businessName}
        Business Type: ${data.businessType}
        Main Description: ${data.description}
        Target Language: ${data.language || 'it'}

        SITE OBJECTIVE (main CTA): ${data.siteObjective || 'General information'}
        TONE OF VOICE: ${data.tone || 'professional'}
        KEY STRENGTHS / USP: ${data.strengths?.join(' | ') || 'Not provided — use generic professional copy'}

        ### 🔴 CTA & TONE RULES:
        - The hero CTA button and all call-to-action elements MUST align with the site objective "${data.siteObjective || 'contact'}".
        - ALL copywriting MUST match the "${data.tone || 'professional'}" tone of voice.
        - If KEY STRENGTHS are provided, create a dedicated "benefits" block using them as the main items. Do NOT invent additional benefits.

        ### 🔴 COPYWRITING RULES (CRITICAL):
        - HERO: Title max 8 words, punchy. Subtitle max 2 short sentences.
        - SECTION TITLES: Use <h2> tags, max 5 words. Bold, clear, scannable.
        - BODY TEXT: Max 2-3 SHORT sentences per paragraph. Break long ideas into bullet points or separate blocks.
        - DO NOT write wall-of-text paragraphs. If you have 4+ sentences about a topic, split into a "benefits" or "cards" block instead.
        - Use clear VISUAL HIERARCHY: big titles, short subtitles, concise body. Each block should be scannable in 3 seconds.
        - When the user provides a long description, EXTRACT the key messages and distribute them across appropriate blocks (hero, benefits, cards, text) — do NOT dump everything into one text block.

        ${data.useAnchorNav !== undefined ? `
        ### 🔴 SINGLE PAGE WITH ANCHOR NAVIGATION:
        ${data.useAnchorNav ? `This is a SINGLE PAGE site with anchor navigation. The navigation links MUST use #section-id format (e.g. #chi-siamo, #servizi, #contatti). Each major block MUST have a corresponding anchor id.` : `This is a SINGLE PAGE site WITHOUT anchor navigation. Do NOT generate navigation links.`}
        ` : ''}

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

        ### 🔴 MANDATORY TOTAL PAGES: ${1 + (data.extraPages?.length || 0)}
        You MUST return exactly ${1 + (data.extraPages?.length || 0)} pages:
        1. Home (slug: "home")
        ${data.extraPages?.map((p, i) => `${i + 2}. ${p.name} (slug: "${p.name.toLowerCase().replace(/\s+/g, '-')}")`).join('\n        ')}

        ### 🔴 NAVIGATION LINK RULE:
        Since there are multiple pages, the navigation block on EVERY page MUST contain links to ALL ${1 + (data.extraPages?.length || 0)} pages using the /slug format.

        ${data.primaryColor || data.secondaryColor || data.fontFamily || data.appearance ? `
        ### 🔴 USER STYLE OVERRIDES (MANDATORY — these override your choices):
        ${data.primaryColor ? `Primary Color: ${data.primaryColor} — YOU MUST use this exact hex for all primary/accent elements.` : ''}
        ${data.secondaryColor ? `Secondary/Background Color: ${data.secondaryColor}` : ''}
        ${data.fontFamily ? `Font Family: "${data.fontFamily}" — YOU MUST use this exact font.` : ''}
        ${data.appearance ? `Appearance: ${data.appearance} — YOU MUST generate a ${data.appearance} theme.` : ''}
        ` : ''}
      `}
    ];

    // Add Logo
    if (data.logoUrl) {
      const logoData = await fetchImageAsBase64(data.logoUrl);
      if (logoData) {
        promptParts.push({ text: "This is the business logo:" });
        promptParts.push({ inlineData: logoData });
      }
    }

    // Add Screenshots
    if (data.screenshotUrls && data.screenshotUrls.length > 0) {
      promptParts.push({ text: "Use these screenshots for global design extraction (typography, colors, padding, etc.):" });
      for (const url of data.screenshotUrls) {
        const screenshotData = await fetchImageAsBase64(url);
        if (screenshotData) {
          promptParts.push({ inlineData: screenshotData });
        }
      }
    }

    // 3. Call Gemini with fallback + retry on bad JSON
    const isRetryableError = (err: any) => {
      const status = err?.status || err?.response?.status || err?.httpStatusCode;
      return status === 429 || status === 503 || status === 500 || status === 403;
    };

    const MODEL_TIMEOUT = 360000; // 5m

    const callModel = async (modelName: string, parts: any[]) => {
      const model = getGenAI().getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await Promise.race([
        model.generateContent(parts),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout: ${modelName} non ha risposto entro ${MODEL_TIMEOUT / 1000}s`)), MODEL_TIMEOUT)
        )
      ]);
      return JSON.parse(result.response.text());
    };

    let aiOutput;
    let usedModel = PRIMARY_MODEL;

    // Try primary model (with 1 JSON retry)
    try {
      try {
        aiOutput = await callModel(PRIMARY_MODEL, promptParts);
      } catch (firstErr: any) {
        if (firstErr instanceof SyntaxError) {
          console.warn(`[AI Generator] ${PRIMARY_MODEL} returned invalid JSON, retrying...`);
          aiOutput = await callModel(PRIMARY_MODEL, promptParts);
        } else {
          throw firstErr;
        }
      }
    } catch (primaryErr: any) {
      // Fallback to lite model on availability/quota errors
      if (isRetryableError(primaryErr) || primaryErr instanceof SyntaxError) {
        console.warn(`[AI Generator] ${PRIMARY_MODEL} failed (${primaryErr?.status || primaryErr?.name || 'unknown'}: ${primaryErr?.message || ''}), falling back to ${FALLBACK_MODEL}`);
        usedModel = FALLBACK_MODEL;
        try {
          aiOutput = await callModel(FALLBACK_MODEL, promptParts);
        } catch (fallbackErr) {
          if (fallbackErr instanceof SyntaxError) {
            console.error(`[AI Generator] ${FALLBACK_MODEL} also returned invalid JSON`);
            return { success: false, error: 'L\'IA ha restituito una risposta non valida. Riprova.' };
          }
          throw fallbackErr;
        }
      } else {
        throw primaryErr;
      }
    }

    // 5. Validate & Enrich AI Output
    if (!aiOutput.settings || !aiOutput.pages) {
      return { success: false, error: 'L\'IA ha generato una struttura incompleta. Riprova.' };
    }
    // Ensure pages is an array with valid entries (must have slug + blocks)
    const rawPages = Array.isArray(aiOutput.pages) ? aiOutput.pages : [];
    const pages = rawPages
      .filter((p: any) => p && typeof p === 'object' && typeof p.slug === 'string')
      .map((p: any) => ({
        ...p,
        title: p.title || p.slug.charAt(0).toUpperCase() + p.slug.slice(1),
        blocks: Array.isArray(p.blocks) ? p.blocks.filter((b: any) => b && b.type) : [],
      }));
    if (pages.length === 0) {
      pages.push({ title: 'Home', slug: 'home', blocks: [] });
    }
    
    // Global Components Decision (Navigation & Footer)
    const navSchema = aiOutput.settings?.navigation || { 
      logoText: data.businessName, 
      logoType: data.logoUrl ? 'image' : 'text', 
      logoImage: data.logoUrl || '',
      links: [],
      showContact: true
    };
    
    const footerSchema = aiOutput.settings?.footer || {
      logoType: data.logoUrl ? 'image' : 'text',
      logoText: data.businessName,
      logoImage: data.logoUrl || '',
      copyright: `© ${currentYear} ${data.businessName}. Tutti i diritti riservati.`,
      socialLinks: data.socials || []
    };

    // Auto-Link Management
    const allPageLinks = pages.map((p: any) => ({
      label: p.slug === 'home' ? (data.language === 'it' ? 'Home' : 'Home') : (p.title || p.slug.charAt(0).toUpperCase() + p.slug.slice(1)),
      url: p.slug === 'home' ? '/home' : (p.slug.startsWith('/') ? p.slug : `/${p.slug}`)
    }));

    const finalNavLinks = (pages.length > 1 || allPageLinks.length > 1) ? allPageLinks : (navSchema.links && navSchema.links.length > 0 ? navSchema.links : allPageLinks);

    const enrichedPages = pages.map((page: any) => {
      const pageId = uuidv4();
      
      // Step A: Strip AI-generated nav/footer (we inject our own), then enrich
      const strippedBlocks = (Array.isArray(page.blocks) ? page.blocks : [])
        .filter((block: any) => block.type !== 'navigation' && block.type !== 'footer');
      const interiorBlocks = strippedBlocks.map((block: any) => {
        const b = {
           ...block,
           id: uuidv4(),
           style: block.style || { padding: 80, align: 'center' },
           content: { ...(block.content || {}) }
        };

        // IF CONTACT BLOCK: Force real user data, NO placeholder invention!
        if (b.type === 'contact') {
            b.content.email = data.email || b.content.email || '';
            b.content.phone = data.phone || b.content.phone || '';
            b.content.address = `${data.address || ''}${data.city ? ', ' + data.city : ''}${data.country ? ', ' + data.country : ''}` || b.content.address || '';
            b.content.showMap = b.content.showMap !== undefined ? b.content.showMap : true;
            b.content.title = b.content.title || (data.language === 'en' ? 'Contact Us' : 'Contattaci');
        }

        return b;
      });

      // Step B: Build Global Blocks
      const navBlock = {
        id: uuidv4(),
        type: 'navigation',
        content: {
          ...navSchema,
          logoText: navSchema.logoText || data.businessName,
          logoType: navSchema.logoType || (data.logoUrl ? 'image' : 'text'),
          logoImage: navSchema.logoImage || data.logoUrl || '',
          links: finalNavLinks
        },
        style: { padding: 20, isSticky: true }
      };

      const footerBlock = {
        id: uuidv4(),
        type: 'footer',
        content: {
          ...footerSchema,
          logoType: footerSchema.logoType || (data.logoUrl ? 'image' : 'text'),
          logoImage: footerSchema.logoImage || data.logoUrl || '',
          logoText: footerSchema.logoText || data.businessName,
          copyright: footerSchema.copyright || `© ${currentYear} ${data.businessName}. Tutti i diritti riservati.`,
          socialLinks: footerSchema.socialLinks || data.socials || []
        },
        style: { padding: 60 }
      };

      // Step C: Link cleanup for multi-page — convert #anchor to /home#anchor
      // Skip hex colors (#fff, #ff0000) and only target anchor-like values (#section-name)
      const isAnchorLink = (val: string) =>
        val.startsWith('#') && !/^#([0-9a-fA-F]{3,8})$/.test(val);

      if (pages.length > 1) {
         const linkKeys = ['url', 'ctaUrl', 'href', 'link'];
         [navBlock, ...interiorBlocks, footerBlock].forEach((block: any) => {
            if (block.content) {
               for (const key of linkKeys) {
                  const val = block.content[key];
                  if (typeof val === 'string' && isAnchorLink(val)) {
                    block.content[key] = `/home${val}`;
                  }
               }
               // Also handle links arrays (nav links, footer links)
               if (Array.isArray(block.content.links)) {
                  block.content.links.forEach((link: any) => {
                    if (typeof link.url === 'string' && isAnchorLink(link.url)) {
                      link.url = `/home${link.url}`;
                    }
                  });
               }
            }
         });
      }

      return {
        ...page,
        id: pageId,
        blocks: [navBlock, ...interiorBlocks, footerBlock]
      };
    });

    // 6. Final Settings cleanup — user overrides take priority over AI output
    const finalAppearance = data.appearance || aiOutput.settings?.appearance || 'light';
    const finalPrimary = data.primaryColor || aiOutput.settings?.primaryColor || '#3b82f6';
    const finalSecondary = data.secondaryColor || aiOutput.settings?.secondaryColor || '#ffffff';
    const finalFont = data.fontFamily || aiOutput.settings?.fontFamily || 'Outfit';
    const isDarkFinal = finalAppearance === 'dark';

    const finalSettings = {
      ...aiOutput.settings,
      // Force user style overrides
      appearance: finalAppearance,
      primaryColor: finalPrimary,
      secondaryColor: finalSecondary,
      fontFamily: finalFont,
      // Ensure themeColors is always set (editor relies on it for background)
      themeColors: {
        light: {
          bg: !isDarkFinal ? finalSecondary : '#ffffff',
          text: !isDarkFinal ? '#000000' : '#000000',
        },
        dark: {
          bg: isDarkFinal ? finalSecondary : '#0c0c0e',
          text: isDarkFinal ? '#ffffff' : '#ffffff',
        },
      },
      // Language settings
      languages: [data.language || 'it'],
      defaultLanguage: data.language || 'it',
      // Global meta
      metaTitle: data.businessName,
      metaDescription: aiOutput.settings?.metaDescription || `${data.businessName} — Sito ufficiale`,
      favicon: data.logoUrl || aiOutput.settings?.favicon || '',
      metaImage: data.logoUrl || aiOutput.settings?.metaImage || '',
      logo: data.logoUrl || aiOutput.settings?.logo || '',
      businessDetails: {
        ...aiOutput.settings?.businessDetails,
        businessName: data.businessName,
        email: data.email || aiOutput.settings?.businessDetails?.email || '',
        phone: data.phone || aiOutput.settings?.businessDetails?.phone || '',
        address: data.address || aiOutput.settings?.businessDetails?.address || '',
        city: data.city || aiOutput.settings?.businessDetails?.city || '',
        postalCode: data.zip || aiOutput.settings?.businessDetails?.postalCode || '',
        country: data.country || aiOutput.settings?.businessDetails?.country || 'Italia'
      }
    };

    // 7. Increment Credits Used
    await supabase
      .from('profiles')
      .update({ ai_generations_used: (profile.ai_generations_used || 0) + 1 })
      .eq('id', user.id);
 
    return { 
      success: true, 
      data: {
        settings: finalSettings,
        pages: enrichedPages
      }
    };

  } catch (error: any) {
    console.error('[AI Generator] Error:', error);
    return { success: false, error: error.message || 'Errore durante la generazione con IA.' };
  }
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
      Extra Pages: ${data.extraPages?.map(p => `- ${p.name}: ${p.description}`).join('\\n') || 'None'}
  `;

  const isRetryableError = (err: any) => {
    const status = err?.status || err?.response?.status || err?.httpStatusCode;
    return status === 429 || status === 503 || status === 500 || status === 403;
  };

  const callValidation = async (modelName: string) => {
    const model = getGenAI().getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  };

  try {
    try {
      return await callValidation(PRIMARY_MODEL);
    } catch (primaryErr: any) {
      if (isRetryableError(primaryErr) || primaryErr instanceof SyntaxError) {
        console.warn(`[AI Validation] ${PRIMARY_MODEL} failed (${primaryErr?.status || primaryErr?.name || 'unknown'}: ${primaryErr?.message || ''}), falling back to ${FALLBACK_MODEL}`);
        try {
          return await callValidation(FALLBACK_MODEL);
        } catch {
          return { isReady: true, questions: [] };
        }
      }
      throw primaryErr;
    }
  } catch (error: any) {
      console.error('[AI Validation] Error:', error);
      const status = error?.status || error?.response?.status;
      if (status === 401) {
        throw new Error('Servizio IA non disponibile. Controlla la configurazione API.');
      }
      return { isReady: true, questions: [] };
  }
}
