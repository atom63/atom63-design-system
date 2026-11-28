import './styles.css'

import { Toaster } from '@atom63/ui-react'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppearanceProvider } from './appearance'
import { router } from './router'
import { AccountsProvider } from './store'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <AppearanceProvider>
      <AccountsProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AccountsProvider>
    </AppearanceProvider>
  </StrictMode>
)
