/**
 * Plain-markdown source for each doc page, served by the `design-system-llms-txt`
 * Vite plugin. Loaded on demand so the palette and "Copy page" don't ship it eagerly.
 */
let sourcesPromise: Promise<Record<string, string>> | null = null

function loadSources(): Promise<Record<string, string>> {
  sourcesPromise ??= import('virtual:atom63-doc-markdown').then(module => module.default)
  return sourcesPromise
}

export async function loadDocSource(slug: string): Promise<string | null> {
  const sources = await loadSources()
  return sources[slug] ?? null
}

export async function loadAllDocSources(): Promise<Record<string, string>> {
  return await loadSources()
}
