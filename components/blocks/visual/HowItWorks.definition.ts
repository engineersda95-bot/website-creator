import { ListChecks } from 'lucide-react';
import { HowItWorks } from './HowItWorks';
import { HowItWorksContent } from '../sidebar/block-editors/HowItWorksContent';
import { HowItWorksStyle } from '../sidebar/block-editors/HowItWorksStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

export const howItWorksDefinition: BlockDefinition = {
  type: 'how-it-works',
  label: 'Come Funziona',
  icon: ListChecks,
  visual: HowItWorks,
  contentEditor: HowItWorksContent,
  styleEditor: HowItWorksStyle,
  defaults: {
    content: {
      title: 'Il nostro metodo in 3 passi',
      items: [
        {
          number: '1',
          title: 'Strategia',
          description: 'Analizziamo le tue necessità e definiamo gli obiettivi.'
        },
        {
          number: '2',
          title: 'Sviluppo',
          description: 'Creiamo la soluzione perfetta per il tuo business.'
        },
        {
          number: '3',
          title: 'Lancio',
          description: 'Mettiamo online il progetto e monitoriamo i risultati.'
        }
      ]
    },
    style: {
      padding: 80,
      layout: 'grid',
      align: 'center',
      numberBgColor: '',
      numberTextColor: '',
      itemTitleSize: 24,
      itemDescSize: 16
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars } = getBaseStyleVars(style, block, project, viewport);
    return {
      ...vars,
    };
  }
};
