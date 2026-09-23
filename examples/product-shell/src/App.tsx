import {
  Atom63Theme,
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Input,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@atom63/ui-react";
import { useState } from "react";

type Mode = "dark" | "light";
type Theme = "modern" | "aqua" | "terminal";

const navigation = ["Overview", "Components", "Evidence"] as const;

const metrics = [
  ["Surface tokens", "1,016 CSS vars"],
  ["Public packages", "3 first-wave"],
  ["Adopter mode", "published DS"],
] as const;

const cards = [
  {
    title: "Theme boundary",
    body: "Atom63Theme owns the data attributes. The app owns only the product choice.",
    tag: "runtime",
  },
  {
    title: "Recipe layer",
    body: "Buttons, cards, tabs, inputs, and empty states compose without app-local recipes.",
    tag: "recipes",
  },
  {
    title: "Consumer proof",
    body: "This example stays generic so atom63.io can remain the portfolio consumption layer.",
    tag: "adopter",
  },
] as const;

function SegmentedChoice<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: readonly T[];
  value: T;
}) {
  return (
    <div aria-label={label} className="segmented-choice" role="group">
      <span>{label}</span>
      <div>
        {options.map((option) => (
          <Button
            aria-pressed={value === option}
            key={option}
            onClick={() => onChange(option)}
            size="sm"
            type="button"
            variant={value === option ? "primary" : "ghost"}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function App() {
  const [mode, setMode] = useState<Mode>("light");
  const [theme, setTheme] = useState<Theme>("modern");
  const [projectName, setProjectName] = useState("Portfolio OS");

  return (
    <Atom63Theme className="app-frame" mode={mode} theme={theme}>
      <header className="shell-header">
        <a className="brand" href="#main-content">
          <span aria-hidden="true">A63</span>
          <strong>Product shell</strong>
        </a>
        <nav aria-label="Example sections">
          {navigation.map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item}>
              {item}
            </a>
          ))}
        </nav>
      </header>

      <main id="main-content">
        <section className="hero" id="overview">
          <div className="hero-copy">
            <Badge variant="outline">DS-owned example</Badge>
            <h1>Application structure without portfolio content.</h1>
            <p>
              A richer consumer presentation layer for Atom63 Design System. It
              demonstrates product-shell composition while keeping atom63.io as
              the real portfolio adopter.
            </p>
          </div>
          <Card className="control-card">
            <CardHeader>
              <CardLabel>Presentation controls</CardLabel>
              <CardAction>
                <Badge variant="success">Live</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <SegmentedChoice
                label="Mode"
                onChange={setMode}
                options={["light", "dark"] as const}
                value={mode}
              />
              <SegmentedChoice
                label="Theme"
                onChange={setTheme}
                options={["modern", "aqua", "terminal"] as const}
                value={theme}
              />
              <label className="project-field" htmlFor="project-name">
                <span>Example project</span>
                <Input
                  id="project-name"
                  onChange={(event) => setProjectName(event.target.value)}
                  value={projectName}
                />
              </label>
            </CardContent>
          </Card>
        </section>

        <section className="metric-grid" aria-label="Design-system boundaries">
          {metrics.map(([label, value]) => (
            <Card key={label}>
              <CardContent>
                <p className="metric-label">{label}</p>
                <strong>{value}</strong>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="workspace" id="components">
          <div className="section-heading">
            <span>01 / Composition</span>
            <h2>Reusable app patterns, not product IA.</h2>
          </div>
          <div className="card-grid">
            {cards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardLabel>{card.tag}</CardLabel>
                </CardHeader>
                <CardContent>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.body}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="evidence" id="evidence">
          <Card>
            <CardHeader>
              <CardLabel>Consumer contract</CardLabel>
              <CardAction>
                <Badge variant="outline">{projectName || "Untitled"}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="boundary">
                <TabsList variant="underline">
                  <TabsTab value="boundary">Boundary</TabsTab>
                  <TabsTab value="usage">Usage</TabsTab>
                </TabsList>
                <TabsPanel className="tab-panel" value="boundary">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>
                        Keep atom63.io as the real adopter.
                      </EmptyTitle>
                      <EmptyDescription>
                        This example belongs to the design-system repo. The
                        portfolio app should consume the public package surface
                        and add only its own content, routes, and product
                        policy.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TabsPanel>
                <TabsPanel className="tab-panel" value="usage">
                  <pre>
                    <code>{`import '@atom63/styles'\nimport '@atom63/ui-react/styles.css'\nimport { Atom63Theme } from '@atom63/ui-react'`}</code>
                  </pre>
                </TabsPanel>
              </Tabs>
            </CardContent>
            <CardFooter>
              <p>DS presentation layer: examples/product-shell</p>
            </CardFooter>
          </Card>
        </section>
      </main>
    </Atom63Theme>
  );
}
