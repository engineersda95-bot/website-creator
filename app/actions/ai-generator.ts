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

function getContrastColor(hexcolor: string): string {
  // If hex is not provided or invalid, return white default
  if (!hexcolor || !hexcolor.startsWith('#')) return '#ffffff';
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
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
  textColor?: string;
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

        ### 🔴 CTA & TONE RULES:
        - The hero CTA button and all call-to-action elements MUST strictly align with the site objective: "${data.siteObjective || 'contact'}".
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

    // Extract business details from AI (includes validation answers)
    const aiDetails = aiOutput.settings?.businessDetails || {};
    const finalBusinessDetails = {
      businessName: aiDetails.businessName || data.businessName,
      email: data.email || aiDetails.email || '',
      phone: data.phone || aiDetails.phone || '',
      address: data.address || aiDetails.address || '',
      city: data.city || aiDetails.city || '',
      postalCode: aiDetails.zip || aiDetails.zip || '',
      country: data.country || aiDetails.country || 'Italia',
      socialLinks: data.socials || aiDetails.socials || []
    };

    // Auto-Link Management
    const allPageLinks = pages.map((p: any) => ({
      label: p.slug === 'home' ? (data.language === 'it' ? 'Home' : 'Home') : (p.title || p.slug.charAt(0).toUpperCase() + p.slug.slice(1)),
      url: p.slug === 'home' ? '/home' : (p.slug.startsWith('/') ? p.slug : `/${p.slug}`)
    }));

    const finalNavLinks = (pages.length > 1 || allPageLinks.length > 1) ? allPageLinks : (aiOutput.settings?.navigation?.links && aiOutput.settings.navigation.links.length > 0 ? aiOutput.settings.navigation.links : allPageLinks);

    // Global Components Decision (Navigation & Footer)
    const navSchema = aiOutput.settings?.navigation || {
      logoText: finalBusinessDetails.businessName,
      logoType: data.logoUrl ? 'image' : 'text',
      logoImage: data.logoUrl || '',
      links: finalNavLinks,
      showContact: true
    };

    const footerSchema = aiOutput.settings?.footer || {
      logoType: data.logoUrl ? 'image' : 'text',
      logoText: finalBusinessDetails.businessName,
      logoImage: data.logoUrl || '',
      copyright: `© ${currentYear} ${finalBusinessDetails.businessName}. ${data.language === 'en' ? 'All rights reserved.' : 'Tutti i diritti riservati.'}`,
      socialLinks: finalBusinessDetails.socialLinks,
      links: finalNavLinks
    };

    // --- 6. DETERMINISTIC STYLE & BRANDING ---
    const finalAppearance = data.appearance || aiOutput.settings?.appearance || 'light';
    const isDark = finalAppearance === 'dark';

    // SOURCE OF TRUTH: Theme Colors
    const themeBG = data.secondaryColor || (isDark ? (aiOutput.settings?.themeColors?.dark?.bg || '#0c0c0e') : (aiOutput.settings?.themeColors?.light?.bg || '#ffffff'));
    const themeText = data.textColor || (isDark ? (aiOutput.settings?.themeColors?.dark?.text || '#ffffff') : (aiOutput.settings?.themeColors?.light?.text || '#000000'));

    // BRAND COLOR RULE: CTA Inversion (Primary BG = Theme Text, Primary Text = Theme BG)
    const primaryCTABG = themeText;
    const primaryCTAText = themeBG;

    const darkenColor = (hex: string, amount: number) => {
      if (!hex || hex === 'transparent' || !hex.startsWith('#')) return hex;
      let r = parseInt(hex.slice(1, 3), 16) || 0;
      let g = parseInt(hex.slice(3, 5), 16) || 0;
      let b = parseInt(hex.slice(5, 7), 16) || 0;
      r = Math.max(0, r - amount);
      g = Math.max(0, g - amount);
      b = Math.max(0, b - amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const secondaryCTABG = darkenColor(primaryCTABG, 30);
    const secondaryCTAText = primaryCTAText;

    // LOGO RULE: Only use image if USER provided it. Otherwise, Title Text.
    const hasUserLogo = !!data.logoUrl;
    const finalLogo = hasUserLogo ? data.logoUrl : '';
    const finalLogoType = hasUserLogo ? 'image' : 'text';
    const finalBusinessName = data.businessName || aiOutput.settings?.businessDetails?.businessName || 'My Website';

    const finalSettings = {
      ...aiOutput.settings,
      appearance: finalAppearance,
      primaryColor: primaryCTABG,
      secondaryColor: secondaryCTABG,
      fontFamily: data.fontFamily || aiOutput.settings?.fontFamily || 'Outfit',
      logo: finalLogo,
      favicon: finalLogo || undefined,
      metaImage: finalLogo || undefined,
      metaTitle: finalBusinessName,
      metaDescription: aiOutput.settings?.metaDescription || (data.language === 'en' ? `${finalBusinessName} — Official website` : `${finalBusinessName} — Sito ufficiale`),
      languages: [data.language || 'it'],
      defaultLanguage: data.language || 'it',
      businessDetails: {
        ...aiOutput.settings?.businessDetails,
        ...finalBusinessDetails,
        businessName: finalBusinessName
      },
      themeColors: {
        light: { bg: !isDark ? themeBG : '#ffffff', text: !isDark ? themeText : '#000000' },
        dark: { bg: isDark ? themeBG : '#0c0c0e', text: isDark ? themeText : '#ffffff' },
        buttonText: primaryCTAText,
        buttonTextSecondary: secondaryCTAText,
      }
    };

    // --- 7. FINAL PAGE ENRICHMENT (with Blocks) ---
    const enrichedPages = aiOutput.pages?.map((page: any) => {
      const pageId = uuidv4();

      const slugCounts: Record<string, number> = {};
      const anchorIdsFromNav = finalNavLinks
        .filter((l: any) => l.url && l.url.startsWith('#'))
        .map((l: any) => l.url.slice(1));

      const interiorBlocks = page.blocks?.map((b: any, bIdx: number) => {
        // Deterministic Section ID / Slug
        let baseSlug = b.content?.title
          ? b.content.title.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')
          : b.type;

        // Match with AI intended anchor links if possible
        const matchingAnchor = anchorIdsFromNav.find((aId: string) => {
          const aIdSlug = aId.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
          return baseSlug.includes(aIdSlug) || aIdSlug.includes(baseSlug);
        });

        if (matchingAnchor && !Object.values(slugCounts).includes(matchingAnchor as any)) {
          baseSlug = matchingAnchor;
        }

        slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
        const finalSectionId = slugCounts[baseSlug] > 1 ? `${baseSlug}-${slugCounts[baseSlug]}` : baseSlug;

        const blockWithId = {
          ...b,
          id: b.id || uuidv4(),
          content: {
            ...b.content,
            sectionId: b.content?.sectionId || finalSectionId
          },
          style: { ...b.style }
        };

        // Enforce Hero Image Readability
        if (blockWithId.type === 'hero' && blockWithId.content?.backgroundImage) {
          blockWithId.style.overlayOpacity = blockWithId.style.overlayOpacity || 65;
          blockWithId.style.overlayColor = blockWithId.style.overlayColor || '#000000';
          // Force high contrast text (use theme background as text color over dark image)
          if (!blockWithId.style.textColor) {
            blockWithId.style.textColor = themeBG;
          }
        }

        return blockWithId;
      });

      const navBlock = {
        id: uuidv4(),
        type: 'navigation',
        content: {
          ...aiOutput.settings?.navigation,
          logoText: finalBusinessName,
          logoType: finalLogoType,
          logoImage: finalLogo,
          links: finalNavLinks, // Force deterministic links
          showContact: true
        },
        style: { padding: 20, isSticky: true, backgroundColor: undefined, textColor: undefined }
      };

      const footerBlock = {
        id: uuidv4(),
        type: 'footer',
        content: {
          ...aiOutput.settings?.footer,
          logoType: finalLogoType,
          logoImage: finalLogo,
          logoText: finalBusinessName,
          links: finalNavLinks, // Force deterministic links
          socialLinks: finalBusinessDetails.socialLinks, // Force deterministic socials
          copyright: `© ${new Date().getFullYear()} ${finalBusinessName}. Tutti i diritti riservati.`,
        },
        style: { padding: 60, backgroundColor: undefined, textColor: undefined }
      };

      return {
        ...page,
        id: pageId,
        blocks: [navBlock, ...interiorBlocks, footerBlock]
      };
    });

    // --- 8. FINISH ---
    // Increment Credits Used
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

// ─── Blog text improvement with AI ──────────────────────────────────────────

export type AITextAction = 'improve' | 'expand' | 'summarize' | 'rewrite';
export type AITextTone = 'professional' | 'casual' | 'formal' | 'persuasive' | 'technical';

interface ImproveTextInput {
  text: string;
  action: AITextAction;
  tone: AITextTone;
  language: string;
  customInstruction?: string;
}

export async function improveTextWithAI(input: ImproveTextInput): Promise<{ result: string }> {
  const { text, action, tone, language, customInstruction } = input;

  if (!text || text.replace(/<[^>]*>/g, '').trim().length < 10) {
    throw new Error('Il testo è troppo corto per essere migliorato.');
  }

  const actionMap: Record<AITextAction, string> = {
    improve: 'Migliora la scrittura: rendi il testo più fluido, chiaro e coinvolgente. Correggi errori grammaticali e migliora la struttura delle frasi.',
    expand: 'Espandi il testo: aggiungi dettagli, esempi e paragrafi per rendere il contenuto più completo e approfondito. Almeno il doppio della lunghezza.',
    summarize: 'Riassumi il testo: mantieni i concetti chiave ma riduci significativamente la lunghezza. Massimo 1/3 della lunghezza originale.',
    rewrite: 'Riscrivi completamente il testo: mantieni il significato ma cambia completamente la struttura e le parole usate.',
  };

  const toneMap: Record<AITextTone, string> = {
    professional: 'Tono professionale: competente, autorevole, bilanciato.',
    casual: 'Tono informale/colloquiale: amichevole, accessibile, diretto.',
    formal: 'Tono formale/istituzionale: elegante, distaccato, preciso.',
    persuasive: 'Tono persuasivo/marketing: coinvolgente, orientato all\'azione, emotivo.',
    technical: 'Tono tecnico: preciso, dettagliato, con terminologia specifica del settore.',
  };

  const langMap: Record<string, string> = {
    it: 'italiano', en: 'inglese', es: 'spagnolo', fr: 'francese', de: 'tedesco',
  };

  const prompt = `Sei un copywriter professionista. Devi lavorare su un testo per un articolo di blog.

AZIONE: ${actionMap[action]}
TONO: ${toneMap[tone]}
LINGUA: Scrivi in ${langMap[language] || language}.
${customInstruction ? `ISTRUZIONE AGGIUNTIVA: ${customInstruction}` : ''}

REGOLE DI STRUTTURA:
- DIVIDI SEMPRE il testo in sezioni chiare con titoli ## (h2) e sottotitoli ### (h3)
- Ogni sezione deve avere un titolo descrittivo e accattivante
- Alterna tra paragrafi, liste puntate, liste numerate e citazioni per rendere il testo dinamico
- Usa **grassetto** per i concetti chiave e *corsivo* per enfasi
- Inserisci almeno 3-5 sezioni con ## anche se il testo originale non le ha
- Ogni sezione deve avere 2-4 paragrafi

REGOLE DI FORMATO:
- Restituisci SOLO il testo risultante in formato Markdown puro
- NON usare HTML — solo Markdown (##, ###, **, *, -, 1., >, [testo](url))
- NON aggiungere commenti, spiegazioni, note o blocchi di codice
- NON iniziare con \`\`\`markdown — restituisci direttamente il contenuto
- Mantieni lo stesso argomento del testo originale

TESTO ORIGINALE:
${text}`;

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
      },
    });

    let output = result.response.text();
    if (!output || output.trim().length < 10) {
      throw new Error('La risposta AI è vuota.');
    }
    // Strip markdown code fences if AI wraps the output
    output = output.trim().replace(/^```(?:markdown|md)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    return { result: output.trim() };
  } catch (error: any) {
    console.error('[AI Improve Text] Error:', error);

    // Try fallback to primary model if lite fails
    if (error?.status === 429 || error?.status === 503) {
      try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8000 },
        });
        let output = result.response.text();
        if (output && output.trim().length >= 10) {
          output = output.trim().replace(/^```(?:markdown|md)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
          return { result: output.trim() };
        }
      } catch { /* fallthrough */ }
    }

    throw new Error(error?.message || 'Errore durante il miglioramento del testo.');
  }
}

// ─── Blog post AI translation ───────────────────────────────────────────

interface TranslateBlogInput {
  title: string;
  excerpt: string;
  body: string; // Markdown
  sourceLang: string;
  targetLang: string;
}

export async function translateBlogPostWithAI(input: TranslateBlogInput): Promise<{ title: string; excerpt: string; body: string }> {
  const { title, excerpt, body, sourceLang, targetLang } = input;

  const langMap: Record<string, string> = {
    it: 'italiano', en: 'inglese', es: 'spagnolo', fr: 'francese', de: 'tedesco',
  };

  const prompt = `Sei un traduttore professionista. Traduci il seguente articolo di blog da ${langMap[sourceLang] || sourceLang} a ${langMap[targetLang] || targetLang}.

REGOLE:
- Mantieni ESATTAMENTE la stessa struttura Markdown (##, ###, **, *, -, liste, link, ecc.)
- Traduci in modo naturale, non letterale — adatta le espressioni alla lingua di destinazione
- NON aggiungere commenti o note
- Rispondi SOLO con un JSON valido con 3 campi: title, excerpt, body

TITOLO ORIGINALE:
${title}

ESTRATTO ORIGINALE:
${excerpt}

CORPO ORIGINALE (Markdown):
${body}

Rispondi con JSON:
{"title": "...", "excerpt": "...", "body": "..."}`;

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 10000, responseMimeType: 'application/json' },
    });

    const output = result.response.text().trim();
    const parsed = JSON.parse(output);
    if (!parsed.title || !parsed.body) throw new Error('Risposta AI incompleta');
    // Strip markdown fences from body
    parsed.body = parsed.body.replace(/^```(?:markdown|md)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    return parsed;
  } catch (error: any) {
    console.error('[AI Translate Blog] Error:', error);
    throw new Error('Errore durante la traduzione. Riprova.');
  }
}
