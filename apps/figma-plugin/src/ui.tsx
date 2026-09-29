/**
 * Cipher - Figma Design System Plugin
 * Author: You Zhang (ATOM63)
 */

import { UIProvider } from '@atom63/ui-react'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AppHeader, type PageId, Sidebar, type ViewMode } from './components/layout'
import { ErrorBoundary, PageErrorBoundary, ToastProvider } from './components/ui'
import { TooltipPortal } from './components/ui/Tooltip'
import { useDebugMode } from './hooks/useDebugMode'
import { useFigmaMessage, usePostMessage } from './hooks/useFigmaMessage'
import { AboutPage } from './pages/AboutPage'
import { ManageTabsPage } from './pages/ManageTabsPage'
import { SyncPage } from './pages/SyncPage'
import type { PluginSettings } from './types/messages'
import { applyTheme } from './utils/theme'

function App() {
  const [activePage, setActivePage] = useState<PageId>('sync')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('default')
  // The mode in effect, so the toggle's first press always switches it.
  const [isDark, setIsDark] = useState(() => document.documentElement.dataset.a63Mode === 'dark')
  const postMessage = usePostMessage()
  useDebugMode()

  // Load theme on startup
  useEffect(() => {
    postMessage({ type: 'load-settings' })
  }, [postMessage])

  useFigmaMessage(msg => {
    if (msg.type === 'settings-loaded' && msg.data?.theme) {
      const t = msg.data.theme as PluginSettings['theme']
      applyTheme(t)
      setIsDark(document.documentElement.dataset.a63Mode === 'dark')
    }
  })

  const toggleViewMode = () => {
    const newMode = viewMode === 'default' ? 'compact' : 'default'
    setViewMode(newMode)
    postMessage({ type: 'resize-window', data: { mode: newMode } })
  }

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    applyTheme(next, true)
    postMessage({ type: 'save-settings', data: { theme: next } })
  }

  const renderPage = () => {
    switch (activePage) {
      case 'sync':
        return (
          <PageErrorBoundary pageName="Sync">
            <SyncPage />
          </PageErrorBoundary>
        )
      case 'manage':
        return (
          <PageErrorBoundary pageName="Manage">
            <ManageTabsPage onNavigate={page => setActivePage(page as PageId)} />
          </PageErrorBoundary>
        )
      case 'about':
        return (
          <PageErrorBoundary pageName="About">
            <AboutPage />
          </PageErrorBoundary>
        )
      default:
        return (
          <PageErrorBoundary pageName="Manage">
            <ManageTabsPage onNavigate={page => setActivePage(page as PageId)} />
          </PageErrorBoundary>
        )
    }
  }

  return (
    <div className="plugin-container">
      <AppHeader
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onToggleViewMode={toggleViewMode}
        viewMode={viewMode}
      />

      {/* Main Layout with Sidebar */}
      <div className="plugin-layout">
        <Sidebar
          activePage={activePage}
          collapsed={sidebarCollapsed}
          onPageChange={setActivePage}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Page Content */}
        <div className="plugin-main-clip">
          <div className="plugin-main">{renderPage()}</div>
        </div>
      </div>
    </div>
  )
}

const container = document.getElementById('root')

// Follow Figma's theme until the saved setting loads, so the first paint has a mode.
applyTheme('system')

if (container) {
  try {
    const root = createRoot(container)
    root.render(
      <ErrorBoundary>
        <UIProvider className="plugin-root">
          <ToastProvider>
            <App />
            <TooltipPortal />
          </ToastProvider>
        </UIProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('[Cipher] Failed to mount UI:', error)
  }
}
