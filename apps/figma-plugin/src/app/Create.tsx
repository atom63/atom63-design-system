import {
  buildTemplateFiles,
  type CssFile,
  NEUTRALS,
  RADII,
  type SyncOutcome,
  TEMPLATE_BRAND,
  TEMPLATE_DEFAULTS,
  type TemplateChoices,
  TYPE_SCALES,
} from '@atom63/figma'
import { SegmentedControl } from '@atom63/ui-react'
import { useMemo, useRef, useState } from 'react'

import { Alert, Button, CopyButton, Input, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import { createBrowserColorResolver } from '../utils/css-color'
import styles from './app.module.css'
import { createdNote } from './create-state'
import { downloadFile } from './download'
import { Outcome } from './Outcome'
import { previewValues } from './preview'
import { readProject } from './read-css'

const items = <T extends string>(
  values: readonly T[],
  label: (value: T) => string = value => value
) => values.map(value => ({ label: label(value), value }))

/** Create a token system from a brand color and a few choices; export it as the template's CSS. */
export function Create({ onDone }: { onDone: () => void }) {
  const postMessage = usePostMessage()
  const resolveColor = useMemo(() => createBrowserColorResolver(), [])
  const [choices, setChoices] = useState<TemplateChoices>(TEMPLATE_DEFAULTS)
  const [brandText, setBrandText] = useState(TEMPLATE_BRAND)
  const [busy, setBusy] = useState(false)
  const [applied, setApplied] = useState<SyncOutcome | undefined>()
  const [error, setError] = useState<string | null>(null)
  // The choices the file was created with; its default modes cannot change afterwards.
  const [createdWith, setCreatedWith] = useState<TemplateChoices | null>(null)
  const sending = useRef<TemplateChoices | null>(null)

  // Create and Export use these same files, so the exported CSS is what the file holds.
  const built = useMemo(():
    { files: CssFile[]; model: ReturnType<typeof readProject>['model'] } | { error: string } => {
    try {
      const files = buildTemplateFiles(choices)
      return { files, model: readProject(files, resolveColor).model }
    } catch (buildError) {
      return { error: buildError instanceof Error ? buildError.message : String(buildError) }
    }
  }, [choices, resolveColor])
  const preview = 'error' in built ? null : previewValues(built.model)
  const note = createdNote(createdWith, choices)

  useFigmaMessage(message => {
    if (message.type === 'applied') {
      setApplied(message.data)
      setCreatedWith(sending.current)
    }
    if (message.type === 'error') setError(message.data.message)
    if (message.type === 'applied' || message.type === 'error') setBusy(false)
  })

  const set = <K extends keyof TemplateChoices>(key: K, value: TemplateChoices[K]) => {
    setChoices(current => ({ ...current, [key]: value }))
  }
  const setBrand = (value: string) => {
    setBrandText(value)
    set('brand', value.toLowerCase() === TEMPLATE_BRAND ? null : value)
  }
  const create = () => {
    if ('error' in built) return
    setError(null)
    setBusy(true)
    sending.current = choices
    postMessage({ type: 'apply', model: built.model })
  }

  return (
    <div className={styles.view}>
      <SectionHeader
        description="Pick a brand color and the defaults of each axis. The file gets the site template's variables and styles with your choices as the default modes; every other mode stays, so designs can switch them."
        title="Create a token system"
      />
      <div className={styles.choices}>
        <div className={styles.brandRow}>
          <input
            aria-label="Brand color picker"
            className={styles.swatch}
            onChange={event => setBrand(event.target.value)}
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(brandText) ? brandText : TEMPLATE_BRAND}
          />
          <Input
            label="Brand color"
            onChange={event => setBrand(event.target.value)}
            value={brandText}
          />
        </div>
        <div className={styles.choice}>
          <span className={styles.meta}>Neutral</span>
          <SegmentedControl
            items={items(NEUTRALS, value => value.toUpperCase())}
            onValueChange={value => set('neutral', value as TemplateChoices['neutral'])}
            value={choices.neutral}
          />
        </div>
        <div className={styles.choice}>
          <span className={styles.meta}>Radius</span>
          <SegmentedControl
            items={items(RADII)}
            onValueChange={value => set('radius', value as TemplateChoices['radius'])}
            value={choices.radius}
          />
        </div>
        <div className={styles.choice}>
          <span className={styles.meta}>Type scale</span>
          <SegmentedControl
            items={items(TYPE_SCALES)}
            onValueChange={value => set('typeScale', value as TemplateChoices['typeScale'])}
            value={choices.typeScale}
          />
        </div>
        <Input
          label="Font"
          onChange={event => set('font', event.target.value)}
          value={choices.font}
        />
      </div>

      {'error' in built && (
        <Alert title="Check your choices" variant="error">
          {built.error}
        </Alert>
      )}

      {preview && (
        <div
          aria-label="Preview"
          className={styles.preview}
          role="img"
          style={{
            background: preview.card ?? preview.background,
            color: preview.foreground,
            borderColor: preview.border,
            borderRadius: preview.radius,
            fontFamily: `"${preview.font}", system-ui`,
            fontSize: preview.textSize,
            lineHeight: preview.textLeading ? `${preview.textLeading}px` : undefined,
          }}
        >
          <strong>Your token system</strong>
          <span style={{ color: preview.mutedForeground }}>
            Text, surfaces and the primary action follow your choices.
          </span>
          <span
            style={{
              justifySelf: 'start',
              padding: '6px 14px',
              borderRadius: preview.radius,
              background: preview.primary,
              color: preview.primaryForeground ?? 'white',
            }}
          >
            Primary action
          </span>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          disabled={'error' in built || createdWith !== null}
          loading={busy}
          onClick={create}
          variant="primary"
        >
          Create in this file
        </Button>
        <Button onClick={onDone} variant="ghost">
          Back
        </Button>
      </div>
      {error && (
        <Alert title="Create failed" variant="error">
          {error}
        </Alert>
      )}
      <Outcome applied={applied} />
      {note && (
        <Alert
          title="Default modes"
          variant={note.startsWith('This file now') ? 'info' : 'warning'}
        >
          {note}
        </Alert>
      )}

      {!('error' in built) && (
        <>
          <SectionHeader
            description="These are the template's src/styles/tokens files with your choices. Put them in a project started from the site template; from then on, code is the source."
            title="Export CSS"
          />
          <ul className={styles.list}>
            {built.files.map(file => (
              <li key={file.name}>
                <span className={styles.code}>{file.name}</span>
                <span className={styles.actions}>
                  <Button
                    onClick={() => downloadFile(file.name, file.text)}
                    size="sm"
                    variant="secondary"
                  >
                    Download
                  </Button>
                  <CopyButton label={file.name} size="sm" text={file.text} variant="outline">
                    Copy
                  </CopyButton>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
