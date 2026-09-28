import { Toaster, toast } from '@atom63/ui-react'
import { type ReactNode, useMemo } from 'react'

export interface ToastAction {
  label: string
  onClick: () => void
}

/** Toasts through the Atom63 Toaster (sonner), with the plugin's helpers. */
export function useToast() {
  return useMemo(
    () => ({
      showSuccess: (message: string, action?: ToastAction) =>
        void toast.success(message, action ? { action } : undefined),
      showError: (message: string) => void toast.error(message),
      showInfo: (message: string) => void toast.info(message),
      showWarning: (message: string) => void toast.warning(message),
    }),
    []
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-center" />
    </>
  )
}
