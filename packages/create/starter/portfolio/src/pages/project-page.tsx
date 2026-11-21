import { ArticleMDXContentProvider } from '@atom63/mdx/article'
import { Badge, Button } from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { mdxComponents } from '../components/mdx-components'
import { ProjectCard } from '../components/project-card'
import { findProject, projects } from '../content/projects'
import { NotFoundPage } from './not-found'

function Fact({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="grid content-start gap-1">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="text-foreground text-sm">{children}</dd>
    </div>
  )
}

/**
 * A case study: the header and facts from the frontmatter, the cover, then
 * the MDX body (problem, role, process, outcome) and more projects.
 */
export function ProjectPage() {
  const { slug } = useParams({ from: '/site/projects/$slug' })
  const project = findProject(slug)
  if (!project) {
    return <NotFoundPage />
  }
  const { Content } = project
  const others = projects.filter(other => other.slug !== project.slug).slice(0, 2)

  return (
    <Page>
      <Container maxWidth="narrow">
        <Section removeTopSpacing>
          <Button render={<Link to="/projects" />} size="sm" tone="muted" variant="ghost">
            <ArrowLeft aria-hidden />
            All projects
          </Button>
          <SectionHeader
            className="mt-6"
            description={project.summary}
            level={1}
            title={project.title}
            variant="display"
          />
          <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            <Fact label="Role">{project.role}</Fact>
            <Fact label="Timeline">{project.timeline}</Fact>
            <Fact label="Team">{project.team}</Fact>
            <Fact label="Tools">
              <span className="flex flex-wrap gap-1">
                {project.tools.map(tool => (
                  <Badge key={tool} size="sm" variant="secondary">
                    {tool}
                  </Badge>
                ))}
              </span>
            </Fact>
          </dl>
          <img
            alt={project.coverAlt}
            className="mt-10 aspect-video w-full rounded-3xl object-cover"
            src={project.cover}
          />
        </Section>

        <article>
          <ArticleMDXContentProvider components={mdxComponents}>
            <Content />
          </ArticleMDXContentProvider>
        </article>

        {others.length > 0 ? (
          <Section>
            <SectionHeader level={2} title="More projects" variant="secondary" />
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {others.map(other => (
                <li key={other.slug}>
                  <ProjectCard project={other} />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </Container>
    </Page>
  )
}
