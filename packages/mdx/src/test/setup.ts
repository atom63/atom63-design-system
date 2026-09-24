import '@testing-library/jest-dom'
import { expect } from 'vitest'
import type { AxeMatchers } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

// vitest-axe ships its `extend-expect` type augmentation against the legacy
// global `Vi` namespace, which Vitest 4 no longer maps onto `expect`. Augment
// the modern `vitest` module directly so `toHaveNoViolations` typechecks —
// mirrors the pattern @testing-library/jest-dom uses.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Vitest matcher augmentation relies on interface merging.
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Vitest matcher augmentation relies on interface merging.
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

if (!('IntersectionObserver' in globalThis)) {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
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
