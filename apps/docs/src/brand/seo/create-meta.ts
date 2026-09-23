import { brandSeo } from './brand-seo'
import { getEndpoint } from './endpoints'
import {
  createOrganizationSchema,
  createPersonSchema,
  createWebSiteSchema,
} from './structured-data'
import type { EndpointId, PageMetaOverrides, ResolvedMeta } from './types'

const DEFAULT_ICONS = {
  icon: [
    { url: '/favicons/favicon.ico', sizes: 'any' },
    { url: '/favicons/favicon.png', type: 'image/png' },
    { url: '/favicons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    { url: '/favicons/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
    { url: '/favicons/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
  shortcut: '/favicons/favicon.ico',
  apple: '/favicons/apple-touch-icon.png',
  manifest: '/favicons/site.webmanifest',
}

export function createMeta(
  endpointId: EndpointId,
  pageOverrides?: PageMetaOverrides
): ResolvedMeta {
  const endpoint = getEndpoint(endpointId)

  const keywords = [
    ...brandSeo.keywords.primary,
    ...(endpoint.keywords ?? []),
    ...brandSeo.keywords.secondary,
    ...(pageOverrides?.keywords ?? []),
  ]

  const description = pageOverrides?.description ?? endpoint.description
  const ogImage = pageOverrides?.ogImage ?? endpoint.ogImage ?? '/og.png'
  const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${endpoint.url}${ogImage}`

  const title = pageOverrides?.title ? `${pageOverrides.title} | ${endpoint.name}` : endpoint.name

  const ogTitle = pageOverrides?.ogTitle ?? endpoint.ogTitle ?? endpoint.name
  const ogDescription = pageOverrides?.ogDescription ?? endpoint.ogDescription ?? description
  const twitterTitle = pageOverrides?.twitterTitle ?? ogTitle
  const twitterDescription = pageOverrides?.twitterDescription ?? ogDescription
  const twitterImage = pageOverrides?.twitterImage ?? absoluteOgImage

  return {
    title,
    description,
    keywords,
    author: brandSeo.author.name,
    robots: 'index, follow',
    viewport:
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',

    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageOverrides?.ogUrl ?? endpoint.url,
      siteName: brandSeo.name,
      title: ogTitle,
      description: ogDescription,
      image: absoluteOgImage,
      imageWidth: 1200,
      imageHeight: 630,
      imageAlt: endpoint.name,
    },

    twitter: {
      card: 'summary_large_image',
      site: brandSeo.author.twitter,
      creator: brandSeo.author.twitter,
      title: twitterTitle,
      description: twitterDescription,
      image: twitterImage,
    },

    themeColor: endpoint.themeColor
      ? [
          { media: '(prefers-color-scheme: light)', color: endpoint.themeColor },
          { media: '(prefers-color-scheme: dark)', color: endpoint.themeColor },
        ]
      : [
          { media: '(prefers-color-scheme: light)', color: 'white' },
          { media: '(prefers-color-scheme: dark)', color: 'black' },
        ],

    icons: DEFAULT_ICONS,

    structuredData: [
      createPersonSchema(),
      createOrganizationSchema(),
      createWebSiteSchema(endpoint),
    ],
  }
}

export function createPageTitle(endpointId: EndpointId, pageTitle?: string): string {
  const endpoint = getEndpoint(endpointId)
  return pageTitle ? `${pageTitle} | ${endpoint.name}` : endpoint.name
}
