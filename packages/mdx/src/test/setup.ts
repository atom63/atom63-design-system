import '@testing-library/jest-dom'
import { expect } from 'vitest'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import type { AxeMatchers } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

// vitest-axe ships its `extend-expect` type augmentation against the legacy
// global `Vi` namespace, which Vitest 4 no longer maps onto `expect`. Augment
// the modern `vitest` module directly so `toHaveNoViolations` typechecks —
// mirrors the pattern @testing-library/jest-dom uses.
declare module 'vitest' {
  // Vitest 5 gives Assertion two type parameters, so the augmentations that
  // jest-dom and vitest-axe ship no longer merge; extend Matchers instead.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- T must match Vitest's declaration for the interfaces to merge.
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown>
    extends AxeMatchers, TestingLibraryMatchers<unknown, R> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Vitest matcher augmentation relies on interface merging.
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

if (!('IntersectionObserver' in globalThis)) {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly scrollMargin = ''
    readonly thresholds: number[] = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  globalThis.IntersectionObserver = MockIntersectionObserver
}

if (typeof globalThis.matchMedia !== 'function') {
  globalThis.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  })
}
