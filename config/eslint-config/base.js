import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'

/**
 * Files that must never be linted anywhere in the workspace.
 *
 * `dist`/build output and GENERATED sources: a generated file is re-emitted by its
 * generator, so linting (or worse, --fix-ing) it produces churn that comes straight
 * back on the next generate.
 */
export const sharedIgnores = [
  '**/dist/**',
  '**/node_modules/**',
  '**/storybook-static/**',
  // tsup writes and removes bundled config shims during builds. CI can run build
  // and lint concurrently across packages, so ESLint must not scan the transient file.
  '**/tsup.config.bundled_*.mjs',
  // `<app>/public` is Vite's verbatim static payload (the docs site serves the
  // generated shadcn registry from it). It holds no lintable source: tsconfig
  // includes only `src`, so the project service would reject a `.js` file there.
  '**/public/**',
  '**/*.gen.ts',
  // Ambient declarations carry no logic to lint, and packages disagree about
  // whether their tsconfig includes them — which makes `allowDefaultProject`
  // error with "included by allowDefaultProject but also found in the project
  // service" (hit on storybook's vite-env.d.ts).
  '**/*.d.ts',
]

/**
 * Fixture files. Type-aware rules are noisy on tests/stories (deliberate `any`,
 * partial mocks), so they stay linted but not type-checked.
 */
export const fixtureGlobs = ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.ts', '**/*.stories.tsx']

/**
 * Rules that stay HARD ERRORS through the ratchet — real defects, not style debt.
 * A conditionally-called hook is a bug; an await-less promise silently swallows
 * rejections. These must never be baselined away.
 */
export const hardErrors = new Set([
  'react-hooks/rules-of-hooks',
  '@typescript-eslint/no-floating-promises',
  '@typescript-eslint/no-misused-promises',
  'no-restricted-imports',
])

/**
 * RATCHET — downgrade every rule to `warn` except `hardErrors`.
 *
 * Everything becomes a warning, each package pins `--max-warnings <baseline>`,
 * and the count can only ever go DOWN. Burn the baselines down per package.
 */
export function ratchet(configs) {
  return configs.map(config => {
    if (!config.rules) {
      return config
    }
    const rules = {}
    for (const [name, setting] of Object.entries(config.rules)) {
      if (hardErrors.has(name)) {
        rules[name] = setting
        continue
      }
      const severity = Array.isArray(setting) ? setting[0] : setting
      if (severity === 'error' || severity === 2) {
        rules[name] = Array.isArray(setting) ? ['warn', ...setting.slice(1)] : 'warn'
      } else {
        rules[name] = setting
      }
    }
    return { ...config, rules }
  })
}

/**
 * Base preset — JS recommended + TYPE-AWARE TypeScript.
 *
 * Type-aware linting is the reason for ESLint here: `no-floating-promises`,
 * `no-misused-promises`, `no-base-to-string` and friends need type information.
 *
 * @param {{ tsconfigRootDir: string, typeAware?: boolean }} options
 *   `typeAware: false` for packages without a tsconfig (e.g. @atom63/styles).
 */
export function base({ tsconfigRootDir, typeAware = true }) {
  return ratchet(
    tseslint.config(
      { ignores: sharedIgnores },
      js.configs.recommended,
      {
        // `_foo` means "deliberately unused" throughout this repo (unused catch
        // bindings, ignored event args). Encode it centrally instead of letting
        // every package baseline the same convention as debt.
        rules: {
          'no-unused-vars': 'off',
          '@typescript-eslint/no-unused-vars': [
            'warn',
            {
              argsIgnorePattern: '^_',
              varsIgnorePattern: '^_',
              caughtErrorsIgnorePattern: '^_',
              destructuredArrayIgnorePattern: '^_',
            },
          ],
        },
      },
      ...(typeAware
        ? [
            ...tseslint.configs.recommendedTypeChecked,
            {
              languageOptions: {
                parserOptions: {
                  projectService: {
                    // Root-level config files (tsup/vitest/eslint/tailwind…) sit
                    // OUTSIDE every package's tsconfig `include` (usually just
                    // "src"), so the project service can't type them and errors with
                    // "was not found by the project service". Every package in this
                    // workspace has some, so allow them onto the default project
                    // instead of widening every tsconfig.
                    allowDefaultProject: [
                      '*.js',
                      '*.mjs',
                      '*.cjs',
                      '*.ts',
                      '*.mts',
                      '*.config.js',
                      '*.config.ts',
                    ],
                  },
                  tsconfigRootDir,
                },
              },
            },
            // Flat-config files import this preset, which is plain (untyped) JS, so
            // the import lands as `any` and trips no-unsafe-assignment in EVERY
            // package's baseline. A config file isn't product code — don't type-lint it.
            {
              files: [
                ...fixtureGlobs,
                'eslint.config.js',
                '*.config.js',
                '*.config.ts',
                // Build codegen + vitest bootstrap. Packages disagree on whether
                // their tsconfig includes these, and allowDefaultProject ERRORS on
                // files that ARE in the project. Skipping type-aware rules works in
                // both cases.
                'scripts/**',
                'test/**',
                // Vite build plugins + Node/dev servers: first-party code that
                // lives outside the app tsconfig's `include: ["src"]`, so the
                // project service can't type them. Lint them without type-aware
                // rules rather than drop coverage.
                'vite-plugins/**',
                'server/**',
                // Vercel serverless functions (plain .js, no tsconfig covers them).
                'api/**',
                // Storybook config + story helpers: fixture code that sits outside
                // the app tsconfig. `fixtureGlobs` only catches `*.stories.*`, not
                // the shared helpers beside them.
                '.storybook/**',
                'stories/**',
                // Plain .mjs scripts and data modules. tsconfig uses `include: ["src"]`
                // without `allowJs`, so TypeScript never sees them and the project
                // service fails to parse them. Lint them untyped rather than ignore them.
                '**/*.mjs',
              ],
              ...tseslint.configs.disableTypeChecked,
              // These are Node/build files, and `no-undef` is live for them
              // (TypeScript isn't type-checking them, so the rule is doing real
              // work — it caught nothing but noise only because `console` and
              // `process` were undeclared: 146 of the workspace's warnings were
              // literally "'console' is not defined"). Declare the environment
              // rather than switching the rule off, so genuine typos still fail.
              //
              // MUST spread disableTypeChecked's own languageOptions. A bare
              // `languageOptions: { globals }` REPLACES the whole key, dropping
              // its `parserOptions: { project: false, projectService: false }` —
              // which puts these files back on the project service and turns
              // every one of them into a parse error.
              languageOptions: {
                ...tseslint.configs.disableTypeChecked.languageOptions,
                globals: { ...globals.node, ...globals.browser },
              },
            },
          ]
        : [...tseslint.configs.recommended]),
      // MUST STAY LAST: turns off every rule that overlaps with Prettier, so the
      // linter never argues with the formatter about the same line. Prettier owns
      // layout; ESLint owns correctness.
      prettier
    )
  )
}

export default base
