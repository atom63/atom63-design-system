import { react } from '@atom63/eslint-config/react'

/*
 * @atom63/brand — the ATOM63 logo components. Ships React components, so it
 * uses the React preset with type-aware linting (the package has its own
 * tsconfig.json).
 */
export default react({ tsconfigRootDir: import.meta.dirname })
