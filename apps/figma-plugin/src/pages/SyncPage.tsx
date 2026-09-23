import { useState } from 'react'

import { Alert, Button, ScrollArea, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import type { SyncModelSummary, SyncPlanSummary, SyncApplyResultMessage } from '../types/messages'
import styles from './SyncPage.module.css'

type Status = 'idle' | 'previewing' | 'applying'

function PlanTable({ plan }: { plan: SyncPlanSummary }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Collection</th>
          <th>New modes</th>
          <th>Create</th>
          <th>Update</th>
          <th>Unchanged</th>
          <th>Orphaned</th>
        </tr>
      </thead>
      <tbody>
        {plan.collections.map(collection => (
          <tr key={collection.name}>
            <td>
              {collection.name}
              {!collection.exists && <span className={styles.new}> new</span>}
            </td>
            <td>{collection.addModes.join(', ') || '–'}</td>
            <td>{collection.create}</td>
            <td>{collection.update}</td>
            <td>{collection.unchanged}</td>
            <td title={collection.orphaned.join('\n')}>{collection.orphaned.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function SyncPage() {
  const postMessage = usePostMessage()
  const [status, setStatus] = useState<Status>('idle')
  const [model, setModel] = useState<SyncModelSummary | null>(null)
  const [plan, setPlan] = useState<SyncPlanSummary | null>(null)
  const [applied, setApplied] = useState<SyncApplyResultMessage['data'] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useFigmaMessage(message => {
    if (message.type === 'sync-preview-result') {
      setModel(message.data.model)
      setPlan(message.data.plan)
      setApplied(null)
      setStatus('idle')
    } else if (message.type === 'sync-apply-result') {
      setApplied(message.data)
      setPlan(message.data.verification)
      setStatus('idle')
    } else if (message.type === 'sync-error') {
      setError(message.data.message)
      setStatus('idle')
    }
  })

  const preview = () => {
    setError(null)
    setStatus('previewing')
    postMessage({ type: 'sync-preview' })
  }

  const apply = () => {
    setError(null)
    setStatus('applying')
    postMessage({ type: 'sync-apply' })
  }

  const pending = plan ? plan.totals.create + plan.totals.update : 0
  const verified =
    applied && applied.verification.totals.create + applied.verification.totals.update === 0

  return (
    <ScrollArea>
      <div className={styles.page}>
        <SectionHeader
          description="Write the Atom63 design tokens into this file as Figma variables. Each personalization axis becomes a collection with its values as modes. Running it again changes nothing unless the tokens changed."
          title="Sync from code"
        />

        {model && (
          <p className={styles.meta}>
            Bundled model: {model.variables} variables in {model.collections} collections,{' '}
            {model.aliasValues} alias values, {model.skipped} tokens not representable as Figma
            variables.
          </p>
        )}

        <div className={styles.actions}>
          <Button loading={status === 'previewing'} onClick={preview} variant="secondary">
            Preview changes
          </Button>
          <Button
            disabled={!plan || pending === 0}
            loading={status === 'applying'}
            onClick={apply}
            variant="primary"
          >
            {plan ? `Apply ${pending} changes` : 'Apply'}
          </Button>
        </div>

        {error && (
          <Alert title="Sync failed" variant="error">
            {error}
          </Alert>
        )}

        {applied && (
          <Alert
            title={verified ? 'In sync' : 'Sync incomplete'}
            variant={verified ? 'success' : 'warning'}
          >
            Created {applied.applied.createdCollections} collections, {applied.applied.addedModes}{' '}
            modes, {applied.applied.created} variables; updated {applied.applied.updated}.{' '}
            {verified
              ? 'A fresh preview finds nothing left to change.'
              : `A fresh preview still finds ${applied.verification.totals.create + applied.verification.totals.update} changes.`}
          </Alert>
        )}

        {plan && plan.totals.typeConflicts > 0 && (
          <Alert title="Type conflicts" variant="warning">
            {plan.totals.typeConflicts} variables exist with a different type and are left
            untouched. Delete them to let the sync recreate them.
          </Alert>
        )}

        {plan && plan.totals.orphaned > 0 && (
          <Alert title="Orphaned variables" variant="info">
            {plan.totals.orphaned} Atom63 variables are no longer in the model. They are kept; hover
            the count to see them.
          </Alert>
        )}

        {plan && <PlanTable plan={plan} />}
      </div>
    </ScrollArea>
  )
}
