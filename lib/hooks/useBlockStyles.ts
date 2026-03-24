import { Project, Block } from '@/types/editor';

/**
 * Utility function to resolve block styles. 
 * Purely functional, no hooks, safe for Server components and static generation.
 */
export const getBlockStyles = (block: Block | undefined, project: Project | null | undefined, viewport: string | undefined) => {
  if (!block) return { style: {}, isDark: false, theme: null, alignClass: 'text-center items-center justify-center', viewport: viewport || 'desktop' };
  
  const settings = project?.settings;
  const isDark = settings?.appearance === 'dark';
  const theme = settings?.themeColors;
  
  // 1. Resolve Global Theme Defaults
  const defaultBg = isDark
    ? (theme?.dark?.bg || '#0c0c0e')
    : (theme?.light?.bg || '#ffffff');
  const defaultText = isDark
    ? (theme?.dark?.text || '#ffffff')
    : (theme?.light?.text || '#000000');

  // 2. Merge Styles (Desktop -> Responsive Override)
  const vp = viewport || 'desktop';
  const baseStyle = block.style || {};
  const responsiveStyle = (vp !== 'desktop') 
    ? (block.responsiveStyles?.[vp as 'tablet' | 'mobile'] || {}) 
    : {};

  const merged = { ...baseStyle, ...responsiveStyle };

  // 3. Final Style Calculation
  const backgroundColor = merged.backgroundColor || defaultBg;
  const textColor = merged.textColor || defaultText;

  // 4. Background Construction
  let background = backgroundColor;
  if (merged.bgType === 'gradient') {
    const color1 = backgroundColor;
    const color2 = merged.backgroundColor2 || '#f3f4f6';
    const direction = merged.bgDirection || 'to bottom';
    background = `linear-gradient(${direction}, ${color1}, ${color2})`;
  }

  // 5. Alignment Mapping
  const alignMap = {
    left: 'text-left items-start justify-start',
    center: 'text-center items-center justify-center',
    right: 'text-right items-end justify-end',
  };

  return {
    style: {
      ...merged,
      backgroundColor,
      textColor,
      background,
    },
    isDark,
    theme,
    alignClass: alignMap[merged.align as keyof typeof alignMap] || alignMap.center,
    viewport: vp
  };
};
