import { createContext, type ReactNode } from 'react'

/**
 * Internal-only styling channel for embedded code blocks. Not part of the
 * public `@atom63/mdx/blocks` API — only `CodeBlock` (reader) and `Compare`
 * (writer) consume it in-package. See P2 Batch A: the provider was retired from the
 * public exports because no app consumed it.
 */
export type CodeBlockVariant = 'article' | 'embedded'

export const CodeBlockVariantContext = createContext<CodeBlockVariant | undefined>(undefined)

export type CodeBlockVariantProviderProps = {
  children: ReactNode
  variant: CodeBlockVariant
}

export function CodeBlockVariantProvider({ children, variant }: CodeBlockVariantProviderProps) {
  return (
    <CodeBlockVariantContext.Provider value={variant}>{children}</CodeBlockVariantContext.Provider>
  )
}
