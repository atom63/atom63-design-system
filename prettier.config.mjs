/**
 * Prettier — the single formatter for this repository. Settings match the
 * atom63-vite workspace this design system was extracted from.
 *
 * Lint does not overlap: the ESLint presets end with `eslint-config-prettier`,
 * which turns off every layout rule.
 */

/** @type {import("prettier").Config} */
export default {
  singleQuote: true,
  semi: false,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'avoid',
  bracketSpacing: true,

  // No import-sorting plugin: sorting side-effect CSS imports changes the
  // cascade, and nothing in the build or test gates can catch that.
  plugins: ['prettier-plugin-tailwindcss'],

  overrides: [
    {
      // Tailwind v4 is CSS-first: the plugin needs the stylesheet that holds
      // `@import "tailwindcss"` to sort this repo's custom utilities.
      files: 'packages/ui-react/**/*.{ts,tsx}',
      options: { tailwindStylesheet: './packages/ui-react/scripts/utilities.input.css' },
    },
    {
      files: 'apps/docs/**/*.{ts,tsx}',
      options: { tailwindStylesheet: './apps/docs/src/styles/index.css' },
    },
  ],
}
