import { BookOpen } from 'lucide-react';
import { PdfBlock } from './PdfBlock';
import { Pdf } from '../sidebar/block-editors/Pdf';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const pdfDefinition: BlockDefinition = {
  type: 'pdf',
  label: 'PDF / Catalogo',
  icon: BookOpen,
  visual: PdfBlock,
  unifiedEditor: Pdf,
  defaults: {
    content: { 
      url: '', 
      title: 'Il nostro menu', 
      subtitle: 'Scopri la nostra selezione esclusiva. Sfoglia il catalogo completo o scarica il PDF.',
      ctaLabel: 'Apri PDF',
      displayMode: 'embed',
      thumbnail: ''
    },
    style: { 
      padding: 0, 
      align: 'center',
      backgroundColor: null,
      textColor: null,
      embedHeight: 800,
      containerWidth: null
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    
    return {
      ...vars,
      '--embed-height': toPx(val('embedHeight', 800)),
      '--container-width': toPx(val('containerWidth', '100%')),
    };
  }
};
