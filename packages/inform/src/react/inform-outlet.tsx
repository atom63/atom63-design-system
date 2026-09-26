import type { ReactElement } from 'react'

import { INFORM_SURFACES, resolveContent } from '../core/types'
import type { InformContent, InformMessage, InformSurface } from '../core/types'
import { InformBanner } from '../surfaces/inform-banner'
import { InformFlyoutStack } from '../surfaces/flyout-stack'
import type { InformFlyoutPlacement } from '../surfaces/flyout-stack'
import { InformCornerFlyout } from '../surfaces/inform-corner-flyout'
import { InformDialog } from '../surfaces/inform-dialog'
import { InformSpotlight } from '../surfaces/inform-spotlight'
import { useInform, useInformContext } from './use-inform'

export type InformOutletProps = {
  /**
   * Which surfaces this outlet is responsible for. Defaults to all four. Split
   * them across outlets when surfaces belong in different parts of the tree —
   * an in-flow banner sits in a layout slot, while the overlay surfaces belong
   * at the layout root.
   */
  surfaces?: readonly InformSurface[]
  /** CSS length for the flyout stack's inset on its anchored edge. */
  flyoutOffset?: string
  /** Which corner the flyout stack is anchored to. */
  flyoutPlacement?: InformFlyoutPlacement
}

export function InformOutlet({
  flyoutOffset,
  flyoutPlacement,
  surfaces = INFORM_SURFACES,
}: InformOutletProps): ReactElement {
  const { dismiss, resolution } = useInform()
  const context = useInformContext()

  const contentOf = (message: InformMessage): InformContent => resolveContent(message, context)

  const pick = (surface: InformSurface): InformMessage | null =>
    surfaces.includes(surface) ? (resolution[surface] as InformMessage | null) : null

  const banner = pick('banner')
  const dialog = pick('dialog')
  const spotlight = pick('spotlight')
  const flyouts = surfaces.includes('corner-flyout') ? resolution['corner-flyout'] : []

  return (
    <>
      {banner === null ? null : (
        <InformBanner
          {...contentOf(banner)}
          dismissable={banner.dismiss !== 'none'}
          onDismiss={() => {
            dismiss(banner.id)
          }}
          severity={banner.severity}
        />
      )}
      {dialog === null ? null : (
        <InformDialog
          {...contentOf(dialog)}
          dismissable={dialog.dismiss !== 'none'}
          onDismiss={() => {
            dismiss(dialog.id)
          }}
          open
          severity={dialog.severity}
        />
      )}
      {flyouts.length === 0 ? null : (
        <InformFlyoutStack offset={flyoutOffset} placement={flyoutPlacement}>
          {flyouts.map(message => (
            <InformCornerFlyout
              key={message.id}
              {...contentOf(message)}
              dismissable={message.dismiss !== 'none'}
              onDismiss={() => {
                dismiss(message.id)
              }}
              open
              severity={message.severity}
            />
          ))}
        </InformFlyoutStack>
      )}
      {spotlight === null || spotlight.anchor === undefined ? null : (
        <InformSpotlight
          {...contentOf(spotlight)}
          anchor={spotlight.anchor}
          onDismiss={() => {
            dismiss(spotlight.id)
          }}
          open
          severity={spotlight.severity}
        />
      )}
    </>
  )
}
