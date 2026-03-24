import { Block, Project } from '@/types/editor';
import { getBlockDefinition } from './block-definitions';
import { getBaseStyleVars } from './base-style-mapper';

export function getBlockCSSVariables(block: Block, project?: Project, viewport: 'desktop' | 'tablet' | 'mobile' = 'desktop') {
  try {
    const definition = getBlockDefinition(block.type);
    
    if (definition && definition.styleMapper) {
      return definition.styleMapper(block.style, block, project, viewport);
    }
    
    // Fallback to base vars if no specific mapper exists (or for placeholder blocks)
    return getBaseStyleVars(block.style, block, project, viewport).vars;
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
    #${blockId} [style*="url"]:not(.background-pattern) {
      background-size: var(--bg-size, cover) !important;
      background-position: var(--bg-pos, center) !important;
      background-repeat: no-repeat !important;
      filter: var(--block-filter, none) !important;
    }
  `;

  const hasBorder = (block.style?.borderWidth || 0) > 0;

  return `
    #${blockId} {
      ${printVars(desktopVars)}
      border-radius: var(--block-radius, 0px);
      border: var(--block-border-w, 0px) ${hasBorder ? 'solid' : 'none'} var(--block-border-c, transparent);
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
