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
