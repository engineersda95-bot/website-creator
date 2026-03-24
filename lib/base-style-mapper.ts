import { Project } from '@/types/editor';
import { toPx } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';

export function getBaseStyleVars(style: any, block: any, project?: Project, viewport: 'desktop' | 'tablet' | 'mobile' = 'desktop') {
  const { style: effectiveStyle } = getBlockStyles(block, project, viewport);
  
  const val = (key: string, def: any) => effectiveStyle[key] !== undefined && effectiveStyle[key] !== null ? effectiveStyle[key] : def;
  const num = (key: string, def: number) => {
    const v = val(key, def);
    if (v === undefined || v === null || v === '') return def;
    const n = Number(v);
    return isNaN(n) ? def : n;
  };

  const vars: Record<string, string> = {
    '--block-pt': toPx(val('padding', '4rem')),
    '--block-pb': toPx(val('padding', '4rem')),
    '--block-px': toPx(val('hPadding', '2rem')),
    '--block-mt': toPx(val('marginTop', '0px')),
    '--block-mb': toPx(val('marginBottom', '0px')),
    '--block-ml': toPx(val('marginLeft', '0px')),
    '--block-mr': toPx(val('marginRight', '0px')),
    '--block-max-width': val('maxWidth', '') ? (typeof val('maxWidth', '') === 'number' && val('maxWidth', '') <= 100 ? `${val('maxWidth', '')}%` : toPx(val('maxWidth', ''))) : '100%',
    '--block-width': (val('marginLeft', 0) || val('marginRight', 0)) ? `calc(100% - ${toPx(val('marginLeft', 0))} - ${toPx(val('marginRight', 0))})` : '100%',
    '--block-gap': toPx(val('gap', '2rem')),
    '--block-min-height': val('minHeight', '') ? toPx(val('minHeight', '')) : 'auto',
    '--block-align': val('align', 'center'),
    '--block-justify': val('align', 'center') === 'center' ? 'center' : val('align', 'center') === 'right' ? 'flex-end' : 'flex-start',
    '--block-items': val('align', 'center') === 'center' ? 'center' : val('align', 'center') === 'right' ? 'flex-end' : 'flex-start',
    '--block-ml-auto': val('align', 'center') === 'center' || val('align', 'center') === 'right' ? 'auto' : '0',
    '--block-mr-auto': val('align', 'center') === 'center' || val('align', 'center') === 'left' ? 'auto' : '0',
    '--block-bg': val('bgType', 'solid') === 'gradient' 
      ? `linear-gradient(${val('bgDirection', 'to bottom')}, ${val('backgroundColor', 'transparent')}, ${val('backgroundColor2', 'transparent')})`
      : val('backgroundColor', 'transparent'),
    '--block-color': val('textColor', 'inherit'),
    '--block-radius': toPx(val('borderRadius', '0px')),
    '--block-border-w': toPx(val('borderWidth', 0)),
    '--block-border-c': val('borderColor', 'transparent'),
    
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

    // Backgrounds & Images
    '--img-opacity': (num('opacity', 100) / 100).toString(),
    '--img-fit': val('objectFit', 'cover'),
    '--bg-size': val('backgroundSize', 'cover'),
    '--bg-pos': val('backgroundPosition', 'center'),
    '--block-filter': `${val('grayscale', false) ? 'grayscale(100%)' : ''} ${num('brightness', 100) !== 100 ? `brightness(${num('brightness', 100)}%)` : ''} ${num('blur', 0) > 0 ? `blur(${num('blur', 0)}px)` : ''}`.trim() || 'none',
    '--overlay-bg': val('overlayColor', 'rgba(0,0,0,0.5)'),
    '--overlay-opacity': (num('overlayOpacity', 50) / 100).toString(),

    // Global Button Defaults
    '--btn-radius': toPx(project?.settings?.buttonRadius, '9999px'),
    '--btn-py': toPx(project?.settings?.buttonPaddingY, '12px'),
    '--btn-px': toPx(project?.settings?.buttonPaddingX, '32px'),
    '--btn-fs': toPx(project?.settings?.buttonFontSize, '1rem'),
    '--btn-upper': project?.settings?.buttonUppercase ? 'uppercase' : 'none',
  };

  // Responsive Gap Tuning
  if (viewport === 'mobile' && (!block.responsiveStyles?.mobile || block.responsiveStyles.mobile.gap === undefined)) {
    const currentGap = num('gap', 64);
    if (currentGap > 32) {
      vars['--block-gap'] = toPx(32);
    }
  }

  // Global Button Overrides (Mobile/Tablet)
  if (viewport !== 'desktop' && project?.settings?.responsive) {
    const responsive = project.settings.responsive as any;
    const rv = responsive[viewport];
    if (rv) {
      if (rv.buttonRadius !== undefined) vars['--btn-radius'] = toPx(rv.buttonRadius);
      if (rv.buttonFontSize !== undefined) vars['--btn-fs'] = toPx(rv.buttonFontSize);
      if (rv.buttonPaddingX !== undefined) vars['--btn-px'] = toPx(rv.buttonPaddingX);
      if (rv.buttonPaddingY !== undefined) vars['--btn-py'] = toPx(rv.buttonPaddingY);
      if (rv.buttonUppercase !== undefined) vars['--btn-upper'] = rv.buttonUppercase ? 'uppercase' : 'none';
    }
  }

  return { vars, style: effectiveStyle };
}
