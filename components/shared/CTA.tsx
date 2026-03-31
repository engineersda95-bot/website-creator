import React from 'react';
import { cn, getButtonStyle, getButtonClass, formatLink } from '@/lib/utils';
import { Project, ProjectSettings } from '@/types/editor';
import { InlineEditable } from '@/components/shared/InlineEditable';
import { AlertTriangle } from 'lucide-react';

interface CTAProps {
  label: string;
  url?: string;
  project?: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  theme?: 'primary' | 'secondary';
  isStatic?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onLabelChange?: (value: string) => void;
  fieldId?: string;

  // Manual Overrides
  bgColor?: string;
  textColor?: string;
  radius?: number;
  paddingX?: number;
  paddingY?: number;
  fontSize?: number;
  shadow?: 'none' | 'S' | 'M' | 'L';
  animation?: 'none' | 'move-up' | 'scale';
  uppercase?: boolean;
}

export const getCTAOverrides = (content: any, style: any, prefix: string, theme?: string) => {
  // If the theme is not custom, we ignore all manual style overrides
  const isCustom = theme === 'custom';

  if (!isCustom) return {};

  const s = style || {};
  const c = content || {};

  return {
    bgColor: s[`${prefix}BgColor`] ?? c[`${prefix}BgColor`],
    textColor: s[`${prefix}TextColor`] ?? c[`${prefix}TextColor`],
    radius: s[`${prefix}Radius`] ?? c[`${prefix}Radius`],
    paddingX: s[`${prefix}PaddingX`] ?? c[`${prefix}PaddingX`],
    paddingY: s[`${prefix}PaddingY`] ?? c[`${prefix}PaddingY`],
    fontSize: s[`${prefix}FontSize`] ?? c[`${prefix}FontSize`],
    shadow: s[`${prefix}Shadow`] ?? c[`${prefix}Shadow`],
    animation: s[`${prefix}Animation`] ?? c[`${prefix}Animation`],
    uppercase: s[`${prefix}Uppercase`] ?? c[`${prefix}Uppercase`],
  };
};

export const CTA: React.FC<CTAProps> = ({
  label,
  url = '#',
  project,
  viewport = 'desktop',
  theme = 'primary',
  isStatic = false,
  className,
  style: extraStyle,
  onClick,
  onLabelChange,
  fieldId,
  // Overrides
  bgColor,
  textColor,
  radius,
  paddingX,
  paddingY,
  fontSize,
  shadow,
  animation,
  uppercase
}) => {
  if (!label && !onLabelChange) return null;

  const projectSettings = (project?.settings || {}) as ProjectSettings;
  const activeColor = bgColor || (theme === 'secondary'
    ? (projectSettings.secondaryColor || '#10b981')
    : (projectSettings.primaryColor || '#3b82f6'));

  const buttonStyle = getButtonStyle(
    project,
    activeColor,
    viewport,
    theme,
    isStatic,
    { bgColor, textColor, radius, paddingX, paddingY, fontSize, shadow, uppercase }
  );

  const missingLink = onLabelChange && (!url || url === '#');

  return (
    <a
      {...formatLink(url, isStatic)}
      className={cn(getButtonClass(project, animation), 'relative', className)}
      style={{ ...buttonStyle, ...extraStyle }}
      onClick={onClick}
    >
      {onLabelChange ? (
        <InlineEditable
          as="span"
          value={label || ''}
          onChange={onLabelChange}
          placeholder="Bottone..."
          fieldId={fieldId}
        />
      ) : (
        label
      )}
      {missingLink && (
        <span className="absolute -top-2 -right-2 group/warn">
          <span className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm border-2 border-white cursor-help">
            <AlertTriangle size={10} className="text-white" />
          </span>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-zinc-900 text-white text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover/warn:opacity-100 pointer-events-none transition-opacity shadow-lg">
            Nessun link associato — aggiungilo dalla sidebar
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-900" />
          </span>
        </span>
      )}
    </a>
  );
};
