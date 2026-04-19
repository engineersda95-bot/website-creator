import { GoogleGenerativeAI } from '@google/generative-ai';

export const PRIMARY_MODEL = 'gemini-3-flash-preview';
export const FALLBACK_MODEL = 'gemini-3.1-flash-lite-preview';

export function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY non configurata.');
  return new GoogleGenerativeAI(key);
}

export function friendlyAiError(msg: string): string {
  if (msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand'))
    return 'Il servizio AI è temporaneamente sovraccarico. Riprova tra qualche minuto.';
  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('RESOURCE_EXHAUSTED'))
    return 'Limite di richieste AI raggiunto. Riprova tra qualche minuto.';
  if (msg.includes('500') || msg.includes('Internal Server Error'))
    return 'Errore interno del servizio AI. Riprova tra qualche minuto.';
  if (msg.includes('Timeout') || msg.includes('timeout'))
    return 'Il servizio AI ha impiegato troppo tempo. Riprova.';
  if (msg.includes('GEMINI_API_KEY') || msg.includes('API key'))
    return 'Configurazione AI non disponibile. Contatta il supporto.';
  return msg;
}

export function isRetryable(err: any): boolean {
  const status = err?.status || err?.response?.status || err?.httpStatusCode;
  return status === 429 || status === 503 || status === 500 || status === 403;
}

export async function callJsonModel(
  modelName: string,
  parts: any[],
  timeoutMs: number,
  temperature?: number,
): Promise<any> {
  const model = getGenAI().getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      ...(temperature !== undefined ? { temperature } : {}),
    },
  });
  const result = await Promise.race([
    model.generateContent(parts),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${modelName}`)), timeoutMs),
    ),
  ]);
  const raw = result.response
    .text()
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '');
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.search(/[{[]/);
    const end = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'));
    if (start !== -1 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new SyntaxError(`Invalid JSON from model: ${raw.slice(0, 200)}`);
  }
}
