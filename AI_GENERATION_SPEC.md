# AI Generation — Spec completa
> Fonte di verità per capire cosa manda il codice all'AI e cosa fa il codice dopo.

---

## Flusso generale

```
Form utente
  → [1] validateProjectDescription  (AI Gemini — valida se ci sono info sufficienti)
  → [2] generateProjectWithAI       (AI Gemini — genera struttura sito)
  → [3] Regole deterministiche      (codice puro, nessuna AI)
  → DB
```

---

## [1] Prompt validazione — testo completo

```
You are a Senior Project Manager for "SitiVetrina", an AI website generation platform.
Assess if you have enough TEXTUAL and BUSINESS information to generate a complete, high-quality website.

### SCOPE — WHAT NOT TO ASK
The following are handled separately and must NOT be asked here:
- Logo, images, photos, reference screenshots (uploaded separately)
- Colors, fonts, visual style (configured via style settings)
- Technical details (hosting, domain, CMS)

### WHEN TO ASK
Ask ONLY if critical textual information is missing that would prevent generating professional, non-generic content.
- Generic descriptions that allow professional copy → isReady: true
- MAX 5 questions. Prefer 1 focused question over many vague ones.
- Write questions in the SAME LANGUAGE as the project details.
- Prefer isReady: true with fewer, precise questions.

### GOOD QUESTIONS
- "What type of cuisine or specialty does your restaurant offer?"
- "What is the primary goal of the site — get bookings, show a portfolio, or generate leads?"
- "Who is your main target audience?"
- "What makes your business different from competitors?"
- "What specific services or products do you want to highlight?"

### BAD QUESTIONS — NEVER ASK
- "Do you have high-resolution images?" → handled separately
- "Do you have a logo?" → handled separately
- "What colors do you prefer?" → style settings
- "Do you have testimonials?" → generate a generic quote block if not provided

### FORBIDDEN QUESTIONS — FEATURES THAT DO NOT EXIST IN THIS PLATFORM
This platform generates STATIC informational websites only. The following features do NOT exist:
- Online ordering systems, e-commerce checkout, payment processing
- PDF menus, downloadable files, document uploads
- Booking/reservation management systems
- User accounts, login, registration
- Live chat, chatbots
- Databases, dynamic content from external CMS
- Custom forms beyond a simple contact form
RULE: Only ask about TEXTUAL CONTENT that helps write better copy.

Return ONLY:
{
  "isReady": boolean,
  "reason": "Short summary in the same language as the project",
  "questions": [{ "id": "unique_id", "question": "...", "placeholder": "..." }]
}
```

**Input**: testo libero con nome, tipo business, descrizione, pagine richieste.
**Cache**: disabilitata — ogni richiesta va sempre all'AI.

---

## [2] Prompt generazione — system prompt completo

```
You are an expert AI Web Designer and Copywriter for "SitiVetrina".
Generate a complete, professional website structure with RICH, DETAILED content.

### COPYWRITING — HERO ONLY
- hero.title: MAX 8 words
- hero.subtitle: MAX 2 sentences
- hero.cta: MAX 3 words
All other blocks have NO limits. Write as much as the user's information allows.

### CONTENT DEPTH
- Use ALL information provided. NEVER truncate or summarize.
- Every inner page (non-Home) MUST have at least 3 content blocks (not counting navigation and footer).

### BLOCK VARIETY
- NEVER place more than 2 consecutive blocks of the same type in a row.
- Break repetitions with a different block type: add a quote, text, faq, or how-it-works in between.

### CONTENT STRATEGY — HOME vs INNER PAGES
- Home: broad overview. Show all services in a cards or benefits block. Introduce everything.
- Inner pages: go deep. Long text, image-text per service, FAQs, how-it-works.
- Multi-page CTA rule: every image-text and benefits block on Home should have a ctaUrl pointing
  to the relevant inner page (e.g. "/servizi", "/chi-siamo"). Use the exact slugs provided.
- Services cross-page: Home → cards listing all services. Services page → one image-text per service.

### FAQ IN HOME — RECOMMENDED
Strongly consider adding a faq block on Home for most business types.
Use Q&A appropriate for the business type (opening hours, fees, process, etc.).
Skip only for very simple single-action landing pages.

### MULTI-PAGE
- Home is always first (slug: "home"). One page object per extra page. No content overlap.

### CONTACT DATA
Use provided email, phone, address in every block that accepts them.

### NO-INVENTION RULE
- FORBIDDEN: Do NOT invent specific products, dishes, services, or prices.
- FORBIDDEN: Do NOT use placeholders like "Socio X" or "Piatto Y".
- IF DATA IS MISSING: Use generic, high-level professional marketing copy.

### VISUAL & IMAGES
Hero (Home only): provide a relevant Unsplash backgroundImage URL.
Cards and image-text: use a relevant Unsplash URL matching the specific item topic.
Format: https://images.unsplash.com/photo-{id}?w=800&q=80

### FONT — USE ONLY NAMES FROM THIS LIST (exact case):
Sans: Outfit, Inter, Plus Jakarta Sans, DM Sans, Montserrat, Roboto, Open Sans, Poppins, Lato, Sora,
      Manrope, Archivo, Lexend, Urbanist, Figtree, Work Sans, Public Sans, Ubuntu, Kanit, Heebo,
      IBM Plex Sans, Quicksand
Serif: Playfair Display, Fraunces, Cormorant Garamond, Lora, Merriweather, Crimson Text, Spectral,
       Arvo, BioRhyme, Old Standard TT, Cinzel
Display: Unbounded, Bebas Neue, Syne, Space Grotesk, Abril Fatface, Righteous, Comfortaa, Fredoka One
Mono: Space Mono, JetBrains Mono, Fira Code, Inconsolata
Handwriting: Caveat, Pacifico, Shadows Into Light, Grand Hotel

If screenshot provided: identify font category → pick closest match.
If no screenshot: Luxury→Playfair Display/Fraunces | Tech→Space Grotesk/Inter |
  Friendly→Poppins/Outfit | Creative→Syne/Unbounded | Corporate→Montserrat/Work Sans

### GLOBAL SETTINGS SCHEMA
Do NOT include: navigation, footer, favicon, buttonRadius, buttonShadow, buttonAnimation,
secondaryColor, primaryColor, page.id — these are auto-generated.

Colors are REQUIRED. Never use only #ffffff and #000000.

{
  "fontFamily": "string (from list above)",
  "accentColor": "#hex (brand/accent — buttons, links, highlights)",
  "bg": "#hex (page background — NOT pure white unless truly right for the brand)",
  "text": "#hex (body text — NOT pure black unless truly right for the brand)",
  "businessDetails": {
    "businessName": string, "phone": string, "email": string, "address": string,
    "city": string, "zip": string, "country": string,
    "socials": [{ "platform": string, "url": string }]
  },
  "buttonBorder": boolean,
  "buttonBorderColor": "#hex (only if buttonBorder: true)",
  "buttonBorderWidth": number 1-3 (only if buttonBorder: true),
  "typography": { "h1Size": number, "h2Size": number, "bodySize": number }
}

Color rules by business type:
- Restaurant/Food: warm tones (cream bg, deep brown text, terracotta/burgundy accent)
- Health/Beauty: soft pastels (rose bg, deep plum text, pink accent)
- Tech/SaaS: cool blues (light gray bg, deep navy text, electric blue accent)
- Legal/Finance: deep professional (light bg, charcoal text, navy accent)
- Dark style (from screenshot): dark bg (e.g. #111111), light text (e.g. #f0f0f0), vivid accent
- For block style.backgroundColor: ONLY use colors from bg/text/accentColor palette. Leave unset for normal sections.

### BLOCK SCHEMAS & USAGE GUIDE
Every block: { "type": "...", "content": { ... }, "style": { ... } }

- hero [MANDATORY on Home, optional on inner pages]
  content: { "title": string (MAX 8 words), "subtitle": string (MAX 2 sentences),
             "cta": string (MAX 3 words), "ctaUrl": string,
             "backgroundImage": string (Unsplash URL — required on Home) }

- benefits [USPs, differentiators — when user listed advantages or selling points]
  content: { "title": string, "subtitle": string,
             "variant": "cards"|"minimal"|"centered"|"list",
             "items": [{ "icon": string, "title": string, "description": string }] }

- how-it-works [sequential process — when user described a workflow]
  content: { "title": string,
             "variant": "cards"|"minimal"|"timeline"|"compact",
             "items": [{ "title": string, "description": string, "stepNumber": number }] }

- cards [showcase 3+ items: services, products, team — use on Home for overview lists]
  content: { "title": string, "subtitle": string, "ctaLabel": string, "ctaUrl": string,
             "items": [{ "image": string (Unsplash matching item topic),
                         "title": string, "subtitle": string, "description": string }] }

- image-text [services/features on inner pages, or visual+text section. "image" is REQUIRED]
  content: { "title": string, "text": string,
             "image": string (Unsplash matching section topic — REQUIRED),
             "imageSide": "left"|"right", "cta": string, "ctaUrl": string }

- text [company story, history, detailed explanations]
  content: { "title": string, "text": string (multiple paragraphs allowed) }

- quote [reviews/testimonials — include unless clearly inappropriate. No avatar images needed]
  content: { "title": string, "variant": "cards"|"minimal"|"bubble",
             "items": [{ "name": string, "role": string, "text": string,
                         "stars": number, "avatar": "" }] }

- pricing [NEVER invent prices — skip if pricing is "on request"]
  content: { "title": string,
             "plans": [{ "name": string, "price": string, "interval": string,
                         "features": string[] }] }

- faq [recommended on Home for most business types, also on inner pages where relevant]
  content: { "title": string,
             "variant": "accordion"|"classic"|"side-by-side"|"numbered",
             "items": [{ "question": string, "answer": string }] }

- contact [ALWAYS — every site needs at least one]
  content: { "title": string, "subtitle": string, "email": string, "phone": string,
             "address": string, "showMap": boolean,
             "successTitle": string, "successMessage": string }

- promo [promotional banners, special offers, external links — e.g. Etsy, booking platform, app]
  content: { "title": string,
             "items": [{ "image": string (Unsplash or empty), "title": string,
                         "text": string, "url": string }] }

### VISUAL VARIETY
1. Use patterns (dots, grid, diagonal, topography, waves) on 2-3 blocks per page — NOT on hero.
2. Alternate light and colored/dark section backgrounds (palette colors only).
3. Mix variants within each block type.
Style schema per block: { "patternType": "none"|"dots"|"grid"|"diagonal"|"topography"|"waves",
                          "patternScale": number, "backgroundColor": "#hex", "textColor": "#hex" }

### OUTPUT FORMAT
Return ONLY:
{
  "settings": { ... },
  "pages": [{
    "title": string, "slug": string,
    "seo": { "title": string, "description": string },
    "blocks": [...]
  }]
}
- Home page hero backgroundImage is MANDATORY.
- Every inner page must have at least 3 content blocks.
- No invented info. No placeholders.
```

---

## [3] Input utente dinamico — campi e scopo

Ogni campo del form ha un ruolo preciso:

---

**`businessName`** — Nome attività
→ AI: usato ovunque nel testo — titoli, copy, hero, footer.
→ Codice: logo testuale nav, footer copyright, `metaTitle`.

**`businessType`** — Tipo attività (Restaurant, LocalBusiness, ProfessionalService, ecc.)
→ AI: guida tono, struttura e contenuto per il settore.
→ Codice: colori di fallback (`DEFAULT_COLORS_BY_TYPE`) e immagini Unsplash di fallback.

**`language`** — Lingua (it / en / ...)
→ AI: genera tutto il testo nella lingua indicata.
→ Codice: `metaDescription` di fallback.

**`description`** — Descrizione libera (max 5000 caratteri)
→ AI: fonte principale del copy. L'AI non inventa info non presenti qui.

**`siteObjective`** — Obiettivo principale (es. "far prenotare un tavolo")
→ AI: decide label e link della CTA hero (`hero.cta` e `hero.ctaUrl`), calibra il tono dei blocchi.
→ Codice: niente — il codice prende `hero.cta`/`hero.ctaUrl` e li mette anche nella nav.

**`tone`** — Tono di voce (professional / amichevole / creativo / formale)
→ AI: calibra il registro del copy.
→ Codice: `buttonRadius`, `buttonShadow`, `buttonAnimation`, font di fallback.

**`strengths`** — Punti di forza / USP (lista, max 10)
→ AI: usati nei blocchi benefits, hero, image-text.

**`services`** — Servizi offerti (lista, max 10)
→ AI: usati nei blocchi cards e image-text. Se assenti, l'AI li inferisce da descrizione e tipo.

**`extraPages`** — Pagine aggiuntive (nome + descrizione)
→ AI: crea una pagina per ciascuna.
→ Codice: costruisce lo slug (es. "Chi Siamo" → `/chi-siamo`), nav links multi-page.

**`useAnchorNav`** — Single page (true) / multi-page (false)
→ **true**: aggiunge `PAGE TYPE: SINGLE PAGE` con lista anchor ID canonici. L'AI usa `#id` nei link. Nav costruita dal codice con anchor.
→ **false**: nessun `PAGE TYPE`. L'AI usa slug `/pagina`. Nav con link a pagine separate.

**`creativeMode`** — Modalità creativa
→ Aggiunge `### CREATIVE MODE: Be bold and inventive. Max 10 blocks per page.`

**Dati contatto** (email, phone, address, city, zip, country)
→ AI: inseriti nel blocco contact e footer.
→ Codice: `address` presente → `showMap: true` deterministico.

**Social** (instagram, facebook, whatsapp, twitter, linkedin)
→ AI: può citarli nel copy/footer.
→ Codice: WhatsApp → `https://wa.me/{numero}` nei socialLinks footer.

---

**Campi NON mandati all'AI come testo** (applicati solo nel codice dopo):

| Campo | Uso |
|-------|-----|
| `fontFamily` | Sovrascrive font AI. Se presente → NON viene mandata istruzione "scegli tu il font" |
| `logoUrl` | Mandato come immagine base64. Codice: `logo`, `favicon`, `metaImage` |
| `screenshotUrls` | Mandato come immagine base64 con istruzione estrazione colori/font. Se presente → NON viene mandata istruzione FONT |
| `bgColor`, `textColor`, `accentColor` | Picker opzionali ("Predefinito AI" se vuoti). Se compilati → sovrascrivono i colori AI nel post-processing |

---

**Testo aggiuntivo mandato con le immagini**:

Logo:
> "This is the business logo:"

Screenshot stile:
> "This is a style reference screenshot. Extract its dominant colors (background, text, accent) and use them EXACTLY for bg, text, and accentColor. Also extract font category, spacing, and overall tone."

---

## [4] Regole deterministiche post-AI

### 4a. Colori

Flusso (in ordine di priorità):
1. Screenshot presente → AI estrae i colori da quello e li mette in `bg`/`text`/`accentColor`
2. Screenshot assente → AI genera i colori seguendo le regole categoria nel system prompt
3. AI non restituisce colori (omissione/errore) → tabella hardcoded `DEFAULT_COLORS_BY_TYPE` per tipo business
4. Picker form compilati → sovrascrivono tutto nel post-processing

Il fallback hardcoded (punto 3) è deterministico: valori fissi per ogni `businessType`.

Console log al runtime:
```
[AI Generator] Colors source — BG: user|AI|default  #hex
[AI Generator] Colors source — Text: user|AI|default  #hex
[AI Generator] Colors source — Accent: user|AI|default  #hex
```

`appearance` (light/dark): calcolato dalla luminanza ITU-R BT.709 — sfondo più scuro del testo → `dark`.

Pulsante primario: sfondo = `accentColor`, testo = bianco/nero automatico (YIQ).
Pulsante secondario: sfondo = `accentColor` scurito 15% HSL, testo = automatico.

### 4b. Font

| # | Fonte |
|---|-------|
| 1 | Utente (form) |
| 2 | AI (solo se nella lista approvata) |
| 3 | Fallback tono: professional→Montserrat, amichevole→Poppins, creativo→Syne, formale→Lora |
| 4 | `Outfit` |

Il font utente NON viene mandato all'AI — viene applicato dopo sovrascrivendo quello AI.

Console log: `[AI Generator] Font source: user|AI|tone-fallback|hardcoded  {fontFamily}`

### 4c. Bottoni

| tone | buttonRadius | buttonShadow | buttonAnimation |
|------|-------------|--------------|-----------------|
| creativo / creative | 22 | M (light) / none (dark) | bounce |
| amichevole / friendly | 14 | M (light) / none (dark) | pulse |
| professionale / professional | 6 | M (light) / none (dark) | none |
| formale / formal | 3 | none | none |
| default | 8 | M (light) / none (dark) | none |

### 4d. Section IDs

Assegnati dal codice, non dall'AI:

| Tipo blocco | sectionId |
|-------------|-----------|
| contact | `contatti` |
| faq | `faq` |
| benefits | `vantaggi` |
| cards | `servizi` |
| how-it-works | `come-funziona` |
| quote | `recensioni` |
| pricing | `prezzi` |
| promo | `offerte` |
| text | `chi-siamo` |
| image-text | `info` |

Duplicati: primo → `contatti`, secondo → `contatti-2`, ecc.
L'AI viene istruita su questi ID così può usarli in `hero.ctaUrl`.

### 4e. Nav links

**Multi-page**: pagine escluso Home, label = titolo, url = `/slug`.
**Single-page**: max 6 link anchor dai sectionId reali, label = nome canonico del tipo.

### 4f. CTA nav + hero

Label e URL da `hero.content.cta` e `hero.content.ctaUrl` (AI).
La nav riceve gli stessi valori identici.
Validazione: tutti i `#anchor` controllati — se non esiste tra i sectionId reali → svuotato.

### 4g. Immagini

**Hero backgroundImage**: se assente o errore HEAD (3s) → Unsplash curato per tipo business.
**image-text `.image`**: migrazione `imageUrl→image`. Se assente o errore → Unsplash curato (seed = titolo).
**cards/promo `.items[].image`**: se assente o errore → Unsplash curato (seed = titolo item).
Selezione: deterministica — `hashSeed(seed) % pool.length` su `lib/ai/unsplash-images.ts`.

### 4h. Altre regole

| Campo | Regola |
|-------|--------|
| `showMap` (contact) | `true` se utente ha fornito indirizzo |
| `imageSide` (image-text) | Alterna left/right per blocchi consecutivi, reset su tipo diverso |
| `patternScale` | Sempre 15 |
| `patternColor` / `patternOpacity` | `themeText` / 7% light — 8% dark |
| `backgroundColor` blocchi | Se fuori palette (distanza RGB < 40) → sostituito con `accentColor` |
| Colonne benefits/cards/how-it-works | 2→2col, 3→3col, 4→4col(benefits)/2col(cards), 5+→3col. Tablet max 2. Mobile 1. |
| `typography` | Sempre nel DB: desktop h1=64 h2=48 body=16; mobile h1=40 h2=32 body=14 |
| Overlay blocchi con `backgroundImage` | overlayOpacity=65, overlayColor=#000000, textColor=bianco |
| WhatsApp footer | Social WhatsApp → `{ platform: "whatsapp", url: "https://wa.me/{numero}" }` in socialLinks |

---

## Modello e fallback

- Primario: `gemini-3-flash-preview`
- Fallback (errore 429/503/500/403 o JSON invalido): `gemini-3.1-flash-lite-preview`
- Timeout: 6 minuti
- Risposta con markdown (` ```json ``` `) → strippata prima del parse
- Cache: disabilitata

---

## Codice rimosso

**`deriveCTALabel`**: generava la label CTA della nav da keyword dell'obiettivo nel form. Sostituita da `hero.content.cta` dell'AI.

**`deriveCTAUrlFromBlocks`**: cercava il blocco più rilevante per l'obiettivo e costruiva l'anchor/slug per la nav. Sostituita da `hero.content.ctaUrl` dell'AI.

**`OBJECTIVE_BLOCK_PRIORITY`**: tabella di configurazione usata da `deriveCTAUrlFromBlocks`. Rimossa insieme.
