import React from 'react';
import { resolveImageUrl } from '@/lib/image-utils';
import { Project } from '@/types/editor';

interface SitiImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  project?: Project | null;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

/**
 * SitiImage: Centralized component for rendering project images.
 * Handles path resolution, memory caching, and static vs dynamic URLs.
 */
export const SitiImage: React.FC<SitiImageProps> = ({ 
  src, 
  project, 
  isStatic, 
  imageMemoryCache, 
  ...props 
}) => {
  if (!src) return null;

  const resolved = resolveImageUrl(src, project || null, imageMemoryCache, isStatic);
  
  return (
    <img 
      src={resolved} 
      {...props} 
    />
  );
};
