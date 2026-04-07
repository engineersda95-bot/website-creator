# Creare un Nuovo Blocco — Guida Tecnica

> Documento di riferimento per l'aggiunta di nuovi blocchi (moduli) alla libreria del website creator.

---

## Indice

1. [Architettura del Sistema](#1-architettura-del-sistema)
2. [Passo 1 — Tipo BlockType](#2-passo-1--tipo-blocktype)
3. [Passo 2 — Componente Visuale](#3-passo-2--componente-visuale)
4. [Passo 3 — Varianti (Opzionale)](#4-passo-3--varianti-opzionale)
5. [Passo 4 — Inline Editing](#5-passo-4--inline-editing)
6. [Passo 5 — Editor Sidebar Unificato](#6-passo-5--editor-sidebar-unificato)
7. [Passo 6 — Definition File](#7-passo-6--definition-file)
8. [Passo 7 — Registrazione](#8-passo-7--registrazione)
9. [Gestione Responsive](#9-gestione-responsive)
10. [Componenti Sidebar Disponibili](#10-componenti-sidebar-disponibili)
11. [Interattività e Generazione Statica](#11-interattività-e-generazione-statica)
12. [Immagini](#12-immagini)
13. [Best Practices](#13-best-practices)
14. [File di Riferimento](#14-file-di-riferimento)

---

## 1. Architettura del Sistema

```
types/editor.ts                              → Tipi BlockType, Block, Page, SiteGlobal
types/block-definition.ts                   → Interfacce BlockDefinition, BlockVariant
lib/block-definitions.ts                    → Registry BLOCK_DEFINITIONS + getBlockLibrary()
lib/base-style-mapper.ts                    → getBaseStyleVars() — genera ~30 CSS vars standard
lib/hooks/useBlockStyles.ts                 → getBlockStyles() — merging stile per viewport
components/blocks/visual/                   → Componenti visuali (NO "use client")
components/blocks/visual/*.definition.*     → Configurazione blocco (defaults, styleMapper, variants, unifiedEditor)
components/blocks/sidebar/block-editors/    → Editor sidebar unificati
components/blocks/sidebar/SharedSidebarComponents.tsx  → Re-export di tutti i componenti sidebar
components/blocks/sidebar/ui/               → Componenti UI base (UnifiedSection, SimpleInput, ecc.)
components/blocks/sidebar/managers/        → Manager condivisi (ColorManager, BackgroundManager, ecc.)
components/shared/                          → Componenti globali (InlineEditable, CTA, SitiImage, Toast, ConfirmDialog, BlockBackground)
lib/generate-static.tsx                     → Generatore HTML statico per deploy
```

> **Regola fondamentale**: modifica **solo** i file indicati in questa guida. Non toccare altri file di sistema a meno di richiesta esplicita.

---

## 2. Passo 1 — Tipo BlockType

Aggiungi il nuovo tipo all'unione `BlockType` in [`types/editor.ts`](../types/editor.ts):

```typescript
export type BlockType =
  'hero' | 'text' | ... | 'nuovo-blocco';
```

---

## 3. Passo 2 — Componente Visuale

Crea `components/blocks/visual/[NomeBlocco].tsx`.

### Regole obbligatorie

| Regola | Motivazione |
|---|---|
| **NO** `"use client"` | Deve funzionare con `renderToStaticMarkup` in build statica |
| **NO** hook React (`useState`, `useEffect`, `useRef`) | Stesso motivo — percorso statico non supporta hook |
| **NO** margini/padding hardcoded | Tutto deve essere controllabile dall'utente via CSS variables |
| Usa `getBlockStyles(block, project, viewport)` | Ottiene stili già mergiati per il viewport corrente |
| Usa `formatRichText()` per testi con markup | Gestisce bold, link, newline uniformemente |
| Usa `SitiImage` per le immagini | Lazy loading e ottimizzazione automatici |
| Usa `InlineEditable` condizionato a `onInlineEdit` | Solo in editor, mai in build statica |
| Aggiungi `data-sidebar-section="xxx"` agli elementi | Collega il doppio click su canvas → apertura sezione sidebar |

### Props standard del componente

```typescript
interface MioBloccoProps {
  block: Block;
  project: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
}
```

### Esempio minimo

```tsx
import React from 'react';
import { Block, Project } from '@/types/editor';
import { formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';

export const MioBlocco: React.FC<MioBloccoProps> = ({
  block, project, viewport, isStatic, imageMemoryCache, onInlineEdit
}) => {
  const { content } = block;
  const { style } = getBlockStyles(block, project, viewport || 'desktop');

  return (
    <section style={{
      background: 'var(--block-bg)',
      paddingTop: 'var(--block-pt)',
      paddingBottom: 'var(--block-pb)',
      paddingLeft: 'var(--block-px)',
      paddingRight: 'var(--block-px)',
      color: 'var(--block-color)',
    }}>
      <BlockBackground backgroundImage={content.backgroundImage} style={style} project={project} isStatic={isStatic} />
      <div className="relative z-10">
        {onInlineEdit ? (
          <InlineEditable
            value={content.title || ''}
            onChange={(v) => onInlineEdit('title', v)}
            fieldId="title"
            placeholder="Titolo..."
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }} />
        )}
      </div>
    </section>
  );
};
```

---

## 4. Passo 3 — Varianti (Opzionale)

Le varianti permettono layout visivamente diversi con gli stessi dati di contenuto.

### Come funzionano

1. Aggiungi `variant` a `content` (es. `content.variant: 'cards' | 'minimal' | 'list'`)
2. Nel componente visuale, switcha il rendering in base a `content.variant`
3. Le varianti cambiano **solo la forma dell'item**, non il container (grid/slider resta invariato)
4. Definisci le varianti nella definition con preview SVG wireframe

### Definizione varianti nel definition file

```typescript
variants: [
  { id: 'cards', label: 'Cards', description: 'Layout a schede con immagine', preview: PreviewCards },
  { id: 'minimal', label: 'Minimal', description: 'Solo testo, nessuna immagine', preview: PreviewMinimal },
],
```

### Preview SVG

Le preview sono componenti React che renderizzano un wireframe 200×120:

```tsx
const PreviewCards: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" rx="4" fill="#18181b" />
    {/* wireframe del layout */}
  </svg>
);
```

> **Comportamento**: se il blocco ha varianti, al momento dell'inserimento si apre un modale **VariantPicker**. L'utente sceglie la variante e il blocco viene inserito con `content.variant` preimpostato. La variante può essere cambiata in seguito dalla sidebar.

---

## 5. Passo 4 — Inline Editing

Permette la modifica dei testi direttamente dal canvas senza aprire la sidebar.

### Regole

1. Il componente riceve `onInlineEdit?: (field: string, value: string) => void` come prop
2. Se `onInlineEdit` esiste (editor), renderizza `InlineEditable`; altrimenti renderizza `dangerouslySetInnerHTML`
3. Aggiungi `fieldId="xxx"` all'`InlineEditable` — il canvas emette un `CustomEvent('block-section-focus')` che apre la sezione corrispondente nella sidebar
4. Per campi rich text, usa le props `richText` e `multiline`
5. Per CTA, usa `onLabelChange` + `fieldId` sul componente `CTA`
6. Per elementi non editabili inline, usa `data-sidebar-section="xxx"` per il collegamento al doppio click

```tsx
{/* Testo semplice */}
{onInlineEdit ? (
  <InlineEditable value={content.title} onChange={(v) => onInlineEdit('title', v)} fieldId="title" />
) : (
  <div dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }} />
)}

{/* Rich text multiline */}
{onInlineEdit ? (
  <InlineEditable value={content.body} onChange={(v) => onInlineEdit('body', v)} fieldId="body" richText multiline />
) : (
  <div dangerouslySetInnerHTML={{ __html: formatRichText(content.body) }} />
)}

{/* Elemento non inline-editabile → doppio click apre sidebar */}
<div data-sidebar-section="items">
  {/* lista items */}
</div>
```

---

## 6. Passo 5 — Editor Sidebar Unificato

Crea `components/blocks/sidebar/block-editors/[NomeBlocco].tsx`.

> Tutti gli editor devono usare il sistema **unificato** (sidebar accordion). I vecchi editor separati Content/Style sono legacy e usati solo come fallback.

### Struttura standard

```tsx
'use client';

import {
  UnifiedSection as Section,
  useUnifiedSections,
  CategoryHeader,
  ManagerWrapper,
  SimpleInput,
  TypographyFields,
  LayoutFields,
  LayoutGridSlider,
  ColorManager,
  BackgroundManager,
  PatternManager,
  BorderShadowManager,
  AnimationManager,
  AnchorManager,
  CTAManager,
} from '../SharedSidebarComponents';
import { Type, List, Layers, Palette, Play, Settings } from 'lucide-react';

export const MioBloccoUnified = ({ selectedBlock, updateContent, updateStyle, getStyleValue, project }) => {
  const { openSection, toggleSection } = useUnifiedSections();
  const content = selectedBlock.content;

  return (
    <div>
      {/* Selettore variante (se il blocco ha varianti) */}
      {/* <div className="px-5 py-4 border-b border-zinc-100">...</div> */}

      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo"
          value={content.title || ''}
          onChange={(v) => updateContent({ title: v })}
        />
        <TypographyFields
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          prefix="title"
        />
      </Section>

      <Section icon={List} label="Elementi" id="items" isOpen={openSection === 'items'} onToggle={toggleSection}>
        {/* Lista item con add/remove/reorder */}
      </Section>

      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ManagerWrapper>
          <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </ManagerWrapper>
        <ManagerWrapper>
          <BackgroundManager content={content} updateContent={updateContent} project={project} getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </ManagerWrapper>
        <ManagerWrapper>
          <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </ManagerWrapper>
      </Section>

      <Section icon={Play} label="Animazioni" id="animation" isOpen={openSection === 'animation'} onToggle={toggleSection}>
        <AnimationManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Settings} label="Avanzate" id="advanced" isOpen={openSection === 'advanced'} onToggle={toggleSection}>
        <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <AnchorManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>
    </div>
  );
};
```

### Regole sidebar

| Regola | Dettaglio |
|---|---|
| Usa `UnifiedSection` per le sezioni | **NO** tab Content/Style separati |
| Usa `CategoryHeader` per i separatori | Etichette di gruppo (`"Componenti"`, `"Stile della Sezione"`) |
| Usa `ManagerWrapper` per i manager condivisi | Nasconde i loro header interni duplicati |
| Le sezioni partono chiuse | Si aprono al click o dal canvas (via `CustomEvent`) |
| Colori inline | Sfondo + testo su una riga, switch tinta unita/gradiente sotto |

---

## 7. Passo 6 — Definition File

Crea `components/blocks/visual/[NomeBlocco].definition.tsx` (usa `.tsx` se contiene preview SVG, `.ts` altrimenti).

```typescript
import { NomeBloccoIcon } from 'lucide-react';
import { MioBlocco } from './MioBlocco';
import { MioBloccoUnified } from '../sidebar/block-editors/MioBlocco';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const mioBloccoDefinition: BlockDefinition = {
  type: 'nuovo-blocco',
  label: 'Etichetta UI',
  icon: NomeBloccoIcon,
  visual: MioBlocco,
  unifiedEditor: MioBloccoUnified,
  defaults: {
    content: {
      variant: 'cards',     // se usa varianti
      title: 'Titolo',
      items: [],
    },
    style: {
      padding: 80,
      align: 'center',
      titleTag: 'h2',
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0,
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40,
    }
  },
  variants: [...],   // opzionale
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;

    return {
      ...vars,
      '--mia-variabile-custom': toPx(val('miaKey', 20)),
    };
  }
};
```

### Campi BlockDefinition

| Campo | Tipo | Obbligatorio | Descrizione |
|---|---|---|---|
| `type` | `BlockType` | ✅ | Chiave univoca del blocco |
| `label` | `string` | ✅ | Nome mostrato in UI |
| `icon` | Lucide icon | ✅ | Icona nella block library |
| `visual` | `React.FC` | ✅ | Componente visuale (NO use client) |
| `unifiedEditor` | `React.FC` | Consigliato | Editor sidebar unificato |
| `defaults` | oggetto | ✅ | Valori iniziali di `content` e `style` |
| `variants` | `BlockVariant[]` | No | Layout alternativi con preview SVG |
| `styleMapper` | funzione | No | Converte `style` in CSS variables custom |

---

## 8. Passo 7 — Registrazione

Aggiungi import e entry in [`lib/block-definitions.ts`](../lib/block-definitions.ts):

```typescript
// 1. Import
import { mioBloccoDefinition } from '@/components/blocks/visual/MioBlocco.definition';

// 2. Aggiungi a BLOCK_DEFINITIONS
export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  // ...blocchi esistenti...
  'nuovo-blocco': mioBloccoDefinition,
};

// getBlockLibrary() non va modificata: include automaticamente tutti i blocchi
// con visual !== null che non siano 'navigation' o 'footer'
```

> `getBlockLibrary()` genera automaticamente la lista dei blocchi disponibili nella sidebar dell'editor filtrando `visual !== null && type !== 'navigation' && type !== 'footer'`. Non serve modificarla.

---

## 9. Gestione Responsive

### Nel componente visuale

Usa sempre CSS variables per le spaziature — vengono sovrascritte dalle media query nel build statico:

```tsx
// CORRETTO — le media query del sito live possono sovrascrivere
<section style={{ paddingTop: 'var(--block-pt)', gap: 'var(--block-gap)' }}>

// SBAGLIATO — valore inline che non può essere sovrascritto
<section style={{ paddingTop: '80px', gap: '24px' }}>
```

Per stili che dipendono da viewport ma non sono coperti da CSS vars standard, applica solo in editor:

```tsx
const mapStyles = !isStatic ? { '--map-width': `${style.mapWidth}%` } : {};
```

### Nell'editor sidebar

- `getStyleValue(key, default)` — recupera il valore per il viewport attivo (con fallback a desktop)
- `updateStyle({ key: value })` — salva in `block.style` (desktop) o `block.responsiveStyles[viewport]`
- `LayoutGridSlider` — gestisce colonne responsive (desktop/tablet/mobile) in un unico controllo

### Nel styleMapper

```typescript
styleMapper: (style, block, project, viewport) => {
  const { vars } = getBaseStyleVars(style, block, project, viewport);
  // viewport è già gestito da getBaseStyleVars
  return { ...vars, '--custom': toPx(val('myKey', 20)) };
}
```

---

## 10. Componenti Sidebar Disponibili

Tutti importabili da `'../SharedSidebarComponents'`:

### UI Base

| Componente | Scopo |
|---|---|
| `UnifiedSection` | Sezione accordion per la sidebar |
| `useUnifiedSections()` | Hook: stato apertura + listener canvas |
| `CategoryHeader` | Etichetta di gruppo tra sezioni |
| `ManagerWrapper` | Wrapper per nascondere header interni dei manager |
| `SimpleInput` | Campo testo con label e icona opzionale |
| `RichTextarea` | Editor rich text (TipTap) con toolbar |
| `SimpleSlider` | Slider numerico |
| `TypographyFields` | Font size, bold, italic, tag selector (h1–h6, p) |
| `SectionHeader` | Header interno di una sezione |
| `IconManager` | Selettore icone Lucide |

### Manager Condivisi

| Componente | Scopo |
|---|---|
| `LayoutFields` | Padding, allineamento, margini, max-width |
| `LayoutGridSlider` | Colonne responsive (desktop/tablet/mobile) |
| `ColorManager` | Colori sfondo/testo con switch gradiente |
| `BackgroundManager` | Immagine sfondo, overlay, blur, brightness |
| `PatternManager` | Pattern decorativi (dots, grid, waves, ecc.) |
| `BorderShadowManager` | Bordi, border-radius, ombre |
| `CTAManager` | Pulsanti (label, URL, tema, stile custom) |
| `AnimationManager` | Tipo animazione, durata, delay |
| `AnchorManager` | ID ancora per link interni |
| `SocialLinksManager` | Link social con icone |
| `LinkListManager` | Lista link generica |
| `ImageStyleFields` | Stile immagine (aspect ratio, fit, radius) |
| `AdvancedMargins` | Margini avanzati top/bottom |

---

## 11. Interattività e Generazione Statica

### Regole fondamentali

1. **NO `"use client"`** nei componenti visuali
2. **NO hook React** (`useState`, `useEffect`, `useRef`)
3. **HTML nativo** per interattività: `<details>`/`<summary>` per accordion, `data-*` per toggle
4. **`isStatic` prop** per differenziare editor vs sito live

### Interattività disponibile nel sito pubblicato

| Pattern | Come | Esempio d'uso |
|---|---|---|
| Accordion | `<details>` + `<summary>` | FAQ |
| Menu mobile | `data-menu-toggle` + script in `generate-static.tsx` | Navigation |
| Slider | scroll-container + `data-arrow` + script inline | Cards, Gallery |
| Animazioni | `data-siti-anim` + IntersectionObserver (script statico) | Qualsiasi blocco |

### InlineEditable in contesto statico

`InlineEditable` è `'use client'` ma è sicuro nei blocchi visuali perché:
- Viene renderizzato **solo quando `onInlineEdit` esiste** (editor)
- In modalità statica `onInlineEdit` è `undefined` → viene renderizzato `dangerouslySetInnerHTML`
- Il percorso statico non incontra mai il componente client

---

## 12. Immagini

### Componente SitiImage

Usa sempre `SitiImage` invece di `<img>` diretto:

```tsx
import { SitiImage } from '@/components/shared/SitiImage';

// Immagine standard (lazy)
<SitiImage src={content.image} alt={content.imageAlt} project={project} imageMemoryCache={imageMemoryCache} />

// Immagine hero above-the-fold (eager + high priority)
<SitiImage src={content.image} alt={content.imageAlt} project={project} imageMemoryCache={imageMemoryCache} loading="eager" fetchPriority="high" />
```

### Ottimizzazione automatica

| Aspetto | Comportamento |
|---|---|
| Formato | Convertite in WebP durante l'upload (`optimizeImageToWebP`) |
| Dimensione max | 2400px di lato, qualità progressiva (82% → riduzione se > 1.8MB) |
| Naming | Hash SHA256 → `img_[hash].webp` |
| Storage | Supabase Storage → scaricate in `/assets/` durante deploy |
| Build statica | `<link rel="preload" as="image">` per immagini Hero nel `<head>` |

### Per loghi e avatar (quando SitiImage non è pratico)

```tsx
<img src={resolveImageUrl(content.logo, project)} alt="Logo" loading="lazy" decoding="async" />
```

---

## 13. Best Practices

### CSS Variables obbligatorie

Non usare mai valori fissi se il valore deve cambiare su mobile:

| Variabile | Scopo |
|---|---|
| `var(--block-pt)` / `var(--block-pb)` | Padding verticale |
| `var(--block-px)` | Padding orizzontale |
| `var(--block-gap)` | Gap tra elementi |
| `var(--block-bg)` | Colore di sfondo |
| `var(--block-color)` | Colore testo |
| `var(--block-items)` | `align-items` |
| `var(--block-align)` | `text-align` |
| `var(--block-justify)` | `justify-content` |
| `var(--title-fs)` | Font size titolo |
| `var(--subtitle-fs)` | Font size sottotitolo |
| `var(--item-title-fs)` | Font size titolo item |

### Bordi e separatori adattivi

Usa `color-mix` per bordi che si adattano a light e dark:

```css
border-color: color-mix(in srgb, currentColor 8%, transparent)
```

### No padding/margin hardcoded

**MAI** inserire classi Tailwind come `px-8`, `mb-12`, `gap-6` nei componenti visuali. Tutto deve essere controllabile dall'utente via CSS variables.

### Conferme e notifiche

```typescript
// Modali di conferma → NON usare window.confirm
import { confirm } from '@/components/shared/ConfirmDialog';

// Toast → NON usare alert()
import { toast } from '@/components/shared/Toast';
```

Entrambi sono montati globalmente in `GlobalDialogs` (root layout).

### Pattern decorativi

- Colore default: `#000000` (visibile su sfondo chiaro)
- Opacità consigliata: 5–12 (mai sopra 15)
- `BlockBackground` gestisce il rendering automaticamente

---

## 14. File di Riferimento

### Tipi e Interfacce
- [`types/editor.ts`](../types/editor.ts) — `BlockType`, `Block`, `Page`, `Project`, `SiteGlobal`
- [`types/block-definition.ts`](../types/block-definition.ts) — `BlockDefinition`, `BlockVariant`

### Logica Core
- [`lib/block-definitions.ts`](../lib/block-definitions.ts) — `BLOCK_DEFINITIONS`, `getBlockLibrary()`, `getBlockDefinition()`
- [`lib/base-style-mapper.ts`](../lib/base-style-mapper.ts) — `getBaseStyleVars()` — genera le CSS vars standard
- [`lib/hooks/useBlockStyles.ts`](../lib/hooks/useBlockStyles.ts) — `getBlockStyles()` — merge stile per viewport
- [`lib/utils.ts`](../lib/utils.ts) — `formatRichText()`, `toPx()`, `formatLink()`

### Componenti Condivisi
- [`components/blocks/sidebar/SharedSidebarComponents.tsx`](../components/blocks/sidebar/SharedSidebarComponents.tsx) — Re-export di tutti i componenti sidebar
- [`components/shared/InlineEditable.tsx`](../components/shared/InlineEditable.tsx) — Editing testo inline dal canvas
- [`components/shared/SitiImage.tsx`](../components/shared/SitiImage.tsx) — Wrapper immagine ottimizzato
- [`components/shared/BlockBackground.tsx`](../components/shared/BlockBackground.tsx) — Sfondo con immagine/overlay/pattern
- [`components/shared/ConfirmDialog.tsx`](../components/shared/ConfirmDialog.tsx) — Modali di conferma custom
- [`components/shared/Toast.tsx`](../components/shared/Toast.tsx) — Notifiche toast custom

### Blocchi Esistenti (esempi da cui imparare)
- [`components/blocks/visual/Hero.definition.tsx`](../components/blocks/visual/Hero.definition.tsx) — Esempio con varianti e styleMapper
- [`components/blocks/visual/CardsBlock.tsx`](../components/blocks/visual/CardsBlock.tsx) — Esempio con slider, colonne responsive, inline editing
- [`components/blocks/visual/Benefits.definition.tsx`](../components/blocks/visual/Benefits.definition.tsx) — Esempio con preview SVG e varianti
- [`components/blocks/sidebar/block-editors/Navigation.tsx`](../components/blocks/sidebar/block-editors/Navigation.tsx) — Esempio editor sidebar complesso

### Generazione Statica e Deploy
- [`lib/generate-static.tsx`](../lib/generate-static.tsx) — Generazione HTML per ogni pagina
- [`app/actions/deploy.ts`](../app/actions/deploy.ts) — Pipeline deploy su Cloudflare Pages
