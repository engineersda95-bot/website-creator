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
  'pdf' |
  'pricing' |
  'promo' |
  'blog-list';

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
  language?: string; // e.g. 'it', 'en'
  translations_group_id?: string; // groups page variants across languages
  seo?: {
    title?: string;
    description?: string;
    image?: string;
    indexable?: boolean;
  };
  updated_at: string;
}

export interface SiteGlobal {
  id: string;
  project_id: string;
  language: string;
  type: 'navigation' | 'footer';
  content: any;
  style: any;
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
  customDomain?: string;
  domainStatus?: 'pending' | 'active' | 'error';
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
  languages?: string[]; // Supported languages, e.g. ['it', 'en']
  defaultLanguage?: string; // Main language, e.g. 'it'
  typography?: {
    h1Size?: number;
    h2Size?: number;
    h3Size?: number;
    h4Size?: number;
    h5Size?: number;
    h6Size?: number;
    bodySize?: number;
  };
  blogPostDisplay?: {
    coverImageMode?: 'hero' | 'contained';
    bodyMaxWidth?: number;
    bodyPaddingX?: number;
    bodyPaddingXMobile?: number;
    bodyPaddingY?: number;
    bodyPaddingYMobile?: number;
    showToc?: boolean;
  };
}

/** Lightweight page descriptor — used in static generation instead of full Page objects */
export interface PageStub {
  id: string;
  slug: string;
  language?: string;
  translations_group_id?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  subdomain: string;
  custom_domain?: string;
  settings: ProjectSettings;
  live_url?: string;
  last_published_at?: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  project_id: string;
  slug: string;
  title: string;
  excerpt?: string;
  cover_image?: string;
  categories?: string[];
  authors?: { name: string; slug: string; bio?: string; avatar?: string }[];
  status: 'draft' | 'published';
  published_at?: string | null;
  blocks?: Block[];
  seo?: { title?: string; description?: string; image?: string; indexable?: boolean };
  display_settings?: {
    showToc?: boolean;
    coverImageMode?: 'hero' | 'contained';
    bodyMaxWidth?: number;
    bodyPaddingX?: number;
    bodyAlign?: 'left' | 'center' | 'right';
  };
  language?: string;
  translation_group?: string;
  created_at: string;
  updated_at?: string;
}
