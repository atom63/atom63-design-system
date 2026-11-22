import { Badge, Button, Separator } from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import { Printer } from 'lucide-react'

import { formatMonth, resume } from '../content/resume'
import { portfolio } from '../portfolio.config'

/** The resume from src/content/resume.ts. Print it, or save it as a PDF, from the browser. */
export function ResumePage() {
  const { email, links, location, name, role } = portfolio.person

  return (
    <Page>
      <Container maxWidth="narrow">
        <Section removeTopSpacing>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionHeader description={`${role} · ${location}`} level={1} title={name} />
            <Button className="print:hidden" onClick={() => window.print()} variant="outline">
              <Printer aria-hidden />
              Print or save as PDF
            </Button>
          </div>
          <ul className="text-muted-foreground mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <li>
              <a className="hover:text-foreground underline" href={`mailto:${email}`}>
                {email}
              </a>
            </li>
            {links.map(link => (
              <li key={link.href}>
                <a className="hover:text-foreground underline" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-foreground mt-8 max-w-2xl text-base leading-7">{resume.summary}</p>
        </Section>

        <Separator />

        <Section>
          <SectionHeader level={2} title="Experience" variant="secondary" />
          <ol className="mt-6 grid gap-8">
            {resume.experience.map(item => (
              <li className="grid gap-2" key={`${item.company}-${item.start}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-foreground text-base font-semibold">
                    {item.title}, {item.company}
                  </h3>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {formatMonth(item.start)} – {formatMonth(item.end)}
                  </span>
                </div>
                <ul className="text-muted-foreground grid list-disc gap-1 ps-5 text-sm leading-6">
                  {item.highlights.map(highlight => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Section>

        <Separator />

        <Section>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <SectionHeader level={2} title="Education" variant="secondary" />
              <ul className="mt-6 grid gap-4">
                {resume.education.map(item => (
                  <li className="grid gap-1" key={item.school}>
                    <span className="text-foreground font-medium">{item.degree}</span>
                    <span className="text-muted-foreground text-sm">
                      {item.school}, {item.start}–{item.end}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeader level={2} title="Skills" variant="secondary" />
              <ul className="mt-6 flex flex-wrap gap-2">
                {resume.skills.map(skill => (
                  <li key={skill}>
                    <Badge variant="secondary">{skill}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </Container>
    </Page>
  )
}
