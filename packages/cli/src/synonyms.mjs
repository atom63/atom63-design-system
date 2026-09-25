/**
 * Words people use for a component that differ from its name. Search expands
 * a query term with these before scoring, so "modal" finds `dialog`. Values
 * are catalog slugs, most fitting first: the first gets the largest boost.
 * The golden queries in core.test.mjs cover them.
 */
export const synonyms = {
  bar: ['progress'],
  checkmark: ['animated-check', 'checkbox'],
  chip: ['badge', 'toggle'],
  combobox: ['autocomplete', 'select'],
  date: ['calendar'],
  disclosure: ['collapsible', 'accordion'],
  divider: ['separator'],
  dropdown: ['dropdown-menu', 'select'],
  expand: ['collapsible', 'accordion'],
  grid: ['table'],
  hint: ['tooltip', 'kbd'],
  keyboard: ['kbd'],
  label: ['label', 'badge'],
  loader: ['spinner', 'skeleton', 'progress'],
  loading: ['spinner', 'skeleton', 'progress'],
  modal: ['dialog', 'alert-dialog', 'drawer', 'sheet'],
  notification: ['toaster', 'alert'],
  otp: ['input-otp'],
  pager: ['pagination'],
  palette: ['command'],
  panel: ['sheet', 'drawer', 'card'],
  picker: ['select', 'calendar', 'segmented-control'],
  pill: ['badge'],
  popup: ['popover', 'hover-card', 'tooltip'],
  profile: ['avatar'],
  range: ['slider'],
  shortcut: ['kbd'],
  snackbar: ['toaster'],
  spinner: ['spinner'],
  stepper: ['progress'],
  switcher: ['segmented-control', 'tabs', 'toggle-group'],
  tag: ['badge'],
  textbox: ['input', 'textarea'],
  toast: ['toaster'],
  toggle: ['switch', 'toggle', 'toggle-group'],
}
