import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { GalleryBlock } from './GalleryBlock';
import { GalleryContent } from '../sidebar/block-editors/GalleryContent';
import { GalleryStyle } from '../sidebar/block-editors/GalleryStyle';
import { GalleryUnified } from '../sidebar/block-editors/GalleryUnified';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

const PreviewMasonry: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="8" y="8" width="58" height="45" rx="6" fill="#e4e4e7" />
    <rect x="8" y="58" width="58" height="54" rx="6" fill="#e4e4e7" />
    <rect x="72" y="8" width="58" height="65" rx="6" fill="#e4e4e7" />
    <rect x="72" y="78" width="58" height="34" rx="6" fill="#e4e4e7" />
    <rect x="136" y="8" width="58" height="35" rx="6" fill="#e4e4e7" />
    <rect x="136" y="48" width="58" height="64" rx="6" fill="#e4e4e7" />
  </svg>
);

const PreviewGrid: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="8" y="8" width="58" height="48" rx="6" fill="#e4e4e7" />
    <rect x="72" y="8" width="58" height="48" rx="6" fill="#e4e4e7" />
    <rect x="136" y="8" width="58" height="48" rx="6" fill="#e4e4e7" />
    <rect x="8" y="62" width="58" height="48" rx="6" fill="#e4e4e7" />
    <rect x="72" y="62" width="58" height="48" rx="6" fill="#e4e4e7" />
    <rect x="136" y="62" width="58" height="48" rx="6" fill="#e4e4e7" />
  </svg>
);

const PreviewSlider: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="10" y="15" width="70" height="90" rx="8" fill="#e4e4e7" />
    <rect x="85" y="15" width="70" height="90" rx="8" fill="#e4e4e7" />
    <rect x="160" y="15" width="70" height="90" rx="8" fill="#d4d4d8" opacity="0.5" />
    <circle cx="10" cy="60" r="8" fill="#fafafa" stroke="#e4e4e7" />
    <path d="M12 57 L9 60 L12 63" stroke="#a1a1aa" strokeWidth="1.5" fill="none" />
    <circle cx="190" cy="60" r="8" fill="#fafafa" stroke="#e4e4e7" />
    <path d="M188 57 L191 60 L188 63" stroke="#a1a1aa" strokeWidth="1.5" fill="none" />
  </svg>
);

const PreviewFeatured: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect x="8" y="8" width="120" height="104" rx="8" fill="#e4e4e7" />
    <rect x="134" y="8" width="58" height="32" rx="6" fill="#e4e4e7" />
    <rect x="134" y="44" width="58" height="32" rx="6" fill="#e4e4e7" />
    <rect x="134" y="80" width="58" height="32" rx="6" fill="#e4e4e7" />
  </svg>
);

export const galleryDefinition: BlockDefinition = {
  type: 'gallery',
  label: 'Galleria',
  icon: LayoutTemplate,
  visual: GalleryBlock,
  contentEditor: GalleryContent,
  styleEditor: GalleryStyle,
  unifiedEditor: GalleryUnified,
  defaults: {
    content: {
      variant: 'masonry',
      title: 'La Nostra Galleria',
      images: [
        { image: '', alt: 'Immagine 1' },
        { image: '', alt: 'Immagine 2' },
        { image: '', alt: 'Immagine 3' },
        { image: '', alt: 'Immagine 4' },
      ],
    },
    style: {
      padding: 80,
      align: 'center',
      gap: 16,
      columns: 3,
      imageAspectRatio: 'original',
      imageBorderRadius: 16,
      imageShadow: false,
      imageHover: true,
      titleBold: false,
      titleTag: 'h2',
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    },
    responsiveStyles: {
      tablet: { columns: 2, gap: 12 },
      mobile: { columns: 1, gap: 8 }
    }
  },
  variants: [
    { id: 'masonry', label: 'Masonry', description: 'Colonne con altezze variabili', preview: PreviewMasonry },
    { id: 'grid', label: 'Griglia', description: 'Griglia uniforme con aspect ratio fisso', preview: PreviewGrid },
    { id: 'slider', label: 'Slider', description: 'Carosello orizzontale scorrevole', preview: PreviewSlider },
    { id: 'featured', label: 'In evidenza', description: 'Prima immagine grande, resto in griglia', preview: PreviewFeatured },
  ],
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;

    return {
      ...vars,
      '--gallery-gap': toPx(val('gap', 16), '16px'),
      '--gallery-columns': val('columns', 3),
      '--image-radius': toPx(val('imageBorderRadius', 16), '16px'),
      '--image-aspect': block.content?.imageAspectRatio || val('imageAspectRatio', 'original'),
    };
  }
};
