import { Children, type ReactElement, type ReactNode } from 'react'

/**
 * Wrap each run of adjacent string and number children in one element, and
 * leave other children (icons, Kbd, …) as they are.
 *
 * React passes `Save {name}` as two children, so wrapping each child on its
 * own would split one label into several flex items with a gap between them.
 * A run always ends at an element or at the edge of the label, so trimming
 * the run only removes the space next to an icon (the flex gap replaces it):
 * `<Icon /> Save` loses its space, while `{a} · {b}` keeps both of its own.
 * A run that is only whitespace is dropped.
 */
export function wrapTextRuns(
  children: ReactNode,
  wrap: (text: string, key: number) => ReactElement
): ReactNode[] {
  const result: ReactNode[] = []
  let run: string | null = null

  const flush = () => {
    const text = run?.trim()
    if (text) result.push(wrap(text, result.length))
    run = null
  }

  for (const child of Children.toArray(children)) {
    if (typeof child === 'string' || typeof child === 'number') {
      run = (run ?? '') + String(child)
    } else {
      flush()
      result.push(child)
    }
  }
  flush()
  return result
}
