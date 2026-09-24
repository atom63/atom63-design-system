import { Collapsible, CollapsibleContent, CollapsibleTrigger, Separator } from '@atom63/ui-react'
import { clsx } from 'clsx'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { mdxStyles } from '../../mdx-styles'

export type CreditEntry = {
  credits: string
  role: string
}

export type CreditsBlockProps = {
  className?: string
  credits: CreditEntry[]
  label?: string
}

export function CreditsBlock({ credits, className, label = 'Credits' }: CreditsBlockProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (credits.length === 0) {
    return null
  }

  return (
    <div className={clsx('not-mdx mdx-block', mdxStyles.spacing.component, className)}>
      <Separator className="my-4" />
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger className="mdx-credits-trigger group relative flex w-full cursor-pointer items-center justify-between py-1 before:pointer-events-none before:absolute before:-inset-x-3 before:inset-y-0 before:scale-[0.7] before:rounded-sm before:opacity-0 before:transition-all before:duration-200 before:ease-out hover:before:scale-100 hover:before:opacity-100 active:before:scale-[0.97]">
          <h4 className="mdx-credits-label relative z-[1] font-serif text-sm font-bold tracking-wider uppercase">
            {label}
          </h4>
          <div className="relative z-[1] size-4">
            <AnimatePresence initial={false} mode="wait">
              {isOpen ? (
                <motion.span
                  animate={{ opacity: 1, rotate: 0 }}
                  className="mdx-credits-icon absolute inset-0"
                  exit={{ opacity: 0, rotate: 90 }}
                  initial={{ opacity: 0, rotate: -90 }}
                  key="minus"
                  transition={{ duration: 0.15 }}
                >
                  <MinusIcon className="size-4" />
                </motion.span>
              ) : (
                <motion.span
                  animate={{ opacity: 1, rotate: 0 }}
                  className="mdx-credits-icon absolute inset-0"
                  exit={{ opacity: 0, rotate: 90 }}
                  initial={{ opacity: 0, rotate: -90 }}
                  key="plus"
                  transition={{ duration: 0.15 }}
                >
                  <PlusIcon className="size-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </CollapsibleTrigger>
        <AnimatePresence initial={false}>
          {isOpen && (
            <CollapsibleContent>
              <motion.dl
                animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 overflow-hidden"
                exit={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                initial={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {credits.map(entry => (
                  <div className="flex flex-col gap-0.5" key={entry.role}>
                    <dt className="mdx-credits-role text-xs font-medium tracking-wider uppercase">
                      {entry.role}
                    </dt>
                    <dd className="mdx-credits-value text-sm">{entry.credits}</dd>
                  </div>
                ))}
              </motion.dl>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </div>
  )
}
