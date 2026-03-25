import { FileText } from 'lucide-react';
import { QuoteBlock } from './QuoteBlock';
import { QuoteContent } from '../sidebar/block-editors/QuoteContent';
import { QuoteStyle } from '../sidebar/block-editors/QuoteStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

export const quoteDefinition: BlockDefinition = {
  type: 'quote',
  label: 'Citazioni',
  icon: FileText,
  visual: QuoteBlock,
  contentEditor: QuoteContent,
  styleEditor: QuoteStyle,
  defaults: {
    content: { items: [], layout: 'grid' },
    style: { 
      padding: 80, 
      columns: 3,
      titleTag: 'h2',
      itemTitleTag: 'h3',
      patternType: 'none',
      patternColor: '#ffffff',
      patternOpacity: 10,
      patternScale: 40
    },
    responsiveStyles: {
      tablet: { columns: 2 },
      mobile: { columns: 1 }
    }
  },
  styleMapper: (style, block, project, viewport) => {
    return getBaseStyleVars(style, block, project, viewport).vars;
  }
};
