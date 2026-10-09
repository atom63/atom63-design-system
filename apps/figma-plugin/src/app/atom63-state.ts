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
import { differenceLine, variantName } from './difference'
import { formatCount, plural } from './format'

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
  /** The one automatic re-check after a pending result was sent; once per build. */
  autoRechecked: boolean
  /** Why the last difference could not be shown in Figma, under the list; never a failed run. */
  selectError: string | null
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
  /** `auto` is the one re-check the view sends itself after a pending result. */
  | { type: 'check-sent'; auto?: boolean }
  | { type: 'checked'; data: DesignSystemOutcome }
  /** A difference was clicked: `select-node` is on its way. */
  | { type: 'select-sent' }
  /** The main thread showed the node; Figma's selection is the feedback. */
  | { type: 'selected' }
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
  autoRechecked: false,
  selectError: null,
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

/**
 * The check a result offers, by its label: Check again after a pending check
 * or a check that failed to run, and Check the file after a build that did
 * not finish, so the user sees what it left. Null when there is none.
 */
export function checkAction(state: Atom63State): 'Check again' | 'Check the file' | null {
  if (state.phase !== 'idle') return null
  if (state.checked?.status === 'pending' || state.error?.during === 'checking')
    return 'Check again'
  if (state.error?.during === 'building') return 'Check the file'
  return null
}

/** How long the view waits after a pending result before it checks again by itself. */
export const AUTO_RECHECK_MS = 1500

/** Whether a pending result should be checked again automatically: once per build. */
export const shouldAutoRecheck = (state: Atom63State) =>
  state.phase === 'idle' && state.checked?.status === 'pending' && !state.autoRechecked

/**
 * Runs `recheck` once after `AUTO_RECHECK_MS` when the state calls for it, and
 * returns the cancel, for an effect's cleanup (a new state, Back or unmount).
 */
export function scheduleAutoRecheck(
  state: Atom63State,
  recheck: () => void,
  delay = AUTO_RECHECK_MS
): (() => void) | undefined {
  if (!shouldAutoRecheck(state)) return undefined
  const timer = setTimeout(recheck, delay)
  return () => clearTimeout(timer)
}

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
          autoRechecked: false,
          selectError: null,
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
        state: {
          ...state,
          phase: 'checking',
          checked: null,
          error: null,
          autoRechecked: state.autoRechecked || !!event.auto,
          selectError: null,
        },
      }
    case 'checked':
      return { state: { ...state, phase: 'idle', checked: event.data } }
    case 'select-sent':
      return { state: state.selectError ? { ...state, selectError: null } : state }
    case 'selected':
      return { state }
    case 'error':
      // Showing a difference in Figma failed: say so under the list; the result stands.
      if (event.for === 'select-node') return { state: { ...state, selectError: event.message } }
      // A failed settings save, or a token flow's message, must not stop a build.
      if (!isAtom63Error(event.for)) return { state }
      return {
        state: {
          ...state,
          phase: 'idle',
          progress: null,
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
    ? `${named} (${formatCount(progress.done)} of ${plural(progress.total, 'component')})`
    : named
}

/**
 * The progress live region's text: empty when idle, so the region stays in the
 * accessibility tree and only its text changes when work starts.
 */
export function liveText(state: Pick<Atom63State, 'phase' | 'progress'>): string {
  if (state.phase === 'building') return progressLabel(state.progress)
  if (state.phase === 'checking') return 'Verifying…'
  return ''
}

/** What the file holds of Atom63's tokens, for the table. */
export function tokensStatus(atom63: DesignSystemTable['atom63']): string {
  if (!atom63) return 'None yet'
  return `${plural(atom63.variables, 'variable')} in ${plural(atom63.collections.length, 'collection')}`
}

/**
 * Whether a component is built, for the table. The set lives inside its spec
 * card, so a built component is one with variants; a set left on the page
 * without a card is built too, its card still to come.
 */
export function componentStatus(component: DesignSystemTable['components'][number]): string {
  if (component.variants === 0) return 'Not built yet'
  const variants = plural(component.variants, 'variant')
  if (component.card) return `${variants}, spec card`
  if (component.setOnPage) return `${variants} on the page, no spec card yet`
  return `${variants}, no spec card`
}

/** What a build changed, for the result: variables, styles, and each component. */
export function builtSummary(built: DesignSystemOutcome | null, checked: DesignSystemOutcome) {
  const tokens = built?.tokens.applied
  const styles = built?.styles?.applied
  const lines = [
    `${plural(tokens?.created ?? 0, 'variable')} created, ${formatCount(tokens?.updated ?? 0)} updated; ${plural(styles?.created ?? 0, 'style')} created, ${formatCount(styles?.updated ?? 0)} updated.`,
  ]
  for (const component of checked.components) {
    const applied = built?.components.find(item => item.name === component.name)?.applied
    const card = applied?.card
    lines.push(
      `${component.name}: ${plural(component.variants, 'variant')}, spec card${
        card
          ? ` (${plural(card.created, 'item')} created, ${formatCount(card.updated)} updated)`
          : ''
      }.`
    )
  }
  return lines
}

/** A line of a failed check; a difference carries the node it can show in Figma. */
export interface FailureLine {
  text: string
  nodeId?: string
}

/** Every named difference a failed check reports, in the engine's caps. */
export function failureLines(
  checked: DesignSystemOutcome,
  built: DesignSystemOutcome | null
): FailureLine[] {
  const lines: FailureLine[] = []
  const add = (text: string) => lines.push({ text })
  const tokens = checked.tokens.verification
  const variablesLeft = tokens.create + tokens.update
  if (variablesLeft > 0) add(`${plural(variablesLeft, 'variable')} to create or update`)
  if (tokens.typeConflicts > 0)
    add(`${plural(tokens.typeConflicts, 'variable')} with another type in this file, left alone`)
  const styles = checked.styles?.verification
  const stylesLeft = [...(styles?.create ?? []), ...(styles?.update ?? [])]
  if (stylesLeft.length > 0) add(`Styles to create or update: ${stylesLeft.join(', ')}`)
  for (const component of checked.components) {
    const plan = component.verification
    if (plan.missingVariables.length > 0)
      add(`${component.name}: missing variables ${plan.missingVariables.join(', ')}`)
    const left = plan.create + plan.update + plan.variables
    if (left > 0 && !plan.differences)
      add(`${component.name}: ${plural(left, 'part')} to create or update`)
    for (const difference of plan.differences ?? [])
      lines.push({ text: differenceLine(component.name, difference), nodeId: difference.nodeId })
    const card = plan.card
    if (card && card.create + card.update > 0)
      add(
        `${component.name} spec card: ${plural(card.create + card.update, 'item')} to create or update`
      )
  }
  return [...lines, ...retryLines(built).map(text => ({ text }))]
}

/** The variants a build's retry could not write, shown whatever the check says. */
export function retryLines(built: DesignSystemOutcome | null): string[] {
  const lines: string[] = []
  for (const component of built?.components ?? [])
    for (const { variant, error } of component.retryErrors ?? [])
      lines.push(`${component.name} · ${variantName(variant)} could not be written: ${error}`)
  return lines
}

/**
 * The build's font fallbacks as one plain sentence and the engine's own lines
 * for a disclosure. A fallback is expected (Figma cannot bind a CSS font
 * stack), so it is a note, not a warning. Null when there is none.
 */
export function fontNote(built: DesignSystemOutcome | null): {
  sentence: string
  lines: string[]
} | null {
  const lines = built?.fontFallbacks ?? []
  if (lines.length === 0) return null
  const families = [
    ...new Set(
      lines.flatMap(line => {
        const used = /used (.+)$/.exec(line)?.[1]?.trim()
        return used ? [used] : []
      })
    ),
  ]
  const used =
    families.length === 0
      ? 'A fallback font is'
      : `${families.join(' and ')} ${families.length === 1 ? 'is' : 'are'}`
  return { sentence: `Fonts: ${used} used where Figma can't bind a CSS font stack.`, lines }
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
