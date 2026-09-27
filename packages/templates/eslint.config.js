import { react } from '@atom63/eslint-config/react'

/*
 * @atom63/templates — page and block templates. Ships React source, so it
 * uses the React preset with type-aware linting (the package has its own
 * tsconfig.json).
 */
export default react({ tsconfigRootDir: import.meta.dirname })
