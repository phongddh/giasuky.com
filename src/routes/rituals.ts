/**
 * Ritual Service (spec 7.1 #4) — F1 Smart Digital Altar + F6 Ritual Sync
 * Đồng bộ hiệu ứng thắp nhang: spec dùng Redis pub/sub + WebSocket;
 * trên Cloudflare Pages dùng long-poll cursor trên D1 (<500ms perceived).
 */
import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'
import { RELIGION_THEMES } from '../lib/types'
import { audit, requireAuth } from '../lib/auth'
import { json, paramOf, problem, uuid } from '../lib/util'
import { formatLunar, majorLunarHolidays, nextAnniversary, solarToLunar, lunarToSolar } from '../lib/lunar'
import {
  clanOfAltar, clanOfRitual, guardClanView, guardClanWrite, isOpenAccess, resolveClanId, visibleClanIds
} from '../lib/access'

export const ritualRoutes = new Hono<AppEnv>()

// ==================== F1 — DIGITAL ALTAR ============================

ritualRoutes.get('/altars', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT * FROM altars ORDER BY created_at`
  ).all<any>()
  const visible = await visibleClanIds(c)
  const all = visible ? rows.results.filter((a) => visible.has(a.clan_id)) : rows.results
  const altars = []
  for (const a of all) {
    const ids = json<string[]>(a.subject_person_ids, [])
    let subjects: any[] = []
    if (ids.length) {
      const ph = ids.map(() => '?').join(',')
      const ps = await c.env.DB.prepare(
        `SELECT id, full_name, photo_url, birth_date, death_date,
                death_anniv_lunar_day AS d, death_anniv_lunar_month AS m
           FROM persons WHERE id IN (${ph})`
      )
        .bind(...ids)
        .all<any>()
      subjects = (ps.results || []).map((p) => ({
        ...p,
        nextAnniversary: p.d && p.m ? nextAnniversary(p.d, p.m) : null,
        lunarLabel: p.d && p.m ? `${p.d}/${p.m} âm lịch` : null
      }))
    }
    const cnt = await c.env.DB.prepare(
      `SELECT COUNT(*) AS n FROM ritual_events WHERE altar_id = ? AND type='INCENSE'`
    )
      .bind(a.id)
      .first<any>()
    altars.push({ ...a, subjects, incenseCount: cnt?.n ?? 0, themes: undefined })
  }
  return c.json({ altars, themes: RELIGION_THEMES })
})

ritualRoutes.get('/altars/:id', async (c) => {
  const id = paramOf(c, 'id')
  const a = await c.env.DB.prepare(`SELECT * FROM altars WHERE id = ?`).bind(id).first<any>()
  if (!a) return c.json(problem(404, 'Not found', 'Không tìm thấy bàn thờ.'), 404)
  const denied = await guardClanView(c, a.clan_id)
  if (denied) return denied
  const ids = json<string[]>(a.subject_person_ids, [])
  let subjects: any[] = []
  if (ids.length) {
    const ph = ids.map(() => '?').join(',')
    const ps = await c.env.DB.prepare(
      `SELECT p.id, p.full_name, p.photo_url, p.birth_date, p.death_date, p.bio, p.birth_place,
              p.death_anniv_lunar_day AS d, p.death_anniv_lunar_month AS m,
              (SELECT COUNT(*) FROM memories m2 WHERE m2.subject_person_id = p.id AND m2.status='APPROVED') AS memory_count
         FROM persons p WHERE p.id IN (${ph})`
    )
      .bind(...ids)
      .all<any>()
    subjects = (ps.results || []).map((p) => ({
      ...p,
      nextAnniversary: p.d && p.m ? nextAnniversary(p.d, p.m) : null,
      lunarLabel: p.d && p.m ? `${p.d}/${p.m} âm lịch` : null
    }))
  }
  const log = await c.env.DB.prepare(
    `SELECT re.*, u.full_name AS user_name FROM ritual_events re
       LEFT JOIN users u ON u.id = re.user_id
      WHERE re.altar_id = ? ORDER BY re.created_at DESC LIMIT 40`
  )
    .bind(id)
    .all<any>()
  const today = new Date(Date.now() + 7 * 3600 * 1000)
  const lunarToday = solarToLunar(today.getUTCDate(), today.getUTCMonth() + 1, today.getUTCFullYear())
  return c.json({
    altar: { ...a, spatial_assets: json<any>(a.spatial_assets, {}) },
    subjects,
    ritualLog: (log.results || []).map((r) => ({ ...r, payload: json<any>(r.payload, {}) })),
    lunarToday: { ...lunarToday, label: formatLunar(lunarToday) },
    themes: RELIGION_THEMES
  })
})

ritualRoutes.post('/altars', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.name || !Array.isArray(b.subjectPersonIds) || !b.subjectPersonIds.length) {
    return c.json(problem(400, 'Validation error', 'Cần tên bàn thờ và ít nhất 1 người được thờ.'), 400)
  }
  const clanId = b.clan_id || c.var.user!.clan_id || null
  if (!clanId) {
    return c.json(problem(400, 'Validation error', 'Cần clan_id (dòng họ của bàn thờ).'), 400)
  }
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  const theme = RELIGION_THEMES.find((t) => t.id === b.religionTheme)?.id || 'Phat'
  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO altars (id, clan_id, owner_user_id, name, subject_person_ids, religion_theme,
       spatial_assets, ambient_sound, horizontal_scroll_text)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)`
  )
    .bind(
      id, b.clan_id || c.var.user!.clan_id || null, c.var.user!.id, b.name,
      JSON.stringify(b.subjectPersonIds), theme,
      JSON.stringify(
        b.spatialAssets || {
          background3D: null,
          ambientSounds: ['chuong_chua', 'mua', 'tung_kinh'],
          incenseParticleConfig: { count: 24, riseSeconds: 4, drift: 0.4 },
          lightingProfile: { key: 'warm', intensity: 0.7 }
        }
      ),
      b.ambientSound || 'chuong_chua',
      b.horizontalScrollText || 'ĐỨC LƯU QUANG'
    )
    .run()
  await audit(c, 'altar.create', 'altar', id, { name: b.name, theme })
  return c.json({ id })
})

ritualRoutes.patch('/altars/:id', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const denied = await guardClanWrite(c, await clanOfAltar(c, id))
  if (denied) return denied
  const b = await c.req.json().catch(() => ({} as any))
  const sets: string[] = []
  const vals: any[] = []
  if (b.name) { sets.push('name = ?'); vals.push(b.name) }
  if (b.religionTheme && RELIGION_THEMES.some((t) => t.id === b.religionTheme)) {
    sets.push('religion_theme = ?'); vals.push(b.religionTheme)
  }
  if (b.ambientSound) { sets.push('ambient_sound = ?'); vals.push(b.ambientSound) }
  if (b.horizontalScrollText !== undefined) {
    sets.push('horizontal_scroll_text = ?'); vals.push(b.horizontalScrollText)
  }
  if (Array.isArray(b.subjectPersonIds)) {
    sets.push('subject_person_ids = ?'); vals.push(JSON.stringify(b.subjectPersonIds))
  }
  if (!sets.length) return c.json(problem(400, 'Validation error', 'Không có gì để cập nhật.'), 400)
  sets.push(`updated_at = datetime('now')`)
  vals.push(id)
  await c.env.DB.prepare(`UPDATE altars SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
  await audit(c, 'altar.update', 'altar', id, b)
  return c.json({ ok: true })
})

/**
 * POST /v1/rituals/events — ghi nhận nghi lễ (thắp nhang, khấn, đặt hoa).
 * AC-F1.4: ritual log persist 100% — offline queue dùng client_event_id idempotent.
 */
ritualRoutes.post('/ritual-events', async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  // Chống spam/gây nhiễu xuyên clan: chế độ nghiêm ngặt yêu cầu đăng nhập
  // và là thành viên dòng họ sở hữu bàn thờ/buổi lễ.
  if (!isOpenAccess(c)) {
    const clanId = b.altarId
      ? await clanOfAltar(c, b.altarId)
      : b.ritualId
        ? await clanOfRitual(c, b.ritualId)
        : null
    const denied = await guardClanWrite(c, clanId)
    if (denied) return denied
  }
  const type = ['INCENSE', 'FLOWER', 'OFFERING', 'PRAYER', 'CANDLE', 'JOIN', 'LEAVE'].includes(b.type)
    ? b.type
    : 'INCENSE'
  const clientId = b.clientEventId || uuid()
  const existing = await c.env.DB.prepare(`SELECT id FROM ritual_events WHERE client_event_id = ?`)
    .bind(clientId)
    .first<any>()
  if (existing) return c.json({ id: existing.id, deduped: true })
  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO ritual_events (id, altar_id, ritual_id, user_id, actor_name, type, payload, client_event_id)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
  )
    .bind(
      id, b.altarId || null, b.ritualId || null, c.var.user?.id ?? null,
      c.var.user?.full_name || b.actorName || 'Khách viếng',
      type, JSON.stringify(b.payload || {}), clientId
    )
    .run()
  if (type === 'PRAYER' && b.payload?.text && b.altarId) {
    await audit(c, 'ritual.prayer', 'altar', b.altarId, { length: String(b.payload.text).length })
  }
  return c.json({ id, type, at: new Date().toISOString() })
})

/**
 * GET /v1/ritual-events/stream?altarId=..&since=..
 * Poll-based sync thay Redis pub/sub — dùng cho hiệu ứng nhang đồng bộ nhiều người
 * (4.1.6: animation không đè lên nhau).
 */
ritualRoutes.get('/ritual-events/stream', async (c) => {
  const altarId = c.req.query('altarId')
  const ritualId = c.req.query('ritualId')
  if (!isOpenAccess(c)) {
    const clanId = altarId
      ? await clanOfAltar(c, altarId)
      : ritualId
        ? await clanOfRitual(c, ritualId)
        : null
    const denied = await guardClanView(c, clanId)
    if (denied) return denied
  }
  const since = c.req.query('since') || '1970-01-01 00:00:00'
  const rows = await c.env.DB.prepare(
    `SELECT re.*, u.full_name AS user_name FROM ritual_events re
       LEFT JOIN users u ON u.id = re.user_id
      WHERE ((?1 IS NOT NULL AND re.altar_id = ?1) OR (?2 IS NOT NULL AND re.ritual_id = ?2))
        AND re.created_at > ?3
      ORDER BY re.created_at LIMIT 100`
  )
    .bind(altarId || null, ritualId || null, since)
    .all<any>()
  const events = (rows.results || []).map((r) => ({
    id: r.id,
    type: r.type,
    actor: r.user_name || r.actor_name,
    payload: json<any>(r.payload, {}),
    at: r.created_at
  }))
  return c.json({
    events,
    cursor: events.length ? events[events.length - 1].at : since,
    serverTime: new Date().toISOString()
  })
})

// ==================== F6 — RITUAL SYNC ==============================

ritualRoutes.get('/rituals', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT r.*, p.full_name AS subject_name, a.name AS altar_name,
            (SELECT COUNT(*) FROM ritual_participants rp WHERE rp.ritual_id = r.id AND rp.rsvp='YES') AS yes_count,
            (SELECT COUNT(*) FROM ritual_participants rp WHERE rp.ritual_id = r.id AND rp.joined_at IS NOT NULL) AS joined_count
       FROM rituals r
       LEFT JOIN persons p ON p.id = r.subject_person_id
       LEFT JOIN altars a ON a.id = r.altar_id
      ORDER BY r.scheduled_at`
  ).all<any>()
  const visible = await visibleClanIds(c)
  const rowsFinal = visible ? rows.results.filter((r) => visible.has(r.clan_id)) : rows.results
  const now = Date.now()
  const rituals = (rowsFinal || []).map((r) => {
    const t = new Date(r.scheduled_at).getTime()
    const diffMs = t - now
    return {
      ...r,
      countdown: {
        ms: diffMs,
        days: Math.floor(diffMs / 86400000),
        hours: Math.floor((diffMs % 86400000) / 3600000),
        minutes: Math.floor((diffMs % 3600000) / 60000),
        isPast: diffMs < 0
      },
      // T-7 / T-1 / T-1h notification stage (4.6.1)
      notifyStage:
        diffMs < 0 ? 'STARTED'
          : diffMs < 3600_000 ? 'T_MINUS_1H'
          : diffMs < 86400_000 ? 'T_MINUS_1D'
          : diffMs < 7 * 86400_000 ? 'T_MINUS_7D'
          : 'FUTURE'
    }
  })
  return c.json({ rituals, lunarHolidays: majorLunarHolidays(new Date().getFullYear()) })
})

ritualRoutes.post('/rituals', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.title) return c.json(problem(400, 'Validation error', 'Cần tiêu đề buổi lễ.'), 400)
  const clanId = b.clan_id || c.var.user!.clan_id || null
  if (!clanId) {
    return c.json(problem(400, 'Validation error', 'Cần clan_id (dòng họ của buổi lễ).'), 400)
  }
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  let scheduledAt = b.scheduledAt
  let lunarDay = b.lunarDay ?? null
  let lunarMonth = b.lunarMonth ?? null
  // Cho phép đặt lễ theo ngày ÂM lịch → tự quy đổi sang dương
  if (!scheduledAt && lunarDay && lunarMonth) {
    const n = nextAnniversary(lunarDay, lunarMonth)
    scheduledAt = `${n.solarDate}T${b.timeOfDay || '10:00'}:00+07:00`
  }
  if (!scheduledAt) {
    return c.json(problem(400, 'Validation error', 'Cần scheduledAt hoặc (lunarDay + lunarMonth).'), 400)
  }
  if (!lunarDay) {
    const d = new Date(scheduledAt)
    const l = solarToLunar(d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear())
    lunarDay = l.day
    lunarMonth = l.month
  }
  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO rituals (id, clan_id, altar_id, title, subject_person_id, ritual_type,
       scheduled_at, lunar_day, lunar_month, gia_huan_text, created_by)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)`
  )
    .bind(
      id, b.clan_id || c.var.user!.clan_id || null, b.altarId || null, b.title,
      b.subjectPersonId || null, b.ritualType || 'GIO',
      new Date(scheduledAt).toISOString(), lunarDay, lunarMonth,
      b.giaHuanText || null, c.var.user!.id
    )
    .run()
  if (Array.isArray(b.participants)) {
    for (const uid of b.participants) {
      await c.env.DB.prepare(
        `INSERT OR IGNORE INTO ritual_participants (ritual_id, user_id, rsvp) VALUES (?,?,'MAYBE')`
      )
        .bind(id, uid)
        .run()
    }
  }
  await audit(c, 'ritual.create', 'ritual', id, { title: b.title, scheduledAt })
  return c.json({ id, scheduledAt, lunarDay, lunarMonth })
})

ritualRoutes.get('/rituals/:id', async (c) => {
  const id = paramOf(c, 'id')
  const r = await c.env.DB.prepare(
    `SELECT r.*, p.full_name AS subject_name, p.photo_url AS subject_photo,
            a.name AS altar_name, a.religion_theme, a.horizontal_scroll_text
       FROM rituals r
       LEFT JOIN persons p ON p.id = r.subject_person_id
       LEFT JOIN altars a ON a.id = r.altar_id
      WHERE r.id = ?`
  )
    .bind(id)
    .first<any>()
  if (!r) return c.json(problem(404, 'Not found', 'Không tìm thấy buổi lễ.'), 404)
  const denied = await guardClanView(c, r.clan_id)
  if (denied) return denied
  const [parts, log] = await Promise.all([
    c.env.DB.prepare(
      `SELECT rp.*, u.full_name, u.avatar_url FROM ritual_participants rp
         JOIN users u ON u.id = rp.user_id WHERE rp.ritual_id = ?`
    )
      .bind(id)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT re.*, u.full_name AS user_name FROM ritual_events re
         LEFT JOIN users u ON u.id = re.user_id
        WHERE re.ritual_id = ? ORDER BY re.created_at DESC LIMIT 60`
    )
      .bind(id)
      .all<any>()
  ])
  const diffMs = new Date(r.scheduled_at).getTime() - Date.now()
  return c.json({
    ritual: r,
    participants: parts.results,
    events: (log.results || []).map((x) => ({ ...x, payload: json<any>(x.payload, {}) })),
    countdown: { ms: diffMs, isPast: diffMs < 0 },
    // 4.6.2 fallback low-bandwidth
    transport: {
      mode: 'poll-sync',
      note:
        'Bản MVP dùng đồng bộ qua polling (500ms). Kiến trúc đầy đủ theo spec dùng mediasoup SFU multi-region + Redis pub/sub.',
      audioOnlyFallback: true
    }
  })
})

ritualRoutes.post('/rituals/:id/rsvp', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const denied = await guardClanWrite(c, await clanOfRitual(c, id))
  if (denied) return denied
  const b = await c.req.json().catch(() => ({} as any))
  const rsvp = ['YES', 'NO', 'MAYBE'].includes(b.rsvp) ? b.rsvp : 'YES'
  await c.env.DB.prepare(
    `INSERT INTO ritual_participants (ritual_id, user_id, rsvp) VALUES (?1,?2,?3)
     ON CONFLICT(ritual_id, user_id) DO UPDATE SET rsvp = ?3`
  )
    .bind(id, c.var.user!.id, rsvp)
    .run()
  return c.json({ ok: true, rsvp })
})

ritualRoutes.post('/rituals/:id/join', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const denied = await guardClanWrite(c, await clanOfRitual(c, id))
  if (denied) return denied
  await c.env.DB.prepare(
    `INSERT INTO ritual_participants (ritual_id, user_id, rsvp, joined_at)
     VALUES (?1,?2,'YES',datetime('now'))
     ON CONFLICT(ritual_id, user_id) DO UPDATE SET joined_at = datetime('now'), rsvp='YES'`
  )
    .bind(id, c.var.user!.id)
    .run()
  await c.env.DB.prepare(`UPDATE rituals SET status='LIVE' WHERE id=? AND status='SCHEDULED'`)
    .bind(id)
    .run()
  await c.env.DB.prepare(
    `INSERT INTO ritual_events (id, ritual_id, user_id, actor_name, type, client_event_id)
     VALUES (?1,?2,?3,?4,'JOIN',?5)`
  )
    .bind(uuid(), id, c.var.user!.id, c.var.user!.full_name, uuid())
    .run()
  await audit(c, 'ritual.join', 'ritual', id)
  return c.json({ ok: true })
})

ritualRoutes.post('/rituals/:id/complete', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const denied = await guardClanWrite(c, await clanOfRitual(c, id))
  if (denied) return denied
  await c.env.DB.prepare(`UPDATE rituals SET status='COMPLETED' WHERE id=?`).bind(id).run()
  const summary = await c.env.DB.prepare(
    `SELECT type, COUNT(*) AS n FROM ritual_events WHERE ritual_id=? GROUP BY type`
  )
    .bind(id)
    .all<any>()
  await audit(c, 'ritual.complete', 'ritual', id)
  return c.json({ ok: true, summary: summary.results })
})

/** Lịch âm: ngày hôm nay + lễ tiết + giỗ trong họ (Ritual Center) */
ritualRoutes.get('/lunar/calendar', async (c) => {
  const clanId = await resolveClanId(c)
  if (!clanId) return c.json(problem(403, 'Forbidden', 'Không có dòng họ nào được phép truy cập.'), 403)
  const today = new Date(Date.now() + 7 * 3600 * 1000)
  const lunarToday = solarToLunar(today.getUTCDate(), today.getUTCMonth() + 1, today.getUTCFullYear())
  const deceased = await c.env.DB.prepare(
    `SELECT id, full_name, photo_url, death_anniv_lunar_day AS d, death_anniv_lunar_month AS m, death_date
       FROM persons WHERE (?1 IS NULL OR clan_id = ?1) AND is_alive = 0
         AND death_anniv_lunar_day IS NOT NULL`
  )
    .bind(clanId)
    .all<any>()
  const anniversaries = (deceased.results || [])
    .map((p) => ({
      personId: p.id,
      name: p.full_name,
      photoUrl: p.photo_url,
      lunarLabel: `${p.d}/${p.m} âm lịch`,
      ...nextAnniversary(p.d, p.m)
    }))
    .filter((x) => x.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
  return c.json({
    lunarToday: { ...lunarToday, label: formatLunar(lunarToday) },
    holidays: majorLunarHolidays(today.getUTCFullYear()),
    anniversaries
  })
})

/** Tiện ích quy đổi âm ↔ dương */
ritualRoutes.get('/lunar/convert', (c) => {
  const mode = c.req.query('mode') || 's2l'
  const d = parseInt(c.req.query('d') || '0', 10)
  const m = parseInt(c.req.query('m') || '0', 10)
  const y = parseInt(c.req.query('y') || '0', 10)
  if (!d || !m || !y) return c.json(problem(400, 'Validation error', 'Cần d, m, y.'), 400)
  if (mode === 'l2s') {
    const [sd, sm, sy] = lunarToSolar(d, m, y, parseInt(c.req.query('leap') || '0', 10))
    return c.json({ solar: { d: sd, m: sm, y: sy } })
  }
  const l = solarToLunar(d, m, y)
  return c.json({ lunar: l, label: formatLunar(l) })
})

/**
 * 4.1.4 Photo restoration pipeline — spec dùng GFPGAN/CodeFormer/DeOldify/Real-ESRGAN
 * trên GPU worker. Cloudflare Workers không chạy được; endpoint trả kế hoạch job
 * và cảnh báo khi ảnh quá mờ (4.1.6: không tự tô màu để tránh bịa nét mặt).
 */
ritualRoutes.post('/media/:mediaId/restore-photo', requireAuth, async (c) => {
  const mediaId = paramOf(c, 'mediaId')
  const b = await c.req.json().catch(() => ({} as any))
  await audit(c, 'photo.restore.request', 'media', mediaId, b)
  return c.json({
    jobId: uuid(),
    status: 'QUEUED_EXTERNAL',
    pipeline: [
      { step: 1, name: 'face detection & alignment', model: 'MediaPipe' },
      { step: 2, name: 'face restoration', model: 'GFPGAN / CodeFormer' },
      { step: 3, name: 'colorization', model: 'DeOldify' },
      { step: 4, name: 'upscale 4x', model: 'Real-ESRGAN' }
    ],
    outputs: ['original', 'restored_bw', 'restored_color'],
    guardrail:
      'Nếu ảnh quá mờ, hệ thống chỉ cảnh báo và KHÔNG tự tô màu để tránh bịa nét mặt tổ tiên (4.1.6).',
    note:
      'Pipeline này cần GPU worker ngoài Cloudflare Workers (spec 5.2 Layer 3). Endpoint hiện ghi nhận yêu cầu và trả kế hoạch job.'
  })
})
