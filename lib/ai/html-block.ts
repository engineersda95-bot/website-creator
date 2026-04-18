import { getGenAI, isRetryable, PRIMARY_MODEL, FALLBACK_MODEL } from './gemini';
import { buildHtmlBlockPrompt } from './prompts/html-block';

export interface GenerateHtmlBlockInput {
  prompt: string;
  referenceImageBase64?: string;
  referenceImageMime?: string;
  projectColors?: { bg: string; text: string; accent: string };
  projectFont?: string;
  history?: { role: 'user' | 'assistant'; text: string }[];
  currentHtml?: string;
  currentCss?: string;
  currentJs?: string;
}

export interface GenerateHtmlBlockResult {
  html: string;
  css: string;
  js: string;
}

function parseModelResponse(text: string): GenerateHtmlBlockResult {
  let raw = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(raw) as GenerateHtmlBlockResult;
  } catch { /* fall through */ }

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1)) as GenerateHtmlBlockResult;
    } catch { /* fall through */ }
  }

  const extract = (key: string) => {
    const m = raw.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    return m
      ? m[1]
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
      : '';
  };
  const html = extract('html');
  if (!html) throw new SyntaxError(`Cannot parse AI response: ${raw.slice(0, 200)}`);
  return { html, css: extract('css'), js: extract('js') };
}

async function callModel(
  modelName: string,
  parts: any[],
  timeoutMs: number,
): Promise<GenerateHtmlBlockResult> {
  const model = getGenAI().getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: 'application/json', temperature: 0.85 },
  });
  const result = await Promise.race([
    model.generateContent(parts),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Timeout: risposta troppo lenta, riprova.')),
        timeoutMs,
      ),
    ),
  ]);
  return parseModelResponse(result.response.text());
}

export async function generateHtmlBlock(
  input: GenerateHtmlBlockInput,
): Promise<GenerateHtmlBlockResult> {
  if (!input.prompt?.trim()) throw new Error('Descrizione vuota.');
  if (input.prompt.length > 3000) throw new Error('Descrizione troppo lunga (max 3000 caratteri).');

  const isFollowUp = !!(input.currentHtml || input.currentCss || input.currentJs);
  const timeoutMs = isFollowUp ? 45000 : 90000;

  const systemText = buildHtmlBlockPrompt({
    isFollowUp,
    projectFont: input.projectFont,
    projectAccent: input.projectColors?.accent,
  });

  const parts: any[] = [{ text: systemText }];

  if (isFollowUp) {
    parts.push({
      text: `CURRENT CODE TO MODIFY:\n\`\`\`html\n${input.currentHtml ?? ''}\n\`\`\`\n\`\`\`css\n${input.currentCss ?? ''}\n\`\`\`\n\`\`\`js\n${input.currentJs ?? ''}\n\`\`\`\n\nUSER REQUEST: ${input.prompt.trim()}`,
    });
  } else {
    if (input.referenceImageBase64 && input.referenceImageMime) {
      parts.push({ text: 'REFERENCE IMAGE — PRIMARY design source. Replicate layout and style closely:' });
      parts.push({ inlineData: { mimeType: input.referenceImageMime, data: input.referenceImageBase64 } });
    }
    parts.push({ text: `USER REQUEST:\n${input.prompt.trim()}` });
  }

  try {
    return await callModel(PRIMARY_MODEL, parts, timeoutMs);
  } catch (err: any) {
    if (isRetryable(err) || err instanceof SyntaxError) {
      return await callModel(FALLBACK_MODEL, parts, timeoutMs);
    }
    throw err;
  }
}
