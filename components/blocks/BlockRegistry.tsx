'use client';

import React from 'react';
import { Hero } from './Hero';
import { TextBlock } from './TextBlock';
import { NavBlock } from './NavBlock';
import { ImageBlock } from './ImageBlock';
import { FeaturesBlock } from './FeaturesBlock';
import { ContactBlock } from './ContactBlock';
import { FooterBlock } from './FooterBlock';
import { ImageText } from './ImageText';
import { Gallery } from './Gallery';
import { Map } from './Map';
import { ServicesBlock } from './ServicesBlock';
import { ReviewsBlock } from './ReviewsBlock';
import { EmbedBlock } from './EmbedBlock';
import { PDFViewerBlock } from './PDFViewerBlock';
import { ProductCarousel } from './ProductCarouselBlock';
import { BlockType } from '@/types/editor';

const registries: Record<BlockType, React.FC<any>> = {
  'hero': Hero,
  'text': TextBlock,
  'navigation': NavBlock,
  'image': ImageBlock,
  'image-text': ImageText,
  'gallery': Gallery,
  'features': FeaturesBlock,
  'contact': ContactBlock,
  'map': Map,
  'services': ServicesBlock,
  'reviews': ReviewsBlock,
  'embed': EmbedBlock,
  'pdf-viewer': PDFViewerBlock,
  'product-carousel': ProductCarousel,
  'footer': FooterBlock
};

export const getBlockComponent = (type: BlockType) => {
  return registries[type] || (() => <div>Unknown Block Type: {type}</div>);
};
