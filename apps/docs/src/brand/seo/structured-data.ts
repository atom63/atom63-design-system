import { brandSeo } from './brand-seo'
import type { EndpointConfig } from './types'

export function createPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: brandSeo.author.name,
    url: brandSeo.url,
    jobTitle: 'Design Engineer',
    email: brandSeo.author.email,
    sameAs: [
      brandSeo.socials.twitter,
      brandSeo.socials.github,
      brandSeo.socials.linkedin,
      brandSeo.socials.instagram,
      brandSeo.socials.behance,
    ],
  }
}

export function createWebSiteSchema(endpoint: EndpointConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: endpoint.name,
    url: endpoint.url,
    description: endpoint.description,
    publisher: {
      '@type': 'Person',
      name: brandSeo.author.name,
      url: brandSeo.url,
    },
  }
}

export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandSeo.name,
    url: brandSeo.url,
    description: brandSeo.description,
    logo: `${brandSeo.url}/og.png`,
    sameAs: [brandSeo.socials.twitter, brandSeo.socials.github, brandSeo.socials.linkedin],
    contactPoint: {
      '@type': 'ContactPoint',
      email: brandSeo.author.email,
      contactType: 'customer service',
    },
  }
}
