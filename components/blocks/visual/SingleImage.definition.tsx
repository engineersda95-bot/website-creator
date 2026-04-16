import { ImageIcon } from 'lucide-react';
import { SingleImage } from './SingleImage';
import { SingleImage as SingleImageEditor } from '../sidebar/block-editors/SingleImage';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="16" y="14" width="168" height="92" rx="8" fill="#e4e4e7" />
    <circle cx="52" cy="46" r="12" fill="#d4d4d8" />
    <path d="M16 86 L54 56 L90 76 L128 46 L184 86" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
  </svg>
);

export const singleImageDefinition: BlockDefinition = {
  type: 'image',
  label: 'Immagine',
  description: 'Singola immagine a larghezza variabile con arrotondamenti e ombra opzionali.',
  thumbnail: Thumbnail,
  icon: ImageIcon,
  visual: SingleImage,
  unifiedEditor: SingleImageEditor,
  defaults: {
    content: {
      image: '',
      alt: 'Descrizione immagine',
      url: ''
    },
    style: {
      padding: 40,
      align: 'center',
      imageAspectRatio: '16/9',
      imageMaxWidth: 100,
      imageBorderRadius: 16,
      imageShadow: true,
      imageHover: true,
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars } = getBaseStyleVars(style, block, project, viewport);
    return { ...vars };
  }
};
