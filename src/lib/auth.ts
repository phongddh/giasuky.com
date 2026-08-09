import type { Context, Next } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { AppEnv, SessionUser } from './types'
import { problem, uuid } from './util'

const COOKIE = 'gsk_session'
const TTL_DAYS = 30

export async function createSession(c: Context<AppEnv>, userId: string) {
  const token = uuid() + uuid().replace(/-/g, '')
  const expires = new Date(Date.now() + TTL_DAYS * 86400_000)
  await c.env.DB.prepare(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`
  )
    .bind(token, userId, expires.toISOString().replace('T', ' ').slice(0, 19))
    .run()
  setCookie(c, COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: TTL_DAYS * 86400
  })
  await c.env.DB.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`)
    .bind(userId)
    .run()
  return token
}

export async function destroySession(c: Context<AppEnv>) {
  const t = getCookie(c, COOKIE)
  if (t) await c.env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(t).run()
  deleteCookie(c, COOKIE, { path: '/' })
}

/** Đọc session vào context.var.user (không bắt buộc đăng nhập) */
export async function sessionMiddleware(c: Context<AppEnv>, next: Next) {
  c.set('user', null)
  const token = getCookie(c, COOKIE)
  if (token) {
    const row = await c.env.DB.prepare(
      `SELECT u.id, u.full_name, u.email, u.elder_mode,
              cm.clan_id AS clan_id, cm.role AS clan_role
         FROM sessions s
         JOIN users u ON u.id = s.user_id AND u.is_deleted = 0
         LEFT JOIN clan_members cm ON cm.user_id = u.id
        WHERE s.token = ? AND s.expires_at > datetime('now')
        LIMIT 1`
    )
      .bind(token)
      .first<SessionUser>()
    if (row) c.set('user', row)
  }
  await next()
}

/** Bắt buộc đăng nhập cho API */
export async function requireAuth(c: Context<AppEnv>, next: Next) {
  if (!c.var.user) {
    return c.json(problem(401, 'Unauthorized', 'Vui lòng đăng nhập để tiếp tục.'), 401)
  }
  await next()
}

/** 6.3.4 Audit log immutable — ghi mọi hành động nhạy cảm */
export async function audit(
  c: Context<AppEnv>,
  action: string,
  targetType: string,
  targetId: string | null,
  metadata?: Record<string, unknown>
) {
  try {
    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, actor_user_id, action, target_type, target_id, metadata, ip_address, user_agent)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
    )
      .bind(
        uuid(),
        c.var.user?.id ?? null,
        action,
        targetType,
        targetId,
        metadata ? JSON.stringify(metadata) : null,
        c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || null,
        c.req.header('user-agent') || null
      )
      .run()
  } catch (e) {
    console.error('audit failed', e)
  }
}
