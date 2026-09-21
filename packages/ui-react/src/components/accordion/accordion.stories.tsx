import { accordionContract, themes } from '@atom63/ui-foundation'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Accordion',
  component: Accordion,
  decorators: [
    Story => (
      <div style={{ padding: 'clamp(16px, 6vw, 32px)', width: 'min(420px, 100%)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <Accordion collapsible defaultValue="a" type="single">
      <AccordionItem value="a">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It follows the WAI-ARIA accordion pattern out of the box.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Is it themed?</AccordionTrigger>
        <AccordionContent>
          Yes. Borders, highlights and focus rings read a63 semantics, so all four themes restyle it
          for free.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          The panel height animates open/closed and respects reduced motion.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const PlusMinus: Story = {
  render: () => (
    <Accordion type="multiple">
      <AccordionItem value="a">
        <AccordionTrigger icon="plus-minus">Shipping</AccordionTrigger>
        <AccordionContent>Ships in 2–3 business days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger icon="plus-minus">Returns</AccordionTrigger>
        <AccordionContent>Free returns within 30 days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

function Demo() {
  return (
    <Accordion collapsible defaultValue="a" type="single">
      <AccordionItem value="a">
        <AccordionTrigger>Is it themed?</AccordionTrigger>
        <AccordionContent>Borders, highlights and focus rings read a63 semantics.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes — it follows the WAI-ARIA accordion pattern.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'flex-start',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ flex: 1 }}>
                <Demo />
              </div>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <UIProvider designLanguage="web" input="pointer">
        <div style={{ background: 'var(--a63-surface-panel)', padding: '1rem' }}>
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>web / pointer</span>
          <Demo />
        </div>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <div style={{ background: 'var(--a63-surface-panel)', padding: '1rem' }}>
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>ios / touch</span>
          <Demo />
        </div>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <div style={{ background: 'var(--a63-surface-panel)', padding: '1rem' }}>
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>
            extension / compact
          </span>
          <Demo />
        </div>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(accordionContract, null, 2)}
    </pre>
  ),
}
