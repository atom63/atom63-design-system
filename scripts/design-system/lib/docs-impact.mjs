/**
 * Flags a pull request that changes what the docs site describes (a component
 * contract, a component's source, a token source, or a pattern package) without
 * touching the docs site or a story. CI prints the result as a warning; it never
 * fails the build. "Docs: n/a" on a line of its own in the PR body skips it.
 */
const DOCS_SOURCE =
  /^(packages\/ui-foundation\/contracts\/components\/[^/]+\.json$|packages\/styles\/src\/tokens\/.+\.json$|packages\/(ui-react|mdx|inform|widgets|agent)\/src\/.+\.(ts|tsx|css)$)/

const NOT_DOCS_SOURCE = /(\.test\.|\.stories\.|\.d\.ts$|\/__snapshots__\/|-contract\.ts$)/

const DOCS_CHANGE = /^apps\/docs\/|\.stories\.tsx?$/

const DOCS_OPT_OUT = /^\s*docs:\s*n\/?a\b/im

/** @param {string} file repository-relative path */
export const isDocsSource = file => DOCS_SOURCE.test(file) && !NOT_DOCS_SOURCE.test(file)

/** @param {string} body the pull request description */
export const optsOutOfDocs = body => DOCS_OPT_OUT.test(body ?? '')

/**
 * @param {string[]} files repository-relative paths the pull request changes
 * @param {string} [body] the pull request description
 * @returns {{ status: 'ok' | 'opted-out' | 'missing-docs', sources: string[] }}
 */
export function docsImpact(files, body = '') {
  const sources = files.filter(isDocsSource)
  if (sources.length === 0 || files.some(file => DOCS_CHANGE.test(file))) {
    return { status: 'ok', sources }
  }
  if (optsOutOfDocs(body)) {
    return { status: 'opted-out', sources }
  }
  return { status: 'missing-docs', sources }
}
