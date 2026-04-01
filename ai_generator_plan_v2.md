# Piano Interventi AI Generator — v2
*Redatto: 2026-04-01 | Follow-up a ai_generator_plan.md*

---

## Diagnosi per ogni problema riportato

---

### PROBLEMA 1: AI troppo conservativa, pochi blocchi

**Causa**: Il prompt attuale ha troppe istruzioni che limitano. Specificamente:
- Tutti i blocchi (non solo hero) hanno vincoli tipo `MAX 2-3 sentences`, `1 sentence`, `2-4 words`
- Le note `[Skip if: ...]` sono troppo aggressive — l'AI le usa come permesso per tagliare
- Manca un'istruzione esplicita che dica "usa TUTTO il contenuto che ti ho dato"
- Il prompt dice "choose blocks based on what the business ACTUALLY NEEDS" senza chiarire che se l'utente dà info dettagliate, quelle info VANNO usate tutte, anche se significa più blocchi o testi più lunghi

**Fix (prompt)**:
- I limiti `MAX X words/sentences` si applicano SOLO a `hero.title` e `hero.subtitle`. Tutto il resto non ha limiti fissi.
- Aggiungere regola esplicita: **"CONTENT DEPTH: Match detail level to what the user provided. If user gave a 3-sentence service description, write 3 sentences. If user listed 6 features, use all 6. NEVER truncate user-provided information."**
- Cambiare tutte le note `[Skip if: ...]` in suggerimenti leggeri, non divieti. L'AI deve preferire includere piuttosto che escludere quando il materiale c'è.
- Per le pagine interne specificamente: **"Inner pages should be as rich as the user's description allows. Prefer 5-8 blocks over 3-4 when content exists."**

---

### PROBLEMA 2: Hero su ogni pagina

**Causa**: Il prompt dice `[ALWAYS on every page]` e `Hero backgroundImage is MANDATORY on every page`. Questo forza un blocco visivamente pesante (full-screen image + overlay) su pagine interne dove è inappropriato.

**Risposta alla domanda su layout alternativi**:
Non esiste un blocco dedicato "page header" — ma il blocco `text` usato come primo elemento di una pagina interna funziona perfettamente come intestazione. Oppure si può usare hero con `backgroundImage` vuoto, ma questo richiederebbe verificare che il renderer lo gestisca senza overlay/immagine.
La soluzione più pulita senza toccare il frontend: **hero solo su Home, pagine interne iniziano con `text` come header**.

**Fix (prompt)**:
```
- **hero** [MANDATORY on Home page only. OPTIONAL on inner pages — use only if page clearly benefits from a full-width visual (e.g. a Gallery or Portfolio page with strong imagery). For service pages, team pages, contact pages: start with a "text" block as page header instead.]
  { ... }
```
E rimuovere `Hero backgroundImage is MANDATORY on every page` dall'OUTPUT FORMAT, sostituire con:
```
- Home page hero backgroundImage is MANDATORY.
- Inner page hero backgroundImage is required only if hero block is used.
```

---

### PROBLEMA 3: Immagini cards rotte

**Causa**: L'AI genera URL Unsplash con photo ID inventati (es. `https://images.unsplash.com/photo-1234567890`). Gli ID Unsplash sono stringi specifiche di 10+ caratteri — l'AI li inventa e la maggior parte non esiste.

**Non esiste un modo affidabile per far generare all'AI URL Unsplash validi senza fornirle una lista di ID reali.** Unsplash Source API (`source.unsplash.com/?keyword`) è stata deprecata nel 2022.

**Fix (post-processing)**:
Quando la validazione URL di un'immagine fallisce (HEAD request → non-200), sostituire con **Picsum Photos**: `https://picsum.photos/seed/{seed}/800/500` dove `seed` è derivato dal titolo dell'item + business type. Picsum è gratuito, non richiede API key, è deterministico per seed, e restituisce sempre una foto reale.

Estendere `validateAndCleanBackgroundImages` per coprire anche `cards.items[*].image` e `blocks[*].content?.items[*]?.image` in generale, con fallback Picsum invece di string vuota.

```ts
// Fallback per immagini cards rotte
const picsumFallback = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`;

// Se HEAD fallisce → picsumFallback(item.title + businessType)
// Se HEAD ok → mantieni URL originale
```

**Fix (prompt)**:
Rimuovere l'istruzione di usare Unsplash per cards items. Invece:
```
- **cards**: For each item's "image" field, use this format: https://picsum.photos/seed/{descriptive-keyword}/800/500
  Replace {descriptive-keyword} with a relevant English word for the item (e.g. "restaurant-pasta", "fitness-gym", "lawyer-office").
  This guarantees the image always loads.
```
Picsum con seed keyword dà foto coerenti col tema — molto meglio di ID Unsplash inventati.

---

### PROBLEMA 4: Testi troppo brevi nonostante descrizione dettagliata

**Causa**: I vincoli nel prompt (`MAX 2-3 sentences`, `1 sentence per description`) si applicano universalmente a tutti i blocchi, schiacciando anche i contenuti di pagine interne dove l'utente ha fornito dettaglio esplicito.

**Fix (prompt)**:
Separare nettamente le regole di brevità:
- **Hero**: mantieni i limiti (è un blocco scannable per definizione)
- **Tutti gli altri blocchi**: nessun limite fisso di parole/frasi
- Aggiungere: `"cards.items.description: Write as much detail as the user provided. For service descriptions, this can be 3-5 sentences if the user gave that level of detail."`
- Aggiungere: `"text block: can have multiple paragraphs if user provided rich content"`
- Rinominare la sezione COPYWRITING in `COPYWRITING — HERO ONLY` per chiarire che quei limiti valgono solo per l'hero

---

### PROBLEMA 5: Color picker imposta valori anche quando non toccato

**Causa identificata**: il problema ha **due livelli distinti**.

**Livello 1 — Form (UX bug)**:
```tsx
<input type="color" value={accentColor || '#000000'} onChange={e => setAccentColor(e.target.value)} />
```
Il browser mostra il native color picker. Aprirlo e chiuderlo senza spostarsi può firing onChange con il valore di default (`#000000` o `#ffffff`), settando lo state da `null` a un colore non voluto dall'utente.

**Fix form**: non renderizzare il `<input type="color">` quando lo state è null. Mostrare invece un bottone "+" che, al click, inizializza il colore a un sensato default e mostra il picker. Il pattern è: stato null = non impostato (mostra "+ Personalizza"), stato non-null = impostato (mostra picker + X per reset).

```tsx
// Invece di sempre renderizzare il picker:
{accentColor ? (
  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
) : (
  <button onClick={() => setAccentColor('#3b82f6')}>+ Imposta colore accento</button>
)}
```

**Livello 2 — Server Action (fallback troppo aggressivo)**:
```ts
const aiBG   = aiOutput.settings?.themeColors?.light?.bg   || '#ffffff';
const aiText = aiOutput.settings?.themeColors?.light?.text || '#000000';
```
Se l'AI non genera `themeColors` (cosa che capita), il fallback è bianco/nero — uguale a come se l'utente avesse impostato bianco/nero. Il sito risulta monocromatico.

**Fix server action**: rendere `themeColors` OBBLIGATORIO nel prompt con indicazione forte. E se comunque mancano, usare fallback intelligenti per business type invece di bianco/nero. Es:
```ts
const DEFAULT_COLORS_BY_TYPE: Record<string, {bg: string, text: string, accent: string}> = {
  Restaurant:    { bg: '#fdf6f0', text: '#2d1b0e', accent: '#c0392b' },
  ProfessionalService: { bg: '#f8fafc', text: '#1e293b', accent: '#2563eb' },
  HealthAndBeautyBusiness: { bg: '#fdf4f8', text: '#3d1a2e', accent: '#c2185b' },
  // ... etc
};
const typeDefault = DEFAULT_COLORS_BY_TYPE[data.businessType] || { bg: '#f8f9fa', text: '#1a1a2e', accent: '#3b82f6' };
const aiBG   = aiOutput.settings?.themeColors?.light?.bg   || typeDefault.bg;
const aiText = aiOutput.settings?.themeColors?.light?.text || typeDefault.text;
const aiAccent = aiOutput.settings?.accentColor            || typeDefault.accent;
```
Molto meglio di bianco/nero per qualsiasi tipo di business.

**Fix prompt**: aggiungere in apertura del GLOBAL SETTINGS SCHEMA:
```
themeColors is REQUIRED. You MUST generate coherent, non-generic hex colors appropriate for this business type and tone. Never return white (#ffffff) and black (#000000) as the only colors — generate a real visual identity.
```

---

### PROBLEMA 6: Block backgroundColor fuori palette

**Causa**: L'AI genera `style.backgroundColor` per i blocchi liberamente, scegliendo colori arbitrari che non hanno relazione con la palette del sito.

**Il problema è strutturale**: al momento della generazione, l'AI non sa ancora con esattezza quali saranno i colori finali (perché il post-processing può sovrascrivere i suoi colori con quelli utente). Quindi non può riferirsi a "usare accentColor" con un valore fisso.

**Fix (prompt — parziale)**:
Istruire l'AI a usare solo i colori della palette che sta generando:
```
For block style.backgroundColor: use ONLY colors from the palette you are defining in themeColors and accentColor.
- Normal section: leave backgroundColor unset (uses theme default)
- Inverted/dark section: use themeColors.dark.bg
- Accent section: use accentColor (slightly lightened if needed for large areas)
Never use arbitrary colors like #e8d5c4 or #f0e6d3 — they won't match the theme.
```

**Fix (post-processing — definitivo)**:
Dopo che i colori tema sono definiti (`themeBG`, `themeText`, `accentBG`), per ogni blocco con `style.backgroundColor` impostato:
- Se è uguale o vicino a uno di `{themeBG, themeText, accentBG}` → mantieni
- Se è "bianco sporco / beige / grigio" inventato → sostituisce con `accentBG` (la scelta più probabile per una sezione evidenziata)
- "Vicino a" = distanza euclidea RGB < 40

```ts
function isInPalette(hex: string, palette: string[]): boolean {
  const dist = (a: string, b: string) => {
    const [r1,g1,b1] = parseHex(a), [r2,g2,b2] = parseHex(b);
    return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
  };
  return palette.some(c => dist(hex, c) < 40);
}

// In post-processing:
if (block.style?.backgroundColor && !isInPalette(block.style.backgroundColor, [themeBG, themeText, accentBG])) {
  block.style.backgroundColor = accentBG;  // fallback all'accent color
}
```

---

## Tabella riassuntiva interventi

| # | Problema | File | Tipo intervento | Priorità |
|---|---|---|---|---|
| 5b | AI non genera themeColors → bianco/nero | `ai-generator.ts` | Fallback per business type + prompt fix | Alta |
| 1 | AI troppo conservativa | `lib/ai/prompts.ts` | Rimuovere limiti inner blocks + Content Depth rule | Alta |
| 4 | Testi troppo corti | `lib/ai/prompts.ts` | Separare regole hero da inner blocks | Alta |
| 3 | Immagini cards rotte | `lib/ai/prompts.ts` + `ai-generator.ts` | Picsum nel prompt + fallback post-processing | Alta |
| 5a | Color picker setta valori non voluti | `AIGeneratorModal.tsx` | Render condizionale input[type=color] | Media |
| 2 | Hero su ogni pagina | `lib/ai/prompts.ts` | Hero obbligatorio solo su Home | Media |
| 6 | Block backgroundColor fuori palette | `ai-generator.ts` + `lib/ai/prompts.ts` | Post-processing + istruzione AI | Media |

---

## Note finali

**Su Unsplash vs Picsum**: Picsum per le cards è la scelta giusta per affidabilità. Per l'hero si può mantenere Unsplash perché l'AI tende a generare ID più realistici per le foto paesaggio/ambiente (che sono i soggetti più comuni su Unsplash), ma anche lì vale il fallback Picsum se la validazione fallisce.

**Su themeColors**: questo è il fix più impattante. L'AI che produce bianco/nero invece di una palette coerente causa il 90% dei problemi visivi. Va risolto sia nel prompt (obbligatorio + "no generic colors") che nel server action (fallback per business type invece di #ffffff/#000000).

**Sui colori utente e il picker**: la soluzione del render condizionale è più UX-safe. L'alternativa "tenere il picker sempre visibile ma non inviarlo finché non cambiato" è più fragile perché dipende dal comportamento del browser nativo.
