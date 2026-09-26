import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import type { AxeMatchers } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

// vitest-axe augments the legacy global `Vi` namespace; augment `vitest`
// directly so `toHaveNoViolations` typechecks (same as @atom63/mdx).
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Vitest matcher augmentation relies on interface merging.
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Vitest matcher augmentation relies on interface merging.
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

/*
 * jsdom ships no IntersectionObserver, ResizeObserver or matchMedia, and
 * ui-react components and `motion` reach for them during mount. These tests
 * assert structure and copy, never a measured layout.
 */
class NoopObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return []
  }
}
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver
globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver

if (!('matchMedia' in window)) {
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) =>
      ({
        addEventListener: () => undefined,
        addListener: () => undefined,
        dispatchEvent: () => false,
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: () => undefined,
        removeListener: () => undefined,
      }) as MediaQueryList,
  })
}

/*
 * Node exposes an experimental `localStorage` global that can shadow jsdom's
 * implementation and lacks `clear()`. Guard rather than assume, so the suite
 * never fails in teardown for reasons unrelated to the test.
 */
function clearStorage(storage: Storage | undefined): void {
  if (typeof storage?.clear === 'function') storage.clear()
}

afterEach(() => {
  cleanup()
  clearStorage(globalThis.localStorage)
  clearStorage(globalThis.sessionStorage)
})
