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
  'embed' | 
  'faq' |
  'quote' |
  'divider' |
  'logos' |
  'cards' |
  'benefits' |
  'how-it-works' |
  'pdf';

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
    indexable?: boolean;
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
  logo?: string;
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
  buttonAnimation?: 'none' | 'move-up' | 'scale';
  customScriptsHead?: string;
  customScriptsBody?: string;
  language?: string; // Global site language (e.g. 'it', 'en')
  businessType?: string; // Schema.org type (e.g. 'LocalBusiness', 'Restaurant')
  businessDetails?: {
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    businessName?: string;
    priceRange?: string; // e.g. '€', '€€', '€€€', '€€€€'
    servesCuisine?: string; // e.g. 'Italiana, Pizza'
  };
  responsive?: {
    mobile?: Partial<ProjectSettings>;
    tablet?: Partial<ProjectSettings>;
  };
  typography?: {
    h1Size?: number;
    h2Size?: number;
    h3Size?: number;
    h4Size?: number;
    h5Size?: number;
    h6Size?: number;
    bodySize?: number;
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
