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
 * SitiImage: Centralized component for rendering project images.
 * Uses a container-based reveal system to ensure placeholders disappear for PNG transparency.
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
    <div className={cn("relative overflow-hidden project-img-placeholder", className)}>
      <img 
        src={resolved} 
        alt={props.alt || ""}
        data-siti-reveal="true"
        // SitiImage handles the reveal via a global script that removes the placeholder background
        className={cn(
          "siti-img-reveal opacity-0 transition-opacity duration-700 ease-out h-full w-full",
          className
        )}
        {...props} 
      />
    </div>
  );
};
