/**
 * After Create, the file's default modes are fixed: a plugin cannot change a
 * collection's default mode. This says so, and warns when the choices on screen
 * (and so Export CSS) no longer match the file.
 */
import type { TemplateChoices } from '@atom63/figma'

const sameChoices = (left: TemplateChoices, right: TemplateChoices) =>
  (Object.keys(left) as (keyof TemplateChoices)[]).every(key => left[key] === right[key])

export function createdNote(
  createdWith: TemplateChoices | null,
  choices: TemplateChoices
): string | null {
  if (!createdWith) return null
  if (sameChoices(createdWith, choices))
    return 'This file now holds this token system. To start from other choices, create in a new file.'
  return 'This file holds the system created with your earlier choices; a plugin cannot change a collection’s default mode afterwards. Export now gives CSS for your current choices, which this file does not match. Create in a new file to use them.'
}
