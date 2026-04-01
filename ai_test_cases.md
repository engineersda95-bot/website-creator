# Test Cases Manuali — AI Generator
*Da eseguire con il form AI dopo aver deployato le modifiche*

---

## Come usare la cache durante i test

1. Prima esecuzione con un set di parametri → chiama l'AI reale, salva in `.ai-cache/`
2. Esecuzioni successive con gli stessi parametri → usa il file cache (zero costo, istantaneo)
3. Per forzare una nuova chiamata AI → cancella il file `.ai-cache/gen-{hash}.json` corrispondente
4. Per resettare tutto → `rm -rf .ai-cache/`

---

## BLOCCO 1 — Sistema Colori

### TC-COL-01: Colori AI usati quando l'utente non ne imposta nessuno
**Setup**: form senza toccare i color picker (tutti a "Predefinito")
**Aspettato**:
- `settings.themeColors.light.bg/text` corrispondono a quanto generato dall'AI per il tipo di business
- `settings.primaryColor` = accentColor scelto dall'AI
- `settings.appearance` calcolato da luminanza: se sfondo scuro → `dark`, se chiaro → `light`

### TC-COL-02: Colori utente sovrascrivono l'AI
**Setup**: imposta Sfondo `#1a1a2e`, Testo `#e0e0e0`, Accento `#e94560`
**Aspettato**:
- `settings.themeColors.light.bg = #1a1a2e`
- `settings.themeColors.light.text = #e0e0e0`
- `settings.primaryColor = #e94560`
- `settings.appearance = 'dark'` (sfondo più scuro del testo)
- `settings.secondaryColor` = versione più scura di `#e94560`
- Bottoni: testo bianco (`#ffffff`) su accento scuro

### TC-COL-03: Appearance calcolata deterministicamente (NON da AI)
**Setup**: imposta Sfondo `#ffffff`, Testo `#111111`
**Aspettato**: `settings.appearance = 'light'`

**Setup**: imposta Sfondo `#0f0f0f`, Testo `#f5f5f5`
**Aspettato**: `settings.appearance = 'dark'`

### TC-COL-04: Contrasto testo bottone calcolato automaticamente
**Setup**: Accento chiaro `#f5d020`
**Aspettato**: testo bottone = `#000000` (scuro su giallo chiaro)

**Setup**: Accento scuro `#1e3a5f`
**Aspettato**: testo bottone = `#ffffff` (bianco su blu scuro)

### TC-COL-05: themeColors popolate entrambe le varianti
**Setup**: qualsiasi combinazione di colori
**Aspettato**: nel JSON finale esistono sia `themeColors.light` che `themeColors.dark`, entrambe con `bg` e `text` non nulli

---

## BLOCCO 2 — Parametri Deterministici UI

### TC-BTN-01: buttonRadius da tone
| Tone nel form | Aspettato |
|---|---|
| Creativo | `buttonRadius: 22` |
| Amichevole | `buttonRadius: 14` |
| Professionale | `buttonRadius: 6` |
| Formale | `buttonRadius: 3` |

### TC-BTN-02: buttonShadow da appearance + tone
| Condizione | Aspettato |
|---|---|
| Qualsiasi tone + sfondo scuro (dark) | `buttonShadow: "none"` |
| Tone Formale + sfondo chiaro | `buttonShadow: "none"` |
| Tone Professionale + sfondo chiaro | `buttonShadow: "M"` |
| Tone Creativo + sfondo chiaro | `buttonShadow: "M"` |

### TC-BTN-03: buttonAnimation da tone
| Tone | Aspettato |
|---|---|
| Creativo | `buttonAnimation: "bounce"` |
| Amichevole | `buttonAnimation: "pulse"` |
| Professionale / Formale | `buttonAnimation: "none"` |

---

## BLOCCO 3 — Font

### TC-FONT-01: Font utente ha priorità assoluta
**Setup**: seleziona "Lora" dal font selector
**Aspettato**: `settings.fontFamily = "Lora"` indipendentemente da cosa sceglie l'AI

### TC-FONT-02: Font AI valido viene usato se non impostato dall'utente
**Setup**: nessun font selezionato; l'AI dovrebbe scegliere dalla lista
**Aspettato**: `settings.fontFamily` è uno dei 49 font disponibili (non "Helvetica Neue", non "Arial")

### TC-FONT-03: Font AI invalido → fallback da tone
**Verificare in console/log** se l'AI restituisce un font non nella lista (può richiedere di forzare un output invalido modificando temporaneamente il prompt)
**Aspettato**: `fontFamily` = il fallback corretto per il tone (Montserrat per professional, Poppins per friendly, Syne per creative, Lora per formal)

### TC-FONT-04: Nessun font, nessun tone riconosciuto → Outfit
**Setup**: tone non standard o vuoto + nessun font utente
**Aspettato**: `settings.fontFamily = "Outfit"`

---

## BLOCCO 4 — Overlay e Immagini

### TC-IMG-01: Hero sempre con overlay
**Aspettato**: ogni blocco `hero` con `backgroundImage` ha `style.overlayOpacity = 65` e `style.overlayColor = "#000000"`

### TC-IMG-02: Testo su hero sempre bianco (indipendente da tema)
**Setup**: genera con tema scuro (sfondo `#0f0f0f`)
**Aspettato**: `hero.style.textColor = "#ffffff"` (NON il colore sfondo del tema)

### TC-IMG-03: Overlay forzato su blocchi non-hero con backgroundImage
**Se l'AI genera un blocco non-hero con `backgroundImage`** (raro ma possibile):
**Aspettato**: stesso comportamento del hero — overlay + testo bianco

### TC-IMG-04: Cache non invalida su cambio backgroundImage
*(Nota: l'URL Unsplash è nell'output AI, non nell'input → stessa cache → stesso URL)*
**Aspettato**: cambiar solo il `description` produce nuovo URL Unsplash (nuova chiamata AI)

---

## BLOCCO 5 — Pattern

### TC-PAT-01: patternColor deterministico
**Setup**: genera con qualsiasi business type con pattern abilitati dall'AI
**Aspettato**: blocchi con `patternType != 'none'` hanno `patternColor` = `themeText` (non un colore inventato dall'AI)

### TC-PAT-02: patternOpacity per tema
**Setup light**: `patternOpacity = 7`
**Setup dark**: `patternOpacity = 8`

---

## BLOCCO 6 — Navigation CTA

### TC-NAV-01: CTA nel nav per sito single-page
**Setup**: sito a pagina singola, obiettivo "prenotazione"
**Aspettato**: blocco navigation ha `ctaLabel: "Prenota ora"`, `ctaUrl: "#contatti"`, `showCTA: true`

### TC-NAV-02: CTA nel nav per sito multi-page
**Setup**: sito con extra page "Contatti", obiettivo "contact"
**Aspettato**: `ctaLabel: "Contattaci"`, `ctaUrl: "/contatti"` (slug della pagina contatti)

### TC-NAV-03: CTA label in inglese
**Setup**: lingua `en`, obiettivo "book"
**Aspettato**: `ctaLabel: "Book now"`

### TC-NAV-04: Mapping obiettivi → label
| Obiettivo | Label IT aspettata |
|---|---|
| "prenotazione tavolo" | "Prenota ora" |
| "contattaci" | "Contattaci" |
| "richiedi preventivo" | "Richiedi preventivo" |
| "acquisto prodotti" | "Acquista" |
| "" (vuoto) | "Scopri di più" |

---

## BLOCCO 7 — Validazione URL Blocchi

### TC-URL-01: Link a pagina inesistente → svuotato
**Setup**: sito multi-page con Home + Chi Siamo
**Genera**: un blocco con `ctaUrl: "/servizi"` (pagina non generata)
**Aspettato**: `ctaUrl: ""` nel JSON finale

### TC-URL-02: Link a pagina esistente → mantenuto
**Setup**: sito multi-page con Home + Chi Siamo (slug `chi-siamo`)
**Aspettato**: `ctaUrl: "/chi-siamo"` rimane invariato

### TC-URL-03: Link esterno non toccato
**Setup**: blocco con `ctaUrl: "https://instagram.com/esempio"`
**Aspettato**: URL mantenuto invariato

### TC-URL-04: Single-page con anchor nav — link convertiti
**Setup**: sito singola pagina con anchor nav
**Aspettato**: link interni come `/contatti` convertiti in `#contatti`

---

## BLOCCO 8 — Prompt di Validazione

### TC-VAL-01: Max 5 domande
**Setup**: descrizione vaga ma non vuota (es. "Ho un'attività commerciale")
**Aspettato**: al massimo 5 domande generate, non di più

### TC-VAL-02: Nessuna domanda su logo/immagini/colori
**Setup**: qualsiasi descrizione
**Aspettato**: nessuna domanda del tipo "Hai un logo?", "Che colori preferisci?", "Hai immagini?"

### TC-VAL-03: Domande nella lingua del progetto
**Setup**: form con lingua `en`, descrizione in inglese
**Aspettato**: domande in inglese

### TC-VAL-04: isReady: true per descrizione sufficiente
**Setup**: "Ristorante italiano specializzato in cucina siciliana, a Milano, aperto a pranzo e cena"
**Aspettato**: `isReady: true`, zero domande (info sufficienti)

### TC-VAL-05: Domande azionabili e testuali
**Setup**: "Ho un'attività" (minimo)
**Aspettato**: domanda del tipo "Che tipo di attività?" — non "Hai foto?" o "Hai un sito attuale?"

---

## BLOCCO 9 — Cache AI

### TC-CACHE-01: Stessa chiamata → file cache creato
**Azione**: prima generazione con parametri X
**Aspettato**: file `.ai-cache/gen-{hash}.json` creato nella root del progetto

### TC-CACHE-02: Stessa chiamata → usa cache, non chiama AI
**Azione**: seconda generazione con ESATTAMENTE gli stessi parametri
**Aspettato**: log in console `[AI Generator] Using cached response`, nessuna chiamata Gemini

### TC-CACHE-03: Cambio di un solo parametro → nuova chiamata AI
**Azione**: cambia solo la `description` di una parola
**Aspettato**: nuovo file cache creato, AI chiamata nuovamente

### TC-CACHE-04: Cache validazione separata da generazione
**Aspettato**: file `val-{hash}.json` e `gen-{hash}.json` distinti in `.ai-cache/`

### TC-CACHE-05: Cache include il testo del prompt
**Aspettato**: se si modifica `AI_WEBSITE_GENERATOR_SYSTEM_PROMPT` in `prompts.ts`, l'hash cambia e la vecchia cache non viene usata (il systemPrompt è incluso nel hash)

---

## BLOCCO 10 — Robustezza e Safety

### TC-SAFE-01: Max 2 retry su primary model
**Verificare nei log** che in caso di JSON invalido dal primary, ci sia al massimo 1 retry, poi fallback al model lite (non loop infiniti)

### TC-SAFE-02: URL immagine non Supabase → rifiutata
**Setup**: passa un logo con URL non-Supabase (es. `https://example.com/logo.png`)
**Aspettato**: errore `URL immagine non valida.` prima ancora di chiamare l'AI

### TC-SAFE-03: Descrizione troppo lunga → rifiutata
**Setup**: testo >5000 caratteri nel campo descrizione
**Aspettato**: errore `Descrizione troppo lunga (max 5000 caratteri).`

### TC-SAFE-04: Business name vuoto → rifiutato
**Setup**: campo nome attività vuoto
**Aspettato**: errore `Nome attività obbligatorio.`

---

## BLOCCO 11 — Schema AI (Qualità Output)

### TC-AI-01: themeColors sempre nel JSON AI
**Verifica nel file cache** `gen-{hash}.json`:
**Aspettato**: `settings.themeColors.light.bg`, `.light.text`, `.dark.bg`, `.dark.text` presenti e hex validi

### TC-AI-02: accentColor nel JSON AI
**Aspettato**: `settings.accentColor` presente, hex valido

### TC-AI-03: fontFamily nella lista dei 49 font
**Aspettato**: `settings.fontFamily` è esattamente uno dei font nella lista (case-sensitive)

### TC-AI-04: navigation/footer NON nel JSON AI
**Verifica nel file cache**:
**Aspettato**: `settings.navigation` e `settings.footer` assenti o vuoti nell'output grezzo dell'AI

### TC-AI-05: cards.items hanno image URL Picsum
**Aspettato**: blocchi `cards` hanno `items[*].image` con URL `https://picsum.photos/seed/{keyword}/800/500` (non stringa vuota, non URL Unsplash con ID inventati)

### TC-AI-06: hero.backgroundImage presente su Home, opzionale su pagine interne
**Setup**: sito multi-page (Home + Chi Siamo)
**Aspettato**: Home ha un blocco hero con `backgroundImage` non vuoto. Chi Siamo inizia con un blocco `text` come header (non hero).

---

## Ordine di Esecuzione Consigliato

1. TC-CACHE-01/02/03 → verifica che la cache funzioni (fondamentale per i test successivi)
2. TC-COL-01 → baseline colori AI
3. TC-COL-02/03/04 → override utente
4. TC-BTN-01/02/03 → parametri deterministici
5. TC-FONT-01/02 → font
6. TC-NAV-01/02/03 → CTA navigation
7. TC-VAL-01/02/03/04 → validazione prompt
8. TC-AI-01/02/03/04 → qualità output AI (leggendo il file cache)
9. TC-SAFE-01/02/03/04 → safety/validazione input
