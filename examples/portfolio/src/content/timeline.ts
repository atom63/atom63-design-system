import { projects } from './projects'
import { resume } from './resume'
import { posts } from './writing'

export type TimelineKind = 'milestone' | 'project' | 'role' | 'writing'

export type TimelineEntry = {
  /** YYYY-MM or YYYY-MM-DD; entries sort on it. */
  date: string
  description: string
  /** An in-site path or a full URL. */
  href?: string
  kind: TimelineKind
  title: string
}

/** Things that are not a project, a post or a role: talks, awards, moves. */
const milestones: TimelineEntry[] = [
  {
    date: '2025-10',
    kind: 'milestone',
    title: 'Talk: Planning backwards',
    description: 'How the night trip planner was designed, at a regional transport design meetup.',
  },
  {
    date: '2023-04',
    kind: 'milestone',
    title: 'Moved to Lisbon',
    description: 'Started working remotely full time.',
  },
  {
    date: '2017-06',
    kind: 'milestone',
    title: 'Graduated',
    description: 'BA Interaction Design, Northbridge School of Design.',
  },
]

/** Everything on one line: projects, writing, roles and milestones, newest first. */
export const timeline: TimelineEntry[] = [
  ...projects.map(project => ({
    date: project.date,
    kind: 'project' as const,
    title: project.title,
    description: project.summary,
    href: `/projects/${project.slug}`,
  })),
  ...posts.map(post => ({
    date: post.date,
    kind: 'writing' as const,
    title: post.title,
    description: post.description,
    href: `/writing/${post.slug}`,
  })),
  ...resume.experience.map(role => ({
    date: role.start,
    kind: 'role' as const,
    title: `${role.title}, ${role.company}`,
    description: role.highlights[0] ?? '',
  })),
  ...milestones,
].sort((left, right) => right.date.localeCompare(left.date))

export const timelineKindLabels: Record<TimelineKind, string> = {
  milestone: 'Milestone',
  project: 'Project',
  role: 'Role',
  writing: 'Writing',
}
