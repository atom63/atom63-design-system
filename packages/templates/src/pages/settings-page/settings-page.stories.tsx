import { UIProvider } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  checkSafeArea,
  compactGlobals,
  landmarkParameters,
  phoneGlobals,
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
} from '../../story-matrix'
import { SettingsPage } from './settings-page'

const meta = {
  title: 'Templates/Pages/Settings page',
  component: SettingsPage,
  parameters: { layout: 'fullscreen', ...landmarkParameters },
} satisfies Meta<typeof SettingsPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

/* The shell's top bar and page wrapper own the phone's safe-area insets. */
export const Phone: Story = {
  globals: phoneGlobals,
  play: ({ canvasElement }) =>
    checkSafeArea(canvasElement, {
      'main > header': { paddingInlineStart: '47px', paddingTop: '29px' },
      'main > header + div': { paddingBottom: '63px', paddingInlineStart: '47px' },
    }),
}

/* From `md` the sidebar rail owns the inline-start inset. */
export const Tablet: Story = {
  globals: tabletGlobals,
  play: ({ canvasElement }) =>
    checkSafeArea(canvasElement, {
      '[data-slot="sidebar-container"]': { paddingInlineStart: '47px' },
    }),
}

export const Compact: Story = { globals: compactGlobals }

export const Wide: Story = { globals: wideGlobals }

/*
 * A save that fails: the switch goes back to its last saved value and the row
 * says what happened, announced as an alert. Toggling again retries.
 */
export const SaveFailed: Story = {
  args: { saveSetting: () => Promise.reject(new Error('Offline')) },
  play: async ({ canvasElement }) => {
    const label = [...canvasElement.querySelectorAll('label')].find(
      element => element.textContent === 'Invoice paid'
    )
    const toggle = label ? canvasElement.querySelector(`[aria-labelledby="${label.id}"]`) : null
    if (!(toggle instanceof HTMLElement)) throw new Error('Expected the Invoice paid switch')
    toggle.click()
    await new Promise(resolve => setTimeout(resolve, 100))
    if (toggle.getAttribute('aria-checked') !== 'false')
      throw new Error('The switch did not go back after the failed save')
    if (!canvasElement.querySelector('[role="alert"]')?.textContent?.includes("Couldn't save"))
      throw new Error('The failed save is not announced')
  },
}

/*
 * A save that has not settled: the switch shows the new value and the row
 * shows a spinner and "Saving…" until saveSetting resolves (here, never).
 */
export const Saving: Story = {
  args: { saveSetting: () => new Promise<void>(() => undefined) },
  play: async ({ canvasElement }) => {
    const label = [...canvasElement.querySelectorAll('label')].find(
      element => element.textContent === 'Invoice paid'
    )
    const toggle = label ? canvasElement.querySelector(`[aria-labelledby="${label.id}"]`) : null
    if (!(toggle instanceof HTMLElement)) throw new Error('Expected the Invoice paid switch')
    toggle.click()
    await new Promise(resolve => setTimeout(resolve, 100))
    if (
      toggle.getAttribute('aria-checked') !== 'true' ||
      toggle.getAttribute('aria-busy') !== 'true'
    )
      throw new Error('The saving switch does not show the new value and wait')
    const detail = document.getElementById(toggle.getAttribute('aria-describedby') ?? '')
    if (!detail?.textContent?.endsWith('Saving…') || !detail.querySelector('[data-slot="spinner"]'))
      throw new Error('The saving row does not show a spinner and "Saving…"')
  },
}

/* A button names itself: the danger-zone row's label is text, not a <label> for nothing. */
export const DangerZone: Story = {
  play: ({ canvasElement }) => {
    const button = [...canvasElement.querySelectorAll('button')].find(
      element => element.textContent === 'Delete'
    )
    if (!button) throw new Error('Expected the Delete button')
    const label = document.getElementById(button.getAttribute('aria-labelledby') ?? '')
    if (label?.textContent !== 'Delete workspace' || label.tagName === 'LABEL')
      throw new Error('The Delete button is not named by its row label as plain text')
    for (const element of canvasElement.querySelectorAll('label[for]')) {
      if (!document.getElementById(element.getAttribute('for') ?? ''))
        throw new Error(`"${element.textContent}" is a <label> for no control`)
    }
  },
}

/* Right-to-left: the rail on the right, the content beside it. */
export const RightToLeft: Story = {
  render: () => (
    <UIProvider dir="rtl">
      <SettingsPage />
    </UIProvider>
  ),
  play: ({ canvasElement }) => {
    const rail = canvasElement.querySelector('[data-slot="sidebar-container"]')
    const main = canvasElement.querySelector('main')
    if (!rail || !main) throw new Error('Expected the rail and the main landmark')
    if (main.getBoundingClientRect().right > rail.getBoundingClientRect().left + 1)
      throw new Error('The rail covers the content under RTL')
  },
}

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix frame>
      <SettingsPage />
    </ThemeMatrix>
  ),
}
