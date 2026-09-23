/** Tailwind / shadcn design surface → canonical `--a63-*` roles. */

export const SEMANTIC_ALIAS_MAP = [
  {
    utility: 'bg-background',
    shadcn: '--background',
    a63: '--a63-surface-page',
    meaning: 'Page canvas',
  },
  {
    utility: 'bg-card',
    shadcn: '--card',
    a63: '--a63-surface-panel',
    meaning: 'Static panel / card',
  },
  {
    utility: 'bg-popover',
    shadcn: '--popover',
    a63: '--a63-surface-overlay',
    meaning: 'Floating overlay surface',
  },
  {
    utility: 'bg-muted',
    shadcn: '--muted',
    a63: '--a63-surface-muted',
    meaning: 'Secondary fill / recessed plate',
  },
  {
    utility: 'bg-accent',
    shadcn: '--accent',
    a63: '--a63-surface-control-hover',
    meaning: 'Hover / active plate',
  },
  {
    utility: 'text-foreground',
    shadcn: '--foreground',
    a63: '--a63-text-primary',
    meaning: 'Primary text',
  },
  {
    utility: 'text-muted-foreground',
    shadcn: '--muted-foreground',
    a63: '--a63-text-secondary',
    meaning: 'Secondary / helper text',
  },
  {
    utility: 'border-border',
    shadcn: '--border',
    a63: '--a63-border-subtle',
    meaning: 'Default divider / edge',
  },
  {
    utility: 'border-input',
    shadcn: '--input',
    a63: '--a63-border-control',
    meaning: 'Control / field edge',
  },
  {
    utility: 'bg-primary / text-primary',
    shadcn: '--primary',
    a63: '--a63-action-primary',
    meaning: 'Brand action / accent',
  },
  {
    utility: 'text-primary-foreground',
    shadcn: '--primary-foreground',
    a63: '--a63-action-primary-foreground',
    meaning: 'Text on primary fill',
  },
  {
    utility: 'bg-destructive / text-destructive',
    shadcn: '--destructive',
    a63: '--a63-action-danger',
    meaning: 'Danger action',
  },
  {
    utility: 'ring-ring',
    shadcn: '--ring',
    a63: '--a63-focus-ring',
    meaning: 'Focus ring',
  },
  {
    utility: 'bg-info / text-info',
    shadcn: '--info',
    a63: '--a63-status-info',
    meaning: 'Info status',
  },
  {
    utility: 'bg-success / text-success',
    shadcn: '--success',
    a63: '--a63-status-success',
    meaning: 'Success status',
  },
  {
    utility: 'bg-warning / text-warning',
    shadcn: '--warning',
    a63: '--a63-status-warning',
    meaning: 'Warning status',
  },
] as const
