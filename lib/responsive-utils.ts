import { Block, Project } from '@/types/editor';
import { toPx } from './utils';
import { getBlockStyles } from './hooks/useBlockStyles';

export function getBlockCSSVariables(block: Block, project?: Project, viewport: 'desktop' | 'tablet' | 'mobile' = 'desktop') {
  try {
    const { style } = getBlockStyles(block, project, viewport);

    const val = (key: string, def: any) => style[key] !== undefined && style[key] !== null ? style[key] : def;
  const num = (key: string, def: number) => {
    const v = val(key, def);
    if (v === undefined || v === null || v === '') return def;
    const n = Number(v);
    return isNaN(n) ? def : n;
  };

    const vars: Record<string, string> = {
      // Layout & Spacing
      '--block-pt': toPx(val('padding', '4rem')),
      '--block-pb': toPx(val('padding', '4rem')),
      '--block-px': toPx(val('hPadding', '2rem')),
      '--block-mt': toPx(val('marginTop', '0px')),
      '--block-mb': toPx(val('marginBottom', '0px')),
      '--block-ml': toPx(val('marginLeft', '0px')),
      '--block-mr': toPx(val('marginRight', '0px')),
      '--block-max-width': val('maxWidth', '') ? (typeof val('maxWidth', '') === 'number' && val('maxWidth', '') <= 100 ? `${val('maxWidth', '')}%` : toPx(val('maxWidth', ''))) : '1200px',
      '--block-width': (val('marginLeft', 0) || val('marginRight', 0)) ? `calc(100% - ${toPx(val('marginLeft', 0))} - ${toPx(val('marginRight', 0))})` : '100%',
      '--block-gap': toPx(val('gap', '2rem')),
      '--block-min-height': val('minHeight', '') ? toPx(val('minHeight', '')) : 'auto',
      
      // Alignment
      '--block-align': val('align', 'center'),
      '--block-justify': val('align', 'center') === 'center' ? 'center' : val('align', 'center') === 'right' ? 'flex-end' : 'flex-start',
      '--block-items': val('align', 'center') === 'center' ? 'center' : val('align', 'center') === 'right' ? 'flex-end' : 'flex-start',
      '--block-ml-auto': val('align', 'center') === 'center' || val('align', 'center') === 'right' ? 'auto' : '0',
      '--block-mr-auto': val('align', 'center') === 'center' || val('align', 'center') === 'left' ? 'auto' : '0',
      
      // Typography
      '--base-fs': toPx(val('fontSize', '1rem')),
      '--title-fs': toPx(val('titleSize', val('fontSize', '3rem'))),
      '--subtitle-fs': toPx(val('subtitleSize', '1.25rem')),
      '--title-fw': val('titleBold', false) ? '700' : '400',
      '--title-fs-style': val('titleItalic', false) ? 'italic' : 'normal',
      '--title-ls': toPx(val('letterSpacing', '0px')),
      '--title-lh': (num('lineHeight', 1.2)).toString(),
      '--title-upper': val('titleUppercase', false) ? 'uppercase' : 'none',
      '--subtitle-fw': val('subtitleBold', false) ? '700' : '500',
      '--subtitle-fs-style': val('subtitleItalic', false) ? 'italic' : 'normal',
      '--subtitle-upper': val('subtitleUppercase', false) ? 'uppercase' : 'none',
      '--copyright-fs': toPx(val('copyrightSize', '10px')),
      
      // Borders & Shadows
      '--block-border-w': toPx(val('borderWidth', 0)),
      '--block-border-c': val('borderColor', 'transparent'),
      '--block-shadow': 'none',
      
      // Global Button Defaults (Overridable below)
      '--btn-radius': toPx(project?.settings?.buttonRadius, '9999px'),
      '--btn-py': `${project?.settings?.buttonPaddingY || 12}px`,
      '--btn-px': `${project?.settings?.buttonPaddingX || 32}px`,
      '--btn-fs': toPx(project?.settings?.buttonFontSize, '1rem'),
      '--btn-upper': project?.settings?.buttonUppercase ? 'uppercase' : 'none',

      // Images/Backgrounds
      '--img-opacity': (num('opacity', 100) / 100).toString(),
      '--img-fit': val('objectFit', 'cover'),
      '--bg-size': val('backgroundSize', 'cover'),
      '--bg-pos': val('backgroundPosition', 'center'),
      '--block-filter': `${val('grayscale', false) ? 'grayscale(100%)' : ''} ${num('brightness', 100) !== 100 ? `brightness(${num('brightness', 100)}%)` : ''} ${num('blur', 0) > 0 ? `blur(${num('blur', 0)}px)` : ''}`.trim() || 'none',
      '--overlay-bg': val('overlayColor', 'rgba(0,0,0,0.5)'),
      '--overlay-opacity': (num('overlayOpacity', 50) / 100).toString(),

      // Branding (Using both style & content fallback)
      '--logo-fs': toPx(val('logoSize', block.type === 'footer' ? val('titleSize', '40px') : '40px')),
      '--logo-text-fs': toPx(val('logoTextSize', '24px')),
      '--logo-color': val('logoColor', val('textColor', project?.settings?.primaryColor || '#0c0c0e')),
      '--social-icon-size': toPx(val('socialIconSize', 24)),

      // Theme & UI
      '--block-radius': toPx(val('borderRadius', '0px')),
      '--block-bg': val('backgroundColor', 'transparent'),
      '--block-color': val('textColor', 'inherit'),
      
      // Navigation specific (defaults)
      '--nav-padding': toPx(val('padding', '16px')),
      '--nav-hpadding': toPx(val('hPadding', '20px')),
      '--nav-link-mobile-fs': toPx(val('fontSize', 18)),
      '--nav-link-mobile-fw': val('titleBold', false) ? '700' : '500',
      '--nav-link-mobile-fs-style': val('titleItalic', false) ? 'italic' : 'normal',
      
      // Divider specific
      '--divider-width': val('dividerWidth', 100) + '%',
      '--divider-stroke': toPx(val('dividerStroke', 1)),
      '--divider-color': val('dividerColor', val('textColor', 'currentColor')),

      // FAQ specific
      '--faq-q-fs': toPx(val('questionSize', '1.125rem')),
      '--faq-a-fs': toPx(val('answerSize', '1rem')),
      '--faq-q-fw': val('questionBold', true) ? '700' : '500',
      '--faq-a-fw': val('answerBold', false) ? '600' : '400',
      
      // Image-Text specific
      '--image-order': val('imagePosition', 'left') === 'left' ? '0' : '1',
      '--text-order': val('imagePosition', 'left') === 'left' ? '1' : '0',
      '--image-aspect': block.content?.imageAspectRatio || val('imageAspectRatio', '16/9'),
      '--text-v-align': viewport === 'mobile' ? 'flex-start' : (val('verticalAlign', 'center') === 'top' ? 'flex-start' : val('verticalAlign', 'center') === 'bottom' ? 'flex-end' : 'center'),
    };

    // Responsive Gap Tuning
    if (viewport === 'mobile') {
      const desktopGap = num('gap', 64);
      vars['--block-gap'] = toPx(val('gap', Math.min(desktopGap, 32))); // Limit gap on mobile
    }

    // Content-based layout type resolution
    const layoutType = block.content?.layoutType || val('layoutType', 'standard');
    vars['--nav-hamburger-display'] = (layoutType === 'hamburger' ? 'flex' : 'none');
    vars['--nav-links-display'] = (layoutType === 'hamburger' ? 'none' : 'flex');

    // Specific Overrides
    if (block.type === 'hero') {
      vars['--hero-min-height'] = toPx(val('minHeight', '600px'));
    }

    // Global Button Overrides (Mobile/Tablet)
    if (viewport !== 'desktop' && project?.settings?.responsive?.[viewport]) {
      const rv = project.settings.responsive[viewport];
      if (rv.buttonRadius !== undefined) vars['--btn-radius'] = toPx(rv.buttonRadius);
      if (rv.buttonFontSize !== undefined) vars['--btn-fs'] = toPx(rv.buttonFontSize);
      if (rv.buttonPaddingX !== undefined) vars['--btn-px'] = toPx(rv.buttonPaddingX);
      if (rv.buttonPaddingY !== undefined) vars['--btn-py'] = toPx(rv.buttonPaddingY);
      if (rv.buttonUppercase !== undefined) vars['--btn-upper'] = rv.buttonUppercase ? 'uppercase' : 'none';
    }

    return vars;
  } catch (e) {
    console.error('Error in getBlockCSSVariables:', e);
    return {};
  }
}

export function generateBlockCSS(blockId: string, block: Block, project?: Project) {
  const desktopVars = getBlockCSSVariables(block, project, 'desktop');
  const tabletVars = getBlockCSSVariables(block, project, 'tablet');
  const mobileVars = getBlockCSSVariables(block, project, 'mobile');

  const printVars = (v: Record<string, string>) => Object.entries(v).map(([k, val]) => `${k}: ${val};`).join(' ');

  const urlOverrides = `
    #${blockId} [style*="url"] {
      background-size: var(--bg-size, cover) !important;
      background-position: var(--bg-pos, center) !important;
      background-repeat: no-repeat !important;
      filter: var(--block-filter, none) !important;
    }
  `;

  return `
    #${blockId} {
      ${printVars(desktopVars)}
      border-radius: var(--block-radius, 0px);
      border: var(--block-border-w, 0px) solid var(--block-border-c, transparent);
      margin-top: var(--block-mt, 0px);
      margin-bottom: var(--block-mb, 0px);
      margin-left: var(--block-ml, 0px);
      margin-right: var(--block-mr, 0px);
      width: var(--block-width, 100%);
      transition: all 0.5s ease;
    }
    ${urlOverrides}
    @media (max-width: 1024px) {
      #${blockId} {
        ${printVars(tabletVars)}
      }
    }
    @media (max-width: 768px) {
      #${blockId} {
        ${printVars(mobileVars)}
      }
    }
  `;
}
