import { FileText } from 'lucide-react';
import { FAQBlock } from './FaqBlock';
import { FAQContent } from '../sidebar/block-editors/FaqContent';
import { FAQStyle } from '../sidebar/block-editors/FaqStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const faqDefinition: BlockDefinition = {
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
      align: 'center',
      gap: 48,
      titleBold: false,
      titleTag: 'h2',
      itemTitleTag: 'h3',
      patternType: 'none',
      patternScale: 40
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    
    return {
      ...vars,
      '--faq-q-fs': toPx(val('questionSize', '1.125rem')),
      '--faq-a-fs': toPx(val('answerSize', '1rem')),
      '--faq-q-fw': val('questionBold', true) ? '700' : '500',
      '--faq-a-fw': val('answerBold', false) ? '600' : '400',
    };
  }
};
