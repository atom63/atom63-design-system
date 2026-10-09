import type { TokenTable } from '@atom63/figma'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemTitle,
  Skeleton,
} from '@atom63/ui-react'
import { useEffect, useId, useState } from 'react'

import { Button, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import type { DesignSystemTable } from '../messages'
import styles from './app.module.css'
import { plural } from './format'
import { type FileStatus, fileStatus, type HomeEntry } from './home-state'
import { atom63Unavailable } from './table-summary'

const ATOM63_LINE = 'Variables, text and effect styles, and the components with their spec cards.'

/** One way in: a title, one line of what it does, and its action. */
function Entry({
  action,
  description,
  disabledReason,
  onAction,
  primary = false,
  title,
}: {
  action: string
  description: string
  /** Why the action is unavailable; disables it and describes it. */
  disabledReason?: string | null
  onAction: () => void
  /** The recommended next step: the primary button. */
  primary?: boolean
  title: string
}) {
  const reasonId = useId()
  return (
    <Item className={styles.entry} variant="outline">
      <ItemContent>
        <ItemTitle aria-level={2} role="heading">
          {title}
        </ItemTitle>
        <ItemDescription>{description}</ItemDescription>
        {disabledReason && (
          <p className={styles.reason} id={reasonId}>
            {disabledReason}
          </p>
        )}
      </ItemContent>
      <ItemFooter className={styles.entryFooter}>
        <Button
          aria-describedby={disabledReason ? reasonId : undefined}
          disabled={!!disabledReason}
          onClick={onAction}
          size="sm"
          variant={primary ? 'primary' : 'outline'}
        >
          {action}
        </Button>
      </ItemFooter>
    </Item>
  )
}

const ENTRIES: Record<HomeEntry, { title: string; description: string; action: string }> = {
  create: {
    title: 'Create a token system',
    description: 'Start from a brand color, a neutral, a radius and a type scale.',
    action: 'Create',
  },
  import: {
    title: 'Import from CSS',
    description: 'Read the token CSS of a project started from the site template.',
    action: 'Import',
  },
  atom63: { title: 'Atom63 design system', description: ATOM63_LINE, action: 'Open' },
}

/** An entry card's shape while the file is read; hidden from assistive technology. */
function EntrySkeleton() {
  return (
    <Item className={styles.entry} variant="outline">
      <ItemContent>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonLine} />
      </ItemContent>
      <ItemFooter className={styles.entryFooter}>
        <Skeleton className={styles.skeletonAction} />
      </ItemFooter>
    </Item>
  )
}

const TITLES: Record<FileStatus['kind'], string> = {
  empty: 'Start a token table',
  template: 'Token table',
  atom63: 'Atom63 design system',
  other: 'Another token set',
}

/**
 * What the file holds and what to do next (R2): a status line, then the entry
 * cards that apply, the recommended one with the primary button. A file with
 * a table also lists its collections. While the file is read, the cards'
 * skeletons hold their place (the app says "Reading this file…").
 */
export function Home({
  onAtom63,
  onBusy,
  onCreate,
  onImport,
}: {
  /** Opens the Atom63 view with the table this view already scanned, if any. */
  onAtom63: (table: DesignSystemTable | null) => void
  /** Whether Home is reading the file: the main region's aria-busy and the status the app announces. */
  onBusy?: (busy: boolean) => void
  onCreate: () => void
  onImport: () => void
}) {
  const postMessage = usePostMessage()
  const [table, setTable] = useState<TokenTable | null>(null)
  // undefined while the Atom63 scan runs; null when it could not run.
  const [atom63, setAtom63] = useState<DesignSystemTable | null | undefined>(undefined)
  const scanning = !table || atom63 === undefined

  useEffect(() => {
    postMessage({ type: 'scan' })
    postMessage({ type: 'atom63-scan' })
  }, [postMessage])
  useEffect(() => {
    onBusy?.(scanning)
    return () => onBusy?.(false)
  }, [onBusy, scanning])
  useFigmaMessage(message => {
    if (message.type === 'table') setTable(message.data)
    if (message.type === 'atom63-table') setAtom63(message.data)
    if (message.type === 'error' && (!message.data.for || message.data.for === 'atom63-scan'))
      setAtom63(current => current ?? null)
  })

  if (scanning)
    return (
      <div className={styles.view}>
        <h1 className={styles.srOnly}>Home</h1>
        <div aria-hidden className={styles.skeletons}>
          <div className={styles.skeletonHeader}>
            <Skeleton className={styles.skeletonHeading} />
            <Skeleton className={styles.skeletonLine} />
          </div>
          <ItemGroup className={styles.entries}>
            <EntrySkeleton />
            <EntrySkeleton />
            <EntrySkeleton />
          </ItemGroup>
        </div>
      </div>
    )

  const status = fileStatus(table, atom63)
  const actions: Record<HomeEntry, () => void> = {
    create: onCreate,
    import: onImport,
    atom63: () => onAtom63(atom63),
  }
  const entry = (kind: HomeEntry) => {
    const { title, description, action } = ENTRIES[kind]
    if (kind === 'import' && status.kind === 'template')
      return (
        <Entry
          action="Import again"
          description="Read the project's token CSS again and apply what changed."
          key={kind}
          onAction={actions[kind]}
          primary={status.recommended === kind}
          title={title}
        />
      )
    if (kind === 'atom63' && status.kind === 'atom63')
      return (
        <Entry
          action="Update"
          description={description}
          key={kind}
          onAction={actions[kind]}
          primary={status.recommended === kind}
          title="Update Atom63 design system"
        />
      )
    return (
      <Entry
        action={action}
        description={description}
        disabledReason={kind === 'atom63' ? atom63Unavailable(atom63) : null}
        key={kind}
        onAction={actions[kind]}
        primary={status.recommended === kind}
        title={title}
      />
    )
  }

  return (
    <div className={styles.view}>
      <SectionHeader description={status.line} level={1} title={TITLES[status.kind]} />
      {(status.kind === 'template' || status.kind === 'other') && (
        <ul aria-label="Collections" className={styles.list}>
          {table.collections.map(collection => (
            <li key={collection.name}>
              <span>{collection.name}</span>
              <span>
                {plural(collection.variables, 'variable')}, {plural(collection.modes, 'mode')}
              </span>
            </li>
          ))}
        </ul>
      )}
      {status.kind === 'template' && (
        <p className={styles.meta}>
          Code is the source of these tokens. After the token CSS changes, ask your coding agent to
          sync this file (<span className={styles.code}>atom63-figma sync</span>), or import the CSS
          again here.
        </p>
      )}
      <ItemGroup className={styles.entries}>{status.entries.map(entry)}</ItemGroup>
    </div>
  )
}
