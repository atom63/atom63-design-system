import type { ComponentType } from 'react'

export type Project = {
  Content: ComponentType
  /** The cover image, under public/. */
  cover: string
  coverAlt: string
  /** When the project shipped, as YYYY-MM-DD; it orders the list and the timeline. */
  date: string
  /** Shown on the home page. */
  featured: boolean
  /** Who you were on the project. */
  role: string
  slug: string
  /** One sentence: the problem and what changed. */
  summary: string
  team: string
  timeline: string
  title: string
  tools: string[]
}

type ProjectModule = {
  default: ComponentType
  frontmatter: Omit<Project, 'Content' | 'slug'>
}

/** Every `projects/*.mdx` file is a case study; its file name is the slug. */
const modules = import.meta.glob<ProjectModule>('./projects/*.mdx', { eager: true })

export const projects: Project[] = Object.entries(modules)
  .map(([path, module]) => ({
    Content: module.default,
    ...module.frontmatter,
    slug: path.slice(path.lastIndexOf('/') + 1, -'.mdx'.length),
  }))
  .sort((left, right) => right.date.localeCompare(left.date))

export const featuredProjects = projects.filter(project => project.featured)

export function findProject(slug: string): Project | undefined {
  return projects.find(project => project.slug === slug)
}
