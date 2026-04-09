# Gestione Multi-Lingua — Specifiche Funzionali e Tecniche

> Documento di riferimento per l'implementazione e le future evoluzioni della funzionalità multi-lingua.

---

## Indice

1. [Panoramica Architetturale](#1-panoramica-architetturale)
2. [Database](#2-database)
3. [Permessi e Limiti di Piano](#3-permessi-e-limiti-di-piano)
4. [Server Actions](#4-server-actions)
5. [Editor — Gestione Lingue](#5-editor--gestione-lingue)
6. [Globals Sito (Nav e Footer)](#6-globals-sito-nav-e-footer)
7. [Generazione Statica e SEO](#7-generazione-statica-e-seo)
8. [Deployment](#8-deployment)
9. [Limitazioni e Vincoli Attuali](#9-limitazioni-e-vincoli-attuali)
10. [File di Riferimento](#10-file-di-riferimento)

---

## 1. Panoramica Architetturale

### Modello concettuale

Il sito multi-lingua è strutturato così:

```
Progetto
├── settings.languages: ['it', 'en', 'fr', ...]
├── settings.defaultLanguage: 'it'
│
├── Pagine (tabella `pages`)
│   ├── page_1  language:'it'  translations_group_id: UUID_A  slug:'home'
│   ├── page_2  language:'en'  translations_group_id: UUID_A  slug:'home'
│   ├── page_3  language:'it'  translations_group_id: UUID_B  slug:'chi-siamo'
│   └── page_4  language:'en'  translations_group_id: UUID_B  slug:'about-us'
│
└── Globals (tabella `site_globals`)
    ├── language:'it'  type:'navigation'  → nav italiana
    ├── language:'it'  type:'footer'      → footer italiano
    ├── language:'en'  type:'navigation'  → nav inglese (indipendente)
    └── language:'en'  type:'footer'      → footer inglese (indipendente)
```

### Principi chiave

- **Ogni pagina ha la propria lingua** (`language` column). Le pagine sono collegate tra loro via `translations_group_id` (UUID condiviso).
- **Nav e footer sono globali per lingua**: un solo nav e un solo footer per `(project_id, language)`, gestiti nella tabella `site_globals`.
- **La pagina non contiene mai nav/footer nei propri `blocks`**. Vengono iniettati virtualmente in fase di editor e di generazione statica.
- **La lingua default** determina la struttura URL senza prefisso (`/slug`). Le altre lingue usano un prefisso (`/en/slug`, `/fr/slug`, ecc.).
- **Le pagine di lingue diverse hanno slug indipendenti** (es. `chi-siamo` in IT, `about-us` in EN).

---

## 2. Database

### Tabella `pages`

Colonne rilevanti per il multilang:

| Colonna | Tipo | Descrizione |
|---|---|---|
| `language` | `TEXT` | Codice lingua ISO (es. `it`, `en`) |
| `translations_group_id` | `UUID` (nullable) | Collega versioni tradotte della stessa pagina |
| `slug` | `TEXT` | Slug URL unico per lingua |

> **Nota**: `translations_group_id` viene assegnato solo nel momento in cui si crea la prima traduzione di una pagina (lazy assignment). Pagine create senza traduzioni hanno `null`.

### Tabella `blog_posts`

Colonne rilevanti per il multilang:

| Colonna | Tipo | Descrizione |
|---|---|---|
| `language` | `TEXT` | Codice lingua ISO dell'articolo |
| `translation_group` | `UUID` (nullable) | Collega articoli nella stessa famiglia di traduzioni (stesso concetto di `translations_group_id` per le pagine) |

> **Nota**: `translation_group` ha lazy assignment — viene assegnato alla prima traduzione. L'articolo originale viene aggiornato con il proprio `id` come `translation_group` nel momento in cui si crea la prima traduzione.

**Indice:**
```sql
CREATE INDEX IF NOT EXISTS pages_translations_group_id_idx ON pages(translations_group_id);
```

### Tabella `site_globals`

Centralizza nav e footer per lingua.

| Colonna | Tipo | Descrizione |
|---|---|---|
| `id` | `UUID` | PK |
| `project_id` | `UUID` | FK → projects |
| `language` | `TEXT` | Codice lingua |
| `type` | `TEXT` | `'navigation'` o `'footer'` |
| `content` | `JSONB` | Contenuto (links, logo, social, ecc.) |
| `style` | `JSONB` | Stile visivo |

**Vincolo unico**: `UNIQUE (project_id, language, type)` — un solo nav e un solo footer per lingua.

**RLS**: Solo il proprietario del progetto può leggere/scrivere i propri globals (policy `site_globals_owner_*`).

**File migration**: [`supabase/migration_multilang.sql`](../supabase/migration_multilang.sql)

---

## 3. Permessi e Limiti di Piano

### Flag `can_multilang`

Il permesso multilang è controllato dal flag `can_multilang: boolean` nell'interfaccia `UserLimits`.

**Come si ottiene:**
- RPC Supabase: `get_user_limits(p_user_id)` → restituisce i limiti del piano dell'utente
- Definita in [`lib/permissions.ts`](../lib/permissions.ts) → interfaccia `UserLimits`

```typescript
export interface UserLimits {
  // ...
  can_multilang: boolean;
  // ...
}
```

### Dove viene verificato

| Punto di controllo | File | Comportamento |
|---|---|---|
| Dashboard progetto | [`app/editor/[projectId]/ProjectDashboardClient.tsx`](../app/editor/%5BprojectId%5D/ProjectDashboardClient.tsx) (riga ~675) | Passa `canMultilang` al `LanguageSection` |
| Sezione lingue sidebar | [`components/blocks/sidebar/settings/LanguageSection.tsx`](../components/blocks/sidebar/settings/LanguageSection.tsx) | Nasconde pulsante "Aggiungi lingua", mostra banner upgrade se `canMultilang = false` |
| Creazione traduzione | Chiamata a `translatePage` — attualmente **non verifica** `can_multilang` lato server (solo lato UI) |

> **TODO futuro**: aggiungere verifica `can_multilang` lato server nella server action `translatePage` per sicurezza.

### Lingue supportate

Definite staticamente in `LanguageSection.tsx`:

```typescript
const AVAILABLE_LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];
```

---

## 4. Server Actions

### `createPage` — [`app/actions/pages.ts`](../app/actions/pages.ts)

Crea una nuova pagina in una lingua specifica. Il campo `language` viene passato esplicitamente dal caller.

- Verifica proprietà del progetto
- Verifica limite `max_pages_per_project`
- Inserisce la pagina senza `translations_group_id` (verrà assegnato se/quando viene tradotta)

### `translatePage` — [`app/actions/pages.ts`](../app/actions/pages.ts)

Crea una versione tradotta di una pagina esistente. Flusso:

1. Verifica autenticazione e proprietà del progetto
2. Verifica limite `max_pages_per_project`
3. Carica la pagina sorgente
4. **Assegna `translations_group_id`**: se la pagina sorgente non ha ancora un UUID di gruppo, ne genera uno e lo scrive su di essa
5. Crea la nuova pagina nella lingua target, copiando `blocks` e `seo` dalla sorgente, con lo stesso `translations_group_id`
6. **Copia i `site_globals`**: se nella lingua target non esistono ancora nav/footer, li copia dalla lingua sorgente (bootstrap iniziale)
7. Restituisce la nuova pagina + `sourceGroupId` (per aggiornare il client senza refetch)

```typescript
// Copia automatica dei globals se mancanti
const missingTypes = (['navigation', 'footer']).filter(t => !existingTypes.has(t));
// → inserisce in site_globals per la lingua target
```

> Il caller (`ProjectDashboardClient`) aggiorna localmente `translations_group_id` della pagina sorgente usando `sourceGroupId` per evitare un refetch completo.

---

## 5. Editor — Gestione Lingue

### Aggiunta/rimozione lingue

Nella **sidebar impostazioni progetto** (`ProjectDashboardClient.tsx` > sezione Settings):

- **Aggiungi lingua**: `LanguageSection` chiama `updateProjectSettings({ languages: [...languages, code] })` — aggiorna `project.settings.languages`
- **Rimuovi lingua**: rimuove da `settings.languages`; non cancella le pagine in quella lingua (deve essere fatto manualmente)
- **Imposta default**: aggiorna `settings.defaultLanguage`

> Rimuovere una lingua dall'elenco non elimina le pagine esistenti. È una scelta voluta per evitare perdita accidentale di contenuto.

### Creazione traduzione di una pagina

Dalla dashboard del progetto, il pulsante "Traduci" su una page card apre `TranslatePageModal`:

- File: [`components/editor/modals/TranslatePageModal.tsx`](../components/editor/modals/TranslatePageModal.tsx)
- Permette di scegliere la lingua target, impostare titolo e slug
- Chiama la server action `translatePage`
- Al ritorno aggiorna l'elenco pagine nel client

### Creazione traduzione di un articolo blog

Dalla dashboard (tab Blog), il pulsante "Traduci" su una card articolo apre `TranslateBlogPostModal`:

- File: [`components/editor/modals/TranslateBlogPostModal.tsx`](../components/editor/modals/TranslateBlogPostModal.tsx)
- Filtra le lingue disponibili escludendo quelle già tradotte (leggendo `translation_group` sul DB)
- Suggerisce slug automatico (`{slug-originale}-{lang}`)
- Crea un articolo bozza nella lingua target con `translation_group` condiviso
- Aggiorna `translation_group` dell'articolo originale se è `null` (lazy assignment)
- **Non** copia il corpo dell'articolo: il traduttore scrive il testo direttamente nell'editor

### Filtro per lingua nella dashboard

La dashboard mostra le pagine filtrate per lingua attiva. Le tab delle lingue sono derivate da `project.settings.languages`.

### Lingua della HOME nella creazione progetto

Quando si crea un nuovo progetto, la prima pagina HOME viene creata nella lingua default del progetto (derivata dalla prima lingua scelta o `it`):

```typescript
// ProjectListClient.tsx
const defaultLang = businessLanguages[0] || 'it';
const initialPages = [{ ..., language: defaultLang }];
```

---

## 6. Globals Sito (Nav e Footer)

### Architettura

Nav e footer **non sono blocchi nelle pagine** ma record separati in `site_globals`. In editor vengono iniettati virtualmente tramite `injectGlobals`.

### Flusso nell'editor

**Caricamento** (`useEditorStore.ts`):
1. Al caricamento del progetto, vengono fetchati tutti i `site_globals` del progetto
2. Vengono salvati nello store come array `siteGlobals: SiteGlobal[]`
3. Alla visualizzazione di una pagina, i globals per la lingua corrente vengono iniettati come blocchi virtuali all'inizio e alla fine del canvas (`injectGlobals`)

**Salvataggio**:
- Le modifiche a nav/footer vengono salvate direttamente in `site_globals` (upsert su `(project_id, language, type)`)
- Non vengono mai scritti nei `blocks` della pagina

**Restrizioni UI**:
- I blocchi nav e footer **non possono essere** eliminati, spostati o duplicati dall'editor
- Il pulsante `+` per aggiungere blocchi non appare né prima della nav né dopo il footer
- Il block wrapper non mostra i controlli di move/delete per nav e footer

### Iniezione nel footer: `_navLogoFallback` e `_language`

Al momento dell'iniezione, il content del footer viene arricchito con:

```typescript
{
  ...footerGlobal.content,
  _navLogoFallback: // immagine logo della nav (fallback se il footer non ha logo),
  _language: pageLang,  // lingua corrente (per eventuali filtrali futuri)
}
```

Questi campi con prefisso `_` sono **temporanei e non persistenti** — vengono iniettati a runtime e non vengono mai salvati in `site_globals`.

### Globals alla creazione di un progetto

Alla creazione di un nuovo progetto (`ProjectListClient.tsx`), vengono create entries iniziali in `site_globals` per la lingua default, con:
- Nav: logo testo, link [Home: `/`]
- Footer: logo testo, link [Home: `/`], copyright base

---

## 7. Generazione Statica e SEO

### File: [`lib/generate-static.tsx`](../lib/generate-static.tsx)

Ogni pagina viene generata con il suo nav/footer specifico per lingua. Il processo:

1. Trova i globals per la lingua della pagina corrente (`siteGlobals.find(g => g.language === pageLang && g.type === 'navigation')`)
2. Costruisce `allBlocksToRender = [navBlock, ...pageContent, footerBlock]`
3. Inietta `_language` e `_navLogoFallback` nel footer (stesso meccanismo dell'editor)

### hreflang e x-default

Già implementato. Per ogni pagina vengono generati i tag `<link rel="alternate" hreflang="...">`:

```html
<link rel="alternate" hreflang="it" href="https://example.com/chi-siamo" />
<link rel="alternate" hreflang="en" href="https://example.com/en/about-us" />
<link rel="alternate" hreflang="x-default" href="https://example.com/chi-siamo" />
```

**Logica di matching delle varianti:**
- Preferisce `translations_group_id` (matching preciso)
- Fallback: slug matching (compatibilità backward)
- `x-default` punta alla variante nella lingua default del progetto

```typescript
const allVariants = allPages.filter(p => {
  if (page.translations_group_id && p.translations_group_id) {
    return page.translations_group_id === p.translations_group_id;
  }
  return p.slug === page.slug; // fallback
});
```

> **Nota**: Le pagine senza `translations_group_id` potrebbero avere hreflang imprecisi se gli slug differiscono tra lingue. La soluzione definitiva è assicurarsi che tutte le traduzioni abbiano `translations_group_id`.

### Struttura URL generata

```
/               → pagina home lingua default (es. IT)
/chi-siamo      → pagina in IT
/en/            → pagina home in EN
/en/about-us    → pagina about in EN
/fr/accueil     → pagina home in FR
```

La lingua default non ha prefisso URL. Le lingue secondarie usano `/${langCode}/`.

---

## 8. Deployment

Il deploy (`app/actions/deploy.ts`) itera su tutte le pagine del progetto e per ognuna chiama `generateStaticHtml`, passando i `siteGlobals` e l'elenco completo delle pagine (necessario per generare gli hreflang).

Ogni pagina produce un file HTML indipendente — l'ordine di generazione non ha impatto sull'utente finale.

---

## 9. Limitazioni e Vincoli Attuali

| Limitazione | Dettaglio |
|---|---|
| **Lingue disponibili** | Solo 5 lingue predefinite (IT, EN, FR, DE, ES). Non è possibile aggiungerne altre senza modificare `LanguageSection.tsx` |
| **Nessuna UI language switcher** | Non esiste ancora un componente switcher lingua per il sito pubblicato. Va implementato |
| **Verifica `can_multilang` solo lato UI** | La server action `translatePage` non verifica il permesso — un utente senza piano potrebbe aggirare la restrizione via API diretta |
| **Rimozione lingua non elimina pagine** | Rimuovere una lingua da `settings.languages` non pulisce le pagine esistenti in quella lingua |
| **Globals copiati solo al primo translatePage** | Se si aggiunge una lingua manualmente (senza tradurre pagine), i globals per quella lingua non vengono creati automaticamente | -> al momento non è possibile creare pagine manualmente in altre lingue ma da tenere conto per il futuro.
| **Slug non unici globalmente** | Il vincolo di unicità slug è per `(project_id, language)`. Due pagine in lingue diverse possono avere lo stesso slug |
| **No fallback lingua** | Se una pagina non ha traduzione in una lingua, non c'è redirect automatico alla versione default | -> con implementazione del SELETTORE si può gestire redirect a HOME dell'altra lingua in caso di assenza di pagina tradotta

---

## 10. File di Riferimento

### Database e Migration
- [`supabase/migration_multilang.sql`](../supabase/migration_multilang.sql) — Crea `site_globals` e aggiunge `translations_group_id` a `pages`
- [`supabase/PIANI_E_PERMESSI.md`](../supabase/PIANI_E_PERMESSI.md) — Documentazione piani e permessi (incluso `can_multilang`)
- [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) — SQL dei piani e della RPC `get_user_limits`

### Backend / Server Actions
- [`lib/permissions.ts`](../lib/permissions.ts) — `UserLimits`, `getUserLimits()`, `canCreatePage()`
- [`app/actions/pages.ts`](../app/actions/pages.ts) — `createPage()`, `translatePage()`
- [`app/actions/deploy.ts`](../app/actions/deploy.ts) — Deploy con globals per lingua
- [`app/actions/projects.ts`](../app/actions/projects.ts) — Creazione progetto con globals iniziali

### Generazione Statica
- [`lib/generate-static.tsx`](../lib/generate-static.tsx) — Generazione HTML per ogni pagina, hreflang, iniezione globals

### Tipi
- [`types/editor.ts`](../types/editor.ts) — `SiteGlobal`, `Page` (con `translations_group_id`, `language`), `ProjectSettings` (con `languages`, `defaultLanguage`)

### Store Editor
- [`store/useEditorStore.ts`](../store/useEditorStore.ts) — `siteGlobals`, `injectGlobals`, `stripGlobals`, salvataggio globals

### UI Editor
- [`app/editor/[projectId]/ProjectDashboardClient.tsx`](../app/editor/%5BprojectId%5D/ProjectDashboardClient.tsx) — Dashboard con tab lingue, pulsante Traduci, `userLimits.can_multilang`
- [`components/blocks/sidebar/settings/LanguageSection.tsx`](../components/blocks/sidebar/settings/LanguageSection.tsx) — Sezione gestione lingue nella sidebar impostazioni
- [`components/editor/modals/TranslatePageModal.tsx`](../components/editor/modals/TranslatePageModal.tsx) — Modal creazione traduzione pagina

### Visual Components (Nav/Footer)
- [`components/blocks/visual/navigation/Navigation.tsx`](../components/blocks/visual/navigation/Navigation.tsx) — Blocco visivo navigazione
- [`components/blocks/visual/navigation/MobileMenu.tsx`](../components/blocks/visual/navigation/MobileMenu.tsx) — Menu mobile hamburger
- [`components/blocks/visual/FooterBlock.tsx`](../components/blocks/visual/FooterBlock.tsx) — Blocco visivo footer

### Sidebar Editors (Nav/Footer)
- [`components/blocks/sidebar/block-editors/Navigation.tsx`](../components/blocks/sidebar/block-editors/Navigation.tsx) — Editor sidebar navigazione
- [`components/blocks/sidebar/block-editors/Footer.tsx`](../components/blocks/sidebar/block-editors/Footer.tsx) — Editor sidebar footer

### Blog multilang
- [`components/editor/modals/TranslateBlogPostModal.tsx`](../components/editor/modals/TranslateBlogPostModal.tsx) — Modal traduzione articolo blog
- [`lib/generate-blog-static.tsx`](../lib/generate-blog-static.tsx) — Genera HTML blog per lingua con nav/footer corretti da `siteGlobals`
