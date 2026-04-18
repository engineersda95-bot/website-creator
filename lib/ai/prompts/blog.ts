export type AITextAction = 'improve' | 'expand' | 'summarize' | 'rewrite';
export type AITextTone = 'professional' | 'casual' | 'formal' | 'persuasive' | 'technical';

const ACTION_MAP: Record<AITextAction, string> = {
  improve:
    'Migliora la scrittura: rendi il testo più fluido, chiaro e coinvolgente. Correggi errori grammaticali e migliora la struttura delle frasi.',
  expand:
    'Espandi il testo: aggiungi dettagli, esempi e paragrafi per rendere il contenuto più completo e approfondito. Almeno il doppio della lunghezza.',
  summarize:
    'Riassumi il testo: mantieni i concetti chiave ma riduci significativamente la lunghezza. Massimo 1/3 della lunghezza originale.',
  rewrite:
    'Riscrivi completamente il testo: mantieni il significato ma cambia completamente la struttura e le parole usate.',
};

const TONE_MAP: Record<AITextTone, string> = {
  professional: 'Tono professionale: competente, autorevole, bilanciato.',
  casual: 'Tono informale/colloquiale: amichevole, accessibile, diretto.',
  formal: 'Tono formale/istituzionale: elegante, distaccato, preciso.',
  persuasive: "Tono persuasivo/marketing: coinvolgente, orientato all'azione, emotivo.",
  technical: 'Tono tecnico: preciso, dettagliato, con terminologia specifica del settore.',
};

export const LANG_MAP: Record<string, string> = {
  it: 'italiano',
  en: 'inglese',
  es: 'spagnolo',
  fr: 'francese',
  de: 'tedesco',
};

export function buildImproveTextPrompt(params: {
  text: string;
  action: AITextAction;
  tone: AITextTone;
  language: string;
  customInstruction?: string;
}): string {
  const { text, action, tone, language, customInstruction } = params;
  return `Sei un copywriter professionista. Devi lavorare su un testo per un articolo di blog.

AZIONE: ${ACTION_MAP[action]}
TONO: ${TONE_MAP[tone]}
LINGUA: Scrivi in ${LANG_MAP[language] || language}.
${customInstruction ? `ISTRUZIONE AGGIUNTIVA: ${customInstruction}` : ''}

REGOLE DI STRUTTURA:
- DIVIDI SEMPRE il testo in sezioni chiare con titoli ## (h2) e sottotitoli ### (h3)
- Ogni sezione deve avere un titolo descrittivo e accattivante
- Alterna tra paragrafi, liste puntate, liste numerate e citazioni per rendere il testo dinamico
- Usa **grassetto** per i concetti chiave e *corsivo* per enfasi
- Inserisci almeno 3-5 sezioni con ## anche se il testo originale non le ha
- Ogni sezione deve avere 2-4 paragrafi

REGOLE DI FORMATO:
- Restituisci SOLO il testo risultante in formato Markdown puro
- NON usare HTML — solo Markdown (##, ###, **, *, -, 1., >, [testo](url))
- NON aggiungere commenti, spiegazioni, note o blocchi di codice
- NON iniziare con \`\`\`markdown — restituisci direttamente il contenuto
- Mantieni lo stesso argomento del testo originale

TESTO ORIGINALE:
${text}`;
}

export function buildTranslateBlogPrompt(params: {
  title: string;
  excerpt: string;
  body: string;
  sourceLang: string;
  targetLang: string;
}): string {
  const { title, excerpt, body, sourceLang, targetLang } = params;
  return `Sei un traduttore professionista. Traduci il seguente articolo di blog da ${LANG_MAP[sourceLang] || sourceLang} a ${LANG_MAP[targetLang] || targetLang}.

REGOLE:
- Mantieni ESATTAMENTE la stessa struttura Markdown (##, ###, **, *, -, liste, link, ecc.)
- Traduci in modo naturale, non letterale — adatta le espressioni alla lingua di destinazione
- NON aggiungere commenti o note
- Rispondi SOLO con un JSON valido con 3 campi: title, excerpt, body

TITOLO ORIGINALE:
${title}

ESTRATTO ORIGINALE:
${excerpt}

CORPO ORIGINALE (Markdown):
${body}

Rispondi con JSON:
{"title": "...", "excerpt": "...", "body": "..."}`;
}
