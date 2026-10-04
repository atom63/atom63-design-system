import type { CssFile } from '@atom63/figma'
import { useMemo, useRef, useState } from 'react'

import { Alert, Button, SectionHeader, Textarea } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import { createBrowserColorResolver } from '../utils/css-color'
import styles from './app.module.css'
import { type ImportEvent, type ImportResults, nextResults } from './import-state'
import { Outcome } from './Outcome'
import { orderCssFiles, type ReadProject, readProject } from './read-css'

/** Import a project's token CSS: pick or paste it, preview the plan, apply it. */
export function Import({ onDone }: { onDone: () => void }) {
  const postMessage = usePostMessage()
  const fileInput = useRef<HTMLInputElement>(null)
  const resolveColor = useMemo(() => createBrowserColorResolver(), [])
  const [files, setFiles] = useState<CssFile[]>([])
  const [pasted, setPasted] = useState('')
  const [busy, setBusy] = useState<'plan' | 'apply' | null>(null)
  const [results, setResults] = useState<ImportResults>({})
  const update = (event: ImportEvent) => setResults(current => nextResults(current, event))
  const [error, setError] = useState<string | null>(null)

  const project = useMemo((): ReadProject | { error: string } | null => {
    const sources = pasted.trim() ? [...files, { name: 'pasted.css', text: pasted }] : files
    if (sources.length === 0) return null
    try {
      return readProject(orderCssFiles(sources), resolveColor)
    } catch (readError) {
      return { error: readError instanceof Error ? readError.message : String(readError) }
    }
  }, [files, pasted, resolveColor])

  useFigmaMessage(message => {
    if (message.type === 'planned') update({ type: 'planned', data: message.data })
    if (message.type === 'applied') update({ type: 'applied', data: message.data })
    if (message.type === 'error') setError(message.data.message)
    if (['planned', 'applied', 'error'].includes(message.type)) setBusy(null)
  })

  const pick = async (list: FileList | null) => {
    if (!list) return
    setFiles(
      await Promise.all(
        Array.from(list).map(async file => ({ name: file.name, text: await file.text() }))
      )
    )
    update({ type: 'source-changed' })
  }
  const send = (type: 'plan' | 'apply') => {
    if (!project || 'error' in project) return
    setError(null)
    setBusy(type)
    if (type === 'plan') update({ type: 'plan-sent' })
    postMessage({ type, model: project.model })
  }
  const { planned, applied } = results
  const pending = planned
    ? planned.planned.create +
      planned.planned.update +
      (planned.styles?.create.length ?? 0) +
      (planned.styles?.update.length ?? 0)
    : 0

  return (
    <div className={styles.view}>
      <SectionHeader
        description="Pick the CSS files that hold your design tokens (src/styles/tokens in the site template), or paste them. Each data-* attribute becomes a collection with its values as modes; light and dark become the Mode collection."
        title="Import from CSS"
      />
      <input
        accept=".css,text/css"
        className={styles.files}
        multiple
        onChange={event => void pick(event.target.files)}
        ref={fileInput}
        type="file"
      />
      <div className={styles.actions}>
        <Button onClick={() => fileInput.current?.click()} variant="secondary">
          {files.length > 0 ? `${files.length} files chosen` : 'Choose CSS files'}
        </Button>
      </div>
      <Textarea
        aria-label="Token CSS"
        onChange={event => {
          setPasted(event.target.value)
          update({ type: 'source-changed' })
        }}
        placeholder="Or paste token CSS here"
        rows={4}
        value={pasted}
      />
      {project && 'error' in project && (
        <Alert title="The CSS could not be read" variant="error">
          {project.error}
        </Alert>
      )}
      {project && !('error' in project) && (
        <p className={styles.meta}>
          {project.model.summary.variables} variables in {project.model.summary.collections}{' '}
          collections, {project.model.styles?.text.length ?? 0} text styles and{' '}
          {project.model.styles?.effects.length ?? 0} effect styles.
          {project.skipped.length > 0 &&
            ` ${project.skipped.length} tokens are not Figma variables (shadows, font stacks and colors computed from others).`}{' '}
          {project.notes.join(' ')}
        </p>
      )}
      <div className={styles.actions}>
        <Button
          disabled={!project || 'error' in project}
          loading={busy === 'plan'}
          onClick={() => send('plan')}
          variant="secondary"
        >
          Preview changes
        </Button>
        {pending > 0 && (
          <Button loading={busy === 'apply'} onClick={() => send('apply')} variant="primary">
            {`Apply ${pending} ${pending === 1 ? 'change' : 'changes'}`}
          </Button>
        )}
        <Button onClick={onDone} variant="ghost">
          Back
        </Button>
      </div>
      {error && (
        <Alert title="Import failed" variant="error">
          {error}
        </Alert>
      )}
      <Outcome applied={applied} planned={planned} />
    </div>
  )
}
