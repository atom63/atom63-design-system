import { useIsInsideExample } from './example-context'
import { mdxStyles } from './mdx-styles'

const skipTypographyClasses = new Set([
  'btn',
  'button',
  'card',
  'alert',
  'badge',
  'input',
  'select',
  'form',
  'nav',
  'menu',
  'dropdown',
  'modal',
  'dialog',
  'tooltip',
  'progress',
  'slider',
  'switch',
  'checkbox',
  'radio',
  'textarea',
  'example-container',
  'component-preview',
  'demo-container',
  'not-mdx',
  'not-prose',
  'no-typography',
  'foundation-preview',
])

export function hasSkipClass(className?: string): boolean {
  if (!className) {
    return false
  }

  return className.split(/\s+/).some(token => skipTypographyClasses.has(token))
}

export function getMdxStyle(
  style: string,
  className: string | undefined,
  insideExample: boolean
): string {
  if (insideExample || hasSkipClass(className)) {
    return ''
  }
  return style
}

export function useMdxStyle(style: string, className?: string): string {
  const insideExample = useIsInsideExample()
  return getMdxStyle(style, className, insideExample)
}

export { mdxStyles }
