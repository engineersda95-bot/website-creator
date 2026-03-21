import React from 'react';
import { cn, toPx, formatRichText } from '@/lib/utils';

interface TextProps {
  content: {
    text: string;
  };
  style: {
    padding?: string;
    hPadding?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    titleBold?: boolean;
    titleItalic?: boolean;
  };
}

export const TextBlock: React.FC<TextProps> = ({ content, style }) => {
  const alignMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <section 
      className="w-full transition-all"
      style={{
        backgroundColor: style.backgroundColor,
        paddingTop: toPx(style.padding),
        paddingBottom: toPx(style.padding),
        marginTop: toPx(style.marginTop),
        marginBottom: toPx(style.marginBottom),
        marginLeft: toPx(style.marginLeft),
        marginRight: toPx(style.marginRight),
      }}
    >
      <div className={cn(
        "mx-auto transition-all",
        alignMap[style.align as keyof typeof alignMap] || 'text-center'
      )} style={{ 
        paddingLeft: toPx(style.hPadding, '2rem'),
        paddingRight: toPx(style.hPadding, '2rem'),
      }}>
        <p className="leading-relaxed transition-all duration-500" style={{ 
          color: style.textColor,
          fontSize: toPx(style.fontSize),
          fontWeight: style.titleBold === false ? 400 : (style.titleBold ? 700 : 400),
          fontStyle: style.titleItalic ? 'italic' : 'normal'
        }}
          dangerouslySetInnerHTML={{ __html: formatRichText(content.text) }}
        />
      </div>
    </section>
  );
};
