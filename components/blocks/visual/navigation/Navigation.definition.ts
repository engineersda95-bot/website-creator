import { Menu } from 'lucide-react';
import { Navigation } from './Navigation';
import { NavigationContent } from '../../sidebar/block-editors/NavigationContent';
import { NavigationStyle } from '../../sidebar/block-editors/NavigationStyle';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';

export const navigationDefinition: BlockDefinition = {
  type: 'navigation',
  label: 'Navigazione',
  icon: Menu,
  visual: Navigation,
  contentEditor: NavigationContent,
  styleEditor: NavigationStyle as any,
  defaults: {
    content: { logoText: 'Studio', links: [], showContact: true },
    style: { padding: 20 }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    
    // Content-based layout type resolution
    const layoutType = block.content?.layoutType || val('layoutType', 'standard');

    return {
      ...vars,
      '--nav-padding': toPx(val('padding', '16px')),
      '--nav-hpadding': toPx(val('hPadding', '20px')),
      '--nav-link-mobile-fs': toPx(val('fontSize', 18)),
      '--nav-link-mobile-fw': val('titleBold', false) ? '700' : '500',
      '--nav-link-mobile-fs-style': val('titleItalic', false) ? 'italic' : 'normal',
      '--logo-fs': toPx(val('logoSize', '40px')),
      '--logo-text-fs': toPx(val('logoTextSize', '24px')),
      '--logo-color': val('logoColor', val('textColor', project?.settings?.primaryColor || '#0c0c0e')),
      '--nav-hamburger-display': (layoutType === 'hamburger' ? 'flex' : 'none'),
      '--nav-links-display': (layoutType === 'hamburger' ? 'none' : 'flex'),
    };
  }
};
