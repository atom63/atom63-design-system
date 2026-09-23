declare module 'virtual:atom63-changelog' {
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

  const data: ChangelogData
  export default data
}
