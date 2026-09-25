/**
 * The packages the release workflow publishes to npm, in dependency order.
 * Scripts import this list; .github/workflows/release-beta.yml repeats it in
 * PUBLISHED_PACKAGES, and lib/published-packages.test.mjs keeps the two equal.
 * Adding a package also needs its first publish by hand and a trusted
 * publisher on npm (docs/design-system/release-automation.md).
 */
export const publishedPackageDirs = [
  'packages/styles',
  'packages/ui-foundation',
  'packages/ui-react',
  'packages/mdx',
]
