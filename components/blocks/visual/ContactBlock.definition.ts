import { Phone } from 'lucide-react';
import { ContactBlock } from './ContactBlock';
import { ContactContent } from '../sidebar/block-editors/ContactContent';
import { ContactStyle } from '../sidebar/block-editors/ContactStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const contactDefinition: BlockDefinition = {
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
      mapWidth: 100,
      patternType: 'none',
      patternColor: '#ffffff',
      patternOpacity: 10,
      patternScale: 40,
      titleTag: 'h2',
      itemTitleTag: 'h3',
      itemTitleBold: true,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    }
  },
  styleMapper: (style, block, project, viewport) => {
    // Migrazione vecchie chiavi Contact
    const s_mig = { ...style };
    if (s_mig.contactLabelSize !== undefined && s_mig.itemTitleSize === undefined) s_mig.itemTitleSize = s_mig.contactLabelSize;
    if (s_mig.contactLabelBold !== undefined && s_mig.itemTitleBold === undefined) s_mig.itemTitleBold = s_mig.contactLabelBold;

    const { vars, style: s } = getBaseStyleVars(s_mig, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    
    return {
      ...vars,
      '--icon-size': toPx(val('iconSize', 20)),
      '--label-fs': vars['--item-title-fs'],
      '--label-fw': vars['--item-title-fw'],
      '--label-is': vars['--item-title-is'],
      '--value-fs': toPx(val('contactValueSize', 18)),
      '--value-fw': val('contactValueBold', true) ? '700' : '400',
      '--value-is': val('contactValueItalic', false) ? 'italic' : 'normal',
      '--map-width': val('mapWidth', 100) + '%',
    };
  }
};
