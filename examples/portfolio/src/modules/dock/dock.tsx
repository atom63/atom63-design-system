import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Separator,
  Textarea,
} from '@atom63/ui-react'
import { Link } from '@tanstack/react-router'
import { Clock, FileText, FolderOpen, House, NotebookPen, PenLine, Route } from 'lucide-react'
import { type ReactNode, useEffect, useId, useState } from 'react'

import { portfolio } from '../../portfolio.config'

const notesKey = 'portfolio-notes'

const dockLinks = [
  { icon: <House aria-hidden />, label: 'Home', to: '/' },
  { icon: <FolderOpen aria-hidden />, label: 'Projects', to: '/projects' },
  { icon: <PenLine aria-hidden />, label: 'Writing', to: '/writing' },
  { icon: <Route aria-hidden />, label: 'Timeline', to: '/timeline' },
  { icon: <FileText aria-hidden />, label: 'Resume', to: '/resume' },
]

/** A mini app: a dock button that opens a small window above the dock. */
function MiniApp({
  children,
  icon,
  title,
}: {
  children: ReactNode
  icon: ReactNode
  title: string
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button aria-label={title} size="icon" tone="muted" variant="ghost">
            {icon}
          </Button>
        }
      />
      <PopoverContent side="top" sideOffset={12}>
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
        </PopoverHeader>
        {children}
      </PopoverContent>
    </Popover>
  )
}

/* Mini app: the time where you are and where the visitor is. */
function ClockApp() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  const time = (timeZone?: string) =>
    now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', timeZone })
  return (
    <dl className="grid grid-cols-2 gap-4">
      <div>
        <dt className="text-muted-foreground text-xs">{portfolio.person.name.split(' ')[0]}</dt>
        <dd className="text-foreground text-2xl font-semibold tabular-nums">
          {time(portfolio.person.timeZone)}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground text-xs">You</dt>
        <dd className="text-foreground text-2xl font-semibold tabular-nums">{time()}</dd>
      </div>
    </dl>
  )
}

/* Mini app: a notepad kept in this browser. */
function NotesApp() {
  const id = useId()
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(notesKey) ?? ''
    } catch {
      return ''
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(notesKey, text)
    } catch {
      // Storage can be blocked; the note then lasts for the visit.
    }
  }, [text])
  return (
    <Field>
      <FieldLabel htmlFor={id}>Notes</FieldLabel>
      <Textarea id={id} onChange={event => setText(event.target.value)} rows={5} value={text} />
      <FieldDescription>Kept in this browser only.</FieldDescription>
    </Field>
  )
}

/**
 * The bottom dock: the site's sections and two mini apps, always in reach.
 * Add a mini app with another <MiniApp>.
 */
export function Dock() {
  return (
    <nav
      aria-label="Dock"
      className="bg-popover fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-1 overflow-x-auto rounded-2xl p-1.5 shadow-lg print:hidden"
    >
      {dockLinks.map(link => (
        <Button
          aria-label={link.label}
          key={link.to}
          render={<Link to={link.to} />}
          size="icon"
          tone="muted"
          variant="ghost"
        >
          {link.icon}
        </Button>
      ))}
      <Separator className="mx-1 h-6" orientation="vertical" />
      <MiniApp icon={<Clock aria-hidden />} title="Clock">
        <ClockApp />
      </MiniApp>
      <MiniApp icon={<NotebookPen aria-hidden />} title="Notes">
        <NotesApp />
      </MiniApp>
    </nav>
  )
}
