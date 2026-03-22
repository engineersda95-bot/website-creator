export type BlockType = 
  'hero' | 
  'text' | 
  'navigation' | 
  'footer' |
  'image' |
  'image-text' |
  'gallery' |
  'map' |
  'features' |
  'contact' |
  'reviews' |
  'product-carousel' |
  'embed';

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  style: any;
  responsiveStyles?: {
    tablet?: any;
    mobile?: any;
  };
}

export interface Page {
  id: string;
  project_id: string;
  slug: string;
  title: string;
  blocks: Block[];
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
  updated_at: string;
}

export interface ProjectSettings {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  favicon?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  floatingCTA?: {
    enabled: boolean;
    label: string;
    url: string;
    theme: 'primary' | 'secondary';
  };
  appearance?: 'light' | 'dark';
  themeColors?: {
    light?: { bg: string; text: string };
    dark?: { bg: string; text: string };
    buttonText?: string;
    buttonTextSecondary?: string;
  };
  buttonRadius: number;
  buttonShadow: 'none' | 'S' | 'M' | 'L';
  buttonBorder: boolean;
  buttonBorderColor?: string;
  buttonBorderWidth?: number;
  buttonPaddingX?: number;
  buttonPaddingY?: number;
  buttonFontSize?: number;
  buttonWidth?: number | 'auto' | 'full';
  buttonUppercase: boolean;
  responsive?: {
    mobile?: Partial<ProjectSettings>;
    tablet?: Partial<ProjectSettings>;
  };
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  subdomain: string;
  settings: ProjectSettings;
  live_url?: string;
  last_published_at?: string;
  created_at: string;
}
