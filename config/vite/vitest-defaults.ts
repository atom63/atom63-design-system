/**
 * Test options every package's Vitest config starts from.
 *
 * There is no workspace-level Vitest config here — each package owns its own,
 * because each needs its own plugins, aliases and setup files. That is fine
 * for the things that genuinely differ, and a trap for the things that must
 * not: a setting that has to hold repo-wide ends up copied, or fixed in one
 * package the day it bites and left wrong everywhere else.
 *
 * Spread this first, so a package can still override anything it truly needs:
 *
 *     import { sharedTestOptions } from '../../config/vite/vitest-defaults'
 *
 *     test: { ...sharedTestOptions, environment: 'jsdom', … }
 */
export const sharedTestOptions = {
  /**
   * Fifteen seconds rather than Vitest's five.
   *
   * A full `turbo run lint typecheck test build` puts well over a hundred
   * Node processes on this machine's eighteen cores — every package's Vitest
   * spawns its own worker pool, and they all land at once. Tests do not get
   * slower under that; they get starved. A trivial jsdom render that takes
   * 50ms on an idle machine has been seen to blow past five seconds of *wall*
   * time, while the slowest test in the repo still finishes in 534ms even at
   * a load average of 58.
   *
   * A timeout is there to catch work that will never finish, not work that is
   * waiting for a core. At five seconds it was catching the second thing, and
   * the failures it produced named a different innocent package each run —
   * `Slider`, `Tooltip`, an OS63 store — which reads as flakiness rather than
   * as the scheduling problem it is.
   *
   * Fifteen is not a guess: `@atom63/widgets` had already reached for exactly
   * this number on its own, for exactly this reason, and stopped appearing in
   * those failures. This lifts that one-package workaround to where it
   * belongs. Capping concurrency was measured as the alternative and rejected
   * — halving the process count cost a third of the wall time and still left
   * the machine oversubscribed.
   */
  hookTimeout: 15_000,
  testTimeout: 15_000,
} as const
