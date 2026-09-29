import { useMemo, useRef, useState } from 'react'

import { Alert, Button, CopyButton, SectionHeader, Textarea } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import { buildProjectModel, type CssFile, type ProjectModel } from '@atom63/figma'
import type { SyncApplyResultMessage, SyncPlanSummary } from '../types/messages'
import { createBrowserColorResolver } from '../utils/css-color'
import { SyncResults } from './SyncPage'
import styles from './SyncPage.module.css'

type Status = 'idle' | 'previewing' | 'applying' | 'listing'

/**
 * Project mode: the tokens of a site started from the Atom63 site template (or
 * any project whose tokens are CSS custom properties) become Figma variables.
 * The CSS is read here, in the UI, where the browser can compute colors; the
 * main thread plans and applies the resulting model like Atom63's.
 */
/** Skipped tokens grouped by reason, so seven shadows read as one line. */
function groupByReason(skipped: ProjectModel['model']['skipped']): [string, string[]][] {
  const groups = new Map<string, string[]>()
  for (const item of skipped)
    groups.set(item.reason, [...(groups.get(item.reason) ?? []), item.token])
  return [...groups]
}

export function ProjectSync() {
  const postMessage = usePostMessage()
  const fileInput = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<CssFile[]>([])
  const [pasted, setPasted] = useState('')
  const [project, setProject] = useState<ProjectModel | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [plan, setPlan] = useState<SyncPlanSummary | null>(null)
  const [applied, setApplied] = useState<SyncApplyResultMessage['data'] | null>(null)
  const [changes, setChanges] = useState<{ count: number; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resolveColor = useMemo(() => createBrowserColorResolver(), [])

  useFigmaMessage(message => {
    if (message.type === 'sync-preview-result') {
      setPlan(message.data.plan)
      setApplied(null)
      setStatus('idle')
    } else if (message.type === 'sync-apply-result') {
      setApplied(message.data)
      setPlan(message.data.verification)
      setStatus('idle')
    } else if (message.type === 'sync-changes-result') {
      setChanges(message.data)
      setStatus('idle')
    } else if (message.type === 'sync-error') {
      setError(message.data.message)
      setStatus('idle')
    }
  })

  const sources = (): CssFile[] =>
    pasted.trim() ? [...files, { name: 'pasted.css', text: pasted }] : files

  const read = (next: CssFile[]) => {
    setError(null)
    setPlan(null)
    setApplied(null)
    setChanges(null)
    if (next.length === 0) {
      setProject(null)
      return
    }
    try {
      setProject(buildProjectModel(next, resolveColor))
    } catch (readError) {
      setProject(null)
      setError(readError instanceof Error ? readError.message : String(readError))
    }
  }

  // Read pasted CSS shortly after it changes, so Preview is ready without leaving the field.
  const pasteTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const paste = (text: string) => {
    setPasted(text)
    clearTimeout(pasteTimer.current)
    pasteTimer.current = setTimeout(
      () => read(text.trim() ? [...files, { name: 'pasted.css', text }] : files),
      300
    )
  }

  const pickFiles = async (list: FileList | null) => {
    if (!list) return
    const picked = await Promise.all(
      Array.from(list).map(async file => ({ name: file.name, text: await file.text() }))
    )
    // Later declarations win, so read the files in the order index.css imports them.
    const imports = [
      ...(picked.find(file => file.name === 'index.css')?.text ?? '').matchAll(
        /@import\s+["'](?:\.\/)?([^"']+)["']/g
      ),
    ].map(match => match[1])
    const rank = (name: string) => (imports.includes(name) ? imports.indexOf(name) : imports.length)
    picked.sort(
      (left, right) => rank(left.name) - rank(right.name) || left.name.localeCompare(right.name)
    )
    setFiles(picked)
    read(pasted.trim() ? [...picked, { name: 'pasted.css', text: pasted }] : picked)
  }

  const send = (type: 'sync-preview' | 'sync-apply') => {
    if (!project) return
    setError(null)
    setStatus(type === 'sync-preview' ? 'previewing' : 'applying')
    postMessage({ type, model: project.model })
  }

  const listChanges = () => {
    if (!project) return
    setError(null)
    setPlan(null)
    setApplied(null)
    setStatus('listing')
    postMessage({ type: 'sync-changes', project })
  }

  const summary = project?.model.summary
  const pending = plan ? plan.totals.create + plan.totals.update : 0

  return (
    <div className={styles.page}>
      <SectionHeader
        description="Write your project’s design tokens into this file as Figma variables. Pick the CSS files that hold them (src/styles/tokens in the site template) or paste their contents. Each data-* attribute becomes a collection with its values as modes, and light and dark become the Mode collection. Code stays the source of truth: run it again after the CSS changes."
        title="Sync from your project"
      />

      <input
        accept=".css,text/css"
        className={styles.files}
        multiple
        onChange={event => void pickFiles(event.target.files)}
        ref={fileInput}
        type="file"
      />
      <div className={styles.actions}>
        <Button onClick={() => fileInput.current?.click()} variant="secondary">
          {files.length > 0 ? `${files.length} files chosen` : 'Choose CSS files'}
        </Button>
        <Button
          disabled={!pasted.trim() && files.length === 0}
          onClick={() => read(sources())}
          variant="ghost"
        >
          Read again
        </Button>
      </div>
      <Textarea
        aria-label="Token CSS"
        className={styles.paste}
        onChange={event => paste(event.target.value)}
        placeholder="Or paste token CSS here"
        rows={4}
        value={pasted}
      />

      {summary && (
        <p className={styles.meta}>
          Read {summary.variables} variables in {summary.collections} collections (
          {project.model.collections.map(item => item.name).join(', ')}), {summary.aliasValues}{' '}
          alias values. {project.notes.join(' ')}
        </p>
      )}

      {project && project.model.skipped.length > 0 && (
        <Alert title={`${project.model.skipped.length} tokens not synced`} variant="info">
          {groupByReason(project.model.skipped).map(([reason, tokens]) => (
            <p className={styles.meta} key={reason}>
              {tokens.join(', ')}: {reason}.
            </p>
          ))}
        </Alert>
      )}

      <div className={styles.actions}>
        <Button
          disabled={!project}
          loading={status === 'previewing'}
          onClick={() => send('sync-preview')}
          variant="secondary"
        >
          Preview changes
        </Button>
        {pending > 0 && (
          <Button
            loading={status === 'applying'}
            onClick={() => send('sync-apply')}
            variant="primary"
          >
            {`Apply ${pending} ${pending === 1 ? 'change' : 'changes'}`}
          </Button>
        )}
      </div>

      {error && (
        <Alert title="Sync failed" variant="error">
          {error}
        </Alert>
      )}

      <SyncResults applied={applied} plan={plan} />

      <div className={styles.nextSection}>
        <SectionHeader
          description="List the variables edited in this file as changes to the token CSS, with the file, the selector and the new value. Hand the list to your coding agent (or apply it yourself), then sync again."
          title="Changes made in Figma"
        />
      </div>
      <div className={styles.actions}>
        <Button
          disabled={!project}
          loading={status === 'listing'}
          onClick={listChanges}
          variant="secondary"
        >
          Find edited variables
        </Button>
        {changes && changes.count > 0 && (
          <CopyButton label="change list" size="md" text={changes.text} variant="outline">
            Copy change list
          </CopyButton>
        )}
      </div>
      {changes && changes.count === 0 && (
        <Alert title="Nothing edited" variant="info">
          Every variable in this file matches the CSS.
        </Alert>
      )}
      {changes && changes.count > 0 && (
        <textarea
          aria-label="Change list"
          className={styles.patch}
          readOnly
          rows={8}
          value={changes.text}
        />
      )}
    </div>
  )
}
