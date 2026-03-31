import { LayoutTemplate } from 'lucide-react';
import { GalleryBlock } from './GalleryBlock';
import { GalleryContent } from '../sidebar/block-editors/GalleryContent';
import { GalleryStyle } from '../sidebar/block-editors/GalleryStyle';
import { GalleryUnified } from '../sidebar/block-editors/GalleryUnified';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

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
      imageAspectRatio: 'original', // Options: 1/1, 4/3, 16/9, original
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
