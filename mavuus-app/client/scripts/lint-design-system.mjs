// Design-system lint: keeps raw colors, arbitrary sizes, inline styles, em dashes, unguarded
// motion and retired imports out of the client, and keeps the design-system layers in order.
//
// Scans src/**/*.{js,jsx,mjs,css} and the .md/.mdx files under src/design-system/, except the
// generated src/design-system/tokens/ folder and the @theme and top-level :root blocks of
// src/index.css. JS and JSX go through @babel/parser so only real strings, JSX text and comments
// are checked; CSS uses a small comment-aware scanner. Test files (*.test.*) only get the dash
// and layering rules, since they build styled fixtures on purpose.
//
// Override one finding with a comment on the same line or the line above:
//   // ds-allow no-raw-color: chart library needs a literal color
//   {/* ds-allow no-inline-style: width comes from a measured value */}
//   /* ds-allow no-em-dash: quoted from a source */
// A reason is required; an override without one is an error itself.
//
// Legacy baseline: errors outside src/design-system/ are compared with
// scripts/lint-design-system.baseline.json (per file, per rule counts). The run fails when a count
// goes up or a file or rule that is not in the baseline has errors. When counts drop, it says to
// run `npm run lint:ds -- --update-baseline`. src/design-system/ has no baseline: any error fails.
//
// Flags: --strict (no-retired-imports becomes an error, for Phase 8), --update-baseline,
// --verbose (list every warning, not only the ones in src/design-system/).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse } from '@babel/parser'

export const RULES = {
  'no-raw-color': 'Raw color value; use a token class or role variable',
  'no-arbitrary-size': 'Arbitrary Tailwind size; use the spacing, radius or type tokens',
  'no-inline-style': 'Inline style; use token classes (only backgroundImage, CSS custom properties and var() values are allowed)',
  'no-em-dash': 'Em or en dash; use a hyphen',
  'motion-needs-reduced': 'Animation without reduced-motion handling (motion-reduce:, prefers-reduced-motion or useReducedMotion)',
  'no-retired-imports': 'Import from a retired folder (components/ui, components/live); use src/design-system',
  'pages-use-system': 'More than 3 className strings over 120 characters; compose design-system components instead',
  'ds-layering': 'Design-system layer import out of order',
  'ds-allow-reason': 'ds-allow override needs a known rule and a reason',
}

const DS = 'src/design-system/'
const TOKENS_DIR = 'src/design-system/tokens/'
const INDEX_CSS = 'src/index.css'
const TEST_FILE = /\.test\.(?:jsx?|mjs)$/
const TEST_RULES = new Set(['no-em-dash', 'ds-layering'])
const LONG_CLASS = 120
const LONG_CLASS_LIMIT = 3

// Files where inline styles are part of the design: docs swatches, chart legend swatches (colors
// come from tokens.js chartColors) and the Toaster, which hands sonner its role-token variables.
const INLINE_STYLE_EXEMPT = [
  'src/design-system/docs/',
  'src/design-system/patterns/ChartCard/ChartParts.jsx',
  'src/design-system/patterns/Toast/Toaster.jsx',
]

const CLASS_CALLEES = new Set(['cn', 'clsx', 'cva', 'cx', 'twMerge', 'classNames'])
const CLASS_ATTR = /^(class|className|[A-Za-z]+ClassName|classNames)$/

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/gi
const DASHES = /[\u2013\u2014]|&(?:mdash|ndash|#8212|#8211|#x2014|#x2013);/g

const SIZE_PREFIXES = new Set([
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe',
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me',
  'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
  'rounded', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-s', 'rounded-e',
  'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl', 'rounded-ss', 'rounded-se', 'rounded-es', 'rounded-ee',
  'text', 'leading', 'tracking', 'indent',
  'w', 'h', 'min-w', 'max-w', 'min-h', 'max-h', 'size', 'basis',
  'inset', 'inset-x', 'inset-y', 'top', 'right', 'bottom', 'left', 'start', 'end',
  'scroll-m', 'scroll-mx', 'scroll-my', 'scroll-mt', 'scroll-mb', 'scroll-p', 'scroll-px', 'scroll-py', 'scroll-pt', 'scroll-pb',
])
const LENGTH = /^-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|%|vh|vw|dvh|svh|lvh|vmin|vmax|ch|ex|pt)?$/
const SIZE_FN = /^(?:calc|clamp|min|max)\(.*\d/

const HANDLES_REDUCED = /motion-reduce:|prefers-reduced-motion|useReducedMotion|reducedMotion/

function toPosix(p) {
  return p.split(path.sep).join('/')
}

function lineStarts(source) {
  const starts = [0]
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') starts.push(i + 1)
  return starts
}

function locate(starts, offset) {
  let lo = 0
  let hi = starts.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (starts[mid] <= offset) lo = mid
    else hi = mid - 1
  }
  return { line: lo + 1, col: offset - starts[lo] + 1 }
}

/** Splits a class token into its variant prefix and the utility (`md:hover:p-4` -> `md:hover:`, `p-4`). */
function splitVariants(token) {
  let depth = 0
  let cut = -1
  for (let i = 0; i < token.length; i++) {
    const ch = token[i]
    if (ch === '[' || ch === '(') depth++
    else if (ch === ']' || ch === ')') depth--
    else if (ch === ':' && depth === 0) cut = i
  }
  return { variants: token.slice(0, cut + 1), utility: token.slice(cut + 1) }
}

/** Returns arbitrary-value findings in a class-like string: [{ index, rule, text }]. */
export function scanClassTokens(text) {
  const found = []
  const re = /\S+/g
  let m
  while ((m = re.exec(text))) {
    const token = m[0]
    if (!token.includes('[')) continue
    const { utility } = splitVariants(token)
    const bare = utility.replace(/^!/, '').replace(/!$/, '').replace(/^-/, '')
    const arb = /^([a-z][a-z-]*?)-\[(.+)\]$/.exec(bare)
    const prop = /^\[([a-z-]+):(.+)\]$/.exec(bare)
    const value = arb ? arb[2] : prop ? prop[2] : null
    if (value === null) continue
    if (/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/i.test(value)) {
      found.push({ index: m.index, rule: 'no-raw-color', text: token })
      continue
    }
    if (arb && SIZE_PREFIXES.has(arb[1]) && (LENGTH.test(value) || SIZE_FN.test(value))) {
      found.push({ index: m.index, rule: 'no-arbitrary-size', text: token })
    }
  }
  return found
}

function rawColors(text) {
  const found = []
  for (const re of [HEX, COLOR_FN]) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text))) found.push({ index: m.index, text: m[0] })
  }
  return found
}

function hasAnimateUtility(text) {
  for (const token of text.split(/\s+/)) {
    const { variants, utility } = splitVariants(token)
    if (variants.includes('motion-reduce')) continue
    const bare = utility.replace(/^!/, '')
    if (/^animate-/.test(bare) && bare !== 'animate-none') return true
  }
  return false
}

function resolveImport(file, spec) {
  if (spec.startsWith('@/')) return toPosix(path.posix.join('src', spec.slice(2)))
  if (spec.startsWith('.')) return toPosix(path.posix.normalize(path.posix.join(path.posix.dirname(file), spec)))
  return null
}

function under(target, dir) {
  return target === dir || target.startsWith(`${dir}/`)
}

function retiredFolder(target) {
  for (const dir of ['src/components/ui', 'src/components/live']) if (under(target, dir)) return dir
  return null
}

function layerOf(file) {
  const m = /^src\/design-system\/(primitives|patterns|organisms)(\/|$)/.exec(file)
  return m ? m[1] : null
}

const FORBIDDEN_LAYERS = { primitives: ['patterns', 'organisms'], patterns: ['organisms'] }

/** Walks a Babel AST, calling visit(node, ancestors). */
function walk(node, visit, ancestors = []) {
  if (!node || typeof node.type !== 'string') return
  visit(node, ancestors)
  ancestors.push(node)
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'extra' || key === 'comments' || key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments') continue
    const child = node[key]
    if (Array.isArray(child)) for (const c of child) walk(c, visit, ancestors)
    else if (child && typeof child.type === 'string') walk(child, visit, ancestors)
  }
  ancestors.pop()
}

function inClassContext(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const a = ancestors[i]
    if (a.type === 'JSXAttribute' && a.name && CLASS_ATTR.test(a.name.name)) return true
    if (a.type === 'CallExpression' && a.callee.type === 'Identifier' && CLASS_CALLEES.has(a.callee.name)) return true
    if (a.type === 'ObjectProperty' && !a.computed) {
      const key = a.key.type === 'Identifier' ? a.key.name : a.key.value
      if (typeof key === 'string' && CLASS_ATTR.test(key) && ancestors[i + 1] === a.value) return true
    }
  }
  return false
}

function styleAttributeOf(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const a = ancestors[i]
    if (a.type === 'JSXAttribute' && a.name && a.name.name === 'style') return a
  }
  return null
}

function isVarOnly(node) {
  if (node.type === 'StringLiteral') return /^\s*var\(--[\w-]+(?:\s*,[^)]*)?\)\s*$/.test(node.value)
  if (node.type === 'TemplateLiteral') {
    const text = node.quasis.map((q) => q.value.cooked).join('X')
    return /^\s*var\(--[\w-]*X?[\w-]*(?:\s*,[^)]*)?\)\s*$/.test(text)
  }
  return false
}

function styleObjectAllowed(obj) {
  return obj.properties.every((p) => {
    if (p.type !== 'ObjectProperty' || p.computed) return false
    const key = p.key.type === 'Identifier' ? p.key.name : p.key.value
    if (key === 'backgroundImage') return true
    if (typeof key === 'string' && key.startsWith('--')) return true
    return isVarOnly(p.value)
  })
}

function parseOverrides(comments, report) {
  // Returns Map<line, Set<rule>>. Overrides apply to their own line and the line after.
  const byLine = new Map()
  for (const c of comments) {
    const m = /ds-allow\s+([a-z-]+(?:\s*,\s*[a-z-]+)*)\s*(?::\s*(.*))?$/.exec(c.text.trim().replace(/\*\/$/, '').trim())
    if (!m) continue
    const rules = m[1].split(/\s*,\s*/)
    const reason = (m[2] || '').trim()
    const unknown = rules.filter((r) => !RULES[r] || r === 'ds-allow-reason')
    if (!reason || unknown.length > 0) {
      report('ds-allow-reason', c.offset, unknown.length > 0 ? `unknown rule ${unknown.join(', ')}` : 'missing reason after ":"')
      continue
    }
    for (const line of [c.line, c.endLine + 1]) {
      if (!byLine.has(line)) byLine.set(line, new Set())
      for (const r of rules) byLine.get(line).add(r)
    }
  }
  return byLine
}

function severityFor(rule, file, strict) {
  if (rule === 'no-arbitrary-size') return file.startsWith(DS) ? 'warn' : 'error'
  if (rule === 'no-retired-imports') return strict ? 'error' : 'warn'
  if (rule === 'motion-needs-reduced' || rule === 'pages-use-system') return 'warn'
  return 'error'
}

function lintJs(file, source, ctx) {
  let ast
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['jsx'],
      errorRecovery: true,
      allowReturnOutsideFunction: true,
    })
  } catch (error) {
    ctx.report('parse-error', 0, error.message, 'error')
    return []
  }
  const comments = (ast.comments || []).map((c) => ({
    text: c.value,
    offset: c.start,
    line: c.loc.start.line,
    endLine: c.loc.end.line,
  }))

  for (const c of ast.comments || []) {
    DASHES.lastIndex = 0
    const m = DASHES.exec(c.value)
    if (m) ctx.report('no-em-dash', c.start + 2 + m.index, 'in a comment')
  }

  const inlineExempt = INLINE_STYLE_EXEMPT.some((p) => file === p || file.startsWith(p))
  let longClassStrings = 0
  let firstLongClass = 0
  let animateAt = -1
  const layer = layerOf(file)

  const checkText = (text, rawStart, rawEnd, ancestors) => {
    const raw = source.slice(rawStart, rawEnd)
    // Maps a match to its own spot in the raw source. Repeats of the same text continue the
    // search after the previous hit, so each occurrence gets its own offset (and its own count).
    const cursors = new Map()
    const offsetOf = (needle, fallback) => {
      const from = cursors.get(needle) ?? 0
      const i = raw.indexOf(needle, from)
      if (i < 0) return rawStart + fallback
      cursors.set(needle, i + needle.length)
      return rawStart + i
    }
    DASHES.lastIndex = 0
    for (const m of [...text.matchAll(DASHES), ...raw.matchAll(/\\u201[34]|&(?:mdash|ndash);/g)].slice(0, 1)) {
      ctx.report('no-em-dash', offsetOf(m[0], 0), 'in text')
    }
    for (const f of scanClassTokens(text)) {
      ctx.report(f.rule, offsetOf(f.text, f.index), `"${f.text}"`)
    }
    const classy = inClassContext(ancestors)
    const styled = styleAttributeOf(ancestors)
    if (classy || styled) {
      for (const f of rawColors(text)) {
        if (classy && scanClassTokens(text).some((t) => t.rule === 'no-raw-color' && t.text.includes(f.text))) continue
        ctx.report('no-raw-color', offsetOf(f.text, f.index), `"${f.text}"${styled ? ' in a style object' : ''}`)
      }
    }
    if (classy && text.length > LONG_CLASS) {
      longClassStrings++
      if (!firstLongClass) firstLongClass = rawStart
    }
    if (animateAt < 0 && hasAnimateUtility(text)) animateAt = rawStart
  }

  walk(ast.program, (node, ancestors) => {
    switch (node.type) {
      case 'StringLiteral':
        if (ancestors.at(-1)?.type === 'ImportDeclaration' || ancestors.at(-1)?.type === 'ExportNamedDeclaration' || ancestors.at(-1)?.type === 'ExportAllDeclaration') return
        checkText(node.value, node.start, node.end, ancestors)
        break
      case 'TemplateLiteral': {
        const text = node.quasis.map((q) => q.value.cooked ?? q.value.raw).join(' ')
        checkText(text, node.start, node.end, ancestors)
        break
      }
      case 'JSXText':
        checkText(node.value, node.start, node.end, ancestors)
        break
      case 'JSXAttribute':
        if (node.name?.name === 'style' && node.value?.type === 'JSXExpressionContainer') {
          const expr = node.value.expression
          const allowed = expr.type === 'ObjectExpression' && styleObjectAllowed(expr)
          if (!allowed && !inlineExempt) ctx.report('no-inline-style', node.start, '')
        }
        break
      case 'ObjectProperty': {
        const key = node.key.type === 'Identifier' ? node.key.name : node.key.value
        if (key === 'repeat' && node.value.type === 'Identifier' && node.value.name === 'Infinity' && animateAt < 0) {
          animateAt = node.start
        }
        break
      }
      case 'ImportDeclaration':
      case 'ExportNamedDeclaration':
      case 'ExportAllDeclaration':
      case 'ImportExpression':
      case 'CallExpression': {
        let spec = null
        if (node.type === 'CallExpression') {
          if (node.callee.type === 'Import' && node.arguments[0]?.type === 'StringLiteral') spec = node.arguments[0].value
        } else if (node.type === 'ImportExpression') {
          if (node.source?.type === 'StringLiteral') spec = node.source.value
        } else if (node.source) spec = node.source.value
        if (!spec) break
        const target = resolveImport(file, spec)
        if (!target) break
        const retired = retiredFolder(target)
        if (retired && !under(file, retired)) {
          ctx.report('no-retired-imports', node.start, `"${spec}"`)
        }
        if (layer && FORBIDDEN_LAYERS[layer]) {
          for (const banned of FORBIDDEN_LAYERS[layer]) {
            if (under(target, `src/design-system/${banned}`)) {
              ctx.report('ds-layering', node.start, `${layer} must not import ${banned} ("${spec}")`)
            }
          }
        }
        break
      }
      default:
    }
  })

  if (file.startsWith('src/pages/') && longClassStrings > LONG_CLASS_LIMIT) {
    ctx.report('pages-use-system', firstLongClass, `${longClassStrings} className strings over ${LONG_CLASS} characters`)
  }
  if (animateAt >= 0 && !HANDLES_REDUCED.test(source)) {
    ctx.report('motion-needs-reduced', animateAt, '')
  }
  return comments
}

/** Returns [start, end) offsets of the @theme and top-level :root blocks in a CSS source. */
function tokenBlocks(source) {
  const blocks = []
  const re = /(^|\n)\s*(@theme\b[^{]*|:root)\s*\{/g
  let m
  while ((m = re.exec(source))) {
    let depth = 0
    let i = source.indexOf('{', m.index)
    const start = m.index
    for (; i < source.length; i++) {
      if (source[i] === '{') depth++
      else if (source[i] === '}' && --depth === 0) break
    }
    blocks.push([start, i + 1])
    re.lastIndex = i + 1
  }
  return blocks
}

function lintCss(file, source, ctx) {
  const comments = []
  // Blank out comments (keeping offsets) so declarations are scanned without them.
  let code = source.replace(/\/\*[\s\S]*?\*\//g, (text, offset) => {
    const startLine = locate(ctx.starts, offset).line
    comments.push({ text: text.slice(2, -2), offset, line: startLine, endLine: locate(ctx.starts, offset + text.length - 1).line })
    return text.replace(/[^\n]/g, ' ')
  })
  for (const c of comments) {
    DASHES.lastIndex = 0
    const m = DASHES.exec(c.text)
    if (m) ctx.report('no-em-dash', c.offset + 2 + m.index, 'in a comment')
  }
  DASHES.lastIndex = 0
  for (const m of code.matchAll(DASHES)) ctx.report('no-em-dash', m.index, 'in CSS')
  if (file === INDEX_CSS) {
    for (const [start, end] of tokenBlocks(code)) {
      code = code.slice(0, start) + code.slice(start, end).replace(/[^\n]/g, ' ') + code.slice(end)
    }
  }
  for (const f of rawColors(code)) {
    // Skip hex-looking selectors such as #root; only flag values after a colon.
    const lineStart = code.lastIndexOf('\n', f.index) + 1
    const before = code.slice(lineStart, f.index)
    if (f.text.startsWith('#') && !before.includes(':')) continue
    ctx.report('no-raw-color', f.index, `"${f.text}"`)
  }
  for (const m of code.matchAll(/@apply\s+([^;]+);/g)) {
    for (const f of scanClassTokens(m[1])) ctx.report(f.rule, m.index, `"${f.text}" in @apply`)
  }
  const animated = /@keyframes\b|\binfinite\b/.exec(code)
  if (animated && !/prefers-reduced-motion/.test(source)) ctx.report('motion-needs-reduced', animated.index, '')
  return comments
}

function lintMarkdown(file, source, ctx) {
  DASHES.lastIndex = 0
  for (const m of source.matchAll(DASHES)) ctx.report('no-em-dash', m.index, 'in docs')
  return []
}

/**
 * Lints one file's source as if it lived at `file` (a path relative to the client root, with
 * forward slashes). Returns [{ file, line, col, rule, severity, message }].
 */
export function lintSource(file, source, { strict = false } = {}) {
  const starts = lineStarts(source)
  const raw = []
  const ctx = {
    starts,
    report(rule, offset, detail, severity) {
      const { line, col } = locate(starts, Math.max(0, Math.min(offset, source.length)))
      raw.push({
        file,
        line,
        col,
        rule,
        severity: severity || severityFor(rule, file, strict),
        message: detail ? `${RULES[rule] || rule}: ${detail}` : RULES[rule] || rule,
      })
    },
  }
  const ext = path.extname(file)
  let comments = []
  if (ext === '.css') comments = lintCss(file, source, ctx)
  else if (ext === '.md' || ext === '.mdx') comments = lintMarkdown(file, source, ctx)
  else comments = lintJs(file, source, ctx)

  const overrideErrors = []
  const overrides = parseOverrides(comments, (rule, offset, detail) => {
    const { line, col } = locate(starts, offset)
    overrideErrors.push({ file, line, col, rule, severity: 'error', message: `${RULES[rule]}: ${detail}` })
  })
  // Tests build fixtures with raw styles on purpose, so only the dash and layering rules apply.
  const isTest = TEST_FILE.test(file)
  const kept = raw.filter((v) => !overrides.get(v.line)?.has(v.rule) && (!isTest || TEST_RULES.has(v.rule)))
  // Avoid double reports of the same rule at the same spot (a string seen as text and as a class).
  const seen = new Set()
  const unique = kept.filter((v) => {
    const key = `${v.line}:${v.col}:${v.rule}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return [...unique, ...overrideErrors].sort((a, b) => a.line - b.line || a.col - b.col)
}

/** Lists the files the lint covers, relative to `root` with forward slashes. */
export function listFiles(root) {
  const out = []
  const visit = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || `${rel}/` === TOKENS_DIR) continue
        visit(rel)
      } else if (/\.(jsx?|mjs|css)$/.test(entry.name)) out.push(rel)
      else if (/\.mdx?$/.test(entry.name) && rel.startsWith(DS)) out.push(rel)
    }
  }
  if (fs.existsSync(path.join(root, 'src'))) visit('src')
  return out.sort()
}

/** Counts errors outside src/design-system/ per file and rule: { file: { rule: n } }. */
export function countBaseline(violations) {
  const counts = {}
  for (const v of violations) {
    if (v.severity !== 'error' || v.file.startsWith(DS)) continue
    counts[v.file] ??= {}
    counts[v.file][v.rule] = (counts[v.file][v.rule] || 0) + 1
  }
  const sorted = {}
  for (const file of Object.keys(counts).sort()) {
    sorted[file] = {}
    for (const rule of Object.keys(counts[file]).sort()) sorted[file][rule] = counts[file][rule]
  }
  return sorted
}

/**
 * Compares violations with a baseline. Returns { failing, baselined, improved } where `failing`
 * holds the errors that fail the run (any error in src/design-system/, and every error of a file
 * and rule whose count is above the baseline) and `improved` lists [file, rule, was, now] for
 * counts that dropped.
 */
export function compareToBaseline(violations, baseline = {}) {
  const errors = violations.filter((v) => v.severity === 'error')
  const counts = countBaseline(errors)
  const failing = errors.filter((v) => v.file.startsWith(DS))
  let baselined = 0
  for (const [file, rules] of Object.entries(counts)) {
    for (const [rule, count] of Object.entries(rules)) {
      const allowed = baseline[file]?.[rule] || 0
      if (count > allowed) failing.push(...errors.filter((v) => v.file === file && v.rule === rule))
      else baselined += count
    }
  }
  const improved = []
  for (const [file, rules] of Object.entries(baseline)) {
    for (const [rule, was] of Object.entries(rules)) {
      const now = counts[file]?.[rule] || 0
      if (now < was) improved.push([file, rule, was, now])
    }
  }
  failing.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col)
  return { failing, baselined, improved }
}

/** Lints every file under `root`. */
export function lintProject(root, options = {}) {
  const violations = []
  for (const file of listFiles(root)) {
    violations.push(...lintSource(file, fs.readFileSync(path.join(root, file), 'utf8'), options))
  }
  return violations
}

function format(v) {
  return `${v.file}:${v.line}:${v.col} ${v.rule} ${v.message}`
}

/** Runs the CLI. Returns the exit code. */
export function run(argv, { root, baselinePath, log = console.log, error = console.error } = {}) {
  const strict = argv.includes('--strict')
  const update = argv.includes('--update-baseline')
  const verbose = argv.includes('--verbose')
  const violations = lintProject(root, { strict })

  if (update) {
    const counts = countBaseline(violations)
    fs.writeFileSync(baselinePath, `${JSON.stringify(counts, null, 2)}\n`)
    const total = Object.values(counts).reduce((sum, rules) => sum + Object.values(rules).reduce((a, b) => a + b, 0), 0)
    log(`Wrote ${path.basename(baselinePath)}: ${total} legacy error(s) in ${Object.keys(counts).length} file(s).`)
  }

  const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')) : {}
  const { failing, baselined, improved } = compareToBaseline(violations, baseline)
  const warnings = violations.filter((v) => v.severity === 'warn')
  const shownWarnings = verbose ? warnings : warnings.filter((v) => v.file.startsWith(DS))

  if (failing.length > 0) {
    error('Errors:')
    for (const v of failing) error(`  ${format(v)}`)
  }
  if (shownWarnings.length > 0) {
    log('Warnings:')
    for (const v of shownWarnings) log(`  ${format(v)}`)
  }

  const byRule = {}
  for (const v of violations) {
    byRule[v.rule] ??= { error: 0, warn: 0 }
    byRule[v.rule][v.severity]++
  }
  log('Summary by rule (errors / warnings):')
  for (const rule of Object.keys(byRule).sort()) log(`  ${rule}: ${byRule[rule].error} / ${byRule[rule].warn}`)
  log(`${failing.length} failing error(s), ${baselined} legacy error(s) in the baseline, ${warnings.length} warning(s).`)
  if (!verbose && warnings.length > shownWarnings.length) {
    log(`${warnings.length - shownWarnings.length} warning(s) outside src/design-system/ hidden; add --verbose to list them.`)
  }
  if (improved.length > 0 && !update) {
    log('Legacy counts dropped below the baseline:')
    for (const [file, rule, was, now] of improved) log(`  ${file} ${rule}: ${was} -> ${now}`)
    log('Run `npm run lint:ds -- --update-baseline` to lock in the improvement.')
  }
  return failing.length > 0 ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const baselinePath = fileURLToPath(new URL('./lint-design-system.baseline.json', import.meta.url))
  process.exitCode = run(process.argv.slice(2), { root, baselinePath })
}
