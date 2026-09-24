'use client'

import { clsx } from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { MdxFrame, MdxFramePanel } from '../../foundations/frame/framed-block'

export type ResourceItem = {
  name: string
  url: string
  /** Optional one-line descriptor shown before the domain. */
  note?: string
}

export type ResourceListProps = {
  items: ResourceItem[]
  className?: string
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function getFaviconUrl(url: string): string | null {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return null
  }
}

function ResourceRow({ item }: { item: ResourceItem }) {
  const favicon = useMemo(() => getFaviconUrl(item.url), [item.url])
  const hostname = useMemo(() => getHostname(item.url), [item.url])
  const faviconRef = useRef<HTMLImageElement>(null)

  // Attach the error listener via ref to avoid onError on a non-interactive img.
  useEffect(() => {
    const img = faviconRef.current
    if (!img) return
    const hide = () => {
      img.style.display = 'none'
    }
    img.addEventListener('error', hide)
    return () => img.removeEventListener('error', hide)
  }, [])

  return (
    <li className="mdx-resource-item min-w-0">
      <a
        className="group/resource mdx-resource-row grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 no-underline transition-[background-color,color,box-shadow]"
        href={item.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {favicon ? (
          <img
            alt=""
            className="mdx-resource-favicon shrink-0"
            height={20}
            loading="lazy"
            ref={faviconRef}
            src={favicon}
            width={20}
          />
        ) : (
          <span className="mdx-resource-favicon-fallback shrink-0" />
        )}
        <span className="min-w-0">
          <span className="mdx-resource-title-line flex min-w-0 items-center gap-1.5">
            <span className="mdx-resource-name truncate text-sm leading-snug font-medium">
              {item.name}
            </span>
            <ArrowUpRight className="mdx-resource-arrow size-3.5 shrink-0" />
          </span>
          <span className="mdx-resource-note truncate text-xs">
            {item.note ? `${item.note} · ${hostname}` : hostname}
          </span>
        </span>
      </a>
    </li>
  )
}

/**
 * A compact list of external resources — people, sites, references — to follow.
 * Each row shows a favicon, name, an optional one-line note, and the domain.
 */
export function ResourceList({ items, className }: ResourceListProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <MdxFrame
      aria-label="External resources"
      as="aside"
      className={clsx('resource-list', className)}
      frameClassName="mdx-resource-list-frame"
      spacing="block"
      width="wide"
    >
      <MdxFramePanel className="mdx-resource-list-panel overflow-hidden p-0">
        <ul className="mdx-resource-list-grid">
          {items.map(item => (
            <ResourceRow item={item} key={item.url} />
          ))}
        </ul>
      </MdxFramePanel>
    </MdxFrame>
  )
}
