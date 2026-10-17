import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://onecloud.app');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/how-it-works',
          '/about',
          '/security',
          '/help',
          '/login',
          '/signup',
          '/privacy',
          '/terms',
          '/acceptable-use',
          '/share/',
        ],
        disallow: [
          '/app/',
          '/api/',
          '/password-reset-success',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
