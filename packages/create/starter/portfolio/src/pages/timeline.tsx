import { Timeline } from '@atom63/mdx/blocks'
import { Badge, SegmentedControl } from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { timeline, type TimelineKind, timelineKindLabels } from '../content/timeline'

type Filter = 'all' | TimelineKind

const filters: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Projects', value: 'project' },
  { label: 'Writing', value: 'writing' },
  { label: 'Roles', value: 'role' },
]

const month = (date: string) =>
  new Date(`${date.slice(0, 7)}-01T00:00:00`).toLocaleDateString('en', { month: 'short' })

/** Projects, writing, roles and milestones on one line, grouped by year. */
export function TimelinePage() {
  const [filter, setFilter] = useState<Filter>('all')
  const entries = timeline.filter(entry => filter === 'all' || entry.kind === filter)
  const years = [...new Set(entries.map(entry => entry.date.slice(0, 4)))]

  return (
    <Page>
      <Container maxWidth="narrow">
        <Section removeTopSpacing>
          <SectionHeader
            description="Everything in order: work, writing and the road here."
            level={1}
            title="Timeline"
          />
          <div className="mt-8 max-w-full overflow-x-auto">
            <SegmentedControl
              aria-label="Show"
              items={filters}
              onValueChange={value => setFilter(value as Filter)}
              size="sm"
              value={filter}
            />
          </div>
          <div className="mt-10 grid gap-12">
            {years.map(year => (
              <section aria-labelledby={`year-${year}`} key={year}>
                <h2
                  className="font-heading text-foreground mb-4 text-2xl font-semibold"
                  id={`year-${year}`}
                >
                  {year}
                </h2>
                <Timeline>
                  {entries
                    .filter(entry => entry.date.startsWith(year))
                    .map(entry => (
                      <Timeline.Item
                        date={month(entry.date)}
                        key={`${entry.kind}-${entry.date}-${entry.title}`}
                        title={
                          entry.href ? (
                            <Link className="hover:underline" to={entry.href}>
                              {entry.title}
                            </Link>
                          ) : (
                            entry.title
                          )
                        }
                      >
                        <span className="grid gap-2">
                          <span>{entry.description}</span>
                          <span>
                            <Badge size="sm" variant="outline">
                              {timelineKindLabels[entry.kind]}
                            </Badge>
                          </span>
                        </span>
                      </Timeline.Item>
                    ))}
                </Timeline>
              </section>
            ))}
          </div>
        </Section>
      </Container>
    </Page>
  )
}
