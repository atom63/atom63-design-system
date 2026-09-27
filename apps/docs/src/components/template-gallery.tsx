import { templateCatalog, type TemplateEntry } from '@atom63/templates'
import { Badge, Card } from '@atom63/ui-react'
import { ArrowUpRight } from 'lucide-react'

const STORYBOOK = 'https://storybook.system.atom63.io/?path=/story/'

function TemplateCard({ entry }: { entry: TemplateEntry }) {
  return (
    <li>
      <Card className="flex h-full flex-col gap-3" padding="md">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 text-base font-medium text-foreground">{entry.title}</h3>
          <Badge size="sm" variant={entry.readiness === 'ready' ? 'success' : 'muted'}>
            {entry.readiness === 'ready' ? 'Ready' : 'Draft'}
          </Badge>
        </div>
        <p className="m-0 flex-1 text-sm text-muted-foreground">{entry.description}</p>
        <a
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
          href={`${STORYBOOK}${entry.storyId}`}
        >
          Open {entry.title} in Storybook
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
      </Card>
    </li>
  )
}

/* The template catalog from @atom63/templates, pages first. */
export function TemplateGallery({ kind }: { kind: TemplateEntry['kind'] }) {
  const entries = templateCatalog.filter(entry => entry.kind === kind)
  return (
    <ul className="not-prose my-6 grid list-none gap-4 p-0 sm:grid-cols-2" data-mdx-width="wide">
      {entries.map(entry => (
        <TemplateCard entry={entry} key={entry.id} />
      ))}
    </ul>
  )
}
