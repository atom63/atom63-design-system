import type { ChatComposerStatus } from '@atom63/ui-foundation'
import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@atom63/ui-react'
import { SquarePen } from 'lucide-react'
import type { AnchorHTMLAttributes, ReactElement } from 'react'

import { type ChatPanelMessage, ChatThread } from '../../blocks/chat-panel/chat-panel'

export const template = {
  id: 'chat-page',
  kind: 'page',
  title: 'Chat page',
  description:
    'A full-page AI assistant: past conversations in the sidebar with a new chat button, the open conversation in a 48rem reading column with replies at its full width, and the one-row composer at the bottom of the same column. With no messages it is the start screen: a large greeting, the composer and suggestion chips. Uses the chat-panel block for the conversation; wire it to @atom63/agent or any runtime through props.',
  category: 'ai',
  tags: [
    'chat',
    'assistant',
    'ai',
    'ai assistant',
    'agent',
    'copilot',
    'conversation',
    'history',
    'start screen',
    'suggestions',
    'prompt',
  ],
  readiness: 'draft',
} as const

export interface ChatConversation {
  current?: boolean
  href: string
  title: string
}

export type ChatPageLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export interface ChatPageProps {
  /** Past conversations, newest first. */
  conversations: readonly ChatConversation[]
  messages: readonly ChatPanelMessage[]
  onNewChat?: () => void
  onSend: (text: string) => void
  onStop?: () => void
  /** The product name at the top of the sidebar. */
  productName?: string
  /** Renders a conversation link, for a router's own link component; a plain anchor by default. */
  renderLink?: (props: ChatPageLinkProps) => ReactElement
  status?: ChatComposerStatus
  suggestions?: readonly string[]
}

const anchor = ({ children, ...props }: ChatPageLinkProps) => <a {...props}>{children}</a>

/*
 * The assistant as the whole page. On a phone the history becomes a sheet the
 * top-bar toggle opens. The open conversation is marked with aria-current.
 * The page holds no conversation state; see ChatThread for how to feed it.
 */
export function ChatPage({
  conversations,
  messages,
  onNewChat,
  onSend,
  onStop,
  productName = 'Assistant',
  renderLink = anchor,
  status,
  suggestions,
}: ChatPageProps) {
  const current = conversations.find(conversation => conversation.current)
  return (
    <SidebarProvider>
      <Sidebar>
        <nav aria-label="Conversations" className="contents">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <span className="font-heading text-foreground truncate font-semibold">
                {productName}
              </span>
              <Button
                aria-label="New chat"
                className="ms-auto"
                onClick={onNewChat}
                size="icon-sm"
                variant="ghost"
              >
                <SquarePen aria-hidden />
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Recent</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.map(conversation => (
                    <SidebarMenuItem key={conversation.href}>
                      <SidebarMenuButton
                        isActive={conversation.current}
                        render={renderLink({
                          'aria-current': conversation.current ? 'page' : undefined,
                          children: <span className="truncate">{conversation.title}</span>,
                          href: conversation.href,
                        })}
                      />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </nav>
      </Sidebar>
      <SidebarInset className="flex h-svh min-h-0 flex-col">
        <header className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-foreground truncate text-sm font-semibold">
            {messages.length ? (current?.title ?? 'Chat') : 'New chat'}
          </h1>
        </header>
        <ChatThread
          greeting="What can I help with?"
          layout="page"
          messages={messages}
          onSend={onSend}
          onStop={onStop}
          status={status}
          suggestions={suggestions}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
