# Guida Completa alla Creazione di Nuovi Moduli (Blocchi)

Questa guida spiega i passaggi necessari per aggiungere un nuovo blocco alla libreria, garantendo la coerenza con il sistema di editing (Content & Style), la preview real-time e la generazione statica.

## 🛠 Passaggi per l'Aggiunta di un Nuovo Blocco

### 1. Definizione del Tipo (Type)
Aggiungi il nuovo tipo di blocco all'enum `BlockType` in `types/editor.ts`.

```typescript
// types/editor.ts
export type BlockType = 
  'hero' | 
  // ...
  'nuovo-blocco'; // <--- Aggiungi qui
```

### 2. Creazione della Parte Visuale (Frontend)
Crea il componente visuale in `components/blocks/visual/[NomeBlocco].tsx`.
- Deve accettare `content`, `block`, `project`, `isStatic`, etc.
- Deve usare le variabili CSS per lo stile (es: `var(--text-color)`, `var(--bg-color)`).

### 3. Registrazione nel Registry
Registra il componente visuale in `components/blocks/BlockRegistry.tsx`.

```typescript
// components/blocks/BlockRegistry.tsx
import { NuovoBlocco } from './visual/NuovoBlocco';

const registries: Record<BlockType, React.FC<any>> = {
  // ...
  'nuovo-blocco': NuovoBlocco,
};
```

### 4. Creazione dell'Editor Sidebar (Content & Style)
Crea due file in `components/blocks/sidebar/block-editors/`:
- `[NomeBlocco]Content.tsx`: Gestisce i dati del blocco (testi, immagini).
- `[NomeBlocco]Style.tsx`: Gestisce l'aspetto (padding, colori, allineamento).

> [!TIP]
> Utilizza i componenti in `components/blocks/sidebar/SharedSidebarComponents.tsx`.
> Se noti che un set di campi si ripete tra più blocchi, aggiungilo come nuovo componente in questo file.

### 5. Integrazione nel ConfigSidebar
Aggiorna `components/blocks/ConfigSidebar.tsx` per mappare il nuovo tipo di blocco ai suoi editor.

### 6. Aggiunta alla Libreria Blocchi (Sidebar & Canvas)
Per rendere il blocco selezionabile dall'utente, aggiungilo in due posti:
1.  **BlockSidebar**: In `components/blocks/BlockSidebar.tsx`, aggiungi all'array `blockLibrary`.
2.  **EditorCanvas**: In `components/blocks/EditorCanvas.tsx`, aggiungi all'array `INSERT_OPTIONS`.

### 7. Generazione Statica
Aggiungi il componente al registry in `lib/generate-static.tsx`. Questo è fondamentale affinché il blocco appaia nel sito pubblicato.

---

## 📱 Gestione Responsive (Mobile & Tablet)

Il sistema gestisce automaticamente la differenziazione degli stili per viewport.

1.  **Recupero Valori**: Nei componenti Style della sidebar, usa sempre la prop `getStyleValue(key, defaultValue)`. Questa funzione recupera automaticamente il valore specifico per il viewport attivo (se impostato) o fa il fallback sul valore desktop.
2.  **Salvataggio**: Quando chiami `updateStyle({ key: value })`, lo store salva il valore in:
    - `block.style` se il viewport è **Desktop**.
    - `block.responsiveStyles[viewport]` se il viewport è **Tablet** o **Mobile**.
3.  **Visualizzazione**: Il componente `EditorCanvas` e l'utilità `generateBlockCSS` (in `lib/responsive-utils.ts`) si occupano di generare le Media Queries CSS necessarie basandosi su questi dati.

---

## 🎨 Componenti Sidebar Standardizzati (Shards)

Per mantenere un design premium e coerente, usa sempre i componenti in `SharedSidebarComponents.tsx`:

| Componente | Scopo |
| :--- | :--- |
| `TypographyFields` | Gestione font-size, grassetto, corsivo. |
| `ColorManager` | Selettore colore sfondo e testo (con reset a globale). |
| `LayoutFields` | Padding verticale, orizzontale, allineamento e margini avanzati. |
| `CTAManager` | Configurazione pulsanti (Testo, Link, Tema Primario/Secondario). |
| `ImageUpload` | Gestione caricamento immagini (con preview e caching). |
| `BackgroundManager` | Gestione immagine di sfondo, opacità, blur e overlay. |
| `BorderShadowManager` | Controllo bordi, arrotondamento e ombre. |
| `RichTextarea` | Area di testo con supporto base per grassetto/corsivo. |
| `SocialLinksManager` | Lista dinamica di icone social con selettore piattaforma. |
| `LinkListManager` | Lista dinamica di link testuali (es. per footer o menu). |
| `IconManager` | Selettore icone da una libreria predefinita (Lucide). |
| `SimpleInput` | Campo di testo standard con design coerente. |

---

## 💠 Creazione di Nuovi "Shards"

Se un componente della sidebar può essere riutilizzato in futuro:
1.  Aggiungilo in `components/blocks/sidebar/SharedSidebarComponents.tsx`.
2.  Esponilo come componente standalone.
3.  Referenzialo nei vari `block-editors`.
4.  Standardizza le props (es. `selectedBlock`, `updateContent`, `updateStyle`, `getStyleValue`).

---

## 💡 Best Practices

1.  **Coerenza**: Ogni blocco dovrebbe avere almeno `LayoutFields`, `ColorManager` e `BorderShadowManager` nel tab "Stile".
2.  **Media Queries Centralizzate**: Non scrivere stili inline per il responsive nei componenti visual. Usa le variabili CSS generate da `lib/responsive-utils.ts`.
3.  **Default States**: In `lib/templates.ts` e nello store `useEditorStore.ts` (funzione `addBlock`), definisci degli stati iniziali sensati per il nuovo blocco.
