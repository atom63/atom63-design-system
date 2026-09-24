import { clsx } from 'clsx'
import type React from 'react'
import { ExampleFrame } from '../foundations/example/example-frame'
import { mdxStyles } from '../mdx-styles'

export interface ExampleContainerProps {
  align?: 'left' | 'center'
  children: React.ReactNode
  className?: string
  description?: string
  /** Nested inside DocExample — drops outer margin and border (parent supplies chrome). */
  embedded?: boolean
  spec?: React.ReactNode
  title?: string
  /** Use wide layout to break out of narrow prose constraints */
  wide?: boolean
}

export function ExampleContainer({
  children,
  align = 'center',
  description,
  spec,
  title,
  className,
  embedded = false,
  wide = false,
}: ExampleContainerProps) {
  const Wrapper = wide ? 'figure' : 'div'

  return (
    <Wrapper
      className={clsx(
        'example-container not-mdx not-prose @container',
        embedded ? 'my-0' : mdxStyles.spacing.component
      )}
      data-mdx-width={wide ? 'wide' : 'column'}
    >
      {(title || description) && (
        <header className={clsx('mb-3 flex flex-col gap-1', align === 'center' && 'text-center')}>
          {title ? (
            <p className="text-foreground text-sm font-semibold tracking-tight">{title}</p>
          ) : null}
          {description ? (
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          ) : null}
        </header>
      )}
      <ExampleFrame align={align} className={className} embedded={embedded}>
        {children}
      </ExampleFrame>
      {spec ? <div className="w-full overflow-hidden">{spec}</div> : null}
    </Wrapper>
  )
}
