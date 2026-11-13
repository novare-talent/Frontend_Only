import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'
import { getAllIITs } from '@/data/iit-placements'

const LAST_MODIFIED = new Date('2025-03-31')

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL

  return [
    { url: baseUrl, lastModified: LAST_MODIFIED, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/sign-in`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/sign-up`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/iit-placements`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    ...getAllIITs().map((iit) => ({
      url: `${baseUrl}/iit-placements/${iit.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    { url: `${baseUrl}/career-blogs`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/promptly-ai-privacy-policy`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
