export interface BrandAuthor {
  email: string
  name: string
  twitter: string
}

export interface BrandSocials {
  behance: string
  github: string
  instagram: string
  linkedin: string
  twitter: string
}

export interface BrandSeoDefaults {
  author: BrandAuthor
  description: string
  keywords: {
    primary: string[]
    secondary: string[]
  }
  name: string
  ogDescription: string
  ogTitle: string
  socials: BrandSocials
  tagline: string
  url: string
}

export type EndpointId = 'atom63.io' | 'design-system' | 'learn' | 'os63'

export interface EndpointConfig {
  description: string
  id: EndpointId
  keywords?: string[]
  name: string
  ogDescription?: string
  ogImage?: string
  ogTitle?: string
  themeColor?: string
  url: string
}

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

export interface ResolvedMeta {
  author: string
  description: string
  icons: {
    apple: string
    icon: Array<{ sizes?: string; type?: string; url: string }>
    manifest: string
    shortcut: string
  }
  keywords: string[]
  openGraph: {
    description: string
    image: string
    imageAlt: string
    imageHeight: number
    imageWidth: number
    locale: string
    siteName: string
    title: string
    type: string
    url: string
  }
  robots: string
  structuredData: object[]
  themeColor: Array<{ color: string; media: string }>
  title: string
  twitter: {
    card: string
    creator: string
    description: string
    image: string
    site: string
    title: string
  }
  viewport: string
}
