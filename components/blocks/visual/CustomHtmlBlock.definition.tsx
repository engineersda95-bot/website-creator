import { Code2 } from 'lucide-react';
import { CustomHtmlBlock } from './CustomHtmlBlock';
import { CustomHtmlEditor } from '../sidebar/block-editors/CustomHtml';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#18181b" />
    <text x="12" y="28" fontFamily="monospace" fontSize="10" fill="#a78bfa">&lt;section&gt;</text>
    <text x="24" y="44" fontFamily="monospace" fontSize="9" fill="#6ee7b7">  &lt;h1&gt;</text>
    <rect x="60" y="36" width="60" height="7" rx="1" fill="#6ee7b7" opacity="0.5" />
    <text x="24" y="59" fontFamily="monospace" fontSize="9" fill="#6ee7b7">  &lt;/h1&gt;</text>
    <text x="24" y="74" fontFamily="monospace" fontSize="9" fill="#93c5fd">  &lt;p&gt;</text>
    <rect x="50" y="66" width="80" height="5" rx="1" fill="#93c5fd" opacity="0.4" />
    <text x="24" y="89" fontFamily="monospace" fontSize="9" fill="#93c5fd">  &lt;/p&gt;</text>
    <text x="12" y="104" fontFamily="monospace" fontSize="10" fill="#a78bfa">&lt;/section&gt;</text>
  </svg>
);

export const customHtmlDefinition: BlockDefinition = {
  type: 'custom-html',
  label: 'HTML Personalizzato',
  description: 'Scrivi HTML, CSS e JS vanilla liberamente, oppure genera tutto con l\'AI descrivendo quello che vuoi.',
  thumbnail: Thumbnail,
  icon: Code2,
  visual: CustomHtmlBlock,
  unifiedEditor: CustomHtmlEditor,
  defaults: {
    content: {
      html: '',
      css: '',
      js: '',
      sectionId: '',
    },
    style: {
      padding: 0,
      hPadding: 0,
    },
  },
  styleMapper: (style, block, project, viewport) => {
    const merged = { padding: 0, hPadding: 0, ...style };
    const { vars } = getBaseStyleVars(merged, block, project, viewport);
    return vars;
  },
};
