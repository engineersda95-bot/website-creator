# Architettura del Sistema AI - SitiVetrina

Questa documentazione descrive il motore di intelligenza artificiale che alimenta la generazione automatica dei siti web.

## 1. Modelli e Infrastruttura
Il sistema utilizza l'SDK di **Google Generative AI (Gemini)**.
- **Modello Primario**: `gemini-3-flash-preview` (configurato per velocità e capacità multimodale).
- **Modello di Fallback**: `gemini-3.1-flash-lite-preview` (utilizzato in caso di errori 429, 503 o superamento quote).
- **Configurazione**: Tutti i modelli sono impostati con `responseMimeType: 'application/json'` per garantire output strutturati.

## 2. Workflow di Generazione

### Fase 1: Validazione dell'Input (`validateProjectDescription`)
Prima della generazione, l'IA agisce come un "Senior Project Manager".
- **Analisi**: Verifica se la descrizione fornita è sufficiente per un sito di alta qualità.
- **Interattività**: Se mancano dati critici (es. tipo di cucina per un ristorante), genera domande strutturate.
- **Output**: Un oggetto JSON con `isReady` e un array di `questions`.
- **Nota**: Le risposte dell'utente vengono concatenate come testo libero alla `description` — non esiste parsing strutturato. Il modello di generazione le legge nel contesto del testo lungo; l'efficacia dipende dalla capacità di seguire istruzioni in contesto esteso.
#### NOTA DEV: VORREI RENDERE Più deterministico il setting di LOGO e info business. Che però vengono richieste solo se necessarie.

### Fase 2: Generazione Multimodale (`generateProjectWithAI`)
È il cuore creativo del sistema.
- **Input Testuale**: Elabora il `USER INPUT` dinamico (anno, nome attività, tono di voce, obiettivi, sequenza blocchi raccomandata).
- **Input Visuale**: Se presenti, analizza Logo e Screenshot caricati dall'utente (inviati come Base64) per estrarre palette colori (hex) e categoria tipografica.
#### NOTA DEV: obiettivi devono essere usati per decidere COSA METTERE NELLA CTA. Da abilitare anche nel MAIN NAV (in modo deterministico dato che viene aggiunta dopo).
#### NOTA DEV: siamo sicuri riesca ad estrarre la palette colori? e come viene assegnata? A sistema abbiamo COLORE SFONDO, COLORE TESTO, COLORE SFONDO e TESTO BOTTONE PRIMARIO e COLORE SFONDO e TESTO BOTTONE SECONDARIO.
#### NOTA DEV: riesce ad estrarre FONT? non vorrei passare una lista di TUTTI i font disponibili, ma se possibile dare istruzione di usare un font di quelli presi da Google Fonts (credo usiamo quelli come possibili, da verificare). 
#### NOTA DEV: se non presente immagine di riferimento, FONT e COLORI vengono letti o dal LOGO se presente oppure stimati sulla base della categoria business se presenti, se non c'è nulla allora si prenderà il Default successivamente (deterministico)
#### NOTA DEV: il FORM è da far meglio, sia per i campi DESCRIZIONE che devono avere lunghezza max sensata (tutti i campi di input, occhio a sicurezza) e rimanere visibili quando utente detta molte istruzioni. Il setting dello stile deve essere migliorato (se utente vuole dare sua palette? come si può fare?)

## 3. Logica di Post-Processing (Determinismo)
Dopo la risposta dell'IA, il server applica regole deterministiche per garantire la correttezza tecnica:
1. **Contrasto Colori**: `primaryCTABG = themeText`, `primaryCTAText = themeBG` (regola inversione). `secondaryColor = darkenColor(themeText, 30)`.
2. **Identità Navigazione**: Genera automaticamente la `navigation` e il `footer` basandosi sulla struttura delle pagine generate — logo, link, social, copyright sono completamente forzati.
3. **Gestione Anchor**: Mappa automaticamente i link del menu agli ID dei blocchi generati (slug deterministico da titolo).
4. **Leggibilità Hero**: Forza overlay scuri (opacity 65%, color #000000) e `textColor = themeBG` su ogni hero con `backgroundImage`.
5. **Font fallback**: Se l'AI non produce `fontFamily` → fallback a `Outfit`.
6. **Favicon**: = logoUrl se presente.
#### NOTA DEV: da aggiungere CTA nel main nav come default. L'opacity forzata dovrebbe valere per tutti i blocchi con background immagine (nel caso IA metta altri blocchi con immagine di sfondo.)
#### Se utente ha impostato COLORI e TIPOGRAFIA -> questi SOSTITUISCONO ciò che rileva l'IA.

**Campi che l'AI genera ma vengono interamente scartati dal post-processing:**

| Campo AI | Sostituito da | Note |
|---|---|---|
| `navigation.links` | Link deterministici a tutte le pagine | AI spreca token costruendo link |
| `navigation.logoType/Image`, `showContact` | Forzati da logo utente / sempre `true` | — |
| `footer.links`, `footer.socialLinks` | Link e social da `finalBusinessDetails` | — |
| `footer.logoType/Image/Text`, `footer.copyright` | Forzati deterministicamente | — |
| `favicon` | = logoUrl o omesso | — |
| `secondaryColor` (output AI) | `darkenColor(themeText, 30)` | Il valore AI non viene mai letto |
| `page.id` | UUID rigenerati server-side | AI produce UUID fake inutilmente |

Questi campi andrebbero rimossi dallo schema nel prompt o marcati come `// leave empty — auto-generated` per evitare che il modello sprechi attenzione a generarli (vedi criticità in `full_prompts.md`). 
#### NOTA DEV: tutto ok ma secondary color credo sia uno dei vari colori che o vengono settati da IA o in modo deterministico da utente come tutti gli altri colori, credo debba restare

## 4. Crediti e Sicurezza
- **Rate Limiting**: Il sistema controlla i crediti residui dell'utente nel profilo Supabase prima di ogni chiamata.
- **Filtro Immagini**: Valida che gli URL delle immagini provengano esclusivamente da domini autorizzati (Supabase Storage).
- **Controllo JSON**: Include un meccanismo di retry automatico in caso l'IA restituisca JSON malformati.
#### NOTA DEV: ok ma filtro immagini intendi per il LOGO e lo STILE DI RIFERIMENTO? Il retry ha un numero max di volte? non deve succedere di avere LOOP che spende troppi soldi, direi max 2 retries.

---

## 5. Analisi: Interventi Deterministici Proposti

### A. Sistema Colori — Analisi Completa e Proposta

#### Flusso attuale (com'è)

**Input dal form (AIGeneratorModal):**
| Label UI | State variable | Passato come | Semantica intesa dall'utente |
|---|---|---|---|
| "Sfondo" | `secondaryColor` | `data.secondaryColor` | Colore sfondo del sito |
| "Testo" | `textColor` | `data.textColor` | Colore testo del sito |
| — (non esposto in UI) | `primaryColor` | `data.primaryColor` | Colore brand/accento |

**Cosa viene iniettato nel prompt AI:**
- `data.primaryColor` → `"Primary Color: {hex} — use for all primary/accent elements"`
- `data.secondaryColor` → `"Secondary/Background Color: {hex}"`
- `data.textColor` → non viene iniettato nel prompt (usato solo nel post-processing)

**Post-processing:**
```
themeBG   = data.secondaryColor  ||  aiOutput.settings.themeColors.{light|dark}.bg  ||  '#ffffff'
themeText = data.textColor       ||  aiOutput.settings.themeColors.{light|dark}.text ||  '#000000'

primaryCTABG  = themeText           ← INVERSIONE: il bg del bottone = il colore testo
primaryCTAText = themeBG

settings.primaryColor   = primaryCTABG   = themeText
settings.secondaryColor = darkenColor(themeText, 30)
```

**Risultato:** `data.primaryColor` (il brand color) viene passato all'AI come suggerimento ma il post-processing lo ignora completamente. Il `settings.primaryColor` finale è sempre `themeText`, non il brand color dell'utente.

#### Problemi identificati

1. **`themeColors.light.bg/text` non sono nello schema del prompt.** Il post-processing li legge da `aiOutput.settings.themeColors`, ma il prompt schema documenta solo `primaryColor`, `secondaryColor`, `appearance`. L'AI genera `themeColors` per inferenza — a volte sì, a volte no. Quando non li genera, il sistema cade sui fallback `#ffffff`/`#000000` ignorando screenshot e business type.

2. **Il brand color (`primaryColor`) non sopravvive al post-processing.** Viene passato all'AI come hint visivo, ma il valore che l'AI restituisce come `primaryColor` non viene mai usato nella pipeline. Viene invece letto `themeText` (un colore derivato).

3. **Il `data.textColor` non viene iniettato nel prompt.** L'utente può impostarlo nel form, viene usato in post-processing come `themeText`, ma l'AI non sa che esiste — quindi non lo usa per coerenza visiva durante la generazione del contenuto.

4. **Naming `secondaryColor` = colore sfondo.** In UI si chiama "Sfondo", in codice `secondaryColor`, nel prompt "Secondary/Background Color". Tre nomi diversi per la stessa cosa — confonde chi legge il codice e chi legge il prompt.

5. **Flusso inteso dall'utente non implementato.** Il flusso desiderato è: colori manuali (se impostati) > estrazione da screenshot > generazione da business type. Ma l'estrazione da screenshot dipende da `themeColors` che l'AI genera solo per inferenza, e i colori manuali (`primaryColor`) vengono ignorati nel post-processing.

#### Flusso proposto (come dovrebbe essere)

**Rinominare i campi per chiarezza:**

| Concetto | Nome attuale nel codice | Nome proposto |
|---|---|---|
| Colore sfondo del tema | `secondaryColor` (input) | `bgColor` |
| Colore testo del tema | `textColor` | `textColor` (ok) |
| Colore brand/accento | `primaryColor` (ignorato) | `accentColor` |

**Schema AI da aggiungere al prompt (mancante):**
```json
"themeColors": {
  "light": { "bg": "#hex", "text": "#hex" },
  "dark":  { "bg": "#hex", "text": "#hex" }
}
```
Questi sono i campi che il post-processing legge ma che non sono mai stati documentati nel prompt — l'AI li deve generare esplicitamente, non per inferenza.

**Post-processing proposto:**
```
themeBG   = data.bgColor    || aiOutput.settings.themeColors.{mode}.bg   || default
themeText = data.textColor  || aiOutput.settings.themeColors.{mode}.text || default
accentBG  = data.accentColor || aiOutput.settings.accentColor             || themeText (fallback attuale)

settings.primaryColor   = accentBG
settings.secondaryColor = darkenColor(accentBG, 30)
buttonText              = getContrastColor(accentBG)  ← usare la funzione già disponibile
```

**Nota sul `getContrastColor`:** la funzione esiste già in `ai-generator.ts` ma non viene usata nel post-processing dei colori bottone. Il testo bottone viene impostato come `themeBG` (inversione hardcoded), ma `getContrastColor(accentBG)` sarebbe più corretto e funzionerebbe anche su accent color non estremi.

**I colori utente non vanno iniettati nel prompt AI.** Se l'utente ha impostato i colori, il post-processing li sovrascriverà comunque sull'output AI — mandarli all'AI è rumore inutile. L'AI genera i colori liberamente (da screenshot o business type), poi il post-processing decide se usarli o ignorarli in base agli input utente. L'unica eccezione è `appearance` (light/dark), che può influenzare scelte di contenuto dell'AI come la selezione delle immagini hero.

**Nel prompt resta solo `fontFamily`** (se impostato dall'utente), perché è l'unica preferenza che il post-processing non può calcolare deterministicamente. Tutto il resto — colori, appearance — va gestito solo in post-processing: AI genera liberamente, poi il codice sovrascrive con i valori utente se presenti.

#### NOTE DEV: quindi ricapitolando nel form utente può mettere TRE COLORI, SFONDO, TESTO e ACCENTO (SFONDO BOTTONI). La get contrast imposta il colore del testo dei bottoni, sempre (spero che faccia qualcosa di sensato). Questi 3 NON vengono passati ad IA, semplicemente possiamo fare che viene aggiunto al PROMPT l'indicazione di generare i COLORI solo se l'utente non li ha impostati manualmente. Nel post processing in ogni caso si va a verificare e settare i colori in modo deterministico se l'utente li ha impostati. I colori del bottone secondario e testo seguono il primario di default.
#### DOMANDA DEV: il font perché deve essere passato all'AI? non chiaro, se l'utente lo imposta in modo deterministico può essere aggiunto post processing. Farei come per i colori: pezzo del prompt sul font viene aggiunto solo se utente non lo ha impostato a mano e viene estratto o da screenshot o da logo o da categoria business se fattibile tra quelli di Google (senza dare tutta la lista in prompt)
#### DOMANDA DEV: IA può anche scegliere un colore SFONDO e TESTO per un singolo blocco? in caso va bene, manteniamolo attiva come possibilità

---

### B. Nota critica: semantica di `primaryColor` nel JSON finale

Esiste un'ambiguità nella pipeline: l'utente inserisce una `primaryColor` nel form → viene passata all'AI come suggerimento visivo nel prompt. Ma il post-processing poi sovrascrive `settings.primaryColor` con `themeText` (il colore del testo del tema, usato come sfondo bottone nella regola di inversione). Il brand color dell'utente finisce in `themeColors.light.bg` o `themeColors.dark.bg`. Il campo `primaryColor` nel JSON finale ha quindi semantica diversa da quello inserito nel form — fonte di confusione in debugù

#### NOTA DEV: credo venga risolta con gli interventi al punto prima

### B. Pre-AI: calcolare prima di chiamare il modello

Questi parametri sono già noti a partire dagli input del form e potrebbero essere calcolati deterministicamente in `ai-generator.ts`, poi iniettati come `USER STYLE OVERRIDES` fissi — così il modello li riceve come vincolo e non tenta di reinventarli.

| Parametro | Logica proposta | Motivazione |
|---|---|---|
| `buttonRadius` | tone: `creativo`→22px, `amichevole`→14px, `professionale`→6px, `formale`→3px | L'AI lo interpreta in modo inconsistente rispetto al tono |
| `buttonShadow` | appearance dark→`"none"` / light+formale→`"none"` / light+altri→`"M"` | Output AI spesso arbitrario su questo campo |
| `appearance` | Se utente seleziona `auto`, forza `"light"` come default invece di lasciare decidere all'AI | Evita sorprese su siti che escono scuri inaspettatamente |

#### NOTA DEV: il radius va benissimo come lo hai descritto, idem shadow. Anche animazione possiamo fare la stessa cosa, mettiamo deterministico. Non capisco la questione APPEARANCE: di cosa si tratta? non c'entra col tema credo ma con colori SFONDO e TEXT in tal caso credo che sia da impostare deterministicamente a posteriori a seconda che sia piu scuro lo SFONDO o il TESTO, fammi sapere se è OK come regola (impostiamo anche l'inverso per l'altra modalità). Ciò viene fatto DOPO che sono stati decisi i COLORI in modo deterministico 

### C. Post-AI: aggiungere al pipeline di post-processing

| Parametro | Logica proposta | File | Priorità |
|---|---|---|---|
| **`fontFamily` validation** | Dopo risposta AI, verificare che il valore sia nella lista dei 47 font disponibili. Se non lo è → fallback basato su `tone`: professionale→`Montserrat`, amichevole→`Poppins`, creativo→`Syne`, formale→`Lora` | `ai-generator.ts` | 🔴 Alta |
| **`patternColor` e `patternOpacity` per-blocco** | Per ogni blocco con `patternType != 'none'`: sfondo scuro→`patternColor='#ffffff'`, opacity=8 / sfondo chiaro→`patternColor=primaryColor`, opacity=7. Regola semplice, l'AI la sbaglia frequentemente | `ai-generator.ts` | 🟡 Media |
| **`favicon`** | Già parzialmente gestito; rimuovere dall'output AI (spreca token) e impostare sempre = logoUrl se presente, altrimenti omettere | `ai-generator.ts` | 🟢 Bassa |
| **`secondaryColor` (calcolo)** | Il `darkenColor` attuale sottrae RGB fisso (30 unità) — calcolo grezzo. Sostituire con variazione di luminosità relativa (HSL) per coerenza su colori chiari vs scuri | `ai-generator.ts` | 🟢 Bassa |

#### NOTE DEV: son d'accordo sulle fall back per fontFamily. Mentre il PATTERN COLOR e OPACITY li mettiamo deterministicamente ma usiamo il colore del TESTO impostato da utente o scelto da IA. Il fatto se usare o meno i pattern sempre a discrezione di AI

### D. Font matching da screenshot — limite strutturale

Il sistema invia gli screenshot in Base64 al modello multimodale chiedendo di estrarne tipografia. I colori funzionano bene. Il font no: il modello non conosce la lista dei 47 font disponibili e può restituire `"Helvetica Neue"` o `"Gill Sans"` — font non caricati — che il sistema accetta silenziosamente, cadendo sul fallback `Outfit`.

Il modello è capace di identificare la **categoria** del font (serif/sans-serif/display/handwriting) da screenshot. Il **font specifico** è inaffidabile anche per esperti umani. La soluzione è fornire la lista al modello nel prompt (vedi `full_prompts.md`) e aggiungere qui la validazione post-AI descritta al punto C.

#### NOTA DEV: NO qui se possibile direi di scegliere il font più simile tra quelli di GOOGLE (o quelli che diamo noi come disponibili, credo li prendiamo da Google Fonts). Se pensi non sia fattibile facciamo estrarre la famiglia e/o altre caratteristiche fattibili e piazziamo noi il font deterministicamente a posteriori sulla base di ciò che ha visto l'AI