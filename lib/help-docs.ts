import {
  Plus,
  Palette,
  ShieldCheck,
  BarChart3,
  Pointer,
  Smartphone,
  Layout,
  Keyboard,
  Search,
  Globe,
  Image,
  Rocket,
  FileText,
  Layers
} from 'lucide-react';

export interface HelpDoc {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: any;
  category: 'basi' | 'legale' | 'marketing' | 'avanzato';
}

export const HELP_CATEGORIES: Record<string, string> = {
  basi: 'Basi',
  avanzato: 'Avanzato',
  marketing: 'Marketing',
  legale: 'Legale',
};

export const HELP_DOCS: HelpDoc[] = [
  {
    id: 'primi-passi',
    category: 'basi',
    icon: Pointer,
    title: 'Creazione Sito: Primi Passi',
    description: 'Tutto quello che devi sapere per iniziare a comporre la tua pagina da zero.',
    content: `
      Creare il tuo sito è un processo visivo e immediato:

      1. **Aggiungi Blocchi**: Cerca il tasto "+" tra le sezioni nel canvas per inserire nuovi elementi come Testo, Immagini, Hero e altri.
      2. **Modifica Diretta**: Clicca su un blocco per aprire le sue opzioni nella sidebar destra. Puoi modificare contenuti nel tab "Contenuto" e l'aspetto nel tab "Stile".
      3. **Ordina le Sezioni**: Usa le frecce su/giù nella toolbar che appare al passaggio del mouse su ogni blocco.
      4. **Salva**: Clicca "Salva" nella barra in alto (o usa Ctrl+S) per non perdere le modifiche.
      5. **Pubblica**: Quando sei soddisfatto, clicca "Pubblica" per rendere il sito visibile a tutti!

      **Suggerimento**: Parti da un template preimpostato per avere una base già pronta, poi personalizza testi e immagini.
    `
  },
  {
    id: 'gestione-blocchi',
    category: 'basi',
    icon: Layers,
    title: 'Gestione dei Blocchi',
    description: 'Come aggiungere, duplicare, spostare e rimuovere i blocchi nella tua pagina.',
    content: `
      I blocchi sono i mattoncini del tuo sito. Ecco tutte le azioni disponibili:

      **Aggiungere un blocco:**
      - Clicca il pulsante "+" che appare tra i blocchi nel canvas
      - Oppure usa la **Libreria Blocchi** nella sidebar sinistra

      **Modificare un blocco:**
      - Clicca sul blocco nel canvas per selezionarlo
      - Le opzioni appaiono nella sidebar destra (Contenuto e Stile)

      **Azioni rapide** (toolbar al passaggio del mouse):
      - **Copia** (Ctrl+C): copia il blocco negli appunti
      - **Incolla** (Ctrl+V): incolla il blocco copiato
      - **Duplica** (Ctrl+D): crea una copia identica sotto il blocco originale
      - **Sposta Su/Giù**: riordina i blocchi nella pagina
      - **Elimina**: rimuove il blocco (con conferma)

      **Annulla/Ripristina:**
      - **Ctrl+Z**: annulla l'ultima azione
      - **Ctrl+Y** o **Ctrl+Shift+Z**: ripristina l'azione annullata
      - La cronologia tiene fino a 50 passaggi
    `
  },
  {
    id: 'design-globale',
    category: 'basi',
    icon: Palette,
    title: 'Stile e Identità del Sito',
    description: 'Personalizza colori, font e atmosfera del sito in modo centralizzato.',
    content: `
      Per cambiare l'aspetto di tutto il sito in un colpo solo, usa **"Stili Globali"** (deseleziona qualsiasi blocco o clicca l'icona ingranaggio nella toolbar):

      - **Caratteri**: Scegli il font principale per titoli e testi. Sono disponibili tutti i font di Google Fonts.
      - **Atmosfera**: Passa tra tema Chiaro (Light) e Scuro (Dark) con il pulsante sole/luna nella toolbar.
      - **Colori**: Definisci il colore primario per pulsanti e accenti, e il colore di sfondo generale.
      - **Pulsanti**: Personalizza arrotondamento, padding, dimensione testo e ombre per un look coerente su tutto il sito.

      **Nota**: Le impostazioni globali si applicano a tutti i blocchi, ma ogni blocco può sovrascrivere lo stile nel proprio tab "Stile".
    `
  },
  {
    id: 'gestione-pagine',
    category: 'basi',
    icon: FileText,
    title: 'Gestione delle Pagine',
    description: 'Crea e gestisci le pagine del tuo sito: Home, Chi Siamo, Contatti e altro.',
    content: `
      Il tuo sito può avere più pagine, ognuna con il proprio contenuto e blocchi.

      **Creare una nuova pagina:**
      1. Nella sidebar sinistra, sezione "Pagine", clicca il pulsante "+"
      2. Inserisci il titolo (es. "Chi Siamo")
      3. Lo slug URL viene generato automaticamente (es. "/chi-siamo")
      4. Clicca "Crea" per aggiungere la pagina

      **Navigare tra le pagine:**
      - Clicca sul nome della pagina nella lista per aprirla nell'editor

      **SEO per ogni pagina:**
      - Clicca l'icona globo sulla pagina attiva per impostare:
        - **Meta Title**: il titolo che appare su Google (ideale: 50-60 caratteri)
        - **Meta Description**: la descrizione sotto il titolo su Google (ideale: 110-160 caratteri)
        - **Social Image**: l'immagine che appare quando condividi il link sui social

      **Eliminare una pagina:**
      - Passa il mouse sulla pagina e clicca l'icona cestino (la Home non può essere eliminata)
    `
  },
  {
    id: 'mobile-tablet',
    category: 'basi',
    icon: Smartphone,
    title: 'Visualizzazione Mobile e Tablet',
    description: 'Controlla e adatta il design per ogni dispositivo.',
    content: `
      Oltre il 70% degli utenti naviga da cellulare. Ecco come ottimizzare il tuo sito per ogni schermo:

      **Cambiare la vista:**
      - Usa i pulsanti Desktop/Tablet/Mobile nella toolbar in alto a sinistra
      - Il canvas si adatta automaticamente alla larghezza del dispositivo selezionato

      **Stili responsivi:**
      - Molti parametri di stile (margini, padding, dimensione testo) possono essere **diversi per ogni dispositivo**
      - La sidebar destra mostra un badge colorato quando stai modificando la vista tablet o mobile
      - Le modifiche fatte in una vista non influenzano le altre

      **Zoom:**
      - Usa i controlli zoom (+/-) nella toolbar per vedere la pagina più grande o più piccola
      - Clicca sulla percentuale per tornare al 100%

      **Suggerimenti:**
      - Verifica sempre che le immagini siano leggibili su schermi piccoli
      - Riduci il padding laterale su mobile per sfruttare lo spazio
      - I menu di navigazione diventano automaticamente un hamburger menu su mobile
    `
  },
  {
    id: 'immagini',
    category: 'basi',
    icon: Image,
    title: 'Gestione delle Immagini',
    description: 'Come caricare, ottimizzare e usare le immagini nel tuo sito.',
    content: `
      Le immagini vengono ottimizzate automaticamente per garantire velocità e qualità.

      **Caricare un'immagine:**
      - Clicca sull'area di upload nel blocco o nel tab Contenuto
      - Puoi caricare file JPG, PNG, WebP e GIF

      **Ottimizzazione automatica:**
      - Le immagini vengono convertite in formato **WebP** per il massimo risparmio di peso
      - La compressione è al **80%** di qualità — un buon equilibrio tra qualità e velocità
      - Le immagini duplicate vengono rilevate automaticamente per non sprecare spazio

      **Opzioni di stile:**
      - Nel tab "Stile" del blocco puoi regolare:
        - **Opacità**: trasparenza dell'immagine
        - **Fit**: come l'immagine riempie il suo contenitore (cover, contain, fill)
        - **Posizione**: punto focale dell'immagine (center, top, bottom, etc.)

      **Social Image (SEO):**
      - Nelle impostazioni SEO di ogni pagina puoi caricare un'immagine che appare quando il link viene condiviso sui social media.
    `
  },
  {
    id: 'social-embed',
    category: 'avanzato',
    icon: Layout,
    title: 'Blocco Social Embed',
    description: 'Integra video, mappe e post social nel tuo sito.',
    content: `
      Il blocco **Social Embed** rende il sito interattivo e multimediale:

      - **YouTube**: Inserisci l'ID o l'URL del video per mostrarlo con un player responsive.
      - **Google Maps**: Inserisci semplicemente l'**indirizzo** (es: Via Roma 1, Milano) e la mappa verrà generata automaticamente. Completamente gratuito!
      - **Instagram**: Copia l'URL del post pubblico per embeddarlo con un layout ottimizzato.
      - **Custom**: Usa "Codice Iframe" per inserire widget di terze parti come Calendly, Typeform o qualsiasi altro servizio che offre un codice embed.

      **Suggerimento**: I video YouTube incorporati migliorano il tempo di permanenza sulla pagina, un fattore positivo per la SEO.
    `
  },
  {
    id: 'seo',
    category: 'marketing',
    icon: Search,
    title: 'SEO: Farsi Trovare su Google',
    description: 'Come ottimizzare il tuo sito per i motori di ricerca.',
    content: `
      SitiVetrina genera automaticamente molti elementi SEO, ma puoi migliorarli ulteriormente:

      **Generato automaticamente:**
      - Tag title e meta description per ogni pagina
      - **Sitemap XML** per aiutare Google a indicizzare tutte le pagine
      - **Robots.txt** per guidare i crawler
      - Tag **Open Graph** per la condivisione sui social
      - Struttura HTML semantica (heading corretti, alt text)

      **Cosa puoi fare tu:**
      1. **Meta Title**: Scrivi un titolo unico per ogni pagina con le parole chiave principali (50-60 caratteri)
      2. **Meta Description**: Una descrizione accattivante che invoglia a cliccare (110-160 caratteri)
      3. **Social Image**: Carica un'immagine per ogni pagina che appare nella condivisione social
      4. **Contenuti**: Scrivi testi utili e originali — Google premia i contenuti di qualità
      5. **Velocità**: I siti SitiVetrina sono già ultra-veloci grazie alla generazione statica su CDN

      **Google Business Profile:**
      Se hai un'attività locale, crea un profilo Google Business e collega il tuo sito per apparire su Google Maps.
    `
  },
  {
    id: 'pubblicazione',
    category: 'avanzato',
    icon: Rocket,
    title: 'Pubblicazione e Dominio',
    description: 'Come pubblicare il sito e configurare un dominio personalizzato.',
    content: `
      **Pubblicare il sito:**
      1. Assicurati di aver salvato tutte le modifiche
      2. Clicca il pulsante **"Pubblica"** nella barra in alto
      3. Attendi qualche secondo — il sito verrà distribuito su una CDN globale
      4. Una volta pubblicato, il badge di stato diventa verde "Online"
      5. Clicca "Vedi sito" per aprire il sito in una nuova scheda

      **Aggiornamenti:**
      - Ogni volta che modifichi qualcosa, il badge passa a "Bozza" (arancione)
      - Ripubblica per rendere visibili le modifiche al pubblico
      - Le versioni precedenti vengono mantenute (fino a 5)

      **Dominio personalizzato:**
      Puoi collegare il tuo dominio (es. www.mioristorante.it) tramite le impostazioni del progetto. Contatta il supporto per assistenza nella configurazione DNS.

      **Certificato SSL:**
      Ogni sito pubblicato riceve automaticamente un certificato HTTPS gratuito per la sicurezza dei visitatori.
    `
  },
  {
    id: 'dominio',
    category: 'avanzato',
    icon: Globe,
    title: 'Configurazione Dominio Personalizzato',
    description: 'Collega un dominio tuo al sito pubblicato.',
    content: `
      Per usare un dominio personalizzato (es. www.tuosito.it):

      1. **Acquista un dominio** da un registrar (Aruba, GoDaddy, Namecheap, etc.)
      2. **Configura il DNS** del dominio per puntare al tuo sito SitiVetrina:
         - Aggiungi un record **CNAME** che punta al sottodominio fornito nelle impostazioni del progetto
         - Oppure un record **A** per il dominio root
      3. **Imposta il dominio** nelle impostazioni del progetto nell'editor
      4. **Ripubblica** il sito per applicare le modifiche

      Il certificato SSL verrà generato automaticamente per il nuovo dominio.

      **Suggerimento**: La propagazione DNS può richiedere fino a 24-48 ore, ma spesso è molto più veloce.
    `
  },
  {
    id: 'cookie-privacy',
    category: 'legale',
    icon: ShieldCheck,
    title: 'Cookie e Privacy Policy',
    description: 'Come essere a norma con la gestione dei cookie e la privacy.',
    content: `
      Per rendere il sito conforme alle normative GDPR, puoi integrare servizi esterni:

      **Installare un banner cookie:**
      1. Registrati su una piattaforma di gestione cookie (es. CookieYes, Iubenda, Cookiebot)
      2. Configura il tuo banner seguendo le istruzioni del servizio
      3. Copia il codice di installazione fornito
      4. Nell'editor, vai su **"Stili Globali"** -> **"Avanzate & Script"**
      5. Incolla il codice nel campo **"Script di Intestazione (HEAD)"**
      6. Salva e pubblica: il banner apparirà automaticamente

      **Privacy Policy:**
      - Puoi creare una pagina dedicata "Privacy Policy" usando il template privacy
      - Oppure usa servizi come Iubenda che generano una policy completa e aggiornata

      **Suggerimento**: Anche se il tuo sito non usa cookie propri, servizi come Google Maps o YouTube incorporati li usano. Un banner è sempre consigliato.
    `
  },
  {
    id: 'analytics-firebase',
    category: 'marketing',
    icon: BarChart3,
    title: 'Analisi Visite e Statistiche',
    description: 'Monitora il traffico del tuo sito con strumenti professionali.',
    content: `
      Per capire chi visita il tuo sito e come si comporta, puoi installare strumenti di analisi:

      **Google Analytics / Firebase:**
      1. Crea un account su Google Analytics (analytics.google.com)
      2. Crea una proprietà per il tuo sito
      3. Copia il codice di tracciamento (tag gtag.js)
      4. Vai su **"Stili Globali"** -> **"Avanzate & Script"**
      5. Incolla il codice nel campo **"Script di Chiusura (BODY)"**

      **Cosa puoi monitorare:**
      - Numero di visitatori al giorno/settimana/mese
      - Pagine più visitate
      - Da dove arrivano i visitatori (Google, social, diretto)
      - Dispositivi usati (mobile, desktop, tablet)
      - Tempo medio di permanenza

      **Suggerimento**: Inserire gli script nel Body (anziché nel Head) aiuta a non rallentare l'apertura iniziale del sito.
    `
  },
  {
    id: 'scorciatoie',
    category: 'basi',
    icon: Keyboard,
    title: 'Scorciatoie da Tastiera',
    description: 'Tutte le shortcut per lavorare più velocemente nell\'editor.',
    content: `
      Usa queste scorciatoie per velocizzare il lavoro nell'editor:

      **Generali:**
      - **Ctrl+Z**: Annulla l'ultima azione
      - **Ctrl+Y** o **Ctrl+Shift+Z**: Ripristina l'azione annullata

      **Con un blocco selezionato:**
      - **Ctrl+C**: Copia il blocco selezionato
      - **Ctrl+V**: Incolla il blocco copiato
      - **Ctrl+D**: Duplica il blocco selezionato

      **Suggerimento**: Le scorciatoie funzionano solo quando non sei dentro un campo di testo (input o textarea). Se non rispondono, clicca prima su un'area vuota del canvas.
    `
  }
];
