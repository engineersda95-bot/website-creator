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
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
