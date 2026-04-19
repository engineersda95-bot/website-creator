import { generateImage } from './text-to-image';
import { getUnsplashUrl, getHeroUnsplashUrl } from './unsplash-images';
import { createAdminClient } from '@/lib/supabase/server';
import sharp from 'sharp';

interface GenerationTask {
  prompt: string;
  ratio: string;
  block: any;
  field: string;
  itemIdx?: number;
  fallbackUrl: string;
}

async function uploadAiImage(
  base64: string,
  filename: string,
  userId: string,
  projectId: string,
): Promise<string> {
  try {
    const adminClient = createAdminClient();
    const inputBuffer = Buffer.from(base64, 'base64');
    const webpBuffer = await sharp(inputBuffer).webp({ quality: 82 }).toBuffer();
    const webpFilename = filename.replace(/\.[^.]+$/, '.webp');
    const storagePath = `${userId}/${projectId}/${webpFilename}`;
    const { error } = await adminClient.storage
      .from('project-assets')
      .upload(storagePath, webpBuffer, { contentType: 'image/webp', upsert: true });
    if (error) throw error;
    return `/assets/${webpFilename}`;
  } catch (err) {
    console.error('[AI Image Upload] Error:', err);
    return '';
  }
}

function buildImagePrompt(blockTitle: string, subject: string): string {
  const finalTitle = blockTitle || 'Business';
  const finalSubject = subject || finalTitle || 'a modern professional scene';
  return `A realistic photographic scene representing ${finalTitle}.
Main subject: ${finalSubject}
Foreground: main subject in focus
Background: soft blurred environment
Style: professional editorial photography
Camera: 50mm lens, shallow depth of field
IMPORTANT: no text, no letters, no watermark`;
}

export async function validateAndCleanBackgroundImages(
  enrichedPages: any[],
  businessType?: string,
  creativeMode?: boolean,
  projectId?: string,
  imageGenMode?: 'stock' | 'ai',
  userId?: string,
  supabase?: any,
): Promise<{ aiImageCount: number }> {
  const checks: Promise<void>[] = [];
  const generationTasks: GenerationTask[] = [];

  for (const page of enrichedPages) {
    for (const block of page.blocks || []) {
      const blockTitle = block.content?.title || block.content?.heading || '';
      const aiMainSubject = block.content?.imagePrompt || block.content?.mainSubject || '';

      // Hero backgroundImage
      if (block.type === 'hero') {
        const prompt = buildImagePrompt(blockTitle, aiMainSubject);
        const fallback = getHeroUnsplashUrl(businessType || '');
        if (!block.content?.backgroundImage) {
          if (imageGenMode === 'ai') {
            generationTasks.push({ prompt, ratio: '16:9', block, field: 'backgroundImage', fallbackUrl: fallback });
          } else {
            block.content = { ...block.content, backgroundImage: fallback };
          }
          block.style.overlayOpacity = 65;
          block.style.overlayColor = '#000000';
          block.style.textColor = '#ffffff';
        } else if (block.content.backgroundImage.startsWith('http')) {
          checks.push(
            fetch(block.content.backgroundImage, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
              .then(res => { if (!res.ok) block.content.backgroundImage = fallback; })
              .catch(() => { block.content.backgroundImage = fallback; }),
          );
        }
      } else if (block.content?.backgroundImage) {
        if (
          block.content.backgroundImage.startsWith('http') &&
          !block.content.backgroundImage.includes('picsum.photos')
        ) {
          checks.push(
            fetch(block.content.backgroundImage, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
              .then(res => {
                if (!res.ok) {
                  const prompt = buildImagePrompt(blockTitle, aiMainSubject);
                  if (creativeMode) {
                    generationTasks.push({ prompt, ratio: '16:9', block, field: 'backgroundImage', fallbackUrl: '' });
                  } else {
                    block.content.backgroundImage = '';
                    delete block.style.overlayOpacity;
                    delete block.style.overlayColor;
                    delete block.style.textColor;
                  }
                }
              })
              .catch(() => { /* keep on network error */ }),
          );
        }
      }

      // image-text block
      if (block.type === 'image-text') {
        if (block.content?.imageUrl && !block.content?.image) {
          block.content.image = block.content.imageUrl;
          delete block.content.imageUrl;
        }
        const imgSrc = block.content?.image || '';
        const fallbackSeed = `${block.content?.sectionId || block.type}-${block.content?.title || 'section'}`;
        const fallback = getUnsplashUrl(businessType || '', fallbackSeed);

        if (!imgSrc) {
          if (imageGenMode === 'ai') {
            generationTasks.push({
              prompt: buildImagePrompt(blockTitle, aiMainSubject),
              ratio: '4:3',
              block,
              field: 'image',
              fallbackUrl: fallback,
            });
          } else {
            block.content = { ...block.content, image: fallback };
          }
        } else if (imgSrc.startsWith('http')) {
          checks.push(
            fetch(imgSrc, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
              .then(res => { if (!res.ok) block.content.image = fallback; })
              .catch(() => { block.content.image = fallback; }),
          );
        }
      }

      // Blocks with items[*].image
      if (['cards', 'promo'].includes(block.type)) {
        const items = block.content?.items;
        if (Array.isArray(items)) {
          const blockSectionId = block.content?.sectionId || block.type;
          items.forEach((item: any, idx: number) => {
            const itemSeed = `${blockSectionId}-${idx}-${item.title || item.name || 'item'}`;
            const fallback = getUnsplashUrl(businessType || '', itemSeed);
            if (!item.image) {
              if (imageGenMode === 'ai') {
                const itemTitle = item.title || item.name || '';
                const itemSubject = item.imagePrompt || item.mainSubject || '';
                generationTasks.push({
                  prompt: buildImagePrompt(itemSubject || itemTitle, itemSubject || itemTitle),
                  ratio: '16:9',
                  block,
                  field: 'items',
                  itemIdx: idx,
                  fallbackUrl: fallback,
                });
              } else {
                item.image = fallback;
              }
            } else if (item.image.startsWith('http')) {
              checks.push(
                fetch(item.image, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
                  .then(res => { if (!res.ok) item.image = fallback; })
                  .catch(() => { item.image = fallback; }),
              );
            }
          });
        }
      }
    }
  }

  let aiImageCount = 0;

  if (generationTasks.length > 0) {
    console.log(`[Imagen] Starting parallel generation for ${generationTasks.length} images...`);
    const results = await Promise.allSettled(
      generationTasks.map(async (task, idx) => {
        try {
          const gen = await generateImage(task.prompt, task.ratio as any);
          const filename = `ai-gen-${Date.now()}-${idx}.jpg`;
          const url =
            userId && projectId
              ? await uploadAiImage(gen.data, filename, userId, projectId)
              : '';
          if (url) {
            if (task.itemIdx !== undefined) {
              task.block.content.items[task.itemIdx].image = url;
            } else {
              task.block.content[task.field] = url;
            }
            return true;
          }
        } catch (err) {
          console.error(`[Imagen] Task failed for "${task.prompt.substring(0, 50)}":`, err);
        }
        if (task.itemIdx !== undefined) {
          task.block.content.items[task.itemIdx].image = task.fallbackUrl;
        } else {
          task.block.content[task.field] = task.fallbackUrl;
        }
        return false;
      }),
    );
    aiImageCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    console.log(`[Imagen] Finished. Successfully generated ${aiImageCount}/${generationTasks.length} images.`);
  }

  await Promise.allSettled(checks);
  return { aiImageCount };
}
