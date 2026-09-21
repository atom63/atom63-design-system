import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLabel,
  CardTitle,
  Input,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from '@atom63/ui-react'
import { useEffect, useState } from 'react'

type Mode = 'dark' | 'light'
type Theme = 'aqua' | 'modern'

const checks = [
  ['Package exports', '12 entry points resolved'],
  ['Token manifest', '214 semantic tokens synced'],
  ['Consumer build', 'Vite production bundle passed'],
] as const

function ChoiceGroup<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: T) => void
  options: readonly T[]
  value: T
}) {
  return (
    <div aria-label={label} className="choice-group" role="group">
      <span className="choice-label">{label}</span>
      <div className="choice-actions">
        {options.map(option => (
          <Button
            aria-pressed={value === option}
            key={option}
            onClick={() => onChange(option)}
            size="sm"
            type="button"
            variant={value === option ? 'primary' : 'ghost'}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function App() {
  const [mode, setMode] = useState<Mode>('light')
  const [theme, setTheme] = useState<Theme>('modern')
  const [tag, setTag] = useState('next')
  const [reviewCount, setReviewCount] = useState(1)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.a63Mode = mode
    root.dataset.a63Theme = theme
    root.style.colorScheme = mode
  }, [mode, theme])

  return (
    <div className="app-shell">
      <header className="topbar">
        <a aria-label="Atom63 example home" className="wordmark" href="#main-content">
          <span aria-hidden="true" className="wordmark-mark">
            A63
          </span>
          <span>Adopter workspace</span>
        </a>

        <div className="preferences">
          <ChoiceGroup
            label="Color mode"
            onChange={setMode}
            options={['light', 'dark'] as const}
            value={mode}
          />
          <ChoiceGroup
            label="Theme"
            onChange={setTheme}
            options={['modern', 'aqua'] as const}
            value={theme}
          />
        </div>
      </header>

      <main id="main-content">
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy">
            <div className="eyebrow">
              <span>Release desk / Vite</span>
              <Badge variant="success">Adopter ready</Badge>
            </div>
            <h1 id="page-title">Ship the packages, not the promise.</h1>
            <p>
              A focused consumer check for Atom63’s React components, executable tokens, and theme
              contract.
            </p>
          </div>
          <p className="release-id">
            <span>Review</span>
            DS-042
          </p>
        </section>

        <section className="workspace" aria-label="Package release readiness">
          <Card className="release-card">
            <CardHeader>
              <CardLabel>Release candidate</CardLabel>
              <CardAction>
                <Badge variant="outline">v0.1.1</Badge>
              </CardAction>
            </CardHeader>

            <CardContent padding={{ base: 'sm', sm: 'lg' }}>
              <div className="package-heading">
                <CardTitle>@atom63/ui-react</CardTitle>
                <CardDescription>
                  Validate the public surface before handing it to the next application.
                </CardDescription>
              </div>

              <label className="tag-field" htmlFor="release-tag">
                <span>Registry tag</span>
                <Input
                  id="release-tag"
                  onChange={event => setTag(event.target.value)}
                  spellCheck={false}
                  value={tag}
                />
              </label>

              <Tabs defaultValue="checks">
                <TabsList variant="underline">
                  <TabsTab value="checks">Readiness</TabsTab>
                  <TabsTab value="install">Install</TabsTab>
                </TabsList>

                <TabsPanel className="tab-panel" value="checks">
                  <ul className="checklist">
                    {checks.map(([name, detail]) => (
                      <li key={name}>
                        <span aria-hidden="true" className="check-mark">
                          ✓
                        </span>
                        <span className="check-copy">
                          <strong>{name}</strong>
                          <small>{detail}</small>
                        </span>
                        <Badge size="sm" variant="success">
                          Passed
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </TabsPanel>

                <TabsPanel className="tab-panel" value="install">
                  <pre className="code-block">
                    <code>{`pnpm add @atom63/styles @atom63/ui-react\n\nimport '@atom63/styles'\nimport '@atom63/ui-react/styles.css'`}</code>
                  </pre>
                </TabsPanel>
              </Tabs>
            </CardContent>

            <CardFooter>
              <p className="review-note" aria-live="polite">
                Review {reviewCount} passed · publish as <strong>{tag || 'next'}</strong>
              </p>
              <CardAction>
                <Button
                  onClick={() => setReviewCount(count => count + 1)}
                  type="button"
                  variant="primary"
                >
                  Re-run review
                </Button>
              </CardAction>
            </CardFooter>
          </Card>

          <aside className="consumer-proof" aria-labelledby="consumer-proof-title">
            <div>
              <span className="section-index">01</span>
              <p className="section-kicker">Consumer proof</p>
            </div>
            <h2 id="consumer-proof-title">This screen is the integration test.</h2>
            <p>
              Every visible control comes from the workspace packages. The app contributes only
              layout and product-specific composition.
            </p>
            <dl>
              <div>
                <dt>Renderer</dt>
                <dd>React 19 + Vite</dd>
              </div>
              <div>
                <dt>Components</dt>
                <dd>Button, Card, Input, Badge, Tabs</dd>
              </div>
              <div>
                <dt>Theme axes</dt>
                <dd>
                  {theme} / {mode}
                </dd>
              </div>
            </dl>
          </aside>
        </section>
      </main>
    </div>
  )
}
