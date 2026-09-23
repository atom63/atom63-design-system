import { createThemeProvider } from '@atom63/ui-react/theme'

export const { ThemeProvider, useTheme } = createThemeProvider({
  storageKey: 'ds-theme',
  defaultTheme: 'dark',
  modes: ['light', 'dark', 'system'],
  viewTransition: false,
})
