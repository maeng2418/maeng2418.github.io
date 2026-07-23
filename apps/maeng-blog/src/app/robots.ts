import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// robots — REQ-BLOG-011, AC-BLOG-011
// output: 'export' 호환을 위해 force-static 고정 (REQ-BLOG-008).
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
