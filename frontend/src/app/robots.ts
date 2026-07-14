import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://useproofly.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/founder/',
        '/api/',
        '/auth/callback/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
