import { Input as Atom63Input, Label } from '@atom63/ui-react'
import { type ChangeEvent, useId } from 'react'

import styles from './Input.module.css'

export interface InputProps {
  label?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  value?: string
}

/** A labelled Atom63 Input. */
export function Input({ label, ...props }: InputProps) {
  const id = useId()
  return (
    <div className={styles.field}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Atom63Input id={id} {...props} />
    </div>
  )
}
