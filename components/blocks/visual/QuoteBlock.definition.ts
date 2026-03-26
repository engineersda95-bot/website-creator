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
    content: { 
      items: [
        { 
          name: 'Marco Rossi', 
          role: 'CEO, Tech Solutions', 
          text: 'Un servizio impeccabile. La velocità di risposta e la personalizzazione offerta superano ogni aspettativa.',
          stars: 5,
          avatar: ''
        },
        { 
          name: 'Sara Bianchi', 
          role: 'Marketing Manager', 
          text: 'Design moderno e pulito. Esattamente quello che cercavamo per il nostro nuovo progetto digitale.',
          stars: 4,
          avatar: ''
        }
      ], 
      layout: 'grid' 
    },
    style: { 
      padding: 80, 
      columns: 3,
      titleTag: 'h2',
      itemTitleTag: 'h3',
      itemTitleBold: true,
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
    // Migrazione vecchie chiavi Quote
    const s_mig = { ...style };
    if (s_mig.nameSize !== undefined && s_mig.itemTitleSize === undefined) s_mig.itemTitleSize = s_mig.nameSize;
    if (s_mig.nameBold !== undefined && s_mig.itemTitleBold === undefined) s_mig.itemTitleBold = s_mig.nameBold;
    if (s_mig.nameItalic !== undefined && s_mig.itemTitleItalic === undefined) s_mig.itemTitleItalic = s_mig.nameItalic;

    const { vars, style: s } = getBaseStyleVars(s_mig, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    const toPx = (v: any) => typeof v === 'number' ? `${v}px` : v;
    
    return {
      ...vars,
      '--review-fs': toPx(val('reviewSize', 18)),
      '--review-fw': val('reviewBold', false) ? '700' : '400',
      '--review-is': val('reviewItalic', true) ? 'italic' : 'normal',
      '--review-role-fs': toPx(val('roleSize', 11)),
      '--review-role-fw': val('roleBold', false) ? '700' : '400',
      '--review-role-is': val('roleItalic', false) ? 'italic' : 'normal',
    };
  }
};
