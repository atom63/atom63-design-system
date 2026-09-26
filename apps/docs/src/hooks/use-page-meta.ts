import { createMeta, type PageMetaOverrides } from '../lib/site-meta'
import { useEffect } from 'react'

const baseMeta = createMeta()

function updateMetaTag(selector: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement
  if (!el) {
    el = document.createElement('meta')
    const propMatch = selector.match(/property="([^"]+)"/)
    const nameMatch = selector.match(/name="([^"]+)"/)
    if (propMatch) el.setAttribute('property', propMatch[1])
    else if (nameMatch) el.setAttribute('name', nameMatch[1])
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function applyMeta(meta: ReturnType<typeof createMeta>) {
  document.title = meta.title
  updateMetaTag('meta[name="description"]', meta.description)
  updateMetaTag('meta[name="keywords"]', meta.keywords.join(', '))
  updateMetaTag('meta[name="author"]', meta.author)
  updateMetaTag('meta[name="robots"]', meta.robots)
  updateMetaTag('meta[property="og:type"]', meta.openGraph.type)
  updateMetaTag('meta[property="og:locale"]', meta.openGraph.locale)
  updateMetaTag('meta[property="og:site_name"]', meta.openGraph.siteName)
  updateMetaTag('meta[property="og:title"]', meta.openGraph.title)
  updateMetaTag('meta[property="og:description"]', meta.openGraph.description)
  updateMetaTag('meta[property="og:image"]', meta.openGraph.image)
  updateMetaTag('meta[property="og:url"]', meta.openGraph.url)
  updateMetaTag('meta[name="twitter:card"]', meta.twitter.card)
  updateMetaTag('meta[name="twitter:title"]', meta.twitter.title)
  updateMetaTag('meta[name="twitter:description"]', meta.twitter.description)
  updateMetaTag('meta[name="twitter:image"]', meta.twitter.image)

  let ldScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement
  if (!ldScript) {
    ldScript = document.createElement('script')
    ldScript.type = 'application/ld+json'
    document.head.appendChild(ldScript)
  }
  ldScript.textContent = JSON.stringify(meta.structuredData)
}

export function usePageMeta(overrides?: PageMetaOverrides) {
  useEffect(() => {
    const meta = overrides ? createMeta(overrides) : baseMeta
    applyMeta(meta)
    return () => {
      document.title = baseMeta.title
    }
  }, [overrides])
}
