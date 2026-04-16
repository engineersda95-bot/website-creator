import React from 'react';
import { BlockType, Project } from './editor';

export interface BlockVariant {
  id: string;
  label: string;
  description?: string;
  preview: React.FC<{ className?: string }>;
  contentOverride?: Record<string, any>;
  styleOverride?: Record<string, any>;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: any;
  visual: React.FC<any> | null;
  contentEditor?: React.FC<any> | null;
  styleEditor?: React.FC<any> | null;
  defaults: {
    content: any;
    style: any;
    responsiveStyles?: any;
  };
  variants?: BlockVariant[];
  unifiedEditor?: React.FC<any> | null;
  description?: string;
  thumbnail?: React.FC<{ className?: string }>;
  // Each block can now define its own CSS variable mapping logic
  styleMapper?: (style: any, block: any, project?: Project, viewport?: 'desktop' | 'tablet' | 'mobile') => Record<string, string>;
}
