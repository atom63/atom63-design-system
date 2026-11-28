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

  /*
   * One column: the header, the facts, the MDX body (prose and blocks alike)
   * and more projects share the reading column's left edge. Only the cover
   * breaks out, as a wide band.
   */
  return (
    <Page>
      <Container maxWidth="narrower">
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
          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
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
        </Section>
      </Container>

      <Container maxWidth="wide">
        <img
          alt={project.coverAlt}
          className="aspect-video w-full rounded-3xl object-cover"
          src={project.cover}
        />
      </Container>

      <Container maxWidth="narrower">
        <article className="mt-12">
          {/* `article` keeps blocks in the text column instead of breaking out wide. */}
          <ArticleMDXContentProvider components={mdxComponents} variant="article">
            <Content />
          </ArticleMDXContentProvider>
        </article>

        {others.length > 0 ? (
          <Section>
            <SectionHeader level={2} title="More projects" variant="secondary" />
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
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
