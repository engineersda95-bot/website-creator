import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalDialogs } from "@/components/shared/GlobalDialogs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SitiVetrina — Crea il Sito Web per la Tua Attività in Pochi Minuti",
    template: "%s | SitiVetrina",
  },
  description:
    "Crea un sito web professionale per la tua attività locale senza scrivere codice. Editor drag & drop, template pronti, pubblicazione istantanea. Provalo gratis.",
  keywords: [
    "creare sito web",
    "sito web attività locale",
    "website builder italiano",
    "sito vetrina",
    "creare sito senza codice",
    "sito web ristorante",
    "sito web professionista",
    "editor drag and drop",
  ],
  authors: [{ name: "Proximatica" }],
  creator: "Proximatica",
  metadataBase: new URL("https://sitivetrina.it"),
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "SitiVetrina",
    title: "SitiVetrina — Crea il Sito Web per la Tua Attività in Pochi Minuti",
    description:
      "Editor drag & drop per creare siti web professionali. Niente codice, niente stress. Template pronti e pubblicazione istantanea.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SitiVetrina — Crea il Sito Web per la Tua Attività in Pochi Minuti",
    description:
      "Editor drag & drop per creare siti web professionali. Niente codice, niente stress.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://sitivetrina.it",
    languages: {
      it: "https://sitivetrina.it",
      en: "https://sitivetrina.it/en",
      "x-default": "https://sitivetrina.it",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      style={{ colorScheme: 'light' }}
    >
      <head>
        {/* Force light color scheme regardless of OS dark mode — the editor UI is always light */}
        <meta name="color-scheme" content="light" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "SitiVetrina",
              applicationCategory: "WebApplication",
              operatingSystem: "Web",
              description:
                "Editor drag & drop per creare siti web professionali per attività locali",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              creator: {
                "@type": "Organization",
                name: "Proximatica",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <GlobalDialogs />
      </body>
    </html>
  );
}
