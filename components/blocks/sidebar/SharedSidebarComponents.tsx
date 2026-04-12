'use client';

/**
 * SharedSidebarComponents.tsx
 * 
 * This file acts as a central hub for all sidebar UI components and managers.
 * Following the modularization refactor, components have been moved to:
 * - components/blocks/sidebar/ui/ (Stateless UI elements)
 * - components/blocks/sidebar/managers/ (Complex state/style managers)
 */

// UI Components
export { SectionHeader } from './ui/SectionHeader';
export { TypographyFields } from './ui/TypographyFields';
export { SimpleSlider } from './ui/SimpleSlider';
export { SimpleInput } from './ui/SimpleInput';
export { RichTextarea } from './ui/RichTextarea';
export { IconManager } from './ui/IconManager';
export { UnifiedSection, useUnifiedSections, CategoryHeader, ManagerWrapper } from './ui/UnifiedSection';
export { ColorInput } from './ui/ColorInput';

// Style Managers
export { AdvancedMargins } from './managers/AdvancedMargins';
export { LayoutFields } from './managers/LayoutFields';
export { ColorManager } from './managers/ColorManager';
export { BackgroundManager } from './managers/BackgroundManager';
export { BorderShadowManager } from './managers/BorderShadowManager';
export { CTAManager } from './managers/CTAManager';
export { SocialLinksManager } from './managers/SocialLinksManager';
export { LinkListManager } from './managers/LinkListManager';
export { ImageStyleFields } from './managers/ImageStyleFields';
export { LayoutGridSlider } from './managers/LayoutGridSlider';
export { PatternManager } from './managers/PatternManager';
export { AnchorManager } from './managers/AnchorManager';
export { AnimationManager } from './managers/AnimationManager';

