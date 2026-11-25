import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { readEntries, readEntryMarkdown } from './llms-txt'
import {
  readRepoDocRoutes,
  REPOSITORY_BLOB_URL,
  repoDocPathFromSource,
  rewriteRepoDocHref,
  rewriteRepoDocMarkdown,
} from './repo-docs'

const pagesDir = path.resolve(process.cwd(), 'src/pages')
const workspaceRoot = path.resolve(process.cwd(), '../..')
const adr9 = 'docs/design-system/adr/0009-opinionated-open-source-for-ai-products.md'

describe('repository docs published as pages', () => {
  it('reads the repository path a wrapper page imports', () => {
    expect(
      repoDocPathFromSource(
        "import RepoDoc from '../../../../docs/design-system/roadmap-next.md'\n\n<RepoDoc />\n"
      )
    ).toBe('docs/design-system/roadmap-next.md')
    expect(repoDocPathFromSource('# An authored page\n')).toBeNull()
  })

  it('routes every wrapper page to an existing repository file under Decisions', async () => {
    const routes = readRepoDocRoutes(pagesDir)
    expect(routes.get(adr9)).toBe(
      '/architecture/decision-adr-0009-opinionated-open-source-for-ai-products'
    )
    expect(routes.get('docs/design-system/adr/README.md')).toBe('/architecture/decision-adrs')
    expect(routes.get('docs/design-system/roadmap-next.md')).toBe('/architecture/decision-roadmap')
    for (const repoPath of routes.keys()) {
      await expect(fs.access(path.join(workspaceRoot, repoPath))).resolves.toBeUndefined()
    }
  })

  it('publishes every decision record in the ADR folder', async () => {
    const routes = readRepoDocRoutes(pagesDir)
    const adrs = (await fs.readdir(path.join(workspaceRoot, 'docs/design-system/adr'))).filter(
      file => file.endsWith('.md')
    )
    for (const file of adrs) {
      expect(routes.has(`docs/design-system/adr/${file}`)).toBe(true)
    }
  })

  it('rewrites links to published docs to their pages and others to GitHub', () => {
    const routes = readRepoDocRoutes(pagesDir)
    expect(rewriteRepoDocHref('../roadmap-next.md', adr9, routes)).toBe(
      '/architecture/decision-roadmap'
    )
    expect(rewriteRepoDocHref('./0004-shadcn-close-not-identical.md#context', adr9, routes)).toBe(
      '/architecture/decision-adr-0004-shadcn-close-not-identical#context'
    )
    expect(rewriteRepoDocHref('../f1-plan.md', adr9, routes)).toBe(
      `${REPOSITORY_BLOB_URL}docs/design-system/f1-plan.md`
    )
    expect(rewriteRepoDocHref('../../../README.md', adr9, routes)).toBe(
      `${REPOSITORY_BLOB_URL}README.md`
    )
    expect(rewriteRepoDocHref('https://github.com/mui/base-ui', adr9, routes)).toBe(
      'https://github.com/mui/base-ui'
    )
    expect(rewriteRepoDocHref('#decision', adr9, routes)).toBe('#decision')
    expect(rewriteRepoDocHref('../bad%zz.md', adr9, routes)).toBe(
      `${REPOSITORY_BLOB_URL}docs/design-system/bad%25zz.md`
    )
  })

  it('rewrites the links in the Markdown twin', async () => {
    const routes = readRepoDocRoutes(pagesDir)
    expect(
      rewriteRepoDocMarkdown('See [the plan](../token-optimization-plan.md "Plan").', adr9, routes)
    ).toBe('See [the plan](/architecture/decision-token-optimization-plan "Plan").')

    const entry = (await readEntries(pagesDir)).find(
      candidate => candidate.slug === 'decision-adr-0009-opinionated-open-source-for-ai-products'
    )
    expect(entry?.area).toBe('architecture')
    if (!entry) {
      return
    }
    const twin = await readEntryMarkdown(pagesDir, entry, '')
    expect(twin.startsWith('# ADR 0009:')).toBe(true)
    expect(twin).toContain('](/architecture/decision-roadmap)')
    expect(twin).not.toContain('](../')
  })
})
