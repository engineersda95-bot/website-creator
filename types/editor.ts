export type BlockType = 
  'hero' | 
  'text' | 
  'navigation' | 
  'image' | 
  'image-text' | 
  'gallery' | 
  'features' | 
  'contact' | 
  'map' | 
  'services' | 
  'reviews' | 
  'embed' | 
  'pdf-viewer' | 
  'product-carousel' |
  'footer';

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
  };
  buttonRadius: number;
  buttonShadow: 'none' | 'S' | 'M' | 'L';
  buttonBorder: boolean;
  buttonBorderColor?: string;
  buttonBorderWidth?: number;
  buttonPaddingX?: number;
  buttonPaddingY?: number;
  buttonUppercase: boolean;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  subdomain: string;
  settings: ProjectSettings;
  created_at: string;
}
