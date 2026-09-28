import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  Dialog as Atom63Dialog,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from '@atom63/ui-react'
import type { ReactNode } from 'react'

import { Button } from '../Button'
import styles from './Dialog.module.css'

export interface DialogProps {
  children: ReactNode
  className?: string
  footer?: ReactNode
  isOpen: boolean
  maxWidth?: 'sm' | 'md' | 'lg'
  noPadding?: boolean
  onClose: () => void
  title: string
}

const sizes = { sm: 'sm', md: 'default', lg: 'lg' } as const

/** The Atom63 Dialog, opened and closed by the caller (isOpen, onClose). */
export function Dialog({
  children,
  className,
  footer,
  isOpen,
  maxWidth = 'md',
  noPadding = false,
  onClose,
  title,
}: DialogProps) {
  return (
    <Atom63Dialog
      onOpenChange={open => {
        if (!open) onClose()
      }}
      open={isOpen}
    >
      <DialogPopup className={className} size={sizes[maxWidth]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogPanel className={noPadding ? styles.noPadding : undefined}>{children}</DialogPanel>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogPopup>
    </Atom63Dialog>
  )
}

/** Footer buttons; DialogFooter already lays them out. */
export function DialogActions({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export interface ConfirmDialogProps {
  cancelText?: string
  confirmText?: string
  isOpen: boolean
  loading?: boolean
  message: string
  onClose: () => void
  onConfirm: () => void
  title: string
  variant?: 'default' | 'danger'
}

/** A confirmation on the Atom63 AlertDialog; stays open while `loading`. */
export function ConfirmDialog({
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  isOpen,
  loading = false,
  message,
  onClose,
  onConfirm,
  title,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      onOpenChange={open => {
        if (!open) onClose()
      }}
      open={isOpen}
    >
      <AlertDialogPopup variant={variant === 'danger' ? 'destructive' : 'default'}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <Button
            loading={loading}
            onClick={onConfirm}
            variant={variant === 'danger' ? 'destructive' : 'primary'}
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  )
}
