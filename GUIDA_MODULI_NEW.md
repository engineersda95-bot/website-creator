# Guida Completa alla Creazione di Nuovi Moduli (Blocchi)

Questa guida spiega i passaggi necessari per aggiungere un nuovo blocco alla libreria, garantendo la coerenza con il sistema di editing, la struttura della pagina e la generazione statica.

> [!IMPORTANT]
> Quando si aggiunge o si modifica un componente, modifica *SOLO* i file indicati in questa guida. Non modificare altri file di sistema a meno di specifica richiesta.

---

## Architettura del Sistema


types/editor.ts                          → Tipi BlockType, Block
types/block-definition.ts                → Interfaccia BlockDefinition, BlockVariant
lib/block-definitions.ts                 → Registry centrale + getBlockLibrary()
components/blocks/visual/                → Componenti visuali (NO "use client")
components/blocks/visual/*.definition.*  → Configurazione blocco (defaults, styleMapper, variants, unifiedEditor)
components/blocks/sidebar/block-editors/ → Editor sidebar (Content, Style, Unified)
components/blocks/sidebar/              → Componenti condivisi (UnifiedSection, SharedSidebarComponents)
components/shared/                       → Componenti globali (InlineEditable, CTA, SitiImage, Toast, ConfirmDialog)
lib/generate-static.tsx                  → Generatore HTML statico
app/actions/deploy.ts                    → Pipeline deploy su Cloudflare Pages


---

## 🛠 Passaggi per l'Aggiunta di un Nuovo Blocco

### 1. Definizione del Tipo
Aggiungi il nuovo tipo all'enum BlockType in types/editor.ts:

typescript
export type BlockType =
  'hero' | 'text' | ... | 'nuovo-blocco';


### 2. Componente Visuale
Crea components/blocks/visual/[NomeBlocco].tsx.

*Regole:*
- *NO* "use client" — deve funzionare con renderToStaticMarkup
- *NO* hook React (useState, useEffect, useRef)
- *NO* margini/padding hardcoded — usa variabili CSS (var(--block-pt), var(--block-px), etc.)
- Accetta le props standard: block, project, viewport, isStatic, imageMemoryCache, onInlineEdit
- Usa getBlockStyles(block, project, viewport) per ottenere stili mergiati
- Usa formatRichText() per testi con formattazione
- Usa SitiImage per immagini (lazy loading automatico)
- Usa InlineEditable per testi editabili inline (condizionato a onInlineEdit)
- Aggiungi data-sidebar-section="xxx" agli elementi per collegare canvas → sidebar

*Esempio minimo:*
tsx
import React from 'react';
import { formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';

export const MioBlocco = ({ content, block, project, viewport, isStatic, onInlineEdit }) => {
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
          <InlineEditable value={content.title || ''} onChange={(v) => onInlineEdit('title', v)} fieldId="title" placeholder="Titolo..." />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }} />
        )}
      </div>
    </section>
  );
};


### 3. Sistema Varianti (Opzionale)
Se il blocco supporta layout diversi con gli stessi dati:

1. Aggiungi variant a content (es. content.variant: 'cards' | 'minimal' | 'list')
2. Nel componente visuale, switcha il rendering in base a content.variant
3. Le varianti cambiano *solo la forma dell'item*, non il container (grid/slider resta invariato)
4. Definisci le varianti nella definition con preview SVG

typescript
// Nel .definition.tsx
variants: [
  { id: 'cards', label: 'Cards', description: '...', preview: PreviewCards },
  { id: 'minimal', label: 'Minimal', description: '...', preview: PreviewMinimal },
],


Le preview sono componenti React che renderizzano un <svg viewBox="0 0 200 120"> wireframe.

> [!NOTE]
> Se il blocco ha varianti, al momento dell'inserimento dalla sidebar si apre un *VariantPicker* modale. L'utente sceglie la variante e il blocco viene inserito con content.variant preimpostato. La variante si cambia anche dalla sidebar unified.

### 4. Inline Editing
Per permettere la modifica diretta dal canvas:

1. Il componente riceve onInlineEdit?: (field: string, value: string) => void come prop
2. Se onInlineEdit esiste (editor), renderizza InlineEditable; altrimenti (statico) renderizza dangerouslySetInnerHTML
3. Aggiungi fieldId="xxx" all'InlineEditable per collegare canvas → sidebar
4. Per campi rich text, usa richText e multiline props
5. Per CTA, usa la prop onLabelChange + fieldId sul componente CTA
6. Per campi non editabili inline, aggiungi data-sidebar-section="xxx" per il collegamento al doppio click

*Il sistema emette CustomEvent('block-section-focus') → il hook useUnifiedSections() ascolta e apre la sezione corrispondente nella sidebar.*

### 5. Editor Sidebar Unificato
Crea components/blocks/sidebar/block-editors/[NomeBlocco]Unified.tsx.

*Struttura standard:*
tsx
'use client';

import { UnifiedSection as Section, useUnifiedSections, CategoryHeader, ManagerWrapper } from '../UnifiedSection';

export const MioBloccoUnified = ({ selectedBlock, updateContent, updateStyle, getStyleValue, project }) => {
  const { openSection, toggleSection } = useUnifiedSections();
  const content = selectedBlock.content;

  return (
    <div>
      {/* Variant selector (se il blocco ha varianti) */}
      <div className="px-5 py-4 border-b border-zinc-100">...</div>

      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput ... />
        <TypographyFields ... />
      </Section>

      <Section icon={List} label="Elementi" id="items" isOpen={openSection === 'items'} onToggle={toggleSection}>
        {/* Lista item con add/remove/reorder */}
      </Section>

      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields ... />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        {/* Colori inline + BackgroundManager + PatternManager */}
      </Section>

      <Section icon={Play} label="Animazioni" id="animation" isOpen={openSection === 'animation'} onToggle={toggleSection}>
        <AnimationManager ... />
      </Section>

      <Section icon={Settings} label="Avanzate" id="advanced" isOpen={openSection === 'advanced'} onToggle={toggleSection}>
        <BorderShadowManager ... />
        <AnchorManager ... />
      </Section>
    </div>
  );
};


*Regole sidebar:*
- Usa UnifiedSection per le sezioni accordion (NO tab Content/Style separati)
- Usa CategoryHeader per i separatori di gruppo
- Usa ManagerWrapper per wrappare manager condivisi che hanno header interni (ColorManager, BackgroundManager, PatternManager)
- Le sezioni partono tutte chiuse — si aprono al click o dal canvas
- Per i colori inline: sfondo + testo su una riga + switch tinta unita/gradiente sotto

### 6. Definition File
Crea components/blocks/visual/[NomeBlocco].definition.tsx (usa .tsx se contiene preview SVG):

typescript
export const mioBloccoDefinition: BlockDefinition = {
  type: 'nuovo-blocco',
  label: 'Etichetta',
  icon: IconLucide,
  visual: MioBlocco,
  contentEditor: MioBloccoContent,    // Legacy (fallback se no unified)
  styleEditor: MioBloccoStyle,        // Legacy (fallback se no unified)
  unifiedEditor: MioBloccoUnified,    // Editor unificato (prioritario)
  defaults: {
    content: { variant: 'cards', title: '...', items: [...] },
    style: { padding: 80, align: 'center', titleTag: 'h2', animationType: 'none' }
  },
  variants: [...],                     // Opzionale
  styleMapper: (style, block, project, viewport) => {
    const { vars } = getBaseStyleVars(style, block, project, viewport);
    return { ...vars, '--mia-var': toPx(val('miaKey', '20px')) };
  }
};


### 7. Registrazione
Aggiungi import e riga in lib/block-definitions.ts:

typescript
import { mioBloccoDefinition } from '@/components/blocks/visual/MioBlocco.definition';

export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  ...
  'nuovo-blocco': mioBloccoDefinition,
};

export const getBlockLibrary = () => [
  ...
  BLOCK_DEFINITIONS['nuovo-blocco'],
  BLOCK_DEFINITIONS.footer,
];


---

## 📱 Gestione Responsive

1. *getStyleValue(key, default)* — recupera il valore per il viewport attivo (con fallback a desktop)
2. *updateStyle({ key: value })* — salva in block.style (desktop) o block.responsiveStyles[viewport]
3. *styleMapper* — converte proprietà in CSS variables, gestito automaticamente per viewport
4. *getBaseStyleVars()* — genera ~30 variabili CSS standard (padding, gap, align, colors, typography, etc.)

---

## 🎨 Componenti Sidebar Condivisi

Importa da ../SharedSidebarComponents:

| Componente | Scopo |
| :--- | :--- |
| SimpleInput | Campo testo con label e icona |
| RichTextarea | Editor rich text (TipTap) con toolbar |
| SimpleSlider | Slider numerico |
| TypographyFields | Font size, bold, italic, tag selector |
| LayoutFields | Padding, allineamento, margini, max-width |
| LayoutGridSlider | Colonne responsive (desktop/tablet/mobile) |
| ColorManager | Colori sfondo/testo con switch gradiente |
| BackgroundManager | Immagine sfondo, overlay, blur, brightness |
| PatternManager | Pattern decorativi (dots, grid, waves, etc.) |
| BorderShadowManager | Bordi, border-radius, ombre |
| CTAManager | Pulsanti (label, URL, tema, stile custom) |
| AnimationManager | Tipo animazione, durata, delay |
| AnchorManager | ID ancora per link interni |
| IconManager | Selettore icone Lucide |
| ImageUpload | Upload immagine con preview e alt text |

Da ../UnifiedSection:

| Componente | Scopo |
| :--- | :--- |
| UnifiedSection | Sezione accordion per sidebar unificata |
| useUnifiedSections() | Hook per stato apertura + listener canvas |
| CategoryHeader | Etichetta di gruppo ("Componenti", "Stile della Sezione") |
| ManagerWrapper | Wrapper per nascondere header interni dei manager condivisi |

---

## ⚡️ Interattività e Generazione Statica

### Regole Fondamentali
1. *NO "use client"* nei componenti visuali
2. *NO hook React* (useState, useEffect, useRef)
3. *HTML nativo* per interattivita: <details>/<summary> per accordion, data-* per toggle
4. *isStatic prop* per differenziare editor vs sito live

### Interattivita Disponibile
- *Accordion*: <details> + <summary> (FAQ, menu mobile)
- *Slider*: scroll-container + data-arrow + script inline iniettato
- *Menu mobile*: data-menu-toggle + script in generate-static.tsx
- *Animazioni*: data-siti-anim + IntersectionObserver in script statico

### InlineEditable (Solo Editor)
InlineEditable e un componente 'use client' importato nei blocchi visuali. Funziona perche:
- Viene renderizzato solo quando onInlineEdit esiste (editor)
- In modalita statica onInlineEdit e undefined → renderizza dangerouslySetInnerHTML
- Nessun hook nel percorso statico

---

## 🖼 Immagini

### Componente SitiImage
- loading="lazy" di default (override con loading="eager" per hero/above-fold)
- decoding="async" per non bloccare il main thread
- fetchPriority="high" sulle immagini Hero per priorita LCP
- In build statica: <link rel="preload" as="image"> per l'immagine Hero nel <head>

### Upload e Ottimizzazione
- Le immagini vengono convertite in WebP durante l'upload (optimizeImageToWebP)
- Max 2400px di lato, qualita progressiva (82% → riduzione se > 1.8MB)
- Hash SHA256 per naming (img_[hash].webp)
- Storage: Supabase Storage → download in /assets/ durante deploy

### Regole nei Blocchi Visuali
- Usa SitiImage per tutte le immagini (non <img> diretto)
- Per loghi/avatar dove SitiImage non e pratico, aggiungi loading="lazy" decoding="async"
- Specifica sempre alt text

---

## 🔤 Font

I font vengono caricati da Google Fonts con pesi ottimizzati:
- *Build statica*: wght@400;500;600;700;800 (5 pesi)
- *Editor*: ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700 (7 varianti)
- font-display: swap per evitare FOIT

---

## 🚀 Deploy e Build Statica

### Pipeline (app/actions/deploy.ts)
1. Fetch pagine da Supabase
2. Crea/verifica progetto Cloudflare Pages
3. Genera HTML statico per ogni pagina (generate-static.tsx)
4. Raccoglie asset referenziati (regex su HTML)
5. Genera sitemap.xml, robots.txt, _headers
6. Scarica asset da Supabase Storage
7. Compila CSS con Tailwind v4 standalone binary
8. Deploy via Wrangler CLI
9. Sync domini personalizzati
10. Cleanup vecchi deployment (mantiene ultimi 5)

### SEO Generato Automaticamente
- Canonical URL per pagina
- Hreflang alternates per multi-lingua
- Open Graph (title, description, image, type, locale)
- Twitter Card (summary_large_image)
- Schema.org JSON-LD (LocalBusiness/Restaurant)
- Sitemap XML con priorita e frequenza
- Robots.txt con regole per pagine non indicizzabili

### Headers di Cache (_headers)
- CSS/JS: Cache-Control: public, max-age=31536000
- Immagini: Cache-Control: public, max-age=31536000
- HTML: Cache-Control: public, max-age=0, must-revalidate

---

## 💡 Best Practices

### 1. Variabili CSS Obbligatorie
Non usare mai valori fissi se il valore deve cambiare su mobile:
- Spaziature: var(--block-pt), var(--block-px), var(--block-gap)
- Allineamento: var(--block-items), var(--block-align), var(--block-justify)
- Tipografia: var(--title-fs), var(--subtitle-fs), var(--item-title-fs)

### 2. No Sovrascritture Inline nel Statico
In generate-static.tsx, le media query settano le variabili CSS. Se il componente definisce lo stesso valore inline, vince l'inline e rompe la responsivita nel live:
tsx
// Corretto:
const styles = !isStatic ? { '--map-width': `${style.mapWidth}%` } : {};


### 3. No Hardcoding Margini/Padding
*MAI* inserire px-8, mb-12, gap-6 nei componenti visuali. Tutto deve essere controllabile dall'utente via CSS variables.

### 4. Bordi e Separatori Adattivi
Usa color-mix per bordi/separatori che si adattano a light e dark:
css
border-color: color-mix(in srgb, currentColor 8%, transparent)


### 5. Pattern Decorativi
- Colore default: #000000 (visibile su sfondo chiaro)
- Opacity consigliata: 5-12 (mai sopra 15)
- Il BlockBackground gestisce il rendering automaticamente

### 6. Conferme e Notifiche
- *confirm()*: Usa import { confirm } from '@/components/shared/ConfirmDialog' (modale custom, non window.confirm)
- *toast()*: Usa import { toast } from '@/components/shared/Toast' (toast custom, non alert())
- Entrambi montati globalmente in GlobalDialogs (root layout)
