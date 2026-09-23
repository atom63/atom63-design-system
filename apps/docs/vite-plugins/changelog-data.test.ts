import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseChangeset, parsePackageChangelog, readChangelogData } from './changelog-data'

const workspaceRoot = path.resolve(process.cwd(), '../..')

describe('design-system changelog data', () => {
  it('parses multi-package changesets without rewriting their markdown', () => {
    const source = `---
'@atom63/ui-react': minor
"@atom63/styles": patch
---

Add a **shared contract** with \`inline code\`.

Second paragraph.
`

    expect(parseChangeset('shared-contract', source)).toEqual({
      body: 'Add a **shared contract** with `inline code`.\n\nSecond paragraph.',
      id: 'shared-contract',
      packages: [
        { bump: 'minor', name: '@atom63/ui-react' },
        { bump: 'patch', name: '@atom63/styles' },
      ],
    })
  })

  it('parses released versions and change sections', () => {
    const source = `# @atom63/example

## 0.2.0

### Minor Changes

- Add the feature.

### Patch Changes

- Refine the feature.

## 0.1.0

### Minor Changes

- Initial release.
`

    expect(parsePackageChangelog(source)).toEqual([
      {
        sections: [
          { body: '- Add the feature.', label: 'Minor Changes' },
          { body: '- Refine the feature.', label: 'Patch Changes' },
        ],
        version: '0.2.0',
      },
      {
        sections: [{ body: '- Initial release.', label: 'Minor Changes' }],
        version: '0.1.0',
      },
    ])
  })

  it('aggregates the current workspace release sources', async () => {
    const data = await readChangelogData(workspaceRoot)
    const actualPendingPackages = new Set(
      data.pending.flatMap(entry => entry.packages.map(change => change.name))
    )
    const changesetDir = path.join(workspaceRoot, '.changeset')
    const [changesetFiles, configSource, packageDirectories] = await Promise.all([
      fs.readdir(changesetDir),
      fs.readFile(path.join(changesetDir, 'config.json'), 'utf8'),
      fs.readdir(path.join(workspaceRoot, 'packages'), { withFileTypes: true }),
    ])
    const ignored = new Set((JSON.parse(configSource) as { ignore?: string[] }).ignore ?? [])
    const parsedChangesets = await Promise.all(
      changesetFiles
        .filter(file => file.endsWith('.md') && file !== 'README.md')
        .map(async file => {
          const source = await fs.readFile(path.join(changesetDir, file), 'utf8')
          return parseChangeset(file.slice(0, -3), source)
        })
    )
    const pendingChangesets = parsedChangesets.filter(entry =>
      entry?.packages.some(change => !ignored.has(change.name))
    )
    const expectedPendingPackages = new Set(
      parsedChangesets.flatMap(
        entry => entry?.packages.map(change => change.name).filter(name => !ignored.has(name)) ?? []
      )
    )
    const expectedReleasedPackages = new Set(
      (
        await Promise.all(
          packageDirectories
            .filter(entry => entry.isDirectory())
            .map(async entry => {
              const directory = path.join(workspaceRoot, 'packages', entry.name)
              try {
                const [manifestSource, changelogSource] = await Promise.all([
                  fs.readFile(path.join(directory, 'package.json'), 'utf8'),
                  fs.readFile(path.join(directory, 'CHANGELOG.md'), 'utf8'),
                ])
                const manifest = JSON.parse(manifestSource) as { name?: string }
                return manifest.name &&
                  !ignored.has(manifest.name) &&
                  parsePackageChangelog(changelogSource).length > 0
                  ? manifest.name
                  : null
              } catch (error) {
                if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                  return null
                }
                throw error
              }
            })
        )
      ).flatMap(name => (name ? [name] : []))
    )

    // One entry per changeset file, not per package: a single changeset may
    // name several packages, which the multi-package case above covers. Keying
    // this on the package-set size instead made the two counts coincidental —
    // they only match while every changeset happens to touch exactly one
    // package, and a legitimate three-package changeset broke it.
    expect(data.pending).toHaveLength(pendingChangesets.length)
    expect(data.releasedPackages.length).toBeGreaterThan(0)
    expect(actualPendingPackages).toEqual(expectedPendingPackages)
    expect(new Set(data.releasedPackages.map(entry => entry.name))).toEqual(
      expectedReleasedPackages
    )
  })
})
