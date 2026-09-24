// packages/mdx/src/mdx-source-editor.tsx
import { useEffect, useState } from 'react'
import Editor from 'react-simple-code-editor'
import { highlightWithLoadedHighlighter, loadHighlighter } from './lib/use-shiki-highlight'

export interface MdxSourceEditorProps {
  value: string
  onChange: (next: string) => void
  className?: string
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// react-simple-code-editor's highlight prop is synchronous; shiki loads async.
// Return escaped plain text until the shared highlighter is ready (forced
// re-render below), then highlighted spans. Single dark theme = real inline
// colors that don't depend on theme CSS.
function highlight(code: string): string {
  const html = highlightWithLoadedHighlighter(code)
  if (!html) return escapeHtml(code)
  return html
    .replace(/^<pre[^>]*>/, '')
    .replace(/<\/pre>$/, '')
    .replace(/^<code[^>]*>/, '')
    .replace(/<\/code>$/, '')
}

/**
 * Editable MDX surface — a textarea layered over shiki-highlighted output.
 * Sibling of the read-only MdxSourceView; the panel chooses which to show.
 */
export function MdxSourceEditor({ value, onChange, className }: MdxSourceEditorProps) {
  const [, force] = useState(0)
  useEffect(() => {
    let active = true
    // loadHighlighter() dynamically imports shiki and CAN reject; without the
    // rejection handler a failed load became an unhandled rejection. On failure
    // we simply stay on the escaped plain-text fallback in highlight().
    loadHighlighter().then(
      () => {
        if (active) force(n => n + 1)
      },
      () => {
        // no-op: highlight() already degrades to escaped plain text
      }
    )
    return () => {
      active = false
    }
  }, [])

  return (
    <div className={`bg-card/40 h-full overflow-auto ${className ?? ''}`}>
      <Editor
        highlight={highlight}
        onValueChange={onChange}
        padding={12}
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.5,
          minHeight: '100%',
        }}
        textareaClassName="focus:outline-none"
        value={value}
      />
    </div>
  )
}
