/**
 * Genealogy Service (spec 7.1 #2) — /v1/clans/*, /v1/persons/*
 * Thay Neo4j bằng D1 + recursive CTE:
 *   Cypher `MATCH (root)<-[:CHILD_OF*3]-(desc)` ≡ CTE đệ quy theo depth.
 */
import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'
import { audit, requireAuth } from '../lib/auth'
import { enumProblem, json, pageParams, paginated, paramOf, problem, uuid, yearOf, ageOf } from '../lib/util'
import { nextAnniversary, solarToLunar, formatLunar } from '../lib/lunar'
import {
  guardClanView, guardClanWrite, resolveClanId, visibleClanIds
} from '../lib/access'

export const genealogyRoutes = new Hono<AppEnv>()

genealogyRoutes.get('/clans', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT c.*, (SELECT COUNT(*) FROM persons p WHERE p.clan_id = c.id) AS person_count
       FROM clans c ORDER BY created_at`
  ).all<any>()
  const visible = await visibleClanIds(c)
  return c.json({ clans: visible ? rows.results.filter((r) => visible.has(r.id)) : rows.results })
})

genealogyRoutes.post('/clans', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.name) return c.json(problem(400, 'Validation error', 'Cần tên dòng họ.'), 400)
  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO clans (id, name, origin_place, founded_year, patriarch_user_id, member_count)
     VALUES (?1,?2,?3,?4,?5,1)`
  )
    .bind(id, b.name, b.origin_place || null, b.founded_year || null, c.var.user!.id)
    .run()
  await c.env.DB.prepare(
    `INSERT INTO clan_members (clan_id, user_id, role) VALUES (?1,?2,'patriarch')`
  )
    .bind(id, c.var.user!.id)
    .run()
  await audit(c, 'clan.create', 'clan', id, { name: b.name })
  return c.json({ id, name: b.name })
})

genealogyRoutes.get('/clans/:clanId', async (c) => {
  const id = paramOf(c, 'clanId')
  const clan = await c.env.DB.prepare(`SELECT * FROM clans WHERE id = ?`).bind(id).first<any>()
  if (!clan) return c.json(problem(404, 'Not found', 'Không tìm thấy dòng họ.'), 404)
  const denied = await guardClanView(c, id)
  if (denied) return denied
  const stats = await c.env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM persons WHERE clan_id = ?1) AS persons,
       (SELECT COUNT(*) FROM persons WHERE clan_id = ?1 AND is_alive = 1) AS living,
       (SELECT COUNT(*) FROM memories WHERE clan_id = ?1 AND status='APPROVED') AS memories,
       (SELECT COUNT(*) FROM advices WHERE clan_id = ?1) AS advices,
       (SELECT COUNT(*) FROM events WHERE clan_id = ?1) AS events,
       (SELECT COUNT(*) FROM rituals WHERE clan_id = ?1 AND status='SCHEDULED') AS rituals`
  )
    .bind(id)
    .first<any>()
  return c.json({ clan, stats })
})

/**
 * GET /v1/clans/:clanId/tree?depth=5&format=graph
 * Trả về nodes + edges cho Living Tree (F3). Ứng với Cypher Q1.
 */
genealogyRoutes.get('/clans/:clanId/tree', async (c) => {
  const clanId = paramOf(c, 'clanId')
  const denied = await guardClanView(c, clanId)
  if (denied) return denied
  const depth = Math.min(parseInt(c.req.query('depth') || '8', 10) || 8, 12)
  const rootId = c.req.query('rootId')

  if (rootId) {
    // Chống IDOR: gốc cây phải thuộc đúng clan đang xem
    const rootClan = await c.env.DB.prepare(`SELECT clan_id FROM persons WHERE id = ?`)
      .bind(rootId)
      .first<any>()
    if (!rootClan || rootClan.clan_id !== clanId) {
      return c.json(problem(403, 'Forbidden', 'Gốc cây không thuộc dòng họ này.'), 403)
    }
  }

  let persons: any[]
  if (rootId) {
    // Recursive CTE: hậu duệ tới `depth` đời (tương đương [:CHILD_OF*1..depth])
    const res = await c.env.DB.prepare(
      `WITH RECURSIVE desc_tree(id, lvl) AS (
         SELECT ?1, 0
         UNION ALL
         SELECT r.from_person_id, dt.lvl + 1
           FROM relationships r JOIN desc_tree dt ON r.to_person_id = dt.id
          WHERE r.type IN ('CHILD_OF','ADOPTED_BY') AND dt.lvl < ?2
       )
       SELECT p.*, dt.lvl AS depth_from_root FROM persons p JOIN desc_tree dt ON dt.id = p.id`
    )
      .bind(rootId, depth)
      .all<any>()
    persons = res.results || []
    // thêm vợ/chồng của các hậu duệ
    if (persons.length) {
      const ids = persons.map((p) => p.id)
      const ph = ids.map(() => '?').join(',')
      const sp = await c.env.DB.prepare(
        `SELECT DISTINCT p.* FROM persons p
           JOIN relationships r ON (r.to_person_id = p.id OR r.from_person_id = p.id)
          WHERE r.type = 'SPOUSE_OF'
            AND (r.from_person_id IN (${ph}) OR r.to_person_id IN (${ph}))`
      )
        .bind(...ids, ...ids)
        .all<any>()
      const seen = new Set(ids)
      for (const s of sp.results || []) if (!seen.has(s.id)) { persons.push(s); seen.add(s.id) }
    }
  } else {
    const res = await c.env.DB.prepare(
      `SELECT * FROM persons WHERE clan_id = ? ORDER BY generation, birth_date`
    )
      .bind(clanId)
      .all<any>()
    persons = res.results || []
  }

  const ids = persons.map((p) => p.id)
  let edges: any[] = []
  if (ids.length) {
    const ph = ids.map(() => '?').join(',')
    const er = await c.env.DB.prepare(
      `SELECT * FROM relationships
        WHERE from_person_id IN (${ph}) AND to_person_id IN (${ph})`
    )
      .bind(...ids, ...ids)
      .all<any>()
    edges = er.results || []
  }

  // đếm memory mỗi người (badge trên node)
  const memCounts: Record<string, number> = {}
  if (ids.length) {
    const ph = ids.map(() => '?').join(',')
    const mc = await c.env.DB.prepare(
      `SELECT subject_person_id AS pid, COUNT(*) AS n FROM memories
        WHERE subject_person_id IN (${ph}) AND status='APPROVED' GROUP BY subject_person_id`
    )
      .bind(...ids)
      .all<any>()
    for (const r of mc.results || []) memCounts[r.pid] = r.n
  }

  // consent active (hiện icon persona chat khả dụng)
  const consentMap: Record<string, string[]> = {}
  if (ids.length) {
    const ph = ids.map(() => '?').join(',')
    const cr = await c.env.DB.prepare(
      `SELECT subject_person_id AS pid, scope FROM consent_records
        WHERE subject_person_id IN (${ph}) AND status='active'`
    )
      .bind(...ids)
      .all<any>()
    for (const r of cr.results || []) {
      consentMap[r.pid] = [...(consentMap[r.pid] || []), ...json<string[]>(r.scope, [])]
    }
  }

  const nodes = persons.map((p) => ({
    id: p.id,
    name: p.full_name,
    aliases: json<string[]>(p.aliases, []),
    gender: p.gender,
    generation: p.generation ?? 0,
    birthYear: yearOf(p.birth_date),
    deathYear: p.death_date ? yearOf(p.death_date) : null,
    isAlive: !!p.is_alive,
    isVerified: !!p.is_verified,
    photoUrl: p.photo_url,
    birthPlace: p.birth_place,
    occupation: json<string[]>(p.occupation, []),
    memoryCount: memCounts[p.id] || 0,
    consentScopes: consentMap[p.id] || [],
    age: ageOf(p.birth_date, p.death_date)
  }))

  return c.json({
    clanId,
    nodes,
    edges: edges.map((e) => ({
      id: e.id,
      from: e.from_person_id,
      to: e.to_person_id,
      type: e.type,
      biological: !!e.biological,
      adopted: !!e.adopted,
      verified: !!e.is_verified,
      marriageOrder: e.marriage_order
    })),
    meta: { count: nodes.length, depth, generatedAt: new Date().toISOString() }
  })
})

/** POST /v1/clans/:clanId/members — thêm Person vào cây */
genealogyRoutes.post('/clans/:clanId/members', requireAuth, async (c) => {
  const clanId = paramOf(c, 'clanId')
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.full_name) return c.json(problem(400, 'Validation error', 'Cần họ tên.'), 400)
  const enumErr = enumProblem(b, 'gender', ['M', 'F', 'OTHER'])
  if (enumErr) return c.json(problem(400, 'Validation error', enumErr), 400)
  const id = uuid()
  let lunar: any = null
  if (b.death_date) {
    const d = new Date(b.death_date)
    if (!isNaN(d.getTime())) {
      lunar = solarToLunar(d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear())
    }
  }
  await c.env.DB.prepare(
    `INSERT INTO persons (id, clan_id, full_name, aliases, gender, generation, birth_date, death_date,
       birth_place, death_place, is_alive, bio, religion, occupation, photo_url,
       death_anniv_lunar_day, death_anniv_lunar_month, created_by)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18)`
  )
    .bind(
      id,
      clanId,
      b.full_name,
      JSON.stringify(b.aliases || []),
      b.gender || 'OTHER',
      b.generation ?? null,
      b.birth_date || null,
      b.death_date || null,
      b.birth_place || null,
      b.death_place || null,
      b.death_date ? 0 : 1,
      b.bio || null,
      b.religion || null,
      JSON.stringify(b.occupation || []),
      b.photo_url || null,
      lunar?.day ?? null,
      lunar?.month ?? null,
      c.var.user!.id
    )
    .run()

  // tạo quan hệ nếu có
  if (b.parent_id) {
    await c.env.DB.prepare(
      `INSERT INTO relationships (id, from_person_id, to_person_id, type, biological, adopted)
       VALUES (?1,?2,?3,?4,?5,?6)`
    )
      .bind(uuid(), id, b.parent_id, b.adopted ? 'ADOPTED_BY' : 'CHILD_OF', b.adopted ? 0 : 1, b.adopted ? 1 : 0)
      .run()
  }
  if (b.spouse_id) {
    await c.env.DB.prepare(
      `INSERT INTO relationships (id, from_person_id, to_person_id, type, married_at, marriage_order)
       VALUES (?1,?2,?3,'SPOUSE_OF',?4,?5)`
    )
      .bind(uuid(), id, b.spouse_id, b.married_at || null, b.marriage_order || 1)
      .run()
  }
  await c.env.DB.prepare(
    `UPDATE clans SET member_count = (SELECT COUNT(*) FROM persons WHERE clan_id = ?1) WHERE id = ?1`
  )
    .bind(clanId)
    .run()
  await audit(c, 'person.create', 'person', id, { name: b.full_name, clanId })
  return c.json({ id })
})

genealogyRoutes.get('/persons/:id', async (c) => {
  const id = paramOf(c, 'id')
  const p = await c.env.DB.prepare(`SELECT * FROM persons WHERE id = ?`).bind(id).first<any>()
  if (!p) return c.json(problem(404, 'Not found', 'Không tìm thấy người này.'), 404)
  const denied = await guardClanView(c, p.clan_id)
  if (denied) return denied

  const [parents, children, spouses, siblings, memCount, consents, advices] = await Promise.all([
    c.env.DB.prepare(
      `SELECT p.*, r.type, r.adopted FROM relationships r JOIN persons p ON p.id = r.to_person_id
        WHERE r.from_person_id = ? AND r.type IN ('CHILD_OF','ADOPTED_BY')`
    )
      .bind(id)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT p.*, r.type, r.adopted FROM relationships r JOIN persons p ON p.id = r.from_person_id
        WHERE r.to_person_id = ? AND r.type IN ('CHILD_OF','ADOPTED_BY') ORDER BY p.birth_date`
    )
      .bind(id)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT p.*, r.married_at, r.divorced_at, r.marriage_order FROM relationships r
         JOIN persons p ON p.id = CASE WHEN r.from_person_id = ?1 THEN r.to_person_id ELSE r.from_person_id END
        WHERE r.type='SPOUSE_OF' AND (r.from_person_id = ?1 OR r.to_person_id = ?1)`
    )
      .bind(id)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT DISTINCT p.* FROM persons p
         JOIN relationships r1 ON r1.from_person_id = p.id AND r1.type IN ('CHILD_OF','ADOPTED_BY')
         JOIN relationships r2 ON r2.to_person_id = r1.to_person_id AND r2.type IN ('CHILD_OF','ADOPTED_BY')
        WHERE r2.from_person_id = ?1 AND p.id <> ?1`
    )
      .bind(id)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT COUNT(*) AS n FROM memories WHERE subject_person_id = ? AND status='APPROVED'`
    )
      .bind(id)
      .first<any>(),
    c.env.DB.prepare(
      `SELECT id, scope, status, signature_method, signed_at, time_end, blockchain_tx_hash
         FROM consent_records WHERE subject_person_id = ? ORDER BY created_at DESC`
    )
      .bind(id)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT id, original_text, category FROM advices WHERE spoken_by_person_id = ? LIMIT 20`
    )
      .bind(id)
      .all<any>()
  ])

  const anniv =
    p.death_anniv_lunar_day && p.death_anniv_lunar_month
      ? nextAnniversary(p.death_anniv_lunar_day, p.death_anniv_lunar_month)
      : null

  const activeScopes: string[] = []
  for (const r of consents.results || []) {
    if (r.status === 'active') activeScopes.push(...json<string[]>(r.scope, []))
  }

  const brief = (r: any) => ({
    id: r.id,
    full_name: r.full_name,
    birthYear: yearOf(r.birth_date),
    deathYear: r.death_date ? yearOf(r.death_date) : null,
    isAlive: !!r.is_alive,
    photoUrl: r.photo_url,
    type: r.type,
    adopted: !!r.adopted,
    married_at: r.married_at ?? undefined,
    marriage_order: r.marriage_order ?? undefined
  })

  return c.json({
    person: {
      ...p,
      aliases: json<string[]>(p.aliases, []),
      occupation: json<string[]>(p.occupation, []),
      age: ageOf(p.birth_date, p.death_date),
      lunarDeath:
        p.death_anniv_lunar_day && p.death_anniv_lunar_month
          ? `${p.death_anniv_lunar_day}/${p.death_anniv_lunar_month} âm lịch`
          : null
    },
    relations: {
      parents: (parents.results || []).map(brief),
      children: (children.results || []).map(brief),
      spouses: (spouses.results || []).map(brief),
      siblings: (siblings.results || []).map(brief)
    },
    memoryCount: memCount?.n ?? 0,
    consents: consents.results,
    activeScopes: [...new Set(activeScopes)],
    advices: advices.results,
    nextAnniversary: anniv
  })
})

genealogyRoutes.patch('/persons/:id', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const clanId = await c.env.DB.prepare(`SELECT clan_id FROM persons WHERE id = ?`)
    .bind(id)
    .first<any>()
  if (!clanId) return c.json(problem(404, 'Not found', 'Không tìm thấy người này.'), 404)
  const denied = await guardClanWrite(c, clanId.clan_id)
  if (denied) return denied
  const b = await c.req.json().catch(() => ({} as any))
  const allowed = [
    'full_name', 'gender', 'generation', 'birth_date', 'death_date', 'birth_place',
    'death_place', 'bio', 'religion', 'photo_url', 'is_alive', 'is_verified',
    'death_anniv_lunar_day', 'death_anniv_lunar_month'
  ]
  const sets: string[] = []
  const vals: any[] = []
  for (const k of allowed) {
    if (k in b) {
      sets.push(`${k} = ?`)
      vals.push(typeof b[k] === 'boolean' ? (b[k] ? 1 : 0) : b[k])
    }
  }
  if ('aliases' in b) { sets.push('aliases = ?'); vals.push(JSON.stringify(b.aliases)) }
  if ('occupation' in b) { sets.push('occupation = ?'); vals.push(JSON.stringify(b.occupation)) }
  if (!sets.length) return c.json(problem(400, 'Validation error', 'Không có trường nào để cập nhật.'), 400)
  sets.push(`updated_at = datetime('now')`)
  vals.push(id)
  await c.env.DB.prepare(`UPDATE persons SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()
  await audit(c, 'person.update', 'person', id, b)
  return c.json({ ok: true })
})

/** POST /v1/persons/:id/relationships */
genealogyRoutes.post('/persons/:id/relationships', requireAuth, async (c) => {
  const from = paramOf(c, 'id')
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.targetPersonId || !b.type) {
    return c.json(problem(400, 'Validation error', 'Cần targetPersonId và type.'), 400)
  }
  // Cả hai người đều phải thuộc clan được phép (chống nối quan hệ xuyên clan)
  const [fromClan, toClan] = await Promise.all([
    c.env.DB.prepare(`SELECT clan_id FROM persons WHERE id = ?`).bind(from).first<any>(),
    c.env.DB.prepare(`SELECT clan_id FROM persons WHERE id = ?`).bind(b.targetPersonId).first<any>()
  ])
  if (!fromClan) return c.json(problem(404, 'Not found', 'Không tìm thấy người gốc.'), 404)
  if (!toClan) return c.json(problem(404, 'Not found', 'Không tìm thấy người đích.'), 404)
  if (fromClan.clan_id !== toClan.clan_id) {
    return c.json(problem(422, 'Cross-clan relationship', 'Không thể nối quan hệ giữa hai dòng họ khác nhau.'), 422)
  }
  const denied = await guardClanWrite(c, fromClan.clan_id)
  if (denied) return denied
  const enumErr = enumProblem(b, 'type', ['CHILD_OF', 'SPOUSE_OF', 'SIBLING_OF', 'ADOPTED_BY'])
  if (enumErr) return c.json(problem(400, 'Validation error', enumErr), 400)
  const rid = uuid()
  await c.env.DB.prepare(
    `INSERT INTO relationships (id, from_person_id, to_person_id, type, biological, adopted, married_at, marriage_order)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
  )
    .bind(
      rid, from, b.targetPersonId, b.type,
      b.biological === false ? 0 : 1, b.adopted ? 1 : 0,
      b.married_at || null, b.marriage_order || 1
    )
    .run()
  await audit(c, 'relationship.create', 'relationship', rid, b)
  return c.json({ id: rid })
})

/** Tìm kiếm người trong cây (search bar 8.4.1) */
genealogyRoutes.get('/persons', async (c) => {
  const clanId = await resolveClanId(c)
  if (!clanId) return c.json(problem(403, 'Forbidden', 'Không có dòng họ nào được phép truy cập.'), 403)
  const q = (c.req.query('q') || '').trim()
  if (!q) {
    const page = pageParams(c, 50)
    const totalRow = await c.env.DB.prepare(
      `SELECT COUNT(*) AS n FROM persons WHERE clan_id = ?`
    )
      .bind(clanId)
      .first<any>()
    const all = await c.env.DB.prepare(
      `SELECT id, full_name, birth_date, death_date, is_alive, generation, photo_url
         FROM persons WHERE clan_id = ?1 ORDER BY generation, birth_date LIMIT ?2 OFFSET ?3`
    )
      .bind(clanId, page.limit, page.offset)
      .all()
    return c.json({ persons: all.results, ...paginated(all.results, totalRow?.n || 0, page) })
  }
  const like = `%${q}%`
  const rows = await c.env.DB.prepare(
    `SELECT id, full_name, birth_date, death_date, is_alive, generation, photo_url
       FROM persons
      WHERE clan_id = ?1 AND (full_name LIKE ?2 OR aliases LIKE ?2 OR birth_place LIKE ?2)
      ORDER BY generation LIMIT 50`
  )
    .bind(clanId, like)
    .all()
  return c.json({ persons: rows.results, query: q })
})

/** Thống kê dashboard + lịch giỗ sắp tới (F1 push notification theo lịch âm) */
genealogyRoutes.get('/dashboard', async (c) => {
  const clanId = await resolveClanId(c)
  if (!clanId) return c.json({ clan: null })
  const clan = await c.env.DB.prepare(`SELECT * FROM clans WHERE id = ?`).bind(clanId).first<any>()
  const stats = await c.env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM persons WHERE clan_id = ?1) AS persons,
       (SELECT COUNT(*) FROM persons WHERE clan_id = ?1 AND is_alive = 1) AS living,
       (SELECT COUNT(*) FROM memories WHERE clan_id = ?1 AND status='APPROVED') AS memories,
       (SELECT COUNT(*) FROM memories WHERE clan_id = ?1 AND status='PENDING_REVIEW') AS pending,
       (SELECT COUNT(*) FROM advices WHERE clan_id = ?1) AS advices,
       (SELECT COUNT(*) FROM events WHERE clan_id = ?1) AS events,
       (SELECT COUNT(*) FROM contradictions ct WHERE ct.status='OPEN'
          AND (ct.event_id IN (SELECT id FROM events WHERE clan_id = ?1)
               OR ct.memory_a_id IN (SELECT id FROM memories WHERE clan_id = ?1)
               OR ct.memory_b_id IN (SELECT id FROM memories WHERE clan_id = ?1))) AS contradictions,
       (SELECT MAX(generation) FROM persons WHERE clan_id = ?1) AS generations`
  )
    .bind(clanId)
    .first<any>()

  const deceased = await c.env.DB.prepare(
    `SELECT id, full_name, photo_url, death_anniv_lunar_day AS d, death_anniv_lunar_month AS m,
            death_date, birth_date
       FROM persons
      WHERE clan_id = ? AND is_alive = 0
        AND death_anniv_lunar_day IS NOT NULL AND death_anniv_lunar_month IS NOT NULL`
  )
    .bind(clanId)
    .all<any>()

  const upcoming = (deceased.results || [])
    .map((p) => {
      const n = nextAnniversary(p.d, p.m)
      return {
        personId: p.id,
        name: p.full_name,
        photoUrl: p.photo_url,
        lunarLabel: `${p.d}/${p.m} âm lịch`,
        ...n
      }
    })
    .filter((x) => x.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 6)

  const today = new Date(Date.now() + 7 * 3600 * 1000)
  const lunarToday = solarToLunar(
    today.getUTCDate(),
    today.getUTCMonth() + 1,
    today.getUTCFullYear()
  )

  const [recentMemories, rituals, altars] = await Promise.all([
    c.env.DB.prepare(
      `SELECT m.id, m.content, m.type, m.created_at, m.perspective, p.full_name AS subject_name
         FROM memories m LEFT JOIN persons p ON p.id = m.subject_person_id
        WHERE m.clan_id = ? AND m.status='APPROVED' ORDER BY m.created_at DESC LIMIT 5`
    )
      .bind(clanId)
      .all(),
    c.env.DB.prepare(
      `SELECT id, title, scheduled_at, lunar_day, lunar_month, status FROM rituals
        WHERE clan_id = ? AND status IN ('SCHEDULED','LIVE') ORDER BY scheduled_at LIMIT 5`
    )
      .bind(clanId)
      .all(),
    c.env.DB.prepare(`SELECT id, name, religion_theme FROM altars WHERE clan_id = ?`)
      .bind(clanId)
      .all()
  ])

  return c.json({
    clan,
    stats,
    upcomingAnniversaries: upcoming,
    lunarToday: { ...lunarToday, label: formatLunar(lunarToday) },
    recentMemories: recentMemories.results,
    rituals: rituals.results,
    altars: altars.results
  })
})
