# Analisi System Prompt — AI HTML Generator

Due prompt attivi: `SYSTEM_PROMPT` (nuova generazione) e `FOLLOWUP_SYSTEM_PROMPT` (modifica su codice esistente).

---

## SYSTEM_PROMPT — sezione per sezione

---

### OUTPUT FORMAT
```
Respond ONLY with valid JSON, no markdown fences: {"html":"...","css":"...","js":"..."}
```
**Scopo:** evitare che l'AI wrappa la risposta in ```json ... ```.
**Stato:** necessario e corretto. La regex di pulizia nel codice gestisce anche il caso in cui lo faccia ugualmente, ma meglio prevenire.
**Miglioramento:** nessuno.

---

### HTML STRUCTURE RULES
```
Root must be <section class="cb-wrap">. Inside, <div class="cb-inner">. All classes prefixed "cb-".
```
**Scopo:** garantire struttura predicibile per il CSS scoping (`#chb-BLOCKID .cb-wrap`).
**Stato:** necessario.
**Miglioramento:** ora che il CSS viene scopato automaticamente a runtime (`scopeBlockCss`), la regola "prefix cb-" serve solo per evitare collisioni nell'HTML stesso (classi duplicate tra blocchi diversi). Vale ancora, ma la motivazione nel prompt è sbagliata — dice "to avoid collisions" che ora è garantito dal scoping. Può restare ma la spiegazione è fuorviante.
NOTA DEV: se è fuorviante cambiamo

---

### CSS RULES — .cb-wrap, .cb-inner, font-size vars, btn-radius
**Scopo:** impedire che l'AI rompa i controlli della piattaforma (padding, colori, tipografia).
**Stato:** necessario. Le regole sui CSS vars (`--global-h1-fs` ecc.) sono critiche.
**Ripetizioni:** la regola "NO background/padding/margin su .cb-wrap" appare **3 volte** nella stessa sezione (riga 71, 72, 79). Va ridotta a una sola occorrenza.
**Miglioramento:** consolidare in una lista puntata senza ripetizioni.
NOTA DEV: ok facciamolo

---

### RESPONSIVE — @container pattern
```
REQUIRED pattern — copy this exactly:
  .cb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
  @container (max-width: 1024px) { .cb-grid { grid-template-columns: repeat(2, 1fr); } }
  @container (max-width: 640px)  { .cb-grid { grid-template-columns: 1fr; gap: 1rem; } }
```
**Scopo originale:** mostrare all'AI il pattern `@container` perché è meno comune di `@media`.
**Problema (come sollevato dall'utente):** il nome `.cb-grid` è hardcoded nell'esempio — l'AI potrebbe copiarlo letteralmente invece di adattarlo al layout specifico. Il pattern è un esempio di griglia generica che non si applica a tutti i casi (hero split, cards, testimonials...).
**Miglioramento:** rimuovere il blocco "REQUIRED pattern — copy this exactly" e sostituire con una regola sintetica: *"Use `@container` queries (not `@media`) for ALL breakpoints. Always include rules for max-width:1024px and max-width:640px."* L'AI capisce `@container` senza bisogno di un template rigido.
NOTA DEV: FACCIAMO

---

### ICONS — Lucide SVG inline
```
Lucide icon paths (copy the <path> / <circle> / ... elements verbatim):
ZAP, HEART, SHIELD, USERS, BAR-CHART, CHECK-CIRCLE, STAR, ARROW-RIGHT, MAIL, CLOCK, SETTINGS, PHONE
```
**Scopo originale:** fornire icone pronte all'uso perché l'AI altrimenti inventa SVG path errati o usa emoji.
**Problema (come sollevato dall'utente):**
1. Sono solo 12 icone — l'AI inventa comunque percorsi per qualsiasi icona fuori da questa lista.
2. Occupano ~60 righe di prompt per un risultato parziale.
3. Le icone inline non sono editabili — non si possono sostituire dalla sidebar.
4. La soluzione corretta è usare `data-chb-svg` con markup encodato: l'utente può poi sostituire l'icona. Oppure, ancora meglio, il sistema potrebbe supportare un placeholder `data-chb-icon="lucide:zap"` risolto dal renderer (non ancora implementato).
**Miglioramento:** **rimuovere completamente** la sezione ICONS. Istruire l'AI a usare `data-chb-svg` per ogni icona decorativa, con il markup Lucide encodato. L'utente può sostituirla dalla sidebar. In futuro si può aggiungere un picker di icone Lucide nativo.
NOTA DEV: ma io ho già un selettore di lucide nativo lo uso per Benefits. perché non usarlo?

---

### ANIMATIONS
```
Only add animations when explicitly requested OR clearly appropriate.
CSS pattern: .cb-item { opacity:1 } .cb-item.cb-hidden { opacity:0; transform:translateY(30px) }
JS pattern: querySelectorAll('.cb-item').forEach(el => el.classList.add('cb-hidden')); IntersectionObserver...
```
**Spiegazione del JS (come chiesto dall'utente):** il pattern funziona così:
1. JS aggiunge `.cb-hidden` (opacity:0, translateY) a tutti gli elementi a pagina caricata
2. `IntersectionObserver` monitora quando ogni elemento entra nel viewport
3. Quando entra, rimuove `.cb-hidden` → la transizione CSS anima l'entrata

**Problema:** elementi inizialmente opacity:0 per via del JS, ma se JS è disabilitato o lento restano invisibili. Il prompt stesso dice "elements MUST be visible by default (no opacity:0)" e poi il pattern JS fa esattamente il contrario. **Contraddizione interna.**

**Altri problemi:**
- Il pattern usa `.cb-item` hardcoded — l'AI lo copia letteralmente su classi sbagliate.
- Aggiunge complessità (JS + CSS) quando nella maggior parte dei casi non serve.
- L'utente non ha controllo sulla velocità/tipo di animazione dalla sidebar.

**Miglioramento (come suggerito dall'utente):** **rimuovere completamente** la sezione ANIMATIONS dal prompt. Se l'utente chiede animazioni nella descrizione, l'AI le implementerà in modo libero e contestuale. Il prompt non deve prescrivere pattern specifici per qualcosa di opzionale.
NOTA DEV: TOGLIAMO

---

### EDITABLE PLACEHOLDERS
```
1. data-chb-img  2. data-chb-cta  3. data-chb-svg
```
**Scopo:** critico — definisce i placeholder editabili dalla sidebar.
**Stato:** necessario e ben scritto. Recentemente aggiunto l'esempio hero-con-immagine.
**Miglioramento minore:** spostare questa sezione più in alto nel prompt (prima di ICONS e ANIMATIONS), dato che è la parte più critica e specifica della piattaforma.
NOTA DEV: OK
---

### DESIGN QUALITY
```
Generous whitespace, clear hierarchy, subtle shadows, real copy — no lorem ipsum.
```
**Scopo:** evitare output brutti o con testo placeholder.
**Stato:** utile, conciso.
**Miglioramento:** nessuno.

---

### VIEWPORT VISIBILITY + MOBILE SAFETY
```
Every element MUST be visible on ALL viewport sizes. At max-width:640px all multi-column → single column.
NEVER position:absolute on text elements. NEVER hardcode px widths without max-width:100%.
```
**Scopo:** bloccare i pattern che rompono mobile (elementi sovrapposti, testo tagliato, colonne non collassate).
**Stato:** necessario — senza queste regole l'AI rompe sistematicamente il mobile.
**Ripetizioni:** "NEVER hardcode padding/margin on .cb-wrap" appare anche qui (già detto nella sezione CSS RULES).
**Miglioramento:** piccola pulizia delle ripetizioni con la sezione CSS RULES.
NOTA DEV: sei sicuro sia l'unico modo?

---

### FORBIDDEN
```
Lista di 15 voci: no background su .cb-wrap, no fixed px widths, no external fonts, ecc.
```
**Scopo:** lista negativa esplicita — i modelli AI rispondono bene a "NEVER X".
**Stato:** utile come lista compatta.
**Ripetizioni:** quasi tutte le voci della FORBIDDEN list sono già dette nelle sezioni precedenti. La lista è ridondante ma funziona come rinforzo finale — i modelli tendono a ignorare meno le FORBIDDEN list.
**Miglioramento:** mantenere la lista ma eliminarla come prima occorrenza — usarla solo come rinforzo finale, non come fonte primaria della regola.

---

### FOLLOW-UP / PATCH MODE (in fondo a SYSTEM_PROMPT)
```
Return COMPLETE updated code. Preserve everything not asked to change. Keep changes minimal.
```
**Problema:** questa sezione non serve in `SYSTEM_PROMPT` — il follow-up usa `FOLLOWUP_SYSTEM_PROMPT` separato. È codice morto.
**Miglioramento:** **rimuovere** da `SYSTEM_PROMPT`.
NOTA DEV: Da rimuovere

---

## FOLLOWUP_SYSTEM_PROMPT — analisi

```
You are modifying an existing HTML/CSS/JS section...
OUTPUT FORMAT — respond ONLY with valid JSON...
RULES (same as when it was created):
- Root: <section class="cb-wrap">...
- @container not @media
- data-chb-img / data-chb-cta / data-chb-svg rules (1 line each)
- Font-size vars
- NEVER color on text elements
- NEVER text-transform:uppercase
- ALL content visible on ALL viewports
- Mobile collapse at 640px
- Return COMPLETE updated code
```

**Stato generale:** buono — compatto e focalizzato.
**Problema:** le regole dei placeholder (`data-chb-img`, `data-chb-cta`, `data-chb-svg`) sono ridotte a una riga ciascuna, perdendo dettagli critici come:
- `data-chb-img` MANDATORY quando il layout ha uno slot immagine (regola aggiunta di recente)
- `data-chb-cta` deve essere vuoto (nessun contenuto inside)
- SVG encoding: tutti i `<`, `>`, `"` devono essere encodati — questo è critico e manca
**Miglioramento:** espandere leggermente le regole placeholder anche nel followup, specie l'encoding SVG e la mandatory image rule.
NOTA DEV: METTIAMOLI

---

## Riepilogo interventi proposti

| # | Cosa | Azione |
|---|------|--------|
| 1 | Regola `.cb-wrap no padding/bg` ripetuta 3 volte | Consolidare in una |
| 2 | "REQUIRED pattern — copy this exactly" con `.cb-grid` hardcoded | Rimuovere, sostituire con regola sintetica |
| 3 | Sezione ICONS con 12 Lucide SVG hardcoded | **Rimuovere completamente** |
| 4 | Sezione ANIMATIONS con pattern JS/CSS fisso | **Rimuovere completamente** |
| 5 | "FOLLOW-UP / PATCH MODE" in fondo a SYSTEM_PROMPT | Rimuovere (è nel followup prompt) |
| 6 | Encoding SVG mancante nel FOLLOWUP_SYSTEM_PROMPT | Aggiungere |
| 7 | Mandatory image rule mancante nel FOLLOWUP_SYSTEM_PROMPT | Aggiungere |
| 8 | Ordine sezioni: EDITABLE PLACEHOLDERS troppo in fondo | Spostare sopra RESPONSIVE |

**Risparmio stimato:** ~80-90 righe di prompt rimuovendo ICONS + ANIMATIONS + ripetizioni. Meno token = risposte più veloci e meno "rumore" per il modello.

---

## USER INPUT — cosa viene iniettato nei due prompt

Entrambi i prompt ricevono i dati del progetto appesi in coda al system text (non come messaggio utente separato).

### SYSTEM_PROMPT (nuova generazione)

```
[system text] = SYSTEM_PROMPT
  + PROJECT FONT: "Inter" — already loaded on the page, declare it via font-family in CSS.   ← se presente
  + ACCENT COLOR (use for highlights/borders/accents only, NOT section background): #3b82f6  ← se presente

[user message 1] = "REFERENCE IMAGE — PRIMARY design source. Replicate layout and style closely:"
[user message 2] = <immagine inline base64>   ← solo se l'utente ha caricato un'immagine di riferimento
[user message 3] = "USER REQUEST:\n<testo dell'utente>"
```
NOTA DEV: ma servono questi colori e font? non basta dire di usare le variabili globali?

**Esempio concreto (senza immagine):**
```
system: You are an expert frontend developer... [tutto SYSTEM_PROMPT]
        PROJECT FONT: "Poppins" — already loaded...
        ACCENT COLOR: #6366f1

user:   USER REQUEST:
        Crea una hero section con titolo grande, sottotitolo e due CTA affiancati
```

**Esempio concreto (con immagine di riferimento):**
```
system: [SYSTEM_PROMPT + font + accent]

user:   REFERENCE IMAGE — PRIMARY design source. Replicate layout and style closely:
        [immagine base64 inline]
        USER REQUEST:
        Replica questo design ma con i colori del progetto
```

---

### FOLLOWUP_SYSTEM_PROMPT (modifica su codice esistente)

```
[system text] = FOLLOWUP_SYSTEM_PROMPT
  + PROJECT FONT: ...   ← se presente
  + ACCENT COLOR: ...   ← se presente
NOTA DEV: anche qui controlliamo se effettivamente servono
[user message 1] = CURRENT CODE TO MODIFY:
  ```html
  <section class="cb-wrap">...</section>
  ```
  ```css
  .cb-inner { ... }
  ```
  ```js
  (vuoto o codice esistente)
  ```

  USER REQUEST: <testo dell'utente>
```

**Nota:** la chat history viene **ignorata** nel followup — si manda solo il codice corrente + richiesta. Questo evita che il contesto storico gonfi il prompt e riduce il rischio di timeout (45s vs 90s per le nuove generazioni).

---

## CONTROLLI DETERMINISTICI POST-RISPOSTA

Dopo che l'AI risponde, il codice applica i seguenti controlli **prima** di restituire il risultato al client. Nessuno di questi è affidato al modello.

### 1. Strip markdown fences
```ts
const raw = result.response.text().trim()
  .replace(/^```(?:json)?\s*/i, '')
  .replace(/\s*```\s*$/i, '');
```
Motivo: nonostante `responseMimeType: 'application/json'` e la regola nel prompt, alcuni modelli wrappano ugualmente in ` ```json ``` `.

### 2. JSON.parse
```ts
return JSON.parse(raw) as GenerateHtmlBlockResult;
```
Se il JSON è malformato → lancia `SyntaxError` → il chiamante ritenta con il modello fallback.
NOTA DEV: ok ma quindi prova due volte? e in caso di fallimento due volte restituisce un messaggio generico giusto? e non scala gli utilizzi all'utente

### 3. Fallback model su errori retriable
```ts
if (isRetryable(err) || err instanceof SyntaxError) {
  parsed = await callModel(FALLBACK_MODEL);
}
```
Status retriable: 429 (rate limit), 503, 500, 403. Anche JSON malformato triggera il fallback.
**Nota:** il fallback è `gemini-3.1-flash-lite-preview` — modello più leggero, più veloce, meno capace. Se il JSON è malformato sul primary è probabile che lo sia anche sul fallback.
NOTA DEV: ok piu che altro il fallback serve se il primo non è disponibile. Se c'è JSON malformato si può riprovare una volta e poi dare errore se ancora non va bene

### 4. Validazione minima del risultato
```ts
if (typeof parsed.html !== 'string') return { success: false, error: 'Risposta AI non valida.' };
```
Controlla solo che `html` esista come stringa. Non controlla:
- Che `html` contenga effettivamente `<section class="cb-wrap">`
- Che `css` non abbia `background` su `.cb-wrap`
- Che non ci siano `@media` invece di `@container`
- Che i placeholder `data-chb-img` siano ben formati

**Gap:** nessun sanitizzazione o correzione automatica del contenuto — tutto ciò che il prompt non riesce a far rispettare passa direttamente all'utente.
NOTA DEV: e come si può fare?

### 5. Timeout
```ts
const timeoutMs = isFollowUp ? 45000 : 90000;
Promise.race([model.generateContent(parts), new Promise(reject after timeoutMs)])
```
45s per followup, 90s per nuove generazioni. Se scatta → errore visibile all'utente.

### 6. Incremento usage
```ts
await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
```
Avviene **dopo** il parsing riuscito, **prima** di restituire il risultato. Se il modello fallback ha successo dopo che il primary ha fallito, l'usage viene incrementato una sola volta.

---

### Cosa manca nei controlli deterministici (gap da valutare)

| Gap | Impatto | Possibile fix |
|-----|---------|---------------|
| Nessun check che `html` inizia con `<section class="cb-wrap">` | Layout rotto | Strip/wrap automatico |
| `@media` non rimossi automaticamente | Mobile rotto | Regex replace `@media` → `@container` post-parse |
| `background` su `.cb-wrap` non rimosso | Colore sfondo ignorato | Regex strip post-parse |
| `text-transform:uppercase` non rimosso | Testo in maiuscolo forzato | Regex strip post-parse |
| `<img src="...">` non convertiti in `data-chb-img` | Immagini esterne non editabili | Parser HTML post-parse |
