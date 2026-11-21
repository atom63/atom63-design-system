import {
  Card,
  CardContent,
  CardDescription,
  CardLabel,
  CardMedia,
  CardTitle,
  cardLinkClassName,
} from '@atom63/ui-react'
import { Link } from '@tanstack/react-router'

import type { Project } from '../content/projects'

/** A project in a grid: its cover, title and one-line summary, linking to the case study. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link className={cardLinkClassName} params={{ slug: project.slug }} to="/projects/$slug">
      <Card className="h-full" padding="none" variant="interactive">
        <CardMedia aspectRatio="16/9">
          <img alt="" className="size-full object-cover" loading="lazy" src={project.cover} />
        </CardMedia>
        <CardContent>
          <CardLabel className="text-muted-foreground">
            {project.date.slice(0, 4)} · {project.role}
          </CardLabel>
          <CardTitle>{project.title}</CardTitle>
          <CardDescription lineClamp={2}>{project.summary}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}
