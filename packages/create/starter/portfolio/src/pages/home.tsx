import { Button } from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { lazy, Suspense } from 'react'

import { ProjectCard } from '../components/project-card'
import { featuredProjects } from '../content/projects'
import { resume } from '../content/resume'
import { formatDate, posts } from '../content/writing'
import { useAssistant } from '../modules/assistant/assistant'
import { isOn, portfolio } from '../portfolio.config'

const WidgetBoard = lazy(() =>
  import('../modules/widgets/widget-board').then(module => ({ default: module.WidgetBoard }))
)

export function HomePage() {
  const assistant = useAssistant()
  const { headline, intro, location, role } = portfolio.person

  return (
    <Page>
      <Container maxWidth="wide">
        {/* The plate: the art that sets the tone. Swap it in portfolio.config.ts. */}
        <Section removeTopSpacing>
          <img
            alt={portfolio.hero.plateAlt}
            className="aspect-[4/3] w-full rounded-3xl object-cover md:aspect-[21/9]"
            src={portfolio.hero.plate}
          />
          <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-end">
            <SectionHeader description={intro} level={1} title={headline} variant="display" />
            <div className="grid gap-4">
              <p className="text-muted-foreground text-sm">
                {role}
                <br />
                {location}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button render={<Link to="/projects" />}>
                  See the work
                  <ArrowRight aria-hidden />
                </Button>
                {isOn('assistant') && assistant ? (
                  <Button onClick={assistant.open} variant="outline">
                    <Sparkles aria-hidden />
                    Ask about me
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader level={2} title="Selected work" variant="secondary" />
            <Button render={<Link to="/projects" />} size="sm" tone="muted" variant="ghost">
              All projects
              <ArrowRight aria-hidden />
            </Button>
          </div>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {featuredProjects.map(project => (
              <li key={project.slug}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        </Section>

        {isOn('widgetBoard') ? (
          <Section>
            <Suspense fallback={null}>
              <WidgetBoard />
            </Suspense>
          </Section>
        ) : null}

        <Section>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeader level={2} title="Writing" variant="secondary" />
                <Button render={<Link to="/writing" />} size="sm" tone="muted" variant="ghost">
                  All writing
                  <ArrowRight aria-hidden />
                </Button>
              </div>
              <ul className="mt-6 grid gap-6">
                {posts.slice(0, 3).map(post => (
                  <li key={post.slug}>
                    <Link
                      className="group grid gap-1 rounded-md"
                      params={{ slug: post.slug }}
                      to="/writing/$slug"
                    >
                      <span className="text-muted-foreground text-xs">{formatDate(post.date)}</span>
                      <span className="text-foreground font-semibold group-hover:underline">
                        {post.title}
                      </span>
                      <span className="text-muted-foreground line-clamp-2 text-sm">
                        {post.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeader level={2} title="Experience" variant="secondary" />
                <Button render={<Link to="/resume" />} size="sm" tone="muted" variant="ghost">
                  Resume
                  <ArrowRight aria-hidden />
                </Button>
              </div>
              <ol className="mt-6 grid gap-5">
                {resume.experience.map(item => (
                  <li
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4"
                    key={`${item.company}-${item.start}`}
                  >
                    <span className="text-foreground font-medium">{item.company}</span>
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {item.start.slice(0, 4)}–{item.end ? item.end.slice(0, 4) : 'Now'}
                    </span>
                    <span className="text-muted-foreground text-sm">{item.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Section>
      </Container>
    </Page>
  )
}
