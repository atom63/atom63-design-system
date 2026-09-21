// Importing the barrel applies the full @atom63/styles cascade to the test
// document; helpers below read/reset the personalization root for cascade tests.
import '../index.css'

/** The personalization root every axis attribute is set on. */
export function root(): HTMLElement {
  return document.documentElement
}

/** Clear the axis attributes + any inline props a test set, between cases. */
export function resetRoot(): void {
  const el = document.documentElement
  for (const attr of [
    'data-a63-radius',
    'data-a63-type-scale',
    'data-a63-font',
    'data-a63-brand',
    'data-a63-os',
    'data-a63-design-language',
    'data-a63-input',
  ]) {
    el.removeAttribute(attr)
  }
  el.removeAttribute('style')
}

/** Computed value of a custom property on the root, trimmed. */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
