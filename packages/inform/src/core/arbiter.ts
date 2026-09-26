import type { DismissalRecord } from './persistence'
import { dismissalKey } from './registry'
import { INFORM_BLOCKING_SURFACES, INFORM_FLYOUT_STACK_LIMIT } from './types'
import type {
  InformContext,
  InformMessage,
  InformRegistry,
  InformResolution,
  InformSurface,
} from './types'

export type ArbiterInput = {
  registry: InformRegistry
  ctx: InformContext
  dismissals: DismissalRecord
  /**
   * Whether a spotlight anchor currently exists. Injected so the arbiter stays
   * pure and testable; the React layer passes a DOM-backed implementation.
   */
  isAnchorAvailable?: (anchor: string) => boolean
}

function isEligible(message: InformMessage, input: ArbiterInput): boolean {
  if (input.dismissals[dismissalKey(message)] !== undefined) return false

  const now = input.ctx.now.getTime()
  if (message.startsAt !== undefined && now < Date.parse(message.startsAt)) return false
  if (message.endsAt !== undefined && now > Date.parse(message.endsAt)) return false

  if (message.when !== undefined && !message.when(input.ctx)) return false

  if (message.surface === 'spotlight' && message.anchor !== undefined) {
    // A spotlight with no anchor would cut its hole over nothing. Skipping the
    // message entirely is always better than rendering a misaligned overlay.
    if (input.isAnchorAvailable?.(message.anchor) !== true) return false
  }

  return true
}

/**
 * Filter, group, rank, then apply exclusion. Pure: all timing, storage, and DOM
 * access is supplied by the caller through `ctx`, `dismissals`, and
 * `isAnchorAvailable`.
 */
export function resolveInform(input: ArbiterInput): InformResolution {
  const eligible = input.registry.messages.filter(message => isEligible(message, input))

  // Declaration order already holds, and Array#sort is stable, so ranking by
  // descending priority breaks ties by declaration order for free.
  const ranked = (surface: InformSurface): InformMessage[] =>
    eligible.filter(message => message.surface === surface).sort((a, b) => b.priority - a.priority)

  const head = (surface: InformSurface): InformMessage | null => ranked(surface)[0] ?? null

  // Walk the blocking surfaces in precedence order: the first with a candidate
  // takes the single blocking slot and the rest stay empty. Driving this from
  // INFORM_BLOCKING_SURFACES keeps the precedence in one place, so adding or
  // reordering a blocking surface is an edit to that list alone.
  const blockingResolutions = new Map<InformSurface, InformMessage | null>()
  let blocking: InformMessage | null = null
  for (const surface of INFORM_BLOCKING_SURFACES) {
    const candidate: InformMessage | null = blocking === null ? head(surface) : null
    blockingResolutions.set(surface, candidate)
    blocking = blocking ?? candidate
  }

  return {
    banner: head('banner'),
    dialog: blockingResolutions.get('dialog') ?? null,
    spotlight: blockingResolutions.get('spotlight') ?? null,
    // The only stacking surface, and bounded: the rest wait their turn.
    'corner-flyout':
      blocking === null ? ranked('corner-flyout').slice(0, INFORM_FLYOUT_STACK_LIMIT) : [],
  }
}
