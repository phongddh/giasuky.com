/**
 * Consent Service (spec 7.1 #6) — F7 Consent Ledger & Digital Will
 * Ánh xạ 4.7 + 11.5. Blockchain notary: tính SHA-256 của bản ghi (KHÔNG PII lên chain);
 * ở MVP lưu hash + endpoint verify công khai thay cho tx Polygon zkEVM thật.
 */
import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'
import { CONSENT_SCOPES } from '../lib/types'
import { audit, requireAuth } from '../lib/auth'
import { enumProblem, json, pageParams, paginated, paramOf, problem, sha256, uuid } from '../lib/util'
import {
  clanOfPerson, clanOfRestRequest, clanOfWill,
  guardClanView, guardClanWrite, isOpenAccess, visibleClanIds
} from '../lib/access'

export const consentRoutes = new Hono<AppEnv>()

consentRoutes.get('/consent/scopes', (c) =>
  c.json({
    scopes: [
      { id: 'voice_clone', label: 'Nhân bản giọng nói', risk: 'HIGH', note: 'Bắt buộc watermark AudioSeal' },
      { id: 'photo_animation', label: 'Làm sống động ảnh thờ', risk: 'MEDIUM' },
      { id: 'chatbot_persona', label: 'Trò chuyện với persona AI', risk: 'HIGH', note: 'Chỉ trả lời từ ký ức có nguồn' },
      { id: 'video_reanimation', label: 'Tái tạo video', risk: 'HIGH' },
      { id: '3d_avatar', label: 'Avatar 3D', risk: 'MEDIUM' },
      { id: 'commercial_use', label: 'Sử dụng thương mại', risk: 'CRITICAL', note: 'Mặc định TẮT, phải chọn riêng' }
    ]
  })
)

consentRoutes.get('/consent', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT cr.*, p.full_name AS subject_name, p.photo_url AS subject_photo, p.is_alive,
            p.clan_id AS clan_id
       FROM consent_records cr JOIN persons p ON p.id = cr.subject_person_id
      ORDER BY cr.created_at DESC`
  ).all<any>()
  const visible = await visibleClanIds(c)
  const records = visible ? rows.results.filter((r) => visible.has(r.clan_id)) : rows.results
  return c.json({
    records: (records || []).map((r) => ({
      ...r,
      scope: json<string[]>(r.scope, []),
      grantees: json<any[]>(r.grantees, []),
      right_to_rest: json<any>(r.right_to_rest, null),
      auto_sunset_config: json<any>(r.auto_sunset_config, null)
    }))
  })
})

consentRoutes.get('/consent/subject/:personId', async (c) => {
  const pid = paramOf(c, 'personId')
  const denied = await guardClanView(c, await clanOfPerson(c, pid))
  if (denied) return denied
  const rows = await c.env.DB.prepare(
    `SELECT * FROM consent_records WHERE subject_person_id = ? ORDER BY created_at DESC`
  )
    .bind(pid)
    .all<any>()
  const active: string[] = []
  for (const r of rows.results || []) {
    if (r.status === 'active') active.push(...json<string[]>(r.scope, []))
  }
  return c.json({
    records: (rows.results || []).map((r) => ({ ...r, scope: json<string[]>(r.scope, []) })),
    activeScopes: [...new Set(active)]
  })
})

/**
 * POST /v1/consent — tạo ConsentRecord.
 * 11.5.3: voice_clone / video_reanimation / chatbot_persona bắt buộc VIDEO_CONSENT
 * hoặc NATIONAL_EID/NOTARY. commercial_use mặc định FALSE, phải chọn tường minh.
 */
consentRoutes.post('/consent', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.subjectPersonId || !Array.isArray(b.scope) || !b.scope.length) {
    return c.json(problem(400, 'Validation error', 'Cần subjectPersonId và ít nhất 1 scope.'), 400)
  }
  // Chống IDOR: chỉ thành viên dòng họ của người được đồng thuận mới tạo được bản ghi
  const denied = await guardClanWrite(c, await clanOfPerson(c, b.subjectPersonId))
  if (denied) return denied
  const invalid = b.scope.filter((s: string) => !CONSENT_SCOPES.includes(s as any))
  if (invalid.length) {
    return c.json(problem(400, 'Validation error', `Scope không hợp lệ: ${invalid.join(', ')}`), 400)
  }
  const methodErr = enumProblem(b, 'signatureMethod', ['NATIONAL_EID', 'HANDWRITTEN_SCAN', 'VIDEO_CONSENT', 'NOTARY'])
  if (methodErr) return c.json(problem(400, 'Validation error', methodErr), 400)
  const highRisk = ['voice_clone', 'video_reanimation', 'chatbot_persona', '3d_avatar']
  const needsStrong = b.scope.some((s: string) => highRisk.includes(s))
  const method = b.signatureMethod || 'HANDWRITTEN_SCAN'
  if (needsStrong && !['VIDEO_CONSENT', 'NATIONAL_EID', 'NOTARY'].includes(method)) {
    return c.json(
      problem(
        422,
        'Stronger signature required',
        'Theo 11.5.3, các phạm vi rủi ro cao (nhân bản giọng, persona AI, video, avatar 3D) yêu cầu Video Consent, VNeID hoặc công chứng.',
        { requiredMethods: ['VIDEO_CONSENT', 'NATIONAL_EID', 'NOTARY'] }
      ),
      422
    )
  }
  if (method === 'VIDEO_CONSENT' && !b.videoConsentUrl) {
    return c.json(
      problem(422, 'Video consent missing', 'Cần đường dẫn video clip (~30s) người ký nói rõ đồng ý.'),
      422
    )
  }

  const id = uuid()
  let timeEndIso: string | null = null
  if (b.timeEnd) {
    const d = new Date(b.timeEnd)
    if (isNaN(d.getTime())) {
      return c.json(problem(400, 'Validation error', 'timeEnd không hợp lệ.'), 400)
    }
    timeEndIso = d.toISOString()
  }
  const payload = {
    id,
    subjectPersonId: b.subjectPersonId,
    scope: b.scope.slice().sort(),
    grantees: b.grantees || [],
    timeStart: new Date().toISOString(),
    timeEnd: timeEndIso,
    signatureMethod: method
  }
  // blockchainProof: chỉ hash bản ghi, KHÔNG lưu PII lên chain (4.7.1)
  const recordHash = await sha256(JSON.stringify(payload))
  const txHash = '0x' + recordHash.slice(0, 64)

  await c.env.DB.prepare(
    `INSERT INTO consent_records (id, subject_person_id, scope, grantees, time_start, time_end,
       auto_sunset_config, right_to_rest, signature_method, signed_at, signer_ip,
       signer_device_fingerprint, video_consent_url, blockchain_tx_hash,
       blockchain_contract_address, record_hash, status)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,datetime('now'),?10,?11,?12,?13,?14,?15,'active')`
  )
    .bind(
      id,
      b.subjectPersonId,
      JSON.stringify(payload.scope),
      JSON.stringify(b.grantees || []),
      payload.timeStart,
      timeEndIso,
      JSON.stringify(b.autoSunset || { enabled: true, inactiveYears: 5 }),
      JSON.stringify(
        b.rightToRest || { condition: 'INHERITOR_DECISION', inheritorApprovalCount: 2 }
      ),
      method,
      c.req.header('cf-connecting-ip') || null,
      b.deviceFingerprint || c.req.header('user-agent') || null,
      b.videoConsentUrl || null,
      txHash,
      '0xGiaSuKyConsentLedgerV1',
      recordHash
    )
    .run()

  await audit(c, 'consent.grant', 'consent_record', id, {
    subjectPersonId: b.subjectPersonId,
    scope: payload.scope,
    method
  })
  return c.json({ id, recordHash, blockchainTxHash: txHash, status: 'active' })
})

/** 11.5.4 Revoke → mọi AI feature liên quan bị disable (AC: <5 phút; ở đây tức thời) */
consentRoutes.post('/consent/:id/revoke', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const b = await c.req.json().catch(() => ({} as any))
  const rec = await c.env.DB.prepare(`SELECT * FROM consent_records WHERE id = ?`).bind(id).first<any>()
  if (!rec) return c.json(problem(404, 'Not found', 'Không tìm thấy bản ghi đồng thuận.'), 404)
  const denied = await guardClanWrite(c, await clanOfPerson(c, rec.subject_person_id))
  if (denied) return denied
  await c.env.DB.prepare(
    `UPDATE consent_records SET status='revoked', revoked_at=datetime('now'), revoked_reason=?1 WHERE id=?2`
  )
    .bind(b.reason || 'Người dùng yêu cầu', id)
    .run()
  await audit(c, 'consent.revoke', 'consent_record', id, {
    reason: b.reason,
    subjectPersonId: rec.subject_person_id
  })
  return c.json({
    ok: true,
    effect: 'Mọi tính năng AI dựa trên đồng thuận này đã bị vô hiệu ngay lập tức.'
  })
})

/**
 * Chuyển thời gian DB về dạng ISO đúng format khi băm.
 * "2026-08-09 08:39:00" (datetime('now')) → "2026-08-09T08:39:00Z"; đã ISO thì giữ nguyên.
 */
function toIsoForHash(v: string | null | undefined): string | null {
  if (!v) return null
  const m = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/.exec(v)
  if (m) return `${m[1]}T${m[2]}Z`
  return v
}

/** Verify công khai bản ghi (AC-F7: blockchain proof verify độc lập — public URL, không PII) */
consentRoutes.get('/consent/:id/verify', async (c) => {
  const id = paramOf(c, 'id')
  const r = await c.env.DB.prepare(
    `SELECT id, subject_person_id, scope, grantees, time_start, time_end,
            signature_method, record_hash, blockchain_tx_hash,
            blockchain_contract_address, status
       FROM consent_records WHERE id = ?`
  )
    .bind(id)
    .first<any>()
  if (!r) return c.json(problem(404, 'Not found', 'Không tìm thấy bản ghi.'), 404)
  const payload = {
    id: r.id,
    subjectPersonId: r.subject_person_id,
    scope: json<string[]>(r.scope, []),
    grantees: json<any[]>(r.grantees, []),
    timeStart: toIsoForHash(r.time_start),
    timeEnd: toIsoForHash(r.time_end),
    signatureMethod: r.signature_method
  }
  const recomputed = await sha256(JSON.stringify(payload))
  // Tương thích ngược: bản ghi cũ lưu thời gian dạng SQLite → thử chuẩn hoá thêm 1 lần
  const recomputedLegacy =
    r.time_start && r.time_start !== toIsoForHash(r.time_start)
      ? await sha256(JSON.stringify({ ...payload, timeStart: r.time_start }))
      : null
  const verified = recomputed === r.record_hash || recomputedLegacy === r.record_hash
  return c.json({
    consentId: r.id,
    status: r.status,
    verified,
    storedHash: r.record_hash,
    recomputedHash: recomputed,
    scope: payload.scope,
    signatureMethod: r.signature_method,
    blockchain: {
      txHash: r.blockchain_tx_hash,
      contractAddress: r.blockchain_contract_address,
      network: 'polygon-zkevm (MVP: notary nội bộ)',
      containsPII: false
    }
  })
})

// ------------------------ 4.7.2 Right to Rest -------------------------
consentRoutes.get('/rest-requests', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT rr.*, p.full_name AS subject_name, p.clan_id AS clan_id FROM rest_requests rr
       JOIN persons p ON p.id = rr.subject_person_id ORDER BY rr.created_at DESC`
  ).all<any>()
  const visible = await visibleClanIds(c)
  const requests = (visible ? rows.results.filter((r) => visible.has(r.clan_id)) : rows.results).map(
    (r) => ({ ...r, approvals: json<string[]>(r.approvals, []) })
  )
  return c.json({ requests })
})

consentRoutes.post('/rest-requests', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.consentRecordId) {
    return c.json(problem(400, 'Validation error', 'Cần consentRecordId.'), 400)
  }
  const rec = await c.env.DB.prepare(`SELECT * FROM consent_records WHERE id = ?`)
    .bind(b.consentRecordId)
    .first<any>()
  if (!rec) return c.json(problem(404, 'Not found', 'Không tìm thấy bản ghi đồng thuận.'), 404)
  const denied = await guardClanWrite(c, await clanOfPerson(c, rec.subject_person_id))
  if (denied) return denied
  const enumErr =
    enumProblem(b, 'mode', ['SOFT_SUNSET', 'HARD_DELETE']) ||
    enumProblem(b, 'trigger', ['INACTIVITY', 'MANUAL_TRIGGER', 'INHERITOR_DECISION'])
  if (enumErr) return c.json(problem(400, 'Validation error', enumErr), 400)
  const rtr = json<any>(rec.right_to_rest, { inheritorApprovalCount: 2 })
  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO rest_requests (id, consent_record_id, subject_person_id, mode, trigger,
       required_approvals, approvals, created_by)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
  )
    .bind(
      id, b.consentRecordId, rec.subject_person_id,
      b.mode === 'HARD_DELETE' ? 'HARD_DELETE' : 'SOFT_SUNSET',
      b.trigger || 'INHERITOR_DECISION',
      rtr?.inheritorApprovalCount ?? 2,
      JSON.stringify([c.var.user!.id]),
      c.var.user!.id
    )
    .run()
  await audit(c, 'righttorest.request', 'rest_request', id, { mode: b.mode })
  return c.json({ id, requiredApprovals: rtr?.inheritorApprovalCount ?? 2, approvals: 1 })
})

consentRoutes.post('/rest-requests/:id/approve', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const r = await c.env.DB.prepare(`SELECT * FROM rest_requests WHERE id = ?`).bind(id).first<any>()
  if (!r) return c.json(problem(404, 'Not found', 'Không tìm thấy yêu cầu.'), 404)
  const denied = await guardClanWrite(c, await clanOfRestRequest(c, id))
  if (denied) return denied
  if (r.status !== 'PENDING') return c.json({ ok: true, status: r.status })
  const approvals = new Set(json<string[]>(r.approvals, []))
  approvals.add(c.var.user!.id)
  const list = [...approvals]
  let status = 'PENDING'
  if (list.length >= r.required_approvals) {
    status = 'EXECUTED'
    // SOFT_SUNSET: tắt AI interaction, dữ liệu vẫn lưu (memorial)
    await c.env.DB.prepare(
      `UPDATE consent_records SET status='sunset', revoked_at=datetime('now'),
              revoked_reason='Right to Rest — đủ phiếu người kế thừa' WHERE id=?`
    )
      .bind(r.consent_record_id)
      .run()
    if (r.mode === 'HARD_DELETE') {
      // 4.7.2 HARD_DELETE — xoá HOÀN TOÀN dữ liệu persona (cascade, 1 batch)
      const pid = r.subject_person_id
      const mems = await c.env.DB.prepare(
        `SELECT id FROM memories WHERE subject_person_id = ?1 OR told_by_person_id = ?1`
      )
        .bind(pid)
        .all<any>()
      const memIds = (mems.results || []).map((m) => m.id)
      const stmts: D1PreparedStatement[] = []
      stmts.push(c.env.DB.prepare(`DELETE FROM persona_messages WHERE person_id = ?`).bind(pid))
      stmts.push(
        c.env.DB.prepare(`DELETE FROM time_capsules WHERE author_person_id = ? OR recipient_person_id = ?`).bind(
          pid,
          pid
        )
      )
      stmts.push(c.env.DB.prepare(`DELETE FROM interview_sessions WHERE interviewee_person_id = ?`).bind(pid))
      stmts.push(c.env.DB.prepare(`DELETE FROM digital_wills WHERE testator_person_id = ?`).bind(pid))
      stmts.push(c.env.DB.prepare(`DELETE FROM rest_requests WHERE subject_person_id = ?`).bind(pid))
      stmts.push(c.env.DB.prepare(`DELETE FROM consent_records WHERE subject_person_id = ?`).bind(pid))
      stmts.push(c.env.DB.prepare(`DELETE FROM advices WHERE spoken_by_person_id = ?`).bind(pid))
      stmts.push(c.env.DB.prepare(`DELETE FROM user_person_links WHERE person_id = ?`).bind(pid))
      stmts.push(c.env.DB.prepare(`DELETE FROM event_persons WHERE person_id = ?`).bind(pid))
      stmts.push(
        c.env.DB.prepare(`DELETE FROM relationships WHERE from_person_id = ? OR to_person_id = ?`).bind(pid, pid)
      )
      if (memIds.length) {
        const ph = memIds.map(() => '?').join(',')
        stmts.push(c.env.DB.prepare(`DELETE FROM memory_persons WHERE memory_id IN (${ph})`).bind(...memIds))
        stmts.push(c.env.DB.prepare(`DELETE FROM memory_embeddings WHERE memory_id IN (${ph})`).bind(...memIds))
        stmts.push(
          c.env.DB.prepare(
            `DELETE FROM contradictions WHERE memory_a_id IN (${ph}) OR memory_b_id IN (${ph})`
          ).bind(...memIds, ...memIds)
        )
        stmts.push(c.env.DB.prepare(`DELETE FROM advices WHERE source_memory_id IN (${ph})`).bind(...memIds))
        stmts.push(
          c.env.DB.prepare(`DELETE FROM memories WHERE subject_person_id = ?1 OR told_by_person_id = ?1`).bind(pid)
        )
      }
      stmts.push(c.env.DB.prepare(`DELETE FROM persons WHERE id = ?`).bind(pid))
      await c.env.DB.batch(stmts)
    }
    await c.env.DB.prepare(
      `UPDATE rest_requests SET status='EXECUTED', executed_at=datetime('now'), approvals=?1 WHERE id=?2`
    )
      .bind(JSON.stringify(list), id)
      .run()
  } else {
    await c.env.DB.prepare(`UPDATE rest_requests SET approvals=?1 WHERE id=?2`)
      .bind(JSON.stringify(list), id)
      .run()
  }
  await audit(c, 'righttorest.approve', 'rest_request', id, { approvals: list.length, status })
  return c.json({ ok: true, approvals: list.length, required: r.required_approvals, status })
})

// ------------------------ 4.7.3 Digital Will --------------------------
consentRoutes.get('/wills', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT w.*, p.full_name AS testator_name, p.clan_id AS clan_id FROM digital_wills w
       JOIN persons p ON p.id = w.testator_person_id ORDER BY w.created_at DESC`
  ).all<any>()
  const visible = await visibleClanIds(c)
  const wills = (visible ? rows.results.filter((w) => visible.has(w.clan_id)) : rows.results).map((w) => ({
    ...w,
    witness_ids: json<string[]>(w.witness_ids, []),
    inheritors: json<any[]>(w.inheritors, []),
    post_mortem_instructions: json<any>(w.post_mortem_instructions, {}),
    legal_review: json<any>(w.legal_review, {})
  }))
  return c.json({ wills })
})

consentRoutes.post('/wills', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.testatorPersonId) {
    return c.json(problem(400, 'Validation error', 'Cần testatorPersonId.'), 400)
  }
  const denied = await guardClanWrite(c, await clanOfPerson(c, b.testatorPersonId))
  if (denied) return denied
  const witnesses: string[] = b.witnessIds || []
  if (b.status === 'signed' && witnesses.length < 2) {
    return c.json(
      problem(422, 'Witnesses required', 'Di chúc số cần ít nhất 2 nhân chứng khi ký (4.7.3).'),
      422
    )
  }
  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO digital_wills (id, testator_person_id, witness_ids, inheritors,
       post_mortem_instructions, legal_review, status)
     VALUES (?1,?2,?3,?4,?5,?6,?7)`
  )
    .bind(
      id, b.testatorPersonId, JSON.stringify(witnesses),
      JSON.stringify(b.inheritors || []),
      JSON.stringify(
        b.postMortemInstructions || {
          releaseTimeCapsulesAt: 'on_death',
          activateMemorialMode: true,
          lockedTopics: ['chính trị', 'tài chính riêng'],
          finalMessageToFamily: null
        }
      ),
      JSON.stringify(b.legalReview || { jurisdiction: 'VN', notarized: false, reviewedByLawyerId: null }),
      b.status === 'signed' ? 'signed' : 'draft'
    )
    .run()
  await audit(c, 'will.create', 'digital_will', id, { testatorPersonId: b.testatorPersonId })
  return c.json({ id })
})

/** 4.7.4 Death Verification — manual + 2 nhân chứng → activate will */
consentRoutes.post('/wills/:id/activate', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const b = await c.req.json().catch(() => ({} as any))
  const w = await c.env.DB.prepare(`SELECT * FROM digital_wills WHERE id = ?`).bind(id).first<any>()
  if (!w) return c.json(problem(404, 'Not found', 'Không tìm thấy di chúc số.'), 404)
  const denied = await guardClanWrite(c, await clanOfWill(c, id))
  if (denied) return denied
  const witnesses = json<string[]>(w.witness_ids, [])
  const method = b.method || 'MANUAL_WITNESS'
  if (method === 'MANUAL_WITNESS' && (witnesses.length < 2 || !b.deathCertificateUrl)) {
    return c.json(
      problem(
        422,
        'Death verification incomplete',
        'Cần ≥2 nhân chứng và ảnh giấy chứng tử để xác nhận qua đời (4.7.4).'
      ),
      422
    )
  }
  await c.env.DB.prepare(
    `UPDATE digital_wills SET status='activated', activated_at=datetime('now') WHERE id=?`
  )
    .bind(id)
    .run()
  await c.env.DB.prepare(
    `UPDATE persons SET is_alive = 0, death_date = COALESCE(death_date, ?1) WHERE id = ?2`
  )
    .bind(b.deathDate || null, w.testator_person_id)
    .run()

  // Thực hiện hướng dẫn hậu sự: mở time capsule "on_death"
  const inst = json<any>(w.post_mortem_instructions, {})
  let released = 0
  if (inst.releaseTimeCapsulesAt === 'on_death') {
    const res = await c.env.DB.prepare(
      `UPDATE time_capsules SET status='RELEASED'
        WHERE author_person_id = ? AND release_mode='ON_DEATH' AND status='SEALED'`
    )
      .bind(w.testator_person_id)
      .run()
    released = (res as any)?.meta?.changes ?? 0
  }
  await audit(c, 'will.activate', 'digital_will', id, { method, released })
  return c.json({ ok: true, capsulesReleased: released, memorialMode: !!inst.activateMemorialMode })
})

/** 6.3.4 Audit trail viewer — immutable log */
consentRoutes.get('/audit-logs', requireAuth, async (c) => {
  // Chế độ nghiêm ngặt: chỉ thấy log của chính mình + thành viên cùng dòng họ
  // (log chứa IP/user-agent của người khác).
  let scopeSql = ''
  const args: string[] = []
  if (!isOpenAccess(c)) {
    scopeSql = `WHERE a.actor_user_id = ?1 OR a.actor_user_id IN (
                  SELECT user_id FROM clan_members WHERE clan_id = ?2)`
    args.push(c.var.user!.id, c.var.user!.clan_id || '')
  }
  const page = pageParams(c, 50)
  const n = args.length
  const totalRow = await c.env.DB.prepare(
    `SELECT COUNT(*) AS n FROM audit_logs a ${scopeSql}`
  )
    .bind(...args)
    .first<any>()
  const rows = await c.env.DB.prepare(
    `SELECT a.*, u.full_name AS actor_name FROM audit_logs a
       LEFT JOIN users u ON u.id = a.actor_user_id
       ${scopeSql}
      ORDER BY a.created_at DESC LIMIT ?${n + 1} OFFSET ?${n + 2}`
  )
    .bind(...args, page.limit, page.offset)
    .all()
  return c.json({ logs: rows.results, ...paginated(rows.results, totalRow?.n || 0, page) })
})
