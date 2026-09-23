import { MDXProvider } from '@mdx-js/react'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { FigureLightboxHost } from './lightbox/figure-lightbox-host'
import { mdxComponents } from './mdx-components'
import { mdxStyles } from './mdx-styles'
import { articleNarrowProse } from './variants/article-narrow'
import { docMdxStyles } from './variants/docs'

export type MdxProviderVariant = 'article' | 'docs' | 'narrow'

const variantRoot: Record<MdxProviderVariant, string> = {
  article: mdxStyles.root,
  docs: clsx(mdxStyles.root, docMdxStyles.root),
  narrow: clsx(mdxStyles.root, articleNarrowProse),
}

export type MdxComponentsMap = NonNullable<Parameters<typeof MDXProvider>[0]['components']>

export type MDXContentProviderProps = {
  children: ReactNode
  className?: string
  components?: MdxComponentsMap
  variant?: MdxProviderVariant
}

export function MDXContentProvider({
  children,
  className,
  components,
  variant = 'article',
}: MDXContentProviderProps) {
  const mergedComponents = components ? { ...mdxComponents, ...components } : mdxComponents

  return (
    <MDXProvider components={mergedComponents}>
      <FigureLightboxHost>
        <div
          className={clsx(
            'min-w-0 [overflow-wrap:anywhere] [&>*]:max-w-full',
            variantRoot[variant],
            className
          )}
          data-mdx-content=""
        >
          {children}
        </div>
      </FigureLightboxHost>
    </MDXProvider>
  )
}
