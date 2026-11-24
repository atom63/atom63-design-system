import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'

import { ProjectCard } from '../components/project-card'
import { projects } from '../content/projects'

export function ProjectsIndexPage() {
  return (
    <Page>
      <Container maxWidth="wide">
        <Section removeTopSpacing>
          <SectionHeader
            description="Case studies: the problem, my role, the process and what changed."
            level={1}
            title="Projects"
          />
          {projects.length === 0 ? (
            <Empty className="mt-8">
              <EmptyHeader>
                <EmptyTitle>No projects yet</EmptyTitle>
                <EmptyDescription>
                  Add an .mdx file to src/content/projects to publish one.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map(project => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </Container>
    </Page>
  )
}
