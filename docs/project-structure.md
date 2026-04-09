# Struttura del Progetto — Riferimento Tecnico

> Documento di riferimento per orientarsi nella codebase, capire dove posizionare i file e quali regole seguire.

---

## Indice

1. [Panoramica Cartelle](#1-panoramica-cartelle)
2. [app/ — Routing e Server](#2-app--routing-e-server)
3. [components/blocks/](#3-componentsblocks)
4. [components/editor/](#4-componentseditor)
5. [components/shared/](#5-componentsshared)
6. [lib/](#6-lib)
7. [store/](#7-store)
8. [types/](#8-types)
9. [hooks/](#9-hooks)
10. [supabase/](#10-supabase)
11. [Regole d'Oro](#11-regole-doro)
12. [File di Riferimento per Argomento](#12-file-di-riferimento-per-argomento)

---

## 1. Panoramica Cartelle

```
website-creator/
├── app/                          → Next.js App Router (pagine, layout, server actions, API)
│   ├── actions/                  → Server Actions (deploy, pagine, progetti, AI)
│   ├── api/                      → Route handlers API (es. og image)
│   ├── editor/                   → UI editor (lista progetti, dashboard, editor pagina)
│   ├── blog/                     → Blog pubblico
│   └── login/                    → Autenticazione
│
├── components/
│   ├── blocks/                   → Sistema blocchi (visual + sidebar)
│   │   ├── visual/               → Componenti visuali dei blocchi (NO use client)
│   │   ├── sidebar/              → Editor sidebar per ogni blocco
│   │   │   ├── block-editors/    → Editor specifici per blocco (unified)
│   │   │   ├── managers/         → Manager condivisi (ColorManager, LayoutFields, ecc.)
│   │   │   ├── ui/               → Componenti UI base (SimpleInput, SimpleSlider, ecc.)
│   │   │   └── settings/         → Sezioni impostazioni progetto (tema, SEO, lingue, ecc.)
│   │   ├── BlockRegistry.tsx     → Rendering dinamico del blocco corretto dato il tipo
│   │   ├── BlockSidebar.tsx      → Sidebar destra dell'editor (routing verso l'editor del blocco)
│   │   ├── ConfigSidebar.tsx     → Sidebar sinistra (aggiunta blocchi, impostazioni progetto)
│   │   └── EditorCanvas.tsx      → Canvas centrale dell'editor
│   │
│   ├── editor/                   → Componenti UI dell'editor (non legati a un blocco)
│   │   ├── cards/                → Card per progetti e pagine
│   │   └── modals/               → Modali (AI generator, SEO, traduzione pagine, traduzione articoli blog)
│   │
│   ├── shared/                   → Componenti globali riusabili (editor + visual + build statica)
│   ├── auth/                     → Componenti autenticazione
│   └── landing/                  → Componenti pagina marketing
│
├── lib/                          → Utility, logica core, motori
│   ├── ai/                       → Prompt AI e integrazione Unsplash
│   ├── hooks/                    → Hook condivisi (useBlockStyles)
│   └── supabase/                 → Client Supabase (server, middleware)
│
├── store/                        → Stato globale editor (Zustand)
├── types/                        → Tipi TypeScript globali
├── hooks/                        → Hook Next.js / globali (es. shortcut editor)
├── supabase/                     → Migration SQL e funzioni Edge
├── scripts/                      → Script di migrazione one-shot
└── docs/                         → Documentazione tecnica del progetto
```

---

## 2. `app/` — Routing e Server

### `app/actions/`

Server Actions di Next.js — **nessun client bundle**, eseguono solo lato server.

| File | Responsabilità |
|---|---|
| [`deploy.ts`](../app/actions/deploy.ts) | Pipeline deploy su Cloudflare Pages (genera HTML pagine + blog, scarica asset, chiama Wrangler) |
| [`pages.ts`](../app/actions/pages.ts) | CRUD pagine: `createPage`, `updatePage`, `deletePage`, `translatePage` |
| [`projects.ts`](../app/actions/projects.ts) | CRUD progetti: creazione (con globals iniziali), aggiornamento impostazioni |
| [`ai-generator.ts`](../app/actions/ai-generator.ts) | Generazione pagine via AI + miglioramento/traduzione testi articoli blog |

### `app/editor/`

Routing editor — usa Next.js App Router con segmenti dinamici.

```
app/editor/
├── page.tsx                          → Server component: carica progetti, passa a ProjectListClient
├── ProjectListClient.tsx             → Lista progetti, creazione nuovo progetto
├── [projectId]/
│   ├── page.tsx                      → Server component: carica progetto + pagine + blog_posts
│   ├── ProjectDashboardClient.tsx    → Dashboard progetto: lista pagine per lingua, tab Blog
│   ├── [pageId]/
│   │   ├── page.tsx                  → Server component: carica pagina + globals
│   │   └── EditorClient.tsx          → Editor visuale principale
│   └── blog/
│       └── [postId]/
│           ├── page.tsx              → Server component: carica post + progetto
│           └── BlogPostEditorClient.tsx → Editor articolo: TipTap WYSIWYG, dettatura, sidebar SEO
```

> **Pattern**: i `page.tsx` sono Server Components che caricano dati da Supabase e passano tutto al Client Component (`*Client.tsx`) via props. Nessun fetch avviene nei Client Components.

### `app/blog/`

Blog pubblico di marketing di SitiVetrina (non editabile dagli utenti). Articoli hardcoded in Next.js.

```
app/blog/
├── page.tsx              → Lista articoli del blog di SitiVetrina
└── [slug]/
    └── page.tsx          → Pagina singolo articolo (con schema.org BlogPosting)
```

> **Nota**: questo NON è il blog degli utenti. È il blog di SitiVetrina stesso, usato per SEO e content marketing della piattaforma.

### `app/api/`

| File | Responsabilità |
|---|---|
| [`api/og/route.tsx`](../app/api/og/route.tsx) | Genera immagini Open Graph dinamiche per i progetti |

---

## 3. `components/blocks/`

Il cuore del sistema. Ogni blocco è composto da più file coordinati.

### `components/blocks/visual/`

Componenti che **renderizzano il blocco** sia nell'editor che nel sito pubblicato.

**Regole fondamentali**:
- **NO** `"use client"` — devono funzionare con `renderToStaticMarkup`
- **NO** hook React (`useState`, `useEffect`, `useRef`)
- Accettano sempre le stesse props standard: `block`, `project`, `viewport`, `isStatic`, `imageMemoryCache`, `onInlineEdit`
- Usano CSS variables per tutti i valori di stile (mai hardcoded)

Ogni blocco ha una coppia di file:

```
Hero.tsx                  → Componente visuale
Hero.definition.tsx       → Configurazione (defaults, styleMapper, variants, editor)
```

Per blocchi con sottocomponenti complessi, esiste una sottocartella:

```
navigation/
├── Navigation.tsx
├── Navigation.definition.ts
└── MobileMenu.tsx        → Sottocomponente specifico
```

### `components/blocks/visual/*.definition.*`

Ogni definition file esporta un oggetto `BlockDefinition` con:

| Campo | Descrizione |
|---|---|
| `type` | Chiave univoca del blocco (corrisponde a `BlockType`) |
| `label` | Nome mostrato in UI |
| `icon` | Icona Lucide |
| `visual` | Riferimento al componente visuale |
| `unifiedEditor` | Riferimento all'editor sidebar |
| `defaults` | Valori iniziali di `content` e `style` |
| `variants` | Layout alternativi con preview SVG (opzionale) |
| `styleMapper` | Funzione che converte `style` in CSS variables custom (opzionale) |

### `components/blocks/sidebar/block-editors/`

Editor sidebar specifici per ogni blocco. Un file per blocco, nome corrispondente al visual.

- Usano `"use client"`
- Struttura a sezioni accordion (`UnifiedSection`)
- Importano componenti da `SharedSidebarComponents.tsx`

### `components/blocks/sidebar/managers/`

Manager condivisi tra più blocchi — raggruppano logica di editing comune.

| File | Scopo |
|---|---|
| `ColorManager.tsx` | Colori sfondo/testo con switch gradiente |
| `BackgroundManager.tsx` | Immagine sfondo, overlay, blur, brightness |
| `PatternManager.tsx` | Pattern decorativi (dots, grid, waves, ecc.) |
| `LayoutFields.tsx` | Padding, allineamento, margini, max-width |
| `LayoutGridSlider.tsx` | Colonne responsive (desktop/tablet/mobile) |
| `BorderShadowManager.tsx` | Bordi, border-radius, ombre |
| `CTAManager.tsx` | Pulsanti (label, URL, tema, stile custom) |
| `AnimationManager.tsx` | Tipo animazione, durata, delay |
| `AnchorManager.tsx` | ID ancora per link interni |
| `SocialLinksManager.tsx` | Link social con icone |
| `LinkListManager.tsx` | Lista link generica (es. footer) |
| `ImageStyleFields.tsx` | Stile immagine (aspect ratio, object-fit, radius) |
| `AdvancedMargins.tsx` | Margini avanzati top/bottom |

### `components/blocks/sidebar/ui/`

Componenti UI "stupidi" — solo props e callback, nessuna logica di stato interna.

| File | Scopo |
|---|---|
| `UnifiedSection.tsx` | Sezione accordion + `useUnifiedSections()` hook + `CategoryHeader` + `ManagerWrapper` |
| `SimpleInput.tsx` | Campo testo con label e icona opzionale |
| `SimpleSlider.tsx` | Slider numerico con label e valore |
| `RichTextarea.tsx` | Editor rich text TipTap con toolbar |
| `TypographyFields.tsx` | Font size, bold, italic, tag selector |
| `SectionHeader.tsx` | Header interno di una sezione sidebar |
| `IconManager.tsx` | Selettore icone Lucide |
| `FontManager.tsx` | Selettore font Google |
| `RichEditor.tsx` | Variante rich editor per contenuti avanzati |

> **Entry point**: tutti i manager e componenti UI sono ri-esportati da [`SharedSidebarComponents.tsx`](../components/blocks/sidebar/SharedSidebarComponents.tsx). Gli editor sidebar importano sempre da lì, non dai file individuali.

### `components/blocks/sidebar/settings/`

Sezioni della sidebar impostazioni progetto (accessibili dalla sidebar sinistra → tab Impostazioni).

| File | Scopo |
|---|---|
| `ThemeSection.tsx` | Colori primario/secondario del progetto |
| `TypographySection.tsx` | Font principale del progetto |
| `ButtonDesignSection.tsx` | Stile globale dei pulsanti CTA |
| `SeoSection.tsx` | Meta title/description/image globali |
| `LanguageSection.tsx` | Gestione lingue, aggiunta/rimozione, lingua default |
| `DomainSection.tsx` | Collegamento dominio personalizzato |
| `AdvancedSection.tsx` | Impostazioni avanzate (favicon, robots, ecc.) |

### `components/blocks/BlockRegistry.tsx`

Dato un `block.type`, renderizza il componente visuale corretto. Usato sia dall'editor (canvas) che dalla generazione statica.

### `components/blocks/BlockSidebar.tsx`

Sidebar destra dell'editor. Dato il blocco selezionato, mostra il suo `unifiedEditor`.

### `components/blocks/ConfigSidebar.tsx`

Sidebar sinistra dell'editor. Contiene:
- Block library (aggiunta di nuovi blocchi)
- Impostazioni progetto (sezioni settings/)

### `components/blocks/EditorCanvas.tsx`

Canvas centrale dell'editor. Gestisce:
- Rendering dei blocchi nell'ordine corretto
- Drag & drop per riordinamento
- Selezione blocco → aggiorna store → apre sidebar
- Inline editing (delega a `InlineEditable` nei blocchi)

---

## 4. `components/editor/`

Componenti UI dell'editor non legati a un singolo blocco.

| File | Scopo |
|---|---|
| `EditorHeader.tsx` | Header superiore: nome progetto, viewport switcher, pulsanti deploy/preview |
| `EditorBlockWrapper.tsx` | Wrapper attorno a ogni blocco nel canvas (controlli move/delete/duplicate) |
| `CanvasToolbar.tsx` | Toolbar contestuale sul canvas |
| `VariantPicker.tsx` | Modale scelta variante al momento dell'inserimento blocco |
| `PageSwitcher.tsx` | Switcher pagine nell'editor |
| `PageManager.tsx` | Gestione pagine (create, rename, delete) dall'editor |
| `SiteChecklist.tsx` | Checklist completamento sito |
| `ChecklistModal.tsx` | Modale della checklist |
| `OnboardingTour.tsx` | Tour guidato per nuovi utenti |
| `HelpCenter.tsx` | Centro assistenza inline |
| `TemplatePreview.tsx` | Preview template durante la scelta |

### `components/editor/cards/`

| File | Scopo |
|---|---|
| `ProjectCard.tsx` | Card progetto nella lista progetti |
| `PageCard.tsx` | Card pagina nella dashboard del progetto |

### `components/editor/modals/`

| File | Scopo |
|---|---|
| `AIGeneratorModal.tsx` | Modale generazione pagina con AI |
| `PageSeoModal.tsx` | Modale impostazioni SEO per pagina |
| `TranslatePageModal.tsx` | Modale creazione traduzione di una pagina |
| `ProjectQuickEditModal.tsx` | Modale modifica rapida nome/slug progetto |

---

## 5. `components/shared/`

Componenti globali usati sia nell'editor che nei blocchi visuali che nella generazione statica.

| File | Scopo | Note |
|---|---|---|
| `InlineEditable.tsx` | Editing testo inline dal canvas | `use client` — usato solo quando `onInlineEdit` è presente |
| `SitiImage.tsx` | Wrapper `<img>` ottimizzato | Lazy loading, decoding async, risoluzione URL Supabase |
| `BlockBackground.tsx` | Sfondo blocco (colore, gradiente, immagine, overlay, pattern) | Usato da tutti i blocchi visuali |
| `CTA.tsx` | Pulsante call-to-action | Stile derivato da `project.settings` |
| `ImageUpload.tsx` | Upload immagine con preview | `use client` |
| `PdfUpload.tsx` | Upload PDF | `use client` |
| `ConfirmDialog.tsx` | Modale di conferma custom | Montato in `GlobalDialogs` — usa `confirm()` importato |
| `Toast.tsx` | Notifiche toast | Montato in `GlobalDialogs` — usa `toast()` importato |
| `GlobalDialogs.tsx` | Mount point globale per `ConfirmDialog` e `Toast` | Incluso in `app/layout.tsx` |

---

## 6. `lib/`

Logica core, utility e motori del sistema.

### File principali

| File | Scopo |
|---|---|
| [`block-definitions.ts`](../lib/block-definitions.ts) | Registry centrale `BLOCK_DEFINITIONS` + `getBlockLibrary()` + `getBlockDefinition()` |
| [`base-style-mapper.ts`](../lib/base-style-mapper.ts) | `getBaseStyleVars()` — converte `block.style` in ~30 CSS variables standard |
| [`generate-static.tsx`](../lib/generate-static.tsx) | Genera l'HTML statico di ogni pagina (usato durante il deploy); esporta `renderBlock` |
| [`generate-blog-static.tsx`](../lib/generate-blog-static.tsx) | Genera HTML statici blog: listing (`/blog/index.html`) e post (`/blog/{slug}.html`) con nav/footer da `siteGlobals` |
| [`utils.ts`](../lib/utils.ts) | `formatRichText()`, `toPx()`, `formatLink()`, `cn()` e altre utility |
| [`image-utils.ts`](../lib/image-utils.ts) | `resolveImageUrl()`, `optimizeImageToWebP()` |
| [`permissions.ts`](../lib/permissions.ts) | `getUserLimits()`, `UserLimits`, `canCreatePage()`, `canCreateArticle()` |
| [`templates.ts`](../lib/templates.ts) | Template di pagina predefiniti (struttura blocchi iniziale) |
| [`site-checklist.ts`](../lib/site-checklist.ts) | Logica checklist completamento sito |
| [`background-patterns.ts`](../lib/background-patterns.ts) | Definizioni pattern decorativi (SVG inline) |
| [`editor-constants.ts`](../lib/editor-constants.ts) | Costanti condivise nell'editor |
| [`url-utils.ts`](../lib/url-utils.ts) | Utility per costruzione URL (con prefisso lingua) |
| [`responsive-utils.ts`](../lib/responsive-utils.ts) | Utility per gestione stili responsive |
| [`i18n.ts`](../lib/i18n.ts) | Utility per internazionalizzazione |
| [`unsplash-photo-ids.ts`](../lib/unsplash-photo-ids.ts) | ID foto Unsplash per immagini placeholder AI |
| [`help-docs.ts`](../lib/help-docs.ts) | Contenuto del centro assistenza inline |

### `lib/hooks/`

| File | Scopo |
|---|---|
| [`useBlockStyles.ts`](../lib/hooks/useBlockStyles.ts) | `getBlockStyles()` — merge stile block per il viewport attivo, applica il `styleMapper` |

### `lib/ai/`

| File | Scopo |
|---|---|
| [`prompts.ts`](../lib/ai/prompts.ts) | Prompt di sistema e utente per la generazione AI di pagine |
| [`unsplash-images.ts`](../lib/ai/unsplash-images.ts) | Selezione immagini Unsplash tematiche per la generazione AI |

### `lib/supabase/`

| File | Scopo |
|---|---|
| [`server.ts`](../lib/supabase/server.ts) | Client Supabase per Server Components e Server Actions |
| [`middleware.ts`](../lib/supabase/middleware.ts) | Client Supabase per middleware Next.js (refresh sessione) |

---

## 7. `store/`

| File | Scopo |
|---|---|
| [`useEditorStore.ts`](../store/useEditorStore.ts) | Store Zustand dell'editor — stato blocchi, pagina corrente, viewport, siteGlobals, undo/redo, salvataggio |

Lo store è il punto centrale di verità dell'editor. Contiene:
- `blocks` — array blocchi della pagina corrente (inclusi nav/footer virtuali)
- `selectedBlockId` — blocco selezionato
- `viewport` — `'desktop' | 'tablet' | 'mobile'`
- `siteGlobals` — nav e footer per lingua (da `site_globals` Supabase)
- `injectGlobals()` — inietta nav/footer come blocchi virtuali
- `stripGlobals()` — rimuove i blocchi virtuali prima del salvataggio
- `updateBlock()`, `addBlock()`, `removeBlock()`, `moveBlock()` — mutazioni blocchi
- `saveBlocks()` — persistenza su Supabase

---

## 8. `types/`

| File | Scopo |
|---|---|
| [`editor.ts`](../types/editor.ts) | `BlockType`, `Block`, `Page`, `Project`, `ProjectSettings`, `SiteGlobal` |
| [`block-definition.ts`](../types/block-definition.ts) | `BlockDefinition`, `BlockVariant` |
| [`sidebar.ts`](../types/sidebar.ts) | Tipi per i props standard dei componenti sidebar (`getStyleValue`, `updateStyle`, ecc.) |

---

## 9. `hooks/`

Hook globali (non specifici di un solo componente).

| File | Scopo |
|---|---|
| [`useEditorShortcuts.ts`](../hooks/useEditorShortcuts.ts) | Keyboard shortcuts dell'editor (undo, redo, delete blocco, ecc.) |

---

## 10. `supabase/`

| File | Scopo |
|---|---|
| `migration_multilang.sql` | Crea `site_globals`, aggiunge `translations_group_id` a `pages` |
| `migration_data_one_shot.sql` | Migrazione dati one-shot (eseguita una volta) |
| `functions/cleanup-storage/` | Edge Function per pulizia asset orfani su Supabase Storage |

Per la documentazione completa del database e dei permessi, vedi i file in `supabase/` (non versionati qui).

---

## 11. Regole d'Oro

### 1. Server vs Client

- `app/` → **Server Components** per default. Client solo dove strettamente necessario (`"use client"`)
- `components/blocks/visual/` → **mai** `"use client"`, mai hook React
- `components/blocks/sidebar/` → **sempre** `"use client"`
- `components/shared/` → misto; `InlineEditable`, `ImageUpload`, `Toast`, `ConfirmDialog` sono client

### 2. Nessun valore hardcoded nei componenti visuali

**MAI** inserire valori fissi di spaziatura nei blocchi visuali:

```tsx
// SBAGLIATO
<section className="px-8 py-16 gap-6">

// CORRETTO
<section style={{ paddingTop: 'var(--block-pt)', paddingLeft: 'var(--block-px)', gap: 'var(--block-gap)' }}>
```

Le CSS variables vengono sostituite dalle media query nel sito pubblicato per la responsività.

### 3. Stili inline solo se non statici

Per valori che dipendono da `block.style` ma non sono tra le CSS vars standard di `getBaseStyleVars`, applicali solo in editor:

```tsx
const customStyle = !isStatic ? { '--my-var': `${style.myValue}%` } : {};
```

### 4. Nomi variabili CSS consistenti

Rispetta i nomi standard già in uso. Non inventare varianti:

| Corretto | Sbagliato |
|---|---|
| `--block-pt` | `--section-padding-top` |
| `--title-fs` | `--heading-font-size` |
| `--block-gap` | `--item-spacing` |

### 5. Un solo posto per ogni logica

- Stile → `*.definition.*` (styleMapper) e CSS variables
- Dati → `block.content`
- Configurazione UI → `*.definition.*` (defaults, variants)
- Stato editor → `useEditorStore`
- Dati server → Server Actions in `app/actions/`

### 6. Bordi e separatori adattivi

Usa `color-mix` per bordi che si adattano automaticamente a tema chiaro/scuro:

```tsx
style={{ borderColor: 'color-mix(in srgb, currentColor 8%, transparent)' }}
```

### 7. Conferme e toast — sempre custom

```typescript
// NON usare
window.confirm('Sei sicuro?');
alert('Fatto!');

// USARE
import { confirm } from '@/components/shared/ConfirmDialog';
import { toast } from '@/components/shared/Toast';
```

---

## 12. File di Riferimento per Argomento

### Aggiungere un nuovo blocco
→ Vedi [`docs/new-block.md`](./new-block.md)

### Sistema multi-lingua
→ Vedi [`docs/multilang.md`](./multilang.md)

### Generazione AI di pagine
→ Vedi [`docs/ai-generation.md`](./ai-generation.md)

### Server Actions e backend
→ Vedi [`docs/backend-server-actions.md`](./backend-server-actions.md)

### Deploy e build statica
→ [`app/actions/deploy.ts`](../app/actions/deploy.ts), [`lib/generate-static.tsx`](../lib/generate-static.tsx)

### Permessi e piani
→ [`lib/permissions.ts`](../lib/permissions.ts), `supabase/PIANI_E_PERMESSI.md`

### Database e migrazioni
→ `supabase/migration_multilang.sql`, `supabase/migration_data_one_shot.sql`
