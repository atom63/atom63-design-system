/** Joins class names, skipping empty ones. The package has no utility classes to merge. */
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(' ')
}
