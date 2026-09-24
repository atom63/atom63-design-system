import {
  MDXContentProvider as BaseMDXContentProvider,
  type MDXContentProviderProps,
} from '../mdx-provider'

export type { MDXContentProviderProps, MdxProviderVariant } from '../mdx-provider'

/** Design-system docs: wider code blocks and doc rhythm (see `docMdxStyles`). */
export function DocsMDXContentProvider({ variant = 'docs', ...props }: MDXContentProviderProps) {
  return <BaseMDXContentProvider variant={variant} {...props} />
}
