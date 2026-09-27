/**
 * The `pnpm-workspace.yaml` that points a throwaway app's dependencies at
 * local tarballs.
 *
 * Overrides live here, not in `package.json#pnpm`: pnpm 11 stopped reading
 * that field, silently, so an app installed by a newer pnpm (Corepack picks
 * the latest one in a directory with no `packageManager`) resolved the
 * packages from the registry instead. pnpm 10 reads this file too.
 */
export function pnpmOverridesYaml(overrides) {
  const lines = Object.entries(overrides).map(
    ([name, spec]) => `  ${JSON.stringify(name)}: ${JSON.stringify(spec)}`
  )
  return `overrides:\n${lines.join('\n')}\n`
}
