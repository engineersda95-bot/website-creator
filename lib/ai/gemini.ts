import { GoogleGenerativeAI } from '@google/generative-ai';

export const PRIMARY_MODEL = 'gemini-3-flash-preview';
export const FALLBACK_MODEL = 'gemini-3.1-flash-lite-preview';

export function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY non configurata.');
  return new GoogleGenerativeAI(key);
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
  return JSON.parse(raw);
}
