// Doc blocks for the Storybook foundations pages. Every name and value comes from tokens/tokens.js,
// and samples render through the CSS variables, so the pages can't drift from the tokens.
import { Unstyled } from '@storybook/addon-docs/blocks'
import { tokens } from '../../tokens/tokens.js'
import { contrastLevel, contrastRatio } from './contrast.js'

const SIZE_ORDER = ['none', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'section', 'pill']

function entries(prefix) {
  return Object.entries(tokens)
    .filter(([name]) => name.startsWith(prefix))
    .map(([name, value]) => ({ name, step: name.slice(prefix.length), value }))
}

function bySize(a, b) {
  return SIZE_ORDER.indexOf(a.step) - SIZE_ORDER.indexOf(b.step)
}

function Code({ children }) {
  return <code className="font-mono text-caption text-text-secondary">{children}</code>
}

function DocTable({ headers, children }) {
  return (
    <Unstyled>
      <div className="overflow-x-auto rounded-card border border-border-default bg-surface-raised font-sans text-text-primary">
        <table className="w-full border-collapse text-left text-body-sm">
          <thead>
            <tr className="border-b border-border-default">
              {headers.map((header) => (
                <th key={header} scope="col" className="p-ds-sm font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Unstyled>
  )
}

function Row({ children }) {
  return <tr className="border-b border-border-subtle last:border-b-0">{children}</tr>
}

function Cell({ children }) {
  return <td className="p-ds-sm align-middle">{children}</td>
}

/**
 * Role color swatches for one group (`surface-`, `text-`, `border-`, `status-`, `chart-`).
 * `showContrast` adds the ratio against white for solid foreground colors.
 */
export function ColorGroup({ prefix, showContrast = false }) {
  const colors = entries(prefix)
  return (
    <DocTable headers={['Swatch', 'Token', 'CSS variable', 'Value', ...(showContrast ? ['On white'] : [])]}>
      {colors.map(({ name, value }) => {
        const ratio = contrastRatio(value)
        const isBackground = name.endsWith('-subtle')
        return (
          <Row key={name}>
            <Cell>
              <span
                aria-hidden="true"
                className="block h-10 w-16 rounded-input border border-border-default"
                style={{ background: `var(--${name})` }}
              />
            </Cell>
            <Cell>{name}</Cell>
            <Cell>
              <Code>{`--${name}`}</Code>
            </Cell>
            <Cell>
              <Code>{value}</Code>
            </Cell>
            {showContrast && (
              <Cell>
                {isBackground || ratio == null ? (
                  <span className="text-text-muted">Background</span>
                ) : (
                  `${ratio.toFixed(2)}:1 ${contrastLevel(ratio)}`
                )}
              </Cell>
            )}
          </Row>
        )
      })}
    </DocTable>
  )
}

/** Each `text-*` size with its class, font size and line height. */
export function TypeScale() {
  const sizes = entries('ds-font-size-')
  return (
    <DocTable headers={['Class', 'Size', 'Line height', 'Sample']}>
      {sizes.map(({ step, value }) => (
        <Row key={step}>
          <Cell>
            <Code>{`text-${step}`}</Code>
          </Cell>
          <Cell>{value}</Cell>
          <Cell>{tokens[`ds-line-height-${step}`]}</Cell>
          <Cell>
            <span
              className="block"
              style={{ fontSize: `var(--ds-font-size-${step})`, lineHeight: `var(--ds-line-height-${step})` }}
            >
              Marketing leaders, together
            </span>
          </Cell>
        </Row>
      ))}
    </DocTable>
  )
}

/** The `ds-*` spacing scale as bars. */
export function SpacingScale() {
  const steps = entries('ds-space-').sort(bySize)
  return (
    <DocTable headers={['Classes', 'Value', 'Scale']}>
      {steps.map(({ step, value }) => (
        <Row key={step}>
          <Cell>
            <Code>{`p-ds-${step}, gap-ds-${step}, m-ds-${step}`}</Code>
          </Cell>
          <Cell>{value}</Cell>
          <Cell>
            <span
              aria-hidden="true"
              className="block h-4 rounded-tag bg-surface-brand-strong"
              style={{ width: `var(--ds-space-${step})` }}
            />
          </Cell>
        </Row>
      ))}
    </DocTable>
  )
}

// Role names Tailwind exposes for each radius step (tokens.css `--radius-*`).
const RADIUS_ROLES = { xs: 'tag', sm: 'input', md: 'control', lg: 'card', xl: 'sheet', xxl: 'panel', pill: 'chip' }

/** The `rounded-*` role classes with their sizes. */
export function RadiusScale() {
  const steps = entries('ds-radius-').sort(bySize)
  return (
    <Unstyled>
      <div className="flex flex-wrap gap-ds-lg font-sans text-text-primary">
        {steps.map(({ step, value }) => (
          <figure key={step} className="m-ds-none flex flex-col items-center gap-ds-xs">
            <span
              aria-hidden="true"
              className="block size-24 border-2 border-border-strong bg-surface-sunken"
              style={{ borderRadius: `var(--ds-radius-${step})` }}
            />
            <figcaption className="text-center text-body-sm">
              <Code>{`rounded-${RADIUS_ROLES[step] ?? step}`}</Code>
              <span className="block text-text-secondary">{value}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Unstyled>
  )
}

/** The `shadow-*` elevation tokens on raised cards. */
export function ShadowScale() {
  const shadows = entries('ds-shadow-')
  return (
    <Unstyled>
      <div className="grid grid-cols-1 gap-ds-xl bg-surface-page p-ds-xl font-sans text-text-primary sm:grid-cols-2 lg:grid-cols-3">
        {shadows.map(({ step, value }) => (
          <figure
            key={step}
            className="m-ds-none flex flex-col gap-ds-xs rounded-card bg-surface-raised p-ds-lg"
            style={{ boxShadow: `var(--ds-shadow-${step})` }}
          >
            <Code>{`shadow-${step}`}</Code>
            <figcaption className="text-caption text-text-secondary">{value}</figcaption>
          </figure>
        ))}
      </div>
    </Unstyled>
  )
}

// Tailwind easing classes for each easing token (tokens.css `--ease-*`).
const EASING_CLASSES = { out: 'ease-enter', in: 'ease-exit', 'in-out': 'ease-move' }

/** Duration and easing tokens. */
export function MotionTokens() {
  const durations = entries('ds-duration-')
  const easings = entries('ds-easing-')
  return (
    <div className="flex flex-col gap-ds-lg">
      <DocTable headers={['Duration', 'CSS variable', 'Value']}>
        {durations.map(({ name, step, value }) => (
          <Row key={name}>
            <Cell>{step}</Cell>
            <Cell>
              <Code>{`--${name}`}</Code>
            </Cell>
            <Cell>{value}</Cell>
          </Row>
        ))}
      </DocTable>
      <DocTable headers={['Easing', 'Class', 'CSS variable', 'Value']}>
        {easings.map(({ name, step, value }) => (
          <Row key={name}>
            <Cell>{step}</Cell>
            <Cell>
              <Code>{EASING_CLASSES[step] ?? 'none'}</Code>
            </Cell>
            <Cell>
              <Code>{`--${name}`}</Code>
            </Cell>
            <Cell>
              <Code>{value}</Code>
            </Cell>
          </Row>
        ))}
      </DocTable>
    </div>
  )
}

/** The z-index layers, highest first. */
export function LayerList() {
  const layers = entries('ds-z-').sort((a, b) => Number(b.value) - Number(a.value))
  return (
    <DocTable headers={['Layer', 'Class', 'Value']}>
      {layers.map(({ name, step, value }) => (
        <Row key={name}>
          <Cell>{step}</Cell>
          <Cell>
            <Code>{`z-(--${name})`}</Code>
          </Cell>
          <Cell>{value}</Cell>
        </Row>
      ))}
    </DocTable>
  )
}
