import { useEffect, useState } from 'react'
import type { HighlighterCore } from 'shiki/core'

const languageAliases: Record<string, string> = {
  cjs: 'javascript',
  htm: 'html',
  js: 'javascript',
  jsx: 'jsx',
  md: 'markdown',
  mdx: 'markdown',
  mjs: 'javascript',
  shell: 'bash',
  sh: 'bash',
  ts: 'typescript',
  tsx: 'tsx',
  yml: 'yaml',
}

const supportedLanguages = new Set([
  'bash',
  'css',
  'diff',
  'html',
  'javascript',
  'json',
  'jsx',
  'markdown',
  'tsx',
  'typescript',
  'yaml',
])

// shiki highlighter loaded dynamically
let instance: HighlighterCore | null = null
// shiki highlighter promise
let pending: Promise<HighlighterCore> | null = null

const MAX_CACHE_ENTRIES = 200
const htmlCache = new Map<string, string>()

async function getHighlighter() {
  if (instance) {
    return instance
  }
  if (!pending) {
    pending = (async () => {
      const [{ createHighlighterCore }, { createOnigurumaEngine }] = await Promise.all([
        import('shiki/core'),
        import('shiki/engine/oniguruma'),
      ])
      const h = await createHighlighterCore({
        themes: [
          import('shiki/themes/github-dark-dimmed.mjs'),
          // The high-contrast light theme is the only GitHub light theme whose
          // token colors all reach 4.5:1 on every light page surface.
          import('shiki/themes/github-light-high-contrast.mjs'),
        ],
        langs: [
          import('shiki/langs/tsx.mjs'),
          import('shiki/langs/typescript.mjs'),
          import('shiki/langs/javascript.mjs'),
          import('shiki/langs/jsx.mjs'),
          import('shiki/langs/css.mjs'),
          import('shiki/langs/diff.mjs'),
          import('shiki/langs/html.mjs'),
          import('shiki/langs/bash.mjs'),
          import('shiki/langs/json.mjs'),
          import('shiki/langs/markdown.mjs'),
          import('shiki/langs/yaml.mjs'),
        ],
        engine: createOnigurumaEngine(import('shiki/wasm')),
      })
      instance = h
      return h
    })()
  }
  return pending
}

export function normalizeCodeLanguage(lang?: string): string | undefined {
  const raw = lang
    ?.replace(/^language-/, '')
    .trim()
    .toLowerCase()
  if (!raw) {
    return undefined
  }

  const normalized = languageAliases[raw] ?? raw
  return supportedLanguages.has(normalized) ? normalized : undefined
}

export type ShikiHighlightResult = {
  error: Error | null
  html: string | null
  isLoading: boolean
  language: string | undefined
}

export function useShikiHighlightResult(code: string, lang = 'tsx'): ShikiHighlightResult {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const language = normalizeCodeLanguage(lang)

  useEffect(() => {
    const trimmed = code.trim()
    if (!trimmed) {
      setHtml(null)
      setError(null)
      setIsLoading(false)
      return
    }

    if (!language) {
      setHtml(null)
      setError(null)
      setIsLoading(false)
      return
    }

    const cacheKey = `${language}:${trimmed}`
    const cached = htmlCache.get(cacheKey)
    if (cached) {
      setHtml(cached)
      setError(null)
      setIsLoading(false)
      return
    }

    let active = true
    setHtml(null)
    setError(null)
    setIsLoading(true)

    getHighlighter()
      .then(h => {
        if (!active) {
          return
        }
        const result = h.codeToHtml(trimmed, {
          lang: language,
          themes: { dark: 'github-dark-dimmed', light: 'github-light-high-contrast' },
          defaultColor: false,
          transformers: [
            {
              pre(node) {
                node.properties['data-theme'] = 'dark light'
              },
            },
          ],
        })
        htmlCache.set(cacheKey, result)
        if (htmlCache.size > MAX_CACHE_ENTRIES) {
          const firstKey = htmlCache.keys().next().value
          if (firstKey !== undefined) {
            htmlCache.delete(firstKey)
          }
        }
        setHtml(result)
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught : new Error('Failed to highlight code block'))
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [code, language])

  return { error, html, isLoading, language }
}

export function useShikiHighlight(code: string, lang = 'tsx'): string | null {
  return useShikiHighlightResult(code, lang).html
}

export function highlightWithLoadedHighlighter(code: string): string | null {
  if (!instance) {
    return null
  }

  return instance.codeToHtml(code, { lang: 'tsx', theme: 'github-dark-dimmed' })
}

/** Trigger (or await) the shared shiki highlighter load. */
export function loadHighlighter(): Promise<HighlighterCore> {
  return getHighlighter()
}

/** The loaded highlighter instance, or null if it hasn't finished loading. */
export function getLoadedHighlighter(): HighlighterCore | null {
  return instance
}
