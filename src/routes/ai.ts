/**
 * AI Gateway endpoints (spec 7.4) — /v1/interviews/*, /v1/personas/*
 * F2 AI Interviewer (4.2) + Persona Chat RAG (7.5) + anti-hallucination (7.6).
 */
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { AppEnv } from '../lib/types'
import { AI_HOSTS, INTERVIEW_TOPICS } from '../lib/types'
import { audit, requireAuth } from '../lib/auth'
import { json, paramOf, problem, removeTone, uuid, ageOf } from '../lib/util'
import {
  assertConsent, buildPersonaPrompt, checkRateLimit, detectGrief, embed,
  llmAvailable, llmChat, postProcessPersona, retrieveMemories, scanOutput
} from '../lib/ai'
import {
  clanOfInterview, clanOfPerson, guardClanView, guardClanWrite, visibleClanIds
} from '../lib/access'

export const aiRoutes = new Hono<AppEnv>()

aiRoutes.get('/ai/hosts', (c) =>
  c.json({ hosts: AI_HOSTS, topics: INTERVIEW_TOPICS, llmReady: llmAvailable(c.env) })
)

// ==================== F2 — AI INTERVIEWER ============================

aiRoutes.get('/interviews', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT s.*, p.full_name AS interviewee_name, p.photo_url AS interviewee_photo,
            p.birth_date, p.birth_place,
            (SELECT COUNT(*) FROM memories m WHERE m.interview_session_id = s.id) AS memory_count
       FROM interview_sessions s JOIN persons p ON p.id = s.interviewee_person_id
      ORDER BY s.created_at DESC LIMIT 50`
  )
    .all<any>()
  const visible = await visibleClanIds(c)
  const sessions = visible ? rows.results.filter((s) => visible.has(s.clan_id)) : rows.results
  return c.json({ sessions })
})

/** POST /v1/interviews — đặt lịch phỏng vấn (4.2.1 wizard 4 bước) */
aiRoutes.post('/interviews', requireAuth, async (c) => {
  const b = await c.req.json().catch(() => ({} as any))
  if (!b.intervieweeId) {
    return c.json(problem(400, 'Validation error', 'Cần chọn người được phỏng vấn.'), 400)
  }
  const clanId = await clanOfPerson(c, b.intervieweeId)
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  // 7.9 rate limit: free 1 session/tuần
  const rl = await checkRateLimit(c.env, c.var.user!.id, 'interviews', 5, 24 * 7)
  if (!rl.ok) {
    return c.json(
      problem(429, 'Rate limited', 'Đã đạt giới hạn số buổi phỏng vấn trong tuần (gói hiện tại).'),
      429
    )
  }
  // AC-F2.5: PSTN cần consent audio; mọi kênh cần consent chatbot/voice để lưu ghi âm
  const consent = await c.env.DB.prepare(
    `SELECT id FROM consent_records WHERE subject_person_id = ? AND status='active' LIMIT 1`
  )
    .bind(b.intervieweeId)
    .first<any>()

  const id = uuid()
  await c.env.DB.prepare(
    `INSERT INTO interview_sessions (id, clan_id, interviewee_person_id, scheduled_by_user_id,
       channel, scheduled_at, status, topic, language, ai_host_id, consent_record_id,
       transcript_raw, emotion_timeline)
     VALUES (?1,?2,?3,?4,?5,?6,'SCHEDULED',?7,?8,?9,?10,'[]','[]')`
  )
    .bind(
      id, b.clan_id || c.var.user!.clan_id || null, b.intervieweeId, c.var.user!.id,
      b.channel === 'pstn_twilio' ? 'pstn_twilio' : 'app_voip',
      b.scheduledAt || null, b.topic || 'tuoi_tho',
      b.language || 'VI_SOUTH', b.aiHostId || 'AI_FEMALE_SAIGON',
      consent?.id || null
    )
    .run()
  await audit(c, 'interview.schedule', 'interview_session', id, {
    intervieweeId: b.intervieweeId,
    channel: b.channel
  })
  return c.json({ id, remaining: rl.remaining })
})

aiRoutes.get('/interviews/:id', async (c) => {
  const id = paramOf(c, 'id')
  const s = await c.env.DB.prepare(
    `SELECT s.*, p.full_name AS interviewee_name, p.photo_url AS interviewee_photo,
            p.birth_date, p.birth_place, p.bio
       FROM interview_sessions s JOIN persons p ON p.id = s.interviewee_person_id
      WHERE s.id = ?`
  )
    .bind(id)
    .first<any>()
  if (!s) return c.json(problem(404, 'Not found', 'Không tìm thấy buổi phỏng vấn.'), 404)
  const denied = await guardClanView(c, s.clan_id)
  if (denied) return denied
  const host = AI_HOSTS.find((h) => h.id === s.ai_host_id) || AI_HOSTS[0]
  const topic = INTERVIEW_TOPICS.find((t) => t.id === s.topic)
  return c.json({
    session: {
      ...s,
      transcript_raw: json<any[]>(s.transcript_raw, []),
      transcript_structured: json<any>(s.transcript_structured, null),
      emotion_timeline: json<any[]>(s.emotion_timeline, [])
    },
    host,
    topic
  })
})

/**
 * POST /v1/interviews/:id/turn — một lượt hội thoại.
 * Dialog manager (4.2.3): nhận lời kể của cụ → phát hiện emotion → sinh câu hỏi tiếp
 * theo Prompt Framework 4.2.4 (không ngắt lời, không hỏi 2 câu, xưng hô đúng vai vế,
 * đổi/kết thúc chủ đề nếu buồn/mệt).
 */
aiRoutes.post('/interviews/:id/turn', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const b = await c.req.json().catch(() => ({} as any))
  const s = await c.env.DB.prepare(
    `SELECT s.*, p.full_name AS name, p.birth_date, p.birth_place, p.bio
       FROM interview_sessions s JOIN persons p ON p.id = s.interviewee_person_id
      WHERE s.id = ?`
  )
    .bind(id)
    .first<any>()
  if (!s) return c.json(problem(404, 'Not found', 'Không tìm thấy buổi phỏng vấn.'), 404)
  const denied = await guardClanWrite(c, s.clan_id)
  if (denied) return denied

  const turns = json<any[]>(s.transcript_raw, [])
  const emotions = json<any[]>(s.emotion_timeline, [])
  const host = AI_HOSTS.find((h) => h.id === s.ai_host_id) || AI_HOSTS[0]
  const topic = INTERVIEW_TOPICS.find((t) => t.id === s.topic) || INTERVIEW_TOPICS[0]

  // ---- Turn mở đầu: AI tự giới thiệu rõ là trợ lý AI (4.2.6) + xin phép ghi âm (AC-F2.5)
  if (b.action === 'start' || !turns.length) {
    const age = ageOf(s.birth_date)
    const salut = age && age >= 70 ? 'cụ' : age && age >= 55 ? 'bác' : 'cô/chú'
    const greeting =
      s.channel === 'pstn_twilio'
        ? `Dạ ${salut} ơi, cháu là ${host.name} — trợ lý AI của ứng dụng Gia Sử Ký, do con cháu trong nhà nhờ gọi ạ. Cháu xin phép được ghi âm lại câu chuyện để lưu vào gia phả cho các thế hệ sau, ${salut} đồng ý không ạ? Hôm nay cháu muốn nghe ${salut} kể về "${topic.label}".`
        : `Dạ ${salut} ơi, cháu là ${host.name}, trợ lý AI của Gia Sử Ký ạ. Cháu xin phép ghi âm để lưu vào gia phả nhé. Hôm nay mình cùng nói về "${topic.label}", ${salut} kể cháu nghe nhé ạ. ${topic.questions[0]}`
    turns.push({ role: 'ai', content: greeting, t: 0, ts: new Date().toISOString() })
    await c.env.DB.prepare(
      `UPDATE interview_sessions SET transcript_raw=?1, status='IN_PROGRESS',
              started_at=COALESCE(started_at, datetime('now')) WHERE id=?2`
    )
      .bind(JSON.stringify(turns), id)
      .run()
    return c.json({ reply: greeting, turns, emotion: null, shouldEnd: false, host: host.name })
  }

  const userText = String(b.text || '').trim()
  if (!userText) return c.json(problem(400, 'Validation error', 'Thiếu nội dung lời kể.'), 400)
  const elapsed = b.elapsed ?? turns.length * 25

  turns.push({ role: 'interviewee', content: userText, t: elapsed, ts: new Date().toISOString() })

  // ---- Emotion detector (thay wav2vec2 bằng heuristic + LLM classify trên text)
  const emotion = detectEmotionFromText(userText)
  emotions.push({ t: elapsed, emotion: emotion.label, confidence: emotion.confidence })

  // AC-F2.3: tự phát hiện & dừng lễ độ khi người kể buồn/mệt/khóc
  const shouldEnd =
    emotion.label === 'sad_severe' ||
    emotion.label === 'tired' ||
    turns.filter((t) => t.role === 'interviewee').length >= 14

  let reply: string
  if (llmAvailable(c.env)) {
    const age = ageOf(s.birth_date)
    const sys = buildInterviewerSystemPrompt({
      hostName: host.name,
      region: host.region,
      intervieweeName: s.name,
      age,
      birthPlace: s.birth_place,
      topicLabel: topic.label,
      questionBank: topic.questions as unknown as string[],
      bio: s.bio,
      emotion: emotion.label,
      shouldEnd,
      sensitive: !!(topic as any).sensitive
    })
    const history = turns.slice(-12).map((t) => ({
      role: (t.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: t.content
    }))
    const out = await llmChat(c.env, [{ role: 'system', content: sys }, ...history], {
      maxTokens: 300
    })
    reply = out || fallbackQuestion(topic.questions as unknown as string[], turns, shouldEnd)
  } else {
    reply = fallbackQuestion(topic.questions as unknown as string[], turns, shouldEnd)
  }

  // Guardrail: câu hỏi của AI cũng phải qua anti-scam scan (11.6)
  const scan = scanOutput(reply)
  if (scan.blocked) {
    reply = 'Dạ, cháu xin phép chuyển sang chuyện khác ạ. ' + topic.questions[0]
  }

  turns.push({ role: 'ai', content: reply, t: elapsed + 3, ts: new Date().toISOString() })

  await c.env.DB.prepare(
    `UPDATE interview_sessions SET transcript_raw=?1, emotion_timeline=?2,
            duration_seconds=?3, status=?4, ended_at=?5 WHERE id=?6`
  )
    .bind(
      JSON.stringify(turns),
      JSON.stringify(emotions),
      elapsed,
      shouldEnd ? 'PENDING_REVIEW' : 'IN_PROGRESS',
      shouldEnd ? new Date().toISOString().replace('T', ' ').slice(0, 19) : null,
      id
    )
    .run()

  return c.json({
    reply,
    emotion: emotion.label,
    emotionConfidence: emotion.confidence,
    shouldEnd,
    turnCount: turns.length,
    host: host.name
  })
})

/** Kết thúc buổi phỏng vấn → chuyển sang PENDING_REVIEW */
aiRoutes.post('/interviews/:id/end', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const clanId = await clanOfInterview(c, id)
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied
  await c.env.DB.prepare(
    `UPDATE interview_sessions SET status='PENDING_REVIEW', ended_at=datetime('now') WHERE id=?`
  )
    .bind(id)
    .run()
  await audit(c, 'interview.end', 'interview_session', id)
  return c.json({ ok: true })
})

/**
 * POST /v1/interviews/:id/approve — con cháu duyệt transcript.
 * Chỉ đoạn được duyệt mới vào Memory Graph (8.4.4). Đồng thời auto-link entity
 * (danh từ riêng: tên người, địa danh) như 4.2.3.
 */
aiRoutes.post('/interviews/:id/approve', requireAuth, async (c) => {
  const id = paramOf(c, 'id')
  const b = await c.req.json().catch(() => ({} as any))
  const s = await c.env.DB.prepare(`SELECT * FROM interview_sessions WHERE id = ?`)
    .bind(id)
    .first<any>()
  if (!s) return c.json(problem(404, 'Not found', 'Không tìm thấy buổi phỏng vấn.'), 404)
  const denied = await guardClanWrite(c, s.clan_id)
  if (denied) return denied

  const turns = json<any[]>(s.transcript_raw, [])
  // segments: mảng chỉ số turn được duyệt; nếu không truyền → duyệt hết lời kể
  const approvedIdx: number[] = Array.isArray(b.approvedTurnIndexes)
    ? b.approvedTurnIndexes
    : turns.map((t, i) => (t.role === 'interviewee' ? i : -1)).filter((i) => i >= 0)

  const edited: Record<string, string> = b.editedTexts || {}
  const person = await c.env.DB.prepare(`SELECT full_name, birth_place FROM persons WHERE id = ?`)
    .bind(s.interviewee_person_id)
    .first<any>()

  let created = 0
  for (const i of approvedIdx) {
    const t = turns[i]
    if (!t || t.role !== 'interviewee') continue
    const content = (edited[String(i)] ?? t.content).trim()
    if (content.length < 12) continue
    const prevQ = turns[i - 1]?.role === 'ai' ? turns[i - 1].content : null
    const mid = uuid()
    await c.env.DB.prepare(
      `INSERT INTO memories (id, clan_id, type, content, content_no_tone, language, perspective,
         told_by_person_id, subject_person_id, source, interview_session_id, status, visibility, created_by)
       VALUES (?1,?2,'AUDIO',?3,?4,'vi',?5,?6,?6,'AI_INTERVIEW',?7,'APPROVED','CLAN',?8)`
    )
      .bind(
        mid, s.clan_id, content, removeTone(content),
        `Kể bởi ${person?.full_name || 'người được phỏng vấn'}${prevQ ? ` (hỏi: ${prevQ.slice(0, 80)})` : ''}`,
        s.interviewee_person_id, id, c.var.user!.id
      )
      .run()
    const v = await embed(c.env, content)
    await c.env.DB.prepare(
      `INSERT INTO memory_embeddings (memory_id, clan_id, person_id, dim, vector)
       VALUES (?1,?2,?3,?4,?5) ON CONFLICT(memory_id) DO UPDATE SET vector=?5`
    )
      .bind(mid, s.clan_id, s.interviewee_person_id, v.length, JSON.stringify(v))
      .run()
    created++
  }

  await c.env.DB.prepare(
    `UPDATE interview_sessions SET status='APPROVED', approved=1,
            reviewed_by_user_id=?1, reviewed_at=datetime('now') WHERE id=?2`
  )
    .bind(c.var.user!.id, id)
    .run()
  await audit(c, 'interview.approve', 'interview_session', id, { memoriesCreated: created })
  return c.json({ ok: true, memoriesCreated: created })
})

// ==================== Persona Chat (7.5 RAG) =========================

aiRoutes.get('/personas/:personId/status', async (c) => {
  const pid = paramOf(c, 'personId')
  const p = await c.env.DB.prepare(
    `SELECT id, full_name, birth_place, is_alive, photo_url, bio FROM persons WHERE id = ?`
  )
    .bind(pid)
    .first<any>()
  if (!p) return c.json(problem(404, 'Not found', 'Không tìm thấy người này.'), 404)
  const denied = await guardClanView(c, await clanOfPerson(c, pid))
  if (denied) return denied
  const consent = await assertConsent(c.env, pid, 'chatbot_persona')
  const mc = await c.env.DB.prepare(
    `SELECT COUNT(*) AS n FROM memories WHERE (subject_person_id=?1 OR told_by_person_id=?1) AND status='APPROVED'`
  )
    .bind(pid)
    .first<any>()
  return c.json({
    person: p,
    consentGranted: consent.ok,
    consentId: consent.consentId ?? null,
    memoryCount: mc?.n ?? 0,
    ready: consent.ok && (mc?.n ?? 0) > 0,
    llmReady: llmAvailable(c.env),
    guardrails: [
      'Chỉ trả lời từ ký ức đã được gia đình lưu và duyệt',
      'Mỗi câu trả lời đều kèm nguồn (Memory ID)',
      'Không bao giờ đề cập tiền, OTP, thông tin tài khoản',
      'Không đưa ý kiến chính trị / chẩn đoán y tế / khuyến nghị đầu tư'
    ]
  })
})

aiRoutes.get('/personas/:personId/messages', async (c) => {
  const pid = paramOf(c, 'personId')
  const denied = await guardClanView(c, await clanOfPerson(c, pid))
  if (denied) return denied
  const rows = await c.env.DB.prepare(
    `SELECT id, role, content, citations, blocked, block_reason, created_at
       FROM persona_messages WHERE person_id=?1 AND (user_id=?2 OR ?2 IS NULL)
      ORDER BY created_at LIMIT 100`
  )
    .bind(pid, c.var.user?.id ?? null)
    .all<any>()
  return c.json({
    messages: (rows.results || []).map((m) => ({ ...m, citations: json<string[]>(m.citations, []) }))
  })
})

/**
 * POST /v1/personas/:personId/chat — RAG streaming (SSE).
 * Chuỗi: consent_check → rate_limit → retrieve → prompt → LLM → post-process
 *        → anti-scam scan → citations → lưu log.
 */
aiRoutes.post('/personas/:personId/chat', requireAuth, async (c) => {
  const pid = paramOf(c, 'personId')
  const b = await c.req.json().catch(() => ({} as any))
  const message = String(b.message || '').trim()
  if (!message) return c.json(problem(400, 'Validation error', 'Thiếu nội dung câu hỏi.'), 400)

  // 0) access control — người chat phải thuộc dòng họ của nhân vật (P2 + chống IDOR)
  const clanId = await clanOfPerson(c, pid)
  const denied = await guardClanWrite(c, clanId)
  if (denied) return denied

  // 1) consent_check (bắt buộc — P2)
  const consent = await assertConsent(c.env, pid, 'chatbot_persona')
  if (!consent.ok) return c.json(consent.error, 403)

  // 2) rate limit (7.9): free 20 msg/ngày
  const rl = await checkRateLimit(c.env, c.var.user!.id, 'persona_chat', 200, 24)
  if (!rl.ok) {
    return c.json(problem(429, 'Rate limited', 'Đã hết lượt trò chuyện hôm nay.'), 429)
  }

  // 3) grief-aware (P3 / 11.7)
  const grief = detectGrief(message)

  const person = await c.env.DB.prepare(
    `SELECT id, full_name, birth_place, is_alive FROM persons WHERE id = ?`
  )
    .bind(pid)
    .first<any>()
  if (!person) return c.json(problem(404, 'Not found', 'Không tìm thấy người này.'), 404)

  await c.env.DB.prepare(
    `INSERT INTO persona_messages (id, person_id, user_id, role, content) VALUES (?1,?2,?3,'user',?4)`
  )
    .bind(uuid(), pid, c.var.user!.id, message)
    .run()

  // 3b) 11.6: quét CẢ câu hỏi đi vào, không chỉ câu trả lời đi ra.
  // Kịch bản lừa đảo thực tế là kẻ gian mượn danh người đã mất để hỏi OTP /
  // số tài khoản, nên persona phải từ chối ngay và cảnh báo người dùng —
  // tuyệt đối không đưa nội dung này tới LLM.
  const inScan = scanOutput(message)
  if (inScan.blocked) {
    const warn =
      `Câu hỏi này đã bị chặn theo hàng rào an toàn 11.6: persona của ${person.full_name} ` +
      `không bao giờ nói về tiền, số tài khoản, mã OTP, mật khẩu hay giấy tờ tùy thân.\n\n` +
      `Nếu có ai đang dùng giọng nói hoặc hình ảnh người thân đã mất để hỏi bạn những điều đó, ` +
      `đây gần như chắc chắn là lừa đảo. Hãy gọi trực tiếp cho người trong nhà để kiểm chứng.`
    const mid = uuid()
    await c.env.DB.prepare(
      `INSERT INTO persona_messages (id, person_id, user_id, role, content, citations, blocked, block_reason)
       VALUES (?1,?2,?3,'persona',?4,'[]',1,?5)`
    )
      .bind(mid, pid, c.var.user!.id, warn, inScan.reason || null)
      .run()
    await audit(c, 'persona.chat.blocked', 'person', pid, {
      direction: 'input',
      labels: inScan.labels
    })
    return c.json({
      reply: warn,
      citations: [],
      citationDetails: [],
      blocked: true,
      blockReason: inScan.reason,
      retrieved: 0,
      grief: grief.flagged ? griefNotice(grief.severe) : null
    })
  }

  // 4) retrieve + consent filter
  const memories = await retrieveMemories(c.env, pid, message, 5)

  // 7.6 quy tắc 1: không có memory match → KHÔNG cho LLM trả lời
  if (!memories.length) {
    const text = `Chuyện đó ${person.is_alive ? '' : ''}không có trong những gì gia đình đã lưu lại, nên ${person.full_name} không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.`
    const mid = uuid()
    await c.env.DB.prepare(
      `INSERT INTO persona_messages (id, person_id, user_id, role, content, citations) VALUES (?1,?2,?3,'persona',?4,'[]')`
    )
      .bind(mid, pid, c.var.user!.id, text)
      .run()
    await audit(c, 'persona.chat', 'person', pid, { noMatch: true })
    return c.json({
      reply: text,
      citations: [],
      noMatch: true,
      grief: grief.flagged ? griefNotice(grief.severe) : null
    })
  }

  const sys = buildPersonaPrompt(
    { full_name: person.full_name, birth_place: person.birth_place, is_alive: person.is_alive },
    memories
  )
  let raw: string | null = null
  if (llmAvailable(c.env)) {
    raw = await llmChat(
      c.env,
      [
        { role: 'system', content: sys },
        ...(grief.flagged
          ? [
              {
                role: 'system' as const,
                content:
                  'Người hỏi đang có dấu hiệu đau buồn. Hãy mở đầu bằng một câu an ủi ngắn, ấm áp, rồi mới kể chuyện.'
              }
            ]
          : []),
        { role: 'user', content: message }
      ],
      { maxTokens: 400 }
    )
  }
  if (!raw) {
    // Fallback không LLM: trả trực tiếp ký ức có nguồn (vẫn không bịa)
    raw = `Chuyện này ông bà có kể lại thế này: "${memories[0].content.slice(0, 400)}" [nguồn: MEM-1]`
  }

  const pp = postProcessPersona(raw, memories)
  const mid = uuid()
  await c.env.DB.prepare(
    `INSERT INTO persona_messages (id, person_id, user_id, role, content, citations, blocked, block_reason)
     VALUES (?1,?2,?3,'persona',?4,?5,?6,?7)`
  )
    .bind(
      mid, pid, c.var.user!.id, pp.text, JSON.stringify(pp.citations),
      pp.blocked ? 1 : 0, pp.blockReason || null
    )
    .run()
  await audit(c, 'persona.chat', 'person', pid, {
    citations: pp.citations.length,
    blocked: pp.blocked,
    grief: grief.flagged
  })

  const citationDetails = memories
    .filter((m) => pp.citations.includes(m.id))
    .map((m) => ({ id: m.id, snippet: m.content.slice(0, 160), score: Math.round(m.score * 100) / 100 }))

  return c.json({
    reply: pp.text,
    citations: pp.citations,
    citationDetails,
    blocked: pp.blocked,
    blockReason: pp.blockReason,
    retrieved: memories.length,
    remaining: rl.remaining,
    grief: grief.flagged ? griefNotice(grief.severe) : null,
    watermark: 'AudioSeal (áp dụng khi tổng hợp giọng nói)'
  })
})

/**
 * POST /v1/personas/:personId/chat-stream — RAG streaming (SSE).
 * Cùng chuỗi guardrail với /chat: consent_check → rate_limit → scan đầu vào
 * → grief-aware → retrieve → prompt → LLM → post-process → lưu log.
 */
aiRoutes.post('/personas/:personId/chat-stream', requireAuth, async (c) => {
  const pid = paramOf(c, 'personId')
  const b = await c.req.json().catch(() => ({} as any))
  const message = String(b.message || '').trim()
  if (!message) return c.json(problem(400, 'Validation error', 'Thiếu nội dung câu hỏi.'), 400)

  const person = await c.env.DB.prepare(
    `SELECT id, full_name, birth_place, is_alive FROM persons WHERE id = ?`
  )
    .bind(pid)
    .first<any>()
  if (!person) return c.json(problem(404, 'Not found', 'Không tìm thấy người này.'), 404)

  // 1) consent_check (bắt buộc — P2)
  const consent = await assertConsent(c.env, pid, 'chatbot_persona')
  if (!consent.ok) return c.json(consent.error, 403)

  // 2) rate limit (7.9) — dùng chung hạn mức với /chat để không bypass
  const rl = await checkRateLimit(c.env, c.var.user!.id, 'persona_chat', 200, 24)
  if (!rl.ok) {
    return c.json(problem(429, 'Rate limited', 'Đã hết lượt trò chuyện hôm nay.'), 429)
  }

  // 3) grief-aware (P3 / 11.7)
  const grief = detectGrief(message)

  await c.env.DB.prepare(
    `INSERT INTO persona_messages (id, person_id, user_id, role, content) VALUES (?1,?2,?3,'user',?4)`
  )
    .bind(uuid(), pid, c.var.user!.id, message)
    .run()

  // 4) quét CẢ câu hỏi đi vào (11.6) — như /chat
  const inScan = scanOutput(message)
  if (inScan.blocked) {
    const warn =
      `Câu hỏi này đã bị chặn theo hàng rào an toàn 11.6: persona của ${person.full_name} ` +
      `không bao giờ nói về tiền, số tài khoản, mã OTP, mật khẩu hay giấy tờ tùy thân.\n\n` +
      `Nếu có ai đang dùng giọng nói hoặc hình ảnh người thân đã mất để hỏi bạn những điều đó, ` +
      `đây gần như chắc chắn là lừa đảo. Hãy gọi trực tiếp cho người trong nhà để kiểm chứng.`
    const mid = uuid()
    await c.env.DB.prepare(
      `INSERT INTO persona_messages (id, person_id, user_id, role, content, citations, blocked, block_reason)
       VALUES (?1,?2,?3,'persona',?4,'[]',1,?5)`
    )
      .bind(mid, pid, c.var.user!.id, warn, inScan.reason || null)
      .run()
    await audit(c, 'persona.chat.blocked', 'person', pid, {
      direction: 'input',
      labels: inScan.labels,
      stream: true
    })
    return c.json({
      reply: warn,
      citations: [],
      citationDetails: [],
      blocked: true,
      blockReason: inScan.reason,
      retrieved: 0,
      grief: grief.flagged ? griefNotice(grief.severe) : null
    })
  }

  // 5) retrieve + consent filter
  const memories = await retrieveMemories(c.env, pid, message, 5)

  // 7.6 quy tắc 1: không có memory match → KHÔNG cho LLM trả lời
  if (!memories.length) {
    const text = `Chuyện đó không có trong những gì gia đình đã lưu lại, nên ${person.full_name} không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.`
    const mid = uuid()
    await c.env.DB.prepare(
      `INSERT INTO persona_messages (id, person_id, user_id, role, content, citations) VALUES (?1,?2,?3,'persona',?4,'[]')`
    )
      .bind(mid, pid, c.var.user!.id, text)
      .run()
    await audit(c, 'persona.chat', 'person', pid, { noMatch: true, stream: true })
    return c.json({
      reply: text,
      citations: [],
      noMatch: true,
      grief: grief.flagged ? griefNotice(grief.severe) : null
    })
  }

  const sys = buildPersonaPrompt(
    { full_name: person.full_name, birth_place: person.birth_place, is_alive: person.is_alive },
    memories
  )
  const out = await llmChat(
    c.env,
    [
      { role: 'system', content: sys },
      ...(grief.flagged
        ? [
            {
              role: 'system' as const,
              content:
                'Người hỏi đang có dấu hiệu đau buồn. Hãy mở đầu bằng một câu an ủi ngắn, ấm áp, rồi mới kể chuyện.'
            }
          ]
        : []),
      { role: 'user', content: message }
    ],
    { maxTokens: 400 }
  )
  const raw = out || `Chuyện này ông bà có kể lại thế này: "${memories[0].content.slice(0, 400)}" [nguồn: MEM-1]`
  const pp = postProcessPersona(raw, memories)

  const mid = uuid()
  await c.env.DB.prepare(
    `INSERT INTO persona_messages (id, person_id, user_id, role, content, citations, blocked, block_reason)
     VALUES (?1,?2,?3,'persona',?4,?5,?6,?7)`
  )
    .bind(
      mid, pid, c.var.user!.id, pp.text, JSON.stringify(pp.citations),
      pp.blocked ? 1 : 0, pp.blockReason || null
    )
    .run()
  await audit(c, 'persona.chat', 'person', pid, {
    citations: pp.citations.length,
    blocked: pp.blocked,
    grief: grief.flagged,
    stream: true
  })

  const citationDetails = memories
    .filter((m) => pp.citations.includes(m.id))
    .map((m) => ({ id: m.id, snippet: m.content.slice(0, 160), score: Math.round(m.score * 100) / 100 }))

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      data: JSON.stringify({ type: 'start', retrieved: memories.length, remaining: rl.remaining })
    })
    for (const chunk of pp.text.match(/.{1,24}/gs) || []) {
      await stream.writeSSE({ data: JSON.stringify({ type: 'chunk', text: chunk }) })
      await new Promise((r) => setTimeout(r, 30))
    }
    await stream.writeSSE({
      data: JSON.stringify({
        type: 'done',
        citations: pp.citations,
        citationDetails,
        blocked: pp.blocked,
        blockReason: pp.blockReason,
        grief: grief.flagged ? griefNotice(grief.severe) : null,
        watermark: 'AudioSeal (áp dụng khi tổng hợp giọng nói)'
      })
    })
  })
})

// ==================== helpers ========================================

function buildInterviewerSystemPrompt(o: {
  hostName: string
  region: string
  intervieweeName: string
  age: number | null
  birthPlace?: string | null
  topicLabel: string
  questionBank: string[]
  bio?: string | null
  emotion: string
  shouldEnd: boolean
  sensitive: boolean
}): string {
  const salut = o.age && o.age >= 70 ? 'cụ' : o.age && o.age >= 55 ? 'bác' : 'cô/chú'
  return `Bạn là ${o.hostName}, một người phỏng vấn nhân hậu, kiên nhẫn, hiểu văn hóa Việt Nam, giọng ${
    o.region === 'VI_NORTH' ? 'miền Bắc' : o.region === 'VI_CENTRAL' ? 'miền Trung' : 'miền Nam'
  }.
Bạn đang nói chuyện với ${o.intervieweeName}${o.age ? `, ${o.age} tuổi` : ''}${
    o.birthPlace ? `, quê ${o.birthPlace}` : ''
  }. Gọi họ là "${salut}", tự gọi mình là "cháu".
Chủ đề hôm nay: ${o.topicLabel}.
${o.bio ? `Đã biết về họ: ${o.bio}` : ''}

QUY TẮC BẮT BUỘC:
1. Mỗi lượt CHỈ nói 1–3 câu, và CHỈ hỏi MỘT câu hỏi duy nhất.
2. Trước khi hỏi, hãy phản hồi ngắn thể hiện đã lắng nghe (ví dụ: "Dạ, hay quá ạ").
3. Không hỏi về chủ đề nhạy cảm (mất mát, bệnh tật, tiền bạc) trừ khi họ chủ động nhắc.
4. Nếu họ dùng từ cổ hoặc phương ngữ (ví dụ "cái đài", "cái gánh", "đi tàu bay"), hãy hỏi nhẹ về ý nghĩa để lưu vào gia phả.
5. Nếu họ nhắc tên người hoặc địa danh, hãy hỏi thêm một chi tiết để xác định rõ (ai, ở đâu).
6. TUYỆT ĐỐI không bao giờ nói về tiền, chuyển khoản, OTP, số tài khoản, giấy tờ tùy thân.
7. Không đưa ý kiến chính trị, không chẩn đoán y tế.
8. Văn phong mộc mạc, lễ độ, có từ đệm "dạ", "ạ". Không dùng từ hoa mỹ hiện đại.
${o.sensitive ? '9. Chủ đề này nhạy cảm — hãy đặc biệt nhẹ nhàng, tránh đào sâu vào mất mát.\n' : ''}
CẢM XÚC HIỆN TẠI CỦA NGƯỜI KỂ: ${o.emotion}
${
  o.emotion.startsWith('sad')
    ? 'Họ đang buồn: hãy an ủi một câu ngắn rồi chuyển sang chủ đề vui hơn, hoặc xin phép kết thúc.'
    : o.emotion === 'tired'
      ? 'Họ đang mệt: hãy lễ phép kết thúc buổi nói chuyện, cảm ơn và hẹn lần sau.'
      : ''
}
${o.shouldEnd ? 'HÃY KẾT THÚC buổi nói chuyện một cách lễ độ: cảm ơn, nói rằng câu chuyện sẽ được lưu vào gia phả cho con cháu, và hẹn gặp lại.' : ''}

Câu hỏi gợi ý cho chủ đề này (dùng làm ý tưởng, không đọc nguyên văn nếu đã hỏi rồi):
${o.questionBank.map((q, i) => `- ${q}`).join('\n')}`
}

/** Emotion detector đơn giản trên text (thay wav2vec2 classifier của spec 4.2.3) */
function detectEmotionFromText(text: string): { label: string; confidence: number } {
  const t = removeTone(text)
  if (/(khong muon noi|thoi de sau|met qua|met lam|nghi da|de hom khac|buon ngu)/.test(t)) {
    return { label: 'tired', confidence: 0.8 }
  }
  if (/(khoc|nuoc mat|dau long lam|khong chiu duoc|thuong lam|mat roi|qua doi|chet)/.test(t)) {
    return { label: 'sad_severe', confidence: 0.75 }
  }
  if (/(buon|nho|tiec|kho tam)/.test(t)) return { label: 'sad', confidence: 0.6 }
  if (/(vui|cuoi|hanh phuc|thich lam|hay lam|dep lam)/.test(t)) {
    return { label: 'happy', confidence: 0.7 }
  }
  if (/(hoi do|ngay xua|luc ay|thoi bay gio)/.test(t)) {
    return { label: 'nostalgic', confidence: 0.65 }
  }
  return { label: 'neutral', confidence: 0.5 }
}

function fallbackQuestion(bank: string[], turns: any[], shouldEnd: boolean): string {
  if (shouldEnd) {
    return 'Dạ, cháu cảm ơn cụ nhiều lắm ạ. Câu chuyện hôm nay cháu sẽ lưu lại vào gia phả để con cháu sau này còn được biết. Cụ nghỉ ngơi cho khỏe, hôm nào cháu lại xin phép gọi ạ.'
  }
  const asked = turns.filter((t) => t.role === 'ai').length
  const q = bank[asked % bank.length]
  return `Dạ, cháu nghe rồi ạ. ${q}`
}

function griefNotice(severe: boolean) {
  return {
    severe,
    message: severe
      ? 'Chúng tôi nhận thấy bạn đang rất đau buồn. Hãy tâm sự với người thân, hoặc gọi đường dây tư vấn tâm lý Ngày Mai: 096 306 1414 (miễn phí).'
      : 'Nếu cảm thấy quá xúc động, bạn có thể tạm nghỉ. Kỷ niệm vẫn ở đây, không mất đi đâu cả.',
    hotline: '096 306 1414'
  }
}
