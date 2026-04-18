import { getGenAI, FALLBACK_MODEL } from './gemini';
import {
  buildImproveTextPrompt,
  buildTranslateBlogPrompt,
  type AITextAction,
  type AITextTone,
} from './prompts/blog';

export type { AITextAction, AITextTone };

export interface ImproveTextInput {
  text: string;
  action: AITextAction;
  tone: AITextTone;
  language: string;
  customInstruction?: string;
}

export async function improveText(input: ImproveTextInput): Promise<string> {
  if (!input.text || input.text.replace(/<[^>]*>/g, '').trim().length < 10) {
    throw new Error('Il testo è troppo corto per essere migliorato.');
  }

  const prompt = buildImproveTextPrompt(input);
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 8000 },
  });

  let output = result.response.text();
  if (!output || output.trim().length < 10) throw new Error('La risposta AI è vuota.');
  output = output
    .trim()
    .replace(/^```(?:markdown|md)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '');
  return output.trim();
}

export interface TranslateBlogInput {
  title: string;
  excerpt: string;
  body: string;
  sourceLang: string;
  targetLang: string;
}

export async function translateBlogPost(
  input: TranslateBlogInput,
): Promise<{ title: string; excerpt: string; body: string }> {
  const prompt = buildTranslateBlogPrompt(input);
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 10000, responseMimeType: 'application/json' },
  });

  const output = result.response.text().trim();
  const parsed = JSON.parse(output);
  if (!parsed.title || !parsed.body) throw new Error('Risposta AI incompleta');
  parsed.body = parsed.body
    .replace(/^```(?:markdown|md)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '');
  return parsed;
}
