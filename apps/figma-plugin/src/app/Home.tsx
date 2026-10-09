import type { TokenTable } from '@atom63/figma'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemTitle,
} from '@atom63/ui-react'
import { useEffect, useId, useState } from 'react'

import { Button, LoadingState, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import type { DesignSystemTable } from '../messages'
import styles from './app.module.css'
import { plural } from './format'
import { atom63Unavailable, summarizeTable } from './table-summary'

const ATOM63_LINE = 'Variables, text and effect styles, and the components with their spec cards.'

/** One way in: a title, one line of what it does, and its action. */
function Entry({
  action,
  description,
  disabledReason,
  onAction,
  title,
}: {
  action: string
  description: string
  /** Why the action is unavailable; disables it and describes it. */
  disabledReason?: string | null
  onAction: () => void
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
          variant="outline"
        >
          {action}
        </Button>
      </ItemFooter>
    </Item>
  )
}

/**
 * What the file holds: three ways in for an empty file, a summary for a file
 * with a table, and an update when that table is Atom63's. Each way in is an
 * entry card with its title, one line and its action.
 */
export function Home({
  onAtom63,
  onCreate,
  onImport,
}: {
  /** Opens the Atom63 view with the table this view already scanned, if any. */
  onAtom63: (table: DesignSystemTable | null) => void
  onCreate: () => void
  onImport: () => void
}) {
  const postMessage = usePostMessage()
  const [table, setTable] = useState<TokenTable | null>(null)
  // undefined while the Atom63 scan runs; null when it could not run.
  const [atom63, setAtom63] = useState<DesignSystemTable | null | undefined>(undefined)

  useEffect(() => {
    postMessage({ type: 'scan' })
    postMessage({ type: 'atom63-scan' })
  }, [postMessage])
  useFigmaMessage(message => {
    if (message.type === 'table') setTable(message.data)
    if (message.type === 'atom63-table') setAtom63(message.data)
    if (message.type === 'error' && (!message.data.for || message.data.for === 'atom63-scan'))
      setAtom63(current => current ?? null)
  })

  if (!table || atom63 === undefined) return <LoadingState />
  const summary = summarizeTable(table)
  const isAtom63 = !!atom63?.atom63 && !atom63.template
  const atom63Entry = (
    <Entry
      action="Open"
      description={ATOM63_LINE}
      disabledReason={atom63Unavailable(atom63)}
      onAction={() => onAtom63(atom63)}
      title="Atom63 design system"
    />
  )

  if (summary.empty)
    return (
      <div className={styles.view}>
        <SectionHeader
          description="Give this file a token table: create one from a few choices, import your project's token CSS, or build the Atom63 design system."
          level={1}
          title="Start a token table"
        />
        <ItemGroup className={styles.entries}>
          <Entry
            action="Create"
            description="Start from a brand color, a neutral, a radius and a type scale."
            onAction={onCreate}
            title="Create a token system"
          />
          <Entry
            action="Import"
            description="Read the token CSS of a project started from the site template."
            onAction={onImport}
            title="Import from CSS"
          />
          {atom63Entry}
        </ItemGroup>
      </div>
    )

  if (isAtom63)
    return (
      <div className={styles.view}>
        <SectionHeader
          description={`This file holds the Atom63 design system: ${summary.line}`}
          level={1}
          title="Atom63 design system"
        />
        <ItemGroup className={styles.entries}>
          <Entry
            action="Update"
            description={ATOM63_LINE}
            onAction={() => onAtom63(atom63)}
            title="Update Atom63 design system"
          />
        </ItemGroup>
      </div>
    )

  return (
    <div className={styles.view}>
      <SectionHeader description={summary.line} level={1} title="Token table" />
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
      <p className={styles.meta}>
        Code is the source of these tokens. After the token CSS changes, ask your coding agent to
        sync this file (<span className={styles.code}>atom63-figma sync</span>), or import the CSS
        again here.
      </p>
      <ItemGroup className={styles.entries}>
        <Entry
          action="Import again"
          description="Read the project's token CSS again and apply what changed."
          onAction={onImport}
          title="Import from CSS"
        />
        {atom63Entry}
      </ItemGroup>
    </div>
  )
}
