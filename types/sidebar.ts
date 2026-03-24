import { Project } from './editor';

export interface StyleEditorProps {
   getStyleValue: (key: string, defaultValue: any) => any;
   updateStyle: (style: Record<string, any>) => void;
   project?: Project;
}

export interface ContentEditorProps {
   selectedBlock: any;
   updateContent: (content: Record<string, any>) => void;
   project?: Project;
}

export interface ColorManagerProps extends StyleEditorProps {
   bgKey?: string;
   textKey?: string;
   title?: string;
   icon?: any;
   colorClass?: string;
   showReset?: boolean;
}

export interface LayoutFieldsProps extends StyleEditorProps {
   showAlign?: boolean;
   paddingLabel?: string;
   hPaddingLabel?: string;
}

export interface TypographyFieldsProps extends StyleEditorProps {
   label: string;
   sizeKey: string;
   boldKey?: string;
   italicKey?: string;
   min?: number;
   max?: number;
   defaultValue?: number;
}

export interface SimpleSliderProps {
   label: string;
   value: number;
   onChange: (val: number) => void;
   min?: number;
   max?: number;
   step?: number;
   suffix?: string;
}

export interface SimpleInputProps {
   label: string;
   value: string;
   onChange: (val: string) => void;
   placeholder?: string;
   icon?: any;
}

export interface RichTextareaProps {
   label?: string;
   value: string;
   onChange: (val: string) => void;
   placeholder?: string;
}
export interface BackgroundManagerProps {
   selectedBlock: any;
   updateContent: (content: Record<string, any>) => void;
   updateStyle: (style: Record<string, any>) => void;
   getStyleValue: (key: string, defaultValue: any) => any;
}

export interface BorderShadowManagerProps extends StyleEditorProps {}

export interface CTAManagerProps {
   content: Record<string, any>;
   updateContent: (content: Record<string, any>) => void;
   style?: Record<string, any>;
   updateStyle?: (style: Record<string, any>) => void;
}

export interface LayoutGridSliderProps extends StyleEditorProps {
   content: Record<string, any>;
   updateContent: (content: Record<string, any>) => void;
   viewport?: 'desktop' | 'tablet' | 'mobile';
}
