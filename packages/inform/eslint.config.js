import { react } from '@atom63/eslint-config/react'

/*
 * @atom63/inform — the inform pattern: message model, arbiter, and surfaces.
 * React package with a tsconfig, so the shared preset runs type-aware.
 */
export default react({ tsconfigRootDir: import.meta.dirname })
