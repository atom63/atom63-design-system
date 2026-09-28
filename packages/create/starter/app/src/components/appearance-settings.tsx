import { type Theme, themes } from '@atom63/ui-foundation'
import { type Atom63ThemeMode, Label, Radio, RadioGroup } from '@atom63/ui-react'
import { useId } from 'react'

import { SettingsSection } from '../templates/blocks/settings-section/settings-section'
import { themeLabels, useAppearance } from '../theme'

type Option = { label: string; value: string }

/* One labelled choice: the row's label and description name the radio group. */
function ChoiceRow({
  description,
  label,
  onValueChange,
  options,
  value,
}: {
  description: string
  label: string
  onValueChange: (value: string) => void
  options: Option[]
  value: string
}) {
  const labelId = useId()
  const descriptionId = useId()
  const optionId = useId()
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-foreground text-sm font-medium" id={labelId}>
          {label}
        </span>
        <span className="text-muted-foreground text-sm" id={descriptionId}>
          {description}
        </span>
      </div>
      <RadioGroup
        aria-describedby={descriptionId}
        aria-labelledby={labelId}
        onValueChange={next => onValueChange(String(next))}
        value={value}
      >
        {options.map(option => (
          <div className="flex items-center gap-2" key={option.value}>
            <Radio id={`${optionId}-${option.value}`} value={option.value} />
            <Label className="text-sm" htmlFor={`${optionId}-${option.value}`}>
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

/*
 * The app's appearance, in settings so every width can reach it (the top bar
 * shows the same switches from `sm` up). It changes the theme and mode that
 * src/theme.tsx applies through Atom63Theme.
 */
export function AppearanceSettings() {
  const { mode, setMode, setTheme, theme } = useAppearance()
  return (
    <SettingsSection
      description="How the app looks on this device. It is remembered in this browser."
      title="Appearance"
    >
      <ChoiceRow
        description="The system's look: color, type and shape."
        label="Theme"
        onValueChange={value => setTheme(value as Theme)}
        options={themes.map(value => ({ label: themeLabels[value], value }))}
        value={theme}
      />
      <ChoiceRow
        description="Light or dark surfaces."
        label="Mode"
        onValueChange={value => setMode(value as Atom63ThemeMode)}
        options={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
        value={mode}
      />
    </SettingsSection>
  )
}
