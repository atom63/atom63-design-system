import type { ComponentType } from 'react'

export type Post = {
  Content: ComponentType
  date: string
  description: string
  slug: string
  title: string
}

type PostModule = {
  default: ComponentType
  frontmatter: { date: string; description: string; title: string }
}

/** Every `blog/*.mdx` file is a post; its file name is the slug. */
const modules = import.meta.glob<PostModule>('./blog/*.mdx', { eager: true })

export const posts: Post[] = Object.entries(modules)
  .map(([path, module]) => ({
    Content: module.default,
    ...module.frontmatter,
    slug: path.slice(path.lastIndexOf('/') + 1, -'.mdx'.length),
  }))
  .sort((left, right) => right.date.localeCompare(left.date))

export function findPost(slug: string): Post | undefined {
  return posts.find(post => post.slug === slug)
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
