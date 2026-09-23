import { clsx } from 'clsx'
import type React from 'react'
import { ExampleContext } from '../../example-context'

export type ExampleFrameProps = {
  align?: 'left' | 'center'
  children: React.ReactNode
  className?: string
  embedded?: boolean
}

export function ExampleFrame({
  align = 'center',
  children,
  className,
  embedded = false,
}: ExampleFrameProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-[var(--a63-surface-page)]',
        embedded
          ? 'flex min-h-[6.5rem] items-center px-5 py-6 sm:px-8 sm:py-7'
          : 'rounded-xl border border-[var(--a63-border-subtle)] p-6 sm:p-7',
        '[background-size:20px_20px]',
        embedded
          ? '[background-image:radial-gradient(color-mix(in_oklab,var(--a63-border-subtle)_40%,transparent)_1px,transparent_1px)]'
          : '[background-image:radial-gradient(var(--a63-border-subtle)_1px,transparent_1px)]',
        className
      )}
    >
      <ExampleContext.Provider value={true}>
        <div
          className={clsx(
            'not-mdx relative z-10 flex w-full flex-wrap',
            embedded ? 'gap-3' : 'gap-4',
            align === 'center' && 'items-center justify-center [&>*]:mx-auto',
            align === 'left' && 'items-start justify-start'
          )}
        >
          {children}
        </div>
      </ExampleContext.Provider>
    </div>
  )
}
