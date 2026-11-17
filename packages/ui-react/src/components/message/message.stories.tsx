import {
  messageDeliveryStates,
  messageDirections,
  messagePositions,
  themes,
} from '@atom63/ui-foundation'
import {
  Avatar,
  AvatarFallback,
  Message,
  MessageEvent,
  MessageList,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PhoneMissed } from 'lucide-react'

const meta = {
  title: 'UI React/Message',
  component: Message,
  argTypes: {
    direction: { control: 'inline-radio', options: messageDirections },
    position: { control: 'inline-radio', options: messagePositions },
    status: { control: 'select', options: [undefined, ...messageDeliveryStates] },
  },
  args: {
    children: 'Are we still on for Saturday?',
    direction: 'incoming',
    label: 'Ada',
    position: 'single',
    time: '12:04',
  },
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

const ada = (
  <Avatar size="sm">
    <AvatarFallback>AD</AvatarFallback>
  </Avatar>
)

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 390, margin: '0 auto' }}>{children}</div>
)

export const Playground: Story = {
  render: args => (
    <Frame>
      <MessageList aria-label="Messages with Ada">
        <Message {...args} />
      </MessageList>
    </Frame>
  ),
}

/* A thread: runs of consecutive messages join at their shared corners, and only the last shows the avatar and the tail. */
export const Thread: Story = {
  render: () => (
    <Frame>
      <MessageList aria-label="Messages with Ada">
        <MessageEvent>Today</MessageEvent>
        <Message avatar={ada} label="Ada" position="first" time="12:01">
          Hey!
        </Message>
        <Message avatar={ada} label="Ada" position="middle" time="12:01">
          Are we still on for Saturday?
        </Message>
        <Message avatar={ada} label="Ada" position="last" time="12:02">
          I can bring the tent.
        </Message>
        <Message direction="outgoing" label="You" position="first" status="read" time="12:04">
          Yes, 9am at the station
        </Message>
        <Message direction="outgoing" label="You" position="last" status="delivered" time="12:04">
          Bring snacks too 🙂
        </Message>
        <MessageEvent icon={<PhoneMissed />}>Missed voice call · 12:10</MessageEvent>
        <Message avatar={ada} label="Ada" time="12:12">
          Sorry, was driving. Call you later?
        </Message>
        <Message direction="outgoing" label="You" status="sending" time="12:13">
          Sure
        </Message>
      </MessageList>
    </Frame>
  ),
}

/* Every delivery status of an outgoing message, each named for assistive technology. */
export const DeliveryStates: Story = {
  render: () => (
    <Frame>
      <MessageList aria-label="Delivery states">
        {messageDeliveryStates.map(status => (
          <Message direction="outgoing" key={status} label="You" status={status} time="12:04">
            {status}
          </Message>
        ))}
      </MessageList>
    </Frame>
  ),
}

/* A photo message: the media takes the bubble's corners, with an optional caption. */
export const Media: Story = {
  render: () => (
    <Frame>
      <MessageList aria-label="Photos">
        <Message
          avatar={ada}
          label="Ada"
          media={
            <div
              aria-label="Photo of the campsite"
              role="img"
              style={{ aspectRatio: '4 / 3', background: 'var(--a63-category-teal)' }}
            />
          }
          time="12:20"
        >
          The view from the campsite
        </Message>
        <Message
          direction="outgoing"
          label="You"
          media={
            <div
              aria-label="Photo of the trail"
              role="img"
              style={{ aspectRatio: '1', background: 'var(--a63-category-green)' }}
            />
          }
          status="read"
          time="12:21"
        />
      </MessageList>
    </Frame>
  ),
}

/* A long word or link wraps inside the bubble instead of widening the thread. */
export const LongContent: Story = {
  render: () => (
    <Frame>
      <MessageList aria-label="Long content">
        <Message label="Ada" time="12:30">
          https://example.com/a/very/long/link/that/should/wrap/inside/the/bubble/without/overflowing
        </Message>
        <Message direction="outgoing" label="You" status="read" time="12:31">
          Got it — I will read the whole thing tonight and send you my notes before we leave on
          Saturday morning.
        </Message>
      </MessageList>
    </Frame>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div style={{ background: 'var(--a63-surface-page)', padding: '0.75rem' }}>
              <MessageList aria-label={`${theme} ${mode}`}>
                <Message label="Ada" time="12:04">
                  {theme} / {mode}
                </Message>
                <Message direction="outgoing" label="You" status="read" time="12:05">
                  Outgoing in the accent
                </Message>
              </MessageList>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}
