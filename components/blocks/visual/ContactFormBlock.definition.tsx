import React from 'react';
import { Send } from 'lucide-react';
import { ContactFormBlock } from './ContactFormBlock';
import { ContactForm } from '../sidebar/block-editors/ContactForm';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="38" y="10" width="124" height="8" rx="2" fill="#18181b" />
    <rect x="38" y="28" width="124" height="14" rx="4" fill="#ffffff" stroke="#e4e4e7" />
    <rect x="44" y="33" width="60" height="3" rx="1" fill="#d4d4d8" />
    <rect x="38" y="48" width="124" height="14" rx="4" fill="#ffffff" stroke="#e4e4e7" />
    <rect x="44" y="53" width="50" height="3" rx="1" fill="#d4d4d8" />
    <rect x="38" y="68" width="124" height="26" rx="4" fill="#ffffff" stroke="#e4e4e7" />
    <rect x="44" y="74" width="70" height="3" rx="1" fill="#d4d4d8" />
    <rect x="58" y="102" width="84" height="13" rx="6.5" fill="#18181b" />
    <rect x="68" y="106.5" width="64" height="4" rx="1.5" fill="#ffffff" />
  </svg>
);

export const contactFormDefinition: BlockDefinition = {
  type: 'contact-form',
  label: 'Form Contatti',
  description: 'Modulo di contatto personalizzabile con campi configurabili e invio email diretto.',
  thumbnail: Thumbnail,
  icon: Send,
  visual: ContactFormBlock,
  unifiedEditor: ContactForm,
  defaults: {
    content: {
      title: 'Contattaci',
      subtitle: '',
      accessKey: '',
      formSubject: 'Nuovo messaggio dal sito',
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
