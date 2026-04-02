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
 * SitiImage: Standardized image component with performance defaults.
 * - loading="lazy" by default (override with loading="eager" for hero/above-fold)
 * - decoding="async" for non-blocking decode
 * - width/height to prevent CLS (if provided)
 */
export const SitiImage: React.FC<SitiImageProps> = ({
  src,
  project,
  isStatic,
  imageMemoryCache,
  className,
  loading,
  ...props
}) => {
  if (!src) return null;

  const resolved = resolveImageUrl(src, project || null, imageMemoryCache, isStatic);
  const isEager = loading === 'eager' || (props as any).fetchPriority === 'high';

  return (
    <img
      src={resolved}
      alt={props.alt || ""}
      loading={loading || "lazy"}
      decoding={isEager ? "sync" : "async"}
      className={className}
      {...props}
    />
  );
};
