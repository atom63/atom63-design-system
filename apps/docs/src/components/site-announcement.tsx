import { Callout } from '@atom63/mdx/blocks'
import { DraftingCompass } from 'lucide-react'

type SiteAnnouncementProps = {
  description?: string
  title?: string
}

export function SiteAnnouncement({
  description = 'This documentation is the source of truth for ATOM63 product surfaces, shared package boundaries, tokens, and interaction patterns.',
  title = 'Living system notes.',
}: SiteAnnouncementProps) {
  return (
    <Callout className="mt-0 mb-8" type="info">
      <Callout.Icon>
        <DraftingCompass aria-hidden className="mt-0.5 size-4" strokeWidth={1.75} />
      </Callout.Icon>
      <Callout.Title>{title}</Callout.Title>
      <Callout.Body>
        <p className="text-balance">{description}</p>
      </Callout.Body>
    </Callout>
  )
}
