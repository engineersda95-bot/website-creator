import type { MetadataRoute } from 'next';

const BASE_URL = 'https://sitivetrina.it';

const blogSlugs = [
  'perche-ogni-attivita-locale-ha-bisogno-di-un-sito-web',
  'come-farsi-trovare-su-google-guida-seo-locale',
  'sito-web-vs-social-media-cosa-serve-davvero',
  '5-errori-sito-web-attivita-locale',
  'google-business-profile-guida-completa',
  'quanto-costa-un-sito-web-per-piccola-attivita',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    it: BASE_URL,
    en: `${BASE_URL}/en`,
    'x-default': BASE_URL,
  };

  const getAlternates = (path: string = '') => ({
    languages: {
      it: `${BASE_URL}${path}`,
      en: `${BASE_URL}/en${path}`,
      'x-default': `${BASE_URL}${path}`,
    },
  });

  const generateLanguageEntries = (path: string = '', priority: number = 0.8) => {
    return [
      {
        url: `${BASE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: path === '' ? 1 : priority,
        alternates: getAlternates(path),
      },
      {
        url: `${BASE_URL}/en${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: path === '' ? 1 : priority,
        alternates: getAlternates(path),
      },
    ];
  };

  const staticPages = [
    ...generateLanguageEntries(''),
    ...generateLanguageEntries('/blog', 0.8),
  ];

  const blogPages = blogSlugs.flatMap((slug) => 
    generateLanguageEntries(`/blog/${slug}`, 0.6)
  );

  return [...staticPages, ...blogPages];
}
