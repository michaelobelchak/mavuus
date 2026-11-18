import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import express from 'express'
import request from 'supertest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { cacheControlFor, serveClient } from '../static.js'

let dist, app

beforeAll(() => {
  dist = mkdtempSync(join(tmpdir(), 'mavuus-dist-'))
  mkdirSync(join(dist, 'fonts/fixel'), { recursive: true })
  mkdirSync(join(dist, 'images/home'), { recursive: true })
  writeFileSync(join(dist, 'index.html'), '<!doctype html><title>Mavuus</title>')
  writeFileSync(join(dist, 'fonts/fixel/fixeltext-medium.woff2'), 'wOF2')
  writeFileSync(join(dist, 'images/home/av1.webp'), 'RIFF')
  writeFileSync(join(dist, 'robots.txt'), 'User-agent: *')
  app = express()
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
  serveClient(app, dist)
})

afterAll(() => {
  rmSync(dist, { recursive: true, force: true })
})

describe('cacheControlFor', () => {
  it('should cache fonts for 30 days and images for 7 days, never as immutable', () => {
    expect(cacheControlFor('/fonts/fixel/fixeltext-medium.woff2')).toBe('public, max-age=2592000')
    expect(cacheControlFor('/images/home/av1.webp')).toBe('public, max-age=604800, stale-while-revalidate=86400')
    expect(cacheControlFor('/robots.txt')).toBeNull()
  })
})

describe('serveClient', () => {
  it('should send the cache header for fonts and images', async () => {
    const font = await request(app).get('/fonts/fixel/fixeltext-medium.woff2')
    expect(font.status).toBe(200)
    expect(font.headers['cache-control']).toBe('public, max-age=2592000')
    const image = await request(app).get('/images/home/av1.webp')
    expect(image.headers['cache-control']).toBe('public, max-age=604800, stale-while-revalidate=86400')
  })

  it('should keep the default header for other files and fall back to index.html for app routes', async () => {
    const robots = await request(app).get('/robots.txt')
    expect(robots.headers['cache-control']).toBe('public, max-age=0')
    const route = await request(app).get('/dashboard/jobs')
    expect(route.status).toBe(200)
    expect(route.text).toContain('<title>Mavuus</title>')
    expect((await request(app).get('/api/health')).body).toEqual({ status: 'ok' })
  })
})
