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
  onLabelChange,
}) => {
  if (!label && !onLabelChange) return null;

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

  const missingLink = onLabelChange && (!url || url === '#');

  return (
    <a
      {...formatLink(url, isStatic)}
      className={cn(getButtonClass(project), 'relative', className)}
      style={{ ...buttonStyle, ...extraStyle }}
      onClick={onClick}
    >
      {onLabelChange ? (
        <InlineEditable
          as="span"
          value={label || ''}
          onChange={onLabelChange}
          placeholder="Bottone..."
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
