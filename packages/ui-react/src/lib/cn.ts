import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Shared Tailwind-aware class merge for `@atom63/ui-react`. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
