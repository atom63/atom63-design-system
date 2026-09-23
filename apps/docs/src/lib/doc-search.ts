import { getAllDocEntries } from './doc-pages'
import { DOC_AREA_LABELS, pathForDoc, type DocAreaId } from './doc-taxonomy'
import { loadDocSource } from './doc-source'

/** Mirrors the slugify in `PageTableOfContents` so hits deep-link to real anchors. */
function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'section'
  )
}

export type DocSearchRecord = {
  anchor: string | null
  area: DocAreaId
  areaLabel: string
  body: string
  heading: string | null
  id: string
  pageTitle: string
  path: string
  sectionTitle: string
}

export type DocSearchHit = DocSearchRecord & {
  snippet: string
}

const CODE_FENCE = /^```/
const HEADING = /^(#{1,3})\s+(.*)$/

function recordsForPage(
  slug: string,
  pageTitle: string,
  area: DocAreaId,
  areaLabel: string,
  sectionTitle: string,
  path: string,
  source: string
): DocSearchRecord[] {
  const lines = source.split('\n')
  const records: DocSearchRecord[] = []
  const used = new Set<string>()

  let heading: string | null = null
  let anchor: string | null = null
  let buffer: string[] = []
  let inCode = false

  const flush = () => {
    const body = buffer.join(' ').replace(/\s+/g, ' ').trim()
    buffer = []

    if (!heading && !body) {
      return
    }

    records.push({
      anchor,
      area,
      areaLabel,
      body,
      heading,
      id: anchor ? `${slug}#${anchor}` : slug,
      pageTitle,
      path: anchor ? `${path}#${anchor}` : path,
      sectionTitle,
    })
  }

  for (const line of lines) {
    if (CODE_FENCE.test(line.trim())) {
      inCode = !inCode
      continue
    }
    if (inCode) {
      continue
    }

    const match = HEADING.exec(line)
    if (!match) {
      buffer.push(line.trim())
      continue
    }

    flush()

    const [, hashes, text] = match
    const title = (text ?? '').replace(/`/g, '').trim()

    if (hashes === '#') {
      heading = null
      anchor = null
      continue
    }

    let candidate = slugify(title)
    let suffix = 2
    while (used.has(candidate)) {
      candidate = `${slugify(title)}-${suffix}`
      suffix += 1
    }
    used.add(candidate)

    heading = title
    anchor = candidate
  }

  flush()
  return records
}

let indexPromise: Promise<DocSearchRecord[]> | null = null

export function loadDocSearchIndex(): Promise<DocSearchRecord[]> {
  indexPromise ??= (async () => {
    const entries = getAllDocEntries()
    const perPage = await Promise.all(
      entries.map(async entry => {
        const source = await loadDocSource(entry.slug)
        if (!source) {
          return []
        }

        return recordsForPage(
          entry.slug,
          entry.label,
          entry.area,
          DOC_AREA_LABELS[entry.area],
          entry.sectionTitle,
          pathForDoc(entry.area, entry.slug),
          source
        )
      })
    )

    return perPage.flat()
  })()

  return indexPromise
}

function snippetAround(body: string, term: string): string {
  const index = body.toLowerCase().indexOf(term)
  if (index === -1) {
    return body.slice(0, 120)
  }

  const start = Math.max(0, index - 40)
  const prefix = start > 0 ? '…' : ''
  return `${prefix}${body.slice(start, start + 140).trim()}`
}

export function searchDocs(records: DocSearchRecord[], query: string, limit = 24): DocSearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) {
    return []
  }

  const scored = records.flatMap(record => {
    const haystack =
      `${record.pageTitle} ${record.heading ?? ''} ${record.sectionTitle} ${record.body}`.toLowerCase()

    let score = 0
    for (const term of terms) {
      if (!haystack.includes(term)) {
        return []
      }

      if (record.pageTitle.toLowerCase().includes(term)) score += 12
      if (record.heading?.toLowerCase().includes(term)) score += 8
      if (record.body.toLowerCase().includes(term)) score += 2
    }

    return [{ hit: { ...record, snippet: snippetAround(record.body, terms[0] ?? '') }, score }]
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.hit)
}
