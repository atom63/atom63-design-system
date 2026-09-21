import {
  type FrameBorder,
  type FramePanelSurface,
  type FrameTray,
  type FrameVariant,
  frameContract,
  resolveFrameChrome,
} from '@atom63/ui-foundation'
import type * as React from 'react'
import { createContext, useContext } from 'react'

import { cn } from '../../lib/cn'

/*
 * Frame — OS-style window/flyout chrome. Faithful port of prod @atom63/ui frame.tsx.
 *
 *   <Frame variant="muted-card" border="subtle">
 *     <FrameHeader>…</FrameHeader>
 *     <FramePanel>…</FramePanel>   ← inherits panel surface + border from Frame
 *     <FrameFooter>…</FrameFooter>
 *   </Frame>
 *
 * Chrome is tray (outer) + panel (inner). Presets cover common surface pairs;
 * override with `tray` / `panel`. Border weight is Frame-level (off | subtle |
 * strong) and inherited by panels; per-panel `surface` / `border` override.
 * Styling keys off data-frame-tray / data-frame-surface / data-frame-border
 * (see frame.css), matching prod's shared data-frame-* hook vocabulary — no cva.
 */

interface FrameChrome {
  panel: FramePanelSurface
  border: FrameBorder
}

const FrameChromeContext = createContext<FrameChrome>({
  border: frameContract.defaultBorder,
  panel: 'background',
})

export interface FrameProps extends React.ComponentProps<'div'> {
  /** Named tray+panel pair. Default `muted-background`. */
  variant?: FrameVariant
  /** Outer tray surface; overrides `variant` tray. */
  tray?: FrameTray
  /** Default panel surface for nested `FramePanel`s; overrides `variant` panel. */
  panel?: FramePanelSurface
  /** Border weight for tray + nested panels. Default `strong`. */
  border?: FrameBorder
}

export function Frame({
  className,
  variant,
  tray,
  panel,
  border,
  ...props
}: FrameProps): React.ReactElement {
  const chrome = resolveFrameChrome({ variant, tray, panel, border })

  return (
    <FrameChromeContext.Provider value={{ panel: chrome.panel, border: chrome.border }}>
      <div
        className={cn('a63-Frame', className)}
        data-frame-border={chrome.border}
        data-frame-panel={chrome.panel}
        data-frame-tray={chrome.tray}
        data-slot="frame"
        data-variant={variant ?? frameContract.defaultVariant}
        {...props}
      />
    </FrameChromeContext.Provider>
  )
}

export interface FramePanelProps extends React.ComponentProps<'div'> {
  /** Override the Frame's default panel surface for this panel only. */
  surface?: FramePanelSurface
  /** Override the Frame's border weight for this panel only. */
  border?: FrameBorder
}

export function FramePanel({
  className,
  surface,
  border,
  ...props
}: FramePanelProps): React.ReactElement {
  const chrome = useContext(FrameChromeContext)
  const resolvedSurface = surface ?? chrome.panel
  const resolvedBorder = border ?? chrome.border

  return (
    <div
      className={cn('a63-Frame-panel', className)}
      data-frame-border={resolvedBorder}
      data-frame-surface={resolvedSurface}
      data-slot="frame-panel"
      {...props}
    />
  )
}

export function FrameHeader({
  className,
  ...props
}: React.ComponentProps<'header'>): React.ReactElement {
  return (
    <header
      className={cn('a63-Frame-header', className)}
      data-slot="frame-panel-header"
      {...props}
    />
  )
}

export function FrameTitle({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div className={cn('a63-Frame-title', className)} data-slot="frame-panel-title" {...props} />
  )
}

export function FrameDescription({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Frame-description', className)}
      data-slot="frame-panel-description"
      {...props}
    />
  )
}

export function FrameFooter({
  className,
  ...props
}: React.ComponentProps<'footer'>): React.ReactElement {
  return (
    <footer
      className={cn('a63-Frame-footer', className)}
      data-slot="frame-panel-footer"
      {...props}
    />
  )
}
