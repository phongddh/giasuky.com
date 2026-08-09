/**
 * Kiểm soát truy cập (access control) — lớp an toàn Giai đoạn 1.
 *
 * Mô hình 2 chế độ dựa trên biến môi trường APP_ENV:
 *  - APP_ENV !== 'development' (MẶC ĐỊNH, tức production): NGHIÊM NGẶT.
 *    Mọi dữ liệu của dòng họ (đọc và ghi) chỉ dành cho thành viên của dòng họ đó
 *    (clan_members). Khách chưa đăng nhập bị chặn toàn bộ.
 *  - APP_ENV === 'development': CHẾ ĐỘ MỞ cho sandbox/demo — giữ hành vi cũ
 *    (khách xem được clan demo; yêu cầu ghi chỉ cần đăng nhập).
 */
import type { Context } from 'hono'
import type { AppEnv } from './types'
import { problem } from './util'

export function isOpenAccess(c: Context<AppEnv>): boolean {
  return c.env.APP_ENV === 'development'
}

export async function userBelongsToClan(c: Context<AppEnv>, clanId: string): Promise<boolean> {
  if (!c.var.user || !clanId) return false
  const row = await c.env.DB.prepare(
    `SELECT 1 FROM clan_members WHERE clan_id = ? AND user_id = ? LIMIT 1`
  )
    .bind(clanId, c.var.user.id)
    .first()
  return !!row
}

/** Cho phép XEM dữ liệu clan: thành viên ở mọi môi trường; ngoài ra chỉ ở chế độ mở */
export async function canViewClan(c: Context<AppEnv>, clanId: string | null): Promise<boolean> {
  if (!clanId) return false
  if (await userBelongsToClan(c, clanId)) return true
  return isOpenAccess(c)
}

/**
 * Danh sách clan người dùng được phép xem.
 * Trả null khi chế độ mở (không lọc), Set rỗng khi chế độ nghiêm ngặt + chưa đăng nhập.
 */
export async function visibleClanIds(c: Context<AppEnv>): Promise<Set<string> | null> {
  if (isOpenAccess(c)) return null
  if (!c.var.user) return new Set()
  const rows = await c.env.DB.prepare(
    `SELECT clan_id FROM clan_members WHERE user_id = ?`
  )
    .bind(c.var.user.id)
    .all<any>()
  return new Set((rows.results || []).map((r) => r.clan_id))
}

/**
 * Clan hiện tại theo ngữ cảnh request: param clanId (nếu được phép),
 * rồi đến clan của user, rồi đến clan demo (chỉ chế độ mở). Không được → null.
 */
export async function resolveClanId(c: Context<AppEnv>): Promise<string | null> {
  const q = c.req.query('clanId')
  if (q) return (await canViewClan(c, q)) ? q : null
  // Multi-clan: nếu param không có, ưu tiên clan đầu tiên user thuộc
  if (c.var.user?.clan_ids?.length) return c.var.user.clan_ids[0]
  if (c.var.user?.clan_id) return c.var.user.clan_id
  if (isOpenAccess(c)) {
    const row = await c.env.DB.prepare(`SELECT id FROM clans ORDER BY created_at LIMIT 1`).first<any>()
    return row?.id ?? null
  }
  return null
}

/** Gate cho phép XEM clan; trả Response lỗi nếu không được phép */
export async function guardClanView(c: Context<AppEnv>, clanId: string | null): Promise<Response | null> {
  if (await canViewClan(c, clanId)) return null
  return c.json(
    problem(403, 'Forbidden', 'Bạn không có quyền xem dữ liệu của dòng họ này.'),
    403
  )
}

/** Gate cho yêu cầu GHI vào clan: cần đăng nhập; chế độ nghiêm ngặt cần là thành viên */
export async function guardClanWrite(c: Context<AppEnv>, clanId: string | null): Promise<Response | null> {
  if (!c.var.user) {
    return c.json(problem(401, 'Unauthorized', 'Vui lòng đăng nhập để tiếp tục.'), 401)
  }
  if (isOpenAccess(c)) return null
  if (clanId && (await userBelongsToClan(c, clanId))) return null
  return c.json(
    problem(403, 'Forbidden', 'Bạn không phải thành viên của dòng họ này nên không thể thực hiện thao tác.'),
    403
  )
}

// ------------------------------------------------------------------
// Resolve clan_id của từng loại tài nguyên (chống IDOR xuyên clan)
// ------------------------------------------------------------------
async function clanOf(c: Context<AppEnv>, table: string, id: string | undefined): Promise<string | null> {
  if (!id) return null
  const row = await c.env.DB.prepare(`SELECT clan_id AS cid FROM ${table} WHERE id = ?`)
    .bind(id)
    .first<any>()
  return row?.cid ?? null
}

export const clanOfPerson = (c: Context<AppEnv>, id: string | undefined) => clanOf(c, 'persons', id)
export const clanOfMemory = (c: Context<AppEnv>, id: string | undefined) => clanOf(c, 'memories', id)
export const clanOfEvent = (c: Context<AppEnv>, id: string | undefined) => clanOf(c, 'events', id)
export const clanOfAdvice = (c: Context<AppEnv>, id: string | undefined) => clanOf(c, 'advices', id)
export const clanOfAltar = (c: Context<AppEnv>, id: string | undefined) => clanOf(c, 'altars', id)
export const clanOfRitual = (c: Context<AppEnv>, id: string | undefined) => clanOf(c, 'rituals', id)
export const clanOfInterview = (c: Context<AppEnv>, id: string | undefined) => clanOf(c, 'interview_sessions', id)

export async function clanOfContradiction(c: Context<AppEnv>, id: string | undefined): Promise<string | null> {
  if (!id) return null
  const row = await c.env.DB.prepare(
    `SELECT e.clan_id AS cid FROM contradictions ct JOIN events e ON e.id = ct.event_id WHERE ct.id = ?`
  )
    .bind(id)
    .first<any>()
  return row?.cid ?? null
}

export async function clanOfConsentRecord(c: Context<AppEnv>, id: string | undefined): Promise<string | null> {
  if (!id) return null
  const row = await c.env.DB.prepare(
    `SELECT p.clan_id AS cid FROM consent_records cr JOIN persons p ON p.id = cr.subject_person_id WHERE cr.id = ?`
  )
    .bind(id)
    .first<any>()
  return row?.cid ?? null
}

export async function clanOfWill(c: Context<AppEnv>, id: string | undefined): Promise<string | null> {
  if (!id) return null
  const row = await c.env.DB.prepare(
    `SELECT p.clan_id AS cid FROM digital_wills w JOIN persons p ON p.id = w.testator_person_id WHERE w.id = ?`
  )
    .bind(id)
    .first<any>()
  return row?.cid ?? null
}

export async function clanOfRestRequest(c: Context<AppEnv>, id: string | undefined): Promise<string | null> {
  if (!id) return null
  const row = await c.env.DB.prepare(
    `SELECT p.clan_id AS cid FROM rest_requests rr JOIN persons p ON p.id = rr.subject_person_id WHERE rr.id = ?`
  )
    .bind(id)
    .first<any>()
  return row?.cid ?? null
}
