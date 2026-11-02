import { Bar, Connector, Roll, Stage, Text, Window, type Act } from '../stageshow/kit'
import './brand-switch.css'

// Stageshow's panel-annotation gold, retold for Atom63: an Appearance panel
// over the product it changes. The cursor picks a brand; the checkout takes
// it, because the checkout is its own data-a63-brand subtree; a leader ties
// the swatch to the Pay button. Every color is an Atom63 token, so the stage
// also follows the page's theme and mode.
//
// Real strings: the merchant, the amount, Pay, the panel's title and its two
// rows.

export type Theme = 'aqua' | 'modern' | 'retro' | 'terminal'
export type Mode = 'dark' | 'light'

// Blue, orange, green and violet: four of the six brand ramps.
const BRANDS = ['b1', 'b2', 'b3', 'b5']

type S = { brand: number; linked: boolean }

const initial: S = { brand: 0, linked: false }
const poster: S = { brand: 1, linked: true }

async function script(a: Act<S>) {
  await a.wait(1000)
  a.mark('pick')
  await a.click({ at: 'swatch-1', x: 0.5, y: 0.5 })
  a.put({ brand: 1 })
  await a.wait(500)
  a.mark('link')
  a.put({ linked: true })
  await a.move({ at: 'panel', x: 0.6, y: 1.15 })
  await a.wait(2600)
}

export function BrandSwitch({ mode, theme }: { mode: Mode; theme: Theme }) {
  return (
    <Stage
      width={640}
      height={440}
      compact={{ below: 600, width: 358, height: 600 }}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      theme={mode}
      cursor={{ at: { x: 600, y: 410 } }}
      className="ts look-atom63"
    >
      {(s, rect, layout) => {
        const brand = BRANDS[s.brand]!
        const panel = rect('panel')
        const swatch = rect(`swatch-${s.brand}`)
        const pay = rect('pay')
        return (
          <>
            <Window url="checkout.northwind.co" className="ts-win" data-a63-brand={brand}>
              <div className="ts-checkout">
                <Text className="ts-merchant">Northwind</Text>
                <Text className="ts-amount">$60.00</Text>
                <div className="ts-fields">
                  <Bar w="100%" h={30} r={6} tone={1} />
                  <Bar w="100%" h={30} r={6} tone={1} />
                  <div className="ts-pair">
                    <Bar w="100%" h={30} r={6} tone={1} />
                    <Bar w="100%" h={30} r={6} tone={1} />
                  </div>
                </div>
                <span className="ts-pay" data-target="pay">
                  Pay $60.00
                </span>
              </div>
            </Window>

            <section className="ts-panel" data-target="panel">
              <Text className="ts-title">Appearance</Text>
              <Text className="ts-hint">How Atom63 draws your checkout</Text>
              <div className="ts-row">
                <Text className="ts-label">Theme</Text>
                <span className="ts-value">
                  {theme}, {mode}
                </span>
              </div>
              <div className="ts-row" data-target="accent-row">
                <Text className="ts-label">Brand</Text>
                <span className="ts-value">
                  <span className="ts-chip" data-a63-brand={brand} />
                  <Roll>{brand}</Roll>
                </span>
              </div>
              <div className="ts-swatches">
                {BRANDS.map((id, i) => (
                  <span
                    key={id}
                    className="ts-swatch"
                    data-target={`swatch-${i}`}
                    data-cursor="pointer"
                    data-on={i === s.brand || undefined}
                    data-a63-brand={id}
                  />
                ))}
              </div>
              <div className="ts-row ts-row--quiet">
                <Bar w={64} h={8} r={4} tone={3} />
                <Bar w={72} h={22} r={6} tone={1} />
              </div>
            </section>

            {layout !== 'compact' && panel.width > 0 && pay.width > 0 && (
              <Connector
                show={s.linked}
                from={{ x: swatch.x + swatch.width / 2, y: panel.y + panel.height + 6 }}
                to={{ x: pay.x + pay.width + 6, y: pay.y + pay.height / 2 }}
                route="v"
              />
            )}
          </>
        )
      }}
    </Stage>
  )
}
