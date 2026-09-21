import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './drawer'

describe('Drawer', () => {
  it('renders content, title + description when open', () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detail</DrawerTitle>
            <DrawerDescription>A sheet.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
          <DrawerFooter>Footer</DrawerFooter>
        </DrawerContent>
      </Drawer>
    )

    // Base UI renders the popup into a portal on the document body.
    expect(screen.getByText('Detail')).toBeInTheDocument()
    expect(screen.getByText('A sheet.')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()

    const content = document.querySelector('[data-slot="drawer-content"]')
    expect(content).not.toBeNull()
    expect(content).toHaveClass('a63-Drawer-content')

    // Title/description map to the a63 recipe classes + slots.
    expect(document.querySelector('[data-slot="drawer-title"]')).toHaveClass('a63-Drawer-title')
    expect(document.querySelector('[data-slot="drawer-handle"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="drawer-body"]')).toHaveClass('a63-Drawer-body')
    expect(document.querySelector('[data-slot="drawer-footer"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="drawer-footer"]')).toHaveAttribute(
      'data-variant',
      'default'
    )
  })

  it('does not render content when closed', () => {
    render(
      <Drawer open={false}>
        <DrawerContent>
          <DrawerTitle>Hidden</DrawerTitle>
        </DrawerContent>
      </Drawer>
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })
})
