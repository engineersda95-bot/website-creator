import React from 'react';
import { BlockType } from '@/types/editor';
import {
  Square, Type, Menu, Layout, ImageIcon, Grid,
  LayoutTemplate, MapPin, FileText, ShoppingBag, Plus, Minus,
  Phone, MousePointer2
} from 'lucide-react';

import { Hero } from '@/components/blocks/visual/Hero';
import { HeroContent } from '@/components/blocks/sidebar/block-editors/HeroContent';
import { HeroStyle } from '@/components/blocks/sidebar/block-editors/HeroStyle';

import { TextBlock } from '@/components/blocks/visual/TextBlock';
import { TextContent } from '@/components/blocks/sidebar/block-editors/TextContent';
import { TextStyle } from '@/components/blocks/sidebar/block-editors/TextStyle';

import { ImageTextBlock } from '@/components/blocks/visual/ImageTextBlock';
import { ImageTextContent } from '@/components/blocks/sidebar/block-editors/ImageTextContent';
import { ImageTextStyle } from '@/components/blocks/sidebar/block-editors/ImageTextStyle';

import { FAQBlock } from '@/components/blocks/visual/FaqBlock';
import { FAQContent } from '@/components/blocks/sidebar/block-editors/FaqContent';
import { FAQStyle } from '@/components/blocks/sidebar/block-editors/FaqStyle';

import { EmbedBlock } from '@/components/blocks/visual/EmbedBlock';
import { EmbedContent } from '@/components/blocks/sidebar/block-editors/EmbedContent';
import { EmbedStyle } from '@/components/blocks/sidebar/block-editors/EmbedStyle';

import { ContactBlock } from '@/components/blocks/visual/ContactBlock';
import { ContactContent } from '@/components/blocks/sidebar/block-editors/ContactContent';
import { ContactStyle } from '@/components/blocks/sidebar/block-editors/ContactStyle';

import { DividerBlock } from '@/components/blocks/visual/DividerBlock';
import { DividerContent } from '@/components/blocks/sidebar/block-editors/DividerContent';
import { DividerStyle } from '@/components/blocks/sidebar/block-editors/DividerStyle';

import { QuoteBlock } from '@/components/blocks/visual/QuoteBlock';
import { QuoteContent } from '@/components/blocks/sidebar/block-editors/QuoteContent';
import { QuoteStyle } from '@/components/blocks/sidebar/block-editors/QuoteStyle';

import { FooterBlock } from '@/components/blocks/visual/FooterBlock';
import { FooterContent } from '@/components/blocks/sidebar/block-editors/FooterContent';
import { FooterStyle } from '@/components/blocks/sidebar/block-editors/FooterStyle';

import { Navigation } from '@/components/blocks/visual/navigation/Navigation';
import { NavigationContent } from '@/components/blocks/sidebar/block-editors/NavigationContent';
import { NavigationStyle } from '@/components/blocks/sidebar/block-editors/NavigationStyle';

import { CardsBlock } from '@/components/blocks/visual/CardsBlock';
import { CardsContent } from '@/components/blocks/sidebar/block-editors/CardsContent';
import { CardsStyle } from '@/components/blocks/sidebar/block-editors/CardsStyle';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: any;
  visual: React.FC<any> | null;
  contentEditor: React.FC<any> | null;
  styleEditor: React.FC<any> | null;
  defaults: {
    content: any;
    style: any;
  };
}

export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  hero: {
    type: 'hero',
    label: 'Hero',
    icon: Square,
    visual: Hero,
    contentEditor: HeroContent,
    styleEditor: HeroStyle,
    defaults: {
      content: {
        title: 'La tua Visione, Reale',
        subtitle: 'Costruiamo esperienze digitali che lasciano il segno.',
        cta: 'Inizia Ora',
        ctaUrl: '#'
      },
      style: {
        padding: 120,
        align: 'center',
        buttonTheme: 'primary'
      }
    }
  },
  text: {
    type: 'text',
    label: 'Testo',
    icon: Type,
    visual: TextBlock,
    contentEditor: TextContent,
    styleEditor: TextStyle,
    defaults: {
      content: {
        text: 'Il tuo contenuto va qui. Usa questo blocco per descrivere la tua attività, i tuoi valori o qualsiasi altra informazione importante.'
      },
      style: {
        padding: 80,
        align: 'left'
      }
    }
  },
  'image-text': {
    type: 'image-text',
    label: 'Immagine e Testo',
    icon: Grid,
    visual: ImageTextBlock,
    contentEditor: ImageTextContent,
    styleEditor: ImageTextStyle,
    defaults: {
      content: {
        title: 'Innovazione in ogni dettaglio',
        text: 'Ogni progetto è un viaggio unico verso l\'eccellenza digitale.',
        imageSide: 'right',
        cta: 'Scopri di più'
      },
      style: {
        padding: 80,
        align: 'left',
        gap: 60,
        buttonTheme: 'secondary'
      }
    }
  },
  faq: {
    type: 'faq',
    label: 'FAQ',
    icon: FileText,
    visual: FAQBlock,
    contentEditor: FAQContent,
    styleEditor: FAQStyle,
    defaults: {
      content: {
        items: [
          { question: 'Come posso iniziare?', answer: 'Basta contattarci tramite il modulo sottostante.' },
          { question: 'Quali sono i tempi di consegna?', answer: 'In genere variano tra 2 e 4 settimane.' }
        ]
      },
      style: {
        padding: 80,
        align: 'left'
      }
    }
  },
  embed: {
    type: 'embed',
    label: 'Embed (Video/Code)',
    icon: Plus,
    visual: EmbedBlock,
    contentEditor: EmbedContent,
    styleEditor: EmbedStyle,
    defaults: {
      content: {
        type: 'youtube',
        code: ''
      },
      style: {
        padding: 60
      }
    }
  },
  contact: {
    type: 'contact',
    label: 'Contatti',
    icon: Phone,
    visual: ContactBlock,
    contentEditor: ContactContent,
    styleEditor: ContactStyle,
    defaults: {
      content: {
        title: 'Mettiamoci in Contatto',
        subtitle: 'Siamo qui per rispondere a ogni tua domanda. Scrivici e ti ricontatteremo entro 24 ore.',
        layout: 'stacked',
        email: 'info@tuosocial.it',
        phone: '+39 02 1234567',
        address: 'Via Roma 1, Milano',
        showMap: true
      },
      style: {
        padding: 100,
        hPadding: 40,
        gap: 64,
        align: 'center',
        borderRadius: 32,
        mapWidth: 100
      }
    }
  },
  divider: {
    type: 'divider',
    label: 'Separatore',
    icon: Minus,
    visual: DividerBlock,
    contentEditor: DividerContent,
    styleEditor: DividerStyle,
    defaults: {
      content: { type: 'line' },
      style: { padding: 40 }
    }
  },
  quote: {
    type: 'quote',
    label: 'Citazioni',
    icon: FileText,
    visual: QuoteBlock,
    contentEditor: QuoteContent,
    styleEditor: QuoteStyle,
    defaults: {
      content: { items: [], layout: 'grid' },
      style: { padding: 80 }
    }
  },
  footer: {
    type: 'footer',
    label: 'Footer',
    icon: Layout,
    visual: FooterBlock,
    contentEditor: FooterContent,
    styleEditor: FooterStyle,
    defaults: {
      content: { copyright: '© 2024 Tutti i diritti riservati' },
      style: { padding: 40 }
    }
  },
  navigation: {
    type: 'navigation',
    label: 'Navigazione',
    icon: Menu,
    visual: Navigation,
    contentEditor: NavigationContent,
    styleEditor: NavigationStyle as any,
    defaults: {
      content: { logoText: 'Studio', links: [], showContact: true },
      style: { padding: 20 }
    }
  },
  cta: { type: 'cta', label: 'CTA', icon: MousePointer2, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  map: { type: 'map', label: 'Mappa', icon: MapPin, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  testimonials: { type: 'testimonials', label: 'Testimonianze', icon: FileText, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  pricing: { type: 'pricing', label: 'Prezzi', icon: ShoppingBag, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  video: { type: 'video', label: 'Video', icon: ImageIcon, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  features: { type: 'features', label: 'Caratteristiche', icon: LayoutTemplate, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  gallery: { type: 'gallery', label: 'Galleria', icon: LayoutTemplate, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  image: { type: 'image', label: 'Immagine', icon: ImageIcon, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  reviews: { type: 'reviews', label: 'Recensioni', icon: FileText, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  'product-carousel': { type: 'product-carousel', label: 'Prodotti', icon: ShoppingBag, visual: null as any, contentEditor: null as any, styleEditor: null as any, defaults: { content: {}, style: {} } },
  cards: {
    type: 'cards',
    label: 'Carosello / Cards',
    icon: Grid,
    visual: CardsBlock,
    contentEditor: CardsContent,
    styleEditor: CardsStyle,
    defaults: {
      content: {
        title: 'Le Nostre Eccellenze',
        layout: 'grid',
        items: [
          { image: '', title: 'Servizio Premium', subtitle: 'Descrizione del servizio offerto' },
          { image: '', title: 'Ingegneria Avanzata', subtitle: 'Descrizione del servizio offerto' },
          { image: '', title: 'Design Moderno', subtitle: 'Descrizione del servizio offerto' }
        ]
      },
      style: {
        padding: 80,
        align: 'center',
        gap: 48,
        titleSize: 48,
        titleBold: false,
        imageAspectRatio: '16/9',
        imageBorderRadius: 24,
        imageShadow: true,
        imageHover: true,
        cardTitleBold: false,
        cardTitleSize: 28,
        cardSubtitleBold: false,
        cardSubtitleSize: 16
      }
    }
  },
};

export const getBlockDefinition = (type: string): BlockDefinition => {
  return BLOCK_DEFINITIONS[type as BlockType] || BLOCK_DEFINITIONS.text;
};

export const getBlockLibrary = (): BlockDefinition[] => {
  return Object.values(BLOCK_DEFINITIONS).filter(def =>
    !['navigation', 'footer'].includes(def.type) && def.visual !== null && typeof def.visual === 'function'
  );
};
