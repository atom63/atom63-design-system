export interface CssRule {
  selectors: string[]
  declarations: Record<string, string>
}

const squash = (text: string) => text.replace(/\s+/g, ' ').trim()

function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === '(' || char === '[') depth++
    else if (char === ')' || char === ']') depth--
    else if (char === separator && depth === 0) {
      parts.push(text.slice(start, index))
      start = index + 1
    }
  }
  parts.push(text.slice(start))
  return parts.map(squash).filter(Boolean)
}

export function readRules(css: string): CssRule[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rules: CssRule[] = []
  let index = 0
  while (index < source.length) {
    const open = source.indexOf('{', index)
    if (open === -1) break
    const prelude = squash(source.slice(index, open))
    let depth = 1
    let close = open + 1
    while (close < source.length && depth > 0) {
      if (source[close] === '{') depth++
      else if (source[close] === '}') depth--
      close++
    }
    const body = source.slice(open + 1, close - 1)
    index = close
    if (prelude.startsWith('@')) continue
    const declarations: Record<string, string> = {}
    for (const declaration of splitTopLevel(body, ';')) {
      const colon = declaration.indexOf(':')
      if (colon === -1) continue
      declarations[declaration.slice(0, colon).trim()] = squash(declaration.slice(colon + 1))
    }
    rules.push({ selectors: splitTopLevel(prelude, ','), declarations })
  }
  return rules
}
