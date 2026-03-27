'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { AI_WEBSITE_GENERATOR_SYSTEM_PROMPT, AI_VALIDATION_PROMPT } from '@/lib/ai/prompts';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export async function generateProjectWithAI(data: AIGenerationData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  // 1. Check Credits (Disabled for now as per user request)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('ai_generations_used, max_ai_generations')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: 'Could not verify user profile' };
  }

  // if (profile.ai_generations_used >= profile.max_ai_generations) {
  //   return { success: false, error: 'Hai esaurito i crediti per la generazione IA. Contatta il supporto per averne altri.' };
  // }

  try {
    // 2. Prepare Gemini Model
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-3-flash-preview',
        generationConfig: { responseMimeType: 'application/json' }
    });

    const cleanPhone = data.phone ? data.phone.replace(/\D/g, '') : '';
    const cleanWhatsapp = data.socials?.find(s => s.platform === 'whatsapp')?.url.replace(/\D/g, '') || '';

    // 3. Construct Prompt Parts
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

    // 4. Call Gemini
    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();
    const aiOutput = JSON.parse(responseText);

    // 5. Validate & Enrich AI Output
    // Ensure pages is an array and filter out any invalid entries
    const rawPages = Array.isArray(aiOutput.pages) ? aiOutput.pages : [];
    // Ensure at least one page exists (Home)
    const pages = rawPages.length > 0 ? rawPages.filter((p: any) => p && typeof p === 'object') : [{ title: 'Home', slug: 'home', blocks: [] }];
    
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
      
      // Step A: Interior blocks enrichment + Contact info force-injection
      const interiorBlocks = (Array.isArray(page.blocks) ? page.blocks : []).map((block: any) => {
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

      // Step C: Link cleanup specifically for multi-page (no internal anchors)
      if (pages.length > 1) {
         [navBlock, ...interiorBlocks, footerBlock].forEach((block: any) => {
            if (block.content) {
               Object.keys(block.content).forEach(key => {
                  const val = block.content[key];
                  if (typeof val === 'string' && val.startsWith('#')) {
                    block.content[key] = `/home${val}`;
                  }
               });
            }
         });
      }

      return {
        ...page,
        id: pageId,
        blocks: [navBlock, ...interiorBlocks, footerBlock]
      };
    });

    // 6. Final Settings cleanup
    const finalSettings = {
      ...aiOutput.settings,
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
  const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" }
  });

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

  try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
  } catch (error) {
      console.error('[AI Validation] Error:', error);
      return { isReady: true, questions: [] }; 
  }
}
