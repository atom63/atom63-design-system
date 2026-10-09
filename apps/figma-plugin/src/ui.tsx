/**
 * Cipher by Atom63: a token table for this Figma file, created from a few
 * choices or imported from a project's token CSS, or the Atom63 design system
 * itself. You Zhang (ATOM63).
 */
import { UIProvider } from '@atom63/ui-react'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Atom63 } from './app/Atom63'
import { Create } from './app/Create'
import { Home } from './app/Home'
import { Import } from './app/Import'
import { AppHeader } from './components/layout'
import { ErrorBoundary, PageErrorBoundary, ToastProvider } from './components/ui'
import { TooltipPortal } from './components/ui/Tooltip'
import { useFigmaMessage, usePostMessage } from './hooks/useFigmaMessage'
import type { DesignSystemTable } from './messages'
import { applyTheme } from './utils/theme'

type View = 'home' | 'create' | 'import' | 'atom63'

function App() {
  const [view, setView] = useState<View>('home')
  const [atom63Table, setAtom63Table] = useState<DesignSystemTable | null>(null)
  const [isDark, setIsDark] = useState(() => document.documentElement.dataset.a63Mode === 'dark')
  const postMessage = usePostMessage()

  useEffect(() => postMessage({ type: 'load-settings' }), [postMessage])
  useFigmaMessage(message => {
    if (message.type === 'settings') {
      applyTheme(message.data.theme)
      setIsDark(document.documentElement.dataset.a63Mode === 'dark')
    }
  })

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    applyTheme(next, true)
    postMessage({ type: 'save-settings', data: { theme: next } })
  }
  const home = () => setView('home')

  return (
    <div className="plugin-container">
      <AppHeader isDark={isDark} onToggleTheme={toggleTheme} />
      <div className="plugin-main">
        <PageErrorBoundary pageName={view}>
          {view === 'home' && (
            <Home
              onAtom63={table => {
                setAtom63Table(table)
                setView('atom63')
              }}
              onCreate={() => setView('create')}
              onImport={() => setView('import')}
            />
          )}
          {view === 'create' && <Create onDone={home} />}
          {view === 'import' && <Import onDone={home} />}
          {view === 'atom63' && <Atom63 initialTable={atom63Table} onDone={home} />}
        </PageErrorBoundary>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
// Follow Figma's theme until the saved setting loads, so the first paint has a mode.
applyTheme('system')
if (container)
  createRoot(container).render(
    <ErrorBoundary>
      <UIProvider className="plugin-root">
        <ToastProvider>
          <App />
          <TooltipPortal />
        </ToastProvider>
      </UIProvider>
    </ErrorBoundary>
  )
