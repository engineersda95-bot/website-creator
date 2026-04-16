import { Phone } from 'lucide-react';
import { ContactBlock } from './ContactBlock';
import { Contact } from '../sidebar/block-editors/Contact';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#ffffff" />
    
    {/* Titolo e sottotitolo stilizzati */}
    <rect x="50" y="10" width="100" height="5" rx="2.5" fill="#0f172a" />
    <rect x="40" y="19" width="120" height="2" rx="1" fill="#64748b" opacity="0.3" />
    <rect x="70" y="23" width="60" height="2" rx="1" fill="#64748b" opacity="0.3" />

    {/* Griglia contatti migliorata */}
    <g transform="translate(15, 33)">
      <g transform="translate(0, 0)">
        <rect width="52" height="18" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
        <rect x="6" y="5" width="8" height="8" rx="2" fill="#334155" opacity="0.1" />
        <rect x="18" y="5" width="20" height="2" rx="1" fill="#94a3b8" />
        <rect x="18" y="10" width="28" height="3" rx="1.5" fill="#334155" opacity="0.8" />
      </g>
      <g transform="translate(59, 0)">
        <rect width="52" height="18" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
        <rect x="6" y="5" width="8" height="8" rx="2" fill="#334155" opacity="0.1" />
        <rect x="18" y="5" width="20" height="2" rx="1" fill="#94a3b8" />
        <rect x="18" y="10" width="28" height="3" rx="1.5" fill="#334155" opacity="0.8" />
      </g>
      <g transform="translate(118, 0)">
        <rect width="52" height="18" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
        <rect x="6" y="5" width="8" height="8" rx="2" fill="#334155" opacity="0.1" />
        <rect x="18" y="5" width="20" height="2" rx="1" fill="#94a3b8" />
        <rect x="18" y="10" width="28" height="3" rx="1.5" fill="#334155" opacity="0.8" />
      </g>
    </g>

    {/* Mappa Premium e Dettagliata */}
    <g transform="translate(15, 60)">
      <rect width="170" height="50" rx="10" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="0.5" />
      <mask id="mapMask">
        <rect width="170" height="50" rx="10" fill="white" />
      </mask>
      <g mask="url(#mapMask)">
        {/* Trama stradale */}
        <path d="M-10 25 H180 M55 -10 V60 M125 -10 V60 M80 -10 L110 60" stroke="#ffffff" strokeWidth="4" />
        <path d="M-10 40 L180 15" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
        
        {/* Edifici stilizzati */}
        <rect x="20" y="10" width="25" height="10" rx="2" fill="#cbd5e1" opacity="0.4" />
        <rect x="65" y="32" width="20" height="15" rx="2" fill="#cbd5e1" opacity="0.4" />
        <rect x="135" y="12" width="30" height="12" rx="2" fill="#cbd5e1" opacity="0.4" />
        <rect x="30" y="35" width="15" height="10" rx="2" fill="#cbd5e1" opacity="0.4" />
        
        {/* Pin di localizzazione elegante */}
        <g transform="translate(88, 25)">
          <circle cx="0" cy="0" r="4" fill="#f43f5e" opacity="0.2" />
          <path d="M0 0 C-3.5 -3.5 -5.5 -6.5 -5.5 -10 C-5.5 -13.5 -3 -16 0 -16 C3 -16 5.5 -13.5 5.5 -10 C5.5 -6.5 3.5 -3.5 0 0 Z" fill="#f43f5e" />
          <circle cx="0" cy="-10" r="2.5" fill="#ffffff" />
        </g>
      </g>
    </g>
  </svg>
);



export const contactDefinition: BlockDefinition = {
  type: 'contact',
  label: 'Contatti',
  description: 'Sezione contatti con indirizzo, telefono, email e mappa. Permette ai visitatori di trovarti facilmente.',
  thumbnail: Thumbnail,
  icon: Phone,
  visual: ContactBlock,
  unifiedEditor: Contact,
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
      patternColor: '#000000',
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
