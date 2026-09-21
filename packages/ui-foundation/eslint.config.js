import { node } from '@atom63/eslint-config/node'

/*
 * @atom63/ui-foundation — platform-neutral UI contracts and environment types.
 *
 * Pure TypeScript (no React), so the `node` preset applies; type-aware linting is on
 * because the package has its own tsconfig.
 */
export default node({ tsconfigRootDir: import.meta.dirname })
