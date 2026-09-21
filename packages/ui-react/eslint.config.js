import { react } from '@atom63/eslint-config/react'

/*
 * @atom63/ui-react — DS component library.
 *
 * Type-aware + React Compiler + jsx-a11y via the shared preset. jsx-a11y is precise
 * enough to leave legitimate composite widgets alone, so this package does NOT need
 * the blanket a11y rule-offs the previous linter required.
 */
export default react({ tsconfigRootDir: import.meta.dirname })
