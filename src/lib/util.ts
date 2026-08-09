/** Utilities dùng chung — chỉ Web APIs (chạy trên Cloudflare Workers) */

export function uuid(): string {
  return crypto.randomUUID()
}

/** Bỏ dấu tiếng Việt để phục vụ search không dấu (spec 6.4 contentNoTone) */
export function removeTone(s: string): string {
  if (!s) return ''
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Hash mật khẩu: PBKDF2-SHA256 qua Web Crypto (không dùng node:crypto) */
export async function hashPassword(password: string, saltHex?: string): Promise<string> {
  const salt = saltHex
    ? hexToBytes(saltHex)
    : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key,
    256
  )
  return `pbkdf2$100000$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(bits))}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false
  const parts = stored.split('$')
  if (parts.length !== 4) return false
  const computed = await hashPassword(password, parts[2])
  return timingSafeEqual(computed, stored)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function bytesToHex(b: Uint8Array): string {
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16)
  return out
}

export function json<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try {
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}

/** RFC 7807 Problem Details (spec 7.8) */
export function problem(
  status: number,
  title: string,
  detail?: string,
  extra?: Record<string, unknown>
) {
  return {
    type: `https://giasuky.com/problems/${status}`,
    title,
    status,
    ...(detail ? { detail } : {}),
    ...extra
  }
}

export function nowIso(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

export function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Cosine similarity cho vector search (thay Qdrant ở quy mô MVP) */
export function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (!na || !nb) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

/**
 * Fallback embedding cục bộ (hashing trick) khi không có LLM API key.
 * Đủ để demo semantic-ish retrieval; production dùng multilingual-e5-large (spec 6.5).
 */
export function localEmbed(text: string, dim = 256): number[] {
  const v = new Array(dim).fill(0)
  const toks = removeTone(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]
    v[hashStr(t) % dim] += 1
    if (i + 1 < toks.length) v[hashStr(t + '_' + toks[i + 1]) % dim] += 0.6
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / norm)
}

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function ageOf(birth?: string | null, death?: string | null): number | null {
  if (!birth) return null
  const b = new Date(birth)
  if (isNaN(b.getTime())) return null
  const end = death ? new Date(death) : new Date()
  if (isNaN(end.getTime())) return null
  let a = end.getUTCFullYear() - b.getUTCFullYear()
  const m = end.getUTCMonth() - b.getUTCMonth()
  if (m < 0 || (m === 0 && end.getUTCDate() < b.getUTCDate())) a--
  return a >= 0 ? a : null
}

export function yearOf(d?: string | null): string {
  if (!d) return '?'
  const m = /^(\d{4})/.exec(d)
  return m ? m[1] : '?'
}
