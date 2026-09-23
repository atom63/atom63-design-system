/**
 * Converts MDX page source into readable plain markdown for search indexing,
 * "Copy page", and the `.md` twins served to agents.
 *
 * Pure and dependency-free so both the browser bundle and the Vite config can use it.
 */

const endsImport = (line: string) => /from\s+['"][^'"]+['"];?$/.test(line)
const endsTagOrComment = (line: string) => line.endsWith('>') || line.endsWith('*/}')
const DOC_EXAMPLE_START_PATTERN = /^<DocExample(?:\s|>|$)/
const DOC_EXAMPLE_END_PATTERN = /^<\/DocExample>/
const DOC_EXAMPLE_CODE_START_PATTERN = /\bcode=\{`(.*)$/

function readDocExample(
  lines: string[],
  startIndex: number
): {
  code: string | null
  endIndex: number
} {
  const code: string[] = []
  let collectingCode = false
  let endIndex = startIndex

  for (let index = startIndex; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? ''
    const trimmed = rawLine.trim()
    endIndex = index

    if (!collectingCode) {
      const codeStart = rawLine.match(DOC_EXAMPLE_CODE_START_PATTERN)?.[1]
      if (codeStart !== undefined) {
        const codeEnd = codeStart.indexOf('`}')
        if (codeEnd >= 0) {
          code.push(codeStart.slice(0, codeEnd))
        } else {
          code.push(codeStart)
          collectingCode = true
        }
      }
    } else {
      const codeEnd = rawLine.indexOf('`}')
      if (codeEnd >= 0) {
        code.push(rawLine.slice(0, codeEnd))
        collectingCode = false
      } else {
        code.push(rawLine)
      }
    }

    if (DOC_EXAMPLE_END_PATTERN.test(trimmed)) {
      break
    }
  }

  const source = code.join('\n').trim()
  return { code: source || null, endIndex }
}

export function mdxToMarkdown(source: string): string {
  const output: string[] = []
  let skipUntil: ((line: string) => boolean) | null = null
  const lines = source.split('\n')

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? ''
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (skipUntil) {
      if (skipUntil(trimmed)) {
        skipUntil = null
      }
      continue
    }

    if (/^import\s/.test(trimmed)) {
      if (!endsImport(trimmed)) {
        skipUntil = endsImport
      }
      continue
    }

    if (/^export\s/.test(trimmed)) {
      continue
    }

    if (DOC_EXAMPLE_START_PATTERN.test(trimmed)) {
      const example = readDocExample(lines, index)
      if (example.code) {
        output.push('```tsx', example.code, '```')
      }
      index = example.endIndex
      continue
    }

    if (trimmed.startsWith('<') || trimmed.startsWith('{/*')) {
      if (!endsTagOrComment(trimmed)) {
        skipUntil = endsTagOrComment
      }
      continue
    }

    output.push(line)
  }

  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
