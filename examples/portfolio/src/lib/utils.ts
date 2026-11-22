import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge class names; shadcn components import this as `@/lib/utils`. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
