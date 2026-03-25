import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — Consigli per Portare la Tua Attività Online',
  description:
    'Guide pratiche su SEO locale, creazione siti web, marketing digitale per attività locali. Impara a farti trovare dai tuoi clienti online.',
  alternates: { canonical: 'https://sitivetrina.it/blog' },
};

const posts = [
  {
    slug: 'perche-ogni-attivita-locale-ha-bisogno-di-un-sito-web',
    title: 'Perché ogni attività locale ha bisogno di un sito web nel 2025',
    excerpt:
      'Il 97% dei consumatori cerca attività locali online. Scopri perché non avere un sito web ti fa perdere clienti ogni giorno e come risolvere in pochi minuti.',
    date: '20 Mar 2025',
    readTime: '5 min',
    category: 'Presenza Online',
  },
  {
    slug: 'come-farsi-trovare-su-google-guida-seo-locale',
    title: 'Come farsi trovare su Google: guida SEO locale per principianti',
    excerpt:
      'Meta tag, Google Business Profile e contenuti ottimizzati: tutto quello che devi sapere per apparire nelle ricerche locali e attirare clienti.',
    date: '15 Mar 2025',
    readTime: '7 min',
    category: 'SEO',
  },
  {
    slug: 'sito-web-vs-social-media-cosa-serve-davvero',
    title: 'Sito web vs Social Media: cosa serve davvero alla tua attività?',
    excerpt:
      'Instagram non basta. Ecco perché il tuo sito web è la base della tua presenza digitale e come usare social e sito insieme per il massimo risultato.',
    date: '10 Mar 2025',
    readTime: '4 min',
    category: 'Strategia',
  },
  {
    slug: '5-errori-sito-web-attivita-locale',
    title: '5 errori che le attività locali fanno con il proprio sito web',
    excerpt:
      'Sito lento, non mobile-friendly, senza contatti visibili? Questi errori ti costano clienti. Ecco come evitarli.',
    date: '5 Mar 2025',
    readTime: '6 min',
    category: 'Best Practice',
  },
  {
    slug: 'google-business-profile-guida-completa',
    title: 'Google Business Profile: la guida completa per attività locali',
    excerpt:
      'Come configurare e ottimizzare il tuo profilo Google Business per apparire su Google Maps e nelle ricerche locali.',
    date: '28 Feb 2025',
    readTime: '8 min',
    category: 'SEO',
  },
  {
    slug: 'quanto-costa-un-sito-web-per-piccola-attivita',
    title: 'Quanto costa un sito web per una piccola attività nel 2025?',
    excerpt:
      'Agenzia, freelancer o fai da te? Analizziamo costi, pro e contro di ogni opzione per aiutarti a scegliere.',
    date: '20 Feb 2025',
    readTime: '5 min',
    category: 'Guide',
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-zinc-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-zinc-100">
        <div className="flex items-center justify-between px-6 lg:px-8 py-4 max-w-7xl mx-auto w-full">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            SitiVetrina
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="hidden sm:inline text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Home
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
        {/* Hero */}
        <section className="py-16 sm:py-24 border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Blog</h1>
            <p className="mt-4 text-lg text-zinc-600 max-w-2xl">
              Guide pratiche, consigli SEO e strategie per portare la tua attività locale online e farsi trovare dai clienti.
            </p>
          </div>
        </section>

        {/* Posts */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="h-48 bg-linear-to-br from-zinc-100 to-zinc-50 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-zinc-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5"
                      />
                    </svg>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {post.date} · {post.readTime}
                      </span>
                    </div>
                    <h2 className="font-bold text-lg leading-snug group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-zinc-500 text-sm mt-2 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-zinc-50 border-t border-zinc-100">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Pronto a creare il tuo sito?
            </h2>
            <p className="mt-4 text-zinc-600">
              Metti in pratica quello che hai imparato. Crea il sito della tua attività in pochi minuti.
            </p>
            <Link
              href="/editor"
              className="inline-flex mt-8 px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200/50 active:scale-[0.98]"
            >
              Inizia gratis
            </Link>
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
            <Link
              href="/blog"
              className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
