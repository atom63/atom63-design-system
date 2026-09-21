import prettier from 'eslint-config-prettier/flat'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactCompiler from 'eslint-plugin-react-compiler'
import reactHooks from 'eslint-plugin-react-hooks'
import { base, fixtureGlobs, ratchet } from './base.js'

/**
 * React preset — base + hooks correctness, React Compiler safety, and a11y.
 *
 * RATCHET: everything lands as `warn`, and each package gates with
 * `--max-warnings <baseline>` so the count can only go down. Landing these as
 * `error` would wedge CI on pre-existing debt across 33 packages.
 *
 * `rules-of-hooks` is the exception — it is `error`. A hook called conditionally
 * is a real bug, not style debt.
 *
 * @param {{ tsconfigRootDir: string, typeAware?: boolean }} options
 */
export function react(options) {
  return [
    ...base(options),
    ...ratchet([
      {
        files: ['**/*.{ts,tsx}'],
        plugins: {
          'jsx-a11y': jsxA11y,
          'react-hooks': reactHooks,
          'react-compiler': reactCompiler,
        },
        rules: {
          ...jsxA11y.configs.recommended.rules,
          'react-hooks/rules-of-hooks': 'error',
          'react-hooks/exhaustive-deps': 'warn',
          'react-compiler/react-compiler': 'warn',
        },
      },
    ]),
    {
      // Storybook's `render` IS a component boundary — Storybook mounts it as one,
      // so hooks inside it are safe. rules-of-hooks can't see that through its
      // naming heuristic (a fn called `render` isn't PascalCase), so it fires on
      // every stateful story. Scope it off for fixtures only; it stays a hard error
      // in real source, where a conditionally-called hook is a genuine bug.
      files: fixtureGlobs,
      rules: { 'react-hooks/rules-of-hooks': 'off' },
    },
    // MUST STAY LAST — re-applied after the React plugins, which reintroduce
    // some layout rules that Prettier owns.
    prettier,
  ]
}

export default react
