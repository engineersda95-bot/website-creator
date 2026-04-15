import { Send } from 'lucide-react';
import { ContactFormBlock } from './ContactFormBlock';
import { ContactForm } from '../sidebar/block-editors/ContactForm';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const contactFormDefinition: BlockDefinition = {
  type: 'contact-form',
  label: 'Form Contatti',
  icon: Send,
  visual: ContactFormBlock,
  unifiedEditor: ContactForm,
  defaults: {
    content: {
      title: 'Contattaci',
      subtitle: '',
      accessKey: '',
      formSubject: 'Nuovo messaggio dal sito',
      // CTA submit button
      submit: 'Invia messaggio',
      submitTheme: 'primary',
      successMessage: 'Grazie! Ti risponderemo presto.',
      errorMessage: "Errore nell'invio. Riprova più tardi.",
      fields: [
        { id: 'name',    label: 'Nome',      type: 'text',     required: false, placeholder: 'Mario',                          width: 'half' },
        { id: 'surname', label: 'Cognome',   type: 'text',     required: false, placeholder: 'Rossi',                          width: 'half' },
        { id: 'email',   label: 'Email',     type: 'email',    required: true,  placeholder: 'mario@email.it',                 width: 'full' },
        { id: 'message', label: 'Messaggio', type: 'textarea', required: true,  placeholder: 'Scrivi qui il tuo messaggio...', width: 'full' },
      ],
    },
    style: {
      padding: 80,
      align: 'left',
      gap: 24,
      titleSize: 40,
      titleBold: true,
      titleTag: 'h2',
      labelSize: 14,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0,
      patternType: 'none',
      patternColor: '#000000',
      patternOpacity: 10,
      patternScale: 40,
    },
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;

    return {
      ...vars,
      '--cf-label-fs': toPx(val('labelSize', 14)),
    };
  },
};
