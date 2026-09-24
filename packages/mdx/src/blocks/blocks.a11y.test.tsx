import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Accordion } from './accordion'
import { Callout } from './callout'
import { StatCard } from './stat-card'
import { Steps } from './steps'
import { Tabs } from './tabs'

/**
 * Lightweight accessibility automation (P5). Runs axe-core in the existing
 * jsdom `test` job (0 extra CI). Each case renders a representative block with
 * realistic content and asserts zero axe violations.
 *
 * These guard against regressions in OUR markup (roles, labels, landmark
 * structure). A genuine axe finding in one of our blocks is a real bug — do not
 * suppress it; fix the block instead.
 */
describe('block accessibility (axe)', () => {
  it('Callout has no violations', async () => {
    const { container } = render(
      <Callout type="warning">
        <Callout.Title>Heads up</Callout.Title>
        <Callout.Body>
          This action is irreversible. Make sure you have a backup before you continue.
        </Callout.Body>
        <Callout.Actions>
          <button type="button">Dismiss</button>
        </Callout.Actions>
      </Callout>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Tabs has no violations', async () => {
    const { container } = render(
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="install">Install</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview">A short overview of the feature.</Tabs.Panel>
        <Tabs.Panel value="install">Installation instructions go here.</Tabs.Panel>
      </Tabs>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Accordion has no violations', async () => {
    const { container } = render(
      <Accordion type="single" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Trigger>What is included?</Accordion.Trigger>
          <Accordion.Content>Everything you need to get started.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger>How do I upgrade?</Accordion.Trigger>
          <Accordion.Content>Run the upgrade command in your terminal.</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Steps has no violations', async () => {
    const { container } = render(
      <Steps>
        <Steps.Step title="Install">Run the installer from the command line.</Steps.Step>
        <Steps.Step title="Configure">Edit the generated config file.</Steps.Step>
        <Steps.Step title="Launch">Start the development server.</Steps.Step>
      </Steps>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('StatCard has no violations', async () => {
    const { container } = render(
      <StatCard label="Monthly revenue" value="$1.2M" change="+12%" trend="up" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
