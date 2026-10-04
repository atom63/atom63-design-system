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
        <span className={styles.beta}>BETA</span>
      </div>
      <div className={styles.actions}>
        <Button
          onClick={onToggleTheme}
          size="icon-sm"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          variant="ghost"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </Button>
      </div>
    </header>
  )
}
