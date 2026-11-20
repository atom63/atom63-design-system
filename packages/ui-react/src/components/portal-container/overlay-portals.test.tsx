import { render, waitFor } from '@testing-library/react'
import type * as React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { AlertDialog, AlertDialogPopup, AlertDialogTitle } from '../alert-dialog/alert-dialog'
import { Autocomplete, AutocompleteInput, AutocompletePopup } from '../autocomplete/autocomplete'
import { CommandDialog, CommandDialogPopup } from '../command/command'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../context-menu/context-menu'
import { Dialog, DialogPopup, DialogTitle } from '../dialog/dialog'
import { Drawer, DrawerContent, DrawerTitle } from '../drawer/drawer'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../navigation-menu/navigation-menu'
import { PortalContainerProvider } from './portal-container'

// Base UI waits for animations before measuring; jsdom has no Web Animations API.
Element.prototype.getAnimations ??= () => []

/*
 * Every package overlay renders into the PortalContainerProvider's node (a
 * shadow root or a themed region), not document.body. One row per overlay family
 * that portals.
 */
const overlays: [string, React.ReactElement][] = [
  [
    'Dialog',
    <Dialog key="dialog" open>
      <DialogPopup>
        <DialogTitle>Portalled overlay</DialogTitle>
      </DialogPopup>
    </Dialog>,
  ],
  [
    'AlertDialog',
    <AlertDialog key="alert-dialog" open>
      <AlertDialogPopup>
        <AlertDialogTitle>Portalled overlay</AlertDialogTitle>
      </AlertDialogPopup>
    </AlertDialog>,
  ],
  [
    'Drawer',
    <Drawer key="drawer" open>
      <DrawerContent>
        <DrawerTitle>Portalled overlay</DrawerTitle>
      </DrawerContent>
    </Drawer>,
  ],
  [
    'CommandDialog',
    <CommandDialog key="command" open>
      <CommandDialogPopup>Portalled overlay</CommandDialogPopup>
    </CommandDialog>,
  ],
  [
    'ContextMenu',
    <ContextMenu key="context-menu" open>
      <ContextMenuTrigger>Target</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Portalled overlay</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  ],
  [
    'NavigationMenu',
    <NavigationMenu key="navigation-menu" value="products">
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#a">Portalled overlay</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  ],
  [
    'Autocomplete',
    <Autocomplete key="autocomplete" items={['Apple']} open>
      <AutocompleteInput aria-label="Search fruit" />
      <AutocompletePopup>Portalled overlay</AutocompletePopup>
    </Autocomplete>,
  ],
]

describe('overlays honour PortalContainerProvider', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it.each(overlays)('%s portals into the provided container', async (_name, overlay) => {
    const portalHost = document.createElement('div')
    document.body.append(portalHost)

    render(<PortalContainerProvider container={portalHost}>{overlay}</PortalContainerProvider>)

    await waitFor(() => expect(portalHost).toHaveTextContent('Portalled overlay'))
  })
})
