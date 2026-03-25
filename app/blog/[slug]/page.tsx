import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
};

const posts: Record<string, BlogPost> = {
  'perche-ogni-attivita-locale-ha-bisogno-di-un-sito-web': {
    slug: 'perche-ogni-attivita-locale-ha-bisogno-di-un-sito-web',
    title: 'Perché ogni attività locale ha bisogno di un sito web nel 2025',
    description:
      'Il 97% dei consumatori cerca attività locali online. Scopri perché non avere un sito web ti fa perdere clienti ogni giorno.',
    date: '20 Marzo 2025',
    readTime: '5 min',
    category: 'Presenza Online',
    content: `## I tuoi clienti ti cercano online. Ti trovano?

Secondo le ultime ricerche, **il 97% dei consumatori usa internet per cercare attività locali**. Che si tratti di un ristorante, un idraulico o un avvocato, il primo posto dove le persone vanno a cercare è Google.

Se non hai un sito web, semplicemente **non esisti** per la maggior parte dei potenziali clienti.

## "Ma io ho la pagina Facebook"

I social media sono importanti, ma non sono un sostituto del sito web. Ecco perché:

- **Non sei il proprietario**: Facebook può cambiare le regole domani e la tua visibilità crolla
- **Limiti di personalizzazione**: non puoi mostrare i tuoi servizi come vuoi
- **Meno fiducia**: un sito web professionale trasmette più credibilità di una pagina social
- **SEO limitato**: i profili social non si posizionano bene per ricerche locali specifiche

## Cosa deve avere un buon sito per attività locale

Non ti serve un sito complesso. Ti serve un sito **chiaro, veloce e ottimizzato**:

1. **Hero chiara**: chi sei e cosa fai, visibile in 3 secondi
2. **Servizi o menu**: cosa offri, con descrizioni semplici
3. **Contatti visibili**: telefono, indirizzo, mappa — facili da trovare
4. **Responsive**: deve funzionare perfettamente da smartphone
5. **Veloce**: caricamento sotto i 2 secondi
6. **SEO di base**: title, description e struttura corretta

## Quanto costa? Meno di quello che pensi

Fino a poco tempo fa, creare un sito professionale significava spendere centinaia (o migliaia) di euro. Oggi con strumenti come **SitiVetrina** puoi creare un sito completo in pochi minuti, partendo da template già pronti per il tuo settore.

Niente codice, niente stress, niente costi nascosti.

## Inizia oggi

Ogni giorno senza un sito web è un giorno in cui stai perdendo potenziali clienti. Non aspettare: [crea il tuo sito gratis](/editor) e porta la tua attività online.`,
  },

  'come-farsi-trovare-su-google-guida-seo-locale': {
    slug: 'come-farsi-trovare-su-google-guida-seo-locale',
    title: 'Come farsi trovare su Google: guida SEO locale per principianti',
    description:
      'Meta tag, Google Business Profile e contenuti ottimizzati: tutto quello che devi sapere per apparire nelle ricerche locali.',
    date: '15 Marzo 2025',
    readTime: '7 min',
    category: 'SEO',
    content: `## SEO locale: cos'è e perché ti serve

La **SEO locale** (Search Engine Optimization) è l'insieme di tecniche che aiutano la tua attività ad apparire quando qualcuno cerca un servizio nella tua zona. Ad esempio: "pizzeria Roma centro" o "avvocato Milano".

Se fai SEO locale bene, il tuo sito appare **nei primi risultati di Google** e su **Google Maps**.

## 1. Crea un sito web ottimizzato

Il primo passo è avere un sito con le basi SEO corrette:

- **Title tag**: il titolo della pagina che appare su Google. Deve contenere il tuo servizio + la tua città. Es: "Pizzeria Da Marco — Roma Trastevere"
- **Meta description**: la descrizione sotto il titolo. 150-160 caratteri che invogliano a cliccare
- **Heading corretti**: usa H1 per il titolo principale, H2 per le sezioni
- **URL puliti**: meglio /servizi che /page?id=123

Con **SitiVetrina**, tutti questi elementi SEO vengono generati automaticamente.

## 2. Configura Google Business Profile

È gratuito e fondamentale:

1. Vai su business.google.com
2. Aggiungi la tua attività con indirizzo, telefono, orari
3. Aggiungi foto di qualità
4. Scegli le categorie giuste
5. Chiedi recensioni ai clienti soddisfatti

## 3. Contenuti che rispondono alle domande

Google premia i siti che **rispondono alle domande degli utenti**. Crea pagine che spiegano:

- Cosa fai e per chi
- Dove ti trovi
- Quali sono i tuoi orari
- Perché scegliere te

## 4. Velocità e mobile

Google penalizza i siti lenti e non ottimizzati per smartphone. I siti creati con SitiVetrina sono:

- **Statici e ultra-veloci**: caricamento sotto 1 secondo
- **100% responsive**: perfetti su ogni dispositivo
- **Ottimizzati**: immagini in WebP, codice minimale

## 5. Backlink locali

Cerca di ottenere link da:

- Directory locali (Pagine Gialle, Yelp, TripAdvisor)
- Siti di associazioni di categoria
- Articoli su blog locali

## Checklist SEO locale

- [ ] Sito con title e description ottimizzati
- [ ] Google Business Profile configurato
- [ ] NAP coerente (Nome, Indirizzo, Telefono) ovunque
- [ ] Sito mobile-friendly e veloce
- [ ] Almeno 5 recensioni su Google
- [ ] Contenuti che rispondono alle domande dei clienti

Inizia oggi: [crea il tuo sito SEO-optimized](/editor) con SitiVetrina.`,
  },

  'sito-web-vs-social-media-cosa-serve-davvero': {
    slug: 'sito-web-vs-social-media-cosa-serve-davvero',
    title: 'Sito web vs Social Media: cosa serve davvero alla tua attività?',
    description:
      'Instagram non basta. Ecco perché il tuo sito web è la base della tua presenza digitale e come usarli insieme.',
    date: '10 Marzo 2025',
    readTime: '4 min',
    category: 'Strategia',
    content: `## La domanda che tutti si fanno

"Ho già Instagram e Facebook, mi serve davvero un sito?" La risposta breve: **sì, assolutamente**.

I social media e il sito web servono a scopi diversi. Vediamo quali.

## Social Media: pro e contro

**Pro:**
- Visibilità immediata
- Interazione diretta con i clienti
- Costi bassi per iniziare

**Contro:**
- **Non sei il proprietario** della piattaforma
- L'algoritmo decide chi vede i tuoi contenuti
- Difficile farsi trovare per ricerche specifiche
- Personalizzazione limitata
- Se il social chiude, perdi tutto

## Sito web: pro e contro

**Pro:**
- **Sei il proprietario** al 100%
- Appari su Google per ricerche specifiche
- Totale libertà di design e contenuti
- Trasmette professionalità e fiducia
- Funziona 24/7 come vetrina del tuo business

**Contro:**
- Richiede un minimo di setup iniziale (ma con SitiVetrina bastano pochi minuti)

## La strategia vincente: usarli insieme

La combinazione migliore è:

1. **Sito web come base**: la tua "casa" digitale con tutte le informazioni
2. **Social per attrarre**: usa Instagram, Facebook e TikTok per farti conoscere
3. **Porta traffico al sito**: ogni post social dovrebbe rimandare al sito
4. **Converti sul sito**: il sito è dove i clienti trovano orari, menu, servizi e ti contattano

## Un esempio pratico

Immagina di avere una pizzeria:

- **Instagram**: posti foto delle pizze, storie del locale, offerte del giorno
- **Sito web**: menu completo, orari, prenotazioni, mappa, recensioni
- **Google**: quando qualcuno cerca "pizzeria zona X", trova il tuo sito

Senza il sito, perdi tutti quelli che cercano su Google — che sono la maggior parte.

## Conclusione

I social sono un megafono. Il sito web è la tua vetrina. Ti servono entrambi, ma se dovessi sceglierne uno, scegli il sito: è tuo, è trovabile su Google, e lavora per te anche quando dormi.

[Crea il tuo sito in pochi minuti](/editor) con SitiVetrina.`,
  },

  '5-errori-sito-web-attivita-locale': {
    slug: '5-errori-sito-web-attivita-locale',
    title: '5 errori che le attività locali fanno con il proprio sito web',
    description:
      'Sito lento, non mobile-friendly, senza contatti visibili? Questi errori ti costano clienti. Ecco come evitarli.',
    date: '5 Marzo 2025',
    readTime: '6 min',
    category: 'Best Practice',
    content: `## Hai un sito web ma non funziona? Ecco perché

Avere un sito web è il primo passo. Ma se è fatto male, può fare più danno che bene. Ecco i 5 errori più comuni.

## 1. Sito lento

Se il tuo sito impiega più di **3 secondi** a caricarsi, il 53% dei visitatori lo abbandona. Le cause più comuni:

- Immagini non ottimizzate (troppo pesanti)
- Hosting economico e lento
- Troppi script e plugin

**Soluzione**: usa un builder che genera siti statici e veloci, come SitiVetrina. I nostri siti caricano in meno di 1 secondo.

## 2. Non mobile-friendly

Oltre il **60% del traffico web** arriva da smartphone. Se il tuo sito non si adatta allo schermo del telefono, stai perdendo la maggior parte dei visitatori.

**Soluzione**: ogni sito creato con SitiVetrina è responsive di default.

## 3. Contatti nascosti

Il visitatore arriva, gli piace quello che vede, vuole chiamarti... ma non trova il numero. Errore fatale.

**Soluzione**: metti telefono, email e indirizzo **visibili in ogni pagina**. Usa un blocco contatti dedicato nel footer e nella pagina contatti.

## 4. Nessuna call-to-action

Un sito senza CTA (invito all'azione) è come un negozio senza insegna. Il visitatore non sa cosa fare.

**Soluzione**: aggiungi bottoni chiari come "Chiamaci", "Prenota", "Richiedi preventivo" in posizioni strategiche.

## 5. SEO inesistente

Se Google non sa che esisti, nessuno ti trova. Molti siti hanno:

- Title generico ("Home")
- Nessuna meta description
- Nessuna sitemap
- URL incomprensibili

**Soluzione**: SitiVetrina genera automaticamente title, description, sitemap, robots.txt e Open Graph per ogni pagina.

## La buona notizia

Tutti questi errori sono facilmente risolvibili. Con uno strumento moderno, puoi avere un sito veloce, responsive, con contatti visibili, CTA efficaci e SEO ottimizzato **in meno di 30 minuti**.

[Prova SitiVetrina gratis](/editor) e crea un sito che funziona davvero.`,
  },

  'google-business-profile-guida-completa': {
    slug: 'google-business-profile-guida-completa',
    title: 'Google Business Profile: la guida completa per attività locali',
    description:
      'Come configurare e ottimizzare il tuo profilo Google Business per apparire su Google Maps e nelle ricerche locali.',
    date: '28 Febbraio 2025',
    readTime: '8 min',
    category: 'SEO',
    content: `## Cos'è Google Business Profile?

**Google Business Profile** (ex Google My Business) è lo strumento gratuito di Google che permette alla tua attività di apparire su **Google Maps** e nel **Local Pack** — quel box con le 3 attività che appare in cima ai risultati di ricerca.

Se cerchi "ristorante Roma", le prime cose che vedi sono profili Google Business. Se non ce l'hai, sei invisibile.

## Come creare il tuo profilo

1. Vai su **business.google.com**
2. Clicca "Gestisci ora"
3. Cerca la tua attività o aggiungila
4. Inserisci indirizzo esatto
5. Scegli la categoria principale (es. "Ristorante italiano")
6. Aggiungi telefono e sito web
7. Verifica tramite cartolina, telefono o email

## Come ottimizzare il profilo

### Informazioni complete
- Nome esatto dell'attività (no keyword stuffing)
- Indirizzo completo e preciso
- Numero di telefono locale
- Orari aggiornati (inclusi festivi)
- **Link al tuo sito web** — fondamentale!

### Foto di qualità
- Almeno 10 foto reali
- Interno ed esterno del locale
- Prodotti/piatti principali
- Il team al lavoro

### Categoria giusta
Scegli la categoria primaria più specifica possibile. "Pizzeria" è meglio di "Ristorante". Puoi aggiungere categorie secondarie.

### Descrizione
250 parole che spiegano:
- Cosa fai
- Da quanto tempo
- Cosa ti rende unico
- Quali servizi offri

## Le recensioni: l'arma segreta

Le recensioni sono il fattore #1 per il posizionamento locale. Ecco come ottenerne di più:

1. **Chiedi** a clienti soddisfatti (di persona funziona meglio)
2. **Rispondi** a tutte le recensioni, anche quelle negative
3. **Non comprare** recensioni false — Google le riconosce e ti penalizza
4. **Crea un link diretto** per lasciare la recensione e condividilo

## Post su Google Business

Puoi pubblicare aggiornamenti direttamente sul profilo:

- Offerte speciali
- Novità del menu
- Eventi
- Foto recenti

Pubblicare regolarmente segnala a Google che la tua attività è attiva.

## Collegalo al tuo sito

Il profilo Google Business e il sito web lavorano insieme:

- Il profilo manda traffico al sito
- Il sito fornisce informazioni approfondite
- Insieme, migliorano il tuo posizionamento locale

Non hai ancora un sito? [Creane uno in pochi minuti con SitiVetrina](/editor) — gratuito e già ottimizzato per la SEO.`,
  },

  'quanto-costa-un-sito-web-per-piccola-attivita': {
    slug: 'quanto-costa-un-sito-web-per-piccola-attivita',
    title: 'Quanto costa un sito web per una piccola attività nel 2025?',
    description:
      'Agenzia, freelancer o fai da te? Analizziamo costi, pro e contro di ogni opzione per aiutarti a scegliere.',
    date: '20 Febbraio 2025',
    readTime: '5 min',
    category: 'Guide',
    content: `## Le opzioni per creare un sito web

Quando decidi di portare la tua attività online, hai diverse strade. Ognuna ha costi e tempi diversi.

## 1. Agenzia web tradizionale

**Costo**: 1.500€ — 10.000€+
**Tempi**: 2-8 settimane

**Pro:**
- Risultato professionale e personalizzato
- Supporto tecnico incluso
- Design su misura

**Contro:**
- Costi elevati, spesso fuori budget per piccole attività
- Tempi lunghi
- Dipendenza dall'agenzia per ogni modifica
- Costi ricorrenti di manutenzione (200-500€/anno)

## 2. Freelancer

**Costo**: 500€ — 3.000€
**Tempi**: 1-4 settimane

**Pro:**
- Più economico di un'agenzia
- Contatto diretto con chi fa il lavoro
- Buona personalizzazione

**Contro:**
- Qualità variabile
- Se il freelancer sparisce, sei nei guai
- Comunque devi aspettare e pagare per le modifiche

## 3. Website builder (WordPress, Wix, Squarespace)

**Costo**: 100€ — 500€/anno
**Tempi**: 1-7 giorni

**Pro:**
- Fai da te
- Template disponibili
- Costi contenuti

**Contro:**
- Curva di apprendimento (soprattutto WordPress)
- Siti spesso lenti
- Costi mensili che si accumulano
- Plugin, temi premium, hosting: i costi salgono

## 4. SitiVetrina

**Costo**: Gratis per iniziare
**Tempi**: 10-30 minuti

**Pro:**
- Editor drag & drop semplicissimo
- Template pronti per settore (ristoranti, professionisti, negozi)
- Sito velocissimo (statico, su CDN globale)
- SEO automatico
- Pubblicazione con un click
- Zero codice richiesto

**Contro:**
- Meno personalizzazione di un sito custom fatto da agenzia

## Il confronto in sintesi

| | Agenzia | Freelancer | Wix/WP | SitiVetrina |
|---|---|---|---|---|
| **Costo** | 1.500€+ | 500€+ | 100€+/anno | Gratis |
| **Tempo** | Settimane | Settimane | Giorni | Minuti |
| **Competenze** | Nessuna | Nessuna | Medie | Nessuna |
| **Velocità sito** | Variabile | Variabile | Media | Altissima |
| **SEO** | Dipende | Dipende | Da configurare | Automatico |

## La nostra raccomandazione

Per la maggior parte delle piccole attività locali, **non hai bisogno di un sito da 3.000€**. Hai bisogno di un sito:

- Professionale e pulito
- Veloce e mobile-friendly
- Trovabile su Google
- Facile da aggiornare

Tutto questo lo ottieni con SitiVetrina in pochi minuti, senza spendere un euro.

[Crea il tuo sito gratis](/editor) e giudica tu stesso.`,
  },
};

const postSlugs = Object.keys(posts);

export function generateStaticParams() {
  return postSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://sitivetrina.it/blog/${slug}` },
    openGraph: {
      type: 'article',
      locale: 'it_IT',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

function renderMarkdown(md: string) {
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | 'check' | null = null;
  let tableRows: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    if (listType === 'ol') {
      elements.push(
        <ol key={elements.length} className="list-decimal pl-6 space-y-1 text-zinc-700 leading-relaxed">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ol>
      );
    } else if (listType === 'check') {
      elements.push(
        <ul key={elements.length} className="space-y-1 text-zinc-700 leading-relaxed">
          {listItems.map((item, i) => {
            const checked = item.startsWith('[x]');
            const text = item.replace(/^\[[ x]\]\s*/, '');
            return (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-1 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300'}`}>
                  {checked ? '✓' : ''}
                </span>
                <span dangerouslySetInnerHTML={{ __html: inlineFormat(text) }} />
              </li>
            );
          })}
        </ul>
      );
    } else {
      elements.push(
        <ul key={elements.length} className="list-disc pl-6 space-y-1 text-zinc-700 leading-relaxed">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  }

  function flushTable() {
    if (tableRows.length === 0) return;
    const parseRow = (row: string) =>
      row.split('|').map(c => c.trim()).filter(Boolean);

    const header = parseRow(tableRows[0]);
    // Skip separator row (index 1 if it's like |---|---|)
    const dataStart = tableRows.length > 1 && /^[\s|:-]+$/.test(tableRows[1].replace(/\|/g, '').replace(/-/g, '').replace(/:/g, '').trim()) ? 2 : 1;
    const body = tableRows.slice(dataStart).map(parseRow);

    elements.push(
      <div key={elements.length} className="overflow-x-auto my-4 rounded-lg border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50">
              {header.map((cell, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-semibold text-zinc-900 border-b border-zinc-200" dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-zinc-700 border-b border-zinc-100" dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  }

  function inlineFormat(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline underline-offset-2 hover:text-blue-700">$1</a>');
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }

    if (trimmed.startsWith('|')) {
      flushList();
      tableRows.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={elements.length} className="text-2xl font-bold text-zinc-900 mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={elements.length} className="text-xl font-bold text-zinc-900 mt-8 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      if (listType !== 'check') flushList();
      listType = 'check';
      listItems.push(trimmed.slice(2));
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
    } else {
      flushList();
      elements.push(
        <p
          key={elements.length}
          className="text-zinc-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
        />
      );
    }
  }
  flushList();
  flushTable();
  return elements;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const relatedSlugs = postSlugs.filter((s) => s !== slug).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-zinc-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-zinc-100">
        <div className="flex items-center justify-between px-6 lg:px-8 py-4 max-w-7xl mx-auto w-full">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            SitiVetrina
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="hidden sm:inline text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
              Blog
            </Link>
            <Link
              href="/editor"
              className="px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200"
            >
              Crea il tuo sito
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Article */}
        <article className="py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
              <Link href="/blog" className="hover:text-zinc-700 transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-zinc-400 truncate">{post.title}</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-zinc-400">
                  {post.date} · {post.readTime} di lettura
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                {post.title}
              </h1>
              <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
                {post.description}
              </p>
            </header>

            {/* Content */}
            <div className="space-y-4">{renderMarkdown(post.content)}</div>

            {/* CTA */}
            <div className="mt-16 p-8 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
              <h3 className="text-xl font-bold">Pronto a creare il tuo sito?</h3>
              <p className="mt-2 text-zinc-600">
                Metti in pratica questi consigli. Crea il sito della tua attività in pochi minuti.
              </p>
              <Link
                href="/editor"
                className="inline-flex mt-6 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 active:scale-[0.98]"
              >
                Inizia gratis con SitiVetrina
              </Link>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <section className="py-16 border-t border-zinc-100 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Articoli correlati</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedSlugs.map((s) => {
                const p = posts[s];
                return (
                  <Link
                    key={s}
                    href={`/blog/${s}`}
                    className="group bg-white rounded-2xl border border-zinc-200 p-6 hover:shadow-lg transition-all"
                  >
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {p.category}
                    </span>
                    <h3 className="font-bold mt-3 leading-snug group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-2 line-clamp-2">{p.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} SitiVetrina. Prodotto da Proximatica.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
              Home
            </Link>
            <Link href="/blog" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
              Blog
            </Link>
          </div>
        </div>
      </footer>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: {
              '@type': 'Organization',
              name: 'SitiVetrina',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Proximatica',
            },
          }),
        }}
      />
    </div>
  );
}
