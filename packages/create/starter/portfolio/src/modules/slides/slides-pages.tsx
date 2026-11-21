import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardLabel,
  CardTitle,
  cardLinkClassName,
  Progress,
} from '@atom63/ui-react'
import { Container, Page, Section, SectionHeader } from '@atom63/ui-react/layout'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatDate } from '../../content/writing'
import { NotFoundPage } from '../../pages/not-found'
import { decks, findDeck } from './decks'

export function SlidesIndexPage() {
  return (
    <Page>
      <Container maxWidth="default">
        <Section removeTopSpacing>
          <SectionHeader description="Talks and the decks behind them." level={1} title="Slides" />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {decks.map(deck => (
              <li key={deck.slug}>
                <Link className={cardLinkClassName} params={{ slug: deck.slug }} to="/slides/$slug">
                  <Card className="h-full" variant="interactive">
                    <CardContent>
                      <CardLabel className="text-muted-foreground">
                        {formatDate(deck.date)} · {deck.venue}
                      </CardLabel>
                      <CardTitle>{deck.title}</CardTitle>
                      <CardDescription>{deck.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </Container>
    </Page>
  )
}

/** One deck, a slide at a time. The arrow keys move between slides. */
export function SlideDeckPage() {
  const { slug } = useParams({ from: '/site/slides/$slug' })
  const deck = findDeck(slug)
  const [index, setIndex] = useState(0)
  const count = deck?.slides.length ?? 0

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea')) return
      if (event.key === 'ArrowRight') setIndex(current => Math.min(current + 1, count - 1))
      if (event.key === 'ArrowLeft') setIndex(current => Math.max(current - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count])

  if (!deck) return <NotFoundPage />
  const slide = deck.slides[index]

  return (
    <Page>
      <Container maxWidth="default">
        <Section removeTopSpacing>
          <Button render={<Link to="/slides" />} size="sm" tone="muted" variant="ghost">
            <ArrowLeft aria-hidden />
            All slides
          </Button>
          <SectionHeader className="mt-4" level={1} title={deck.title} variant="secondary" />
          <Card className="mt-6" variant="filled">
            <section
              aria-label={`Slide ${index + 1} of ${count}`}
              aria-live="polite"
              className="flex aspect-video flex-col justify-center gap-6 p-8 md:p-16"
            >
              <h2 className="font-heading text-foreground text-2xl font-semibold text-balance md:text-5xl">
                {slide.title}
              </h2>
              <ul className="text-muted-foreground grid gap-2 text-base md:text-2xl">
                {slide.points.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          </Card>
          <div className="mt-4 flex items-center gap-3">
            <Button
              aria-label="Previous slide"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
              size="icon-sm"
              variant="outline"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              aria-label="Next slide"
              disabled={index === count - 1}
              onClick={() => setIndex(index + 1)}
              size="icon-sm"
              variant="outline"
            >
              <ChevronRight aria-hidden />
            </Button>
            <Progress
              aria-label="Slide progress"
              className="flex-1"
              max={count}
              tone="neutral"
              value={index + 1}
            />
            <span className="text-muted-foreground text-sm tabular-nums">
              {index + 1} / {count}
            </span>
          </div>
        </Section>
      </Container>
    </Page>
  )
}
