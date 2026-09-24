import {
  MDXContentProvider as BaseMDXContentProvider,
  type MDXContentProviderProps,
} from '../mdx-provider'

export type { MDXContentProviderProps, MdxProviderVariant } from '../mdx-provider'

/** Portfolio / blog: narrow text column, full-width media (see `articleNarrowProse`). */
export function ArticleMDXContentProvider({
  variant = 'narrow',
  ...props
}: MDXContentProviderProps) {
  return <BaseMDXContentProvider variant={variant} {...props} />
}
