import { chatMessageAppearances, chatMessageRoles } from '@atom63/ui-foundation'
import {
  Avatar,
  AvatarFallback,
  Button,
  ChatMessage,
  ChatMessageList,
  ChatTypingIndicator,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Copy, RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'

import { ThemeMatrix } from '../story-probes'

const meta = {
  title: 'UI React/ChatMessage',
  component: ChatMessage,
  argTypes: {
    appearance: { control: 'inline-radio', options: chatMessageAppearances },
    from: { control: 'inline-radio', options: chatMessageRoles },
  },
  args: {
    appearance: 'plain',
    children:
      'Your spending on restaurants is up 18% this month, mostly from three weekend dinners.',
    from: 'assistant',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessage>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const assistantAvatar = (
  <Avatar size="sm">
    <AvatarFallback>
      <Sparkles aria-hidden />
    </AvatarFallback>
  </Avatar>
)

const messageActions = (
  <>
    <Button aria-label="Copy" size="icon-xs" variant="ghost">
      <Copy aria-hidden />
    </Button>
    <Button aria-label="Good response" size="icon-xs" variant="ghost">
      <ThumbsUp aria-hidden />
    </Button>
    <Button aria-label="Bad response" size="icon-xs" variant="ghost">
      <ThumbsDown aria-hidden />
    </Button>
    <Button aria-label="Regenerate" size="icon-xs" variant="ghost">
      <RefreshCw aria-hidden />
    </Button>
  </>
)

/* A short exchange: the user's bubble on the trailing side, the assistant's
   reply as plain text with an avatar and an actions row, then the typing dots
   while the next reply is prepared. */
export const Conversation: Story = {
  render: () => (
    <ChatMessageList aria-label="Conversation">
      <ChatMessage from="user">Why did I spend more this month?</ChatMessage>
      <ChatMessage actions={messageActions} avatar={assistantAvatar} from="assistant">
        <p>Your spending is up 18% on last month. Most of it comes from two places:</p>
        <ul>
          <li>Restaurants: three weekend dinners, 212 in total.</li>
          <li>Travel: a train ticket booked on the 14th.</li>
        </ul>
      </ChatMessage>
      <ChatMessage from="user">Set a restaurant budget of 300 for next month.</ChatMessage>
      <ChatMessage avatar={assistantAvatar} from="assistant" streaming>
        <ChatTypingIndicator />
      </ChatMessage>
    </ChatMessageList>
  ),
}

/* The assistant in a bubble, for products where the assistant is a character
   in a messaging thread rather than a document-like answer. */
export const Bubble: Story = {
  render: () => (
    <ChatMessageList aria-label="Conversation">
      <ChatMessage from="user">Can I change my booking to Friday?</ChatMessage>
      <ChatMessage appearance="bubble" avatar={assistantAvatar} from="assistant">
        Yes. Friday has two rooms left at the same rate. Shall I move it?
      </ChatMessage>
    </ChatMessageList>
  ),
}

/* Long words and long user text wrap inside the bubble instead of widening it. */
export const LongContent: Story = {
  render: () => (
    <ChatMessageList aria-label="Conversation">
      <ChatMessage from="user">
        {
          'Here is the link I was sent: https://example.com/a/very/long/path/that/does/not/break/naturally/anywhere\nAnd a second line after a newline.'
        }
      </ChatMessage>
      <ChatMessage from="assistant">
        That link points to a shared document. I cannot open it, but if you paste the text here I
        can summarise it, pull out the dates, or draft a reply to the sender.
      </ChatMessage>
    </ChatMessageList>
  ),
}

/* In a right-to-left script the user's turn moves to the left edge and the
   avatar to the right, with no extra props. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <ChatMessageList aria-label="المحادثة">
        <ChatMessage label="أنت" from="user">
          لماذا زاد إنفاقي هذا الشهر؟
        </ChatMessage>
        <ChatMessage
          actions={messageActions}
          avatar={assistantAvatar}
          label="المساعد"
          from="assistant"
        >
          زاد إنفاقك بنسبة 18٪ مقارنة بالشهر الماضي، معظمها من المطاعم.
        </ChatMessage>
      </ChatMessageList>
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <ThemeMatrix>
      <ChatMessageList aria-label="Conversation">
        <ChatMessage from="user">Summarise my week.</ChatMessage>
        <ChatMessage avatar={assistantAvatar} from="assistant">
          Four workouts, average sleep 7h 12m.
        </ChatMessage>
        <ChatMessage appearance="bubble" from="assistant">
          Want a plan for next week?
        </ChatMessage>
      </ChatMessageList>
    </ThemeMatrix>
  ),
}
