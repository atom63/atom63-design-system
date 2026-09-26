import { react } from '@atom63/eslint-config/react'

/*
 * @atom63/agent — the headless agent runtime and its React hooks.
 * React package with a tsconfig, so the shared preset runs type-aware.
 */
export default react({ tsconfigRootDir: import.meta.dirname })
