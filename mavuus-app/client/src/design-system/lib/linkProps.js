import { Link as RouterLink } from 'react-router-dom'

const EXTERNAL = /^https?:\/\//i

function preventDefault(event) {
  event.preventDefault()
}

/**
 * Resolves what a link-like component renders.
 * - `to` renders a react-router Link, `href` renders an anchor.
 * - Absolute http(s) hrefs open in a new tab with rel="noopener noreferrer". A consumer
 *   `target` or `rel` wins. Any `target="_blank"` gets a safe rel when none is given.
 * - `inactive` (disabled or loading) sets aria-disabled, drops the link from the tab order
 *   and blocks navigation.
 * Render <ExternalHint /> inside the link when `opensNewTab` is true.
 */
export function linkProps({ to, href, target, rel, onClick, inactive = false }) {
  const isRouter = to !== undefined
  const isExternal = !isRouter && typeof href === 'string' && EXTERNAL.test(href)
  const resolvedTarget = target ?? (isExternal ? '_blank' : undefined)
  const opensNewTab = resolvedTarget === '_blank'
  const resolvedRel = rel ?? (opensNewTab ? 'noopener noreferrer' : undefined)

  const props = {
    ...(isRouter ? { to } : { href }),
    target: resolvedTarget,
    rel: resolvedRel,
    onClick: inactive ? preventDefault : onClick,
    'aria-disabled': inactive || undefined,
    tabIndex: inactive ? -1 : undefined,
  }

  return { Component: isRouter ? RouterLink : 'a', props, isExternal, opensNewTab }
}
