/**
 * Page metadata for the docs site. It describes the design system only: no
 * personal contact details or social accounts belong in this public repo.
 */
export interface PageMetaOverrides {
  description?: string
  keywords?: string[]
  ogDescription?: string
  ogImage?: string
  ogTitle?: string
  ogUrl?: string
  title?: string
  twitterDescription?: string
  twitterImage?: string
  twitterTitle?: string
}

export const site = {
  name: 'Design System | ATOM63',
  siteName: 'ATOM63',
  url: 'https://system.atom63.io',
  repository: 'https://github.com/atom63/atom63-design-system',
  description:
    'ATOM63 Design System — tokens, components, and patterns for building expressive digital interfaces.',
  keywords: [
    'ATOM63',
    'design system',
    'UI components',
    'design tokens',
    'component library',
    'React',
    'SwiftUI',
  ],
}

export function createMeta(overrides: PageMetaOverrides = {}) {
  const title = overrides.title ? `${overrides.title} | ${site.name}` : site.name
  const description = overrides.description ?? site.description
  const ogImage = overrides.ogImage ?? '/og.png'
  const image = ogImage.startsWith('http') ? ogImage : `${site.url}${ogImage}`
  const ogTitle = overrides.ogTitle ?? site.name
  const ogDescription = overrides.ogDescription ?? description

  return {
    title,
    description,
    keywords: [...site.keywords, ...(overrides.keywords ?? [])],
    author: site.siteName,
    robots: 'index, follow',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: overrides.ogUrl ?? site.url,
      siteName: site.siteName,
      title: ogTitle,
      description: ogDescription,
      image,
    },
    twitter: {
      card: 'summary_large_image',
      title: overrides.twitterTitle ?? ogTitle,
      description: overrides.twitterDescription ?? ogDescription,
      image: overrides.twitterImage ?? image,
    },
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.name,
        url: site.url,
        description: site.description,
        sameAs: [site.repository],
      },
    ],
  }
}
