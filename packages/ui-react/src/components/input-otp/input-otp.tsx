import { OTPInput, OTPInputContext } from 'input-otp'
import { Minus } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/cn'

/* One-time-password field — a faithful port of the production InputOTP built on
   the `input-otp` primitive. `OTPInput` renders a single visually-hidden input;
   `InputOTPGroup` + `InputOTPSlot` draw the segmented boxes, and each slot reads
   its char/caret/active state from the OTP context by index. Chrome is restyled
   to the recessed-field vocabulary via --a63-* tokens (see input-otp.css). */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      className={cn('a63-InputOTP-input', className)}
      containerClassName={cn('a63-InputOTP', containerClassName)}
      data-slot="input-otp"
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('a63-InputOTP-group', className)} data-slot="input-otp-group" {...props} />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      className={cn('a63-InputOTP-slot', className)}
      data-active={isActive}
      data-slot="input-otp-slot"
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div aria-hidden="true" className="a63-InputOTP-caretWrap">
          <div className="a63-InputOTP-caret" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('a63-InputOTP-separator', className)}
      data-slot="input-otp-separator"
      role="separator"
      {...props}
    >
      <Minus aria-hidden />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot }
