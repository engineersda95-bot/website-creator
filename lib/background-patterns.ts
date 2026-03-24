
export type PatternType = 'none' | 'dots' | 'grid' | 'diagonal' | 'diagonal-reverse' | 'topography' | 'grain' | 'waves' | 'crt-mask';

export interface PatternDefinition {
  id: PatternType;
  label: string;
  getStyle: (color: string, opacity: number, scale?: number) => React.CSSProperties;
}

export const BACKGROUND_PATTERNS: PatternDefinition[] = [
  {
    id: 'none',
    label: 'Nessuno',
    getStyle: () => ({})
  },
  {
    id: 'dots',
    label: 'Punti',
    getStyle: (color, opacity, scale = 24) => ({
      backgroundImage: `radial-gradient(${color} 2px, transparent 2px)`,
      backgroundSize: `${scale}px ${scale}px`,
      opacity: opacity / 100
    })
  },
  {
    id: 'grid',
    label: 'Griglia',
    getStyle: (color, opacity, scale = 40) => ({
      backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
      backgroundSize: `${scale}px ${scale}px`,
      opacity: opacity / 100
    })
  },
  {
    id: 'diagonal',
    label: 'Diagonale R',
    getStyle: (color, opacity, scale = 15) => ({
      backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent ${scale}px)`,
      opacity: opacity / 100
    })
  },
  {
    id: 'diagonal-reverse',
    label: 'Diagonale L',
    getStyle: (color, opacity, scale = 15) => ({
      backgroundImage: `repeating-linear-gradient(-45deg, ${color}, ${color} 1px, transparent 1px, transparent ${scale}px)`,
      opacity: opacity / 100
    })
  },
  {
    id: 'topography',
    label: 'Topography',
    getStyle: (color, opacity, scale = 150) => {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><path d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 86c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm66-3c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-46-45c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm37 2c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm18 52c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM2 28c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm54 56c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm24-6c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM58 5c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-36 48c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm54-16c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM36 40c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm8 8c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm40-26c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM46 82c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm26-18c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM10 10c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm80 80c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM20 76c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM80 28c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z' fill='${color.replace('#', '%23')}' fill-opacity='1' fill-rule='evenodd'/></svg>`;
        return {
            backgroundImage: `url("data:image/svg+xml,${svg}")`,
            backgroundSize: `${scale}px ${scale}px`,
            opacity: opacity / 100
        };
    }
  },
  {
    id: 'grain',
    label: 'Grain',
    getStyle: (color, opacity) => ({
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      opacity: opacity / 400,
      filter: 'contrast(150%) brightness(100%)',
    })
  },
  {
    id: 'waves',
    label: 'Onde',
    getStyle: (color, opacity, scale = 100) => {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40' viewBox='0 0 80 40'><path d='M0 40c10 0 10-10 20-10s10 10 20 10 10-10 20-10 10 10 20 10' fill='none' stroke='${color.replace('#', '%23')}' stroke-width='1'/></svg>`;
        return {
            backgroundImage: `url("data:image/svg+xml,${svg}")`,
            backgroundSize: `${scale}px ${scale/2}px`,
            opacity: opacity / 100
        };
    }
  },
  {
    id: 'crt-mask',
    label: 'CRT Mask',
    getStyle: (color, opacity, scale = 4) => ({
      backgroundImage: `
        linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
        linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")
      `,
      backgroundSize: `100% ${scale}px, 3px 100%, auto`,
      opacity: opacity / 200,
    })
  }
];
