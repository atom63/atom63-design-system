/**
 * Live good and bad examples for the craft rubric, keyed by criterion id.
 *
 * Every "bad" example is built from legal choices: tokens, contract values and
 * components used poorly. None needs a `craft-allow` exception, so the page
 * teaches what the checks cannot catch.
 */
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Input,
  Separator,
  Switch,
} from '@atom63/ui-react'
import { CircleAlert, CircleCheck, FileText } from 'lucide-react'
import { type ComponentType, Fragment, useId } from 'react'

type CraftExample = { caption: string; Example: ComponentType }

const frame = 'rounded-lg border border-border bg-card text-card-foreground'

const settings = [
  { label: 'Email digest', description: 'A summary of activity every Monday.' },
  { label: 'Mentions', description: 'When someone mentions you in a comment.' },
  { label: 'Product news', description: 'New features, at most once a month.' },
]

function SettingRow({
  className,
  descriptionClassName,
  description,
  label,
}: {
  className: string
  description: string
  descriptionClassName: string
  label: string
}) {
  const id = useId()
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium" id={id}>
          {label}
        </p>
        <p className={`text-xs text-muted-foreground ${descriptionClassName}`}>{description}</p>
      </div>
      <Switch aria-labelledby={id} defaultChecked={label === 'Mentions'} size="sm" />
    </div>
  )
}

function SpacingGood() {
  return (
    <div className={`${frame} p-4`}>
      <p className="mb-2 text-sm font-semibold">Notifications</p>
      {settings.map((setting, index) => (
        <Fragment key={setting.label}>
          {index > 0 ? <Separator /> : null}
          <SettingRow className="py-3" descriptionClassName="mt-1" {...setting} />
        </Fragment>
      ))}
    </div>
  )
}

function SpacingBad() {
  const rows = ['pt-1 pb-4', 'py-2', 'pt-5 pb-1']
  const gaps = ['mt-3', 'mt-0', 'mt-1.5']
  return (
    <div className={`${frame} px-3 py-5`}>
      <p className="mb-6 text-sm font-semibold">Notifications</p>
      {settings.map((setting, index) => (
        <SettingRow
          className={rows[index] ?? ''}
          descriptionClassName={gaps[index] ?? ''}
          key={setting.label}
          {...setting}
        />
      ))}
    </div>
  )
}

function HierarchyGood() {
  return (
    <div className={`${frame} p-4`}>
      <p className="text-base font-semibold">Publish changes</p>
      <p className="mt-1 text-sm text-muted-foreground">
        12 pages change. Readers see them right away.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button size="sm" variant="ghost">
          Cancel
        </Button>
        <Button size="sm" variant="primary">
          Publish
        </Button>
      </div>
    </div>
  )
}

function HierarchyBad() {
  return (
    <div className={`${frame} p-4`}>
      <p className="text-sm font-semibold">Publish changes</p>
      <p className="mt-1 text-sm font-semibold">12 pages change. Readers see them right away.</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="destructive">
          Cancel
        </Button>
        <Button size="sm" variant="primary">
          Preview
        </Button>
        <Button size="sm" variant="primary">
          Publish
        </Button>
      </div>
    </div>
  )
}

function AlignmentGood() {
  const id = useId()
  return (
    <div className={`${frame} p-4`}>
      <label className="text-sm font-medium" htmlFor={id}>
        Find a page
      </label>
      <div className="mt-2 flex items-center gap-2">
        <Input className="min-w-0 flex-1" id={id} placeholder="Title or path" size="sm" />
        <Button size="sm" variant="primary">
          Search
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Searches titles and paths.</p>
    </div>
  )
}

function AlignmentBad() {
  const id = useId()
  return (
    <div className={`${frame} p-4`}>
      <label className="block text-center text-sm font-medium" htmlFor={id}>
        Find a page
      </label>
      <div className="mt-2 flex items-end gap-2 ps-3">
        <Input className="min-w-0 flex-1" id={id} placeholder="Title or path" size="lg" />
        <Button size="xs" variant="primary">
          Search
        </Button>
      </div>
      <p className="mt-2 text-end text-xs text-muted-foreground">Searches titles and paths.</p>
    </div>
  )
}

function StatesGood() {
  return (
    <div className={frame}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No invoices yet</EmptyTitle>
          <EmptyDescription>Invoices appear here after your first paid order.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="primary">
            Create an invoice
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

function StatesBad() {
  return (
    <div className={`${frame} p-4`}>
      <p className="text-sm font-semibold">Invoices</p>
      <p className="mt-2 text-sm text-muted-foreground">No data</p>
    </div>
  )
}

function MotionGood() {
  return (
    <div className={`${frame} overflow-hidden`}>
      <Collapsible>
        <CollapsibleTrigger
          className="w-full justify-between rounded-none"
          render={<Button type="button" variant="ghost" />}
        >
          Advanced options
          <CollapsibleIndicator />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
            The panel opens with the system duration and easing, only when asked.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function MotionBad() {
  return (
    <div className={`${frame} flex items-center justify-between gap-3 p-4`}>
      <p className="text-sm font-medium">Advanced options</p>
      <Badge className="motion-safe:animate-bounce" size="sm" variant="primary">
        New
      </Badge>
    </div>
  )
}

const services = [
  { name: 'API', healthy: true },
  { name: 'Webhooks', healthy: false },
  { name: 'Search', healthy: true },
]

function AccessibilityGood() {
  return (
    <ul className={`${frame} divide-y divide-border`}>
      {services.map(service => (
        <li className="flex items-center justify-between gap-3 px-4 py-2.5" key={service.name}>
          <span className="text-sm font-medium">{service.name}</span>
          <Badge size="sm" variant={service.healthy ? 'success' : 'error'}>
            {service.healthy ? <CircleCheck aria-hidden /> : <CircleAlert aria-hidden />}
            {service.healthy ? 'Healthy' : 'Failing'}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

function AccessibilityBad() {
  return (
    <ul className={`${frame} divide-y divide-border`}>
      {services.map(service => (
        <li className="flex items-center justify-between gap-3 px-4 py-2.5" key={service.name}>
          <span className="text-sm font-medium">{service.name}</span>
          <span
            className={`size-2 rounded-full ${service.healthy ? 'bg-success' : 'bg-destructive'}`}
          />
        </li>
      ))}
    </ul>
  )
}

function TokensGood() {
  return (
    <div className={`${frame} p-4`}>
      <p className="text-xs text-muted-foreground">Monthly plan</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">$24</p>
      <Button className="mt-4 w-full" size="sm">
        Change plan
      </Button>
    </div>
  )
}

function TokensBad() {
  return (
    <div className="rounded-[5px] border border-border bg-card p-[13px] text-card-foreground">
      <p className="text-[11px] text-muted-foreground">Monthly plan</p>
      <p className="mt-[3px] text-[26px] font-semibold text-destructive tabular-nums">$24</p>
      <Button className="mt-[18px] h-[30px] w-full rounded-full bg-primary" size="sm">
        Change plan
      </Button>
    </div>
  )
}

export const craftExamples: Record<string, { bad: CraftExample; good: CraftExample }> = {
  'spacing-rhythm': {
    good: {
      caption: 'Three steps: `mt-1` inside a row, `py-3` per row, `mb-2` under the heading.',
      Example: SpacingGood,
    },
    bad: {
      caption:
        'Every row has its own padding and label gap, and the heading sits farther from its rows than the rows sit from each other.',
      Example: SpacingBad,
    },
  },
  hierarchy: {
    good: {
      caption: 'The title is one step larger; one primary action, the other ghost.',
      Example: HierarchyGood,
    },
    bad: {
      caption:
        'Title and body share size and weight; two primary actions, and Cancel styled as destructive.',
      Example: HierarchyBad,
    },
  },
  alignment: {
    good: {
      caption: 'One start edge; `Input` and `Button` both `size="sm"`, so they share a height.',
      Example: AlignmentGood,
    },
    bad: {
      caption:
        'Centered label, indented row, end-aligned hint, and an `lg` input beside an `xs` button.',
      Example: AlignmentBad,
    },
  },
  'state-completeness': {
    good: {
      caption: '`Empty` says why the list is empty and offers the next step.',
      Example: StatesGood,
    },
    bad: {
      caption: '"No data": no reason and no way forward.',
      Example: StatesBad,
    },
  },
  'motion-restraint': {
    good: {
      caption: '`Collapsible` moves once, when opened, with the system timing.',
      Example: MotionGood,
    },
    bad: {
      caption:
        'A bouncing badge loops forever to draw attention. `motion-safe:` spares reduced-motion users, not everyone else.',
      Example: MotionBad,
    },
  },
  accessibility: {
    good: {
      caption: 'Status is a word and an icon as well as a color.',
      Example: AccessibilityGood,
    },
    bad: {
      caption:
        'Status is a colored dot only: nothing for a screen reader, and nothing for color-blind readers. axe does not flag it.',
      Example: AccessibilityBad,
    },
  },
  'token-use': {
    good: {
      caption: 'Scale utilities, role colors and component defaults only.',
      Example: TokensGood,
    },
    bad: {
      caption:
        'No literal colors, yet one-off lengths (`p-[13px]`, `text-[26px]`), a destructive color used as emphasis, and a restyled `Button`.',
      Example: TokensBad,
    },
  },
}
