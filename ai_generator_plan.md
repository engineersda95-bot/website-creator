# Piano Interventi — AI Generator
*Redatto: 2026-04-01 | Basato su: architecture.md, full_prompts.md, ai-generator.ts*

---

## Risposte alle DOMANDE DEV

### DOMANDA: Il font perché deve essere passato all'AI?
**Risposta**: Non deve. Il font segue la stessa logica dei colori:
- Se utente lo imposta → post-processing lo applica deterministicamente, **non viene passato all'AI**
- Se utente non lo imposta → l'AI sceglie dalla lista vincolante nel system prompt
- Il prompt contiene solo la lista dei 49 font + guida contestuale per tone, mai l'override dell'utente
- Se l'AI restituisce un font fuori lista → fallback deterministico basato su tone (Sezione 4D)

### DOMANDA: L'AI può scegliere colore SFONDO e TESTO per un singolo blocco?
**Risposta**: Sì, da mantenere. I blocchi possono avere `style.backgroundColor` e `style.textColor` per creare varietà visiva. Il post-processing non li sovrascrive (eccezione: overlay e testo forzati su qualsiasi blocco con `backgroundImage`). È la fonte di alternanza visiva chiaro/scuro tra sezioni.

### DOMANDA IMPLICITA su `appearance` (light/dark):
**Risposta**: `appearance` viene **calcolata deterministicamente** dopo che i colori tema sono definiti:
```
luminance(themeBG) < luminance(themeText)  →  appearance = 'dark'
luminance(themeBG) >= luminance(themeText) →  appearance = 'light'
```
Formula luminance relativa (ITU-R BT.709): `0.2126*R + 0.7152*G + 0.0722*B` (valori 0-1). Elimina la necessità di esporre `appearance` nel form utente — è sempre coerente con i colori scelti.

---

## SEZIONE 1 — Schema Dati e Nomenclatura
**File**: `app/actions/ai-generator.ts` — interfaccia `AIGenerationData`

| Campo attuale | Campo proposto | Semantica |
|---|---|---|
| `secondaryColor` | `bgColor` | Colore sfondo del sito, impostato dall'utente |
| `textColor` | `textColor` | (invariato) Colore testo del sito |
| `primaryColor` | `accentColor` | Colore brand/accento per bottoni e highlight |

Rimuovere il campo `appearance` dall'interfaccia — calcolato deterministicamente, non è più input utente.

---

## SEZIONE 2 — Flusso Colori Deterministico (Post-Processing)
**File**: `app/actions/ai-generator.ts` — sezione `--- 6. DETERMINISTIC STYLE ---`

### Problema attuale
- `themeColors.light.bg/text` non sono nello schema del prompt → l'AI li genera per inferenza, a volte no → fallback `#ffffff`/`#000000`
- `accentColor` (ex `primaryColor`) passa all'AI ma viene ignorato nel post-processing
- `textColor` non iniettato nel prompt → incoerenza visiva generazione/output
- `appearance` impostata dall'utente o dall'AI invece di essere calcolata dai colori

### Flusso proposto
```
// Step 1: Colori utente (opzionali, priorità assoluta)
userBG     = data.bgColor     || null
userText   = data.textColor   || null
userAccent = data.accentColor || null

// Step 2: Fallback AI (dal nuovo schema themeColors + accentColor)
aiBG     = aiOutput.settings.themeColors?.light?.bg   || '#ffffff'
aiText   = aiOutput.settings.themeColors?.light?.text || '#000000'
aiAccent = aiOutput.settings.accentColor              || aiText

// Step 3: Valori finali
themeBG   = userBG     || aiBG
themeText = userText   || aiText
accentBG  = userAccent || aiAccent

// Step 4: Bottone primario
primaryCTABG   = accentBG
primaryCTAText = getContrastColor(accentBG)   // funzione già disponibile

// Step 5: Bottone secondario (derivato dal primario)
secondaryCTABG   = darkenHSL(accentBG, 15)
secondaryCTAText = getContrastColor(secondaryCTABG)

// Step 6: Appearance calcolata deterministicamente
appearance = luminance(themeBG) < luminance(themeText) ? 'dark' : 'light'
isDark     = appearance === 'dark'

// Step 7: themeColors output — sempre entrambe le varianti popolate
themeColors = {
  light: { bg: !isDark ? themeBG : '#ffffff', text: !isDark ? themeText : '#000000' },
  dark:  { bg:  isDark ? themeBG : '#0c0c0e', text:  isDark ? themeText : '#ffffff'  },
  buttonText:          primaryCTAText,
  buttonTextSecondary: secondaryCTAText,
}

// Step 8: settings finali
settings.primaryColor   = accentBG       // brand/bottone, semantica corretta
settings.secondaryColor = secondaryCTABG // bottone secondario
```

### Nota su `darkenHSL`
Sostituire `darkenColor` attuale (offset RGB fisso -30) con variazione HSL: riduce la luminosità del 15% relativo. Su colori scuri non va a nero, su colori chiari rimane coerente. Implementazione in puro TS.

### I colori utente non vengono più passati all'AI
`bgColor`, `textColor`, `accentColor` non vengono iniettati nel prompt. L'AI genera i colori liberamente (da screenshot/logo/business type), poi il post-processing decide se tenerli o sostituirli. Il blocco `USER STYLE OVERRIDES` viene rimosso (Sezione 7A).

---

## SEZIONE 3 — Parametri Pre-AI Deterministici
**File**: `app/actions/ai-generator.ts` — calcolati prima di costruire `promptParts`, iniettati in `finalSettings`

L'AI non deve generarli. Vengono sovrascritti deterministicamente nell'output.

### 3A. `buttonRadius`
| Tone | px |
|---|---|
| `creativo` | 22 |
| `amichevole` | 14 |
| `professionale` | 6 |
| `formale` | 3 |
| default | 8 |

### 3B. `buttonShadow`
| Condizione | Valore |
|---|---|
| `isDark = true` | `"none"` |
| `isDark = false` + tone `formale` | `"none"` |
| `isDark = false` + altri tone | `"M"` |

**Nota**: `appearance`/`isDark` viene calcolato nella Sezione 2 Step 6, quindi `buttonShadow` si calcola dopo.

### 3C. `buttonAnimation`
| Tone | Animazione |
|---|---|
| `creativo` | `"bounce"` |
| `amichevole` | `"pulse"` |
| tutti gli altri | `"none"` |

---

## SEZIONE 4 — Post-Processing Aggiuntivo sui Blocchi
**File**: `app/actions/ai-generator.ts` — sezione `--- 7. FINAL PAGE ENRICHMENT ---`

### 4A. Overlay e testo su TUTTI i blocchi con `backgroundImage`
Estendere il comportamento (attualmente solo `hero`) a qualsiasi blocco con `content.backgroundImage` non vuoto.

Il `textColor` forzato deve essere **sempre bianco** (`#ffffff`), non `themeBG`. Motivazione: l'overlay è sempre scuro (`#000000` con opacity 65%) — su dark theme il `themeBG` è scuro (#0c0c0e) e darebbe testo illeggibile sull'overlay. La regola corretta è `getContrastColor(overlayColor || '#000000')` che restituisce sempre `#ffffff` con overlay nero:
```ts
if (blockWithId.content?.backgroundImage) {
  blockWithId.style.overlayOpacity = blockWithId.style.overlayOpacity || 65;
  blockWithId.style.overlayColor   = blockWithId.style.overlayColor   || '#000000';
  if (!blockWithId.style.textColor) {
    blockWithId.style.textColor = getContrastColor(blockWithId.style.overlayColor || '#000000');
  }
}
```

### 4B. Pattern — Color e Opacity Deterministici
Per ogni blocco con `style.patternType` diverso da `'none'` (la scelta di usarli rimane all'AI):
```ts
if (block.style?.patternType && block.style.patternType !== 'none') {
  block.style.patternColor   = themeText;
  block.style.patternOpacity = isDark ? 8 : 7;
}
```

### 4C. CTA nel Navigation Block
Il `navBlock` deterministico include una CTA button:
```ts
ctaLabel: deriveCTALabel(data.siteObjective, data.language),
ctaUrl:   deriveCTAUrl(data.siteObjective, data.useAnchorNav, pages),
showCTA:  true,
```

`deriveCTALabel` — mapping `siteObjective` → label:
| Obiettivo | Label IT | Label EN |
|---|---|---|
| `book` / prenotazione | "Prenota ora" | "Book now" |
| `contact` / contatto | "Contattaci" | "Contact us" |
| `quote` / preventivo | "Richiedi preventivo" | "Get a quote" |
| `buy` / acquisto | "Acquista" | "Buy now" |
| default | "Scopri di più" | "Learn more" |

`deriveCTAUrl` — logica:
- Sito single page con `useAnchorNav = true` → `#contatti` (anchor del blocco contact)
- Sito multi-page → `/contatti` o la slug della pagina più rilevante
- Fallback → `#contatti`

### 4D. fontFamily Validation
La lista **esatta** è quella di `components/blocks/sidebar/ui/FontManager.tsx` — 49 font Google Fonts curati (la lista nel piano e nel codice coincidono perfettamente, non serve aggiungere font). È necessario tenerli tutti nel prompt perché "Google Fonts" ha +1500 font e senza lista vincolante l'AI può restituire qualsiasi cosa.

```ts
const AVAILABLE_FONTS = [
  // Sans Serif (22)
  'Outfit','Inter','Plus Jakarta Sans','DM Sans','Montserrat','Roboto','Open Sans',
  'Poppins','Lato','Sora','Manrope','Archivo','Lexend','Urbanist','Figtree','Work Sans',
  'Public Sans','Ubuntu','Kanit','Heebo','IBM Plex Sans','Quicksand',
  // Serif (11)
  'Playfair Display','Fraunces','Cormorant Garamond','Lora','Merriweather',
  'Crimson Text','Spectral','Arvo','BioRhyme','Old Standard TT','Cinzel',
  // Display (8)
  'Unbounded','Bebas Neue','Syne','Space Grotesk','Abril Fatface','Righteous',
  'Comfortaa','Fredoka One',
  // Mono (4)
  'Space Mono','JetBrains Mono','Fira Code','Inconsolata',
  // Handwriting (4)
  'Caveat','Pacifico','Shadows Into Light','Grand Hotel'
]; // totale: 49

const TONE_FONT_FALLBACK: Record<string, string> = {
  professionale: 'Montserrat',
  amichevole:    'Poppins',
  creativo:      'Syne',
  formale:       'Lora',
};

fontFamily = data.fontFamily
          || (AVAILABLE_FONTS.includes(aiOutput.settings?.fontFamily) ? aiOutput.settings.fontFamily : null)
          || TONE_FONT_FALLBACK[data.tone || '']
          || 'Outfit';
```

Se `data.fontFamily` è impostato dall'utente, sostituisce sempre il valore AI senza passarlo al prompt.

### 4E. Validazione URL Immagini Background (best-effort, non bloccante)
Per ogni blocco con `content.backgroundImage` generato dall'AI (Unsplash URL), fare HEAD request. Se invalido:
- Rimuovere `backgroundImage` dal content
- Rimuovere `overlayOpacity`, `overlayColor`, `textColor` forzati
- Implementare come `Promise.allSettled` asincrono per non serializzare la latenza
- **Nota**: Logo e screenshot input arrivano già come base64 tramite `fetchImageAsBase64` — non c'è URL da validare per quelli. Le URL Unsplash sono generate dall'AI come stringhe nell'output JSON, non "lette" dal modello; il modello le scrive, il renderer le usa. Nessun cambiamento necessario al flusso input immagini.

### 4F. Validazione URL nei blocchi (NUOVA — da NOTE DEV su Sezione 6C)
Nel post-processing, per ogni link nei blocchi interni (hero CTA, benefits items, cards CTA, ecc.):

**Sito multi-page**: i link interni (che iniziano con `/`) devono corrispondere a un slug delle pagine generate. Se `/chi-siamo` non esiste tra le pagine → svuotare a `""`.

**Sito single-page con anchor nav**: i link interni devono essere in formato `#slug`. Se il link è `/contatti` invece di `#contatti` → correggere automaticamente al formato anchor. Se l'anchor non corrisponde a nessun `sectionId` generato → svuotare.

**Link esterni** (iniziano con `http`/`https`): non validare, mantenere intatti.

L'URL svuotato (`""`) appare nel renderer come link disabilitato/warning visivo per l'utente.

---

## SEZIONE 5 — Retry e Sicurezza
**File**: `app/actions/ai-generator.ts`

### 5A. Cap MAX 2 retry totali
- **Primary model**: 1 tentativo + 1 retry JSON = max 2 call
- **Fallback model**: 1 tentativo senza retry
- **Totale**: max 3 chiamate API, nessun loop possibile

Verificare che il fallback model nel codice attuale non abbia un retry JSON implicito. Se presente, rimuoverlo.

### 5B. Scope filtro immagini
Il filtro `ALLOWED_DOMAINS` si applica correttamente solo a logo e screenshot **in input** (caricati dall'utente da Supabase). Le URL Unsplash generate dall'AI nell'output non passano per questa validazione — corretto, sono output del modello, non input utente. Nessuna modifica.

---

## SEZIONE 6 — System Prompt — Sostituzione Completa
**File**: `lib/ai/prompts.ts` — costante `AI_WEBSITE_GENERATOR_SYSTEM_PROMPT`

Sostituire con la versione proposta in `full_prompts.md` §5, con queste modifiche:

### 6A. Schema GLOBAL SETTINGS — versione definitiva
Rimuovere dall'output AI: `navigation`, `footer`, `favicon`, `secondaryColor`, `primaryColor`, `buttonRadius`, `buttonShadow`, `buttonAnimation`, `page.id`.

Schema AI pulito:
```json
{
  "fontFamily": "string (dalla lista vincolante)",
  "accentColor": "#hex — brand color per bottoni, link, highlight",
  "themeColors": {
    "light": { "bg": "#hex", "text": "#hex" },
    "dark":  { "bg": "#hex", "text": "#hex" }
  },
  "businessDetails": { "businessName": string, "phone": string, "email": string, "address": string, "city": string, "zip": string, "country": string, "socials": [{ "platform": string, "url": string }] },
  "buttonBorder": boolean,
  "buttonBorderColor": "#hex (solo se buttonBorder: true)",
  "buttonBorderWidth": "number 1–3 (solo se buttonBorder: true)",
  "typography": { "h1Size": number, "h2Size": number, "bodySize": number }
}
```

### 6B. Font — lista vincolante nel prompt (necessaria per intero)
Sì, la lista completa dei 49 font va nel prompt — "Google Fonts" senza lista non funziona perché il catalogo ha +1500 font e l'AI produrrebbe valori non caricati. Per ridurre il token footprint, formattare su righe CSV compatte per categoria invece di elenco puntato:
```
AVAILABLE FONTS (use ONLY these exact names):
Sans: Outfit, Inter, Plus Jakarta Sans, DM Sans, Montserrat, Roboto, Open Sans, Poppins, Lato, Sora, Manrope, Archivo, Lexend, Urbanist, Figtree, Work Sans, Public Sans, Ubuntu, Kanit, Heebo, IBM Plex Sans, Quicksand
Serif: Playfair Display, Fraunces, Cormorant Garamond, Lora, Merriweather, Crimson Text, Spectral, Arvo, BioRhyme, Old Standard TT, Cinzel
Display: Unbounded, Bebas Neue, Syne, Space Grotesk, Abril Fatface, Righteous, Comfortaa, Fredoka One
Mono: Space Mono, JetBrains Mono, Fira Code, Inconsolata
Handwriting: Caveat, Pacifico, Shadows Into Light, Grand Hotel
```

### 6C. Block Schemas — usage guide + validazione URL
Unificare schema + "quando usare" per ogni blocco (come in `full_prompts.md` §5).

Aggiungere istruzione per i link nei blocchi:
- Multi-page: usare `/slug` reali (solo quelli delle pagine generate)
- Single-page: usare `#sectionId`
- Mai inventare URL esterne

Il post-processing (Sezione 4F) fa la validazione finale e svuota i link invalidi.

Non aggiungere sequenza raccomandata per tipo business per ora.

### 6D. `cards.items.image` — URL Unsplash obbligatorio
Invertire la decisione precedente: l'utente vuole contenuti pronti alla pubblicazione, non bozze. Il prompt deve istruire l'AI a fornire URL Unsplash pertinenti per ogni card item, come già fa per hero. Il post-processing (Sezione 4E) poi valida gli URL e svuota quelli rotti.
```
- **cards**: items include "image": "<unsplash_url>" — choose a relevant high-quality photo matching the item topic
```

### 6E. Pattern Rules — versione ridotta
3 punti essenziali: usa pattern su 2-3 blocchi per pagina (non su hero), alterna sezioni chiare e scure, mixa varianti. Rimuovere `patternColor` e `patternOpacity` dalle istruzioni (calcolati in post-processing, Sezione 4B).

### 6F. Rimuovere tag HTML dalla sezione Copywriting
Rimuovere istruzioni su `<h2>`, `<p>` — gestiti dai default dei blocchi.

### 6G. Modalità Creativa (flag off by default)
Aggiungere al template USER INPUT (non al system prompt statico) un blocco condizionale:
```
{{#if creativeMode}}
### CREATIVE MODE: Be bold and inventive. Use rich, varied content. Max 10 blocks per page.
{{/if}}
```
Il flag `creativeMode: boolean` (default `false`) si aggiunge all'interfaccia `AIGenerationData`.

### 6H. Ridurre etichette "CRITICAL"
Usarle solo per vincoli unici e non ovvi. Struttura e posizione delle sezioni comunicano priorità meglio delle etichette ripetute.

---

## SEZIONE 7 — Template USER INPUT — Pulizia
**File**: `app/actions/ai-generator.ts` — `promptParts[1]`

### 7A. Rimuovere
- Tutto il blocco `### 🔴 NAVIGATION LINK RULE` (deterministico)
- Tutto il blocco `### 🔴 USER STYLE OVERRIDES` (colori e font non passati all'AI)
- Le regole copywriting duplicate (mantenere solo nel system prompt)

### 7B. Font — aggiunta condizionale
Aggiungere solo se `!data.fontFamily` (l'utente non ha impostato il font — in quel caso il system prompt già guida la scelta con lista + regole per tone):
```ts
${!data.fontFamily ? '### FONT: Choose the most appropriate font from the available list based on tone and business type.' : ''}
```

### 7C. Risposte di validazione
Le risposte dell'utente alle domande di validazione vengono concatenate come testo libero alla `description` dal chiamante UI. Aggiungere commento esplicativo nel codice.

Se le risposte contengono dati di contatto (email, phone, address) — il chiamante UI deve estrarli e inserirli nei campi strutturati (`data.email`, `data.phone`, ecc.) **prima** di chiamare `generateProjectWithAI`, non concatenarli alla description.

---

## SEZIONE 8 — Prompt Validazione — Sostituzione
**File**: `lib/ai/prompts.ts` — costante `AI_VALIDATION_PROMPT`

Sostituire con la versione proposta in `full_prompts.md` §4, con modifica:
- **Max domande: 5** (non 10 — preferire poche domande davvero utili a molte generiche)
- Il modello deve preferire `isReady: true` con 1 domanda precisa piuttosto che 5 domande vaghe
- Lingua stessa del progetto già prevista nella proposta

---

## SEZIONE 9 — Form/UI (Componente AIGeneratorModal)
*Interventi nel componente UI, non in `ai-generator.ts`*

### 9A. 3 Color Picker
- **Sfondo** → `bgColor`
- **Testo** → `textColor`
- **Accento (bottoni)** → `accentColor`

Rimuovere il campo `appearance` dal form — calcolato deterministicamente.

### 9B. Font Selector
Il componente `FontManager` già esiste in [components/blocks/sidebar/ui/FontManager.tsx](components/blocks/sidebar/ui/FontManager.tsx) con i 49 font e search/preview. Riutilizzarlo nel form AI.

### 9C. Lunghezze massime e sanitizzazione
| Campo | Max caratteri | Note |
|---|---|---|
| `businessName` | 100 | |
| `description` | 5000 | Già validato in `ai-generator.ts`. Sufficiente: ~700 parole, più che abbastanza per descrivere un sito. Non è il testo del sito, sono istruzioni all'AI. |
| `email` | 100 | |
| `phone` | 30 | |
| `address`, `city`, `zip`, `country` | 100 ciascuno | |
| Nome pagine extra | 60 | |
| Descrizione pagine extra | 1500 | Per pagina. Aumentabile se necessario ma 1500 caratteri (≈200 parole) è molto per descrivere una singola pagina. |

Tutti i campi testo: sanitizzazione XSS lato server (già parzialmente gestita dalla lunghezza max + parsing).

### 9D. Flag Modalità Creativa
Toggle disattivo di default, collegato a `creativeMode: boolean`.

### 9E. Visibilità form con input lunghi
La textarea `description` deve avere altezza fissa con scroll interno (non espandersi infinitamente) — evita che spinga fuori schermo gli altri campi.

---

## Tabella Priorità

| # | Sezione | Impatto | Complessità | Priorità |
|---|---|---|---|---|
| 2 | Flusso Colori Deterministico | Fix bug accentColor + appearance | Media | Alta |
| 4A | Overlay tutti i blocchi con backgroundImage | Fix visivo, quick win | Bassa | Alta |
| 4D | fontFamily validation + fallback | Previene fallback silenzioso | Bassa | Alta |
| 6 | System Prompt — sostituzione | Qualità AI + efficienza token | Alta | Alta |
| 8 | Prompt Validazione — sostituzione | UX onboarding | Bassa | Alta |
| 3 | Parametri Pre-AI deterministici | Consistenza UI eliminando variabilità AI | Bassa | Media |
| 4C | CTA nel Navigation Block | Feature richiesta | Bassa | Media |
| 4F | Validazione URL nei blocchi | Correttezza link generati | Media | Media |
| 7 | Template USER INPUT — pulizia | Prompt più pulito, meno token | Bassa | Media |
| 5A | Cap MAX 2 retry | Safety, cost control | Bassa | Media |
| 4B | Pattern color/opacity deterministici | Consistenza visiva | Bassa | Media |
| 4E | Validazione URL immagini background | UX edge case (broken images) | Media | Bassa |
| 1 | Rinominare campi interfaccia | Chiarezza codice (breaking change UI) | Media | Bassa |
| 6G | Modalità Creativa flag | Feature futura | Media | Bassa |
| 9 | Interventi Form/UI | UX migliorativa | Media | Bassa |

---

## Note Architetturali Finali

**`secondaryColor` nel JSON finale**: È il colore bottone secondario (derivato da `accentColor`). Nome fuorviante ma mantenuto per compatibilità col rendering engine. Il colore sfondo è in `themeColors.{light|dark}.bg`.

**`themeColors` nel JSON finale**: Entrambe le varianti (light e dark) vengono sempre popolate in `finalSettings` — supporta eventuale switch dinamico client-side.

**Logo**: Logica attuale corretta. Nessuna modifica.

**Immagini input (logo/screenshot)**: Vengono convertite in base64 tramite `fetchImageAsBase64` prima di essere passate al modello. Le URL Unsplash sono generate dall'AI come stringhe nell'output JSON — il modello non le "legge", le scrive. Nessuna modifica al flusso input.

**Estrazione font da screenshot**: Il modello identifica la categoria (serif/sans-serif/display) con affidabilità. Il nome specifico del font non è affidabile. La lista vincolante nel prompt risolve il problema: l'AI sceglie il font più simile per categoria tra quelli disponibili.
