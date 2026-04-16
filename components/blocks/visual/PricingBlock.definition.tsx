import { Tag } from 'lucide-react';
import { PricingBlock } from '@/components/blocks/visual/PricingBlock';
import { Pricing } from '../sidebar/block-editors/Pricing';
import { BlockDefinition } from '@/types/block-definition';
import { getBaseStyleVars } from '@/lib/base-style-mapper';
import { toPx } from '@/lib/utils';
import React from 'react';

const Thumbnail: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none">
    <rect width="200" height="120" fill="#fafafa" />
    <rect x="10" y="18" width="56" height="84" rx="6" fill="#ffffff" stroke="#e4e4e7" />
    <rect x="72" y="10" width="56" height="100" rx="6" fill="#18181b" />
    <rect x="134" y="18" width="56" height="84" rx="6" fill="#ffffff" stroke="#e4e4e7" />
    <rect x="16" y="26" width="28" height="4" rx="1" fill="#a1a1aa" />
    <rect x="78" y="18" width="28" height="4" rx="1" fill="#71717a" />
    <rect x="140" y="26" width="28" height="4" rx="1" fill="#a1a1aa" />
    <rect x="16" y="35" width="20" height="9" rx="1.5" fill="#18181b" />
    <rect x="78" y="27" width="20" height="9" rx="1.5" fill="#ffffff" />
    <rect x="140" y="35" width="20" height="9" rx="1.5" fill="#18181b" />
    <rect x="16" y="52" width="38" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="16" y="58" width="34" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="16" y="64" width="36" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="78" y="42" width="38" height="2.5" rx="1" fill="#3f3f46" />
    <rect x="78" y="48" width="34" height="2.5" rx="1" fill="#3f3f46" />
    <rect x="78" y="54" width="36" height="2.5" rx="1" fill="#3f3f46" />
    <rect x="140" y="52" width="38" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="140" y="58" width="34" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="140" y="64" width="36" height="2.5" rx="1" fill="#e4e4e7" />
    <rect x="16" y="84" width="44" height="11" rx="5.5" fill="#e4e4e7" />
    <rect x="78" y="84" width="44" height="11" rx="5.5" fill="#ffffff" />
    <rect x="140" y="84" width="44" height="11" rx="5.5" fill="#e4e4e7" />
  </svg>
);

export const pricingDefinition: BlockDefinition = {
  type: 'pricing',
  label: 'Pricing / Piani',
  description: 'Confronto tra piani tariffari con feature list e CTA. Essenziale per servizi e abbonamenti.',
  thumbnail: Thumbnail,
  icon: Tag,
  visual: PricingBlock,
  unifiedEditor: Pricing,
  defaults: {
    content: {
      title: 'I Nostri Piani',
      subtitle: 'Scegli la soluzione più adatta alle tue esigenze e fai crescere il tuo business.',
      items: [
        {
          name: 'Base',
          price: '0€',
          period: '/mese',
          features: ['Sito web base', 'Hosting incluso', 'Assistenza email'],
          buttonText: 'Inizia Ora',
          buttonUrl: '#',
          isHighlighted: false
        },
        {
          name: 'Pro',
          price: '29€',
          period: '/mese',
          features: ['Sito web professionale', 'Dominio personalizzato', 'Assistenza prioritaria 24/7', 'SEO avanzata'],
          buttonText: 'Scegli Pro',
          buttonUrl: '#',
          isHighlighted: true
        }
      ]
    },
    style: {
      padding: 80,
      align: 'center',
      gap: 32,
      columns: 2,
      titleBold: true,
      titleTag: 'h2',
      subtitleBold: false,
      subtitleItalic: false,
      cardBorderRadius: 24,
      cardPadding: 40,
      cardBgColor: '#ffffff',
      cardTextColor: '#000000',
      highlightColor: '#000000',
      planNameSize: 14,
      planNameBold: true,
      priceSize: 40,
      priceBold: true,
      periodSize: 18,
      featuresSize: 14,
      labelSize: 10,
      labelBold: true,
      patternType: 'none',
      animationType: 'none',
      animationDuration: 0.8,
      animationDelay: 0
    },
    responsiveStyles: {
      tablet: { columns: 2 },
      mobile: { columns: 1 }
    }
  },
  styleMapper: (style, block, project, viewport) => {
    const { vars, style: s } = getBaseStyleVars(style, block, project, viewport);
    const settings = project?.settings;
    const isDark = settings?.appearance === 'dark';
    const theme = settings?.themeColors;

    const defaultCardBg = isDark
      ? (theme?.dark?.bg || '#161618')
      : (theme?.light?.bg || '#ffffff');
    const defaultCardText = isDark
      ? (theme?.dark?.text || '#ffffff')
      : (theme?.light?.text || '#000000');

    const val = (key: string, def: any) => s[key] !== undefined && s[key] !== null ? s[key] : def;
    const toStyle = (key: string, defFS: string) => ({
      fs: toPx(val(`${key}Size`, null), defFS),
      fw: val(`${key}Bold`, false) ? '700' : '400',
      is: val(`${key}Italic`, false) ? 'italic' : 'normal'
    });

    const planName = toStyle('planName', '14px');
    const price = toStyle('price', '40px');
    const period = toStyle('period', '18px');
    const features = toStyle('features', '14px');
    const label = toStyle('label', '10px');

    return {
      ...vars,
      '--card-bg': val('cardBgColor', defaultCardBg),
      '--card-color': val('cardTextColor', defaultCardText),
      '--card-radius': toPx(val('cardBorderRadius', 24), '24px'),
      '--card-padding': toPx(val('cardPadding', 40), '40px'),
      '--card-gap': toPx(val('gap', 32), '32px'),
      '--highlight-color': val('highlightColor', project?.settings?.primaryColor || '#000000'),
      '--plan-name-fs': planName.fs,
      '--plan-name-fw': planName.fw,
      '--plan-name-is': planName.is,
      '--price-fs': price.fs,
      '--price-fw': price.fw,
      '--price-is': price.is,
      '--period-fs': period.fs,
      '--period-fw': period.fw,
      '--period-is': period.is,
      '--features-fs': features.fs,
      '--features-fw': features.fw,
      '--features-is': features.is,
      '--label-fs': label.fs,
      '--label-fw': label.fw,
      '--label-is': label.is,
    };
  }
};
