import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'

let app, db, alice, bob

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
  alice = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })
  bob = generateTestToken({ id: 2, email: 'bob@test.com', name: 'Bob Test' })
  const insert = db.prepare('INSERT INTO users (id, email, password_hash, name, is_banned, is_deleted) VALUES (?, ?, ?, ?, ?, ?)')
  insert.run(3, 'banned@test.com', 'x', 'Banned Person', 1, 0)
  insert.run(4, 'gone@test.com', 'x', 'Deleted Person', 0, 1)
})

afterAll(() => db.close())

const start = (token, body) =>
  request(app).post('/api/messages/conversations').set('Authorization', `Bearer ${token}`).send(body)

describe('starting a conversation', () => {
  it('should refuse a conversation with yourself', async () => {
    const res = await start(alice, { userId: 1, message: 'Hi me' })
    expect(res.status).toBe(400)
    expect(db.prepare('SELECT COUNT(*) c FROM messages').get().c).toBe(0)
  })

  it('should answer 404 for a member who does not exist, is banned or was deleted', async () => {
    for (const userId of [99, 3, 4, 'abc']) {
      const res = await start(alice, { userId, message: 'Hello' })
      expect(res.status, String(userId)).toBe(404)
    }
    expect(db.prepare('SELECT COUNT(*) c FROM conversations').get().c).toBe(0)
  })

  it('should refuse a blank or non-text message', async () => {
    expect((await start(alice, { userId: 2, message: '   ' })).status).toBe(400)
    expect((await start(alice, { userId: 2, message: { text: 'hi' } })).status).toBe(400)
  })

  it('should refuse a message over 10,000 characters', async () => {
    expect((await start(alice, { userId: 2, message: 'a'.repeat(10001) })).status).toBe(400)
  })

  it('should reuse the conversation between two members', async () => {
    const first = await start(alice, { userId: 2, message: 'Hello Bob' })
    expect(first.status).toBe(201)
    const second = await start(bob, { userId: 1, message: 'Hi Alice' })
    expect(second.body.conversationId).toBe(first.body.conversationId)
  })
})

describe('sending and reading messages', () => {
  let conversationId

  beforeAll(async () => {
    const res = await start(alice, { userId: 2, message: 'Order check' })
    conversationId = res.body.conversationId
  })

  const send = (token, content) =>
    request(app)
      .post(`/api/messages/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content })

  it('should refuse a non-text or too long message', async () => {
    expect((await send(alice, 42)).status).toBe(400)
    expect((await send(alice, 'a'.repeat(10001))).status).toBe(400)
  })

  it('should keep messages sent in the same second in the order they were sent', async () => {
    const before = db.prepare('SELECT COUNT(*) c FROM messages WHERE conversation_id = ?').get(conversationId).c
    // Same timestamp for all of them, as CURRENT_TIMESTAMP gives within one second.
    const insert = db.prepare("INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES (?, ?, ?, '2099-01-01 10:00:00')")
    for (const content of ['one', 'two', 'three', 'four']) insert.run(conversationId, 2, content)
    const res = await request(app)
      .get(`/api/messages/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${alice}`)
    expect(res.body.slice(before).map((m) => m.content)).toEqual(['one', 'two', 'three', 'four'])

    const list = await request(app).get('/api/messages/conversations').set('Authorization', `Bearer ${alice}`)
    expect(list.body.find((c) => c.id === conversationId).last_message).toBe('four')
  })

  it('should answer 403 to marking a conversation read when you are not in it', async () => {
    const carol = generateTestToken({ id: 3, email: 'banned@test.com', name: 'Banned Person' })
    const res = await request(app).put(`/api/messages/conversations/${conversationId}/read`).set('Authorization', `Bearer ${carol}`)
    expect(res.status).toBe(403)
  })
})
