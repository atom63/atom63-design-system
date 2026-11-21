export { Toaster } from './toaster'
export type { ToasterProps } from './toaster'
// Re-exported through this module, not straight from the root barrel, so a
// consumer that never imports the toaster never evaluates sonner.
export { toast } from 'sonner'
