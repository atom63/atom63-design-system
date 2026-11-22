import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
  toast,
} from '@atom63/ui-react'
import { useEffect } from 'react'
import { type Control, type FieldPath, useForm } from 'react-hook-form'

import { type Account, type AccountStatus, owners, type Plan, plans, statuses } from '../data'
import { useAccounts } from '../store'

type Values = {
  name: string
  email: string
  plan: Plan
  status: AccountStatus
  seats: string
  mrr: string
  owner: string
}

const blank: Values = {
  email: '',
  mrr: '0',
  name: '',
  owner: owners[0],
  plan: 'growth',
  seats: '5',
  status: 'trial',
}

const toValues = (account: Account): Values => ({
  email: account.email,
  mrr: String(account.mrr),
  name: account.name,
  owner: account.owner,
  plan: account.plan,
  seats: String(account.seats),
  status: account.status,
})

const ownerOptions = owners.map(owner => ({ label: owner, value: owner }))

/* A labelled select bound to the form; the label names the trigger. */
function SelectField({
  control,
  description,
  label,
  name,
  options,
}: {
  control: Control<Values>
  description: string
  label: string
  name: FieldPath<Values>
  options: readonly { label: string; value: string }[]
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select items={options} onValueChange={next => field.onChange(next)} value={field.value}>
            <FormControl>
              <SelectTrigger onBlur={field.onBlur} ref={field.ref}>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectPopup>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export interface AccountFormDialogProps {
  /** The account to edit; leave it out to create one. */
  account?: Account
  onOpenChange: (open: boolean) => void
  /** Called with the saved account, after the list has it. */
  onSaved?: (account: Account) => void
  open: boolean
}

/*
 * Create or edit an account. Fields validate when they lose focus and again on
 * submit; the first invalid field takes focus, and each error is written next
 * to its field.
 */
export function AccountFormDialog({
  account,
  onOpenChange,
  onSaved,
  open,
}: AccountFormDialogProps) {
  const { accounts, save } = useAccounts()
  const form = useForm<Values>({ defaultValues: blank, mode: 'onTouched' })
  const { reset } = form

  useEffect(() => {
    if (open) reset(account ? toValues(account) : blank)
  }, [account, open, reset])

  const submit = form.handleSubmit(values => {
    const saved: Account = {
      country: account?.country ?? 'United States',
      id: account?.id ?? `acc-${String(101 + accounts.length)}`,
      lastActive: account?.lastActive ?? '2026-11-20',
      since: account?.since ?? '2026-11-20',
      ...values,
      mrr: Number(values.mrr),
      name: values.name.trim(),
      seats: Number(values.seats),
    }
    save(saved)
    onOpenChange(false)
    onSaved?.(saved)
    toast.success(account ? `Saved ${saved.name}` : `Added ${saved.name}`)
  })

  const editing = account !== undefined
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup>
        <Form {...form}>
          <form className="contents" noValidate onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>{editing ? `Edit ${account.name}` : 'New account'}</DialogTitle>
              <DialogDescription>
                {editing
                  ? 'Changes apply to reports straight away.'
                  : 'Add a customer account by hand, for example a contract billed outside Tidepool.'}
              </DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Account name</FormLabel>
                      <FormControl>
                        <Input autoComplete="organization" {...field} />
                      </FormControl>
                      <FormDescription>The company, as it appears on invoices.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{
                    required: 'Enter the account name.',
                    validate: value =>
                      value.trim().length >= 2 || 'The name needs at least 2 characters.',
                  }}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Billing email</FormLabel>
                      <FormControl>
                        <Input autoComplete="email" inputMode="email" type="email" {...field} />
                      </FormControl>
                      <FormDescription>Where invoices and payment notices go.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{
                    pattern: {
                      message: 'Enter an email address like billing@example.com.',
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    },
                    required: 'Enter a billing email.',
                  }}
                />
                <SelectField
                  control={form.control}
                  description="Sets the seat price."
                  label="Plan"
                  name="plan"
                  options={plans}
                />
                <SelectField
                  control={form.control}
                  description="Trials and churned accounts count as $0 MRR."
                  label="Status"
                  name="status"
                  options={statuses}
                />
                <FormField
                  control={form.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats</FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" min={1} step={1} type="number" {...field} />
                      </FormControl>
                      <FormDescription>People who can sign in.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{
                    validate: value =>
                      (Number.isInteger(Number(value)) && Number(value) >= 1) ||
                      'Enter a whole number of seats, 1 or more.',
                  }}
                />
                <FormField
                  control={form.control}
                  name="mrr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MRR (USD)</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" min={0} type="number" {...field} />
                      </FormControl>
                      <FormDescription>Monthly recurring revenue.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{
                    validate: (value, values) => {
                      const amount = Number(value)
                      if (value === '' || Number.isNaN(amount) || amount < 0)
                        return 'Enter an amount of 0 or more.'
                      if ((values.status === 'trial' || values.status === 'churned') && amount > 0)
                        return 'Trials and churned accounts have no MRR; enter 0.'
                      return true
                    },
                  }}
                />
                <SelectField
                  control={form.control}
                  description="Who looks after this account."
                  label="Account owner"
                  name="owner"
                  options={ownerOptions}
                />
              </div>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost">Cancel</Button>} />
              <Button type="submit" variant="primary">
                {editing ? 'Save changes' : 'Add account'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogPopup>
    </Dialog>
  )
}
