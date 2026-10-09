/**
 * What the Atom63 view shows: what the file holds, a build's progress, and the
 * check that follows it (P3). A build that is not refused is always checked in
 * a separate message, so Figma's reconciliation has settled.
 */
import type {
  DesignSystemBlocked,
  UIToMain,
  DesignSystemOutcome,
  DesignSystemProgress,
  DesignSystemTable,
} from '../messages'

export type Atom63Phase = 'scanning' | 'idle' | 'building' | 'checking'

export interface Atom63State {
  phase: Atom63Phase
  table: DesignSystemTable | null
  progress: DesignSystemProgress | null
  blocked: DesignSystemBlocked | null
  /** The build's own outcome: what it created and updated. */
  built: DesignSystemOutcome | null
  /** The check after it: the verdict. */
  checked: DesignSystemOutcome | null
  /** The phase an error came in, so a late scan reply can clear one from a scan. */
  error: { message: string; during: Atom63Phase } | null
  /** A check was sent again by hand, so Check again stays in place while it runs. */
  rechecking: boolean
}

export type Atom63Event =
  | { type: 'scan-sent' }
  | { type: 'table'; data: DesignSystemTable }
  | { type: 'build-sent' }
  | { type: 'progress'; data: DesignSystemProgress }
  | {
      type: 'built'
      data: (DesignSystemOutcome | DesignSystemBlocked) & { table: DesignSystemTable }
    }
  | { type: 'check-sent' }
  | { type: 'checked'; data: DesignSystemOutcome }
  /** `for` is the message that failed; untagged errors are taken as this view's. */
  | { type: 'error'; message: string; for?: UIToMain['type'] }

export const initialAtom63State: Atom63State = {
  phase: 'scanning',
  table: null,
  progress: null,
  blocked: null,
  built: null,
  checked: null,
  error: null,
  rechecking: false,
}

/**
 * Where the view starts: with the table Home already scanned, or scanning
 * itself when Home has none, so two scans never overlap.
 */
export function startAtom63(initialTable?: DesignSystemTable | null): {
  state: Atom63State
  send?: 'atom63-scan'
} {
  if (initialTable) return { state: { ...initialAtom63State, phase: 'idle', table: initialTable } }
  return { state: initialAtom63State, send: 'atom63-scan' }
}

/** Whether an error belongs to this view: one from an Atom63 message, or an untagged one. */
export const isAtom63Error = (failed?: UIToMain['type']) => !failed || failed.startsWith('atom63-')

/** Check again follows a pending check or a check that failed to run, and stays while it reruns. */
export const canCheckAgain = (state: Atom63State) =>
  state.checked?.status === 'pending' || state.error?.during === 'checking' || state.rechecking

/** The next state, and the message to send now, if any. */
export function nextAtom63(
  state: Atom63State,
  event: Atom63Event
): { state: Atom63State; send?: 'atom63-check' | 'atom63-scan' } {
  switch (event.type) {
    case 'scan-sent':
      return { state: { ...state, phase: 'scanning', error: null } }
    case 'table':
      // Home's scan can still be running when this view sends its own, which is refused.
      return {
        state: {
          ...state,
          table: event.data,
          phase: state.phase === 'scanning' ? 'idle' : state.phase,
          error: state.error?.during === 'scanning' ? null : state.error,
        },
      }
    case 'build-sent':
      return {
        state: {
          ...state,
          phase: 'building',
          progress: null,
          blocked: null,
          built: null,
          checked: null,
          error: null,
          rechecking: false,
        },
      }
    case 'progress':
      return { state: { ...state, progress: event.data } }
    case 'built': {
      const { table, ...outcome } = event.data
      if (outcome.status === 'blocked')
        return { state: { ...state, phase: 'idle', table, progress: null, blocked: outcome } }
      return {
        state: { ...state, phase: 'checking', table, progress: null, built: outcome },
        send: 'atom63-check',
      }
    }
    case 'check-sent':
      return {
        state: { ...state, phase: 'checking', checked: null, error: null, rechecking: true },
      }
    case 'checked':
      return { state: { ...state, phase: 'idle', checked: event.data, rechecking: false } }
    case 'error':
      // A failed settings save, or a token flow's message, must not stop a build.
      if (!isAtom63Error(event.for)) return { state }
      return {
        state: {
          ...state,
          phase: 'idle',
          progress: null,
          rechecking: false,
          error: { message: event.message, during: state.phase },
        },
      }
  }
}

const PHASES: Record<DesignSystemProgress['phase'], string> = {
  tokens: 'Writing variables',
  styles: 'Writing text and effect styles',
  components: 'Building',
  card: 'Built',
  done: 'Finishing',
}

/** One line for a progress message: what is happening and how far along. */
export function progressLabel(progress: DesignSystemProgress | null): string {
  if (!progress) return 'Starting…'
  const what = PHASES[progress.phase]
  const named = progress.label ? `${what} ${progress.label}` : what
  return progress.phase === 'components' || progress.phase === 'card'
    ? `${named} (${progress.done} of ${progress.total} components)`
    : named
}

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`

/** What a build changed, for the result: variables, styles, and each component. */
export function builtSummary(built: DesignSystemOutcome | null, checked: DesignSystemOutcome) {
  const tokens = built?.tokens.applied
  const styles = built?.styles?.applied
  const lines = [
    `${tokens?.created ?? 0} variables created, ${tokens?.updated ?? 0} updated; ${styles?.created ?? 0} styles created, ${styles?.updated ?? 0} updated.`,
  ]
  for (const component of checked.components) {
    const applied = built?.components.find(item => item.name === component.name)?.applied
    const card = applied?.card
    lines.push(
      `${component.name}: ${plural(component.variants, 'variant')}, spec card${
        card ? ` (${card.created} parts created, ${card.updated} updated)` : ''
      }.`
    )
  }
  return lines
}

/** Every named difference a failed check reports, in the engine's caps. */
export function failureLines(
  checked: DesignSystemOutcome,
  built: DesignSystemOutcome | null
): string[] {
  const lines: string[] = []
  const tokens = checked.tokens.verification
  const variablesLeft = tokens.create + tokens.update
  if (variablesLeft > 0) lines.push(`${plural(variablesLeft, 'variable')} to create or update`)
  if (tokens.typeConflicts > 0)
    lines.push(
      `${plural(tokens.typeConflicts, 'variable')} with another type in this file, left alone`
    )
  const styles = checked.styles?.verification
  const stylesLeft = [...(styles?.create ?? []), ...(styles?.update ?? [])]
  if (stylesLeft.length > 0) lines.push(`Styles to create or update: ${stylesLeft.join(', ')}`)
  for (const component of checked.components) {
    const plan = component.verification
    if (plan.missingVariables.length > 0)
      lines.push(`${component.name}: missing variables ${plan.missingVariables.join(', ')}`)
    const left = plan.create + plan.update + plan.variables
    if (left > 0 && !plan.differences)
      lines.push(`${component.name}: ${plural(left, 'part')} to create or update`)
    for (const { variant, what, actual, expected } of plan.differences ?? [])
      lines.push(
        `${component.name} · ${variant} — ${what}${actual !== undefined || expected !== undefined ? `: ${actual ?? 'none'} → ${expected ?? 'none'}` : ''}`
      )
    const card = plan.card
    if (card && card.create + card.update > 0)
      lines.push(
        `${component.name} spec card: ${plural(card.create + card.update, 'part')} to create or update`
      )
  }
  return [...lines, ...retryLines(built)]
}

/** The variants a build's retry could not write, shown whatever the check says. */
export function retryLines(built: DesignSystemOutcome | null): string[] {
  const lines: string[] = []
  for (const component of built?.components ?? [])
    for (const { variant, error } of component.retryErrors ?? [])
      lines.push(`${component.name} · ${variant} could not be written: ${error}`)
  return lines
}

/** How far a build is, 0–100: variables, styles, then each component. */
export function progressValue(progress: DesignSystemProgress | null, components: number): number {
  if (!progress) return 0
  if (progress.phase === 'done') return 100
  const steps = 2 + Math.max(components, 1)
  const done =
    progress.phase === 'tokens'
      ? progress.done
      : progress.phase === 'styles'
        ? 1 + progress.done
        : 2 + progress.done
  return Math.round((done / steps) * 100)
}
