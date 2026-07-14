import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://useproofly.vercel.app';

  const routes = [
    '',
    '/pricing',
    '/docs',
    '/blog',
    '/changelog',
    '/demo',
    '/live-demo',
    '/status',
    '/privacy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
