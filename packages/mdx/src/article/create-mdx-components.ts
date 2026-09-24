import { blockMdxComponents, mdxComponents as coreMdxComponents } from '../mdx-components'
import type { MdxComponentsMap } from '../mdx-provider'

export { blockMdxComponents }

/**
 * Merge core prose + block components with app-specific extensions.
 * Later keys win (extensions override core).
 *
 * The result is deliberately NOT intersected with `Record<string, unknown>`.
 * That widened every key's value type to `unknown`, and `unknown` is not a
 * component, so the returned map was not assignable to MDXProvider's own
 * `components` prop — every call site passing it to MDXContentProvider failed
 * to typecheck. Constraining the extensions to the provider's map type instead
 * keeps the merge open-ended while staying assignable.
 */
export function createMdxComponents<T extends MdxComponentsMap>(
  extensions: T = {} as T
): typeof coreMdxComponents & T {
  return {
    ...coreMdxComponents,
    ...extensions,
  }
}
