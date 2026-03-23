# Guida Completa alla Creazione di Nuovi Moduli (Blocchi)

Questa guida spiega i passaggi necessari per aggiungere un nuovo blocco alla libreria, garantendo la coerenza con il sistema di editing (Content & Style), la struttura della pagina e la generazione statica tramite il nuovo sistema centralizzato.

> [!IMPORTANT]
> Quando si aggiunge o si modifica un componente, modifica **SOLO** i file indicati in questa guida. Non modificare altri file di sistema a meno di specifica richiesta (eccezione fatta per la creazione di nuovi "Shards" in `SharedSidebarComponents.tsx`).

---

## 🛠 Passaggi per l'Aggiunta di un Nuovo Blocco

### 1. Definizione del Tipo (Type)
Aggiungi il nuovo tipo di blocco all'enum `BlockType` in `types/editor.ts`.

```typescript
// types/editor.ts
export type BlockType = 
  'hero' | 
  'text' |
  'divider' |
  // ...
  'nuovo-blocco'; // <--- Passaggio obbligatorio
```

### 2. Creazione della Parte Visuale (Frontend)
Crea il componente visuale in `components/blocks/visual/[NomeBlocco].tsx`.
- Deve accettare le props standard (`block`, `project`, `viewport`, etc.).
- **Importante**: Usa le variabili CSS generate dal sistema (es: `var(--block-pt)`, `--block-bg`, `--block-color`) per garantire che lo stile sia responsive e coerente.

### 3. Creazione dell'Editor Sidebar (Content & Style)
Crea i due componenti per la gestione nella sidebar in `components/blocks/sidebar/block-editors/`:
- `[NomeBlocco]Content.tsx`: Campi per i dati (es. `RichTextarea`, `ImageUpload`).
- `[NomeBlocco]Style.tsx`: Controlli estetici (usa `LayoutFields`, `ColorManager`, etc.).

> [!TIP]
> Utilizza i componenti pronti in `components/blocks/sidebar/SharedSidebarComponents.tsx`.

### 4. Registrazione Centrale (Il Cuore del Sistema) 🚀
Tutta la logica di integrazione è ora centralizzata in `lib/block-definitions.ts`. **Non è più necessario** modificare manualmente `BlockRegistry`, `ConfigSidebar`, `BlockSidebar` o `generate-static`.

Aggiungi la definizione del tuo blocco nell'oggetto `BLOCK_DEFINITIONS`:

```typescript
// lib/block-definitions.ts
'nuovo-blocco': {
  type: 'nuovo-blocco',
  label: 'Etichetta Visibile',
  icon: IconaLucide, // Importata da lucide-react
  visual: ComponenteVisual, // Il file creato al punto 2
  contentEditor: ComponenteContent, // Il file creato al punto 3
  styleEditor: ComponenteStyle,
  defaults: {
    content: { /* Dati iniziali */ },
    style: { padding: 80, align: 'center' }
  }
},
```

### 5. Inserimento nella Libreria
Per far apparire il blocco nella "Libreria Blocchi" (sidebar sinistra) e tra le opzioni del tasto "+" (canvas), aggiungilo alla funzione `getBlockLibrary()` nello stesso file:

```typescript
// lib/block-definitions.ts
export const getBlockLibrary = () => {
  return [
    BLOCK_DEFINITIONS.navigation,
    BLOCK_DEFINITIONS.hero,
    // ...
    BLOCK_DEFINITIONS['nuovo-blocco'], // <--- Aggiungi qui
    BLOCK_DEFINITIONS.footer,
  ];
};
```

---

## 📱 Gestione Responsive (Mobile & Tablet)

Il sistema gestisce automaticamente la differenziazione degli stili per viewport.

1.  **Recupero Valori**: Nei componenti Style della sidebar, usa sempre la prop `getStyleValue(key, defaultValue)`. Questa funzione recupera automaticamente il valore specifico per il viewport attivo o fa il fallback su Desktop.
2.  **Salvataggio**: `updateStyle({ key: value })` salva i dati in `block.style` (Desktop) o `block.responsiveStyles[viewport]` (Mobile/Tablet).
3.  **Variabili CSS**: Se aggiungi nuove proprietà di stile (es. `dividerStroke`), ricordati di registrarle in `lib/responsive-utils.ts` nella funzione `getBlockCSSVariables` per renderle disponibili come variabili CSS responsive.

---

## 🎨 Componenti Sidebar Standardizzati (Shards)

Usa sempre i componenti in `SharedSidebarComponents.tsx` per un design premium:

| Componente | Scopo |
| :--- | :--- |
| `TypographyFields` | Font-size, grassetto, corsivo, trasformazione testo. |
| `ColorManager` | Selettore colore sfondo e testo (con reset intelligente). |
| `LayoutFields` | Padding, Allineamento, Margini, Max-Width. |
| `CTAManager` | Configurazione pulsanti (Testo, Link, Tema). |
| `ImageUpload` | Caricamento immagini con preview e status SEO. |
| `BackgroundManager` | Immagini di sfondo, opacità, blur e overlay colorati. |
| `BorderShadowManager` | Bordi, arrotondamento (border-radius) e ombre. |
| `RichTextarea` | Area di testo con formattazione rapida. |
| `SimpleSlider` | Slider numerico uniforme per Gap, Dimensioni, etc. |
| `SimpleInput` | Campo testo con supporto icona nativa. |

---

## ⚡️ Interattività e Generazione Statica

I blocchi visuali devono essere compatibili con la **generazione statica (pure HTML)**. Poiché il sito finale pubblicato non carica la libreria React nel browser (per massimizzare la velocità), la gestione dell'interattività segue regole precise:

### 1. Evitare `"use client"` nei Blocchi Visuali
**NON** contrassegnare il file del blocco visuale (`components/blocks/visual/[NomeBlocco].tsx`) come `"use client"`. L'uso di hook di React (`useState`, `useEffect`) durante la generazione statica tramite `renderToStaticMarkup` causerebbe un errore di deployment.

### 2. Metodi per l'Interattività (Accordion, Menu, Toggle)

*   **Approccio Preferito: HTML Nativo 🥇**
    Usa elementi HTML5 nativi come `<details>` e `<summary>` (per FAQ/Accordion). Sono **100% modulari**, funzionano senza script sia nell'Editor che nel sito statico e garantiscono coerenza totale tra Preview e Live.
*   **Approccio Secondario: Vanilla JavaScript & Data Attributes**
    Usa attributi `data-*` (es. `data-menu-toggle`) e gestisci la logica con JavaScript standard all'interno di un componente Script centralizzato o tramite iniezione controllata.

### 3. Differenziazione Editor vs Statico
Se hai bisogno di una logica React complessa per l'Editor ma non per il sito statico, usa la prop `isStatic` per separare i comportamenti:

```tsx
{isStatic ? (
  <button data-toggle>Clicca (Statico)</button>
) : (
  <ClientInteractiveComponent /> // Componente separato con "use client"
)}
```

---

## 💡 Best Practices per Senior Engineer (Responsività & LIVE)

Per garantire che un modulo funzioni perfettamente sia nell'editor che nel sito **LIVE**, segui queste regole ferree:

### 1. Usa SEMPRE le Variabili CSS per la Responsività
Non applicare mai valori fissi (es. `100px`) direttamente nello `style` se quel valore deve cambiare su mobile. Usa le variabili standard gestite dal sistema:
- Spaziature: `var(--block-pt)`, `var(--block-px)`, `var(--block-gap)`
- Allineamento: `var(--block-items)`, `var(--block-align)`, `var(--block-ml-auto)`
- Tipografia: `var(--title-fs)`, `var(--subtitle-fs)`, `var(--label-fs)`

### 2. Evita Sovrascritture Inline in Modalità Statica
In `generate-static.tsx`, le media query iniettano i valori corretti per le variabili CSS. Se il tuo componente definisce lo stesso valore `inline` (nell'oggetto `style` di React), questo vincerà sulle media query, rompendo la responsività nel sito Live.
**Esempio Corretto (ContactBlock):**
```tsx
const contactStyles = !isStatic ? {
  '--map-width': `${style.mapWidth}%`,
} : {}; // Lascia che il CSS statico faccia il suo lavoro nel live
```

### 3. Gestione Mappa & Iframe
Per i moduli con WebVitals o Embed (Google Maps), assicurati di usare `aspect-video` e limitare la larghezza con `maxWidth: var(--map-width)`. Centra sempre con `marginLeft: var(--block-ml-auto)`.

### 4. Niente Hardcoding di Margini
**MAI** inserire margini o padding fissi (es. `px-8`, `mb-12`) nel codice del componente visuale. Ogni spazio deve essere controllabile dall'utente tramite le variabili CSS standard.