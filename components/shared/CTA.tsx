import React from 'react';
import { cn, getButtonStyle, getButtonClass, formatLink } from '@/lib/utils';
import { Project, ProjectSettings } from '@/types/editor';
import { LayoutGridSliderProps } from '@/types/sidebar';

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
}

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
}) => {
  if (!label) return null;

  const projectSettings = (project?.settings || {}) as ProjectSettings;
  const activeColor = theme === 'secondary' 
    ? (projectSettings.secondaryColor || '#10b981')
    : (projectSettings.primaryColor || '#3b82f6');

  const buttonStyle = getButtonStyle(
    project, 
    activeColor, 
    viewport, 
    theme, 
    isStatic
  );

  return (
    <a
      {...formatLink(url)}
      className={cn(getButtonClass(project), className)}
      style={{ ...buttonStyle, ...extraStyle }}
      onClick={onClick}
    >
      {label}
    </a>
  );
};
