import { Alert as Atom63Alert, AlertDescription, AlertIcon, AlertTitle } from '@atom63/ui-react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'

export interface AlertProps {
  children: ReactNode
  className?: string
  /** Replaces the variant's icon. */
  icon?: ReactNode
  showIcon?: boolean
  title?: string
  variant?: 'info' | 'success' | 'warning' | 'error'
}

const icons = {
  info: <Info aria-hidden />,
  success: <CheckCircle2 aria-hidden />,
  warning: <AlertTriangle aria-hidden />,
  error: <XCircle aria-hidden />,
}

/** The Atom63 Alert with the plugin's title, message and per-variant icon. */
export function Alert({
  children,
  className,
  icon,
  showIcon = true,
  title,
  variant = 'info',
}: AlertProps) {
  return (
    <Atom63Alert className={className} variant={variant}>
      {showIcon && <AlertIcon>{icon ?? icons[variant]}</AlertIcon>}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Atom63Alert>
  )
}
