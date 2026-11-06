// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { compareToBaseline, countBaseline, lintSource, run, scanClassTokens } from './lint-design-system.mjs'

const FIXTURES = path.join(import.meta.dirname, '__fixtures__', 'lint-ds')
const EM_DASH = String.fromCharCode(0x2014)
const EN_DASH = String.fromCharCode(0x2013)

function fixture(name) {
  return fs.readFileSync(path.join(FIXTURES, name), 'utf8')
}

/** Lints a fixture as if it lived at `as` and returns the rules it reports. */
function rulesOf(name, as, options) {
  return lintSource(as, fixture(name), options).map((v) => v.rule)
}

function only(rule, rules) {
  return rules.filter((r) => r === rule)
}

describe('no-raw-color', () => {
  it('should pass when colors come from tokens or sit outside class and style contexts', () => {
    expect(rulesOf('no-raw-color.pass.jsx', 'src/pages/A.jsx')).toEqual([])
  })

  it('should flag hex in a cva config and rgb() in a style object', () => {
    const found = lintSource('src/pages/A.jsx', fixture('no-raw-color.fail.jsx')).filter((v) => v.rule === 'no-raw-color')
    expect(found.map((v) => [v.line, v.severity])).toEqual([
      [3, 'error'],
      [6, 'error'],
    ])
  })

  it('should flag multi-line CSS values but not hex-like selectors', () => {
    const css = 'a:hover #bad {\n  box-shadow:\n    0 1px 2px #000;\n}\n'
    expect(lintSource('src/a.css', css).map((v) => [v.rule, v.line])).toEqual([['no-raw-color', 3]])
  })

  it('should skip :root, [data-theme] and .dark theme blocks in index.css', () => {
    const css =
      ':root[data-theme="dark"] {\n  --a: #000;\n}\n[data-theme="dark"] .x {\n  --b: #111;\n}\n.dark {\n  --c: #222;\n}\n.a { color: #333; }\n'
    expect(lintSource('src/index.css', css).map((v) => [v.rule, v.line])).toEqual([['no-raw-color', 10]])
    expect(lintSource('src/other.css', css).filter((v) => v.rule === 'no-raw-color')).toHaveLength(4)
  })

  it('should flag raw colors in CSS declarations but not in the index.css theme blocks', () => {
    expect(only('no-raw-color', rulesOf('no-raw-color.fail.css', 'src/styles/a.css'))).toHaveLength(1)
    const css = '@theme {\n  --color-gray-50: #FAFAF9;\n}\n:root {\n  --glass: rgba(0, 0, 0, 0.1);\n}\n.a { color: #fff; }\n'
    expect(lintSource('src/index.css', css).map((v) => [v.rule, v.line])).toEqual([['no-raw-color', 7]])
  })
})

describe('parse-error', () => {
  it('should report recoverable parse errors as errors', () => {
    const found = lintSource('src/pages/A.jsx', fixture('parse-error.jsx'))
    const errors = found.filter((v) => v.rule === 'parse-error')
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.every((v) => v.severity === 'error')).toBe(true)
    expect(errors[0].message).toMatch(/^Could not parse the file: /)
    expect(errors[0].message).not.toMatch(/parse-error/)
  })

  it('should never go into the baseline, so a legacy parse error always fails', () => {
    const v = { file: 'src/pages/A.jsx', rule: 'parse-error', severity: 'error', line: 1, col: 1, message: '' }
    expect(countBaseline([v])).toEqual({})
    expect(compareToBaseline([v], { 'src/pages/A.jsx': { 'parse-error': 1 } }).failing).toHaveLength(1)
  })
})

describe('arbitrary values with a modifier', () => {
  it('should flag a raw color with an opacity modifier', () => {
    expect(scanClassTokens('bg-[#fff]/50').map((f) => f.rule)).toEqual(['no-raw-color'])
  })

  it('should flag an arbitrary font size with a line-height modifier', () => {
    expect(scanClassTokens('text-[14px]/[20px] text-[14px]/6').map((f) => f.rule)).toEqual([
      'no-arbitrary-size',
      'no-arbitrary-size',
    ])
  })

  it('should flag an arbitrary line-height modifier on a token font size', () => {
    expect(scanClassTokens('text-body/[20px]').map((f) => f.rule)).toEqual(['no-arbitrary-size'])
  })

  it('should leave token modifiers and opacity modifiers alone', () => {
    expect(scanClassTokens('text-body/6 bg-surface-raised/50 bg-status-error/[0.5]')).toEqual([])
  })
})

describe('no-arbitrary-size', () => {
  it('should pass for token classes, var() values and non-size arbitrary values', () => {
    expect(rulesOf('no-arbitrary-size.pass.jsx', 'src/pages/A.jsx')).toEqual([])
  })

  it('should flag arbitrary spacing, radius, font size and width as errors outside the design system', () => {
    const found = lintSource('src/pages/A.jsx', fixture('no-arbitrary-size.fail.jsx'))
    expect(found.map((v) => v.message.split(': ').at(-1))).toEqual([
      '"md:p-[13px]"',
      '"rounded-[30px]"',
      '"text-[21.6px]"',
      '"gap-[10px]"',
      '"w-[320px]"',
    ])
    expect(new Set(found.map((v) => v.severity))).toEqual(new Set(['error']))
  })

  it('should count a repeated token once per occurrence, each at its own column', () => {
    const found = lintSource('src/pages/A.jsx', 'export const A = () => <div className="w-[3px] h-4 w-[3px]" />\n')
    expect(found.filter((v) => v.rule === 'no-arbitrary-size').map((v) => v.col)).toEqual([40, 52])
  })

  it('should only warn inside src/design-system/', () => {
    const found = lintSource('src/design-system/patterns/A/A.jsx', fixture('no-arbitrary-size.fail.jsx'))
    expect(found).toHaveLength(5)
    expect(new Set(found.map((v) => v.severity))).toEqual(new Set(['warn']))
  })
})

describe('no-inline-style', () => {
  it('should allow backgroundImage, custom properties and var() values', () => {
    expect(rulesOf('no-inline-style.pass.jsx', 'src/pages/A.jsx')).toEqual([])
  })

  it('should flag any other style object', () => {
    expect(rulesOf('no-inline-style.fail.jsx', 'src/pages/A.jsx')).toEqual(['no-inline-style'])
  })

  it('should exempt the docs, chart swatches and the Toaster', () => {
    for (const file of [
      'src/design-system/docs/components/FoundationBlocks.jsx',
      'src/design-system/patterns/ChartCard/ChartParts.jsx',
      'src/design-system/patterns/Toast/Toaster.jsx',
    ]) {
      expect(rulesOf('no-inline-style.fail.jsx', file)).toEqual([])
    }
  })
})

describe('no-em-dash', () => {
  it('should pass for plain hyphens', () => {
    expect(rulesOf('no-em-dash.pass.jsx', 'src/pages/A.jsx')).toEqual([])
  })

  it('should flag escaped dashes in strings and dash entities in JSX text', () => {
    expect(lintSource('src/pages/A.jsx', fixture('no-em-dash.fail.jsx')).map((v) => [v.rule, v.line])).toEqual([
      ['no-em-dash', 1],
      ['no-em-dash', 4],
    ])
  })

  it('should count every dash in one string', () => {
    const js = `export const a = 'one ${EM_DASH} two ${EN_DASH} three'\n`
    expect(lintSource('src/a.js', js).map((v) => v.col)).toEqual([23, 29])
  })

  it('should flag dashes in comments, template literals, CSS comments and design-system docs', () => {
    const js = `// one ${EM_DASH} two\nconst a = \`x ${EN_DASH} y\`\n`
    expect(lintSource('src/a.js', js).map((v) => [v.rule, v.line])).toEqual([
      ['no-em-dash', 1],
      ['no-em-dash', 2],
    ])
    expect(rulesOf('no-em-dash.pass.jsx', 'src/a.test.jsx')).toEqual([])
    expect(lintSource('src/a.test.jsx', js)).toHaveLength(2)
    expect(lintSource('src/a.css', `/* a ${EM_DASH} b */\n.a { color: red; }\n`).map((v) => v.rule)).toEqual(['no-em-dash'])
    expect(lintSource('src/design-system/docs/A.mdx', `# Title\n\nOne ${EM_DASH} two\n`).map((v) => [v.rule, v.line])).toEqual([
      ['no-em-dash', 3],
    ])
  })
})

describe('motion-needs-reduced', () => {
  it('should pass when the animation has a motion-reduce variant or a reduced-motion block', () => {
    expect(rulesOf('motion-needs-reduced.pass.jsx', 'src/pages/A.jsx')).toEqual([])
    expect(rulesOf('motion-needs-reduced.pass.css', 'src/a.css')).toEqual([])
  })

  it('should warn for animate utilities, keyframes and infinite animations without one', () => {
    const jsx = lintSource('src/pages/A.jsx', fixture('motion-needs-reduced.fail.jsx'))
    expect(jsx.map((v) => [v.rule, v.severity])).toEqual([['motion-needs-reduced', 'warn']])
    expect(rulesOf('motion-needs-reduced.fail.css', 'src/a.css')).toEqual(['motion-needs-reduced'])
    const loop = 'export const a = { animate: { y: 4 }, transition: { repeat: Infinity } }\n'
    expect(lintSource('src/a.js', loop).map((v) => v.rule)).toEqual(['motion-needs-reduced'])
    expect(lintSource('src/a.js', `import { useReducedMotion } from 'motion/react'\n${loop}`)).toEqual([])
  })
})

describe('no-retired-imports', () => {
  it('should pass for design-system imports', () => {
    expect(rulesOf('no-retired-imports.pass.jsx', 'src/pages/A/A.jsx')).toEqual([])
  })

  it('should warn for imports from components/ui and components/live', () => {
    const found = lintSource('src/pages/A/A.jsx', fixture('no-retired-imports.fail.jsx'))
    expect(found.map((v) => [v.rule, v.severity])).toEqual([
      ['no-retired-imports', 'warn'],
      ['no-retired-imports', 'warn'],
    ])
  })

  it('should make them errors with the strict flag', () => {
    const found = lintSource('src/pages/A/A.jsx', fixture('no-retired-imports.fail.jsx'), { strict: true })
    expect(found.map((v) => v.severity)).toEqual(['error', 'error'])
  })

  it('should always be an error inside src/design-system/', () => {
    const found = lintSource('src/design-system/patterns/A/A.jsx', "import Button from '@/components/ui/Button'\n")
    expect(found.map((v) => [v.rule, v.severity])).toEqual([['no-retired-imports', 'error']])
  })

  it('should not flag imports inside the same retired folder', () => {
    expect(lintSource('src/components/ui/Card.jsx', "import Button from './Button'\n")).toEqual([])
  })
})

describe('pages-use-system', () => {
  it('should pass with three long className strings', () => {
    expect(rulesOf('pages-use-system.pass.jsx', 'src/pages/A.jsx')).toEqual([])
  })

  it('should warn with more than three, and only for files in src/pages/', () => {
    const found = lintSource('src/pages/A.jsx', fixture('pages-use-system.fail.jsx'))
    expect(found.map((v) => [v.rule, v.severity])).toEqual([['pages-use-system', 'warn']])
    expect(rulesOf('pages-use-system.fail.jsx', 'src/components/A.jsx')).toEqual([])
  })
})

describe('ds-layering', () => {
  it('should let patterns import primitives and lib', () => {
    expect(rulesOf('ds-layering.pass.jsx', 'src/design-system/patterns/Thing/Thing.jsx')).toEqual([])
  })

  it('should stop primitives importing patterns or organisms', () => {
    const found = lintSource('src/design-system/primitives/Thing/Thing.jsx', fixture('ds-layering.fail.jsx'))
    expect(found.map((v) => [v.rule, v.severity])).toEqual([
      ['ds-layering', 'error'],
      ['ds-layering', 'error'],
    ])
  })

  it('should stop patterns importing organisms', () => {
    const found = lintSource('src/design-system/patterns/Thing/Thing.jsx', fixture('ds-layering.fail.jsx'))
    expect(found.map((v) => [v.rule, v.line])).toEqual([['ds-layering', 2]])
  })

  it('should let organisms import patterns', () => {
    expect(rulesOf('ds-layering.fail.jsx', 'src/design-system/organisms/site/Thing/Thing.jsx')).toEqual([])
  })
})

describe('ds-allow overrides', () => {
  it('should skip a finding with a reasoned override on the line above or the same line', () => {
    const found = lintSource('src/pages/A.jsx', fixture('override.jsx'))
    expect(found.map((v) => [v.rule, v.line])).toEqual([
      ['ds-allow-reason', 7],
      ['no-raw-color', 8],
    ])
  })

  it('should limit a trailing override to its own line', () => {
    const src = [
      'export const A = () => (',
      '  <div>',
      '    <div className="bg-[#000000]" /> {/* ds-allow no-raw-color: brand swatch */}',
      '    <div className="bg-[#111111]" />',
      '  </div>',
      ')',
      '',
    ].join('\n')
    expect(lintSource('src/pages/A.jsx', src).map((v) => [v.rule, v.line])).toEqual([['no-raw-color', 4]])
  })

  it('should let an override alone on its line cover the next line', () => {
    const src = "// ds-allow no-raw-color: share button brand color\nexport const a = cn('bg-[#000000]')\nexport const b = cn('bg-[#111111]')\n"
    expect(lintSource('src/a.js', src).map((v) => [v.rule, v.line])).toEqual([['no-raw-color', 3]])
  })

  it('should report an override that names an unknown rule', () => {
    const found = lintSource('src/a.js', '// ds-allow no-such-rule: because\nexport const a = 1\n')
    expect(found.map((v) => v.rule)).toEqual(['ds-allow-reason'])
  })

  it('should accept CSS comment overrides', () => {
    expect(lintSource('src/a.css', '/* ds-allow no-raw-color: scrollbar thumb */\n.a { color: #fff; }\n')).toEqual([])
  })
})

describe('baseline', () => {
  const errorAt = (file, rule = 'no-raw-color') => ({ file, rule, severity: 'error', line: 1, col: 1, message: '' })

  it('should count errors outside src/design-system/ only, ignoring warnings', () => {
    const counts = countBaseline([
      errorAt('src/pages/A.jsx'),
      errorAt('src/pages/A.jsx'),
      errorAt('src/design-system/x.jsx'),
      { ...errorAt('src/pages/B.jsx'), severity: 'warn' },
    ])
    expect(counts).toEqual({ 'src/pages/A.jsx': { 'no-raw-color': 2 } })
  })

  it('should fail when a count goes up', () => {
    const result = compareToBaseline([errorAt('src/pages/A.jsx'), errorAt('src/pages/A.jsx')], {
      'src/pages/A.jsx': { 'no-raw-color': 1 },
    })
    expect(result.failing).toHaveLength(2)
  })

  it('should pass with a note when a count drops', () => {
    const result = compareToBaseline([errorAt('src/pages/A.jsx')], { 'src/pages/A.jsx': { 'no-raw-color': 3 } })
    expect(result.failing).toEqual([])
    expect(result.improved).toEqual([['src/pages/A.jsx', 'no-raw-color', 3, 1]])
  })

  it('should fail for a new file or a new rule in a baselined file', () => {
    const baseline = { 'src/pages/A.jsx': { 'no-raw-color': 1 } }
    expect(compareToBaseline([errorAt('src/pages/New.jsx')], baseline).failing).toHaveLength(1)
    expect(compareToBaseline([errorAt('src/pages/A.jsx', 'no-em-dash')], baseline).failing).toHaveLength(1)
  })

  it('should always fail for errors in src/design-system/', () => {
    const baseline = { 'src/design-system/x.jsx': { 'no-raw-color': 5 } }
    expect(compareToBaseline([errorAt('src/design-system/x.jsx')], baseline).failing).toHaveLength(1)
  })
})

describe('run', () => {
  let root
  let baselinePath
  const logs = []
  const io = () => ({ root, baselinePath, log: (m) => logs.push(m), error: (m) => logs.push(m) })

  function write(relative, contents) {
    const full = path.join(root, relative)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, contents)
  }

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-ds-'))
    baselinePath = path.join(root, 'baseline.json')
    logs.length = 0
  })

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  it('should fail on a new legacy error, then pass after --update-baseline --allow-increase', () => {
    write('src/pages/A.jsx', fixture('no-inline-style.fail.jsx'))
    expect(run([], io())).toBe(1)
    expect(logs.join('\n')).toMatch(/src\/pages\/A\.jsx:2:\d+ no-inline-style/)
    expect(run(['--update-baseline', '--allow-increase'], io())).toBe(0)
    expect(JSON.parse(fs.readFileSync(baselinePath, 'utf8'))).toEqual({ 'src/pages/A.jsx': { 'no-inline-style': 1 } })
    expect(run([], io())).toBe(0)
  })

  it('should refuse to raise the baseline unless --allow-increase is passed', () => {
    write('src/pages/A.jsx', fixture('no-inline-style.fail.jsx'))
    fs.writeFileSync(baselinePath, `${JSON.stringify({ 'src/pages/Old.jsx': { 'no-raw-color': 1 } })}\n`)
    expect(run(['--update-baseline'], io())).toBe(1)
    expect(logs.join('\n')).toMatch(/src\/pages\/A\.jsx no-inline-style: 0 -> 1/)
    expect(JSON.parse(fs.readFileSync(baselinePath, 'utf8'))).toEqual({ 'src/pages/Old.jsx': { 'no-raw-color': 1 } })
    expect(run(['--update-baseline', '--allow-increase'], io())).toBe(0)
    expect(JSON.parse(fs.readFileSync(baselinePath, 'utf8'))).toEqual({ 'src/pages/A.jsx': { 'no-inline-style': 1 } })
  })

  it('should print the update note when legacy counts drop', () => {
    write('src/pages/A.jsx', 'export const a = 1\n')
    fs.writeFileSync(baselinePath, JSON.stringify({ 'src/pages/A.jsx': { 'no-inline-style': 2 } }))
    expect(run([], io())).toBe(0)
    expect(logs.join('\n')).toContain('npm run lint:ds -- --update-baseline')
  })

  it('should skip generated token files', () => {
    write('src/design-system/tokens/tokens.js', "export const c = { className: 'bg-[#fff]' }\n")
    expect(run([], io())).toBe(0)
  })

  it('should fail on retired imports only with --strict', () => {
    write('src/pages/A/A.jsx', fixture('no-retired-imports.fail.jsx'))
    expect(run([], io())).toBe(0)
    expect(run(['--strict'], io())).toBe(1)
  })
})
