# Generazione AI — Specifiche Funzionali e Tecniche

> Documento di riferimento per il funzionamento del wizard di generazione AI, i prompt, il post-processing deterministico e le future evoluzioni.

---

## Indice

1. [Panoramica del Flusso](#1-panoramica-del-flusso)
2. [Step 1 — Validazione](#2-step-1--validazione)
3. [Step 2 — Raccolta Risposte (UI)](#3-step-2--raccolta-risposte-ui)
4. [Step 3 — Generazione AI](#4-step-3--generazione-ai)
5. [Step 4 — Post-processing Deterministico](#5-step-4--post-processing-deterministico)
6. [Generazione Immagini AI](#6-generazione-immagini-ai)
7. [Crediti AI — Costi e Limiti](#7-crediti-ai--costi-e-limiti)
8. [Tipi di Blocco Supportati](#8-tipi-di-blocco-supportati)
9. [Modalità Operative](#9-modalità-operative)
10. [Debug](#10-debug)
11. [Limitazioni e Cose da Migliorare](#11-limitazioni-e-cose-da-migliorare)
12. [File di Riferimento](#12-file-di-riferimento)

---

## 1. Panoramica del Flusso

```
[Utente compila il form wizard]
  → [STEP 1: Validazione AI — le info sono sufficienti?]
  → [STEP 2: Raccolta risposte (se validazione fallisce)]
  → [STEP 3: Generazione AI — blocchi, copy, struttura]
  → [STEP 4: Post-processing deterministico — colori, font, pattern, immagini, link]
  → [Progetto salvato su DB]
```

La separazione tra Step 3 e Step 4 è intenzionale: l'AI si occupa **solo** di struttura e contenuto testuale; tutti i parametri visivi e tecnici vengono applicati deterministicamente dal codice per garantire coerenza e controllabilità.

---

## 2. Step 1 — Validazione

### Scopo

Prima della generazione, un modello AI leggero valuta se le informazioni fornite sono sufficienti a produrre copy professionale e pubblicabile. Se mancano dettagli essenziali, restituisce domande mirate (max 3).

### Modello AI

- Primary: `gemini-3-flash-preview`
- Fallback: `gemini-3.1-flash-lite-preview`
- Timeout: 360s per modello

### Dati inviati al prompt di validazione

| Campo | Provenienza |
|---|---|
| Business Name | Form wizard |
| Business Type | Form wizard |
| Main Description | Form wizard |
| Site Objective | Form wizard (advanced) |
| Tone of Voice | Form wizard (advanced) |
| Key Strengths / USP | Form wizard (advanced) |
| Services Offered | Form wizard (advanced) |
| Lingua del progetto | Form wizard |

### Output atteso

```json
{
  "isReady": boolean,
  "reason": "stringa nella lingua del progetto",
  "questions": [
    { "id": "unique_id", "question": "...", "placeholder": "..." }
  ]
}
```

### Regole del validatore

- Chiede solo se mancano informazioni che l'utente **intendeva** includere, o essenziali per il settore
- **Non chiede mai**: colori, font, immagini, hosting, dominio, CMS, dati già presenti nel form
- **Non suggerisce mai** funzionalità non supportate (e-commerce, booking, login, chat, PDF, ecc.)
- Una domanda precisa vale più di tre vague

### Prompt statico

`AI_VALIDATION_PROMPT` in [`lib/ai/prompts.ts`](../lib/ai/prompts.ts)

---

## 3. Step 2 — Raccolta Risposte (UI)

### Comportamento

Se `isReady: false`, il modal mostra le domande come input. L'utente compila e clicca "Continua".

### Raccolta dati — come funziona

Le risposte vengono raccolte via `onChange` su ogni campo in un map locale `validationInputs: Record<id, value>`. Al click di "Continua" (`commitValidationAnswers`), tutti i valori vengono committati come array strutturato:

```typescript
validationAnswers: { question: string; answer: string }[]
```

Questo array viene passato come campo separato a `generateProjectWithAI` — **non viene appeso alla descrizione**. Il prompt dinamico lo include in una sezione dedicata `ADDITIONAL INFO`.

> **Importante**: il vecchio approccio richiedeva Enter su ogni singolo campo per salvare la risposta. Se l'utente usava il pulsante, le risposte andavano perse. Ora la raccolta è completamente on-change + submit unico al click di "Continua".

### File

[`components/editor/modals/AIGeneratorModal.tsx`](../components/editor/modals/AIGeneratorModal.tsx) — state `validationInputs`, `validationAnswers`, funzione `commitValidationAnswers`

---

## 4. Step 3 — Generazione AI

### Modello AI

Stesso primary/fallback della validazione. 1 tentativo principale + 1 retry JSON se il parse fallisce. Se anche il retry fallisce, si scala al modello fallback.

### Struttura del prompt

Il prompt di generazione è composto da parti concatenate:

**1. System prompt statico** (`AI_WEBSITE_GENERATOR_SYSTEM_PROMPT`)
- Schema di tutti i tipi di blocco con campi e regole
- Regole di copywriting (limiti hero, self-sufficiency, no contenuto attribuito inventato)
- Regole di composizione (home vs inner pages, no hero su pagine informative, multi-page CTA)
- Istruzioni `businessDetails`: estrarre contatti da qualsiasi campo del prompt incluso ADDITIONAL INFO
- Formato output JSON atteso

**2. Prompt dinamico** (costruito in `ai-generator.ts`)
- USER INPUT: nome, tipo, descrizione, lingua
- Obiettivo sito, tone of voice, USP, servizi
- CONTACT INFO: email, telefono, indirizzo, social
- `ADDITIONAL INFO` — risposte alle domande di validazione (se presenti)
- EXTRA PAGES richieste con descrizioni
- PAGE TYPE: single-page con anchor IDs oppure multi-page con slug
- Sezione condizionale `CONTENT QUALITY` o `CREATIVE MODE`
- Sezione condizionale `STYLE EXTRACTION` o `COLORS AND FONT`

**3. Immagini inline** (base64)
- Logo se fornito
- Screenshot/style reference se forniti

### Sezioni condizionali

Le sezioni dipendenti dalla modalità vengono inserite o rimosse dal codice — non lasciate all'AI da interpretare (risparmio di token e coerenza):

| Condizione | Sezione inserita |
|---|---|
| `!creativeMode` | `### CONTENT QUALITY` — no placeholder, no dati inventati attribuiti, no quote fake |
| `creativeMode` | `### CREATIVE MODE` — libertà creativa, max 10 blocchi per pagina |
| `hasStyleReference` | `### STYLE EXTRACTION` — estrai colori e font dall'immagine allegata |
| `!hasStyleReference` | `### COLORS AND FONT` — non generare colori/font, ci pensa il post-processing |

`hasStyleReference` = `!!(screenshotUrls?.length || logoUrl)`

### Estrazione contatti da risposte validazione

L'AI è esplicitamente istruita a cercare dati di contatto (telefono, email, indirizzo, città, CAP) in **qualsiasi** parte del prompt — incluse le risposte `ADDITIONAL INFO` — e a inserirli in `settings.businessDetails`. Questo garantisce che le info fornite durante la validazione arrivino nei campi strutturati (blocco contatti, footer, JSON-LD).

Il post-processing usa `data.* || aiDetails.*` per ogni campo, dove `aiDetails` è `aiOutput.settings?.businessDetails`.

### Output AI atteso

```json
{
  "settings": {
    "accentColor": "#hex",
    "bg": "#hex",
    "text": "#hex",
    "fontFamily": "string",
    "businessDetails": {
      "businessName": "string",
      "phone": "string",
      "email": "string",
      "address": "string",
      "city": "string",
      "zip": "string",
      "country": "string",
      "socials": [{ "platform": "string", "url": "string" }]
    },
    "typography": { "h1Size": 64, "h2Size": 48, "bodySize": 16 }
  },
  "pages": [
    {
      "title": "string",
      "slug": "string",
      "seo": { "title": "string", "description": "string" },
      "blocks": [{ "type": "...", "content": { ... }, "style": { ... } }]
    }
  ]
}
```

> Colori e font dell'AI vengono usati **solo se `hasStyleReference: true`**. Altrimenti ignorati e sostituiti nel post-processing.

---

## 5. Step 4 — Post-processing Deterministico

Tutto ciò che segue viene applicato dal codice **dopo** l'output AI, indipendentemente da cosa l'AI ha generato.

### 5.1 — Colori

**Priorità**: `utente (form avanzato) > AI (solo con style reference) > default per tipo business`

```
userBG / userText / userAccent   ← AIGenerationData (form avanzato)
aiBG / aiText / aiAccent         ← aiOutput.settings (solo se hasStyleReference)
typeColors                       ← DEFAULT_COLORS_BY_TYPE[businessType]
```

`DEFAULT_COLORS_BY_TYPE` in [`lib/ai/site-generator.ts`](../lib/ai/site-generator.ts) — palette per tipo business:

| Business Type | BG | Text | Accent |
|---|---|---|---|
| Restaurant | `#fdf6f0` | `#2d1b0e` | `#c0392b` |
| LocalBusiness | `#f8fafc` | `#1e293b` | `#2563eb` |
| HealthAndBeautyBusiness | `#fdf4f8` | `#3d1a2e` | `#c2185b` |
| HomeAndConstructionBusiness | `#f5f7fa` | `#1c2b3a` | `#1565c0` |
| Store | `#fafaf9` | `#1c1917` | `#d97706` |
| *(altri)* | `#f8f9fa` | `#1a1a2e` | `#3b82f6` |

`appearance` (light/dark) è derivato automaticamente dalla luminanza relativa di `themeBG` vs `themeText`.

### 5.2 — Font

**Priorità**: `utente > AI (solo con style reference) > tone fallback > 'Outfit'`

| Tone | Font fallback |
|---|---|
| professional / professionale | Montserrat |
| friendly / amichevole | Poppins |
| creative / creativo | Syne |
| formal / formale | Lora |

Il font AI è accettato solo se è nella lista `AVAILABLE_FONTS` — deve matchare esattamente i font disponibili in `FontManager.tsx`.

### 5.3 — Stile pulsanti

Derivato deterministicamente da `tone`:

| Tone | Radius | Shadow | Animation |
|---|---|---|---|
| formal | 3px | none | none |
| professional | 6px | M (light only) | none |
| friendly | 14px | M (light only) | pulse |
| creative | 22px | M (light only) | bounce |

Shadow è sempre `none` se il tema è dark.

### 5.4 — Pattern sui blocchi

**Completamente deterministico** — l'AI non contribuisce.

- Blocchi `hero`, `navigation`, `footer`: nessun pattern
- Gli altri: contatore `patternEligibleIdx` (incrementa per ogni blocco non-skip)
- Ogni 3° blocco partendo dall'indice 1 (0-based) riceve un pattern: `patternEligibleIdx % 3 === 1`
- Ciclo: `['dots', 'topography', 'grid', 'waves', 'diagonal']`
- Colore = `themeText`, opacità = 8% dark / 7% light, scala = 15

### 5.5 — Section IDs

Ogni blocco riceve un `sectionId` canonico deterministico in italiano:

| Tipo | sectionId |
|---|---|
| `contact` | `contatti` |
| `faq` | `faq` |
| `benefits` | `vantaggi` |
| `cards` | `servizi` |
| `how-it-works` | `come-funziona` |
| `quote` | `recensioni` |
| `pricing` | `prezzi` |
| `promo` | `offerte` |
| `text` | `chi-siamo` |
| `image-text` | `info` |

Se lo stesso tipo compare più volte: `info-2`, `info-3`, ecc.

Questi ID sono anche gli anchor (`#contatti`, `#servizi`, ecc.) usati nella navigazione single-page.

### 5.6 — Colonne responsive

Per blocchi `benefits`, `cards`, `how-it-works`:

| Items | Desktop | Tablet | Mobile |
|---|---|---|---|
| 2 | 2 | 2 | 1 |
| 3 | 3 | 2 | 1 |
| 4 | 2 (cards) / 4 (altri) | 2 | 1 |
| 5+ | 3 | 2 | 1 |

### 5.7 — imageSide alternato

Per blocchi `image-text` consecutivi, il lato immagine viene alternato automaticamente. Il primo mantiene la scelta dell'AI; i successivi vengono flippati. Si resetta se compare un blocco di tipo diverso nel mezzo.

### 5.8 — Immagini Unsplash

Assegnate tramite `getUnsplashUrl` / `getHeroUnsplashUrl` in [`lib/ai/unsplash-images.ts`](../lib/ai/unsplash-images.ts).

Il seed è composto da `sectionId + indice + titolo item` per evitare immagini duplicate tra card dello stesso blocco.

### 5.9 — businessDetails finale

Merge con priorità utente > AI-estratto:

```
email / phone / address:  data.* (form) || aiDetails.* (estratto dall'AI) || ''
city / zip / country:     data.* || aiDetails.* || default
socialLinks:              data.socials || aiDetails.socials || []
```

WhatsApp: se presente nei social, viene normalizzato in `https://wa.me/{numero}` e aggiunto ai link del footer se non già presente.

### 5.10 — Navigazione e footer

**Single-page**: i link della nav vengono ricostruiti dai `sectionId` dei blocchi presenti, max 6 link in ordine di apparizione.

**Multi-page**: i link sono gli slug delle pagine extra (es. `/servizi`, `/chi-siamo`).

CTA della nav = label + URL dal blocco `hero` della home.

Nav e footer ricevono `backgroundColor: themeBG` e `textColor: themeText` esplicitamente — altrimenti la nav cadrebbe in fallback `#ffffff` anche con tema scuro (il componente usa `bg || '#ffffff'`).

### 5.11 — Validazione link interni

Tutti i campi `ctaUrl`, `url`, `ctaUrl2` e `items[*].url` vengono validati:

- Link `#anchor`: deve esistere un blocco con quel `sectionId` nella stessa pagina. Se non esiste → svuotato.
- Link `/slug`: deve esistere una pagina con quello slug nel progetto. Se non esiste → svuotato.

### 5.12 — backgroundColor dei blocchi

L'AI può assegnare `style.backgroundColor` ai blocchi. Il post-processing lo accetta solo se rientra nella palette `[themeBG, themeText, accentBG]` con tolleranza colorimetrica (distanza euclidea RGB < 40). Colori fuori palette → sostituiti con `accentBG`.

---

## 6. Generazione Immagini AI

### Panoramica

La piattaforma supporta la generazione di immagini tramite AI in due contesti distinti:

1. **Durante la generazione del sito** (`imageGenMode: 'ai'`) — il post-processing usa Flux al posto di Unsplash per hero, `image-text` e card
2. **Uploader standard nell'editor** (tab "AI" in `ImageUpload`) — l'utente genera singole immagini da prompt testuale

---

### 6.1 — Generazione automatica durante il wizard

Controllata dal parametro `imageGenMode: 'stock' | 'ai'` passato a `validateAndCleanBackgroundImages`.

**Blocchi coinvolti:**

| Blocco | Campo | Ratio |
|---|---|---|
| `hero` | `backgroundImage` | `16:9` |
| `image-text` | `image` | `4:3` |
| `cards`, `promo` | `items[*].image` | `16:9` |

**Costruzione del prompt:**

```
A realistic photographic scene representing {blockTitle}.
Main subject: {imagePrompt || mainSubject || blockTitle}
Foreground: main subject in focus
Background: soft blurred environment
Style: professional editorial photography
Camera: 50mm lens, shallow depth of field
IMPORTANT: no text, no letters, no watermark
```

Il campo `imagePrompt` / `mainSubject` è fornito direttamente dall'AI di testo nella risposta di generazione. Se assente, si usa il `title` / `heading` del blocco.

**Fallback:** se Flux fallisce o non è disponibile (`PIXAZO_API_KEY` assente), l'immagine viene rimpiazzata con l'URL Unsplash corrispondente — il sito viene comunque generato.

**Upload:** le immagini generate vengono convertite in WebP (qualità 82 via sharp) e caricate su Supabase Storage come `/assets/ai-gen-{ts}-{idx}.webp` nello spazio `{userId}/{projectId}/`.

**Generazione parallela:** tutti i task di un'unica run sono eseguiti in `Promise.allSettled` — un fallimento su un'immagine non blocca le altre.

---

### 6.2 — Generazione manuale nell'editor (ImageUpload)

L'uploader standard espone una tab "AI" in tutti i punti dell'editor in cui compare `ImageUpload`.

**Endpoint:** `POST /api/generate-image`

**Parametri:**

| Parametro | Tipo | Note |
|---|---|---|
| `prompt` | string | Max 300 caratteri |
| `aspectRatio` | string | `16:9` \| `4:3` \| `1:1` \| `9:16` — default `16:9` se non riconosciuto |

**Risposta:**

```json
{ "data": "<base64>", "mimeType": "image/jpeg" }
```

La risposta è inline base64 — l'immagine viene subito inviata all'`onChange` del componente come `data:{mimeType};base64,{data}`.

**Ratio preimpostato:** deriva automaticamente da `previewAspect` del componente (es. `"16/9"` → `"16:9"`).

**Costo:** 2 crediti AI per generazione. Il counter `ai_used_this_month` viene incrementato due volte (`increment_ai_usage` chiamata due volte). Il client aggiorna il contatore locale con `useEditorStore.getState().incrementAiUsed(2)`.

---

### 6.3 — Modello e Provider

| Provider | Modello | API |
|---|---|---|
| Pixazo (primary) | `flux-1-schnell` | `gateway.pixazo.ai/flux-1-schnell/v1/getData` |

Richiede la variabile d'ambiente `PIXAZO_API_KEY`. Se assente, ogni chiamata restituisce `null` e viene lanciato un errore `Image generation failed: Flux returned no result.`.

Dimensioni di output per ratio:

| Ratio | Width | Height |
|---|---|---|
| `16:9` / `landscape` | 1024 | 576 |
| `9:16` / `portrait` | 576 | 1024 |
| `4:3` | 1024 | 768 |
| `1:1` / altri | 1024 | 1024 |

---

## 7. Crediti AI — Costi e Limiti

Tutte le operazioni AI scalano dallo stesso contatore mensile `ai_used_this_month`, verificato tramite `canUseAI()` / `getUserLimits()`.

### Costi per operazione

| Operazione | Costo crediti |
|---|---|
| Validazione wizard (Step 1) | 1 |
| Generazione sito (Step 3) | 1 |
| Generazione HTML block | 1 |
| Generazione immagine singola (uploader) | **2** |
| Generazione immagine durante wizard | 0 (inclusa nel costo del sito) |

> Le immagini generate automaticamente durante il wizard non consumano crediti aggiuntivi — il costo è coperto dalla generazione del sito.

### Limite e piano

Il limite mensile è definito da `max_ai_per_month` nel piano dell'utente (tabella `plan_limits`, letto via RPC `get_user_limits`). Se `null` → illimitato.

Il check crediti per la generazione immagine manuale avviene lato server nell'API route `/api/generate-image`:

```typescript
if (limits.max_ai_per_month !== null && limits.max_ai_per_month - limits.ai_used_this_month < CREDITS_COST) {
  return NextResponse.json({ error: 'Crediti insufficienti' }, { status: 403 });
}
```

### Nota lato sicurezza

`canUseAI()` viene verificato lato server per HTML block e per l'uploader (route API), ma **non** nella server action `generateProjectWithAI` — un utente senza piano potrebbe aggirare il controllo via API diretta.

---

## 8. Tipi di Blocco Supportati

| Tipo | Uso tipico | Note |
|---|---|---|
| `hero` | Headline + CTA principale | Obbligatorio su Home. Su inner pages solo se landing dedicata a un servizio — non su pagine informative (chi siamo, faq, contatti) |
| `benefits` | USP / vantaggi competitivi | Usare quando l'utente ha fornito punti di forza |
| `how-it-works` | Processo step-by-step | Usare quando è descritto un workflow multi-step |
| `cards` | Griglia servizi/prodotti | Best per overview su Home |
| `image-text` | Dettaglio servizio con immagine | Preferito su inner pages |
| `text` | Storia aziendale, testo lungo | Per contenuto narrativo o descrittivo |
| `quote` | Testimonianze | Solo se fornite dall'utente (modalità standard). In creative mode può inventarle |
| `pricing` | Piani tariffari | Solo se i prezzi sono stati forniti — mai inventati |
| `faq` | Domande frequenti | Raccomandato su Home per la maggior parte dei settori |
| `contact` | Form contatti + mappa | Raccomandato su tutti i siti |
| `promo` | Banner promo, link esterni | Per offerte speciali, link Etsy, app store, booking platform |

**Non generati dall'AI** (aggiunti dal post-processing): `navigation`, `footer`

---

## 9. Modalità Operative

### Standard (default)

- Copy basato solo su informazioni fornite + inferenze ragionevoli per il settore
- Nessun contenuto attribuito inventato (no recensioni fake, no nomi, no dati specifici non forniti)
- Blocco `quote` omesso se l'utente non ha fornito testimonianze reali

### Creative Mode (`creativeMode: true`)

- Libertà creativa completa per inventare contenuti convincenti e sector-appropriate
- Max 10 blocchi per pagina
- Ancora vietato: prezzi inventati, numeri di telefono inventati, indirizzi inventati, placeholder in parentesi quadre

> In creative mode le testimonianze inventate sono permesse ma dovranno essere sostituite dall'utente prima del deploy.

---

## 10. Debug

### Salvataggio prompt/output su file

Attivabile con `AI_DEBUG_SAVE_PROMPTS=true` in `.env.local`. Salva nella cartella `.ai-debug/` (in `.gitignore`).

File generati per ogni run:

| File | Contenuto |
|---|---|
| `{ts}-validation-prompt.txt` | Prompt inviato al validatore |
| `{ts}-validation-response.json` | Risposta JSON del validatore |
| `{ts}-validation-meta.json` | Modello usato, tempo, isReady, n. domande |
| `{ts}-generation-prompt.txt` | Prompt testuale inviato al generatore (senza immagini base64) |
| `{ts}-generation-response.json` | Output JSON grezzo dell'AI |
| `{ts}-generation-meta.json` | Modello usato, tempo |

> **Non attivare su Vercel** — il filesystem è scrivibile solo in locale. Su serverless il `writeFileSync` fallirebbe silenziosamente (già protetto da try/catch).

---

## 11. Limitazioni e Cose da Migliorare

| Limitazione | Dettaglio |
|---|---|
| **Nav label hardcoded in italiano** | `BLOCK_TYPE_CANONICAL_LABEL` usato per la nav single-page è fisso in IT. Per siti in altre lingue i label della nav risultano in italiano. Va parametrizzato per `data.language` |
| **Font non suggeribile via testo** | Senza screenshot/logo il font è sempre deterministico da tone. Non esiste un modo per l'utente di suggerire un font senza usare il form avanzato. Possibile miglioramento: campo font nel wizard base |
| **Colori blocchi AI aggressivi** | I `backgroundColor` fuori palette vengono sostituiti con `accentBG`. In alcuni casi potrebbe essere preferibile eliminarli del tutto invece di rimpiazzarli |
| **Anchor nav max 6 link** | La nav single-page è cappata a 6 link. Con pagine molto ricche di blocchi alcuni vengono omessi, senza prioritizzazione — prende i primi 6 in ordine di apparizione |
| **Retry JSON limitato** | In caso di risposta AI non parsabile, 1 solo retry prima di scalare al modello fallback. Non c'è meccanismo di richiesta parziale — viene ripetuta l'intera chiamata |
| **`can_use_ai` solo lato UI** | Il permesso AI non viene verificato lato server nella `generateProjectWithAI`. Un utente senza piano potrebbe aggirarlo via API diretta |
| **businessType come schema.org** | `businessType` serve sia per la palette colori che per il JSON-LD. I tipi non presenti in `DEFAULT_COLORS_BY_TYPE` ricevono colori fallback generici |
| **Generazione immagini senza fallback modello** | `text-to-image.ts` ha un solo provider (Flux via Pixazo). Se il provider è down non c'è un modello alternativo — la funzione lancia eccezione e la pipeline torna su Unsplash |
| **Costo immagine manuale doppio** | La route `/api/generate-image` chiama `increment_ai_usage` due volte in sequenza invece di un'unica RPC con quantità. Se la seconda chiamata fallisce il costo è già parzialmente scalato |
| **Prompt immagine non localizzato** | Il prompt di `buildImagePrompt` è sempre in inglese indipendentemente dalla lingua del sito — Flux non localizza lo stile fotografico |
| **Immagini wizard non conteggiate nei crediti** | Le immagini generate in `imageGenMode: 'ai'` durante il wizard non incrementano `ai_used_this_month` — solo il credito della generazione testo viene scalato |

---

## 12. File di Riferimento

### Backend / Server Actions
- [`app/actions/ai-site-generator.ts`](../app/actions/ai-site-generator.ts) — Server action thin wrapper: auth, permissions, DB insert, credit increment
- [`lib/ai/site-generator.ts`](../lib/ai/site-generator.ts) — Logica core: `generateProject`, `validateDescription`, post-processing, costanti deterministiche
- [`lib/ai/image-pipeline.ts`](../lib/ai/image-pipeline.ts) — `validateAndCleanBackgroundImages`, upload AI images
- [`lib/ai/prompts/site.ts`](../lib/ai/prompts/site.ts) — `SITE_SYSTEM_PROMPT`, `SITE_VALIDATION_PROMPT`, sezioni condizionali
- [`lib/ai/text-to-image.ts`](../lib/ai/text-to-image.ts) — `generateImage` (Flux via Pixazo)
- [`app/api/generate-image/route.ts`](../app/api/generate-image/route.ts) — API route per generazione immagine manuale dall'editor
- [`lib/ai/unsplash-images.ts`](../lib/ai/unsplash-images.ts) — Generazione URL immagini Unsplash per blocchi e hero
- [`lib/ai/gemini.ts`](../lib/ai/gemini.ts) — `getGenAI`, `PRIMARY_MODEL`, `FALLBACK_MODEL`, `isRetryable`, `callJsonModel`

### UI Wizard
- [`components/editor/modals/AIGeneratorModal.tsx`](../components/editor/modals/AIGeneratorModal.tsx) — Wizard completo: form, validazione, raccolta risposte, avvio generazione

### Tipi
- [`lib/ai/site-generator.ts`](../lib/ai/site-generator.ts) — `AIGenerationData` (interfaccia input principale)
- [`types/editor.ts`](../types/editor.ts) — Blocchi, `ProjectSettings`

### Permessi
- [`lib/permissions.ts`](../lib/permissions.ts) — `canUseAI()`, `canCreateProject()`, `UserLimits`
