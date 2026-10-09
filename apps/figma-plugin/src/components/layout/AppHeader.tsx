import { Badge } from '@atom63/ui-react'
import { Moon, Sun } from 'lucide-react'
import { AnimatedLogo } from '../common/icon/cipher/app-logo'
import { Button } from '../ui'
import styles from './AppHeader.module.css'

interface AppHeaderProps {
  isDark: boolean
  onToggleTheme: () => void
}

export function AppHeader({ isDark, onToggleTheme }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <AnimatedLogo colored height={18} />
        <Badge className={styles.beta} variant="outline">
          Beta
        </Badge>
      </div>
      <div className={styles.actions}>
        <Button
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggleTheme}
          size="icon-sm"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          variant="ghost"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </Button>
      </div>
    </header>
  )
}
