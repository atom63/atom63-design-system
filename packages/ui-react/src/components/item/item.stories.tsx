import { itemContract, itemTones, themes } from '@atom63/ui-foundation'
import { Bookmark, ChevronRight } from 'lucide-react'
import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  Switch,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Item',
  component: Item,
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <div style={{ width: 'min(360px, 100%)' }}>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Bookmark aria-hidden />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Starred project</ItemTitle>
          <ItemDescription>Last edited 2 hours ago by you.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" type="button" variant="secondary">
            Open
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 360 }}>
      {(['default', 'outline', 'muted'] as const).map(variant => (
        <Item key={variant} variant={variant}>
          <ItemContent>
            <ItemTitle>{variant}</ItemTitle>
            <ItemDescription>The {variant} chrome.</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
}

/* A grouped list with separators; sizes tighten the row density. */
export const Group: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <ItemGroup>
        <Item size="sm" variant="outline">
          <ItemContent>
            <ItemTitle>First</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item size="sm" variant="outline">
          <ItemContent>
            <ItemTitle>Second</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
}

/* A clickable row via the render prop (renders an <a>, gets a muted hover). */
export const AsLink: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Item
        render={
          <a href="#item-link">
            <ItemContent>
              <ItemTitle>Clickable row</ItemTitle>
              <ItemDescription>Renders as an anchor.</ItemDescription>
            </ItemContent>
          </a>
        }
        variant="outline"
      />
    </div>
  ),
}

/* aria-current marks the row for the page the user is on; data-selected marks
   a picked row that is not a link. Both take the selected surface. */
export const SelectedAndCurrent: Story = {
  render: () => (
    <ItemGroup style={{ width: 360 }}>
      {['Inbox', 'My issues', 'Projects'].map(label => (
        <Item
          key={label}
          render={
            <a aria-current={label === 'My issues' ? 'page' : undefined} href={`#${label}`}>
              <ItemContent>
                <ItemTitle>{label}</ItemTitle>
              </ItemContent>
            </a>
          }
          size="xs"
        />
      ))}
      <Item data-selected="" size="xs" variant="muted">
        <ItemContent>
          <ItemTitle>Selected row</ItemTitle>
          <ItemDescription>Not a link: data-selected.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
}

/* tone sets how a selected or current row is coloured: neutral (the default)
   is a muted fill with primary text, accent is the opt-in primary wash. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {itemTones.map(tone => (
        <ItemGroup key={tone} style={{ width: 240 }}>
          {['Inbox', 'My issues', 'Projects'].map(label => (
            <Item
              key={label}
              render={
                <a aria-current={label === 'My issues' ? 'page' : undefined} href={`#${label}`}>
                  <ItemContent>
                    <ItemTitle>{label}</ItemTitle>
                  </ItemContent>
                </a>
              }
              size="xs"
              tone={tone}
            />
          ))}
          <Item data-selected="" size="xs" tone={tone}>
            <ItemContent>
              <ItemTitle>Selected row</ItemTitle>
              <ItemDescription>tone=&quot;{tone}&quot;</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      ))}
    </div>
  ),
}

/* variant="inset": the grouped settings list, each row a label with its value
   in bold and a chevron (the web side of iOS AtomValueRow). */
export const InsetGroup: Story = {
  render: () => (
    <div style={{ background: 'var(--a63-surface-page)', padding: 16, width: 360 }}>
      <ItemGroup variant="inset">
        {[
          ['Units of measure', 'Imperial'],
          ['Active energy', 'kcal'],
          ['Start week on', 'Sunday'],
        ].map(([label, value]) => (
          <Item
            key={label}
            render={
              <a href={`#${label}`}>
                <ItemContent>
                  <ItemTitle>{label}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <strong>{value}</strong>
                  <ChevronRight aria-hidden />
                </ItemActions>
              </a>
            }
            size="sm"
          />
        ))}
      </ItemGroup>
    </div>
  ),
}

/* surface="muted": grey cards on a white page (bg-card), the other common
   grouped-settings look. Inside the phone form factor, as AppView layout="phone"
   draws it, the switch takes the iOS 26 shape, rows are 52px tall and the card
   has an 18px corner. */
export const InsetGroupMuted: Story = {
  render: () => (
    <div
      data-a63-form-factor="phone"
      style={{
        background: 'var(--a63-surface-panel)',
        display: 'grid',
        gap: 24,
        padding: 16,
        width: 'min(390px, 100%)',
      }}
    >
      <ItemGroup surface="muted" variant="inset">
        {[
          ['Units of measure', 'Imperial'],
          ['Start week on', 'Sunday'],
        ].map(([label, value]) => (
          <Item
            key={label}
            render={
              <a href={`#${label}`}>
                <ItemContent>
                  <ItemTitle>{label}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <strong>{value}</strong>
                  <ChevronRight aria-hidden />
                </ItemActions>
              </a>
            }
            size="sm"
          />
        ))}
      </ItemGroup>
      <ItemGroup surface="muted" variant="inset">
        {(
          [
            ['Include steps', true],
            ['Sync with Health', false],
          ] as const
        ).map(([label, checked]) => (
          <Item key={label} size="sm">
            <ItemContent>
              <ItemTitle>{label}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Switch aria-label={label} defaultChecked={checked} />
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  ),
}

/* Every size tightens the row density (md · sm · xs). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 360 }}>
      {(['md', 'sm', 'xs'] as const).map(size => (
        <Item key={size} size={size} variant="outline">
          <ItemMedia variant="icon">
            <Bookmark aria-hidden />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{size}</ItemTitle>
            <ItemDescription>The {size} row density.</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
}

/* Renders a representative Item across all 4 DS themes × light/dark. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0.75rem',
                background: 'var(--a63-surface-panel)',
                color: 'var(--a63-text-primary)',
                borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ width: 320 }}>
                <Item variant="outline">
                  <ItemMedia variant="icon">
                    <Bookmark aria-hidden />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Starred project</ItemTitle>
                    <ItemDescription>Last edited 2 hours ago.</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button size="sm" type="button" variant="secondary">
                      Open
                    </Button>
                  </ItemActions>
                </Item>
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
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointItem label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointItem label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointItem label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(itemContract, null, 2)}
    </pre>
  ),
}

function EndpointItem({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        padding: 12,
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>{label}</span>
      <div style={{ width: 320 }}>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Bookmark aria-hidden />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Starred project</ItemTitle>
            <ItemDescription>Last edited 2 hours ago.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" type="button" variant="secondary">
              Open
            </Button>
          </ItemActions>
        </Item>
      </div>
    </div>
  )
}

function LinkRows({ disabled }: { disabled?: string }) {
  return (
    <ItemGroup style={{ width: 360 }}>
      {['Profile', 'Billing', 'Security'].map(label => (
        <Item
          key={label}
          render={
            label === disabled ? (
              <div aria-disabled="true" role="link">
                <ItemContent>
                  <ItemTitle>{label}</ItemTitle>
                  <ItemDescription>Unavailable on this plan.</ItemDescription>
                </ItemContent>
              </div>
            ) : (
              <a href={`#${label}`}>
                <ItemContent>
                  <ItemTitle>{label}</ItemTitle>
                  <ItemDescription>Manage your {label.toLowerCase()} settings.</ItemDescription>
                </ItemContent>
              </a>
            )
          }
          size="sm"
          variant="outline"
        />
      ))}
    </ItemGroup>
  )
}

/** The first row under the pointer takes half the selected fill. */
export const Hover: Story = {
  render: () => <LinkRows />,
  parameters: { visualState: { hover: 'a.a63-Item' } },
}

/** Keyboard focus draws the focus ring around the first row. */
export const FocusVisible: Story = {
  render: () => <LinkRows />,
  parameters: { visualState: { focusVisible: 'a.a63-Item' } },
}

/** A disabled row (`aria-disabled`, `data-disabled` or `:disabled`) fades its content and
 *  takes no hover. */
export const Disabled: Story = {
  render: () => <LinkRows disabled="Billing" />,
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>('[aria-disabled="true"]')
    const content = row?.firstElementChild
    if (!content || Number(getComputedStyle(content).opacity) >= 1) {
      throw new Error('Expected the disabled row to be drawn faded')
    }
  },
}

/** ItemGroup is a list: each Item is a list item, and a link row is wrapped in one. */
export const ListSemantics: Story = {
  render: () => <LinkRows />,
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('[data-slot="item-group"]')
    if (list?.getAttribute('role') !== 'list') throw new Error('Expected role="list"')
    const items = list.querySelectorAll(':scope > [role="listitem"]')
    if (items.length !== 3) throw new Error(`Expected 3 list items, got ${items.length}`)
  },
}

/** On a touchscreen an interactive row is at least 44px tall, even at size xs. */
export const Touch: Story = {
  render: () => (
    <UIProvider input="touch">
      <ItemGroup style={{ width: 360 }}>
        {['Inbox', 'Drafts'].map(label => (
          <Item key={label} render={<a href={`#${label}`}>{label}</a>} size="xs" />
        ))}
      </ItemGroup>
    </UIProvider>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>('a.a63-Item')
    if (!row || row.getBoundingClientRect().height < 44) {
      throw new Error('Expected a touch row at least 44px tall')
    }
  },
}

/** A long title clamps to one line, a long description to two, and an unbroken string
 *  wraps inside the row instead of pushing the actions out. */
export const LongContent: Story = {
  render: () => (
    <ItemGroup style={{ width: 320 }}>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Quarterly revenue report for the enterprise accounts team</ItemTitle>
          <ItemDescription>
            Shared with finance, sales leadership and the regional managers, who each review the
            numbers for their own territory before the board meeting at the end of the month.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Open
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Webhook</ItemTitle>
          <ItemDescription>
            https://hooks.example.com/services/T000/B000/XXXXXXXXXXXXXXXXXXXX
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Copy
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    for (const row of canvasElement.querySelectorAll<HTMLElement>('.a63-Item')) {
      const actions = row.querySelector('.a63-ItemActions')
      if (!actions) throw new Error('Expected actions')
      if (actions.getBoundingClientRect().right > row.getBoundingClientRect().right + 1) {
        throw new Error('Expected the actions to stay inside the row')
      }
    }
    const title = canvasElement.querySelector<HTMLElement>('.a63-ItemTitle')
    if (!title || title.scrollHeight <= title.clientHeight) {
      throw new Error('Expected the long title clamped to one line')
    }
  },
}

/** Under dir="rtl" media sits at the inline start (right) and actions at the end (left). */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" lang="ar" style={{ width: 360 }}>
      <ItemGroup>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Bookmark aria-hidden />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>المحفوظات</ItemTitle>
            <ItemDescription>العناصر التي حفظتها للقراءة لاحقًا.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRight aria-hidden style={{ transform: 'scaleX(-1)' }} />
          </ItemActions>
        </Item>
      </ItemGroup>
    </div>
  ),
}

/** Forced colors drop the selected fill; selected and current rows draw a Highlight border. */
export const ForcedColors: Story = {
  render: () => (
    <ItemGroup style={{ width: 360 }}>
      <Item
        render={
          <a aria-current="page" href="#current">
            Current page
          </a>
        }
        size="xs"
      />
      <Item render={<a href="#other">Another page</a>} size="xs" />
      <Item data-selected="" size="xs">
        <ItemContent>
          <ItemTitle>Selected row</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
}
