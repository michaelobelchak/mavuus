import { describe, it, expect } from 'vitest'
import { resumeHref } from './resumeHref'

describe('resumeHref', () => {
  it('should link new and old stored resume urls through the files route', () => {
    expect(resumeHref('/api/files/resumes/abc.pdf')).toBe('/api/files/resumes/abc.pdf')
    expect(resumeHref('/uploads/resumes/resume-2-1.pdf')).toBe('/api/files/resumes/resume-2-1.pdf')
  })

  it('should give no link for anything else', () => {
    expect(resumeHref('https://evil.example/cv.pdf')).toBeNull()
    expect(resumeHref('/uploads/resumes/../index.js')).toBeNull()
    expect(resumeHref('javascript:alert(1)')).toBeNull()
    expect(resumeHref(null)).toBeNull()
  })
})
