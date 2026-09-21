import { crossRendererContracts, getCrossRendererContract } from '@atom63/ui-foundation'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/accordion'
import { Alert, AlertDescription, AlertTitle } from '../components/alert'
import { Avatar, AvatarFallback } from '../components/avatar'
import { Badge } from '../components/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/alert-dialog'
import { Button } from '../components/button'
import { Calendar } from '../components/calendar'
import { Card } from '../components/card'
import { DestinationLink } from '../components/destination-link'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '../components/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '../components/field'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '../components/empty'
import { Input } from '../components/input'
import { LoadMoreTrigger } from '../components/load-more-trigger'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/dropdown-menu'
import { Radio, RadioGroup } from '../components/radio'
import { Progress } from '../components/progress'
import { SearchField } from '../components/search-field'
import { SegmentedControl } from '../components/segmented-control'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '../components/select'
import { Skeleton } from '../components/skeleton'
import { Slider } from '../components/slider'
import { Switch } from '../components/switch'
import { Tabs, TabsList, TabsPanel, TabsTab } from '../components/tabs'
import { Textarea } from '../components/textarea'
import { Toaster } from '../components/toaster'
import { Toggle } from '../components/toggle'
import { reactRendererConformance } from './renderer-conformance'

function SegmentedControlConformanceExample({
  onValueChange,
}: {
  onValueChange: (value: string) => void
}) {
  const [value, setValue] = useState('list')

  return (
    <SegmentedControl
      items={[
        { label: 'List', value: 'list' },
        { label: 'Grid', value: 'grid' },
        { disabled: true, label: 'Timeline', value: 'timeline' },
      ]}
      onValueChange={next => {
        setValue(next)
        onValueChange(next)
      }}
      value={value}
    />
  )
}

function CalendarConformanceExample({ onSelect }: { onSelect: (date: Date | undefined) => void }) {
  const [selected, setSelected] = useState<Date>()

  return (
    <Calendar
      aria-label="Start date"
      defaultMonth={new Date(2025, 0, 1)}
      disabled={{ before: new Date(2025, 0, 10) }}
      mode="single"
      onSelect={date => {
        setSelected(date)
        onSelect(date)
      }}
      selected={selected}
    />
  )
}

describe('React renderer conformance', () => {
  it('has executable evidence for every canonical contract', () => {
    expect(reactRendererConformance.map(evidence => evidence.contractId).sort()).toEqual(
      crossRendererContracts.map(contract => contract.id).sort()
    )
  })

  it.each(reactRendererConformance)(
    'covers the complete $contractId contract evidence',
    evidence => {
      const contract = getCrossRendererContract(evidence.contractId)

      expect(evidence.implementedStates).toEqual(contract.requiredStates)
      expect(evidence.verifiedSharedOutcomes).toEqual(contract.sharedOutcomes)
      expect(evidence.verifiedAccessibilityOutcomes).toEqual(contract.accessibilityOutcomes)
      expect(evidence.verifiesMotionRecipe).toBe('motion' in contract && Boolean(contract.motion))
    }
  )

  it('verifies button activation, disabled, loading, and accessible label outcomes', () => {
    const onPress = vi.fn()
    const { rerender } = render(<Button onClick={onPress}>Save</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onPress).toHaveBeenCalledOnce()

    rerender(
      <Button disabled onClick={onPress}>
        Save
      </Button>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onPress).toHaveBeenCalledOnce()

    rerender(
      <Button loading onClick={onPress}>
        Save
      </Button>
    )
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('verifies compact toggle selection and disabled activation outcomes', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Toggle aria-label="Pinned">Pinned</Toggle>)
    const toggle = screen.getByRole('button', { name: 'Pinned' })

    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    unmount()
    render(
      <Toggle aria-label="Disabled pinned" defaultPressed disabled>
        Pinned
      </Toggle>
    )
    const disabledToggle = screen.getByRole('button', { name: 'Disabled pinned' })
    await user.click(disabledToggle)
    expect(disabledToggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('verifies static and single-action card semantics', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const { rerender } = render(
      <Card>
        <span>Project</span>
        <span>Supporting details</span>
      </Card>
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(
      screen.getByText('Project').compareDocumentPosition(screen.getByText('Supporting details'))
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    rerender(
      <Card aria-label="Open project" onClick={onOpen} render={<button type="button" />}>
        <span>Project</span>
      </Card>
    )
    await user.click(screen.getByRole('button', { name: 'Open project' }))
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('verifies semantic badges retain readable text labels', () => {
    for (const variant of ['default', 'accent', 'success', 'warning', 'error'] as const) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>)
      expect(screen.getByText(variant)).toHaveAttribute('data-variant', variant)
      unmount()
    }
  })

  it('verifies avatar fallback preserves the accessible identity', () => {
    render(
      <Avatar aria-label="You Zhang">
        <AvatarFallback>YZ</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByLabelText('You Zhang')).toHaveTextContent('YZ')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('verifies empty state reading order, heading, and recovery action', () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No projects</EmptyTitle>
          <EmptyDescription>Create the first project.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>Create project</Button>
        </EmptyContent>
      </Empty>
    )

    const heading = screen.getByRole('heading', { name: 'No projects' })
    const description = screen.getByText('Create the first project.')
    expect(heading.compareDocumentPosition(description)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(screen.getByRole('button', { name: 'Create project' })).toBeEnabled()
  })

  it('verifies determinate progress label, value, and completion', () => {
    const { rerender } = render(<Progress aria-label="Upload project" value={50} />)
    expect(screen.getByRole('progressbar', { name: 'Upload project' })).toHaveAttribute(
      'aria-valuenow',
      '50'
    )

    rerender(<Progress aria-label="Upload project" value={100} />)
    expect(screen.getByRole('progressbar', { name: 'Upload project' })).toHaveAttribute(
      'aria-valuenow',
      '100'
    )
  })

  it('verifies toaster announces feedback without moving focus', async () => {
    render(
      <>
        <button type="button">Current action</button>
        <Toaster duration={1000} />
      </>
    )
    const currentAction = screen.getByRole('button', { name: 'Current action' })
    currentAction.focus()

    toast.success('Project saved')

    expect(await screen.findByText('Project saved')).toBeVisible()
    expect(document.querySelector('[aria-live]')).toBeInTheDocument()
    expect(currentAction).toHaveFocus()
  })

  it('verifies every alert tone keeps text and alert semantics', () => {
    for (const tone of getCrossRendererContract('alert').requiredStates) {
      const { unmount } = render(
        <Alert variant={tone}>
          <AlertTitle>{tone}</AlertTitle>
          <AlertDescription>Status copy</AlertDescription>
        </Alert>
      )

      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', tone)
      expect(screen.getByText('Status copy')).toBeVisible()
      unmount()
    }
  })

  it('verifies dialog modal context, accessible naming, dismissal, and focus restoration', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open project settings</DialogTrigger>
        <DialogPopup>
          <DialogTitle>Project settings</DialogTitle>
          <DialogDescription>Update project defaults.</DialogDescription>
          <DialogClose>Done</DialogClose>
        </DialogPopup>
      </Dialog>
    )

    const trigger = screen.getByRole('button', { name: 'Open project settings' })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Project settings' })
    expect(dialog).toHaveAccessibleDescription('Update project defaults.')
    await waitFor(() => {
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    })

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('verifies alert dialog cancel and confirm outcomes are explicit and singular', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete project</AlertDialogTrigger>
        <AlertDialogPopup>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant="destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogPopup>
      </AlertDialog>
    )

    const trigger = screen.getByRole('button', { name: 'Delete project' })
    await user.click(trigger)
    expect(
      screen.getByRole('alertdialog', { name: 'Delete project?' })
    ).toHaveAccessibleDescription('This action cannot be undone.')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('verifies field label, description, disabled, and error relationships', () => {
    render(
      <Field data-disabled="true">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input aria-describedby="email-description email-error" aria-invalid disabled id="email" />
        <FieldDescription id="email-description">Use your work address.</FieldDescription>
        <FieldError id="email-error">Enter a valid email address.</FieldError>
      </Field>
    )

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Use your work address. Enter a valid email address.')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
  })

  it('verifies internal and external destination semantics remain distinguishable', () => {
    const { rerender } = render(
      <DestinationLink href="/projects/atom63" kind="internal">
        View project
      </DestinationLink>
    )

    const internalLink = screen.getByRole('link', { name: 'View project' })
    expect(internalLink).toHaveAttribute('href', '/projects/atom63')
    expect(internalLink).not.toHaveAttribute('target')
    internalLink.focus()
    expect(internalLink).toHaveFocus()

    rerender(
      <DestinationLink href="https://example.com/source" kind="external">
        View source
      </DestinationLink>
    )
    const externalLink = screen.getByRole('link', {
      name: 'View source (opens in new tab)',
    })
    expect(externalLink).toHaveAttribute('target', '_blank')
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('verifies input and textarea editing, focus, invalid, and disabled states', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Input aria-label="Name" />)
    const input = screen.getByRole('textbox', { name: 'Name' })

    await user.click(input)
    await user.type(input, 'Atom63')
    expect(input).toHaveFocus()
    expect(input).toHaveValue('Atom63')

    rerender(<Input aria-label="Name" disabled invalid />)
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true')

    rerender(<Textarea aria-label="Summary" />)
    const textarea = screen.getByRole('textbox', { name: 'Summary' })
    await user.click(textarea)
    await user.type(textarea, 'Native renderer')
    expect(textarea).toHaveFocus()
    expect(textarea).toHaveValue('Native renderer')

    rerender(<Textarea aria-label="Summary" disabled invalid />)
    expect(screen.getByRole('textbox', { name: 'Summary' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Summary' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('verifies switch boolean value and disabled activation behavior', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Switch aria-label="Archive project" />)
    const control = screen.getByRole('switch', { name: 'Archive project' })

    expect(control).not.toBeChecked()
    await user.click(control)
    expect(control).toBeChecked()

    unmount()
    render(<Switch aria-label="Archive project" defaultChecked disabled />)
    const disabledControl = screen.getByRole('switch', { name: 'Archive project' })
    expect(disabledControl).toHaveAttribute('aria-disabled', 'true')
    expect(disabledControl).toHaveAttribute('tabindex', '-1')
    await user.click(disabledControl)
    expect(disabledControl).toBeChecked()
  })

  it('verifies select value, single selection, disabled option, and disabled trigger behavior', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { unmount } = render(
      <Select
        defaultOpen
        defaultValue="all"
        items={[
          { label: 'All projects', value: 'all' },
          { label: 'Active projects', value: 'active' },
          { label: 'Archived projects', value: 'archived' },
        ]}
        onValueChange={onValueChange}
      >
        <SelectTrigger aria-label="Project status">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          <SelectItem value="all">All projects</SelectItem>
          <SelectItem value="active">Active projects</SelectItem>
          <SelectItem disabled value="archived">
            Archived projects
          </SelectItem>
        </SelectPopup>
      </Select>
    )

    const trigger = screen.getByRole('combobox', { name: 'Project status' })
    expect(trigger).toHaveTextContent('All projects')
    expect(screen.getByRole('option', { name: 'Archived projects' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )

    await user.click(screen.getByRole('option', { name: 'Active projects' }))
    expect(onValueChange).toHaveBeenCalledOnce()
    expect(onValueChange.mock.calls[0]?.[0]).toBe('active')
    expect(trigger).toHaveTextContent('Active projects')

    unmount()
    render(
      <Select defaultValue="all" items={[{ label: 'All projects', value: 'all' }]}>
        <SelectTrigger aria-label="Disabled project status" disabled>
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByRole('combobox', { name: 'Disabled project status' })).toBeDisabled()
  })

  it('verifies segmented control selection and disabled option behavior', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SegmentedControlConformanceExample onValueChange={onValueChange} />)

    expect(screen.getByRole('tab', { name: 'List' })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('tab', { name: 'Grid' }))
    expect(onValueChange).toHaveBeenCalledOnce()
    expect(onValueChange).toHaveBeenCalledWith('grid')
    expect(screen.getByRole('tab', { name: 'Grid' })).toHaveAttribute('aria-selected', 'true')

    await user.click(screen.getByRole('tab', { name: 'Timeline' }))
    expect(onValueChange).toHaveBeenCalledOnce()
  })

  it('verifies radio group selection and disabled option behavior', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioGroup
        aria-label="Project visibility"
        defaultValue="private"
        onValueChange={onValueChange}
      >
        <Radio aria-label="Private" value="private" />
        <Radio aria-label="Shared" value="shared" />
        <Radio aria-label="Public" disabled value="public" />
      </RadioGroup>
    )

    expect(screen.getByRole('radiogroup', { name: 'Project visibility' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Private' })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: 'Shared' }))
    expect(onValueChange.mock.calls[0]?.[0]).toBe('shared')
    expect(screen.getByRole('radio', { name: 'Shared' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Public' }))
    expect(onValueChange).toHaveBeenCalledOnce()
  })

  it('verifies slider range, stepped adjustment, and disabled behavior', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { unmount } = render(
      <Slider
        aria-label="Priority"
        defaultValue={50}
        max={100}
        min={0}
        onValueChange={onValueChange}
        step={10}
      />
    )

    const slider = screen.getByRole('slider', { name: 'Priority' })
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '100')
    expect(slider).toHaveAttribute('aria-valuenow', '50')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onValueChange).toHaveBeenCalledWith(60)

    unmount()
    const disabledChange = vi.fn()
    render(
      <Slider aria-label="Disabled priority" disabled onValueChange={disabledChange} value={50} />
    )
    const disabledSlider = screen.getByRole('slider', { name: 'Disabled priority' })
    expect(disabledSlider).toBeDisabled()
    await user.click(disabledSlider)
    await user.keyboard('{ArrowRight}')
    expect(disabledChange).not.toHaveBeenCalled()
  })

  it('verifies menu actions, disabled items, checked state, and destructive intent', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const onDisabledAction = vi.fn()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Show details</DropdownMenuCheckboxItem>
          <DropdownMenuItem disabled onClick={onDisabledAction}>
            Disabled action
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAction}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-haspopup', 'menu')
    expect(screen.getByRole('menuitemcheckbox', { name: 'Show details' })).toBeChecked()
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'data-variant',
      'destructive'
    )

    await user.click(screen.getByRole('menuitem', { name: 'Disabled action' }))
    expect(onDisabledAction).not.toHaveBeenCalled()
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
    expect(onAction).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('verifies disclosure visibility, association, and disabled behavior', async () => {
    const user = userEvent.setup()
    render(
      <Accordion>
        <AccordionItem value="details">
          <AccordionTrigger>Project details</AccordionTrigger>
          <AccordionContent>Native renderer with shared intent.</AccordionContent>
        </AccordionItem>
        <AccordionItem disabled value="disabled">
          <AccordionTrigger>Disabled details</AccordionTrigger>
          <AccordionContent>Unavailable content.</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByRole('button', { name: 'Project details' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls')
    expect(screen.getByText('Native renderer with shared intent.')).toBeVisible()

    const disabledTrigger = screen.getByRole('button', { name: 'Disabled details' })
    expect(disabledTrigger).toHaveAttribute('aria-disabled', 'true')
    await user.click(disabledTrigger)
    expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('verifies allowed date selection, disabled dates, and selected state', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { container } = render(<CalendarConformanceExample onSelect={onSelect} />)

    expect(container.querySelector('[data-slot="calendar"]')).toHaveAttribute(
      'aria-label',
      'Start date'
    )
    const disabledDate = screen.getByRole('button', { name: /January 5/ })
    expect(disabledDate).toBeDisabled()
    await user.click(disabledDate)
    expect(onSelect).not.toHaveBeenCalled()

    const allowedDate = screen.getByRole('button', { name: /January 15/ })
    await user.click(allowedDate)
    expect(onSelect).toHaveBeenCalledOnce()
    expect(allowedDate.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true')
  })

  it('verifies search query editing, clear, submit, focus, and disabled behavior', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault())
    const { unmount } = render(
      <form onSubmit={onSubmit}>
        <SearchField aria-label="Search projects" />
      </form>
    )

    const search = screen.getByRole('searchbox', { name: 'Search projects' })
    await user.type(search, 'mobile')
    expect(search).toHaveValue('mobile')
    expect(search).toHaveFocus()
    const clear = screen.getByRole('button', { name: 'Clear search' })
    await user.click(clear)
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
    await user.type(search, 'design{Enter}')
    expect(onSubmit).toHaveBeenCalledOnce()

    unmount()
    render(<SearchField aria-label="Disabled search" disabled value="mobile" />)
    expect(screen.getByRole('searchbox', { name: 'Disabled search' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('verifies tabs keep one selection associated with visible content', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Tabs defaultValue="overview" onValueChange={onValueChange}>
        <TabsList>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="activity">Activity</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Overview content</TabsPanel>
        <TabsPanel value="activity">Activity content</TabsPanel>
      </Tabs>
    )

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Overview content')).toBeVisible()

    await user.click(screen.getByRole('tab', { name: 'Activity' }))
    expect(onValueChange.mock.calls[0]?.[0]).toBe('activity')
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Activity content')).toBeVisible()
  })

  it('verifies pagination state tones, announcements, and retry recovery', () => {
    const contract = getCrossRendererContract('load-more-trigger')
    const onRetry = vi.fn()

    for (const state of contract.requiredStates) {
      const { container, unmount } = render(<LoadMoreTrigger onRetry={onRetry} state={state} />)
      const root = container.querySelector('[data-slot="load-more-trigger"]')

      expect(root).toHaveAttribute('data-state', state)
      expect(root).toHaveAttribute('data-tone', contract.stateTones[state])
      if (state !== 'idle') {
        expect(root).toHaveAttribute('role', 'status')
      }
      if (state === 'failed') {
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
      }
      unmount()
    }

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('verifies skeleton placeholders stay outside the accessibility tree', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('[data-slot="skeleton"]')).toHaveAttribute('aria-hidden', 'true')
    expect(getCrossRendererContract('skeleton').motion?.reducedMotion).toBe('static')
  })
})
