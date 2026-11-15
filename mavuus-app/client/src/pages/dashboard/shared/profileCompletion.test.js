import { describe, it, expect } from 'vitest'
import { profileCompletion } from './profileCompletion'

describe('profileCompletion', () => {
  it('should be null without a profile', () => {
    expect(profileCompletion(null)).toBeNull()
  })

  it('should list what is missing with the tab where each is done', () => {
    const result = profileCompletion({ avatar_url: '/a.webp', bio: '  ', skills: ['SEO', 'ABM', 'PLG'], experience: [] })
    expect(result).toMatchObject({ percent: 40, done: 2, total: 5, missing: ['a bio', 'your experience', 'a resume'] })
    expect(result.steps).toEqual([
      { key: 'bio', action: 'Write a short bio', tab: 'about' },
      { key: 'experience', action: 'Add your experience', tab: 'experience' },
      { key: 'resume', action: 'Upload a resume', tab: 'experience' },
    ])
  })

  it('should be 100 percent with nothing missing', () => {
    const full = { avatar_url: 'a', bio: 'b', skills: ['1', '2', '3'], experience: [{ id: 1 }], resume_filename: 'cv.pdf' }
    expect(profileCompletion(full)).toMatchObject({ percent: 100, missing: [], steps: [] })
  })
})
