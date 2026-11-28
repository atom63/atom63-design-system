import { Button, UIProvider } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FolderPlus } from 'lucide-react'

import {
  inMain,
  landmarkParameters,
  phoneGlobals,
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
} from '../../story-matrix'
import { EmptyState } from './empty-state'

const meta = {
  title: 'Templates/Blocks/Empty state',
  component: EmptyState,
  parameters: landmarkParameters,
  decorators: [inMain],
} satisfies Meta<typeof EmptyState>

export default meta

type Story = StoryObj<typeof meta>

const args = {
  action: <Button variant="primary">New project</Button>,
  description: 'Projects group your invoices by client work. Create one to get started.',
  headingLevel: 2 as const,
  icon: <FolderPlus aria-hidden />,
  secondaryAction: <Button variant="outline">Import projects</Button>,
  title: 'No projects yet',
}

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

export const Tablet: Story = { args, globals: tabletGlobals }

export const Wide: Story = { args, globals: wideGlobals }

/* Nothing in the state is wider than the page, and no button label is cut off. */
const checkFits = (canvasElement: HTMLElement) => {
  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    throw new Error('The empty state overflows the page horizontally')
  }
  const frame = canvasElement.querySelector<HTMLElement>('[data-slot="empty"]')
  if (!frame) throw new Error('Expected the empty state')
  const box = frame.getBoundingClientRect()
  for (const element of frame.querySelectorAll<HTMLElement>(
    '[data-slot="empty-title"], [data-slot="empty-description"], button'
  )) {
    const rect = element.getBoundingClientRect()
    if (rect.left < box.left - 1 || rect.right > box.right + 1) {
      throw new Error(`"${element.textContent}" overflows the empty state`)
    }
    if (element.scrollWidth > element.clientWidth + 1) {
      throw new Error(`"${element.textContent}" is cut off`)
    }
  }
}

/* Two sentences with an unbroken URL, and long button labels that wrap onto their own rows. */
export const LongCopyPhone: Story = {
  args: {
    ...args,
    action: <Button variant="primary">Create your first client project</Button>,
    description:
      'Projects group the invoices you send for one piece of client work, such as Rechnungsempfängerverwaltung. Import them from https://billing.example.com/exports/projects-2026.csv or create one now.',
    secondaryAction: <Button variant="outline">Import projects from a spreadsheet</Button>,
    title: 'No client projects in this workspace yet',
  },
  globals: phoneGlobals,
  play: ({ canvasElement }) => checkFits(canvasElement),
}

/* A state the person cannot change: no action. */
export const NoAction: Story = {
  args: {
    ...args,
    action: undefined,
    description: 'There is no news for this workspace. New activity shows up here.',
    secondaryAction: undefined,
    title: 'Nothing new',
  },
  play: ({ canvasElement }) => {
    if (canvasElement.querySelector('button')) throw new Error('Expected no action')
  },
}

/* One next step and no alternative. */
export const SingleAction: Story = {
  args: { ...args, secondaryAction: undefined },
  play: ({ canvasElement }) => {
    if (canvasElement.querySelectorAll('button').length !== 1) {
      throw new Error('Expected one action')
    }
  },
}

/* Right to left with Arabic, then Chinese: the copy and the actions stay centred. */
export const RightToLeft: Story = {
  args,
  render: () => (
    <div className="flex flex-col gap-10">
      <UIProvider dir="rtl" lang="ar">
        <EmptyState
          action={<Button variant="primary">مشروع جديد</Button>}
          description="تجمع المشاريع فواتيرك حسب عمل العميل. أنشئ مشروعًا للبدء."
          icon={<FolderPlus aria-hidden />}
          secondaryAction={<Button variant="outline">استيراد المشاريع</Button>}
          title="لا توجد مشاريع بعد"
        />
      </UIProvider>
      <UIProvider lang="zh-CN">
        <EmptyState
          action={<Button variant="primary">新建项目</Button>}
          description="项目按客户工作归类你的发票。创建一个项目即可开始。"
          headingLevel={3}
          icon={<FolderPlus aria-hidden />}
          title="还没有项目"
        />
      </UIProvider>
    </div>
  ),
  play: ({ canvasElement }) => {
    const rtl = canvasElement.querySelector<HTMLElement>('[dir="rtl"] [data-slot="empty"]')
    const buttons = rtl?.querySelectorAll('button')
    const first = buttons?.[0]?.getBoundingClientRect()
    const second = buttons?.[1]?.getBoundingClientRect()
    if (!first || !second) throw new Error('Expected the RTL actions')
    if (first.top === second.top && first.left < second.left) {
      throw new Error('Under RTL the primary action should come first, on the right')
    }
  },
}

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <EmptyState {...props} />
    </ThemeMatrix>
  ),
}
