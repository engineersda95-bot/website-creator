import { ImageIcon } from 'lucide-react';
import { SingleImage } from './SingleImage';
import { SingleImage as SingleImageEditor } from '../sidebar/block-editors/SingleImage';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';

export const singleImageDefinition: BlockDefinition = {
  type: 'image',
  label: 'Immagine',
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
    return {
      ...vars,
    };
  }
};
