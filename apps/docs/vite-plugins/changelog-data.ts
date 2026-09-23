import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

export type ChangelogBump = 'major' | 'minor' | 'patch'

export type ChangelogPackageChange = {
  bump: ChangelogBump
  name: string
}

export type PendingChangelogEntry = {
  body: string
  id: string
  packages: ChangelogPackageChange[]
}

export type ReleasedChangelogSection = {
  body: string
  label: string
}

export type ReleasedChangelogVersion = {
  sections: ReleasedChangelogSection[]
  version: string
}

export type ReleasedPackageChangelog = {
  currentVersion: string
  description?: string
  name: string
  releases: ReleasedChangelogVersion[]
}

export type ChangelogData = {
  pending: PendingChangelogEntry[]
  releasedPackages: ReleasedPackageChangelog[]
}

type PackageMetadata = {
  description?: string
  directory: string
  name: string
  version: string
}

type ChangesetConfig = {
  ignore?: string[]
}

const VIRTUAL_CHANGELOG_ID = 'virtual:atom63-changelog'
const RESOLVED_CHANGELOG_ID = `\0${VIRTUAL_CHANGELOG_ID}`
const BUMP_ORDER: Record<ChangelogBump, number> = {
  major: 0,
  minor: 1,
  patch: 2,
}

function isBump(value: string): value is ChangelogBump {
  return value === 'major' || value === 'minor' || value === 'patch'
}

export function parseChangeset(id: string, source: string): PendingChangelogEntry | null {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*?)\s*$/)
  if (!match) {
    return null
  }

  const packages = (match[1] ?? '')
    .split('\n')
    .flatMap(line => {
      const packageMatch = line.match(/^\s*['"]?([^'"]+)['"]?\s*:\s*(major|minor|patch)\s*$/)
      const bump = packageMatch?.[2]
      return packageMatch?.[1] && bump && isBump(bump) ? [{ bump, name: packageMatch[1] }] : []
    })
    .sort((a, b) => BUMP_ORDER[a.bump] - BUMP_ORDER[b.bump] || a.name.localeCompare(b.name))

  const body = (match[2] ?? '').trim()
  return packages.length > 0 && body ? { body, id, packages } : null
}

export function parsePackageChangelog(source: string): ReleasedChangelogVersion[] {
  const versionMatches = [...source.matchAll(/^##\s+(\S+)\s*$/gm)]

  return versionMatches.flatMap((match, index) => {
    const version = match[1]
    if (!version) {
      return []
    }

    const start = (match.index ?? 0) + match[0].length
    const end = versionMatches[index + 1]?.index ?? source.length
    const versionBody = source.slice(start, end)
    const sectionMatches = [...versionBody.matchAll(/^###\s+(.+?)\s*$/gm)]
    const sections = sectionMatches.flatMap((sectionMatch, sectionIndex) => {
      const label = sectionMatch[1]
      if (!label) {
        return []
      }

      const sectionStart = (sectionMatch.index ?? 0) + sectionMatch[0].length
      const sectionEnd = sectionMatches[sectionIndex + 1]?.index ?? versionBody.length
      const body = versionBody.slice(sectionStart, sectionEnd).trim()
      return body ? [{ body, label }] : []
    })

    return sections.length > 0 ? [{ sections, version }] : []
  })
}

async function readPackageMetadata(workspaceRoot: string): Promise<PackageMetadata[]> {
  const packagesDir = path.join(workspaceRoot, 'packages')
  const directories = await fs.readdir(packagesDir, { withFileTypes: true })

  return (
    await Promise.all(
      directories
        .filter(entry => entry.isDirectory())
        .map(async entry => {
          const directory = path.join(packagesDir, entry.name)
          try {
            const source = await fs.readFile(path.join(directory, 'package.json'), 'utf8')
            const manifest = JSON.parse(source) as Partial<PackageMetadata>
            return manifest.name && manifest.version
              ? {
                  description: manifest.description,
                  directory,
                  name: manifest.name,
                  version: manifest.version,
                }
              : null
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
              return null
            }
            throw error
          }
        })
    )
  ).flatMap(metadata => (metadata ? [metadata] : []))
}

async function readChangesetConfig(workspaceRoot: string): Promise<ChangesetConfig> {
  const source = await fs.readFile(path.join(workspaceRoot, '.changeset/config.json'), 'utf8')
  return JSON.parse(source) as ChangesetConfig
}

async function readPendingChangesets(
  workspaceRoot: string,
  includedPackages: Set<string>
): Promise<PendingChangelogEntry[]> {
  const changesetDir = path.join(workspaceRoot, '.changeset')
  const files = await fs.readdir(changesetDir)
  const entries = await Promise.all(
    files
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(async file => {
        const source = await fs.readFile(path.join(changesetDir, file), 'utf8')
        return parseChangeset(file.slice(0, -3), source)
      })
  )

  return entries
    .flatMap(entry => {
      if (!entry) {
        return []
      }
      const packages = entry.packages.filter(change => includedPackages.has(change.name))
      return packages.length > 0 ? [{ ...entry, packages }] : []
    })
    .sort((a, b) => {
      const aBump = Math.min(...a.packages.map(change => BUMP_ORDER[change.bump]))
      const bBump = Math.min(...b.packages.map(change => BUMP_ORDER[change.bump]))
      return (
        aBump - bBump ||
        a.packages[0].name.localeCompare(b.packages[0].name) ||
        a.id.localeCompare(b.id)
      )
    })
}

async function readReleasedPackages(
  packages: PackageMetadata[]
): Promise<ReleasedPackageChangelog[]> {
  const released = await Promise.all(
    packages.map(async metadata => {
      try {
        const source = await fs.readFile(path.join(metadata.directory, 'CHANGELOG.md'), 'utf8')
        const releases = parsePackageChangelog(source)
        return releases.length > 0
          ? {
              currentVersion: metadata.version,
              description: metadata.description,
              name: metadata.name,
              releases,
            }
          : null
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          return null
        }
        throw error
      }
    })
  )

  return released
    .flatMap(entry => (entry ? [entry] : []))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function readChangelogData(workspaceRoot: string): Promise<ChangelogData> {
  const [config, packages] = await Promise.all([
    readChangesetConfig(workspaceRoot),
    readPackageMetadata(workspaceRoot),
  ])
  const ignored = new Set(config.ignore ?? [])
  const included = packages.filter(metadata => !ignored.has(metadata.name))
  const includedNames = new Set(included.map(metadata => metadata.name))
  const [pending, releasedPackages] = await Promise.all([
    readPendingChangesets(workspaceRoot, includedNames),
    readReleasedPackages(included),
  ])

  return { pending, releasedPackages }
}

function renderPackageChanges(packages: ChangelogPackageChange[]): string {
  return packages.map(change => `\`${change.name}\` (${change.bump})`).join(', ')
}

export async function buildChangelogMarkdown(workspaceRoot: string): Promise<string> {
  const data = await readChangelogData(workspaceRoot)
  const pending =
    data.pending.length === 0
      ? 'No pending changesets.'
      : data.pending
          .map(entry => `### ${renderPackageChanges(entry.packages)}\n\n${entry.body}`)
          .join('\n\n')
  const released =
    data.releasedPackages.length === 0
      ? 'No package releases have been recorded yet.'
      : data.releasedPackages
          .map(packageChangelog => {
            const versions = packageChangelog.releases
              .map(release => {
                const sections = release.sections
                  .map(section => `#### ${section.label}\n\n${section.body}`)
                  .join('\n\n')
                return `### ${packageChangelog.name} ${release.version}\n\n${sections}`
              })
              .join('\n\n')
            return versions
          })
          .join('\n\n')

  return `# Changelog

Atom63 uses Changesets as the release source of truth. Pending changesets appear under Unreleased; released versions come from each package's generated \`CHANGELOG.md\`.

## Unreleased

${pending}

## Released

${released}
`
}

function isChangelogSource(workspaceRoot: string, file: string): boolean {
  const relative = path.relative(workspaceRoot, file)
  return (
    relative === '.changeset/config.json' ||
    /^\.changeset[/\\][^/\\]+\.md$/.test(relative) ||
    /^packages[/\\][^/\\]+[/\\](CHANGELOG\.md|package\.json)$/.test(relative)
  )
}

function invalidateChangelogModule(server: ViteDevServer) {
  const module = server.moduleGraph.getModuleById(RESOLVED_CHANGELOG_ID)
  if (module) {
    server.moduleGraph.invalidateModule(module)
  }
  server.ws.send({ type: 'full-reload' })
}

export function changelogDataPlugin(workspaceRoot: string): Plugin {
  return {
    name: 'design-system-changelog-data',

    resolveId(id) {
      return id === VIRTUAL_CHANGELOG_ID ? RESOLVED_CHANGELOG_ID : null
    },

    async load(id) {
      if (id !== RESOLVED_CHANGELOG_ID) {
        return null
      }

      return `export default ${JSON.stringify(await readChangelogData(workspaceRoot))}\n`
    },

    configureServer(server) {
      server.watcher.on('all', (_event, file) => {
        if (isChangelogSource(workspaceRoot, file)) {
          invalidateChangelogModule(server)
        }
      })
    },
  }
}
