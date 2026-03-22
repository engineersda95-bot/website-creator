import {
  Plus,
  Palette,
  ShieldCheck,
  BarChart3,
  Pointer,
  Smartphone,
  Layout
} from 'lucide-react';

export interface HelpDoc {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: any;
  category: 'basi' | 'legale' | 'marketing';
}

export const HELP_DOCS: HelpDoc[] = [
  {
    id: 'primi-passi',
    category: 'basi',
    icon: Pointer,
    title: 'Creazione Sito: Primi Passi',
    description: 'Tutto quello che devi sapere per iniziare a comporre la tua pagina da zero.',
    content: `
      Creare il tuo sito è un processo visivo e immediato:
      1. **Aggiungi Blocchi**: Cerca il tasto "+" tra le sezioni per inserire nuovi elementi (Testo, Immagini, Hero).
      2. **Modifica Diretta**: Clicca su un elemento per aprire le sue opzioni sulla destra; qui puoi cambiare testi e immagini.
      3. **Ordina le Sezioni**: Usa le frecce su/giù per riorganizzare la struttura della pagina.
      4. **Pubblicazione**: Una volta pronto, il tasto pubblica renderà il sito raggiungibile sul tuo dominio!
      
    `
    //[youtube:VIDEO_ID_ESEMPIO] -> per embeddare un video youtube in una guida
  },
  {
    id: 'design-globale',
    category: 'basi',
    icon: Palette,
    title: 'Stile e Identità del Sito',
    description: 'Personalizza i colori, i font e l\'atmosfera del sito in modo centralizzato.',
    content: `
      Per cambiare l'aspetto di tutto il sito in un colpo solo, usa **"Stili Globali"** (l'icona ingranaggio):
      - **Caratteri**: Imposta il font principale per titoli e testi.
      - **Atmosfera**: Scegli tra tema Chiaro (Light) o Scuro (Dark).
      - **Colori**: Definisci il colore dei pulsanti e dello sfondo generale.
      - **Pulsanti**: Personalizza bordi, ombre e arrotondamento per un look coerente.
    `
  },
  {
    id: 'cookie-privacy',
    category: 'legale',
    icon: ShieldCheck,
    title: 'Gestione Cookie e Privacy Policy',
    description: 'Come integrare un sistema di gestione cookie (es. CookieYes) per essere a norma.',
    content: `
      Per rendere il sito conforme alle normative, puoi integrare servizi esterni. Ecco un esempio con **CookieYes**:
      1. Registrati su una piattaforma di gestione cookie (es. CookieYes, Iubenda, etc.).
      2. Configura il tuo banner e copia il codice di installazione fornito.
      3. Nell'editor, vai su **"Stili Globali"** -> **"Avanzate & Script"**.
      4. Incolla il codice nel campo **"Script di Intestazione (HEAD)"**.
      5. Salva e pubblica: il banner apparirà automaticamente sul tuo sito live.
    `
  },
  {
    id: 'analytics-firebase',
    category: 'marketing',
    icon: BarChart3,
    title: 'Analisi delle Visite e Statistiche',
    description: 'Monitora l\'andamento del tuo sito usando strumenti come Firebase Analytics.',
    content: `
      Per analizzare il traffico e capire chi visita il tuo sito, puoi usare strumenti professionali come **Firebase Analytics**:
      1. Crea un account su una piattaforma di analisi (es. Google Firebase o simili).
      2. Ottieni lo script di tracciamento per il web.
      3. Vai su **"Stili Globali"** -> **"Avanzate & Script"**.
      4. Incolla il codice nel campo **"Script di Chiusura (BODY)"**.
      *Suggerimento: Inserire questi script nel Body aiuta a non rallentare l'apertura iniziale del sito.*
    `
  },
  {
    id: 'mobile-tablet',
    category: 'basi',
    icon: Smartphone,
    title: 'Visualizzazione Mobile e Tablet',
    description: 'Controlla e adatta il design per chi naviga da smartphone.',
    content: `
      Oltre il 70% degli utenti naviga da cellulare!
      - Sostituisci la vista usando le icone monitor/tablet/cellulare in alto.
      - Molti parametri (come margini e dimensioni testo) possono essere diversi per ogni dispositivo.
      - Verifica sempre che le immagini siano ben leggibili anche su schermi piccoli.
    `
  }
];

