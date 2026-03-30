import React from 'react';
import { resolveImageUrl } from '@/lib/image-utils';
import { Project } from '@/types/editor';
import { cn } from '@/lib/utils';

interface SitiImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  project?: Project | null;
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
}

/**
 * SitiImage: Standardized image component.
 * Back to 100% native <img> behavior for maximum raw speed.
 */
export const SitiImage: React.FC<SitiImageProps> = ({ 
  src, 
  project, 
  isStatic, 
  imageMemoryCache, 
  className,
  ...props 
}) => {
  if (!src) return null;

  const resolved = resolveImageUrl(src, project || null, imageMemoryCache, isStatic);

  return (
    <img 
      src={resolved} 
      alt={props.alt || ""}
      className={className}
      {...props} 
    />
  );
};
