import { Frame, FrameFooter, FrameHeader, FramePanel } from '@atom63/ui-react'
import { clsx } from 'clsx'
import { createElement, forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { mdxStyles } from '../../mdx-styles'

const spacingClasses = {
  block: mdxStyles.spacing.block,
  component: mdxStyles.spacing.component,
  media: mdxStyles.spacing.media,
} as const

export type MdxFrameSpacing = keyof typeof spacingClasses
export type MdxFrameRootElement = 'aside' | 'div' | 'figure'
export type MdxFrameWidth = 'column' | 'wide' | 'bleed'
export type MdxFrameItemTone = 'neutral' | 'negative' | 'positive' | 'warning'

const itemToneClasses: Record<MdxFrameItemTone, string> = {
  neutral: 'mdx-frame-item-neutral',
  negative: 'mdx-frame-item-negative',
  positive: 'mdx-frame-item-positive',
  warning: 'mdx-frame-item-warning',
}

export type MdxFrameHeadingProps = {
  className?: string
  description?: ReactNode
  descriptionClassName?: string
  title?: ReactNode
  titleClassName?: string
}

export function MdxFrameHeading({
  className,
  description,
  descriptionClassName,
  title,
  titleClassName,
}: MdxFrameHeadingProps) {
  if (!title && !description) {
    return null
  }

  return (
    <MdxFrameHeader className={className}>
      {title ? (
        <MdxFrameTitle className={titleClassName} data-slot="title">
          {title}
        </MdxFrameTitle>
      ) : null}
      {description ? (
        <MdxFrameDescription className={descriptionClassName} data-slot="description">
          {description}
        </MdxFrameDescription>
      ) : null}
    </MdxFrameHeader>
  )
}

export type MdxFrameChromeProps = ComponentPropsWithoutRef<typeof Frame>

export function MdxFrameChrome({ border, children, className, ...props }: MdxFrameChromeProps) {
  return (
    <Frame border={border} className={clsx('mdx-frame', className)} {...props}>
      {children}
    </Frame>
  )
}

export type MdxFrameProps = Omit<ComponentPropsWithoutRef<'figure'>, 'children'> & {
  as?: MdxFrameRootElement
  border?: MdxFrameChromeProps['border']
  children: ReactNode
  frameClassName?: string
  spacing?: MdxFrameSpacing
  width?: MdxFrameWidth
}

export const MdxFrame = forwardRef<HTMLElement, MdxFrameProps>(function MdxFrame(
  {
    as: Root = 'figure',
    border,
    children,
    className,
    frameClassName,
    spacing = 'block',
    width = 'wide',
    ...props
  },
  ref
) {
  return createElement(
    Root,
    {
      className: clsx('not-mdx mdx-block', spacingClasses[spacing], className),
      'data-mdx-width': width,
      ref,
      ...props,
    },
    <MdxFrameChrome border={border} className={frameClassName}>
      {children}
    </MdxFrameChrome>
  )
})

export type MdxFrameSurfaceProps = ComponentPropsWithoutRef<typeof FramePanel> & {
  spacing?: MdxFrameSpacing
  width?: MdxFrameWidth
}

export function MdxFrameSurface({
  border,
  children,
  className,
  spacing = 'block',
  width = 'column',
  ...props
}: MdxFrameSurfaceProps) {
  return (
    <FramePanel
      border={border}
      className={clsx('mdx-frame-panel not-mdx mdx-block', spacingClasses[spacing], className)}
      data-mdx-width={width}
      {...props}
    >
      {children}
    </FramePanel>
  )
}

export type FramedBlockHeaderProps = MdxFrameHeadingProps
export const FramedBlockHeader = MdxFrameHeading

export type FramedBlockSpacing = MdxFrameSpacing
export type FramedBlockProps = MdxFrameProps
export const FramedBlock = MdxFrame

export type TechnicalFrameProps = {
  border?: MdxFrameChromeProps['border']
  children: ReactNode
  className?: string
  dataNumbered?: boolean
  headerClassName?: string
  headerEnd?: ReactNode
  headerStart: ReactNode
  panelClassName?: string
  width?: MdxFrameWidth
}

export function TechnicalFrame({
  border,
  children,
  className,
  dataNumbered,
  headerClassName,
  headerEnd,
  headerStart,
  panelClassName,
  width,
}: TechnicalFrameProps) {
  return (
    <MdxFrameChrome
      border={border}
      className={className}
      data-mdx-width={width}
      data-numbered={dataNumbered || undefined}
    >
      <FrameHeader
        className={clsx('flex-row items-center justify-between gap-3 px-3 py-2', headerClassName)}
      >
        {headerStart}
        {headerEnd}
      </FrameHeader>
      <MdxFramePanel className={panelClassName}>{children}</MdxFramePanel>
    </MdxFrameChrome>
  )
}

export type MdxFrameHeaderProps = ComponentPropsWithoutRef<typeof FrameHeader>

export function MdxFrameHeader({ className, ...props }: MdxFrameHeaderProps) {
  return <FrameHeader className={clsx('mdx-frame-header', className)} {...props} />
}

export type MdxFrameTitleProps = ComponentPropsWithoutRef<'div'>

export function MdxFrameTitle({ className, ...props }: MdxFrameTitleProps) {
  return (
    <div className={clsx('a63-Frame-title', className)} data-slot="frame-panel-title" {...props} />
  )
}

export type MdxFrameDescriptionProps = ComponentPropsWithoutRef<'div'>

export function MdxFrameDescription({ className, ...props }: MdxFrameDescriptionProps) {
  return (
    <div
      className={clsx('a63-Frame-description', className)}
      data-slot="frame-panel-description"
      {...props}
    />
  )
}

export type MdxFramePanelProps = ComponentPropsWithoutRef<typeof FramePanel>

export function MdxFramePanel({ border, className, ...props }: MdxFramePanelProps) {
  return <FramePanel border={border} className={clsx('mdx-frame-panel', className)} {...props} />
}

export type MdxFrameItemPanelProps = Omit<MdxFramePanelProps, 'title'> & {
  bodyClassName?: string
  eyebrow?: ReactNode
  title: ReactNode
  tone?: MdxFrameItemTone
}

export function MdxFrameItemPanel({
  bodyClassName,
  children,
  className,
  eyebrow,
  title,
  tone = 'neutral',
  ...props
}: MdxFrameItemPanelProps) {
  return (
    <MdxFramePanel
      className={clsx(
        'mdx-frame-item min-w-0 overflow-hidden p-0 transition-colors',
        itemToneClasses[tone],
        className
      )}
      {...props}
    >
      <div className="px-3.5 pt-3.5 pb-3 sm:px-4">
        <div className="mb-2.5 flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden
            className={clsx('mdx-frame-item-marker mt-1.5 size-2 shrink-0 rounded-full')}
          />
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mdx-frame-item-eyebrow mb-1 font-mono text-[0.6875rem] leading-none tracking-wider uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h3 className="mdx-frame-item-title text-sm leading-snug font-semibold text-wrap">
              {title}
            </h3>
          </div>
        </div>
        <div
          className={clsx(
            'mdx-frame-item-body text-sm leading-relaxed text-pretty [&_.code-block]:my-3 [&_.code-block]:first:mt-0 [&_.code-block]:last:mb-0 [&_li]:mt-1.5 [&_ol]:mt-3 [&_ol]:ps-4 [&_p]:mt-2 [&_p_code]:px-1 [&_p_code]:py-0.5 [&_p_code]:font-mono [&_p_code]:text-xs [&_pre:not(.code-block-pre):not(.shiki)]:mt-4 [&_pre:not(.code-block-pre):not(.shiki)]:overflow-x-auto [&_pre:not(.code-block-pre):not(.shiki)]:p-3 [&_pre:not(.code-block-pre):not(.shiki)]:text-xs [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:ps-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
            bodyClassName
          )}
        >
          {children}
        </div>
      </div>
    </MdxFramePanel>
  )
}

export type MdxFrameFooterProps = ComponentPropsWithoutRef<typeof FrameFooter>

export function MdxFrameFooter({ className, ...props }: MdxFrameFooterProps) {
  return <FrameFooter className={clsx('mdx-frame-footer', className)} {...props} />
}
