/**
 * Repository Markdown published as doc pages (the decision records, the roadmap
 * and the token optimization plan in `docs/design-system/`).
 *
 * A page opts in with a two-line wrapper in `src/pages/<slug>.mdx`:
 *
 *   import RepoDoc from '../../../../docs/design-system/adr/0001-base-ui-primitive-layer.md'
 *
 *   <RepoDoc />
 *
 * The Markdown file stays the single source. Its relative links are rewritten:
 * to the doc page when the target is published too, otherwise to GitHub.
 */
import fs from 'node:fs'
import path from 'node:path'
import { areaForSlug, pathForDoc } from '../src/lib/doc-taxonomy'

export const REPOSITORY_BLOB_URL = 'https://github.com/atom63/atom63-design-system/blob/main/'

const REPO_DOC_IMPORT = /^import RepoDoc from '([^']+\.md)'$/m

/** Where the wrapper pages live, relative to the repository root. */
const PAGES_REPO_DIR = 'apps/docs/src/pages'

/** The repository path a wrapper page imports, or null for an ordinary page. */
export function repoDocPathFromSource(source: string): string | null {
  const match = REPO_DOC_IMPORT.exec(source)
  if (!match?.[1]) {
    return null
  }
  return path.posix.normalize(path.posix.join(PAGES_REPO_DIR, match[1]))
}

/** Repository path -> site route, for every wrapper page in `pagesDir`. */
export function readRepoDocRoutes(pagesDir: string): Map<string, string> {
  const routes = new Map<string, string>()
  for (const file of fs.readdirSync(pagesDir)) {
    if (!file.endsWith('.mdx')) {
      continue
    }
    const repoPath = repoDocPathFromSource(fs.readFileSync(path.join(pagesDir, file), 'utf8'))
    if (repoPath) {
      const slug = file.slice(0, -4)
      routes.set(repoPath, pathForDoc(areaForSlug(slug), slug))
    }
  }
  return routes
}

/** Rewrites one link found in the repository file `fromRepoPath`. */
export function rewriteRepoDocHref(
  href: string,
  fromRepoPath: string,
  routes: ReadonlyMap<string, string>
): string {
  if (!href || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('/')) {
    return href
  }

  const hashIndex = href.indexOf('#')
  const target = hashIndex === -1 ? href : href.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : href.slice(hashIndex)
  const repoPath = path.posix.normalize(
    path.posix.join(path.posix.dirname(fromRepoPath), decodeURI(target))
  )
  if (repoPath.startsWith('..')) {
    return href
  }

  const route = routes.get(repoPath)
  return route ? `${route}${hash}` : `${REPOSITORY_BLOB_URL}${encodeURI(repoPath)}${hash}`
}

/** Rewrites the inline links of a Markdown string, for the page's Markdown twin. */
export function rewriteRepoDocMarkdown(
  markdown: string,
  fromRepoPath: string,
  routes: ReadonlyMap<string, string>
): string {
  return markdown.replace(
    /\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g,
    (_link, href: string, title: string) =>
      `](${rewriteRepoDocHref(href, fromRepoPath, routes)}${title})`
  )
}

type MdastNode = { children?: MdastNode[]; type: string; url?: string }

function visitLinks(node: MdastNode, visit: (node: MdastNode) => void) {
  if ((node.type === 'link' || node.type === 'definition') && typeof node.url === 'string') {
    visit(node)
  }
  for (const child of node.children ?? []) {
    visitLinks(child, visit)
  }
}

/** Remark plugin: rewrites links in repository Markdown compiled for a doc page. */
export function remarkRepoDocLinks(options: { pagesDir: string; workspaceRoot: string }) {
  const docsRoot = path.join(options.workspaceRoot, 'docs') + path.sep

  return () => (tree: MdastNode, file: { path?: string }) => {
    if (!file.path?.startsWith(docsRoot)) {
      return
    }
    const fromRepoPath = path
      .relative(options.workspaceRoot, file.path)
      .split(path.sep)
      .join(path.posix.sep)
    const routes = readRepoDocRoutes(options.pagesDir)
    visitLinks(tree, node => {
      node.url = rewriteRepoDocHref(node.url ?? '', fromRepoPath, routes)
    })
  }
}
