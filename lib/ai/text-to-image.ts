
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
        num_steps: 30,
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

export async function generateImage(
  prompt: string,
  aspectRatio?: string,
): Promise<TextToImageResult> {
  const fluxResult = await generateWithFlux(prompt, aspectRatio);
  if (fluxResult) return fluxResult;
  throw new Error('Image generation failed: Flux returned no result.');
}
