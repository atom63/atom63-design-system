import {
  DocsMDXContentProvider,
  isExternalMdxHref,
  type MDXContentProviderProps,
  type MdxProviderVariant,
  mdxStyles,
  useMdxStyle,
} from '../mdx-kit'
import { Link } from '@tanstack/react-router'
import { clsx } from 'clsx'
import type React from 'react'

export type { MDXContentProviderProps, MdxProviderVariant }

function MdxLink({ className, href, rel, target, ...props }: React.ComponentProps<'a'>) {
  const external = isExternalMdxHref(href)
  const linkClassName = clsx(useMdxStyle(mdxStyles.content.link, className), className)

  if (!external && href?.startsWith('/')) {
    return <Link className={linkClassName} to={href} {...props} />
  }

  return (
    <a
      className={linkClassName}
      href={href}
      rel={external ? (rel ?? 'noopener noreferrer') : rel}
      target={external ? (target ?? '_blank') : target}
      {...props}
    />
  )
}

const mdxOverrides = { a: MdxLink }

export function MDXContentProvider(props: MDXContentProviderProps) {
  return <DocsMDXContentProvider components={mdxOverrides} {...props} />
}
