'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { canUseAI } from '@/lib/permissions';

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite-preview';

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY non configurata.');
  return new GoogleGenerativeAI(key);
}

export interface GenerateHtmlBlockInput {
  prompt: string;
  referenceImageBase64?: string;
  referenceImageMime?: string;
  projectColors?: { bg: string; text: string; accent: string };
  projectFont?: string;
  history?: { role: 'user' | 'assistant'; text: string }[];
  currentHtml?: string;
  currentCss?: string;
  currentJs?: string;
}

export interface GenerateHtmlBlockResult {
  html: string;
  css: string;
  js: string;
}

const FOLLOWUP_SYSTEM_PROMPT = `You are modifying an existing HTML/CSS/JS section for a landing page builder.

OUTPUT FORMAT — respond ONLY with valid JSON, no markdown fences:
{"html":"...","css":"...","js":"..."}

RULES (same as when it was created — never violate these):
- Root element must be <section class="cb-wrap"> or <div class="cb-wrap">. NO padding/margin/background on .cb-wrap.
- Use @container queries (NOT @media) for all responsive breakpoints.
- Images: <div data-chb-img="N" data-chb-ratio="W:H" data-chb-alt="desc"></div> — MANDATORY when the layout has an image slot; never omit it.
- CTAs: <a data-chb-cta="N" data-chb-label="Label" data-chb-url="#"></a> — empty, no content inside.
- SVGs/decorative: <div data-chb-svg="N" data-chb-svg-markup="ENCODED"></div> — encode < &lt; > &gt; " &quot; & &amp; — every character, no exceptions.
- Icons: <span data-chb-icon="ICONNAME"></span> where ICONNAME is the Lucide icon name (e.g. zap, heart, shield, mail, star, arrow-right, check-circle, users, bar-chart, clock, settings, phone). The platform renders it as a Lucide icon the user can swap.
- Headings: font-size: var(--global-h1-fs) … var(--global-h6-fs). Body: var(--global-body-fs). NEVER hardcode px for text.
- NEVER set color on h1-h6, p, li, span, em, strong or any text-content class — use color:inherit on all text elements. The platform controls text color.
- NEVER use text-transform:uppercase on any element.
- ALL content elements must be visible on ALL viewport sizes.
- At @container (max-width:640px): all multi-column layouts collapse to single column.
- Return COMPLETE updated code — preserve everything not asked to change.`;

const SYSTEM_PROMPT = `You are an expert frontend developer. Generate self-contained, responsive HTML/CSS/JS sections for landing pages.

OUTPUT FORMAT — respond ONLY with valid JSON, no markdown fences:
{"html":"<section class=\"cb-wrap\">...</section>","css":"/* raw CSS — NO <style> tags */","js":"/* raw JS — NO <script> tags — empty string if none */"}

══════════════════════════════════════════════════════
HTML STRUCTURE:
- Root element MUST be <section class="cb-wrap"> or <div class="cb-wrap">.
- Inside it, use <div class="cb-inner"> as the main content container (max-width: 1200px, centered).
- All class names must be prefixed with "cb-" to prevent collisions between multiple blocks on the same page.

CSS RULES:
- .cb-wrap: set color: var(--block-color) — NO background, NO padding, NO margin (platform controls these via CSS vars).
- .cb-inner: max-width: 1200px; margin-inline: auto; width: 100%;
- Headings: ALWAYS font-size: var(--global-h1-fs) … var(--global-h6-fs). NEVER hardcode px for h1-h6.
- Body text: ALWAYS font-size: var(--global-body-fs). NEVER hardcode px for paragraphs.
- Platform vars scale automatically — do NOT override font-sizes inside @container blocks.
- You may use clamp() ONLY for decorative non-heading text (e.g. large background watermark numbers).
- Buttons: border-radius: var(--btn-radius).
- NEVER set color on h1-h6, p, li, span, or any class applied to text content — the platform controls text color via var(--block-color) and the user sets it from the sidebar. Setting text color in CSS will break the section for users with dark/light backgrounds. Use color:inherit on all text elements, including span.
- Raw CSS only — no <style> tags.

══════════════════════════════════════════════════════
RESPONSIVE — use @container, NOT @media:
The section wrapper has container-type:inline-size. Use @container queries for ALL layout breakpoints.
Always write rules for both (max-width: 1024px) and (max-width: 640px).

══════════════════════════════════════════════════════
EDITABLE PLACEHOLDERS — CRITICAL:

1. IMAGES — <div data-chb-img="N" data-chb-ratio="W:H" data-chb-alt="description"></div>
   - N starts at 0, increments per image. Ratio examples: "16:9" hero, "1:1" avatar, "9:16" phone mockup.
   - Style the CONTAINER div via CSS — never style the placeholder itself.
   - NEVER use <img> tags for content images — always data-chb-img.
   - MANDATORY: any layout that visually expects an image MUST have a data-chb-img placeholder. Never leave an image slot empty.
   - Example: <div class="cb-img-wrap"><div data-chb-img="0" data-chb-ratio="4:3" data-chb-alt="App screenshot"></div></div>

2. CTA BUTTONS — <a data-chb-cta="N" data-chb-label="Label" data-chb-url="#"></a>
   - Tag MUST be empty (no children). Wrap in <div class="cb-cta-wrap"> for layout.
   - NEVER write custom <button> or styled <a> as CTAs.

3. SVG GRAPHICS — <div data-chb-svg="N" data-chb-svg-markup="ENCODED"></div>
   - For decorative shapes, blobs, illustrations, geometric patterns.
   - FULLY encode the markup: < → &lt;  > → &gt;  " → &quot;  & → &amp; — every character, no exceptions.
   - Example: &lt;svg viewBox=&quot;0 0 100 100&quot;&gt;&lt;circle cx=&quot;50&quot; cy=&quot;50&quot; r=&quot;50&quot;/&gt;&lt;/svg&gt;

4. ICONS — <span data-chb-icon="ICONNAME"></span>
   - Use for any UI icon. ICONNAME is the Lucide icon name in kebab-case.
   - Examples: zap, heart, shield, mail, star, arrow-right, check-circle, users, bar-chart, clock, settings, phone, globe, lock, rocket, sparkles, thumbs-up, trending-up, layers, cpu.
   - The platform renders it as a Lucide icon the user can swap from the sidebar.
   - NEVER write inline SVG for icons — always use data-chb-icon.
   - Size/color via CSS on the span: width, height, color (inherits by default).

══════════════════════════════════════════════════════
DESIGN QUALITY:
- Section background is set by the platform — do NOT set background on .cb-wrap or .cb-inner.
- Use project accent color ONLY for highlights, borders, accents — not as main section background.
- Text color inherited from platform — do not set color on h1-h6, p, span.
- Generous whitespace, clear hierarchy, subtle shadows. Write real copy — no lorem ipsum.

VIEWPORT VISIBILITY — MANDATORY:
- Every content element MUST be visible on ALL viewport sizes (desktop, tablet, mobile).
- NEVER use display:none, visibility:hidden, or opacity:0 on a content element at any @container size.
- Decorative/background elements may be hidden on mobile with display:none ONLY if they don't contain content.

REFERENCE IMAGE (when provided):
- The image is the PRIMARY design source. Replicate layout, spacing, visual hierarchy, and color mood.
- The text prompt is additional context — it does not override the image.
- Reproduce readable text from the image verbatim unless the prompt says otherwise.
- If the image contains a phone mockup, screenshot, or illustration → use data-chb-img with the matching ratio.

══════════════════════════════════════════════════════
MOBILE SAFETY — MANDATORY:
- At @container (max-width: 640px): ALL multi-column layouts MUST collapse to single column.
- NEVER use position:absolute or position:fixed on elements that contain text — use relative flow on mobile.
- ALL absolutely-positioned decorative elements MUST have pointer-events:none and not overflow on mobile. Add overflow:hidden to their parent.
- NEVER hardcode px width/height on a flex/grid child without max-width:100%.
- Images (data-chb-img containers) must use width:100% on mobile.
- The mobile result must be a clean vertical stack with no overlapping elements.

══════════════════════════════════════════════════════
FORBIDDEN:
- background, padding, or margin on .cb-wrap
- Fixed pixel widths on containers
- External fonts (<link>, @import)
- <img> tags or external image URLs
- Custom styled <button> or <a> as CTAs — use data-chb-cta
- Inline SVGs for icons — use data-chb-icon
- Inline SVGs for images/mockups — use data-chb-img
- Inline event handlers (onclick="...")
- alert(), confirm(), prompt(), document.write()
- Tailwind, Bootstrap, or any CSS framework
- \`\`\` code fences in the response
- opacity:0 or visibility:hidden as default CSS state
- Side-by-side columns with no mobile collapse
- position:absolute on text-containing elements without mobile override
- text-transform:uppercase on any element
- @media queries — use @container only
- color property on h1-h6, p, li, span, em, strong, or any class applied to text — use color:inherit instead`;

export async function generateHtmlBlock(
  input: GenerateHtmlBlockInput,
): Promise<{ success: true; data: GenerateHtmlBlockResult } | { success: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autenticato.' };

  const aiCheck = await canUseAI(user.id);
  if (!aiCheck.allowed) return { success: false, error: aiCheck.reason ?? 'Crediti AI esauriti.' };

  if (!input.prompt?.trim()) return { success: false, error: 'Descrizione vuota.' };
  if (input.prompt.length > 3000) return { success: false, error: 'Descrizione troppo lunga (max 3000 caratteri).' };

  const fontContext = input.projectFont
    ? `\nPROJECT FONT: "${input.projectFont}" — already loaded on the page, declare it via font-family in CSS.`
    : '';

  const accentContext = input.projectColors?.accent
    ? `\nACCENT COLOR (use for highlights/borders/accents only, NOT section background): ${input.projectColors.accent}`
    : '';

  const isFollowUp = !!(input.currentHtml || input.currentCss || input.currentJs);

  const systemText = isFollowUp
    ? `${FOLLOWUP_SYSTEM_PROMPT}${fontContext}${accentContext}`
    : `${SYSTEM_PROMPT}${fontContext}${accentContext}`;
  const parts: any[] = [{ text: systemText }];

  const hasImage = !!(input.referenceImageBase64 && input.referenceImageMime);

  if (isFollowUp) {
    // Follow-up: send only current code + user request, no chat history
    parts.push({
      text: `CURRENT CODE TO MODIFY:\n\`\`\`html\n${input.currentHtml ?? ''}\n\`\`\`\n\`\`\`css\n${input.currentCss ?? ''}\n\`\`\`\n\`\`\`js\n${input.currentJs ?? ''}\n\`\`\`\n\nUSER REQUEST: ${input.prompt.trim()}`,
    });
  } else {
    if (hasImage) {
      parts.push({ text: 'REFERENCE IMAGE — PRIMARY design source. Replicate layout and style closely:' });
      parts.push({ inlineData: { mimeType: input.referenceImageMime!, data: input.referenceImageBase64! } });
    }
    parts.push({ text: `USER REQUEST:\n${input.prompt.trim()}` });
  }

  const isRetryable = (err: any) => {
    const s = err?.status || err?.response?.status || err?.httpStatusCode;
    return s === 429 || s === 503 || s === 500 || s === 403;
  };

  const parseModelResponse = (text: string): GenerateHtmlBlockResult => {
    // Strip markdown fences if present
    let raw = text.trim()
      .replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    // Try direct parse first
    try { return JSON.parse(raw) as GenerateHtmlBlockResult; } catch { /* fall through */ }

    // Extract first {...} block (handles trailing text / multiple objects)
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try { return JSON.parse(raw.slice(start, end + 1)) as GenerateHtmlBlockResult; } catch { /* fall through */ }
    }

    // Last resort: regex-extract each field value
    const extract = (key: string) => {
      const m = raw.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      return m ? m[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\') : '';
    };
    const html = extract('html');
    if (!html) throw new SyntaxError(`Cannot parse AI response: ${raw.slice(0, 200)}`);
    return { html, css: extract('css'), js: extract('js') };
  };

  const callModel = async (modelName: string) => {
    const model = getGenAI().getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json', temperature: 0.85 },
    });
    const timeoutMs = isFollowUp ? 45000 : 90000;
    const result = await Promise.race([
      model.generateContent(parts),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout: risposta troppo lenta, riprova.')), timeoutMs)),
    ]);
    return parseModelResponse(result.response.text());
  };

  try {
    let parsed: GenerateHtmlBlockResult;
    try {
      parsed = await callModel(PRIMARY_MODEL);
    } catch (err: any) {
      if (isRetryable(err) || err instanceof SyntaxError) {
        parsed = await callModel(FALLBACK_MODEL);
      } else {
        throw err;
      }
    }

    if (typeof parsed.html !== 'string') return { success: false, error: 'Risposta AI non valida.' };

    await supabase.rpc('increment_ai_usage', { p_user_id: user.id });

    return {
      success: true,
      data: {
        html: parsed.html ?? '',
        css: parsed.css ?? '',
        js: parsed.js ?? '',
      },
    };
  } catch (err: any) {
    console.error('[AI HTML Generator]', err);
    return { success: false, error: err.message || 'Errore durante la generazione AI.' };
  }
}
