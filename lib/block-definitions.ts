import { BlockType } from '@/types/editor';
import { BlockDefinition } from '@/types/block-definition';
import { MapPin, LayoutTemplate, ImageIcon, FileText, ShoppingBag } from 'lucide-react';

import { heroDefinition } from '@/components/blocks/visual/Hero.definition';
import { textDefinition } from '@/components/blocks/visual/TextBlock.definition';
import { imageTextDefinition } from '@/components/blocks/visual/ImageTextBlock.definition';
import { faqDefinition } from '@/components/blocks/visual/FAQBlock.definition';
import { embedDefinition } from '@/components/blocks/visual/EmbedBlock.definition';
import { contactDefinition } from '@/components/blocks/visual/ContactBlock.definition';
import { dividerDefinition } from '@/components/blocks/visual/DividerBlock.definition';
import { quoteDefinition } from '@/components/blocks/visual/QuoteBlock.definition';
import { footerDefinition } from '@/components/blocks/visual/FooterBlock.definition';
import { navigationDefinition } from '@/components/blocks/visual/navigation/Navigation.definition';
import { cardsDefinition } from '@/components/blocks/visual/CardsBlock.definition';
import { logosDefinition } from '@/components/blocks/visual/Logos.definition';
import { benefitsDefinition } from '@/components/blocks/visual/Benefits.definition';
import { howItWorksDefinition } from '@/components/blocks/visual/HowItWorks.definition';
import { singleImageDefinition } from '@/components/blocks/visual/SingleImage.definition';
import { pdfDefinition } from '@/components/blocks/visual/PdfBlock.definition';
import { pricingDefinition } from '@/components/blocks/visual/PricingBlock.definition';
import { galleryDefinition } from '@/components/blocks/visual/GalleryBlock.definition';

export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  hero: heroDefinition,
  text: textDefinition,
  'image-text': imageTextDefinition,
  faq: faqDefinition,
  embed: embedDefinition,
  contact: contactDefinition,
  divider: dividerDefinition,
  quote: quoteDefinition,
  footer: footerDefinition,
  navigation: navigationDefinition,
  logos: logosDefinition,
  cards: cardsDefinition,
  benefits: benefitsDefinition,
  'how-it-works': howItWorksDefinition,
  image: singleImageDefinition,
  pdf: pdfDefinition,
  pricing: pricingDefinition,
  gallery: galleryDefinition,
  
  // Placeholders for unimplemented/transitioning blocks
  map: { type: 'map', label: 'Mappa', icon: MapPin, visual: null, defaults: { content: {}, style: {} } },
  features: { type: 'features', label: 'Caratteristiche', icon: LayoutTemplate, visual: null, defaults: { content: {}, style: {} } },
  reviews: { type: 'reviews', label: 'Recensioni', icon: FileText, visual: null, defaults: { content: {}, style: {} } },
  'product-carousel': { type: 'product-carousel', label: 'Prodotti', icon: ShoppingBag, visual: null, contentEditor: null, styleEditor: null, defaults: { content: {}, style: {} } },
};

export const getBlockDefinition = (type: string): BlockDefinition => {
  return BLOCK_DEFINITIONS[type as BlockType] || BLOCK_DEFINITIONS.text;
};

export const getBlockLibrary = (): BlockDefinition[] => {
  return Object.values(BLOCK_DEFINITIONS).filter(def =>
    def.visual !== null && typeof def.visual === 'function'
  );
};
