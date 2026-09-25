import type { ComponentType } from 'react'

export type Doc = {
  Content: ComponentType
  description: string
  group: string
  order: number
  slug: string
  title: string
}

type DocModule = {
  default: ComponentType
  frontmatter: { description: string; group: string; order: number; title: string }
}

/**
 * Every `docs/*.mdx` file is a page; its file name is the slug. Pages are
 * grouped by the `group` frontmatter, in the order the groups first appear
 * when sorted, and ordered inside a group by `order`.
 */
const modules = import.meta.glob<DocModule>('./docs/*.mdx', { eager: true })

const groupOrder = ['Getting started', 'Guides']

export const docs: Doc[] = Object.entries(modules)
  .map(([path, module]) => ({
    Content: module.default,
    ...module.frontmatter,
    slug: path.slice(path.lastIndexOf('/') + 1, -'.mdx'.length),
  }))
  .sort(
    (left, right) =>
      rank(left.group) - rank(right.group) ||
      left.group.localeCompare(right.group) ||
      left.order - right.order
  )

function rank(group: string): number {
  const position = groupOrder.indexOf(group)
  return position === -1 ? groupOrder.length : position
}

/** The groups, each with its pages, in reading order. */
export const groups = docs.reduce<{ docs: Doc[]; name: string }[]>((result, doc) => {
  const group = result.find(item => item.name === doc.group)
  if (group) group.docs.push(doc)
  else result.push({ docs: [doc], name: doc.group })
  return result
}, [])

export function findDoc(slug: string): Doc | undefined {
  return docs.find(doc => doc.slug === slug)
}

/** The pages before and after one, for reading straight through. */
export function neighbours(slug: string): { next?: Doc; previous?: Doc } {
  const index = docs.findIndex(doc => doc.slug === slug)
  return { next: docs[index + 1], previous: index > 0 ? docs[index - 1] : undefined }
}
