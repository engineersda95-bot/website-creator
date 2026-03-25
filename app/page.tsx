import Link from 'next/link';
import { AnimatedSection, FaqItem, MobileNav } from '@/components/landing/LandingClientComponents';

const steps = [
  {
    num: '01',
    title: 'Scegli un template',
    desc: 'Parti da un modello già pronto per il tuo settore: ristoranti, professionisti, negozi e altro.',
  },
  {
    num: '02',
    title: 'Personalizza con il drag & drop',
    desc: 'Trascina blocchi, cambia colori, testi e immagini. Tutto visuale, zero codice.',
  },
  {
    num: '03',
    title: 'Pubblica in un click',
    desc: 'Il tuo sito è online in pochi secondi con un dominio personalizzato. Veloce e sicuro.',
  },
];

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
    title: 'Editor Drag & Drop',
    desc: '20+ blocchi pronti: hero, servizi, contatti, FAQ, gallery e molto altro.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: 'Responsive di Default',
    desc: 'Ogni sito si adatta automaticamente a desktop, tablet e smartphone.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    title: 'Velocità Incredibile',
    desc: 'Siti statici ultra-veloci su CDN globale. Caricamento in meno di 1 secondo.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    title: 'SEO Ottimizzato',
    desc: 'Meta tag, sitemap, Open Graph e struttura semantica generati automaticamente.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
      </svg>
    ),
    title: 'Immagini Ottimizzate',
    desc: 'Conversione automatica in WebP, compressione intelligente e lazy loading.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: 'SSL Incluso',
    desc: 'Certificato HTTPS gratuito su ogni sito. Sicurezza e fiducia per i tuoi clienti.',
  },
];

const templates = [
  {
    slug: 'RISTORANTE',
    title: 'Ristorante & Pizzeria',
    desc: 'Hero, menu, galleria, mappa e contatti. Perfetto per locali e ristoranti.',
    gradient: 'from-orange-500 to-red-500',
    emoji: '🍕',
  },
  {
    slug: 'PROFESSIONISTA',
    title: 'Professionista',
    desc: 'Servizi, chi siamo, testimonianze e contatti. Ideale per avvocati, consulenti e freelancer.',
    gradient: 'from-blue-500 to-indigo-500',
    emoji: '💼',
  },
  {
    slug: 'landing',
    title: 'Agenzia & Startup',
    desc: 'Landing completa con hero, benefici, come funziona, FAQ e CTA. Per chi vuole convertire.',
    gradient: 'from-violet-500 to-purple-500',
    emoji: '🚀',
  },
];

const faqs = [
  {
    q: 'Devo saper programmare?',
    a: 'Assolutamente no. SitiVetrina è pensato per chi non ha competenze tecniche. Trascini i blocchi, personalizzi testi e colori, e pubblichi. Fine.',
  },
  {
    q: 'Quanto costa?',
    a: 'Puoi iniziare gratuitamente. Crei il sito, lo personalizzi e lo pubblichi senza costi nascosti.',
  },
  {
    q: 'Posso usare un dominio personalizzato?',
    a: 'Sì, puoi collegare il tuo dominio personalizzato al sito pubblicato tramite le impostazioni del progetto.',
  },
  {
    q: 'Il sito è ottimizzato per Google?',
    a: 'Sì. Generiamo automaticamente meta tag, sitemap XML, robots.txt, Open Graph e structured data per massimizzare la visibilità.',
  },
  {
    q: 'Posso modificare il sito dopo la pubblicazione?',
    a: 'Certo. Puoi tornare nell\'editor in qualsiasi momento, fare le modifiche e ripubblicare con un click.',
  },
  {
    q: 'Su quali dispositivi funziona il sito?',
    a: 'Ogni sito è 100% responsive: si adatta perfettamente a desktop, tablet e smartphone.',
  },
];

const testimonials = [
  {
    name: 'Marco R.',
    role: 'Titolare Pizzeria Da Marco',
    text: 'Ho creato il sito della mia pizzeria in 20 minuti. I clienti adesso ci trovano su Google e ordinano direttamente.',
  },
  {
    name: 'Giulia B.',
    role: 'Avvocato',
    text: 'Cercavo qualcosa di semplice e professionale. SitiVetrina è esattamente quello che mi serviva. Zero competenze tecniche richieste.',
  },
  {
    name: 'Luca T.',
    role: 'Personal Trainer',
    text: 'Finalmente ho un sito serio dove i miei clienti possono vedere i servizi e contattarmi. Lo consiglio a tutti.',
  },
];

const blogPosts = [
  {
    slug: 'perche-ogni-attivita-locale-ha-bisogno-di-un-sito-web',
    title: 'Perché ogni attività locale ha bisogno di un sito web nel 2025',
    excerpt: 'Il 97% dei consumatori cerca attività locali online. Scopri perché non avere un sito web ti fa perdere clienti ogni giorno.',
    date: '20 Mar 2025',
    readTime: '5 min',
  },
  {
    slug: 'come-farsi-trovare-su-google-guida-seo-locale',
    title: 'Come farsi trovare su Google: guida SEO locale per principianti',
    excerpt: 'Meta tag, Google Business Profile e contenuti ottimizzati: tutto quello che devi sapere per apparire nelle ricerche locali.',
    date: '15 Mar 2025',
    readTime: '7 min',
  },
  {
    slug: 'sito-web-vs-social-media-cosa-serve-davvero',
    title: 'Sito web vs Social Media: cosa serve davvero alla tua attività?',
    excerpt: 'Instagram non basta. Ecco perché il tuo sito web è la base della tua presenza digitale e come usarli insieme.',
    date: '10 Mar 2025',
    readTime: '4 min',
  },
];

const audiences = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125C3.504 20.625 3 20.121 3 19.5v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
      </svg>
    ),
    title: 'Ristoranti & Bar',
    desc: 'Menu, orari, prenotazioni e mappa. Fatti trovare dai clienti affamati.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
      </svg>
    ),
    title: 'Professionisti',
    desc: 'Servizi, competenze e contatti. Perfetto per avvocati, commercialisti, consulenti.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
      </svg>
    ),
    title: 'Negozi & Botteghe',
    desc: 'Vetrina prodotti, orari e dove trovarti. Porta i clienti nel tuo negozio.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    title: 'Salute & Benessere',
    desc: 'Trattamenti, listino prezzi e prenotazioni. Per palestre, estetisti, fisioterapisti.',
  },
];

const comparison = [
  { feature: 'Costo iniziale', sv: 'Gratis', wix: 'Da 17€/mese', wp: 'Da 25€/mese + hosting' },
  { feature: 'Tempo di setup', sv: '10 minuti', wix: '1-3 ore', wp: '1-7 giorni' },
  { feature: 'Competenze richieste', sv: 'Nessuna', wix: 'Base', wp: 'Medie/Alte' },
  { feature: 'Velocità sito', sv: '<1 secondo', wix: '2-4 secondi', wp: '2-5 secondi' },
  { feature: 'SEO automatico', sv: 'Tutto incluso', wix: 'Parziale', wp: 'Plugin necessari' },
  { feature: 'Manutenzione', sv: 'Zero', wix: 'Minima', wp: 'Aggiornamenti frequenti' },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-zinc-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-zinc-100 relative">
        <div className="flex items-center justify-between px-6 lg:px-8 py-4 max-w-7xl mx-auto w-full">
          <Link href="/" className="text-2xl font-bold tracking-tight">SitiVetrina</Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#come-funziona" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Come funziona</a>
            <a href="#funzionalita" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Funzionalità</a>
            <a href="#template" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Template</a>
            <a href="#faq" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">FAQ</a>
            <Link href="/blog" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/editor"
              className="hidden sm:inline-flex px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200"
            >
              Crea il tuo sito
            </Link>
            <MobileNav />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Gratis, senza carta di credito
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
                Il sito web per la tua{' '}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  attività locale
                </span>
                <br />
                in pochi minuti.
              </h1>
              <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                Niente codice. Niente stress. Un editor visuale a blocchi per portare il tuo business online oggi stesso.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  href="/editor"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200/50 active:scale-[0.98] hover:shadow-2xl hover:shadow-blue-200/60"
                >
                  Crea il tuo sito gratis
                </Link>
                <a
                  href="#come-funziona"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-700 border border-zinc-200 rounded-full text-lg font-medium hover:border-zinc-300 hover:bg-zinc-50 transition-all"
                >
                  Scopri come funziona
                </a>
              </div>
            </div>

            {/* Editor Preview */}
            <div className="mt-16 sm:mt-20 max-w-5xl mx-auto">
              <div className="relative rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden bg-zinc-950 p-1">
                <div className="flex items-center gap-2 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-8">
                    <div className="bg-zinc-800 rounded-lg px-4 py-1.5 text-xs text-zinc-400 text-center">
                      sitivetrina.it/editor
                    </div>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden bg-white aspect-[16/9] flex items-center justify-center">
                  <div className="text-center space-y-4 px-8">
                    <div className="flex justify-center gap-3">
                      <div className="w-48 h-full bg-zinc-100 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-8 bg-zinc-100 rounded-lg w-3/4" />
                        <div className="h-4 bg-zinc-50 rounded w-full" />
                        <div className="h-4 bg-zinc-50 rounded w-2/3" />
                        <div className="grid grid-cols-3 gap-3 pt-4">
                          <div className="h-20 bg-blue-50 rounded-lg" />
                          <div className="h-20 bg-blue-50 rounded-lg" />
                          <div className="h-20 bg-blue-50 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="border-y border-zinc-100 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-zinc-900">20+</div>
                <div className="text-sm text-zinc-500 mt-1">Blocchi disponibili</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900">&lt;1s</div>
                <div className="text-sm text-zinc-500 mt-1">Tempo di caricamento</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900">100%</div>
                <div className="text-sm text-zinc-500 mt-1">Responsive</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900">0€</div>
                <div className="text-sm text-zinc-500 mt-1">Per iniziare</div>
              </div>
            </div>
          </div>
        </section>

        {/* Per chi è */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Per chi è SitiVetrina?</h2>
                <p className="mt-4 text-lg text-zinc-600">
                  Pensato per chi ha un&apos;attività locale e vuole essere trovato online dai propri clienti.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {audiences.map((a, i) => (
                <AnimatedSection key={a.title} className={`delay-${i * 100}`}>
                  <div className="text-center p-6 rounded-2xl border border-zinc-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all group">
                    <div className="w-14 h-14 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {a.icon}
                    </div>
                    <h3 className="text-lg font-bold mt-4">{a.title}</h3>
                    <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{a.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="come-funziona" className="py-24 sm:py-32 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Come funziona</h2>
                <p className="mt-4 text-lg text-zinc-600">
                  Tre passi per avere il tuo sito online. Senza competenze tecniche.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((step, i) => (
                <AnimatedSection key={step.num} className={`delay-${i * 150}`}>
                  <div className="relative group">
                    <div className="text-6xl font-black text-zinc-200 group-hover:text-blue-200 transition-colors">
                      {step.num}
                    </div>
                    <h3 className="text-xl font-bold mt-2">{step.title}</h3>
                    <p className="text-zinc-600 mt-2 leading-relaxed">{step.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            {/* Video demo placeholder */}
            <AnimatedSection>
              <div className="mt-16 max-w-3xl mx-auto">
                <div className="relative rounded-2xl border border-zinc-200 bg-white shadow-lg overflow-hidden aspect-video flex items-center justify-center group cursor-pointer hover:shadow-xl transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-violet-50" />
                  <div className="relative text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="mt-4 text-sm font-medium text-zinc-600">Guarda come creare un sito in 2 minuti</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Features */}
        <section id="funzionalita" className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Tutto quello che ti serve
                </h2>
                <p className="mt-4 text-lg text-zinc-600">
                  Ogni funzionalità è pensata per farti risparmiare tempo e avere un risultato professionale.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold mt-4">{f.title}</h3>
                  <p className="text-zinc-600 mt-2 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="template" className="py-24 sm:py-32 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Parti da un template
                </h2>
                <p className="mt-4 text-lg text-zinc-600">
                  Scegli il modello più adatto alla tua attività e personalizzalo come vuoi.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((t) => (
                <Link
                  key={t.slug}
                  href={`/editor?template=${t.slug}`}
                  className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className={`h-40 bg-gradient-to-br ${t.gradient} flex items-center justify-center`}>
                    <span className="text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300">{t.emoji}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">{t.title}</h3>
                    <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{t.desc}</p>
                    <div className="mt-4 text-sm font-medium text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Usa questo template
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/editor" className="text-sm text-zinc-500 hover:text-zinc-700 underline underline-offset-4 transition-colors">
                Oppure inizia da un foglio bianco
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Chi lo usa, lo consiglia
                </h2>
                <p className="mt-4 text-lg text-zinc-600">
                  Attività locali che hanno scelto SitiVetrina per essere online.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-white p-8 rounded-2xl border border-zinc-200"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-zinc-700 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Confronto */}
        <section className="py-24 sm:py-32 bg-zinc-50">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Perché SitiVetrina?
                </h2>
                <p className="mt-4 text-lg text-zinc-600">
                  Confronto onesto con le alternative più conosciute.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-zinc-500 pb-4 pr-4" />
                      <th className="text-center text-sm font-bold text-blue-600 pb-4 px-4">SitiVetrina</th>
                      <th className="text-center text-sm font-medium text-zinc-500 pb-4 px-4">Wix</th>
                      <th className="text-center text-sm font-medium text-zinc-500 pb-4 px-4">WordPress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, i) => (
                      <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                        <td className="py-3.5 px-4 text-sm font-medium text-zinc-900 rounded-l-lg">{row.feature}</td>
                        <td className="py-3.5 px-4 text-center text-sm font-semibold text-blue-600">{row.sv}</td>
                        <td className="py-3.5 px-4 text-center text-sm text-zinc-600">{row.wix}</td>
                        <td className="py-3.5 px-4 text-center text-sm text-zinc-600 rounded-r-lg">{row.wp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Blog Preview */}
        <section id="blog" className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-16">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Dal nostro blog</h2>
                  <p className="mt-4 text-lg text-zinc-600">
                    Consigli pratici per portare la tua attività online.
                  </p>
                </div>
              <Link
                href="/blog"
                className="mt-4 sm:mt-0 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                Tutti gli articoli
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="h-48 bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center">
                    <svg className="w-12 h-12 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime} di lettura</span>
                    </div>
                    <h3 className="font-bold text-lg leading-snug group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-2 leading-relaxed line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 sm:py-32 bg-zinc-50">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Domande frequenti</h2>
                <p className="mt-4 text-lg text-zinc-600">
                  Tutto quello che devi sapere per iniziare.
                </p>
              </div>
            </AnimatedSection>
            <div>
              {faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 sm:py-32">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
                Pronto a portare la tua attività online?
              </h2>
              <p className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto">
                Unisciti a chi ha già scelto SitiVetrina. Crea il tuo sito in pochi minuti, gratis.
              </p>
              <div className="mt-10">
                <Link
                  href="/editor"
                  className="inline-flex px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200/50 active:scale-[0.98]"
                >
                  Inizia ora — è gratis
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </section>
      </main>

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          }),
        }}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold tracking-tight">SitiVetrina</div>
              <p className="mt-3 text-sm text-zinc-500 max-w-sm leading-relaxed">
                L&apos;editor drag & drop per creare siti web professionali per la tua attività locale. Semplice, veloce e senza codice.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900 mb-4">Prodotto</div>
              <div className="space-y-3">
                <a href="#funzionalita" className="block text-sm text-zinc-500 hover:text-zinc-700 transition-colors">Funzionalità</a>
                <a href="#template" className="block text-sm text-zinc-500 hover:text-zinc-700 transition-colors">Template</a>
                <a href="#come-funziona" className="block text-sm text-zinc-500 hover:text-zinc-700 transition-colors">Come funziona</a>
                <Link href="/editor" className="block text-sm text-zinc-500 hover:text-zinc-700 transition-colors">Editor</Link>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900 mb-4">Risorse</div>
              <div className="space-y-3">
                <Link href="/blog" className="block text-sm text-zinc-500 hover:text-zinc-700 transition-colors">Blog</Link>
                <a href="#faq" className="block text-sm text-zinc-500 hover:text-zinc-700 transition-colors">FAQ</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">
              &copy; {new Date().getFullYear()} SitiVetrina. Prodotto da Proximatica.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">Termini</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
