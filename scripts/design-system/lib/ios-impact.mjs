/**
 * Decides whether a pull request's changed files can affect what the ios and
 * ios-snapshots CI jobs check: the Swift package and demo, the contracts,
 * models and sources Swift is generated from, their generators, and the CI
 * workflow itself. A version bump or changelog in ui-foundation cannot.
 */
const IOS_IMPACT =
  /^(packages\/ui-ios\/|examples\/ios-demo\/|packages\/ui-foundation\/(contracts|generated|src)\/|packages\/styles\/(src|generated|scripts)\/|scripts\/generate-cross-renderer-contracts\.mjs$|scripts\/generate-component-contracts\.mjs$|scripts\/design-system\/lib\/component-contracts\.mjs$|scripts\/generate-a11y-ios-contracts\.mjs$|Package\.swift$|\.github\/workflows\/ci\.yml$)/

/** @param {string[]} files repository-relative paths */
export const affectsIos = files => files.some(file => IOS_IMPACT.test(file))
