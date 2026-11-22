import { Badge, UIProvider } from '@atom63/ui-react'
import { Container, SectionHeader, type SectionHeaderVariant } from '@atom63/ui-react/layout'
import type { Meta, StoryObj } from '@storybook/react-vite'

const variants: SectionHeaderVariant[] = [
  'display',
  'primary',
  'secondary',
  'muted',
  'subtle',
  'label',
]

/* Every variant at its default heading level; `display` grows at 768px. */
function Variants() {
  return (
    <Container gap={10} maxWidth="wide">
      {variants.map(variant => (
        <SectionHeader
          description="A one-line description that says what the section holds."
          key={variant}
          title={`${variant} title`}
          variant={variant}
        />
      ))}
    </Container>
  )
}

const meta = {
  title: 'UI React/SectionHeader',
  component: Variants,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Variants>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: { viewport: { value: 'a63-phone', isRotated: false } } }

export const Tablet: Story = { globals: { viewport: { value: 'a63-tablet', isRotated: false } } }

export const Wide: Story = { globals: { viewport: { value: 'a63-wide', isRotated: false } } }

/* A title with a count badge and a description with a link: the heading keeps the badge inside. */
export const RichContent: Story = {
  render: () => (
    <Container maxWidth="wide">
      <SectionHeader
        description={
          <>
            Invoices past their due date. <a href="#reminders">Send reminders</a>
          </>
        }
        title={
          <span className="inline-flex items-center gap-2">
            Overdue <Badge variant="error">3</Badge>
          </span>
        }
        variant="secondary"
      />
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const heading = canvasElement.querySelector('h2')
    if (!heading?.querySelector('[data-slot="badge"]')) {
      throw new Error('Expected the badge inside the h2')
    }
  },
}

/* A long title wraps and balances; CJK titles keep normal tracking in the label variant. */
export const LongAndCjk: Story = {
  render: () => (
    <Container gap={10} maxWidth="wide">
      <SectionHeader
        description="Every invoice that was issued in the last financial year, grouped by customer and sorted by the amount still owed, so the largest balances come first."
        title="Outstanding invoices across every customer account for the last financial year"
        variant="primary"
      />
      <div lang="zh">
        <SectionHeader description="管理通知和隐私偏好。" title="账户设置" variant="label" />
      </div>
      <div lang="ja">
        <SectionHeader
          description="通知とプライバシーの設定。"
          title="アカウント設定"
          variant="label"
        />
      </div>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector<HTMLElement>('[lang="zh"] p')
    if (!label) throw new Error('Expected the Chinese label title')
    const spacing = getComputedStyle(label).letterSpacing
    if (spacing !== 'normal' && spacing !== '0px') {
      throw new Error(`Expected normal tracking for Chinese, got ${spacing}`)
    }
  },
}

/* Under dir="rtl", start is on the right and end on the left. */
export const RightToLeft: Story = {
  render: () => (
    <UIProvider dir="rtl" lang="ar">
      <Container gap={10} maxWidth="wide">
        <SectionHeader
          description="يبدأ من الجهة اليمنى."
          title="محاذاة البداية"
          variant="secondary"
        />
        <SectionHeader
          align="center"
          description="في المنتصف."
          title="محاذاة الوسط"
          variant="secondary"
        />
        <SectionHeader
          align="end"
          description="ينتهي عند الجهة اليسرى."
          title="محاذاة النهاية"
          variant="secondary"
        />
      </Container>
    </UIProvider>
  ),
  play: async ({ canvasElement }) => {
    const headers = canvasElement.querySelectorAll<HTMLElement>('[data-slot="section-header"]')
    const start = headers[0]?.querySelector('h2')?.getBoundingClientRect()
    const end = headers[2]?.querySelector('h2')?.getBoundingClientRect()
    const frame = headers[0]?.getBoundingClientRect()
    if (!start || !end || !frame) throw new Error('Expected three headers')
    if (Math.abs(start.right - frame.right) > 1) throw new Error('Expected start on the right')
    if (Math.abs(end.left - frame.left) > 1) throw new Error('Expected end on the left')
  },
}
