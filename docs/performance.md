# Performance — Analisi e Ottimizzazioni

> Legenda: ✅ Risolto · ⚠️ Già ok / non è un problema reale · 🔴 Da fare · 🟡 Opzionale / basso impatto

---

## Risolti

### `getUserLimits()` N+1 RPC ✅
[`lib/permissions.ts`](../lib/permissions.ts) — `getUserLimits` wrappata con `React.cache()`. Più chiamate nella stessa request (`canCreatePage`, `canUseAI`, `canCreateProject`) riciclano il risultato senza query extra.

### Download asset deploy sequenziale ✅
[`app/actions/deploy.ts`](../app/actions/deploy.ts) — `for...of await` sostituito con `Promise.all`. Tutti gli asset scaricati in parallelo.

### `setInterval` localStorage ✅
[`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) + [`store/useEditorStore.ts`](../store/useEditorStore.ts) — Polling ogni secondo eliminato. Sostituito con custom event `sv_copied_block_changed` dispatched dallo store al momento della copia. Il listener `storage` rimane per sincronizzazione cross-tab.

### Caricamento tutte le pagine per editor singola pagina ✅
[`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx) — La pagina corrente viene fetchata direttamente per `id`. Le altre pagine vengono caricate come stub leggeri (`id, slug, title, language, translations_group_id`) senza blocchi. I blocchi delle altre pagine non servono nell'editor singola pagina.

---

## Da fare

### Zustand senza selector in EditorCanvas 🔴
[`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx)

Il componente destruttura l'intero store in una chiamata sola. Si ri-renderizza ad ogni cambiamento di store anche se i campi che usa non sono cambiati — ad esempio aprire la sidebar o cambiare stato di upload causa un re-render del canvas.

**Fix:** selector granulari per ogni campo usato:
```typescript
const project = useEditorStore(s => s.project);
const currentPage = useEditorStore(s => s.currentPage);
const selectedBlockId = useEditorStore(s => s.selectedBlockId);
// ...
```
Complessità media — bisogna identificare tutti i campi usati e verificare che la reattività non si rompa.

---

## Opzionali / basso impatto

### `select('*')` sulle query lista progetti 🟡
[`app/editor/page.tsx`](../app/editor/page.tsx) — La lista progetti carica `blocks` e `settings` JSON che non servono nella lista. Impatto limitato finché i progetti sono pochi.
```typescript
supabase.from('projects').select('id, name, created_at, last_published_at, live_url, subdomain')
```

### Fetch immagini sequenziali in AI 🟡
[`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — Logo e screenshot convertiti in base64 in sequenza. Con 2 immagini aggiunge ~2s alla generazione.
```typescript
const [logoData, ...screenshotData] = await Promise.all([
  data.logoUrl ? fetchImageAsBase64(data.logoUrl) : Promise.resolve(null),
  ...(data.screenshotUrls?.map(url => fetchImageAsBase64(url)) ?? []),
]);
```

### `fetchImageAsBase64` senza timeout 🟡
[`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — Nessun timeout sulla fetch. Se Supabase Storage risponde lento, la generazione si blocca. Il rischio SSRF è già mitigato dal whitelist `ALLOWED_DOMAINS`. Aggiungere timeout 5s e size limit 10MB è comunque consigliato.

### Logo replacement via `JSON.stringify` 🟡
[`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — Serializza l'intero progetto solo per fare una `replaceAll` sul path del logo. Rischio falsi positivi se il path appare in altri campi. Fix: traversal ricorsivo che sostituisce solo i valori esatti.

### `JSON.parse(JSON.stringify)` per undo/redo 🟡
[`store/useEditorStore.ts`](../store/useEditorStore.ts) — Deep copy tramite serializzazione JSON ad ogni azione undoable. `structuredClone()` è più veloce. Si nota solo su progetti con molti blocchi grandi.

---

## Non sono problemi reali

### `getUser()` in ogni Server Component ⚠️
Ogni route è una request HTTP separata — non c'è mai un albero di render condiviso tra route diverse. `React.cache` dura solo per una singola request. Ogni route chiama `getUser()` una volta sola. Non c'è duplicazione.

### Middleware: iterazione di tutti i cookie ⚠️
È il boilerplate ufficiale Supabase SSR. Iterare tutti i cookie è necessario per sincronizzare correttamente la session su ogni response. Non modificare.

### `React.cache()` sulle query nei Server Components ⚠️
Stessa ragione del punto `getUser()` — route diverse non condividono la request. L'unico caso reale di duplicazione era `getUserLimits`, già risolto. Non c'è altro da cachare.

### Loop annidati validazione anchor ⚠️
Il codice usa già una `Set` per pagina per la validazione. Il problema descritto nel documento originale non esiste nella versione attuale.

### Operazioni filesystem sincrone nel deploy ⚠️
Il deploy già esegue `execSync` (wrangler) che blocca il thread per 10–60 secondi. Le `writeFileSync` aggiungono millisecondi trascurabili rispetto a quello.

### `useMemo` per derivazioni di tema ⚠️
Ricalcola 3 stringhe da un booleano ad ogni render. Costo computazionale trascurabile — non vale la complessità aggiunta.

### Lazy loading block editors / modali ⚠️
Valutare solo se il bundle size diventa un problema misurato. Non farlo in anticipo.

---

## Tabella riepilogativa

| Issue | File | Stato |
|-------|------|-------|
| N+1 RPC `getUserLimits` | `lib/permissions.ts` | ✅ Risolto |
| Download asset deploy | `app/actions/deploy.ts` | ✅ Risolto |
| `setInterval` localStorage | `EditorCanvas.tsx`, `useEditorStore.ts` | ✅ Risolto |
| Fetch pagina corrente per id | `app/editor/[projectId]/[pageId]/page.tsx` | ✅ Risolto |
| Zustand senza selector | `EditorCanvas.tsx` | 🔴 Da fare |
| `select('*')` lista progetti | `app/editor/page.tsx` | 🟡 Opzionale |
| Fetch immagini AI sequenziali | `app/actions/ai-generator.ts` | 🟡 Opzionale |
| Timeout `fetchImageAsBase64` | `app/actions/ai-generator.ts` | 🟡 Opzionale |
| Logo replace via `JSON.stringify` | `app/actions/ai-generator.ts` | 🟡 Opzionale |
| `JSON.parse` per undo | `store/useEditorStore.ts` | 🟡 Opzionale |
