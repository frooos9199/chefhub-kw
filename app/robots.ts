import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/chef/', '/api/'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://chefhub-kw.vercel.app'}/sitemap.xml`,
  };
}
