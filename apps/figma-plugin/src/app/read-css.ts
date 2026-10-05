/**
 * Token CSS into a model the main thread can sync: read here in the UI, where
 * the browser computes colors Node cannot, with the styles derived from it.
 */
import {
  buildProjectModel,
  type ColorResolver,
  type CssFile,
  deriveStyles,
  type SyncModel,
} from '@atom63/figma'

/** Later declarations win, so read files in the order index.css imports them. */
export function orderCssFiles(files: CssFile[]): CssFile[] {
  const imports = [
    ...(files.find(file => file.name === 'index.css')?.text ?? '').matchAll(
      /@import\s+["'](?:\.\/)?([^"']+)["']/g
    ),
  ].map(match => match[1])
  const rank = (name: string) => (imports.includes(name) ? imports.indexOf(name) : imports.length)
  return [...files].sort(
    (left, right) => rank(left.name) - rank(right.name) || left.name.localeCompare(right.name)
  )
}

export interface ReadProject {
  model: SyncModel
  notes: string[]
  skipped: { token: string; reason: string }[]
}

export function readProject(files: CssFile[], resolveColor?: ColorResolver): ReadProject {
  const project = buildProjectModel(files, resolveColor)
  const model = { ...project.model, styles: deriveStyles(project.model, project.raw) }
  return { model, notes: project.notes, skipped: project.model.skipped }
}
