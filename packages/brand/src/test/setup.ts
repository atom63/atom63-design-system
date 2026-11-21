import '@testing-library/jest-dom'
import { expect } from 'vitest'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import type { AxeMatchers } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

// vitest-axe augments the legacy global `Vi` namespace; augment `vitest`
// directly so `toHaveNoViolations` typechecks (same as @atom63/mdx).
declare module 'vitest' {
  // Vitest 5 gives Assertion two type parameters, so the augmentations that
  // jest-dom and vitest-axe ship no longer merge; extend Matchers instead.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- T must match Vitest's declaration for the interfaces to merge.
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown>
    extends AxeMatchers, TestingLibraryMatchers<unknown, R> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Vitest matcher augmentation relies on interface merging.
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
