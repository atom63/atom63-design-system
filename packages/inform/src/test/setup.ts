import '@testing-library/jest-dom'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import type { AxeMatchers } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

// vitest-axe augments the legacy global `Vi` namespace; augment `vitest`
// directly so `toHaveNoViolations` typechecks (same as @atom63/mdx).
declare module 'vitest' {
  // Vitest 5 gives Assertion two type parameters, so the augmentations that
  // jest-dom and vitest-axe ship no longer merge; extend Matchers instead.
  /* eslint-disable @typescript-eslint/no-unused-vars -- T must match Vitest's declaration for the interfaces to merge. */
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown>
    extends AxeMatchers, TestingLibraryMatchers<unknown, R> {}
  /* eslint-enable @typescript-eslint/no-unused-vars */
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
