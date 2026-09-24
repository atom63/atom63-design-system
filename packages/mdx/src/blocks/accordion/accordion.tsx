'use client'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Accordion as UIAccordion,
} from '@atom63/ui-react'
import { clsx } from 'clsx'
import type { ComponentProps } from 'react'
import { mdxStyles } from '../../mdx-styles'

export type AccordionProps = ComponentProps<typeof UIAccordion>

/**
 * MDX `Accordion` block — a thin wrapper around the `@atom63/ui-react` `Accordion`
 * that adds prose-context block spacing. Accessibility, keyboard navigation and
 * single/multiple modes are inherited from `@atom63/ui-react`. Authors compose it as
 * `<Accordion>` + `<Accordion.Item>` / `<Accordion.Trigger>` / `<Accordion.Content>`.
 */
function Accordion({ className, ...props }: AccordionProps) {
  return (
    <UIAccordion
      className={clsx('not-mdx mdx-block', mdxStyles.spacing.block, className)}
      {...props}
    />
  )
}

Accordion.Item = AccordionItem
Accordion.Trigger = AccordionTrigger
Accordion.Content = AccordionContent

export { Accordion }
