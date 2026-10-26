/**
 * Words people use for a component that differ from its name. Search expands
 * a query term with these before scoring, so "modal" finds `dialog`. Values
 * are catalog slugs, or token CSS variables (`--a63-…`) that then join the
 * results of any search, most fitting first: the first gets the largest boost.
 * The golden queries in core.test.mjs cover them.
 */
export const synonyms = {
  bar: ['progress'],
  bubble: ['chat-message'],
  chatbot: ['chat-message', 'chat-composer'],
  checkmark: ['animated-check', 'checkbox'],
  chip: ['toggle-group', 'toggle', 'button', 'badge'],
  choice: ['radio', 'field'],
  combobox: ['autocomplete', 'select'],
  compact: ['table', 'item'],
  composer: ['chat-composer'],
  counter: ['button', 'badge'],
  date: ['calendar'],
  dense: ['table', 'item'],
  density: ['table', 'item'],
  disclosure: ['collapsible', 'accordion'],
  divider: ['separator'],
  dots: ['carousel'],
  dropdown: ['dropdown-menu', 'select'],
  expand: ['collapsible', 'accordion'],
  fold: ['sidebar-nav-tree', 'collapsible', 'accordion'],
  folding: ['sidebar-nav-tree', 'collapsible', 'accordion'],
  gradient: [
    '--a63-gradient-brand-fade',
    '--a63-gradient-brand',
    '--a63-gradient-scrim',
    '--a63-gradient-brand-subtle',
  ],
  grid: ['table'],
  hero: ['--a63-gradient-brand-fade', '--a63-gradient-brand'],
  hint: ['tooltip', 'kbd'],
  keyboard: ['kbd'],
  label: ['label', 'badge'],
  loader: ['spinner', 'skeleton', 'progress'],
  loading: ['spinner', 'skeleton', 'progress'],
  modal: ['dialog', 'alert-dialog', 'drawer', 'sheet'],
  nav: ['sidebar-nav-tree', 'navigation-menu', 'sidebar'],
  notification: ['toaster', 'alert'],
  otp: ['input-otp'],
  pager: ['pagination'],
  palette: ['command'],
  panel: ['sheet', 'drawer', 'card'],
  picker: ['select', 'calendar', 'segmented-control'],
  pill: ['toggle-group', 'badge'],
  popup: ['popover', 'hover-card', 'tooltip'],
  profile: ['avatar'],
  range: ['slider'],
  review: ['rating'],
  row: ['item', 'table'],
  selectable: ['radio', 'toggle-group'],
  sheet: ['drawer', 'sheet'],
  shortcut: ['kbd'],
  slideshow: ['carousel'],
  snackbar: ['toaster'],
  spinner: ['spinner'],
  star: ['rating'],
  stars: ['rating'],
  stepper: ['progress'],
  switcher: ['segmented-control', 'tabs', 'toggle-group'],
  tag: ['badge'],
  textbox: ['input', 'textarea'],
  tile: ['radio', 'field'],
  toast: ['toaster'],
  toggle: ['switch', 'toggle', 'toggle-group'],
  typing: ['chat-typing-indicator'],
  tree: ['sidebar-nav-tree'],
  unread: ['button', 'badge'],
}

/*
 * Entries other than components that a word or phrase should surface:
 * tokens, docs pages, story examples and templates, as `kind:id`. Search adds
 * each one for a query that contains the key (as whole words), even a token
 * or an example it would not list otherwise, and ranks the first highest.
 * `note` replaces the entry's summary, to say what to use from it. The golden
 * queries in core.test.mjs cover them.
 */
const gradients = [
  {
    id: 'token:--a63-gradient-brand',
    note: 'Brand gradient for heroes and banners: background-image, bg-(image:--a63-gradient-brand).',
  },
  {
    id: 'token:--a63-gradient-brand-subtle',
    note: 'Quiet brand gradient for illustration backgrounds and cards.',
  },
  {
    id: 'token:--a63-gradient-scrim',
    note: 'Fade to dark under text over a photo, such as a hero title.',
  },
  { id: 'doc:foundation-colors', note: 'Colors page, "Gradients": the four gradient tokens.' },
  {
    id: 'token:--a63-gradient-brand-fade',
    note: 'Hero that fades from the brand into the page; keep overlay controls in its dark zone.',
  },
]

const displayType = [
  {
    id: 'doc:foundation-typography',
    note: 'Display roles text-display (40px) and text-display-large (56px) for balances, prices and hero numbers; wrap cents in amount-fraction. iOS: AtomAmountText(13.25, currencyCode: "USD") and .atomDisplayFont().',
  },
  {
    id: 'token:--a63-type-display-font-size',
    note: 'The display text role (10xl, 40px): Tailwind text-display or text-display-strong; iOS AtomDisplayRole.display.',
  },
  {
    id: 'token:--a63-type-display-large-font-size',
    note: 'The display-large text role (11xl, 56px): Tailwind text-display-large; iOS AtomDisplayRole.displayLarge.',
  },
]

const persistentSheet = [
  {
    id: 'example:drawer/PersistentSheet',
    note: 'A non-modal bottom sheet over a map: <Drawer modal={false} snapPoints={…}>.',
  },
  { id: 'component:drawer' },
]

const iosTabBar = {
  id: 'component:tabs',
  note: "iOS: the native TabView, each tab's root its ScrollView or List. The floating iOS 26 bar insets that scroll view, so the last row ends above it; no bottom padding, overlay or bottom ignoresSafeArea.",
}

const tabBar = [
  { id: 'template:tab-bar' },
  {
    id: 'template:app-view',
    note: 'App view with layout="phone": edge to edge, safe-area aware, the tab bar docked at the bottom.',
  },
  iosTabBar,
]

const phoneApp = [
  {
    id: 'template:app-view',
    note: 'App view with layout="phone": edge to edge, safe-area aware, the tab bar docked at the bottom.',
  },
  { id: 'template:tab-bar' },
]

const chatSurfaces = [
  {
    id: 'template:chat-panel',
    note: 'Assistant side panel beside the product: transcript, tool steps, start screen with suggestions, composer with send and stop.',
  },
  {
    id: 'template:chat-page',
    note: 'Full-page assistant with conversation history in the sidebar and a start screen with a large composer.',
  },
  { id: 'component:chat-message' },
  { id: 'component:chat-composer' },
  {
    id: 'doc:pattern-agent',
    note: '@atom63/agent, the headless runtime: map its messages and status onto the chat components.',
  },
]

const chatComposer = [
  {
    id: 'component:chat-composer',
    note: 'ChatComposer: growing textarea, attach slot, send that turns into stop while streaming, Enter to send.',
  },
  { id: 'template:chat-panel' },
]

const chatSteps = [
  {
    id: 'component:chat-steps',
    note: 'ChatSteps and ChatStep: a collapsible list of tool and thinking steps with status icons.',
  },
]

const typingIndicator = [
  {
    id: 'component:chat-typing-indicator',
    note: 'ChatTypingIndicator: three dots in place of the reply until its first text, a polite status.',
  },
]

const aiDisclaimer = [
  {
    id: 'example:chat-composer/Playground',
    note: 'ChatComposer footnote="AI can make mistakes. Check important info." under the field.',
  },
  { id: 'component:chat-composer' },
]

export const topics = {
  amount: displayType,
  balance: displayType,
  'big number': displayType,
  cents: displayType,
  currency: displayType,
  display: displayType,
  fraction: displayType,
  'large number': displayType,
  price: displayType,
  fade: [gradients[4], gradients[2], gradients[0], gradients[1], gradients[3]],
  gradient: [gradients[4], ...gradients.slice(0, 4)],
  gradients: [gradients[4], ...gradients.slice(0, 4)],
  hero: [gradients[4], gradients[0], displayType[2], gradients[2], gradients[3]],
  scrim: [gradients[2], gradients[3]],
  'bottom sheet': persistentSheet,
  'non modal': persistentSheet,
  'over map': persistentSheet,
  persistent: persistentSheet,
  'snap points': persistentSheet,
  'bottom nav': tabBar,
  'bottom navigation': tabBar,
  'bottom tabs': tabBar,
  'tab bar': tabBar,
  tabbar: tabBar,
  tabview: [iosTabBar],
  'ios tab bar': [iosTabBar],
  'swiftui tab bar': [iosTabBar],
  'edge to edge': phoneApp,
  'mobile app': phoneApp,
  'phone app': phoneApp,
  'phone screen': phoneApp,
  agent: [chatSurfaces[4], chatSurfaces[0], chatSurfaces[1]],
  'chat history': [chatSurfaces[1], chatSurfaces[0]],
  'chat page': [chatSurfaces[1], chatSurfaces[0]],
  'full page chat': [chatSurfaces[1], chatSurfaces[0]],
  'ai assistant': chatSurfaces,
  'ai chat': chatSurfaces,
  assistant: chatSurfaces,
  chat: chatSurfaces,
  chatbot: chatSurfaces,
  copilot: chatSurfaces,
  'chat bubble': [{ id: 'component:chat-message' }],
  'chat message': [{ id: 'component:chat-message' }, chatSurfaces[0]],
  'chat composer': chatComposer,
  'message bubble': [{ id: 'component:chat-message' }],
  'chat input': chatComposer,
  'message composer': chatComposer,
  'prompt box': chatComposer,
  'prompt input': chatComposer,
  'send button': chatComposer,
  'stop button': chatComposer,
  reasoning: chatSteps,
  thinking: chatSteps,
  'tool calls': chatSteps,
  'tool steps': chatSteps,
  'typing dots': typingIndicator,
  'typing indicator': typingIndicator,
  'ai disclaimer': aiDisclaimer,
  'ai can make mistakes': aiDisclaimer,
}
