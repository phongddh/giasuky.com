/** Identity Service (spec 7.1 #1) — /v1/auth/* */
import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'
import { hashPassword, problem, uuid, verifyPassword } from '../lib/util'
import { audit, createSession, destroySession, requireAuth } from '../lib/auth'

export const authRoutes = new Hono<AppEnv>()

authRoutes.post('/register', async (c) => {
  const body = await c.req.json().catch(() => ({} as any))
  const { email, password, full_name, phone } = body
  if (!email || !password || !full_name) {
    return c.json(problem(400, 'Validation error', 'Cần email, mật khẩu và họ tên.'), 400)
  }
  if (String(password).length < 6) {
    return c.json(problem(400, 'Validation error', 'Mật khẩu tối thiểu 6 ký tự.'), 400)
  }
  const exists = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`)
    .bind(email)
    .first()
  if (exists) return c.json(problem(409, 'Conflict', 'Email đã được dùng.'), 409)

  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO users (id, email, phone, hashed_password, full_name) VALUES (?1,?2,?3,?4,?5)`
  )
    .bind(id, email, phone || null, await hashPassword(password), full_name)
    .run()
  await c.env.DB.prepare(
    `INSERT INTO subscriptions (id, user_id, plan) VALUES (?1, ?2, 'free')`
  )
    .bind(uuid(), id)
    .run()
  await createSession(c, id)
  await audit(c, 'user.register', 'user', id)
  return c.json({ id, email, full_name })
})

authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json().catch(() => ({} as any))
  const u = await c.env.DB.prepare(
    `SELECT id, hashed_password, full_name FROM users WHERE email = ? AND is_deleted = 0`
  )
    .bind(email || '')
    .first<any>()
  if (!u || !(await verifyPassword(password || '', u.hashed_password))) {
    return c.json(problem(401, 'Unauthorized', 'Email hoặc mật khẩu không đúng.'), 401)
  }
  await createSession(c, u.id)
  await audit(c, 'user.login', 'user', u.id)
  return c.json({ id: u.id, full_name: u.full_name })
})

/** Demo login nhanh (alpha test 20 gia đình — spec 15.2) */
authRoutes.post('/demo', async (c) => {
  const u = await c.env.DB.prepare(
    `SELECT id, full_name FROM users WHERE email = 'tung.nguyen@example.com'`
  ).first<any>()
  if (!u) return c.json(problem(404, 'Not found', 'Chưa seed dữ liệu demo.'), 404)
  await createSession(c, u.id)
  await audit(c, 'user.login.demo', 'user', u.id)
  return c.json({ id: u.id, full_name: u.full_name })
})

authRoutes.post('/logout', async (c) => {
  await destroySession(c)
  return c.json({ ok: true })
})

authRoutes.get('/me', async (c) => {
  if (!c.var.user) return c.json({ user: null })
  const sub = await c.env.DB.prepare(
    `SELECT plan, status FROM subscriptions WHERE user_id = ? ORDER BY started_at DESC LIMIT 1`
  )
    .bind(c.var.user.id)
    .first<any>()
  return c.json({ user: c.var.user, subscription: sub ?? { plan: 'free', status: 'active' } })
})

/** 8.3.4 — Ông bà mode */
authRoutes.post('/elder-mode', requireAuth, async (c) => {
  const { enabled } = await c.req.json().catch(() => ({ enabled: false }))
  await c.env.DB.prepare(`UPDATE users SET elder_mode = ? WHERE id = ?`)
    .bind(enabled ? 1 : 0, c.var.user!.id)
    .run()
  return c.json({ ok: true, elder_mode: enabled ? 1 : 0 })
})

/** 11.5 / P6 Data Sovereignty — export toàn bộ dữ liệu người dùng */
authRoutes.get('/export', requireAuth, async (c) => {
  const uid = c.var.user!.id
  const clanId = c.var.user!.clan_id
  const [persons, memories, advices, consents, wills, interviews, capsules, audits] =
    await Promise.all([
      c.env.DB.prepare(`SELECT * FROM persons WHERE clan_id = ?`).bind(clanId).all(),
      c.env.DB.prepare(`SELECT * FROM memories WHERE clan_id = ?`).bind(clanId).all(),
      c.env.DB.prepare(`SELECT * FROM advices WHERE clan_id = ?`).bind(clanId).all(),
      c.env.DB.prepare(
        `SELECT * FROM consent_records WHERE subject_person_id IN (SELECT id FROM persons WHERE clan_id = ?)`
      )
        .bind(clanId)
        .all(),
      c.env.DB.prepare(
        `SELECT * FROM digital_wills WHERE testator_person_id IN (SELECT id FROM persons WHERE clan_id = ?)`
      )
        .bind(clanId)
        .all(),
      c.env.DB.prepare(`SELECT * FROM interview_sessions WHERE clan_id = ?`).bind(clanId).all(),
      c.env.DB.prepare(`SELECT * FROM time_capsules WHERE clan_id = ?`).bind(clanId).all(),
      c.env.DB.prepare(
        `SELECT * FROM audit_logs WHERE actor_user_id = ? ORDER BY created_at DESC LIMIT 500`
      )
        .bind(uid)
        .all()
    ])
  await audit(c, 'user.data.export', 'user', uid)
  return c.json(
    {
      exportedAt: new Date().toISOString(),
      user: c.var.user,
      persons: persons.results,
      memories: memories.results,
      advices: advices.results,
      consent_records: consents.results,
      digital_wills: wills.results,
      interview_sessions: interviews.results,
      time_capsules: capsules.results,
      audit_logs: audits.results
    },
    200,
    { 'Content-Disposition': 'attachment; filename="giasuky-export.json"' }
  )
})
