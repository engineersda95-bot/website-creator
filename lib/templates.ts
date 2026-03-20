import { Block, BlockType } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';

export const TEMPLATES = {
  landing: [
    {
      type: 'navigation' as BlockType,
      content: { 
        logoText: 'PROXIMATICA', 
        links: [
          { label: 'Servizi', url: '#servizi' },
          { label: 'Chi Siamo', url: '#chi-siamo' },
          { label: 'Progetti', url: '#gallery' }
        ], 
        showContact: true, 
        contactLabel: 'Inizia Ora', 
        contactUrl: '#contatti' 
      },
      style: { padding: '2rem', align: 'right' as const }
    },
    {
      type: 'hero' as BlockType,
      content: { 
        title: 'Realizziamo Visioni Digitali Straordinarie', 
        subtitle: 'Dalla strategia al design, costruiamo esperienze che trasformano il tuo business e incantano i tuoi clienti.', 
        cta: 'Scopri i Servizi',
        ctaUrl: '#servizi'
      },
      style: { padding: '12rem', align: 'center' as const, fontSize: '120px', gap: '3rem' }
    },
    {
      type: 'features' as BlockType,
      content: { 
        items: [
          { title: 'Design Strategico', description: 'Non solo estetica, ma soluzioni pensate per convertire e guidare l\'utente.', icon: 'layers' },
          { title: 'Sviluppo Cloud', description: 'Applicazioni veloci, scalabili e sicure con le tecnologie più moderne.', icon: 'zap' },
          { title: 'Ottimizzazione SEO', description: 'Sorgiamo dai risultati di ricerca per darti la visibilità che meriti.', icon: 'rocket' }
        ] 
      },
      style: { padding: '8rem', align: 'center' as const, backgroundColor: '#f9fafb', cardStyle: 'elevated' as const, gap: '3rem' }
    },
    {
      type: 'image-text' as BlockType,
      content: {
        title: 'Innovazione Costante',
        text: 'Ogni progetto è una sfida che affrontiamo con passione. Crediamo che la tecnologia debba essere al servizio dell\'uomo, non il contrario. Utilizziamo i tool più avanzati per garantire risultati d\'eccellenza in ogni dettaglio.',
        image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=2070',
        imageSide: 'right',
        cta: 'Certificazioni',
        ctaUrl: '#'
      },
      style: { padding: '8rem', align: 'left' as const, gap: '100px', borderRadius: '4rem', shadow: 'L' as const }
    },
    {
      type: 'gallery' as BlockType,
      content: {
        images: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426',
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072',
          'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2070',
          'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=2070',
          'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=2074',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070'
        ],
        columns: 3
      },
      style: { padding: '8rem', gap: '2rem', borderRadius: '2rem', shadow: 'M' as const }
    },
    {
      type: 'map' as BlockType,
      content: {
        address: 'Piazza del Duomo, Milano',
        zoom: 15
      },
      style: { padding: '8rem', borderRadius: '4rem', shadow: 'L' as const }
    },
    {
      type: 'contact' as BlockType,
      content: { 
        title: 'Sempre al Tuo Fianco', 
        subtitle: 'Hai una domanda o vuoi iniziare a collaborare? Il nostro team è pronto ad ascoltarti.',
        email: 'hello@proximatica.it'
      },
      style: { padding: '10rem', backgroundColor: '#ffffff' }
    },
    {
      type: 'footer' as BlockType,
      content: { 
        copyright: `© ${new Date().getFullYear()} PROXIMATICA Agency`, 
        logoText: 'PROXIMATICA',
        layout: 'columns',
        socialLinks: [
          { platform: 'instagram', url: '#' },
          { platform: 'linkedin', url: '#' },
          { platform: 'twitter', url: '#' }
        ]
      },
      style: { padding: '6rem', backgroundColor: '#f9fafb' }
    }
  ],
  minimal: [
    {
      type: 'navigation' as BlockType,
      content: { logoText: 'SV', links: [{ label: 'Bio', url: '#' }], showContact: false },
      style: { padding: '1rem', align: 'center' as const }
    },
    {
      type: 'hero' as BlockType,
      content: { title: 'Minimal Design', subtitle: 'Focus on what matters.', cta: 'Start' },
      style: { padding: '8rem', align: 'center' as const }
    },
    {
      type: 'footer' as BlockType,
      content: { copyright: '© Minimalist' },
      style: { padding: '4rem', align: 'center' as const }
    }
  ]
};

export function getBlocksFromTemplate(templateName: keyof typeof TEMPLATES): Block[] {
  const blocks = TEMPLATES[templateName] || TEMPLATES.landing;
  return blocks.map(b => ({
    ...b,
    id: uuidv4()
  }));
}
