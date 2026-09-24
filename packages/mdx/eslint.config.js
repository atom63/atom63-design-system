import { react } from '@atom63/eslint-config/react'

/*
 * @atom63/mdx — shared MDX prose components, blocks, primitives, and article
 * styling for atom63 docs. Ships React components + hooks, so it uses the React
 * preset with type-aware linting (the package has its own tsconfig.json).
 */
export default react({ tsconfigRootDir: import.meta.dirname })
