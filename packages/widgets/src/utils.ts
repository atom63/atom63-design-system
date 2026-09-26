export type ClassValue =
  ClassValue[] | Record<string, unknown> | string | number | bigint | boolean | null | undefined

function collect(value: ClassValue, out: string[]): void {
  if (!value) return
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    out.push(String(value))
  } else if (Array.isArray(value)) {
    for (const item of value) collect(item, out)
  } else if (typeof value === 'object') {
    for (const [name, enabled] of Object.entries(value)) if (enabled) out.push(name)
  }
}

/**
 * Joins class names, skipping empty ones (the `clsx` input shapes).
 *
 * It does not merge utilities: the package's own classes live in the
 * stylesheet's `components` layer, so a consumer's Tailwind utility already
 * wins over them through the cascade.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  for (const input of inputs) collect(input, out)
  return out.join(' ')
}
