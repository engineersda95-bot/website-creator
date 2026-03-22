import { BlockType } from '@/types/editor';
import { 
  Square, Type, Layout, Menu, Minus
} from 'lucide-react';

// Visual Components
import { Hero } from '@/components/blocks/visual/Hero';
import { TextBlock } from '@/components/blocks/visual/TextBlock';
import { Navigation } from '@/components/blocks/visual/navigation/Navigation';
import { FooterBlock } from '@/components/blocks/visual/FooterBlock';
import { DividerBlock } from '@/components/blocks/visual/DividerBlock';

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
};

export const getBlockDefinition = (type: string) => {
  return BLOCK_DEFINITIONS[type];
};

export const getBlockLibrary = () => {
  return [
    BLOCK_DEFINITIONS.navigation,
    BLOCK_DEFINITIONS.hero,
    BLOCK_DEFINITIONS.text,
    BLOCK_DEFINITIONS.divider,
    BLOCK_DEFINITIONS.footer,
  ];
};
