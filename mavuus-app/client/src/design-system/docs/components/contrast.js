// WCAG contrast helpers for the Storybook foundations pages. Colors come from tokens/tokens.js.

/** Parses `#rgb`, `#rrggbb` or `rgb()/rgba()` into { r, g, b, a } (0 to 255, alpha 0 to 1). */
export function parseColor(value) {
  const input = String(value).trim()
  const hex = input.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join('') : hex[1]
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: 1,
    }
  }
  const rgb = input.match(/^rgba?\(([^)]+)\)$/i)
  if (rgb) {
    const [r, g, b, a = 1] = rgb[1].split(',').map((part) => Number(part.trim()))
    return { r, g, b, a }
  }
  return null
}

/** Composites a translucent color over an opaque backdrop. */
function flatten(color, backdrop) {
  const { a } = color
  return {
    r: color.r * a + backdrop.r * (1 - a),
    g: color.g * a + backdrop.g * (1 - a),
    b: color.b * a + backdrop.b * (1 - a),
    a: 1,
  }
}

function luminance({ r, g, b }) {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

const WHITE = { r: 255, g: 255, b: 255, a: 1 }

/** Contrast ratio of `foreground` on `background` (white by default), or null for values it can't parse. */
export function contrastRatio(foreground, background = WHITE) {
  const bg = typeof background === 'string' ? parseColor(background) : background
  const fg = parseColor(foreground)
  if (!fg || !bg) return null
  const solidBg = bg.a < 1 ? flatten(bg, WHITE) : bg
  const solidFg = fg.a < 1 ? flatten(fg, solidBg) : fg
  const [light, dark] = [luminance(solidFg), luminance(solidBg)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

/** WCAG level for normal-size text: AAA, AA, AA large (3:1, large text only) or Fail. */
export function contrastLevel(ratio) {
  if (ratio == null) return 'n/a'
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA large'
  return 'Fail'
}
