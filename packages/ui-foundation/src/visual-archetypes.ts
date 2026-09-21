export const visualArchetypeIds = [
  'action',
  'toggle',
  'choice',
  'field',
  'range',
  'segment',
  'marker',
  'trigger',
  'menu',
  'overlay',
  'surface',
] as const

export type VisualArchetypeId = (typeof visualArchetypeIds)[number]

export interface VisualArchetype {
  id: VisualArchetypeId
  label: string
  description: string
  components: readonly string[]
  contracts: readonly string[]
}

export const visualArchetypes = {
  action: {
    id: 'action',
    label: 'Action controls',
    description: 'Momentary controls that perform an action now.',
    components: [
      'Button',
      'IconButton',
      'CopyButton',
      'DestinationLink',
      'DialogClose',
      'DrawerClose',
      'SplitButton',
      'ButtonGroup',
    ],
    contracts: ['control', 'action'],
  },
  toggle: {
    id: 'toggle',
    label: 'Toggle controls',
    description: 'Persistent on/off or pressed controls.',
    components: ['Toggle', 'ToggleGroup'],
    contracts: ['control', 'toggle', 'segment'],
  },
  choice: {
    id: 'choice',
    label: 'Choice controls',
    description: 'Form controls that expose checked, selected, or indeterminate value state.',
    components: ['Checkbox', 'Radio', 'Switch'],
    contracts: ['control', 'choice', 'selection'],
  },
  field: {
    id: 'field',
    label: 'Field controls',
    description: 'Editable or field-like data-entry surfaces.',
    components: ['Input', 'Textarea', 'InputOTP', 'SelectTrigger', 'AutocompleteInput', 'Form'],
    contracts: ['control', 'field', 'trigger'],
  },
  range: {
    id: 'range',
    label: 'Range and track controls',
    description: 'Controls or indicators that represent a value along a rail.',
    components: ['Slider', 'Progress', 'Scrollbar'],
    contracts: ['control', 'track'],
  },
  segment: {
    id: 'segment',
    label: 'Segmented selection',
    description: 'One-of-many peer selections presented as a shared track or grouped row.',
    components: ['SegmentedControl', 'Tabs'],
    contracts: ['control', 'track', 'segment'],
  },
  marker: {
    id: 'marker',
    label: 'Markers and keycaps',
    description: 'Compact presentational labels, statuses, and keyboard hints.',
    components: ['Avatar', 'Badge', 'Kbd'],
    contracts: ['marker'],
  },
  trigger: {
    id: 'trigger',
    label: 'Triggers',
    description: 'Controls whose primary job is to open another surface.',
    components: [
      'DropdownMenuTrigger',
      'DialogTrigger',
      'DrawerTrigger',
      'MenuTrigger',
      'MenubarTrigger',
      'NavigationMenuTrigger',
      'PopoverTrigger',
      'SelectTrigger',
      'ConnectedPanelTrigger',
      'CollapsibleTrigger',
    ],
    contracts: ['control', 'trigger'],
  },
  menu: {
    id: 'menu',
    label: 'Menus and option lists',
    description: 'Dense action or selection rows inside a floating or embedded list.',
    components: [
      'Menu',
      'ContextMenu',
      'DropdownMenu',
      'MenuItem',
      'CommandItem',
      'SelectItem',
      'AutocompleteItem',
    ],
    contracts: ['menu', 'overlay'],
  },
  overlay: {
    id: 'overlay',
    label: 'Overlay surfaces',
    description: 'Floating material above the page or current surface.',
    components: ['Popover', 'Tooltip', 'HoverCard', 'Dialog', 'Drawer', 'Sheet', 'AlertDialog'],
    contracts: ['overlay'],
  },
  surface: {
    id: 'surface',
    label: 'Static content surfaces',
    description: 'In-flow containers and content surfaces that do not inherently manipulate state.',
    components: [
      'Card',
      'Frame',
      'Alert',
      'ConnectedPanel',
      'DialogPopup',
      'DrawerContent',
      'Empty',
      'Table',
      'List',
      'Toaster',
    ],
    contracts: ['surface'],
  },
} as const satisfies Record<VisualArchetypeId, VisualArchetype>
