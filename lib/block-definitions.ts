import { BlockType } from '@/types/editor';
import {
  Square, Type, Layout, Menu, Minus, HelpCircle, Share2, Quote
} from 'lucide-react';

// Visual Components
import { Hero } from '@/components/blocks/visual/Hero';
import { TextBlock } from '@/components/blocks/visual/TextBlock';
import { Navigation } from '@/components/blocks/visual/navigation/Navigation';
import { FooterBlock } from '@/components/blocks/visual/FooterBlock';
import { DividerBlock } from '@/components/blocks/visual/DividerBlock';
import { FAQBlock } from '@/components/blocks/visual/FaqBlock';
import { EmbedBlock } from '@/components/blocks/visual/EmbedBlock';
import { QuoteBlock } from '@/components/blocks/visual/QuoteBlock';
import { ImageTextBlock } from '@/components/blocks/visual/ImageTextBlock';

// Editor Components
import { HeroContent } from '@/components/blocks/sidebar/block-editors/HeroContent';
import { HeroStyle } from '@/components/blocks/sidebar/block-editors/HeroStyle';
import { TextContent } from '@/components/blocks/sidebar/block-editors/TextContent';
import { TextStyle } from '@/components/blocks/sidebar/block-editors/TextStyle';
import { NavigationContent } from '@/components/blocks/sidebar/block-editors/NavigationContent';
import { NavigationStyle } from '@/components/blocks/sidebar/block-editors/NavigationStyle';
import { FooterContent } from '@/components/blocks/sidebar/block-editors/FooterContent';
import { FooterStyle } from '@/components/blocks/sidebar/block-editors/FooterStyle';
import { DividerContent } from '@/components/blocks/sidebar/block-editors/DividerContent';
import { DividerStyle } from '@/components/blocks/sidebar/block-editors/DividerStyle';
import { FAQContent } from '@/components/blocks/sidebar/block-editors/FaqContent';
import { FAQStyle } from '@/components/blocks/sidebar/block-editors/FaqStyle';
import { EmbedContent } from '@/components/blocks/sidebar/block-editors/EmbedContent';
import { EmbedStyle } from '@/components/blocks/sidebar/block-editors/EmbedStyle';
import { QuoteContent } from '@/components/blocks/sidebar/block-editors/QuoteContent';
import { QuoteStyle } from '@/components/blocks/sidebar/block-editors/QuoteStyle';
import { ImageTextContent } from '@/components/blocks/sidebar/block-editors/ImageTextContent';
import { ImageTextStyle } from '@/components/blocks/sidebar/block-editors/ImageTextStyle';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: any;
  visual?: React.FC<any>;
  contentEditor?: React.FC<any>;
  styleEditor?: React.FC<any>;
  defaults: {
    content: any;
    style: any;
  };
}

export const BLOCK_DEFINITIONS: Record<string, BlockDefinition> = {
  'hero': {
    type: 'hero',
    label: 'Hero Section',
    icon: Square,
    visual: Hero,
    contentEditor: HeroContent,
    styleEditor: HeroStyle,
    defaults: {
      content: {
        title: 'Benvenuti nel Futuro',
        subtitle: 'Un design minimalista ed elegante per la tua brand identity. Ogni dettaglio è curato per massimizzare l\'impatto visivo.',
        cta: 'Esplora Ora',
        logoLinkHome: true
      },
      style: { minHeight: 700, padding: 100, align: 'center', backgroundSize: 'cover', overlayOpacity: 40, overlayColor: '#000000' }
    }
  },
  'navigation': {
    type: 'navigation',
    label: 'Main Navigation',
    icon: Menu,
    visual: Navigation,
    contentEditor: NavigationContent,
    styleEditor: NavigationStyle as any,
    defaults: {
      content: { logoText: 'Studio', logoType: 'text', logoSize: 40, logoTextSize: 24, links: [{ label: 'Home', url: '/' }, { label: 'Chi Siamo', url: '/chi-siamo' }], cta: 'Inizia Ora', showContact: true, logoLinkHome: true },
      style: { padding: 0, fontSize: 14 }
    }
  },
  'text': {
    type: 'text',
    label: 'Simple Text',
    icon: Type,
    visual: TextBlock,
    contentEditor: TextContent,
    styleEditor: TextStyle,
    defaults: {
      content: { text: 'Inserisci qui il tuo contenuto testuale. Puoi formattarlo come preferisci.' },
      style: { padding: 60, align: 'center', maxWidth: 800 }
    }
  },
  'divider': {
    type: 'divider',
    label: 'Divider Line',
    icon: Minus,
    visual: DividerBlock,
    contentEditor: DividerContent,
    styleEditor: DividerStyle,
    defaults: {
      content: {},
      style: { padding: 40, align: 'center', dividerStroke: 1, dividerWidth: 100 }
    }
  },
  'footer': {
    type: 'footer',
    label: 'Footer Section',
    icon: Layout,
    visual: FooterBlock,
    contentEditor: FooterContent,
    styleEditor: FooterStyle,
    defaults: {
      content: { logoText: 'SitiVetrina', copyright: `© ${new Date().getFullYear()} SitiVetrina`, layout: 'simple' },
      style: { padding: 40 }
    }
  },
  'faq': {
    type: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    visual: FAQBlock,
    contentEditor: FAQContent,
    styleEditor: FAQStyle,
    defaults: {
      content: {
        title: 'FAQ',
        items: [
          { question: 'Come posso contattarvi?', answer: 'Puoi contattarci tramite il modulo contatti o via email.' },
          { question: 'Quali sono i tempi di consegna?', answer: 'I tempi variano in base al progetto, solitamente tra 2 e 4 settimane.' }
        ]
      },
      style: { padding: 80, questionSize: 18, answerSize: 16, questionBold: true }
    }
  },
  'embed': {
    type: 'embed',
    label: 'Social Embed (Youtube, Instagram)',
    icon: Share2,
    visual: EmbedBlock,
    contentEditor: EmbedContent,
    styleEditor: EmbedStyle,
    defaults: {
      content: {
        type: 'youtube',
        url: '',
        title: ''
      },
      style: {
        padding: 40,
        hPadding: 0,
        align: 'center',
        maxWidth: 1200,
        minHeight: 450,
        borderRadius: 24,
        borderWidth: 0,
        borderColor: '#e5e7eb'
      }
    }
  },
  'quote': {
    type: 'quote',
    label: 'Recensioni / Quote',
    icon: Quote,
    visual: QuoteBlock,
    contentEditor: QuoteContent,
    styleEditor: QuoteStyle,
    defaults: {
      content: {
        title: 'Dicono di noi',
        layout: 'grid',
        visualType: 'quotes',
        avatarShape: 'circle',
        avatarSize: 60,
        avatarAspectRatio: '1/1',
        items: [
          { text: 'Il miglior servizio che abbia mai provato. Professionalità e velocità ai massimi livelli.', name: 'Marco Rossi', role: 'CEO @ TechFlow', stars: 5 },
          { text: 'Esperienza fantastica! Il team ha capito perfettamente le mie esigenze fin dal primo giorno.', name: 'Laura Bianchi', role: 'Founder @ CreativeLab', stars: 5 },
          { text: 'Consiglio vivamente questo studio a chiunque cerchi qualità e innovazione.', name: 'Alessandro Neri', role: 'Owner @ Neri Design', stars: 5 }
        ]
      },
      style: {
        padding: 100,
        align: 'center',
        titleSize: 48,
        titleBold: true,
        reviewSize: 18,
        reviewBold: false,
        nameSize: 14,
        nameBold: false,
        roleSize: 12,
        roleBold: false
      }
    }
  },
  'image-text': {
    type: 'image-text',
    label: 'Immagine con Testo',
    icon: Layout,
    visual: ImageTextBlock,
    contentEditor: ImageTextContent as any,
    styleEditor: ImageTextStyle as any,
    defaults: {
      content: {
        title: 'Il Problema che Risolviamo',
        text: 'Spiega qui perché il tuo cliente dovrebbe sceglierti. Usa una struttura chiara e un linguaggio diretto per massimizzare la conversione.',
        cta: 'Scopri di Più',
        ctaLink: '#',
        image: '',
        alt: 'Descrizione Immagine',
        imageAspectRatio: '16/9'
      },
      style: {
        padding: 100,
        gap: 60,
        maxWidth: 100,
        imagePosition: 'left',
        verticalAlign: 'center',
        titleSize: 48,
        titleBold: true,
        subtitleSize: 18,
        align: 'left'
      }
    }
  },
};

export const getBlockDefinition = (type: string) => {
  return BLOCK_DEFINITIONS[type];
};

export const getBlockLibrary = () => {
  return [
    BLOCK_DEFINITIONS.navigation,
    BLOCK_DEFINITIONS.hero,
    BLOCK_DEFINITIONS.text,
    BLOCK_DEFINITIONS.faq,
    BLOCK_DEFINITIONS.quote,
    BLOCK_DEFINITIONS['image-text'],
    BLOCK_DEFINITIONS.embed,
    BLOCK_DEFINITIONS.divider,
    BLOCK_DEFINITIONS.footer,
  ];
};
