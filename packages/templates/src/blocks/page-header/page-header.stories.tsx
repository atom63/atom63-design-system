import { Button, UIProvider } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Download, Plus } from 'lucide-react'

import {
  inMain,
  landmarkParameters,
  phoneGlobals,
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
} from '../../story-matrix'
import { PageHeader } from './page-header'

const meta = {
  title: 'Templates/Blocks/Page header',
  component: PageHeader,
  parameters: landmarkParameters,
  decorators: [inMain],
} satisfies Meta<typeof PageHeader>

export default meta

type Story = StoryObj<typeof meta>

const args = {
  actions: (
    <>
      <Button variant="outline">
        <Download aria-hidden />
        Export
      </Button>
      <Button variant="primary">
        <Plus aria-hidden />
        New invoice
      </Button>
    </>
  ),
  description: 'Track what customers owe and what has been paid.',
  title: 'Invoices',
}

export const Desktop: Story = { args }

/* Checks that the actions keep their width and stay on the title's row. */
const checkActionsBeside = (canvasElement: HTMLElement) => {
  const header = canvasElement.querySelector('header')
  const title = header?.querySelector('h1')
  const actions = header?.lastElementChild
  if (!header || !title || !(actions instanceof HTMLElement))
    throw new Error('Expected a header with a title and actions')
  const headerBox = header.getBoundingClientRect()
  const actionsBox = actions.getBoundingClientRect()
  if (actionsBox.right > headerBox.right + 1 || actionsBox.left < headerBox.left - 1)
    throw new Error('The actions overflow the header')
  if (actions.scrollWidth > actions.clientWidth + 1) throw new Error('The actions are squeezed')
}

/* From 640px the actions share the title's row, at its inline end. */
const checkActionsRow = (canvasElement: HTMLElement) => {
  checkActionsBeside(canvasElement)
  const header = canvasElement.querySelector('header')
  const title = header?.querySelector('h1')
  const actions = header?.lastElementChild
  if (!title || !actions) throw new Error('Expected a title and actions')
  if (actions.getBoundingClientRect().left < title.getBoundingClientRect().right)
    throw new Error('Expected the actions beside the title, not under it')
}

/* A long title and description wrap in their column; the actions keep their size. */
export const LongTitle: Story = {
  args: {
    ...args,
    description:
      'Every invoice sent to customers in the Northwind, Summit and Contoso regions this quarter, with what is still owed and what has been paid in full.',
    title: 'Invoices for every customer in every region this quarter',
  },
  play: ({ canvasElement }) => checkActionsBeside(canvasElement),
}

/* At 390px the long title takes the full width and the actions stack under it. */
export const LongTitlePhone: Story = {
  args: LongTitle.args,
  globals: phoneGlobals,
  play: ({ canvasElement }) => checkActionsBeside(canvasElement),
}

export const NoDescription: Story = { args: { ...args, description: undefined } }

/* Right-to-left with Arabic, then Chinese: the actions sit at the inline end. */
export const RightToLeft: Story = {
  args,
  render: () => (
    <div className="flex flex-col gap-10">
      <UIProvider dir="rtl" lang="ar">
        <PageHeader
          actions={
            <>
              <Button variant="outline">
                <Download aria-hidden />
                تصدير
              </Button>
              <Button variant="primary">
                <Plus aria-hidden />
                فاتورة جديدة
              </Button>
            </>
          }
          description="تابع ما يدين به العملاء وما تم دفعه."
          title="الفواتير"
        />
      </UIProvider>
      <UIProvider lang="zh-CN">
        <PageHeader
          actions={<Button variant="primary">新建发票</Button>}
          description="跟踪客户欠款和已付款项。"
          title="发票"
        />
      </UIProvider>
    </div>
  ),
  play: ({ canvasElement }) => {
    const header = canvasElement.querySelector('[dir="rtl"] header')
    const title = header?.querySelector('h1')
    const actions = header?.lastElementChild
    if (!header || !title || !actions) throw new Error('Expected the RTL header')
    if (
      window.innerWidth >= 640 &&
      actions.getBoundingClientRect().right > title.getBoundingClientRect().left
    )
      throw new Error('Under RTL the actions should sit to the left of the title')
  },
}

export const Phone: Story = { args, globals: phoneGlobals }

/* 768px: past the 640px switch, so the actions sit on the title's row. */
export const Tablet: Story = {
  args,
  globals: tabletGlobals,
  play: ({ canvasElement }) => checkActionsRow(canvasElement),
}

export const Wide: Story = {
  args,
  globals: wideGlobals,
  play: ({ canvasElement }) => checkActionsRow(canvasElement),
}

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <PageHeader {...props} />
    </ThemeMatrix>
  ),
}
