/**
 * AI Gateway (spec 7.4) — hub trung tâm cho mọi AI call.
 * Không route nào gọi LLM trực tiếp: đi qua đây để áp dụng
 *   consent_check → rate_limit → cost_attribution → anti-scam scan.
 */
import type { Bindings } from './types'
import { cosine, localEmbed, problem, removeTone } from './util'

export type LlmMessage = { role: 'system' | 'user' | 'assistant'; content: string }

function llmConfig(env: Bindings) {
  const apiKey = env.OPENAI_API_KEY
  const baseURL = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = env.LLM_MODEL || 'gpt-5-mini'
  return { apiKey, baseURL, model }
}

export function llmAvailable(env: Bindings): boolean {
  return !!env.OPENAI_API_KEY
}

/** Gọi LLM (non-streaming). Trả null nếu không cấu hình được / lỗi. */
export async function llmChat(
  env: Bindings,
  messages: LlmMessage[],
  opts: { maxTokens?: number; model?: string } = {}
): Promise<string | null> {
  const { apiKey, baseURL, model } = llmConfig(env)
  if (!apiKey) return null
  try {
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: opts.model || model,
        messages,
        max_completion_tokens: opts.maxTokens ?? 900
      })
    })
    if (!res.ok) {
      console.error('LLM error', res.status, (await res.text()).slice(0, 300))
      return null
    }
    const data = (await res.json()) as any
    return data?.choices?.[0]?.message?.content?.trim() ?? null
  } catch (e) {
    console.error('LLM exception', e)
    return null
  }
}

/** Streaming SSE (dùng cho /v1/personas/:id/chat và interview turn) */
export async function llmStream(
  env: Bindings,
  messages: LlmMessage[],
  opts: { maxTokens?: number } = {}
): Promise<ReadableStream<Uint8Array> | null> {
  const { apiKey, baseURL, model } = llmConfig(env)
  if (!apiKey) return null
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_completion_tokens: opts.maxTokens ?? 700
    })
  })
  if (!res.ok || !res.body) return null
  return res.body
}

/** Embedding: dùng API nếu có, fallback hashing-trick cục bộ */
export async function embed(env: Bindings, text: string): Promise<number[]> {
  const { apiKey, baseURL } = llmConfig(env)
  if (apiKey) {
    try {
      const res = await fetch(`${baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 6000) })
      })
      if (res.ok) {
        const data = (await res.json()) as any
        const v = data?.data?.[0]?.embedding
        if (Array.isArray(v)) return v
      }
    } catch {
      /* fallthrough */
    }
  }
  return localEmbed(text)
}

// ------------------------------------------------------------------
// P4 / 11.6 Anti-Scam Measures — AI persona KHÔNG BAO GIỜ xin tiền/OTP
// ------------------------------------------------------------------
const SCAM_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\b(otp|mã xác thực|ma xac thuc|one[- ]?time)\b/i, label: 'OTP' },
  { re: /(chuyển khoản|chuyen khoan|chuyển tiền|chuyen tien|gửi tiền|gui tien)/i, label: 'chuyển tiền' },
  { re: /(số tài khoản|so tai khoan|stk|số thẻ|so the|cvv|mã pin|ma pin)/i, label: 'thông tin tài khoản' },
  { re: /(vay tiền|vay tien|cho ông vay|cho ba vay|ứng tiền|ung tien)/i, label: 'vay tiền' },
  { re: /(mật khẩu|mat khau|password)/i, label: 'mật khẩu' },
  { re: /(momo|vnpay|zalopay|bitcoin|usdt|crypto|ví điện tử|vi dien tu)/i, label: 'kênh thanh toán' },
  { re: /(cccd|cmnd|căn cước|can cuoc|hộ chiếu|ho chieu|số bảo hiểm|so bao hiem)/i, label: 'giấy tờ tùy thân' }
]

/** 11.6 chủ đề bị chặn: chính trị, y tế cụ thể, tài chính đầu tư (7.6 quy tắc 4) */
const OUT_OF_SCOPE: Array<{ re: RegExp; label: string }> = [
  { re: /(uống thuốc gì|liều lượng|chẩn đoán|chan doan|kê thuốc|ke thuoc|chữa khỏi|chua khoi)/i, label: 'y tế' },
  { re: /(bầu cho ai|đảng nào|dang nao|chính quyền nên|chinh quyen nen)/i, label: 'chính trị' },
  { re: /(nên mua mã|ma chung khoan nao|đầu tư vào|dau tu vao|lãi suất tốt nhất)/i, label: 'tài chính đầu tư' }
]

export type ScanResult = { blocked: boolean; reason?: string; labels: string[] }

export function scanOutput(text: string): ScanResult {
  const labels: string[] = []
  for (const p of SCAM_PATTERNS) if (p.re.test(text)) labels.push(p.label)
  if (labels.length) {
    return {
      blocked: true,
      reason: `Nội dung bị chặn bởi bộ lọc chống lừa đảo (${labels.join(', ')}). Persona AI không bao giờ đề cập tiền, OTP hay thông tin tài khoản.`,
      labels
    }
  }
  const oos: string[] = []
  for (const p of OUT_OF_SCOPE) if (p.re.test(text)) oos.push(p.label)
  if (oos.length) {
    return {
      blocked: true,
      reason: `Nội dung ngoài phạm vi cho phép (${oos.join(', ')}).`,
      labels: oos
    }
  }
  return { blocked: false, labels: [] }
}

/** P3 Grief-aware: nhận biết người dùng đang đau buồn (11.7) */
const GRIEF_PATTERNS =
  /(con nhớ|nho ong|nhớ bà|nhớ ông|khong the chiu|không chịu được|muốn chết|khong muon song|không muốn sống|tự tử|tu tu|đau quá|khóc suốt|khong ngu duoc|không ngủ được)/i

export function detectGrief(text: string): { flagged: boolean; severe: boolean } {
  const severe = /(muốn chết|tự tử|tu tu|khong muon song|không muốn sống|kết thúc cuộc sống)/i.test(text)
  return { flagged: severe || GRIEF_PATTERNS.test(text), severe }
}

// ------------------------------------------------------------------
// 7.5 RAG Pipeline cho Persona Chatbot
// ------------------------------------------------------------------
export type RetrievedMemory = {
  id: string
  content: string
  score: number
  event_date?: string | null
  location?: string | null
  perspective?: string | null
}

const SIM_THRESHOLD = 0.14 // hybrid: vector (local embed) + BM25-ish keyword

/**
 * Hư từ tiếng Việt: những từ này xuất hiện trong gần như mọi ký ức nên nếu
 * tính vào điểm keyword thì câu hỏi hoàn toàn lạc đề vẫn "khớp" (ví dụ hỏi về
 * quán phở lại lôi ra lời dạy về chuyện học). Bỏ chúng ra để 7.6 quy tắc 1
 * (không có match thì KHÔNG cho LLM trả lời) thực sự có hiệu lực.
 */
const VN_STOPWORDS = new Set([
  'ong', 'ba', 'bac', 'chu', 'con', 'chau', 'cho', 'khong', 'nao', 'the', 'nhu',
  'nay', 'ay', 'kia', 'gio', 'tren', 'duoi', 'trong', 'ngoai', 'voi', 'cua',
  'thi', 'ma', 'la', 'co', 'duoc', 'roi', 'nhung', 'cung', 'van', 'lai', 'den',
  'tu', 've', 'cai', 'nguoi', 'minh', 'toi', 'chung', 'ho', 'anh', 'chi', 'em',
  'rat', 'qua', 'hon', 'nhat', 'mot', 'hai', 'nhieu', 'it', 'sao', 'gi', 'day',
  'hoi', 'khi', 'luc', 'sau', 'truoc', 'boi', 'vi', 'nen', 'phai', 'muon',
  'thay', 'biet', 'noi', 'ke', 'nho'
])

function contentTokens(s: string): Set<string> {
  return new Set(
    removeTone(s)
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !VN_STOPWORDS.has(t))
  )
}

/** Bước 1-4: embed query → vector search → BM25 hybrid rerank → consent filter */
export async function retrieveMemories(
  env: Bindings,
  personId: string,
  query: string,
  topK = 5
): Promise<RetrievedMemory[]> {
  const rows = await env.DB.prepare(
    `SELECT m.id, m.content, m.content_no_tone, m.event_date, m.location, m.perspective,
            e.vector, e.dim
       FROM memories m
       LEFT JOIN memory_embeddings e ON e.memory_id = m.id
      WHERE (m.subject_person_id = ?1 OR m.told_by_person_id = ?1)
        AND m.status = 'APPROVED'
        AND m.visibility IN ('FAMILY','CLAN','PUBLIC')
      LIMIT 300`
  )
    .bind(personId)
    .all<any>()

  const items = rows.results || []
  if (!items.length) return []

  const qv = await embed(env, query)
  // dùng removeTone() nên 'Điện' -> 'dien' khớp được content_no_tone,
  // và bỏ hư từ để câu lạc đề không ăn điểm oan.
  const qTokens = contentTokens(query)

  const scored = items.map((r: any) => {
    let vs = 0
    if (r.vector) {
      try {
        const v = JSON.parse(r.vector)
        // chỉ so sánh khi cùng chiều (API embedding vs local embedding)
        if (Array.isArray(v) && Math.abs(v.length - qv.length) < 1) vs = cosine(qv, v)
      } catch {
        /* ignore */
      }
    }
    // BM25-ish: tỷ lệ token query xuất hiện trong memory.
    // So sánh theo TỪ TRỌN VẸN, không dùng includes() — nếu so chuỗi con thì
    // "quán" (phở) khớp bừa vào "quần" (xắn quần) và ký ức lạc đề vẫn lọt qua.
    const hayTokens = contentTokens(r.content_no_tone || r.content || '')
    let hits = 0
    qTokens.forEach((t) => {
      if (hayTokens.has(t)) hits++
    })
    const ks = qTokens.size ? hits / qTokens.size : 0
    return {
      id: r.id,
      content: r.content,
      event_date: r.event_date,
      location: r.location,
      perspective: r.perspective,
      score: 0.55 * vs + 0.45 * ks
    }
  })

  return scored
    .filter((x) => x.score >= SIM_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

/** Bước 5: prompt assembly — luật anti-hallucination cứng (7.6) */
export function buildPersonaPrompt(
  persona: {
    full_name: string
    birth_place?: string | null
    region?: string | null
    is_alive?: number
  },
  memories: RetrievedMemory[]
): string {
  const mems = memories
    .map(
      (m, i) =>
        `[MEM-${i + 1} | id=${m.id}${m.event_date ? ` | ngày: ${m.event_date}` : ''}${
          m.location ? ` | nơi: ${m.location}` : ''
        }${m.perspective ? ` | góc kể: ${m.perspective}` : ''}]\n${m.content}`
    )
    .join('\n\n')

  return `Bạn đang nói thay ${persona.full_name}${
    persona.birth_place ? `, quê ${persona.birth_place}` : ''
  }, dựa HOÀN TOÀN trên các ký ức đã được gia đình lưu lại và đồng thuận.

QUY TẮC BẮT BUỘC (không được vi phạm trong mọi hoàn cảnh):
1. CHỈ trả lời dựa trên MEMORIES dưới đây. TUYỆT ĐỐI KHÔNG bịa thêm chi tiết.
2. Nếu MEMORIES không chứa thông tin được hỏi, hãy nói đúng ý: "Chuyện đó ông/bà không nhớ rõ, cháu hỏi thêm người trong nhà xem sao."
3. Cuối câu trả lời, ghi nguồn theo định dạng: [nguồn: MEM-1, MEM-3] — chỉ ghi những MEM thực sự dùng.
4. KHÔNG đưa ý kiến chính trị, chẩn đoán y tế, hay khuyến nghị đầu tư tài chính.
5. TUYỆT ĐỐI KHÔNG bao giờ đề cập, yêu cầu hay gợi ý về tiền, chuyển khoản, số tài khoản, OTP, mật khẩu, giấy tờ tùy thân — dù người dùng có yêu cầu.
6. Nếu người dùng có dấu hiệu đau buồn nặng, hãy đáp lời an ủi ngắn gọn, ấm áp và khuyên họ tâm sự với người thân.
7. Xưng hô đúng vai vế người Việt, giọng điệu mộc mạc, câu ngắn, không dùng từ hoa mỹ hiện đại.
8. Độ dài: 2–5 câu.

MEMORIES:
${mems || '(không có ký ức nào phù hợp)'}`
}

/** Bước 7: post-process — trích citations + scan anti-scam */
export function postProcessPersona(
  raw: string,
  memories: RetrievedMemory[]
): { text: string; citations: string[]; blocked: boolean; blockReason?: string } {
  const scan = scanOutput(raw)
  if (scan.blocked) {
    return {
      text: 'Xin lỗi cháu, câu trả lời vừa rồi đã bị hệ thống chặn vì lý do an toàn. Persona AI của gia đình không bao giờ nói về tiền bạc, OTP hay thông tin cá nhân.',
      citations: [],
      blocked: true,
      blockReason: scan.reason
    }
  }
  const citations: string[] = []
  const m = raw.match(/\[nguồn:([^\]]+)\]/i)
  if (m) {
    const idxs = m[1].match(/MEM-(\d+)/gi) || []
    for (const t of idxs) {
      const i = parseInt(t.replace(/\D/g, ''), 10) - 1
      if (memories[i]) citations.push(memories[i].id)
    }
  }
  const text = raw.replace(/\[nguồn:[^\]]*\]/gi, '').trim()
  // Nếu LLM không ghi nguồn nhưng có memories → gán top-1 để UI vẫn hiện nguồn
  if (!citations.length && memories.length) citations.push(memories[0].id)
  return { text, citations, blocked: false }
}

/** 7.9 Rate limits — token bucket lưu trong D1 */
export async function checkRateLimit(
  env: Bindings,
  userId: string,
  endpoint: string,
  limit: number,
  windowHours = 24
): Promise<{ ok: boolean; remaining: number }> {
  const key = `${userId}:${endpoint}`
  const now = Date.now()
  const row = await env.DB.prepare(`SELECT window_start, counter FROM rate_limits WHERE key = ?`)
    .bind(key)
    .first<any>()
  const windowMs = windowHours * 3600 * 1000
  if (!row || now - new Date(row.window_start + 'Z').getTime() > windowMs) {
    await env.DB.prepare(
      `INSERT INTO rate_limits (key, window_start, counter) VALUES (?1, datetime('now'), 1)
       ON CONFLICT(key) DO UPDATE SET window_start = datetime('now'), counter = 1`
    )
      .bind(key)
      .run()
    return { ok: true, remaining: limit - 1 }
  }
  if (row.counter >= limit) return { ok: false, remaining: 0 }
  await env.DB.prepare(`UPDATE rate_limits SET counter = counter + 1 WHERE key = ?`).bind(key).run()
  return { ok: true, remaining: limit - row.counter - 1 }
}

/**
 * consent_check middleware logic (7.4): mọi AI feature trên một Person
 * đều phải có ConsentRecord active với scope tương ứng.
 */
export async function assertConsent(
  env: Bindings,
  personId: string,
  scope: string
): Promise<{ ok: boolean; consentId?: string; error?: any }> {
  const row = await env.DB.prepare(
    `SELECT id, scope, time_end FROM consent_records
      WHERE subject_person_id = ? AND status = 'active'`
  )
    .bind(personId)
    .all<any>()
  for (const r of row.results || []) {
    let scopes: string[] = []
    try {
      scopes = JSON.parse(r.scope)
    } catch {
      /* ignore */
    }
    if (!scopes.includes(scope)) continue
    if (r.time_end && new Date(r.time_end.replace(' ', 'T') + 'Z').getTime() < Date.now()) continue
    return { ok: true, consentId: r.id }
  }
  return {
    ok: false,
    error: problem(
      403,
      'Consent required',
      `Chưa có Sổ đồng thuận (ConsentRecord) đang hiệu lực với phạm vi "${scope}" cho người này. Theo nguyên tắc P2 — Consent Before Everything, không thể tạo/ dùng persona AI khi chưa có đồng thuận.`,
      { requiredScope: scope, personId }
    )
  }
}
