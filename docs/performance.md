# Performance — Analisi e Ottimizzazioni

> Report di analisi delle performance del progetto: database, autenticazione, rendering React, generazione AI e deploy. Ogni issue include file impattati, descrizione del problema e fix suggerito.

---

## Indice

1. [Database](#1-database)
2. [Autenticazione](#2-autenticazione)
3. [React — Rendering e State](#3-react--rendering-e-state)
4. [Generazione AI](#4-generazione-ai)
5. [Deploy](#5-deploy)
6. [Caching](#6-caching)
7. [Bundle e Code Splitting](#7-bundle-e-code-splitting)
8. [Tabella Riepilogativa](#8-tabella-riepilogativa)
9. [File di Riferimento](#9-file-di-riferimento)

---

## 1. Database

### 1.1 — `getUserLimits()` chiamata più volte per request (N+1 RPC)

**Priorità: ALTA**

`getUserLimits()` in [`lib/permissions.ts`](../lib/permissions.ts) esegue l'RPC `get_user_limits` sul database. Viene invocata separatamente da `canCreatePage()`, `canUseAI()`, `canCreateProject()` — ciascuna delle quali può essere chiamata nella stessa action senza condivisione del risultato.

File impattati:
- [`lib/permissions.ts`](../lib/permissions.ts) — righe 23–72 (funzioni `canCreatePage`, `canCreateProject`, `canUseAI`)
- [`app/actions/pages.ts`](../app/actions/pages.ts) — righe 35 e 87 (due chiamate a `canCreatePage`)
- [`app/actions/deploy.ts`](../app/actions/deploy.ts) — chiamate a `canUseAI` e `canCreateProject` separate

**Fix suggerito:** Usare `React.cache()` per memoizzare `getUserLimits()` per tutta la durata della request, così più chiamate nella stessa action riciclano il risultato già fetchato.

```typescript
// lib/permissions.ts
import { cache } from 'react';

export const getUserLimits = cache(async (): Promise<UserLimits | null> => {
  // ... logica esistente invariata
});
```

---

### 1.2 — `select('*')` su tutte le query

**Priorità: MEDIA**

Tutte le query Supabase usano `select('*')`, caricando colonne pesanti come `blocks` (JSON grande) anche quando non servono — ad esempio nella lista progetti dove servono solo `id`, `name`, `created_at`, `last_published_at`.

File impattati:
- [`app/editor/page.tsx`](../app/editor/page.tsx) — riga 13 (lista progetti, carica `settings` e `blocks` non necessari)
- [`app/editor/[projectId]/page.tsx`](../app/editor/[projectId]/page.tsx) — righe 17–29
- [`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx) — righe 17–29
- [`app/actions/deploy.ts`](../app/actions/deploy.ts) — righe 29–52
- [`app/actions/pages.ts`](../app/actions/pages.ts) — righe 26–31, 90–95, 141–146

**Fix suggerito:** Selezionare solo le colonne necessarie per ogni contesto. Esempio per la lista progetti:

```typescript
supabase.from('projects').select('id, name, created_at, last_published_at')
```

---

### 1.3 — Query sequenziali invece di parallele

**Priorità: MEDIA**

In [`app/editor/[projectId]/page.tsx`](../app/editor/[projectId]/page.tsx) il progetto viene verificato prima (riga 17–22) e solo dopo vengono fetchate pagine e globals (righe 26–30). Il check di ownership può essere delegato a RLS, permettendo di parallelizzare tutte e tre le query.

File impattati:
- [`app/editor/[projectId]/page.tsx`](../app/editor/[projectId]/page.tsx) — righe 17–30

**Fix suggerito:**

```typescript
const [{ data: project }, { data: pages }, { data: globals }] = await Promise.all([
  supabase.from('projects').select('*').eq('id', projectId).single(),
  supabase.from('pages').select('*').eq('project_id', projectId),
  supabase.from('globals').select('*').eq('project_id', projectId).single(),
]);
```

---

### 1.4 — Caricamento di tutte le pagine nell'editor singola pagina

**Priorità: MEDIA**

In [`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx) vengono caricate **tutte** le pagine del progetto per poi filtrare quella desiderata in JavaScript. Con progetti grandi (25+ pagine con `blocks` JSON) il trasferimento è proporzionale a `O(n)` invece di `O(1)`.

File impattati:
- [`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx) — righe 27–29

**Fix suggerito:** Filtrare direttamente per `id` nella query:

```typescript
supabase.from('pages').select('*').eq('project_id', projectId).eq('id', pageId).single()
```

---

## 2. Autenticazione

### 2.1 — `getUser()` chiamato in ogni Server Component indipendentemente

**Priorità: MEDIA**

Ogni Server Component chiama `supabase.auth.getUser()` in modo autonomo, eseguendo una validazione JWT separata anche se il rendering avviene nella stessa request.

File impattati:
- [`app/editor/page.tsx`](../app/editor/page.tsx) — riga 8
- [`app/editor/[projectId]/page.tsx`](../app/editor/[projectId]/page.tsx) — riga 12
- [`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx) — riga 12

**Fix suggerito:** Wrappare la chiamata auth con `React.cache()` per deduplicarla a livello di request:

```typescript
// lib/supabase/get-user.ts
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
```

---

### 2.2 — Middleware: iterazione di tutti i cookie ad ogni operazione

**Priorità: MEDIA**

In [`lib/supabase/middleware.ts`](../lib/supabase/middleware.ts) le funzioni `set()` e `remove()` eseguono `request.cookies.getAll().forEach()` per sincronizzare i cookie sulla response. Questo significa che modificare anche un solo cookie scatena l'iterazione dell'intera collezione di cookie.

File impattati:
- [`lib/supabase/middleware.ts`](../lib/supabase/middleware.ts) — righe 37–56

**Fix suggerito:** Sincronizzare solo il cookie specifico modificato invece dell'intera collezione, oppure differire la sincronizzazione ad un unico passaggio alla fine del middleware.

---

## 3. React — Rendering e State

### 3.1 — `setInterval` per controllo clipboard — 60 re-render al minuto

**Priorità: MEDIA**

In [`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) (righe 58–67) un `setInterval` con frequenza 1 secondo controlla `localStorage` per rilevare se è stato copiato un blocco. Questo causa un re-render del componente ogni secondo indipendentemente da qualsiasi cambiamento reale.

File impattati:
- [`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) — righe 58–67

**Fix suggerito:** Usare l'evento `storage` del browser, che si attiva solo quando `localStorage` cambia effettivamente:

```typescript
useEffect(() => {
  const check = () => setHasCopiedBlock(!!localStorage.getItem('sv_copied_block'));
  check(); // check iniziale
  window.addEventListener('storage', check);
  return () => window.removeEventListener('storage', check);
}, []);
```

---

### 3.2 — Zustand: nessun selector — re-render su qualsiasi cambio di store

**Priorità: MEDIA**

[`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) (righe 25–49) destruttura l'intero store Zustand in una singola chiamata. Il componente si ri-renderizza quindi ad ogni aggiornamento dello store, anche quando i campi che usa non sono cambiati.

File impattati:
- [`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) — righe 25–49

**Fix suggerito:** Usare selector per subscribing granulare:

```typescript
const project = useEditorStore(state => state.project);
const currentPage = useEditorStore(state => state.currentPage);
const selectedBlockId = useEditorStore(state => state.selectedBlockId);
// ... una riga per campo usato
```

---

### 3.3 — `useMemo` mancante per derivazioni di tema

**Priorità: MEDIA**

In [`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) (righe 74–81) i valori derivati dal tema (`isDark`, `themeBg`, `themeText`) vengono ricalcolati ad ogni render anche quando `project.settings` non è cambiato.

File impattati:
- [`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) — righe 74–81

**Fix suggerito:**

```typescript
const themeColors = useMemo(() => ({
  isDark: project?.settings?.appearance === 'dark',
  themeBg: project?.settings?.appearance === 'dark' ? '#18181b' : '#ffffff',
  themeText: project?.settings?.appearance === 'dark' ? '#f4f4f5' : '#18181b',
}), [project?.settings?.appearance]);
```

---

### 3.4 — Snapshot undo/redo via `JSON.parse(JSON.stringify(...))`

**Priorità: MEDIA**

In [`store/useEditorStore.ts`](../store/useEditorStore.ts) (righe 135–136) ogni azione che deve essere undoable crea uno snapshot deep-copy tramite `JSON.parse(JSON.stringify(...))`. Questa serializzazione/deserializzazione può richiedere 50–500ms per progetti grandi, e ogni snapshot occupa potenzialmente 50–100KB di memoria. Con 50 step di storia per 10 pagine, si possono raggiungere 50MB in memoria.

File impattati:
- [`store/useEditorStore.ts`](../store/useEditorStore.ts) — righe 135–136, 149 (limite storia)

**Fix suggerito:** Usare `structuredClone()` (API nativa browser, più veloce) e ridurre il limite di history a 20 step:

```typescript
const snapshot = {
  pageId: currentPage.id,
  blocks: structuredClone(currentPage.blocks),
  settings: structuredClone(project.settings),
};
```

---

## 4. Generazione AI

### 4.1 — Fetch immagini sequenziale durante la generazione

**Priorità: MEDIA**

In [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) (righe 360–375) il logo e gli screenshot vengono convertiti in base64 in sequenza con `await` separati. Con 2 immagini e 1s di latenza ciascuna, aggiunge 2+ secondi non necessari alla durata già elevata della generazione AI.

File impattati:
- [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — righe 360–375

**Fix suggerito:** Parallelizzare con `Promise.all`:

```typescript
const [logoData, ...screenshotData] = await Promise.all([
  data.logoUrl ? fetchImageAsBase64(data.logoUrl) : Promise.resolve(null),
  ...(data.screenshotUrls?.map(url => fetchImageAsBase64(url)) ?? []),
]);
```

---

### 4.2 — `fetchImageAsBase64` senza timeout né limite di dimensione

**Priorità: ALTA**

In [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) (righe 185–197) la funzione `fetchImageAsBase64` non ha timeout né controllo sulla dimensione della risposta. Un server lento può bloccare la Server Action per minuti; un'immagine da 100MB verrebbe caricata interamente in memoria prima di essere rifiutata.

File impattati:
- [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — righe 185–197

**Fix suggerito:**

```typescript
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s max

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) return null; // max 10MB

    const buffer = await response.arrayBuffer();
    // ... resto invariato
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

### 4.3 — Loop annidati per validazione anchor link — complessità quadratica

**Priorità: ALTA**

In [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) (righe 743–788) la validazione degli anchor link usa quattro loop annidati: pagine × blocchi × campi × items. Con 10 pagine, 20 blocchi, 3 campi, 5 items = 3000+ iterazioni per lookup lineare. Aggiunge 1–5 secondi alla generazione AI.

File impattati:
- [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — righe 743–788

**Fix suggerito:** Costruire una `Map` di tutti i `sectionId` in un unico passaggio, poi usarla per la validazione in O(1):

```typescript
// costruzione O(n)
const knownSectionIds = new Set(
  enrichedPages.flatMap(p => p.blocks.map(b => b.content?.sectionId).filter(Boolean))
);

// validazione O(m) invece di O(n × m)
for (const page of enrichedPages) {
  for (const block of page.blocks) {
    validateAnchors(block, knownSectionIds);
  }
}
```

---

### 4.4 — Logo replacement via `JSON.stringify` sull'intero progetto

**Priorità: MEDIA**

In [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) (righe 814–819) la sostituzione del path del logo usa `JSON.stringify(project).replaceAll(oldPath, newPath)`. Questo serializza l'intero progetto (potenzialmente 1MB+) solo per fare una sostituzione di stringa, con il rischio di sostituzioni false positive se il path appare in altri campi.

File impattati:
- [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — righe 814–819

**Fix suggerito:** Traversal ricorsivo che sostituisce solo le occorrenze esatte del valore:

```typescript
function replaceValueInObject(obj: unknown, oldVal: string, newVal: string): unknown {
  if (typeof obj === 'string') return obj === oldVal ? newVal : obj;
  if (Array.isArray(obj)) return obj.map(v => replaceValueInObject(v, oldVal, newVal));
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, replaceValueInObject(v, oldVal, newVal)])
    );
  }
  return obj;
}
```

---

## 5. Deploy

### 5.1 — Download asset sequenziale

**Priorità: ALTA**

In [`app/actions/deploy.ts`](../app/actions/deploy.ts) (righe 128–147) gli asset vengono scaricati uno alla volta con un `for...of` con `await` interno. Con 10 asset da 100ms ciascuno, il deploy impiega 1 secondo solo per i download invece dei 100ms del parallelo.

File impattati:
- [`app/actions/deploy.ts`](../app/actions/deploy.ts) — righe 128–147

**Fix suggerito:**

```typescript
await Promise.all(
  Array.from(assetsToDownload).map(filename => downloadAndSaveAsset(filename, tempDir))
);
```

---

### 5.2 — Operazioni filesystem sincrone in sequenza

**Priorità: MEDIA**

In [`app/actions/deploy.ts`](../app/actions/deploy.ts) più chiamate a `fs.mkdirSync()` e `fs.writeFileSync()` bloccano il thread Node.js in sequenza. Le API async (`fs.promises`) permetterebbero di usare `Promise.all()` per scritture indipendenti.

File impattati:
- [`app/actions/deploy.ts`](../app/actions/deploy.ts) — righe 73, 107, 121–123, 143

**Fix suggerito:** Sostituire le varianti sync con `fs.promises.mkdir` e `fs.promises.writeFile`, parallelizzando le scritture indipendenti.

---

## 6. Caching

### 6.1 — Nessun caching a livello di request nei Server Components

**Priorità: ALTA**

Nessun Server Component usa `React.cache()` per memoizzare le query Supabase. Se lo stesso dato viene richiesto in più punti della stessa request (es. `project` letto sia nel layout che nel componente figlio) vengono eseguite più query identiche.

File impattati:
- [`app/editor/page.tsx`](../app/editor/page.tsx)
- [`app/editor/[projectId]/page.tsx`](../app/editor/[projectId]/page.tsx)
- [`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx)

**Fix suggerito:** Wrappare le funzioni di fetch con `cache()`:

```typescript
// lib/data/projects.ts
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const getProject = cache(async (projectId: string) => {
  const supabase = await createClient();
  return supabase.from('projects').select('*').eq('id', projectId).single();
});
```

---

## 7. Bundle e Code Splitting

### 7.1 — Nessun lazy loading per i sidebar/editor dei blocchi

**Priorità: MEDIA**

Tutti i componenti editor specifici per tipo di blocco (Hero, Promo, Gallery, ecc.) in [`components/blocks/`](../components/blocks/) vengono importati staticamente nel bundle principale. Vengono caricati al primo accesso all'editor anche se l'utente non apre mai la sidebar di configurazione.

File impattati:
- [`components/blocks/BlockSidebar.tsx`](../components/blocks/BlockSidebar.tsx)
- [`components/blocks/ConfigSidebar.tsx`](../components/blocks/ConfigSidebar.tsx)

**Fix suggerito:** Usare `React.lazy()` + `Suspense` (o `next/dynamic`) per i componenti editor pesanti:

```typescript
const HeroEditor = dynamic(() => import('./block-editors/HeroEditor'), { ssr: false });
const GalleryEditor = dynamic(() => import('./block-editors/GalleryEditor'), { ssr: false });
```

---

### 7.2 — Modali AI e traduzione caricate sempre

**Priorità: MEDIA**

`AIGeneratorModal` e `TranslatePageModal` sono importati staticamente anche se non vengono mai aperti dalla maggior parte degli utenti nella sessione corrente.

File impattati:
- I componenti modali in [`components/editor/modals/`](../components/editor/modals/) (tutti i file)

**Fix suggerito:** Importare con `next/dynamic`:

```typescript
const AIGeneratorModal = dynamic(() => import('@/components/editor/modals/AIGeneratorModal'), {
  ssr: false,
});
```

---

## 8. Tabella Riepilogativa

| ID | Titolo | File principale | Priorità | Impatto stimato |
|----|--------|-----------------|----------|-----------------|
| 1.1 | N+1 RPC `getUserLimits` | `lib/permissions.ts` | **ALTA** | 100–500ms/request |
| 1.2 | `select('*')` su tutte le query | `app/editor/*`, `app/actions/*` | MEDIA | 50–200ms/request |
| 1.3 | Query sequenziali invece di parallele | `app/editor/[projectId]/page.tsx` | MEDIA | 50–100ms/request |
| 1.4 | Caricamento tutte le pagine per singola | `app/editor/[projectId]/[pageId]/page.tsx` | MEDIA | O(n) invece O(1) |
| 2.1 | `getUser()` non deduplicato | tutti i Server Components | MEDIA | 50–100ms/request |
| 2.2 | Middleware: iterazione tutti i cookie | `lib/supabase/middleware.ts` | MEDIA | overhead proporzionale |
| 3.1 | `setInterval` localStorage | `components/blocks/EditorCanvas.tsx` | MEDIA | 60 re-render/min |
| 3.2 | Nessun selector Zustand | `components/blocks/EditorCanvas.tsx` | MEDIA | re-render eccessivi |
| 3.3 | `useMemo` mancante per tema | `components/blocks/EditorCanvas.tsx` | MEDIA | ricalcolo ad ogni render |
| 3.4 | `JSON.parse(JSON.stringify)` per undo | `store/useEditorStore.ts` | MEDIA | 50–500ms per edit |
| 4.1 | Fetch immagini sequenziali in AI | `app/actions/ai-generator.ts` | MEDIA | +2–4s generazione |
| 4.2 | `fetchImageAsBase64` senza timeout | `app/actions/ai-generator.ts` | **ALTA** | hang indefinito, OOM |
| 4.3 | Loop annidati validazione anchor | `app/actions/ai-generator.ts` | **ALTA** | +1–5s generazione |
| 4.4 | `JSON.stringify` per logo replace | `app/actions/ai-generator.ts` | MEDIA | 100–500ms |
| 5.1 | Download asset sequenziale | `app/actions/deploy.ts` | **ALTA** | 10×–50× tempo deploy |
| 5.2 | Filesystem sync in deploy | `app/actions/deploy.ts` | MEDIA | 100–500ms |
| 6.1 | Nessun `React.cache()` | tutti i Server Components | **ALTA** | 100–1000ms/request |
| 7.1 | No lazy loading block editors | `components/blocks/BlockSidebar.tsx` | MEDIA | +200KB bundle iniziale |
| 7.2 | Modali AI/traduzione sempre caricate | `components/editor/modals/` | MEDIA | bundle non necessario |

---

## 9. File di Riferimento

| File | Issues correlate |
|------|-----------------|
| [`lib/permissions.ts`](../lib/permissions.ts) | 1.1 |
| [`lib/supabase/middleware.ts`](../lib/supabase/middleware.ts) | 2.2 |
| [`app/editor/page.tsx`](../app/editor/page.tsx) | 1.2, 2.1, 6.1 |
| [`app/editor/[projectId]/page.tsx`](../app/editor/[projectId]/page.tsx) | 1.2, 1.3, 2.1, 6.1 |
| [`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx) | 1.2, 1.4, 2.1, 6.1 |
| [`app/actions/pages.ts`](../app/actions/pages.ts) | 1.1, 1.2 |
| [`app/actions/deploy.ts`](../app/actions/deploy.ts) | 1.2, 5.1, 5.2 |
| [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) | 4.1, 4.2, 4.3, 4.4 |
| [`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) | 3.1, 3.2, 3.3 |
| [`components/blocks/BlockSidebar.tsx`](../components/blocks/BlockSidebar.tsx) | 7.1 |
| [`components/blocks/ConfigSidebar.tsx`](../components/blocks/ConfigSidebar.tsx) | 7.1 |
| [`components/editor/modals/`](../components/editor/modals/) | 7.2 |
| [`store/useEditorStore.ts`](../store/useEditorStore.ts) | 3.4 |
