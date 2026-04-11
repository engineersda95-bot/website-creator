# Performance — Analisi e Ottimizzazioni

> Report di analisi delle performance del progetto: database, autenticazione, rendering React, generazione AI e deploy. Ogni issue include file impattati, descrizione del problema e fix suggerito.
>
> Legenda stato: ✅ Risolto · ⚠️ Già ok · 🔴 Da fare · 🟡 Opzionale

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

### 1.1 — `getUserLimits()` chiamata più volte per request (N+1 RPC) ✅

**Priorità: ALTA** → **RISOLTO**

`getUserLimits()` in [`lib/permissions.ts`](../lib/permissions.ts) è ora wrappata con `React.cache()`. Più chiamate nella stessa request (`canCreatePage`, `canUseAI`, `canCreateProject`) riciclano il risultato già fetchato senza ulteriori query al DB.

**Fix applicato:**
```typescript
import { cache } from 'react';
export const getUserLimits = cache(async (userId: string): Promise<UserLimits | null> => {
  // ...
});
```

---

### 1.2 — `select('*')` su tutte le query 🟡

**Priorità: MEDIA** (invariata)

Tutte le query Supabase usano `select('*')`, caricando colonne pesanti come `blocks` (JSON grande) anche quando non servono — ad esempio nella lista progetti dove servono solo `id`, `name`, `created_at`, `last_published_at`.

File impattati:
- [`app/editor/page.tsx`](../app/editor/page.tsx) — riga 13
- [`app/editor/[projectId]/page.tsx`](../app/editor/[projectId]/page.tsx) — righe 17–29
- [`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx) — righe 17–29
- [`app/actions/deploy.ts`](../app/actions/deploy.ts) — righe 29–52
- [`app/actions/pages.ts`](../app/actions/pages.ts) — righe 26–31, 90–95, 141–146

**Fix suggerito:** Selezionare solo le colonne necessarie per ogni contesto. Esempio per la lista progetti:
```typescript
supabase.from('projects').select('id, name, created_at, last_published_at')
```

---

### 1.3 — Query sequenziali invece di parallele 🟡

**Priorità: MEDIA** (invariata)

In [`app/editor/[projectId]/page.tsx`](../app/editor/[projectId]/page.tsx) il progetto viene verificato prima e solo dopo vengono fetchate pagine e globals. Il check di ownership può essere delegato a RLS, permettendo di parallelizzare tutte e tre le query.

**Fix suggerito:**
```typescript
const [{ data: project }, { data: pages }, { data: globals }] = await Promise.all([
  supabase.from('projects').select('*').eq('id', projectId).single(),
  supabase.from('pages').select('*').eq('project_id', projectId),
  supabase.from('globals').select('*').eq('project_id', projectId).single(),
]);
```

---

### 1.4 — Caricamento di tutte le pagine nell'editor singola pagina 🟡

**Priorità: MEDIA** (invariata)

In [`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx) vengono caricate tutte le pagine del progetto per poi filtrare quella desiderata in JavaScript.

**Fix suggerito:**
```typescript
supabase.from('pages').select('*').eq('project_id', projectId).eq('id', pageId).single()
```

---

## 2. Autenticazione

### 2.1 — `getUser()` chiamato in ogni Server Component indipendentemente 🟡

**Priorità: MEDIA** (invariata)

Ogni Server Component chiama `supabase.auth.getUser()` autonomamente. Se la stessa request renderizza più componenti, la validazione JWT avviene più volte.

**Fix suggerito:** Wrappare con `React.cache()` in un modulo condiviso:
```typescript
// lib/supabase/get-user.ts
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
```

---

### 2.2 — Middleware: iterazione di tutti i cookie ad ogni operazione 🟡

**Priorità: MEDIA** (invariata)

In [`lib/supabase/middleware.ts`](../lib/supabase/middleware.ts) le funzioni `set()` e `remove()` eseguono `request.cookies.getAll().forEach()` per ogni modifica cookie singola.

**Fix suggerito:** Sincronizzare solo il cookie specifico modificato invece dell'intera collezione.

---

## 3. React — Rendering e State

### 3.1 — `setInterval` per controllo clipboard eliminato ✅

**Priorità: MEDIA** → **RISOLTO**

Il `setInterval` da 1 secondo che causava re-render continui del canvas è stato eliminato. Al suo posto viene usato un custom event `sv_copied_block_changed` dispatched direttamente dallo store Zustand quando il blocco viene copiato.

**Fix applicato:**
- [`store/useEditorStore.ts`](../store/useEditorStore.ts): `window.dispatchEvent(new Event('sv_copied_block_changed'))` dopo ogni scrittura su localStorage
- [`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx): `window.addEventListener('sv_copied_block_changed', checkCopied)` invece del `setInterval`

Il listener `storage` rimane per la sincronizzazione cross-tab.

---

### 3.2 — Zustand: nessun selector 🟡

**Priorità: MEDIA** (invariata)

[`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) destruttura l'intero store Zustand in una singola chiamata, causando re-render ad ogni aggiornamento dello store anche su campi non usati.

**Fix suggerito:**
```typescript
const project = useEditorStore(state => state.project);
const currentPage = useEditorStore(state => state.currentPage);
const selectedBlockId = useEditorStore(state => state.selectedBlockId);
```

---

### 3.3 — `useMemo` mancante per derivazioni di tema 🟡

**Priorità: MEDIA** (invariata)

In [`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) i valori `isDark`, `themeBg`, `themeText` vengono ricalcolati ad ogni render.

**Fix suggerito:**
```typescript
const themeColors = useMemo(() => ({
  isDark: project?.settings?.appearance === 'dark',
  themeBg: project?.settings?.appearance === 'dark' ? '#18181b' : '#ffffff',
  themeText: project?.settings?.appearance === 'dark' ? '#f4f4f5' : '#18181b',
}), [project?.settings?.appearance]);
```

---

### 3.4 — Snapshot undo/redo via `JSON.parse(JSON.stringify(...))` 🟡

**Priorità: MEDIA** (invariata)

In [`store/useEditorStore.ts`](../store/useEditorStore.ts) ogni azione undoable crea uno snapshot deep-copy con serializzazione JSON. Può richiedere 50–500ms per progetti grandi.

**Fix suggerito:** Sostituire con `structuredClone()` (API nativa, più veloce) e ridurre il limite history a 20 step.

---

## 4. Generazione AI

### 4.1 — Fetch immagini sequenziale durante la generazione 🟡

**Priorità: MEDIA** (invariata)

In [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) logo e screenshot vengono convertiti in base64 in sequenza. Con 2 immagini aggiunge 2+ secondi alla generazione.

**Fix suggerito:**
```typescript
const [logoData, ...screenshotData] = await Promise.all([
  data.logoUrl ? fetchImageAsBase64(data.logoUrl) : Promise.resolve(null),
  ...(data.screenshotUrls?.map(url => fetchImageAsBase64(url)) ?? []),
]);
```

---

### 4.2 — `fetchImageAsBase64` senza timeout né limite dimensione ⚠️

**Priorità: ALTA** → **GIÀ MITIGATO**

La validazione URL con `ALLOWED_DOMAINS` è già presente. Il timeout manca ancora ma il rischio SSRF è contenuto dal whitelist domini.

File: [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — righe 185–197

**Fix residuo consigliato:** Aggiungere timeout 5s e size limit 10MB anche se il dominio è trusted.

---

### 4.3 — Loop annidati validazione anchor ⚠️

**Priorità: ALTA** → **GIÀ RISOLTO IN PRECEDENZA**

Il codice usa già una `Set` per page per la validazione degli anchor. Il problema descritto nel documento originale non è presente nella versione attuale.

---

### 4.4 — Logo replacement via `JSON.stringify` sull'intero progetto 🟡

**Priorità: MEDIA** (invariata)

In [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) la sostituzione del path del logo usa `JSON.stringify(project).replaceAll(oldPath, newPath)` con rischio di falsi positivi e spreco di memoria.

**Fix suggerito:** Traversal ricorsivo esatto (vedi doc originale).

---

## 5. Deploy

### 5.1 — Download asset sequenziale ✅

**Priorità: ALTA** → **RISOLTO**

Il `for...of` con `await` interno è stato sostituito con `Promise.all`. Tutti gli asset vengono scaricati in parallelo.

**Fix applicato in** [`app/actions/deploy.ts`](../app/actions/deploy.ts):
```typescript
await Promise.all(Array.from(assetsToDownload).map(async (assetFilename) => {
  // download singolo asset
}));
```

---

### 5.2 — Operazioni filesystem sincrone in sequenza 🟡

**Priorità: MEDIA** (invariata)

In [`app/actions/deploy.ts`](../app/actions/deploy.ts) le chiamate `fs.mkdirSync()` e `fs.writeFileSync()` bloccano il thread Node.js. Le scritture indipendenti potrebbero essere parallelizzate con `fs.promises`.

---

## 6. Caching

### 6.1 — Nessun caching a livello di request nei Server Components 🟡

**Priorità: ALTA** (parzialmente mitigata da 1.1)

`getUserLimits` ora usa `React.cache()`. Le query Supabase nei Server Components (progetto, pagine, globals) non ancora.

**Fix suggerito:**
```typescript
// lib/data/projects.ts
export const getProject = cache(async (projectId: string) => {
  const supabase = await createClient();
  return supabase.from('projects').select('*').eq('id', projectId).single();
});
```

---

## 7. Bundle e Code Splitting

### 7.1 — Nessun lazy loading per i sidebar/editor dei blocchi 🟡

**Priorità: MEDIA** (invariata)

Tutti i componenti editor specifici per tipo di blocco vengono importati staticamente nel bundle principale.

**Fix suggerito:**
```typescript
const HeroEditor = dynamic(() => import('./block-editors/HeroEditor'), { ssr: false });
```

---

### 7.2 — Modali AI e traduzione caricate sempre 🟡

**Priorità: MEDIA** (invariata)

`AIGeneratorModal` e `TranslatePageModal` sono importati staticamente.

**Fix suggerito:**
```typescript
const AIGeneratorModal = dynamic(() => import('@/components/editor/modals/AIGeneratorModal'), { ssr: false });
```

---

## 8. Tabella Riepilogativa

| ID | Titolo | File principale | Priorità | Stato | Impatto stimato |
|----|--------|-----------------|----------|-------|-----------------|
| 1.1 | N+1 RPC `getUserLimits` | `lib/permissions.ts` | **ALTA** | ✅ Risolto | 100–500ms/request |
| 1.2 | `select('*')` su tutte le query | `app/editor/*`, `app/actions/*` | MEDIA | 🟡 Opzionale | 50–200ms/request |
| 1.3 | Query sequenziali invece di parallele | `app/editor/[projectId]/page.tsx` | MEDIA | 🟡 Opzionale | 50–100ms/request |
| 1.4 | Caricamento tutte le pagine per singola | `app/editor/[projectId]/[pageId]/page.tsx` | MEDIA | 🟡 Opzionale | O(n) invece O(1) |
| 2.1 | `getUser()` non deduplicato | tutti i Server Components | MEDIA | 🟡 Opzionale | 50–100ms/request |
| 2.2 | Middleware: iterazione tutti i cookie | `lib/supabase/middleware.ts` | MEDIA | 🟡 Opzionale | overhead proporzionale |
| 3.1 | `setInterval` localStorage | `components/blocks/EditorCanvas.tsx` | MEDIA | ✅ Risolto | 60 re-render/min eliminati |
| 3.2 | Nessun selector Zustand | `components/blocks/EditorCanvas.tsx` | MEDIA | 🟡 Opzionale | re-render eccessivi |
| 3.3 | `useMemo` mancante per tema | `components/blocks/EditorCanvas.tsx` | MEDIA | 🟡 Opzionale | ricalcolo ad ogni render |
| 3.4 | `JSON.parse(JSON.stringify)` per undo | `store/useEditorStore.ts` | MEDIA | 🟡 Opzionale | 50–500ms per edit |
| 4.1 | Fetch immagini sequenziali in AI | `app/actions/ai-generator.ts` | MEDIA | 🟡 Opzionale | +2–4s generazione |
| 4.2 | `fetchImageAsBase64` senza timeout | `app/actions/ai-generator.ts` | MEDIA | ⚠️ Parziale | rischio hang su asset lenti |
| 4.3 | Loop annidati validazione anchor | `app/actions/ai-generator.ts` | **ALTA** | ⚠️ Già ok | già corretto nel codice |
| 4.4 | `JSON.stringify` per logo replace | `app/actions/ai-generator.ts` | MEDIA | 🟡 Opzionale | 100–500ms |
| 5.1 | Download asset sequenziale | `app/actions/deploy.ts` | **ALTA** | ✅ Risolto | 10×–50× tempo deploy |
| 5.2 | Filesystem sync in deploy | `app/actions/deploy.ts` | MEDIA | 🟡 Opzionale | 100–500ms |
| 6.1 | Nessun `React.cache()` | tutti i Server Components | **ALTA** | ⚠️ Parziale (solo getUserLimits) | 100–1000ms/request |
| 7.1 | No lazy loading block editors | `components/blocks/BlockSidebar.tsx` | MEDIA | 🟡 Opzionale | +200KB bundle iniziale |
| 7.2 | Modali AI/traduzione sempre caricate | `components/editor/modals/` | MEDIA | 🟡 Opzionale | bundle non necessario |

---

## 9. File di Riferimento

| File | Issues correlate |
|------|-----------------|
| [`lib/permissions.ts`](../lib/permissions.ts) | 1.1 ✅ |
| [`lib/supabase/middleware.ts`](../lib/supabase/middleware.ts) | 2.2 |
| [`app/editor/page.tsx`](../app/editor/page.tsx) | 1.2, 2.1, 6.1 |
| [`app/editor/[projectId]/page.tsx`](../app/editor/[projectId]/page.tsx) | 1.2, 1.3, 2.1, 6.1 |
| [`app/editor/[projectId]/[pageId]/page.tsx`](../app/editor/[projectId]/[pageId]/page.tsx) | 1.2, 1.4, 2.1, 6.1 |
| [`app/actions/pages.ts`](../app/actions/pages.ts) | 1.1 ✅, 1.2 |
| [`app/actions/deploy.ts`](../app/actions/deploy.ts) | 1.2, 5.1 ✅, 5.2 |
| [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) | 4.1, 4.2, 4.3 ⚠️, 4.4 |
| [`components/blocks/EditorCanvas.tsx`](../components/blocks/EditorCanvas.tsx) | 3.1 ✅, 3.2, 3.3 |
| [`components/blocks/BlockSidebar.tsx`](../components/blocks/BlockSidebar.tsx) | 7.1 |
| [`components/blocks/ConfigSidebar.tsx`](../components/blocks/ConfigSidebar.tsx) | 7.1 |
| [`components/editor/modals/`](../components/editor/modals/) | 7.2 |
| [`store/useEditorStore.ts`](../store/useEditorStore.ts) | 3.1 ✅, 3.4 |
