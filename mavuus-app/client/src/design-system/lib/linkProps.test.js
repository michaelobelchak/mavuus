import { describe, it, expect, vi } from 'vitest'
import { Link as RouterLink } from 'react-router-dom'
import { linkProps } from './linkProps'

describe('linkProps', () => {
  it('should use a router link when given to', () => {
    const { Component, props, isExternal } = linkProps({ to: '/jobs' })
    expect(Component).toBe(RouterLink)
    expect(props.to).toBe('/jobs')
    expect(props.href).toBeUndefined()
    expect(isExternal).toBe(false)
  })

  it('should use an anchor that opens a new tab with rel when href is external', () => {
    const { Component, props, isExternal, opensNewTab } = linkProps({ href: 'https://mavuus.com' })
    expect(Component).toBe('a')
    expect(props).toMatchObject({ href: 'https://mavuus.com', target: '_blank', rel: 'noopener noreferrer' })
    expect(isExternal).toBe(true)
    expect(opensNewTab).toBe(true)
  })

  it('should keep internal hrefs in the same tab when href is relative or mailto', () => {
    for (const href of ['/about', 'mailto:hello@mavuus.com', '#faq']) {
      const { props, isExternal, opensNewTab } = linkProps({ href })
      expect(props.target).toBeUndefined()
      expect(props.rel).toBeUndefined()
      expect(isExternal).toBe(false)
      expect(opensNewTab).toBe(false)
    }
  })

  it('should let the consumer override target and rel and report no new tab when target is not _blank', () => {
    const { props, isExternal, opensNewTab } = linkProps({ href: 'https://mavuus.com', target: '_self', rel: 'external' })
    expect(props).toMatchObject({ target: '_self', rel: 'external' })
    expect(isExternal).toBe(true)
    expect(opensNewTab).toBe(false)
  })

  it('should add noopener rel when the consumer opens a new tab without rel', () => {
    const { props, opensNewTab } = linkProps({ href: '/report.pdf', target: '_blank' })
    expect(props.rel).toBe('noopener noreferrer')
    expect(opensNewTab).toBe(true)
  })

  it('should set aria-disabled, remove it from the tab order and block navigation when inactive', () => {
    const onClick = vi.fn()
    const { props } = linkProps({ href: '/jobs', onClick, inactive: true })
    expect(props['aria-disabled']).toBe(true)
    expect(props.tabIndex).toBe(-1)
    const event = { preventDefault: vi.fn() }
    props.onClick(event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should pass onClick through when active', () => {
    const onClick = vi.fn()
    const { props } = linkProps({ href: '/jobs', onClick })
    expect(props.onClick).toBe(onClick)
    expect(props['aria-disabled']).toBeUndefined()
    expect(props.tabIndex).toBeUndefined()
  })
})
