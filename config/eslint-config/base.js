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
  // Same hazard, whole directory: `<app>/public` is Vite's verbatim static
  // payload, and the portfolio asset sync rebuilds parts of it — `rm -rf` then
  // re-copy — from each app's `prebuild`. The nightly guardrail runs
  // `turbo run lint typecheck test build`, which puts that rebuild alongside
  // the same package's `eslint .`; the walk then reaches a directory the sync
  // has just deleted and the run dies on ENOENT, naming whichever asset lost
  // the race.
  //
  // Nothing is given up by skipping it. Those trees are gitignored build
  // mirrors, like `dist`, and `public` holds no lintable source at all: a
  // `.js` file placed there cannot be linted anyway, because tsconfig includes
  // only `src` and the project service rejects it outright. Today it is 1739
  // files that produce zero findings.
  '**/public/**',
  '**/*.gen.ts',
  // The GENERATED knowledge base, by exact path. A bare `**/knowledge-base.ts`
  // also swallowed apps/atom63.io/src/services/knowledge-base.ts, which is a
  // hand-written re-export barrel and should be linted.
  '**/src/knowledge/knowledge-base.ts',
  // Ambient declarations carry no logic to lint, and packages disagree about
  // whether their tsconfig includes them — which makes `allowDefaultProject`
  // error with "included by allowDefaultProject but also found in the project
  // service" (hit on storybook's vite-env.d.ts).
  '**/*.d.ts',
  // Scaffolding payload, not source. `packages/create-*/templates/` are
  // uninstalled projects with their own package.json and tsconfig, copied
  // verbatim into a NEW project — type-aware linting here sees only unresolved
  // imports. All three create-* CLIs had declared this identically; it belongs
  // in one place. (The only `templates/` directories in the workspace are those.)
  '**/templates/**',
  // Frozen, superseded code — see archive/README.md. Not linted.
  '**/archive/**',
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
 * The workspace has 33 lint scripts and years of accumulated debt that Biome never
 * checked. Landing these presets as errors would wedge CI everywhere at once. So
 * everything becomes a warning, each package pins `--max-warnings <baseline>`, and
 * the count can only ever go DOWN. Burn the baselines down per package afterwards.
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
 * Type-aware linting is the whole reason for ESLint here: Biome has no type
 * inference, so `no-floating-promises`, `no-misused-promises`, `no-base-to-string`
 * and friends are structurally invisible to it.
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
          // Architectural invariant carried over from the pre-ESLint toolchain: libraries may
          // not depend on end-applications. Kept a HARD ERROR (see `hardErrors`) —
          // a dependency cycle between a package and an app is a structural break,
          // not style debt to baseline away.
          'no-restricted-imports': [
            'error',
            {
              paths: [
                {
                  name: '@atom63/website',
                  message: 'Packages must not import from the end-application @atom63/website.',
                },
                {
                  name: '@atom63/design-system',
                  message:
                    'Packages must not import from the end-application @atom63/design-system.',
                },
              ],
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
                    // instead of widening 33 tsconfigs.
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
                // Vite build plugins + Node/dev servers. First-party code (Biome
                // DID lint these), but they live outside the app tsconfig's
                // `include: ["src"]`, so the project service can't type them.
                // Lint them without type-aware rules rather than drop coverage.
                'vite-plugins/**',
                'server/**',
                // Vercel serverless functions (plain .js, no tsconfig covers them).
                'api/**',
                // Storybook config + story helpers: fixture code that sits outside
                // the app tsconfig. `fixtureGlobs` only catches `*.stories.*`, not
                // the shared helpers beside them.
                '.storybook/**',
                'stories/**',
                // Hand-written JS-with-JSDoc data modules (@atom63/ui's prop-table
                // `*.doc.mjs`). tsconfig uses `include: ["src"]` without `allowJs`,
                // so TypeScript never sees them and the project service fails to
                // parse them. Lint them untyped rather than ignore them outright.
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
