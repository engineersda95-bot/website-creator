# Organizzazione Progetto & Regole di Sviluppo

Questa guida definisce dove posizionare i file e quali regole seguire per mantenere il progetto ordinato e scalabile.

---

## 📁 Struttura delle Cartelle

### `components/blocks/visual/`
**Cosa mettere qui**: I componenti React che renderizzano il blocco nel frontend (Preview e Live).
- **Regole**: 
    - Devono essere compatibili con la generazione statica (no `use client`).
    - Devono usare le variabili CSS per lo stile (es: `var(--block-pt)`).
    - Insieme al `.tsx` del blocco, deve esserci il file `[Nome].definition.ts`.

### `components/blocks/visual/[Nome]/` (OPZIONALE)
**Cosa mettere qui**: Sottocomponenti specifici di un blocco complesso (es: `MobileMenu.tsx` per `Navigation`).
- **Regole**: Solo se il blocco ha più di 2-3 file interni. Se è un blocco semplice, tieni i file nella root di `visual`.

### `components/blocks/sidebar/block-editors/`
**Cosa mettere qui**: I componenti di editing specifici per ogni blocco.
- **[Nome]Content.tsx**: Editor dei testi, immagini, link.
- **[Nome]Style.tsx**: Editor estetico (padding, colori, etc.).

### `components/blocks/sidebar/ui/`
**Cosa mettere qui**: Componenti UI "stupidi" (stateless) riutilizzabili nella sidebar.
- **Esempi**: `SimpleSlider`, `SimpleInput`, `RichTextarea`.
- **Regola**: Non devono avere logica di stato interna complessa, solo props e callback.

### `components/blocks/sidebar/managers/`
**Cosa mettere qui**: Componenti "intelligenti" (stateful) che raggruppano logica di editing comune.
- **Esempi**: `ColorManager`, `BackgroundManager`, `LayoutFields`.
- **Regola**: Devono implementare le interfacce di `types/sidebar.ts`.

### `lib/`
**Cosa mettere qui**: Utility, core logic e motori di generazione.
- **`base-style-mapper.ts`**: Il motore che trasforma gli stili comuni in variabili CSS.
- **`generate-static.tsx`**: Logica di esportazione HTML/CSS per il sito statico.
- **`image-utils.ts`**: Gestione URL immagini e ottimizzazione.

### `types/`
**Cosa mettere qui**: Definizioni TypeScript globali.
- **`editor.ts`**: Tipi core (Block, Page, Project).
- **`sidebar.ts`**: Tipi per i componenti della sidebar.

---

## 🛡 Regole d'Oro per "No Regression"

1. **Mai Hardcoding**: Se vedi un valore fisso (es: `padding: 100px`) nel CSS di un componente visuale, stai sbagliando. Usa le variabili CSS.
2. **Definizioni Decentralizzate**: Quando aggiungi una prop di stile, modificala SOLO nel `definition.ts` del blocco e nel suo `Style.tsx`. Non toccare i file globali.
3. **Consistenza Variabili**: Se un blocco usa `--image-aspect`, non chiamarlo `--img-ratio` in un altro. Mantieni i nomi standard.
4. **Static Performance**: Ricorda che il sito finale è Vanilla HTML/CSS. Qualsiasi logica JS complessa deve essere gestita con attributi `data-*` o iniezione di script, non con React hooks.
