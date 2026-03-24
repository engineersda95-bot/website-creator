import { Project } from '@/types/editor';
import { getProjectDomain } from './url-utils';

/**
 * Generates a consistent filename based on image data
 */
export async function getImageHash(base64: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(base64);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Resolves a stored URL (relative or base64) to a displayable URL
 */
export function resolveImageUrl(
  url: string | undefined, 
  project: Project | null, 
  memoryCache?: Record<string, string>,
  isStatic?: boolean
): string {
  if (!url) return '';
  
  // 1. If it's already a full URL or base64, return as is
  if (url.startsWith('http') || url.startsWith('data:')) return url;

  // 2. IMPORTANT: For static sites, we want the relative path as is
  if (isStatic && url.startsWith('/assets/')) return url;

  // 3. If it's a relative path (/assets/...)
  if (url.startsWith('/assets/')) {
    // Check memory cache first (for newly uploaded images)
    if (memoryCache && memoryCache[url]) {
      return memoryCache[url];
    }

    // fallback to Supabase Public URL for the editor
    if (project) {
      // Construction: https://[project].supabase.co/storage/v1/object/public/project-assets/[project-id]/[filename]
      // We store it as /assets/img_[hash].[ext] -> we need to map back to bucket path
      const filename = url.replace('/assets/', '');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (supabaseUrl) {
        // Use project.id as the folder name on Supabase Storage
        return `${supabaseUrl}/storage/v1/object/public/project-assets/${project.id}/${filename}`;
      }

      // Final fallback: use the live URL or fall back to predicted subdomain
      const baseUrl = getProjectDomain(project);
      return `${baseUrl}${url}`;
    }
  }

  return url;
}

/**
 * Converts a base64 image (PNG, JPG, etc) to a WebP optimized Blob.
 * If conversion fails or is not supported, it returns the original info.
 */
export async function optimizeImageToWebP(
  base64: string, 
  quality: number = 0.8
): Promise<{ blob: Blob; extension: string; size: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed'));
          return;
        }
        resolve({
          blob,
          extension: 'webp',
          size: blob.size
        });
      }, 'image/webp', quality);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for optimization'));
    img.src = base64;
  });
}

export function isRelativeAsset(url: string): boolean {
  return url.startsWith('/assets/');
}

export function getAssetRelativePath(hash: string, extension: string): string {
  return `/assets/img_${hash}.${extension}`;
}
