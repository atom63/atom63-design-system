export type ComponentPreviewProfile = 'canvas' | 'compact' | 'standard'
export type ComponentStatus = 'preview' | 'stable'

export type ComponentCatalogItem = {
  additionalValueExports?: readonly string[]
  category: string
  importPath: '@atom63/ui-react'
  previewProfile: ComponentPreviewProfile
  relatedSlugs: readonly string[]
  slug: string
  status: ComponentStatus
  storyExport: string
  summary: string
  usage: string
  usageExports: readonly string[]
}

export type ComponentCatalogGroup = {
  description: string
  id: string
  items: readonly ComponentCatalogItem[]
  title: string
}

type ComponentDefinition = Pick<
  ComponentCatalogItem,
  'additionalValueExports' | 'relatedSlugs' | 'summary' | 'usage' | 'usageExports'
>

const componentDefinitions: Record<string, ComponentDefinition> = {
  accordion: {
    relatedSlugs: ['collapsible', 'tabs'],
    summary: 'Accordion coordinates a set of disclosure sections with shared keyboard behavior.',
    usage:
      'Use it when several related sections may be collapsed; use Collapsible for one disclosure.',
    usageExports: ['Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent'],
  },
  alert: {
    relatedSlugs: ['feedback-state', 'toaster', 'alert-dialog'],
    summary:
      'Alert presents persistent inline feedback with optional icon, action, and description.',
    usage:
      'Keep it in the page when the message should remain available after the triggering event.',
    usageExports: ['Alert', 'AlertTitle', 'AlertDescription'],
  },
  'alert-dialog': {
    relatedSlugs: ['dialog', 'sheet', 'drawer'],
    summary: 'Alert Dialog interrupts a flow to confirm a consequential decision.',
    usage: 'Reserve it for decisions that need explicit acknowledgement, not routine information.',
    usageExports: ['AlertDialog', 'AlertDialogTrigger', 'AlertDialogContent', 'AlertDialogAction'],
  },
  'animated-check': {
    relatedSlugs: ['spinner', 'progress', 'feedback-state'],
    summary: 'Animated Check is a decorative completion mark with a reduced-motion fallback.',
    usage:
      'Pair it with visible status text; the glyph is intentionally hidden from assistive technology.',
    usageExports: ['AnimatedCheck'],
  },
  autocomplete: {
    relatedSlugs: ['input', 'command', 'select'],
    summary: 'Autocomplete combines text entry with a filtered, keyboard-navigable collection.',
    usage:
      'Use it when typing should filter available values; use Select when scanning the list is enough.',
    usageExports: ['Autocomplete', 'AutocompleteInput', 'AutocompletePopup', 'AutocompleteItem'],
  },
  avatar: {
    relatedSlugs: ['badge', 'item'],
    summary: 'Avatar composes an image, fallback, badge, and grouped identity presentation.',
    usage:
      'Provide meaningful image alternative text and a stable fallback for failed or missing media.',
    usageExports: ['Avatar', 'AvatarImage', 'AvatarFallback'],
  },
  badge: {
    relatedSlugs: ['avatar', 'kbd', 'alert'],
    summary: 'Badge carries compact status or classification metadata beside primary content.',
    usage:
      'Keep badges short and non-interactive unless the surrounding semantic element owns the action.',
    usageExports: ['Badge'],
  },
  breadcrumb: {
    relatedSlugs: ['pagination', 'navigation-menu', 'sidebar-nav-tree'],
    summary: 'Breadcrumb exposes the current page within a navigable hierarchy.',
    usage: 'Mark the final item as the current page and collapse only intermediate levels.',
    usageExports: [
      'Breadcrumb',
      'BreadcrumbList',
      'BreadcrumbItem',
      'BreadcrumbLink',
      'BreadcrumbPage',
    ],
  },
  button: {
    relatedSlugs: ['button-group', 'toggle', 'copy-button'],
    summary: 'Button is the shared action primitive and defaults to safe non-submit behavior.',
    usage: 'Choose emphasis from the action hierarchy and label icon-only buttons accessibly.',
    usageExports: ['Button'],
  },
  'button-group': {
    relatedSlugs: ['button', 'toggle-group', 'segmented-control'],
    summary:
      'Button Group welds adjacent controls into one visual run without changing their semantics.',
    usage:
      'Use Toggle Group or Segmented Control when the group itself represents persistent selection.',
    usageExports: ['ButtonGroup', 'ButtonGroupText', 'ButtonGroupSeparator'],
  },
  calendar: {
    relatedSlugs: ['input', 'select', 'popover'],
    summary:
      'Calendar provides themed single, range, and multi-date selection through React DayPicker.',
    usage:
      'Keep the selected value available outside the calendar when it is used in a form or popover.',
    usageExports: ['Calendar'],
  },
  card: {
    relatedSlugs: ['item', 'frame', 'preview-card'],
    summary: 'Card composes media, metadata, actions, and content into a reusable surface.',
    usage:
      'Put CardTitle and CardDescription inside CardContent. Unlike shadcn, CardHeader is a single row for a CardLabel and a CardAction, so a title placed there is squeezed and truncated. Do not make the whole card clickable when it also contains independent interactive controls.',
    usageExports: ['Card', 'CardHeader', 'CardTitle', 'CardContent'],
  },
  carousel: {
    relatedSlugs: ['scrollable-list', 'scroll-area', 'button'],
    summary: 'Carousel coordinates an Embla viewport, slides, controls, and shared carousel state.',
    usage:
      'Use stable slide labels and keep essential content reachable without relying on drag alone.',
    usageExports: [
      'Carousel',
      'CarouselContent',
      'CarouselItem',
      'CarouselPrevious',
      'CarouselNext',
    ],
  },
  checkbox: {
    relatedSlugs: ['switch', 'radio', 'field'],
    summary: 'Checkbox captures an independent checked, unchecked, or indeterminate choice.',
    usage:
      'Associate every checkbox with a persistent label and explain indeterminate state in context.',
    usageExports: ['Checkbox'],
  },
  collapsible: {
    relatedSlugs: ['accordion', 'connected-panel'],
    summary:
      'Collapsible controls one trigger and one region while preserving disclosure semantics.',
    usage:
      'Use it for a single optional region; use Accordion when several disclosures form a set.',
    usageExports: ['Collapsible', 'CollapsibleTrigger', 'CollapsibleContent'],
  },
  command: {
    relatedSlugs: ['autocomplete', 'dialog', 'kbd'],
    summary:
      'Command provides a searchable command collection that can render inline or in a dialog.',
    usage:
      'Group actions by intent, expose empty results, and keep shortcuts supplementary to labels.',
    usageExports: ['Command', 'CommandInput', 'CommandPanel', 'CommandList', 'CommandItem'],
  },
  'connected-panel': {
    relatedSlugs: ['collapsible', 'popover', 'button'],
    summary: 'Connected Panel expands a trigger and its content as one continuous inline surface.',
    usage:
      'Use it when spatial continuity matters; use Popover when content should float independently.',
    usageExports: ['ConnectedPanel', 'ConnectedPanelTrigger', 'ConnectedPanelContent'],
  },
  'context-menu': {
    relatedSlugs: ['dropdown-menu', 'menubar'],
    summary:
      'Context Menu exposes supplemental actions from right-click or long-press interaction.',
    usage:
      'Never make it the only path to an action; provide a visible keyboard- and touch-reachable route.',
    usageExports: ['ContextMenu', 'ContextMenuTrigger', 'ContextMenuContent', 'ContextMenuItem'],
  },
  'copy-button': {
    relatedSlugs: ['button', 'toaster', 'tooltip'],
    summary: 'Copy Button owns clipboard feedback and the temporary copied state for one value.',
    usage: 'Mount one Toaster at the app root so copy outcomes are rendered as well as announced.',
    usageExports: ['CopyButton'],
  },
  'destination-link': {
    relatedSlugs: ['breadcrumb', 'navigation-menu', 'button'],
    summary: 'Destination Link distinguishes internal navigation from safe external navigation.',
    usage:
      'Pass the app router link through render for internal routes and preserve visible destination cues.',
    usageExports: ['DestinationLink', 'DestinationIndicator'],
  },
  dialog: {
    relatedSlugs: ['alert-dialog', 'sheet', 'drawer'],
    summary: 'Dialog provides modal task structure, focus management, and responsive placement.',
    usage:
      'Give every dialog a title and a deliberate close path; use Alert Dialog for confirmation.',
    usageExports: ['Dialog', 'DialogTrigger', 'DialogContent'],
  },
  drawer: {
    relatedSlugs: ['sheet', 'dialog'],
    summary: 'Drawer presents modal content from a viewport edge with drag-aware behavior.',
    usage:
      'Use it for a temporary edge surface, not as a replacement for persistent page navigation.',
    usageExports: ['Drawer', 'DrawerTrigger', 'DrawerContent'],
  },
  'dropdown-menu': {
    relatedSlugs: ['context-menu', 'menubar', 'button'],
    summary: 'Dropdown Menu presents a button-triggered set of compact actions and choices.',
    usage:
      'Write action labels as commands and use checkbox or radio items only for persistent choices.',
    usageExports: [
      'DropdownMenu',
      'DropdownMenuTrigger',
      'DropdownMenuContent',
      'DropdownMenuItem',
    ],
  },
  empty: {
    relatedSlugs: ['feedback-state', 'alert', 'button'],
    summary: 'Empty provides composable structure for empty collections and unavailable content.',
    usage:
      'Explain why content is absent and offer an action only when there is a useful next step.',
    usageExports: ['Empty', 'EmptyHeader', 'EmptyTitle', 'EmptyDescription', 'EmptyContent'],
  },
  'feedback-state': {
    relatedSlugs: ['empty', 'alert', 'toaster'],
    summary: 'Feedback State packages common empty, error, and no-results messages with actions.',
    usage: 'Choose the kind that matches the recovery path and keep technical detail secondary.',
    usageExports: ['FeedbackState'],
  },
  field: {
    relatedSlugs: ['form', 'input', 'label'],
    summary:
      'Field composes labels, descriptions, errors, and controls into consistent form structure.',
    usage:
      'Keep the control id and ARIA relationships explicit; layout does not replace semantic wiring.',
    usageExports: ['Field', 'FieldLabel', 'FieldDescription', 'FieldError'],
  },
  form: {
    relatedSlugs: ['field', 'input', 'button'],
    summary:
      'Form connects React Hook Form state to shared labels, controls, descriptions, and messages.',
    usage: 'Use it when React Hook Form owns validation; use Field for framework-neutral layout.',
    usageExports: ['Form', 'FormField', 'FormItem', 'FormControl', 'FormMessage'],
  },
  frame: {
    relatedSlugs: ['card', 'connected-panel'],
    summary:
      'Frame composes header, panel, description, and footer regions into a chrome-aware surface.',
    usage:
      'Use it for application chrome with distinct regions; use Card for content-first composition.',
    usageExports: ['Frame', 'FrameHeader', 'FrameTitle', 'FramePanel'],
  },
  'hover-card': {
    relatedSlugs: ['preview-card', 'tooltip', 'popover'],
    summary: 'Hover Card reveals contextual preview content from a hover- or focusable trigger.',
    usage:
      'Keep essential information outside the card because hover is not available in every input mode.',
    usageExports: ['HoverCard', 'HoverCardTrigger', 'HoverCardContent'],
  },
  input: {
    relatedSlugs: ['field', 'textarea', 'autocomplete'],
    summary: 'Input provides the shared single-line field and composable Input Group anatomy.',
    usage:
      'Pair it with a persistent label and use Input Group for addons instead of absolute positioning.',
    usageExports: ['Input', 'InputGroup', 'InputGroupAddon', 'InputGroupInput'],
  },
  'input-otp': {
    relatedSlugs: ['input', 'field'],
    summary: 'Input OTP composes accessible one-time-code slots over the input-otp primitive.',
    usage:
      'Label the complete code field and let the slot group express presentation, not separate inputs.',
    usageExports: ['InputOTP', 'InputOTPGroup', 'InputOTPSlot', 'InputOTPSeparator'],
  },
  item: {
    relatedSlugs: ['card', 'separator', 'avatar'],
    summary:
      'Item provides structured row regions for media, content, actions, and supporting detail.',
    usage:
      'Keep the row hierarchy predictable and avoid nesting unrelated actions inside a row-level link.',
    usageExports: ['Item', 'ItemContent', 'ItemTitle', 'ItemActions'],
  },
  kbd: {
    relatedSlugs: ['command', 'tooltip'],
    summary: 'Kbd presents keyboard input notation without implying an interactive control.',
    usage:
      'Render the same shortcut the product actually handles and keep it supplemental to an action label.',
    usageExports: ['Kbd', 'KbdGroup'],
  },
  label: {
    relatedSlugs: ['field', 'input', 'checkbox'],
    summary: 'Label provides the styled native labeling primitive for form controls.',
    usage: 'Connect htmlFor to the control id; placeholder text is not a label.',
    usageExports: ['Label'],
  },
  'load-more-trigger': {
    relatedSlugs: ['scrollable-list', 'spinner', 'progress'],
    summary: 'Load More Trigger is an observable sentinel row for incremental collection loading.',
    usage:
      'Attach fetching to the forwarded ref and announce loading without turning the sentinel into a button.',
    usageExports: ['LoadMoreTrigger'],
  },
  marquee: {
    relatedSlugs: ['text-ticker', 'scroll-area'],
    summary:
      'Marquee loops arbitrary content horizontally or vertically with pause and direction controls.',
    usage:
      'Use it only for non-essential repeated content and preserve the reduced-motion behavior.',
    usageExports: ['Marquee'],
  },
  menubar: {
    relatedSlugs: ['dropdown-menu', 'navigation-menu'],
    summary: 'Menubar coordinates persistent desktop-style menus and their keyboard relationships.',
    usage:
      'Use it for application commands, not ordinary site navigation or a row of unrelated buttons.',
    usageExports: ['Menubar', 'MenubarMenu', 'MenubarTrigger', 'MenubarContent', 'MenubarItem'],
  },
  'navigation-menu': {
    relatedSlugs: ['menubar', 'breadcrumb', 'dropdown-menu'],
    summary: 'Navigation Menu composes site links with optional positioned navigation panels.',
    usage:
      'Keep link semantics intact and avoid putting command-style actions in the navigation hierarchy.',
    usageExports: [
      'NavigationMenu',
      'NavigationMenuList',
      'NavigationMenuItem',
      'NavigationMenuTrigger',
      'NavigationMenuContent',
    ],
  },
  pagination: {
    relatedSlugs: ['breadcrumb', 'button'],
    summary:
      'Pagination provides a navigation landmark and consistent previous, next, and page links.',
    usage:
      'Expose the current page and real link destinations so navigation works without client state.',
    usageExports: ['Pagination', 'PaginationContent', 'PaginationItem', 'PaginationLink'],
  },
  'panel-setting-button': {
    relatedSlugs: ['toggle', 'segmented-control', 'button'],
    summary:
      'Panel Setting Button is an icon-and-label pressed control for visual settings choices.',
    usage: 'Use active state for a persistent choice and pass decorative icons with aria-hidden.',
    usageExports: ['PanelSettingButton'],
  },
  popover: {
    relatedSlugs: ['tooltip', 'hover-card', 'dialog'],
    summary: 'Popover anchors non-modal interactive content to a trigger or custom anchor.',
    usage:
      'Use it when focus may remain in the surrounding page; use Dialog when the task must be modal.',
    usageExports: ['Popover', 'PopoverTrigger', 'PopoverContent'],
  },
  'portal-container': {
    relatedSlugs: ['popover', 'dialog', 'tooltip'],
    summary: 'Portal Container supplies a shared mount target to package overlays.',
    usage:
      'Use it to keep overlays inside an application or window boundary; it does not manage focus.',
    usageExports: ['PortalContainerProvider', 'usePortalContainer'],
  },
  'preview-card': {
    relatedSlugs: ['hover-card', 'card', 'popover'],
    summary:
      'Preview Card presents a rich linked-resource preview from a hover- or focusable trigger.',
    usage:
      'Treat it as enhancement and keep the destination understandable without opening the preview.',
    usageExports: ['PreviewCard', 'PreviewCardTrigger', 'PreviewCardPopup'],
  },
  progress: {
    relatedSlugs: ['spinner', 'skeleton', 'load-more-trigger'],
    summary: 'Progress composes labelled determinate or indeterminate task progress.',
    usage:
      'Provide a value only when progress is measurable and keep the accessible label current.',
    usageExports: ['Progress', 'ProgressTrack', 'ProgressIndicator'],
  },
  'progressive-blur': {
    relatedSlugs: ['skeleton', 'scroll-area', 'marquee'],
    summary:
      'Progressive Blur ramps stacked backdrop blur across a band so text can sit over imagery.',
    usage:
      'Pair it with a scrim — blur removes detail but does not darken — and clip the parent with clip-path rather than overflow hidden.',
    usageExports: ['ProgressiveBlur'],
  },
  radio: {
    relatedSlugs: ['checkbox', 'segmented-control', 'select'],
    summary: 'Radio provides single-choice items and a coordinated radio group.',
    usage: 'Use a group label and reserve radio choices for options that can be compared at once.',
    usageExports: ['Radio', 'RadioGroup', 'RadioGroupItem'],
  },
  resizable: {
    relatedSlugs: ['separator', 'sidebar'],
    summary: 'Resizable composes keyboard-operable panel groups, panels, and drag handles.',
    usage:
      'Give each panel usable minimums and make the handle visible when resizing is not otherwise obvious.',
    usageExports: ['ResizablePanelGroup', 'ResizablePanel', 'ResizableHandle'],
  },
  'scroll-area': {
    relatedSlugs: ['scrollable-list', 'carousel'],
    summary: 'Scroll Area supplies themed scrollbars while preserving native scrolling behavior.',
    usage:
      'Constrain its viewport explicitly and avoid hiding overflow that users still need to reach.',
    usageExports: ['ScrollArea', 'ScrollBar'],
  },
  'scrollable-list': {
    relatedSlugs: ['scroll-area', 'load-more-trigger', 'carousel'],
    summary:
      'Scrollable List adds edge masks and optional controls to overflowing row or column content.',
    usage:
      'Keep native scrolling available and use controls as an additional path, not the only one.',
    usageExports: ['ScrollableList'],
  },
  'segmented-control': {
    relatedSlugs: ['toggle-group', 'tabs', 'radio'],
    summary:
      'Segmented Control presents one active value on a shared track with a moving indicator.',
    usage:
      'Use it for a small set of peer choices and keep labels short enough to survive narrow widths.',
    usageExports: ['SegmentedControl'],
  },
  select: {
    relatedSlugs: ['autocomplete', 'radio', 'dropdown-menu'],
    summary: 'Select constrains a field to values from a keyboard-navigable popup collection.',
    usage: 'Use Autocomplete when typing should filter values; label Select like any other field.',
    usageExports: ['Select', 'SelectTrigger', 'SelectValue', 'SelectPopup', 'SelectItem'],
  },
  'search-field': {
    relatedSlugs: ['input', 'autocomplete', 'command'],
    summary:
      'Search Field provides a clearable search input with shared keyboard and form behavior.',
    usage:
      'Use it for text filtering and search queries; use Autocomplete when results also select a value.',
    usageExports: ['SearchField'],
  },
  separator: {
    relatedSlugs: ['item', 'button-group', 'resizable'],
    summary: 'Separator draws visual or semantic division in horizontal and vertical layouts.',
    usage:
      'Mark purely decorative rules accordingly and do not use a separator as a substitute for spacing.',
    usageExports: ['Separator'],
  },
  sheet: {
    relatedSlugs: ['dialog', 'drawer', 'alert-dialog'],
    summary:
      'Sheet presents modal content from a chosen viewport side using dialog focus behavior.',
    usage:
      'Use it for a side-oriented modal task; use Drawer when drag interaction is part of the experience.',
    usageExports: ['Sheet', 'SheetTrigger', 'SheetContent'],
  },
  sidebar: {
    relatedSlugs: ['sidebar-nav-tree', 'navigation-menu', 'resizable'],
    summary:
      'Sidebar provides responsive application-shell structure, state, rail, menus, and inset content.',
    usage:
      'Mount it through Sidebar Provider and keep responsive visibility aligned to the md breakpoint.',
    usageExports: [
      'SidebarProvider',
      'Sidebar',
      'SidebarContent',
      'SidebarMenu',
      'SidebarMenuButton',
    ],
  },
  'sidebar-nav-tree': {
    relatedSlugs: ['sidebar', 'breadcrumb', 'collapsible'],
    summary:
      'Sidebar Nav Tree composes labelled navigation groups, links, sublists, and collapsible branches.',
    usage:
      'Preserve link semantics and expose the current route independently from expanded branch state.',
    usageExports: ['SidebarNavGroup', 'SidebarNavLinkItem', 'SidebarNavCollapsibleItem'],
  },
  skeleton: {
    relatedSlugs: ['spinner', 'progress', 'empty'],
    summary: 'Skeleton reserves content geometry while a known layout is loading.',
    usage:
      'Match the expected content shape and avoid using skeletons for errors or genuinely empty results.',
    usageExports: ['Skeleton'],
  },
  slider: {
    relatedSlugs: ['progress', 'input'],
    summary: 'Slider captures a scalar or range value with pointer and keyboard interaction.',
    usage:
      'Provide an accessible label and show the current value when the surrounding context does not.',
    usageExports: ['Slider', 'SliderValue'],
  },
  spinner: {
    relatedSlugs: ['progress', 'skeleton', 'load-more-trigger'],
    summary: 'Spinner announces an indeterminate loading state and stops motion when requested.',
    usage: 'Use it for an unknown wait; use Progress when completion can be measured.',
    usageExports: ['Spinner'],
  },
  switch: {
    relatedSlugs: ['checkbox', 'toggle', 'field'],
    summary: 'Switch changes one setting between immediate on and off states.',
    usage: 'Label the setting rather than the state, and use Checkbox when submission is deferred.',
    usageExports: ['Switch'],
  },
  table: {
    relatedSlugs: ['pagination', 'scroll-area'],
    summary: 'Table provides semantic table regions with shared typography, spacing, and states.',
    usage:
      'Keep header relationships intact and add horizontal containment for genuinely wide data.',
    usageExports: ['Table', 'TableHeader', 'TableBody', 'TableRow', 'TableHead', 'TableCell'],
  },
  tabs: {
    relatedSlugs: ['segmented-control', 'collapsible', 'navigation-menu'],
    summary: 'Tabs coordinate one active panel, its tab list, keyboard behavior, and indicator.',
    usage:
      'Use tabs for peer panels in one task; use navigation links when the destination has its own URL.',
    usageExports: ['Tabs', 'TabsList', 'TabsTab', 'TabsPanel'],
  },
  'text-ticker': {
    relatedSlugs: ['marquee', 'tooltip'],
    summary: 'Text Ticker truncates text and can reveal overflow with a measured marquee.',
    usage: 'Keep the full text accessible elsewhere and avoid autoplay for essential reading.',
    usageExports: ['TextTicker'],
  },
  textarea: {
    relatedSlugs: ['input', 'field'],
    summary:
      'Textarea provides the shared multiline field with size, invalid, disabled, and unstyled states.',
    usage:
      'Pair it with a label and set a useful minimum height without preventing content growth.',
    usageExports: ['Textarea'],
  },
  toaster: {
    additionalValueExports: ['toast'],
    relatedSlugs: ['alert', 'feedback-state', 'copy-button'],
    summary:
      'Toaster is the app-level host for transient messages raised through the exported toast API.',
    usage:
      'Mount one host near the app root and keep messages concise, actionable, and non-essential.',
    usageExports: ['Toaster', 'toast'],
  },
  toggle: {
    relatedSlugs: ['toggle-group', 'button', 'checkbox'],
    summary: 'Toggle is a pressed control for one independently persistent option.',
    usage: 'Expose pressed state with a clear label; use Button for one-shot actions.',
    usageExports: ['Toggle'],
  },
  'toggle-group': {
    relatedSlugs: ['toggle', 'segmented-control', 'button-group'],
    summary: 'Toggle Group coordinates single or multiple pressed controls on a shared track.',
    usage: 'Choose single or multiple selection deliberately and label icon-only items.',
    usageExports: ['ToggleGroup', 'ToggleGroupItem', 'ToggleGroupSeparator'],
  },
  tooltip: {
    relatedSlugs: ['popover', 'hover-card', 'kbd'],
    summary: 'Tooltip supplies brief supplementary text for a hover- or focusable trigger.',
    usage:
      'Do not put interactive or essential content in a tooltip; keep the trigger independently labelled.',
    usageExports: ['TooltipProvider', 'Tooltip', 'TooltipTrigger', 'TooltipContent'],
  },
}

const canvasPreviewComponents = new Set([
  'calendar',
  'carousel',
  'command',
  'navigation-menu',
  'resizable',
  'scroll-area',
  'scrollable-list',
  'sidebar',
  'sidebar-nav-tree',
  'table',
])

const standardPreviewComponents = new Set([
  'accordion',
  'alert-dialog',
  'autocomplete',
  'card',
  'connected-panel',
  'context-menu',
  'dialog',
  'drawer',
  'dropdown-menu',
  'empty',
  'feedback-state',
  'form',
  'input-otp',
  'item',
  'menubar',
  'popover',
  'preview-card',
  'select',
  'sheet',
  'toaster',
])

const storyExportOverrides: Record<string, string> = {
  command: 'Inline',
  'destination-link': 'Internal',
  'load-more-trigger': 'States',
  progress: 'WithLabelAndValue',
  resizable: 'Horizontal',
  sidebar: 'DocsPreview',
  skeleton: 'CardPlaceholder',
}

function component(slug: string, category: string): ComponentCatalogItem {
  const definition = componentDefinitions[slug]
  if (!definition) {
    throw new Error(`Missing component catalog definition: ${slug}`)
  }

  return {
    ...definition,
    category,
    importPath: '@atom63/ui-react',
    previewProfile: canvasPreviewComponents.has(slug)
      ? 'canvas'
      : standardPreviewComponents.has(slug)
        ? 'standard'
        : 'compact',
    slug,
    status: 'stable',
    storyExport: storyExportOverrides[slug] ?? 'Playground',
  }
}

function components(category: string, slugs: readonly string[]) {
  return slugs.map(slug => component(slug, category))
}

export const componentCatalogGroups = [
  {
    description: 'Actions and links that perform work or move to a destination.',
    id: 'actions',
    items: components('actions', ['button', 'button-group', 'copy-button', 'destination-link']),
    title: 'Actions',
  },
  {
    description: 'Input, selection, validation, and structured form composition.',
    id: 'forms-and-selection',
    items: components('forms-and-selection', [
      'autocomplete',
      'calendar',
      'checkbox',
      'field',
      'form',
      'input',
      'input-otp',
      'label',
      'panel-setting-button',
      'radio',
      'segmented-control',
      'search-field',
      'select',
      'slider',
      'switch',
      'textarea',
      'toggle',
      'toggle-group',
    ]),
    title: 'Forms and selection',
  },
  {
    description: 'Wayfinding, commands, menus, and movement between views.',
    id: 'navigation',
    items: components('navigation', [
      'breadcrumb',
      'command',
      'context-menu',
      'dropdown-menu',
      'menubar',
      'navigation-menu',
      'pagination',
      'sidebar',
      'sidebar-nav-tree',
      'tabs',
    ]),
    title: 'Navigation',
  },
  {
    description: 'Layered surfaces that manage focus, context, and temporary detail.',
    id: 'overlays',
    items: components('overlays', [
      'alert-dialog',
      'dialog',
      'drawer',
      'hover-card',
      'popover',
      'portal-container',
      'preview-card',
      'sheet',
      'tooltip',
    ]),
    title: 'Overlays',
  },
  {
    description: 'Structures for grouping, presenting, and scrolling through content.',
    id: 'content-and-surfaces',
    items: components('content-and-surfaces', [
      'accordion',
      'alert',
      'avatar',
      'badge',
      'card',
      'carousel',
      'collapsible',
      'connected-panel',
      'empty',
      'feedback-state',
      'frame',
      'item',
      'scroll-area',
      'scrollable-list',
      'separator',
      'table',
    ]),
    title: 'Content and surfaces',
  },
  {
    description: 'Progress, motion, loading, keyboard notation, and layout helpers.',
    id: 'feedback-and-utilities',
    items: components('feedback-and-utilities', [
      'animated-check',
      'kbd',
      'load-more-trigger',
      'marquee',
      'progress',
      'progressive-blur',
      'resizable',
      'skeleton',
      'spinner',
      'text-ticker',
      'toaster',
    ]),
    title: 'Feedback and utilities',
  },
] as const satisfies readonly ComponentCatalogGroup[]

export const componentCatalogItems = componentCatalogGroups.flatMap(group => group.items)

export function componentDocSlug(slug: string): string {
  return `component-${slug}`
}

export function componentDocPath(slug: string): string {
  return `/components/${componentDocSlug(slug)}`
}

export function componentSlugFromDocSlug(docSlug: string): string | null {
  if (!docSlug.startsWith('component-')) {
    return null
  }

  const componentSlug = docSlug.slice('component-'.length)
  return componentCatalogItems.some(item => item.slug === componentSlug) ? componentSlug : null
}

export function componentCatalogGroupForSlug(slug: string): ComponentCatalogGroup | undefined {
  return componentCatalogGroups.find(group => group.items.some(item => item.slug === slug))
}

const componentLabelOverrides: Record<string, string> = {
  'input-otp': 'Input OTP',
  kbd: 'Kbd',
}

export function componentLabel(slug: string): string {
  const override = componentLabelOverrides[slug]
  if (override) {
    return override
  }

  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
