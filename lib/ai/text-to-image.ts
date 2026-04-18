import { getGenAI } from './gemini';

const IMAGEN_MODELS = [
  'imagen-4.0-generate-001',
  'imagen-4.0-ultra-generate-001',
  'imagen-4.0-fast-generate-001',
  'imagen-3.0-generate-001',
];

export type ImageAspectRatio =
  | '1:1'
  | '16:9'
  | '4:3'
  | '3:2'
  | '9:16'
  | 'landscape'
  | 'square'
  | 'portrait';

export interface TextToImageResult {
  data: string; // base64
  mimeType: string;
  modelUsed: string;
}

function mapAspectRatio(ratio?: string): string {
  if (!ratio) return '1:1';
  if (ratio === '16:9' || ratio === '3:2' || ratio === 'landscape') return '16:9';
  if (ratio === '9:16' || ratio === '2:3' || ratio === 'portrait') return '9:16';
  if (ratio === '4:3') return '4:3';
  return '1:1';
}

async function generateWithFlux(
  prompt: string,
  aspectRatio?: string,
): Promise<TextToImageResult | null> {
  const apiKey = process.env.PIXAZO_API_KEY;
  if (!apiKey) return null;

  try {
    console.log(`[Flux] Generating image with prompt: ${prompt.substring(0, 50)}...`);

    let width = 1024;
    let height = 1024;
    if (aspectRatio === '16:9' || aspectRatio === 'landscape') {
      width = 1024; height = 576;
    } else if (aspectRatio === '9:16' || aspectRatio === 'portrait') {
      width = 576; height = 1024;
    } else if (aspectRatio === '4:3') {
      width = 1024; height = 768;
    }

    const response = await fetch('https://gateway.pixazo.ai/flux-1-schnell/v1/getData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        prompt,
        num_steps: 20,
        seed: Math.floor(Math.random() * 1000),
        height,
        width,
      }),
    });

    if (!response.ok) {
      console.warn(`[Flux] API error: ${response.status} - ${await response.text()}`);
      return null;
    }

    const json = await response.json();
    const imageUrl = json.output;
    if (!imageUrl) return null;

    const imgRes = await fetch(imageUrl);
    const buffer = await imgRes.arrayBuffer();
    return {
      data: Buffer.from(buffer).toString('base64'),
      mimeType: 'image/png',
      modelUsed: 'flux-1-schnell',
    };
  } catch (err) {
    console.error('[Flux] Error:', err);
    return null;
  }
}

async function generateWithImagen(
  prompt: string,
  aspectRatio?: string,
): Promise<TextToImageResult> {
  const ratio = mapAspectRatio(aspectRatio);
  let lastError: any = null;

  for (const modelName of IMAGEN_MODELS) {
    try {
      console.log(`[Imagen] Attempting generation with ${modelName} (Ratio: ${ratio})...`);
      const model = getGenAI().getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          // @ts-ignore
          responseModalities: ['IMAGE'],
          // @ts-ignore
          imageConfig: { aspectRatio: ratio },
        },
      });

      const response = await result.response;
      if (response.promptFeedback?.blockReason) {
        throw new Error(`Generation blocked: ${response.promptFeedback.blockReason}`);
      }

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
          modelUsed: modelName,
        };
      }
      throw new Error(`No image data from ${modelName}.`);
    } catch (err: any) {
      console.warn(`[Imagen] ${modelName} failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(
    `All generation models failed. Last error: ${lastError?.message || 'Unknown error'}`,
  );
}

/**
 * Generates an image. Tries Flux first (if PIXAZO_API_KEY is set), then falls back to Imagen.
 */
export async function generateImage(
  prompt: string,
  aspectRatio?: string,
): Promise<TextToImageResult> {
  if (process.env.PIXAZO_API_KEY) {
    const fluxResult = await generateWithFlux(prompt, aspectRatio);
    if (fluxResult) return fluxResult;
  }
  return generateWithImagen(prompt, aspectRatio);
}
