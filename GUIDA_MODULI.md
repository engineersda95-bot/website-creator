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

---

## 💡 Best Practices per Senior Engineer

1.  **Defaults Solidi**: Definisci sempre degli stati iniziali (`defaults`) ricchi in `block-definitions.ts`. Un blocco appena aggiunto deve sembrare già "finito".
2.  **Astrazione**: Se crei un nuovo controllo nella sidebar che potrebbe servire ad altri blocchi, crealo come "Shard" in `SharedSidebarComponents.tsx`.
3.  **Niente Stili Inline**: Evita `style={{...}}` nei componenti visual per proprietà responsive. Usa le variabili CSS (es. `width: var(--mio-parametro)`).
4.  **Pulizia**: Se rimuovi un blocco, ricordati di pulire la sua definizione in `lib/block-definitions.ts` per mantenere il bundle leggero.
