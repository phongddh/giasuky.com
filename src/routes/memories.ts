/**
 * Memory Service (spec 7.1 #3) — /v1/memories, /v1/events, /v1/advices, /v1/search
 * Gồm F4 Cross-Referential Memory Graph (Rashomon) + contradiction detection (4.4.2)
 * và F5 Gia Đạo Scroll pipeline (4.5).
 */
import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'
import { audit, requireAuth } from '../lib/auth'
import { json, paramOf, problem, removeTone, uuid } from '../lib/util'
import { embed, llmChat, llmAvailable } from '../lib/ai'
import { ADVICE_CATEGORIES } from '../lib/types'
import {
  clanOfAdvice, clanOfContradiction, clanOfEvent, clanOfMemory, clanOfPerson,
  guardClanView, guardClanWrite, resolveClanId, visibleClanIds
} from '../lib/access'

export const memoryRoutes = new Hono<AppEnv>()

async function indexMemory(env: any, id: string, clanId: string | null, personId: string | null, content: string) {
  const v = await embed(env, content)
  await env.DB.prepare(
    `INSERT INTO memory_embeddings (memory_id, clan_id, person_id, modality, dim, vector)
     VALUES (?1,?2,?3,'text',?4,?5)
     ON CONFLICT(memory_id) DO UPDATE SET vector = ?5, dim = ?4`
  )
    .bind(id, clanId, personId, v.length, JSON.stringify(v))
    .run()
}

memoryRoutes.post('/memories', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.content) return c.json(problem(400, 'Validation error', 'Cần nội dung ký ức.'), 400)
  const clanId = b.clan_id || c.var.user!.clan_id || null
  if (!clanId) {
    return c.json(problem(400, 'Validation error', 'Cần clan_id (dòng họ của ký ức).'), 400)
  }
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO memories (id, clan_id, type, content, content_no_tone, media_url, language,
       perspective, told_by_person_id, subject_person_id, event_id, location, event_date,
       source, status, visibility, created_by)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17)`
  )
    .bind(
      id, clanId, b.type || 'TEXT', b.content, removeTone(b.content),
      b.media_url || null, b.language || 'vi', b.perspective || null,
      b.told_by_person_id || null, b.subject_person_id || null, b.event_id || null,
      b.location || null, b.event_date || null, b.source || 'MANUAL',
      b.status || 'APPROVED', b.visibility || 'CLAN', c.var.user!.id
    )
    .run()

  if (Array.isArray(b.involves_person_ids)) {
    for (const pid of b.involves_person_ids) {
      await c.env.DB.prepare(
        `INSERT OR IGNORE INTO memory_persons (memory_id, person_id) VALUES (?,?)`
      )
        .bind(id, pid)
        .run()
    }
  }
  await indexMemory(c.env, id, clanId, b.subject_person_id || null, b.content)
  await audit(c, 'memory.create', 'memory', id, { event_id: b.event_id })
  return c.json({ id })
})

memoryRoutes.get('/memories/:id', async (c) => {
  const id = paramOf(c, 'id')
  const m = await c.env.DB.prepare(
    `SELECT m.*, ps.full_name AS subject_name, pt.full_name AS teller_name, e.title AS event_title
       FROM memories m
       LEFT JOIN persons ps ON ps.id = m.subject_person_id
       LEFT JOIN persons pt ON pt.id = m.told_by_person_id
       LEFT JOIN events e ON e.id = m.event_id
      WHERE m.id = ?`
  )
    .bind(id)
    .first<any>()
  if (!m) return c.json(problem(404, 'Not found', 'Không tìm thấy ký ức.'), 404)
  const denied = await guardClanView(c, m.clan_id)
  if (denied) return denied
  return c.json({ memory: m })
})

memoryRoutes.delete('/memories/:id', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const clanId = await clanOfMemory(c, id)
  if (!clanId) return c.json(problem(404, 'Not found', 'Không tìm thấy ký ức.'), 404)
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  // Cascade: bảng con + dữ liệu trỏ ngược, trong 1 batch
  const stmts: D1PreparedStatement[] = [
    c.env.DB.prepare(`DELETE FROM memory_persons WHERE memory_id = ?`).bind(id),
    c.env.DB.prepare(`DELETE FROM memory_embeddings WHERE memory_id = ?`).bind(id),
    c.env.DB.prepare(`DELETE FROM contradictions WHERE memory_a_id = ? OR memory_b_id = ?`).bind(id, id),
    c.env.DB.prepare(`DELETE FROM advices WHERE source_memory_id = ?`).bind(id),
    c.env.DB.prepare(
      `UPDATE persona_messages SET citations = '[]' WHERE instr(citations, ?) > 0`
    ).bind(JSON.stringify(id)),
    c.env.DB.prepare(`DELETE FROM memories WHERE id = ?`).bind(id)
  ]
  await c.env.DB.batch(stmts)
  await audit(c, 'memory.delete', 'memory', id, { cascade: true })
  return c.json({ ok: true })
})

memoryRoutes.get('/persons/:id/memories', async (c) => {
  const pid = paramOf(c, 'id')
  const denied = await guardClanView(c, await clanOfPerson(c, pid))
  if (denied) return denied
  const type = c.req.query('type')
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
  const rows = await c.env.DB.prepare(
    `SELECT m.*, pt.full_name AS teller_name, e.title AS event_title
       FROM memories m
       LEFT JOIN persons pt ON pt.id = m.told_by_person_id
       LEFT JOIN events e ON e.id = m.event_id
      WHERE (m.subject_person_id = ?1 OR m.told_by_person_id = ?1
             OR EXISTS (SELECT 1 FROM memory_persons mp WHERE mp.memory_id = m.id AND mp.person_id = ?1))
        AND m.status = 'APPROVED'
        AND (?2 IS NULL OR m.type = ?2)
      ORDER BY COALESCE(m.event_date, m.created_at) DESC LIMIT ?3`
  )
    .bind(pid, type || null, limit)
    .all()
  return c.json({ memories: rows.results })
})

// ------------------------ F4: Events & Rashomon view ------------------
memoryRoutes.get('/events', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT e.*,
            (SELECT COUNT(*) FROM memories m WHERE m.event_id = e.id AND m.status='APPROVED') AS memory_count,
            (SELECT COUNT(*) FROM contradictions ct WHERE ct.event_id = e.id AND ct.status='OPEN') AS contradiction_count
       FROM events e
      ORDER BY e.event_date DESC`
  ).all<any>()
  const visible = await visibleClanIds(c)
  return c.json({ events: visible ? rows.results.filter((e) => visible.has(e.clan_id)) : rows.results })
})

memoryRoutes.post('/events', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.title) return c.json(problem(400, 'Validation error', 'Cần tiêu đề sự kiện.'), 400)
  const clanId = b.clan_id || c.var.user!.clan_id || null
  if (!clanId) {
    return c.json(problem(400, 'Validation error', 'Cần clan_id (dòng họ của sự kiện).'), 400)
  }
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO events (id, clan_id, title, event_date, event_type, location, significance, cover_photo_url)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
  )
    .bind(
      id, b.clan_id || c.var.user!.clan_id || null, b.title, b.event_date || null,
      b.event_type || 'OTHER', b.location || null, b.significance || 'FAMILY',
      b.cover_photo_url || null
    )
    .run()
  if (Array.isArray(b.person_ids)) {
    for (const pid of b.person_ids) {
      await c.env.DB.prepare(`INSERT OR IGNORE INTO event_persons (event_id, person_id) VALUES (?,?)`)
        .bind(id, pid)
        .run()
    }
  }
  await audit(c, 'event.create', 'event', id, { title: b.title })
  return c.json({ id })
})

/** Rashomon mode: 1 event → nhiều lời kể song song + mâu thuẫn (4.4.3 / 8.4.3) */
memoryRoutes.get('/events/:id/rashomon', async (c) => {
  const id = paramOf(c, 'id')
  const event = await c.env.DB.prepare(`SELECT * FROM events WHERE id = ?`).bind(id).first<any>()
  if (!event) return c.json(problem(404, 'Not found', 'Không tìm thấy sự kiện.'), 404)
  const denied = await guardClanView(c, event.clan_id)
  if (denied) return denied
  const [mems, contradictions, involved] = await Promise.all([
    c.env.DB.prepare(
      `SELECT m.*, pt.full_name AS teller_name, pt.photo_url AS teller_photo, pt.id AS teller_id
         FROM memories m LEFT JOIN persons pt ON pt.id = m.told_by_person_id
        WHERE m.event_id = ? AND m.status='APPROVED'
        ORDER BY m.created_at`
    )
      .bind(id)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT * FROM contradictions WHERE event_id = ? ORDER BY severity DESC, detected_at DESC`
    )
      .bind(id)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT p.id, p.full_name, p.photo_url, p.is_alive FROM event_persons ep
         JOIN persons p ON p.id = ep.person_id WHERE ep.event_id = ?`
    )
      .bind(id)
      .all<any>()
  ])
  return c.json({
    event,
    perspectives: mems.results,
    contradictions: contradictions.results,
    involvedPersons: involved.results
  })
})

/**
 * 4.4.2 Contradiction Detection — LLM extract facts từ từng cặp memory.
 * KHÔNG tự resolve: chỉ flag để con cháu hỏi thêm (4.4.3).
 */
memoryRoutes.post('/events/:id/detect-contradictions', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const denied = await guardClanWrite(c, await clanOfEvent(c, id))
  if (denied) return denied
  const mems = await c.env.DB.prepare(
    `SELECT m.id, m.content, p.full_name AS teller FROM memories m
       LEFT JOIN persons p ON p.id = m.told_by_person_id
      WHERE m.event_id = ? AND m.status='APPROVED' ORDER BY m.created_at`
  )
    .bind(id)
    .all<any>()
  const items = mems.results || []
  if (items.length < 2) {
    return c.json({ detected: 0, message: 'Cần ít nhất 2 lời kể để so sánh.' })
  }
  if (!llmAvailable(c.env)) {
    return c.json(
      problem(503, 'AI unavailable', 'Chưa cấu hình LLM API key nên không thể chạy contradiction detector.'),
      503
    )
  }

  const prompt = `Bạn là bộ phát hiện mâu thuẫn trong lời kể gia phả. Dưới đây là các lời kể về CÙNG một sự kiện, từ những người khác nhau.

Nhiệm vụ: tìm các điểm KHÔNG KHỚP về dữ kiện khách quan (thời tiết, ngày tháng, địa điểm, số lượng người, thứ tự việc xảy ra, tên gọi).
KHÔNG phán xét bên nào đúng. KHÔNG suy diễn thêm. Nếu không có mâu thuẫn rõ ràng, trả về mảng rỗng.

Trả về JSON THUẦN (không markdown) dạng:
{"contradictions":[{"memoryAId":"...","memoryBId":"...","aspect":"thời tiết","claimA":"trời mưa","claimB":"trời nắng","severity":"LOW|MEDIUM|HIGH"}]}

CÁC LỜI KỂ:
${items.map((m) => `[id=${m.id} | người kể: ${m.teller || 'không rõ'}]\n${m.content}`).join('\n\n')}`

  const out = await llmChat(c.env, [{ role: 'user', content: prompt }], { maxTokens: 1200 })
  if (!out) return c.json(problem(502, 'AI error', 'Không nhận được phản hồi từ LLM.'), 502)

  let parsed: any = { contradictions: [] }
  try {
    const m = out.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(m ? m[0] : out)
  } catch {
    return c.json(problem(502, 'AI error', 'Phản hồi LLM không đúng định dạng JSON.'), 502)
  }

  const valid = new Set(items.map((x) => x.id))
  let n = 0
  for (const ct of parsed.contradictions || []) {
    if (!valid.has(ct.memoryAId) || !valid.has(ct.memoryBId)) continue
    const dup = await c.env.DB.prepare(
      `SELECT id FROM contradictions WHERE event_id=?1 AND memory_a_id=?2 AND memory_b_id=?3 AND aspect=?4`
    )
      .bind(id, ct.memoryAId, ct.memoryBId, ct.aspect || '')
      .first()
    if (dup) continue
    await c.env.DB.prepare(
      `INSERT INTO contradictions (id, event_id, memory_a_id, memory_b_id, aspect, claim_a, claim_b, severity)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
    )
      .bind(
        uuid(), id, ct.memoryAId, ct.memoryBId, ct.aspect || null,
        ct.claimA || null, ct.claimB || null,
        ['LOW', 'MEDIUM', 'HIGH'].includes(ct.severity) ? ct.severity : 'LOW'
      )
      .run()
    n++
  }
  await audit(c, 'memory.contradiction.detect', 'event', id, { detected: n })
  return c.json({ detected: n })
})

/** Ghi chú làm rõ mâu thuẫn — do người thật xác nhận, không phải AI */
memoryRoutes.post('/contradictions/:id/resolve', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const denied = await guardClanWrite(c, await clanOfContradiction(c, id))
  if (denied) return denied
  const b = await c.req.json().catch(() => ({} as any))
  const status = ['CLARIFIED', 'DISMISSED'].includes(b.status) ? b.status : 'CLARIFIED'
  await c.env.DB.prepare(
    `UPDATE contradictions SET status = ?1, resolution_note = ?2 WHERE id = ?3`
  )
    .bind(status, b.note || null, id)
    .run()
  await audit(c, 'memory.contradiction.resolve', 'contradiction', id, { status })
  return c.json({ ok: true })
})

memoryRoutes.get('/contradictions', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT ct.*, e.title AS event_title, e.clan_id AS clan_id,
            ma.content AS memory_a_content, mb.content AS memory_b_content,
            pa.full_name AS teller_a, pb.full_name AS teller_b
       FROM contradictions ct
       LEFT JOIN events e ON e.id = ct.event_id
       LEFT JOIN memories ma ON ma.id = ct.memory_a_id
       LEFT JOIN memories mb ON mb.id = ct.memory_b_id
       LEFT JOIN persons pa ON pa.id = ma.told_by_person_id
       LEFT JOIN persons pb ON pb.id = mb.told_by_person_id
      ORDER BY ct.status, ct.detected_at DESC LIMIT 100`
  ).all<any>()
  const visible = await visibleClanIds(c)
  const contradictions = visible
    ? rows.results.filter((ct) => visible.has(ct.clan_id ?? null))
    : rows.results
  return c.json({ contradictions })
})

// ------------------------ 6.4 Search (Elasticsearch thay bằng LIKE + no-tone)
memoryRoutes.get('/search', async (c) => {
  const q = (c.req.query('q') || '').trim()
  if (!q) return c.json({ results: [], query: '' })
  const clanId = await resolveClanId(c)
  if (!clanId) return c.json(problem(403, 'Forbidden', 'Không có dòng họ nào được phép truy cập.'), 403)
  const noTone = removeTone(q)
  const like = `%${q.toLowerCase()}%`
  const likeNoTone = `%${noTone}%`
  const [mems, persons, advices, events] = await Promise.all([
    c.env.DB.prepare(
      `SELECT m.id, m.content, m.type, m.event_date, m.perspective, ps.full_name AS subject_name
         FROM memories m LEFT JOIN persons ps ON ps.id = m.subject_person_id
        WHERE m.status='APPROVED' AND m.clan_id = ?1
          AND (LOWER(m.content) LIKE ?2 OR m.content_no_tone LIKE ?3)
        LIMIT 25`
    )
      .bind(clanId, like, likeNoTone)
      .all(),
    // 6.4: tìm không dấu. SQLite (D1) không cho đăng ký hàm bỏ dấu và LOWER()
    // cũng không hạ được chữ có dấu tiếng Việt, nên với các bảng nhỏ (persons /
    // advices / events) ta lọc bằng removeTone() ngay trong Worker.
    c.env.DB.prepare(
      `SELECT id, full_name, aliases, birth_place, birth_date, death_date, is_alive, photo_url
         FROM persons WHERE clan_id = ? LIMIT 500`
    ).bind(clanId).all(),
    c.env.DB.prepare(
      `SELECT a.id, a.original_text, a.category, p.full_name AS spoken_by
         FROM advices a LEFT JOIN persons p ON p.id = a.spoken_by_person_id
        WHERE a.clan_id = ? LIMIT 500`
    ).bind(clanId).all(),
    c.env.DB.prepare(
      `SELECT id, title, event_date, event_type, location FROM events WHERE clan_id = ? LIMIT 500`
    ).bind(clanId).all()
  ])

  const hit = (...fields: any[]) =>
    fields.some((f) => f && removeTone(String(f)).includes(noTone))

  return c.json({
    query: q,
    queryNoTone: noTone,
    memories: mems.results,
    persons: (persons.results as any[])
      .filter((p) => hit(p.full_name, p.aliases, p.birth_place))
      .slice(0, 15),
    advices: (advices.results as any[])
      .filter((a) => hit(a.original_text, a.spoken_by))
      .slice(0, 15),
    events: (events.results as any[])
      .filter((e) => hit(e.title, e.location))
      .slice(0, 15)
  })
})

// ------------------------ F5 Gia Đạo Scroll ---------------------------
memoryRoutes.get('/advices', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT a.*, p.full_name AS spoken_by_name, p.photo_url AS spoken_by_photo,
            p.is_alive, m.content AS source_content, m.media_url AS source_audio
       FROM advices a
       LEFT JOIN persons p ON p.id = a.spoken_by_person_id
       LEFT JOIN memories m ON m.id = a.source_memory_id
      ORDER BY a.category, a.created_at`
  ).all<any>()
  const visible = await visibleClanIds(c)
  const filtered = visible ? rows.results.filter((r) => visible.has(r.clan_id)) : rows.results
  const byCat: Record<string, any[]> = {}
  for (const cat of ADVICE_CATEGORIES) byCat[cat.id] = []
  for (const r of filtered) {
    ;(byCat[r.category] ||= []).push(r)
  }
  return c.json({
    categories: ADVICE_CATEGORIES.map((c2) => ({
      ...c2,
      items: byCat[c2.id] || []
    })),
    total: filtered.length
  })
})

/**
 * 4.5.1 Pipeline: lọc memory → LLM cluster theo chủ đề → TRÍCH NGUYÊN VĂN.
 * 4.5.3 Anti-hallucination: KHÔNG sáng tác; mỗi advice bắt buộc link source_memory_id.
 */
memoryRoutes.post('/advices/extract', requireAuth, async (c) => {
  const clanId = c.var.user!.clan_id
  if (!clanId) return c.json(problem(403, 'Forbidden', 'Bạn chưa thuộc dòng họ nào.'), 403)
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  if (!llmAvailable(c.env)) {
    return c.json(problem(503, 'AI unavailable', 'Chưa cấu hình LLM API key.'), 503)
  }
  const mems = await c.env.DB.prepare(
    `SELECT m.id, m.content, p.full_name AS speaker, p.id AS speaker_id
       FROM memories m LEFT JOIN persons p ON p.id = COALESCE(m.told_by_person_id, m.subject_person_id)
      WHERE m.clan_id = ?1 AND m.status='APPROVED'
        AND NOT EXISTS (SELECT 1 FROM advices a WHERE a.source_memory_id = m.id)
      LIMIT 40`
  )
    .bind(clanId)
    .all<any>()
  const items = mems.results || []
  if (!items.length) return c.json({ extracted: 0, message: 'Không còn ký ức mới để trích.' })

  const prompt = `Bạn là người biên soạn "Gia Đạo Scroll" — cuộn gia huấn của một dòng họ Việt Nam.

NHIỆM VỤ: từ các ký ức dưới đây, TRÍCH RA những câu là lời răn dạy / lời khuyên / bài học sống / ca dao tục ngữ mà người trong họ đã nói.

QUY TẮC TUYỆT ĐỐI:
1. Chỉ được TRÍCH NGUYÊN VĂN từ nội dung ký ức. KHÔNG viết lại, KHÔNG paraphrase, KHÔNG sáng tác thêm.
2. Nếu một ký ức không chứa lời răn dạy nào, bỏ qua nó.
3. Mỗi trích dẫn phải kèm đúng id của ký ức gốc.
4. Phân loại vào 1 trong 5 nhóm: FILIAL_PIETY (đạo hiếu), EDUCATION (học hành), MARRIAGE (hôn nhân), BUSINESS (làm ăn), ETHICS (đối nhân xử thế).

Trả về JSON THUẦN: {"advices":[{"sourceMemoryId":"...","originalText":"câu trích nguyên văn","category":"ETHICS"}]}

CÁC KÝ ỨC:
${items.map((m) => `[id=${m.id} | người nói: ${m.speaker || 'không rõ'}]\n${m.content}`).join('\n\n')}`

  const out = await llmChat(c.env, [{ role: 'user', content: prompt }], { maxTokens: 2000 })
  if (!out) return c.json(problem(502, 'AI error', 'LLM không phản hồi.'), 502)
  let parsed: any = { advices: [] }
  try {
    const m = out.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(m ? m[0] : out)
  } catch {
    return c.json(problem(502, 'AI error', 'Phản hồi không đúng JSON.'), 502)
  }

  const byId = new Map(items.map((x) => [x.id, x]))
  const validCats = ADVICE_CATEGORIES.map((x) => x.id) as string[]
  let n = 0
  const rejected: string[] = []
  for (const a of parsed.advices || []) {
    const src = byId.get(a.sourceMemoryId)
    if (!src || !a.originalText) continue
    // Anti-hallucination cứng: câu trích PHẢI tồn tại trong memory gốc
    const normSrc = removeTone(src.content).replace(/\s+/g, ' ')
    const normQ = removeTone(a.originalText).replace(/\s+/g, ' ').replace(/^["'“”]|["'“”]$/g, '')
    if (!normSrc.includes(normQ.slice(0, Math.min(40, normQ.length)))) {
      rejected.push(a.originalText.slice(0, 60))
      continue
    }
    await c.env.DB.prepare(
      `INSERT INTO advices (id, clan_id, original_text, category, source_memory_id, spoken_by_person_id)
       VALUES (?1,?2,?3,?4,?5,?6)`
    )
      .bind(
        uuid(), clanId, a.originalText.replace(/^["'“”]|["'“”]$/g, ''),
        validCats.includes(a.category) ? a.category : 'ETHICS',
        a.sourceMemoryId, src.speaker_id || null
      )
      .run()
    n++
  }
  await audit(c, 'advice.extract', 'clan', clanId, { extracted: n, rejected: rejected.length })
  return c.json({
    extracted: n,
    rejectedForHallucination: rejected.length,
    rejectedSamples: rejected.slice(0, 3),
    scanned: items.length
  })
})

memoryRoutes.post('/advices/:id/approve', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const denied = await guardClanWrite(c, await clanOfAdvice(c, id))
  if (denied) return denied
  await c.env.DB.prepare(
    `UPDATE advices SET approved_by_user_id = ?1, approved_at = datetime('now') WHERE id = ?2`
  )
    .bind(c.var.user!.id, id)
    .run()
  await audit(c, 'advice.approve', 'advice', id)
  return c.json({ ok: true })
})

memoryRoutes.delete('/advices/:id', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const denied = await guardClanWrite(c, await clanOfAdvice(c, id))
  if (denied) return denied
  await c.env.DB.prepare(`DELETE FROM advices WHERE id = ?`).bind(id).run()
  return c.json({ ok: true })
})

// ------------------------ Time Capsule (2.3) --------------------------
memoryRoutes.get('/time-capsules', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT t.*, pa.full_name AS author_name, pr.full_name AS recipient_name
       FROM time_capsules t
       LEFT JOIN persons pa ON pa.id = t.author_person_id
       LEFT JOIN persons pr ON pr.id = t.recipient_person_id
      ORDER BY t.created_at DESC`
  ).all<any>()
  const visible = await visibleClanIds(c)
  const capsulesRaw = visible ? rows.results.filter((t) => visible.has(t.clan_id)) : rows.results
  const now = Date.now()
  const capsules = (capsulesRaw || []).map((t) => {
    const releasable =
      t.status === 'RELEASED' ||
      (t.release_mode === 'DATE' && t.release_at && new Date(t.release_at).getTime() <= now)
    return {
      ...t,
      content: releasable ? t.content : null,
      sealed: !releasable,
      daysUntil:
        t.release_at && !releasable
          ? Math.ceil((new Date(t.release_at).getTime() - now) / 86400000)
          : 0
    }
  })
  return c.json({ capsules })
})

memoryRoutes.post('/time-capsules', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.title || !b.content) {
    return c.json(problem(400, 'Validation error', 'Cần tiêu đề và nội dung.'), 400)
  }
  const clanId = b.clan_id || c.var.user!.clan_id || null
  if (!clanId) {
    return c.json(problem(400, 'Validation error', 'Cần clan_id (dòng họ của hộp thời gian).'), 400)
  }
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO time_capsules (id, clan_id, author_person_id, recipient_person_id, recipient_note,
       title, content, release_mode, release_at, milestone, created_by)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)`
  )
    .bind(
      id, b.clan_id || c.var.user!.clan_id || null, b.author_person_id || null,
      b.recipient_person_id || null, b.recipient_note || null, b.title, b.content,
      b.release_mode || 'DATE', b.release_at || null, b.milestone || null, c.var.user!.id
    )
    .run()
  await audit(c, 'timecapsule.create', 'time_capsule', id, { title: b.title })
  return c.json({ id })
})
