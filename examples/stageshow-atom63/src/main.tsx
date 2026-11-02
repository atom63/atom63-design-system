import '@atom63/styles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './demo.css'
import './look.css'
import { BrandSwitch, type Mode, type Theme } from './brand-switch'

// ?mode=dark and ?theme=aqua set the page's Atom63 mode and theme, so one
// demo can be filmed across both.
const params = new URLSearchParams(window.location.search)
const mode: Mode = params.get('mode') === 'dark' ? 'dark' : 'light'
const theme = (params.get('theme') ?? 'modern') as Theme
document.documentElement.dataset.a63Mode = mode
document.documentElement.dataset.a63Theme = theme

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <main className="demo">
      <div id="example">
        <BrandSwitch mode={mode} theme={theme} />
      </div>
    </main>
  </StrictMode>
)
