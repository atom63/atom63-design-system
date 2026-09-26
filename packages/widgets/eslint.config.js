import { react } from '@atom63/eslint-config/react'

/*
 * @atom63/widgets — the widget foundation: units and scale, card and surface,
 * states and the hosted shell. React package with a tsconfig, so the shared
 * preset runs type-aware.
 */
export default react({ tsconfigRootDir: import.meta.dirname })
