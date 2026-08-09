/**
 * tools/gen-seed.mjs — sinh ra seed.sql cho Gia Sử Ký
 *
 * Vì mật khẩu dùng PBKDF2 (Web Crypto) và embedding dùng localEmbed(),
 * seed phải được sinh bằng đúng thuật toán trong src/lib/util.ts.
 * Chạy: node tools/gen-seed.mjs > seed.sql
 */
import crypto from 'node:crypto'

// ---------------------------------------------------------------- helpers
function pbkdf2(pw) {
  const salt = crypto.randomBytes(16)
  const bits = crypto.pbkdf2Sync(Buffer.from(pw, 'utf8'), salt, 100000, 32, 'sha256')
  return `pbkdf2$100000$${salt.toString('hex')}$${bits.toString('hex')}`
}
const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex')

function removeTone(s) {
  if (!s) return ''
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}
function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}
function localEmbed(text, dim = 256) {
  const v = new Array(dim).fill(0)
  const toks = removeTone(text).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]
    v[hashStr(t) % dim] += 1
    if (i + 1 < toks.length) v[hashStr(t + '_' + toks[i + 1]) % dim] += 0.6
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => Number((x / norm).toFixed(6)))
}

const q = (v) => {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? '1' : '0'
  return "'" + String(v).replace(/'/g, "''") + "'"
}
const J = (o) => q(JSON.stringify(o))

// ---- lunar (port từ src/lib/lunar.ts — thuật toán Hồ Ngọc Đức) ----------
const PI = Math.PI
function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12)
  const y = yy + 4800 - a
  const m = mm + 12 * a - 3
  let jd =
    dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) -
    Math.floor(y / 100) + Math.floor(y / 400) - 32045
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083
  }
  return jd
}
function jdToDate(jd) {
  let a, b, c
  if (jd > 2299160) {
    a = jd + 32044
    b = Math.floor((4 * a + 3) / 146097)
    c = a - Math.floor((b * 146097) / 4)
  } else {
    b = 0
    c = jd + 32082
  }
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor((1461 * d) / 4)
  const m = Math.floor((5 * e + 2) / 153)
  const day = e - Math.floor((153 * m + 2) / 5) + 1
  const month = m + 3 - 12 * Math.floor(m / 10)
  const year = b * 100 + d - 4800 + Math.floor(m / 10)
  return [day, month, year]
}
function newMoon(k) {
  const T = k / 1236.85
  const T2 = T * T
  const T3 = T2 * T
  const dr = PI / 180
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr)
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M)
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr)
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr)
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr))
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M))
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr))
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M))
  let deltat
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2
  }
  return Jd1 + C1 - deltat
}
function sunLongitude(jdn) {
  const T = (jdn - 2451545.0) / 36525
  const T2 = T * T
  const dr = PI / 180
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M)
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M)
  let L = L0 + DL
  L = L * dr
  L = L - PI * 2 * Math.floor(L / (PI * 2))
  return L
}
const getSunLongitude = (dayNumber, tz) => Math.floor((sunLongitude(dayNumber - 0.5 - tz / 24) / PI) * 6)
const getNewMoonDay = (k, tz) => Math.floor(newMoon(k) + 0.5 + tz / 24)
function getLunarMonth11(yy, tz) {
  const off = jdFromDate(31, 12, yy) - 2415021
  const k = Math.floor(off / 29.530588853)
  let nm = getNewMoonDay(k, tz)
  const sunLong = getSunLongitude(nm, tz)
  if (sunLong >= 9) nm = getNewMoonDay(k - 1, tz)
  return nm
}
function getLeapMonthOffset(a11, tz) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5)
  let last
  let i = 1
  let arc = getSunLongitude(getNewMoonDay(k + i, tz), tz)
  do {
    last = arc
    i++
    arc = getSunLongitude(getNewMoonDay(k + i, tz), tz)
  } while (arc !== last && i < 14)
  return i - 1
}
function solarToLunar(dd, mm, yy, tz = 7) {
  const dayNumber = jdFromDate(dd, mm, yy)
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853)
  let monthStart = getNewMoonDay(k + 1, tz)
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, tz)
  let a11 = getLunarMonth11(yy, tz)
  let b11 = a11
  let lunarYear
  if (a11 >= monthStart) {
    lunarYear = yy
    a11 = getLunarMonth11(yy - 1, tz)
  } else {
    lunarYear = yy + 1
    b11 = getLunarMonth11(yy + 1, tz)
  }
  const lunarDay = dayNumber - monthStart + 1
  const diff = Math.floor((monthStart - a11) / 29)
  let lunarLeap = 0
  let lunarMonth = diff + 11
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, tz)
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10
      if (diff === leapMonthDiff) lunarLeap = 1
    }
  }
  if (lunarMonth > 12) lunarMonth = lunarMonth - 12
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap }
}
function lunarToSolar(lunarD, lunarM, lunarY, lunarLeap = 0, tz = 7) {
  let a11, b11
  if (lunarM < 11) {
    a11 = getLunarMonth11(lunarY - 1, tz)
    b11 = getLunarMonth11(lunarY, tz)
  } else {
    a11 = getLunarMonth11(lunarY, tz)
    b11 = getLunarMonth11(lunarY + 1, tz)
  }
  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853)
  let off = lunarM - 11
  if (off < 0) off += 12
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, tz)
    let leapM = leapOff - 2
    if (leapM < 0) leapM += 12
    if (lunarLeap !== 0 && lunarM !== leapM) return null
    else if (lunarLeap !== 0 || off >= leapOff) off += 1
  }
  const monthStart = getNewMoonDay(k + off, tz)
  return jdToDate(monthStart + lunarD - 1) // [d, m, y]
}

// ---------------------------------------------------------------- ids
let n = 0
const id = (p) => `${p}-${String(++n).padStart(4, '0')}-giasuky`
const OUT = []
const w = (s) => OUT.push(s)

// ---------------------------------------------------------------- data
const CLAN = 'clan-nguyen-dongngac'
const NOW_Y = new Date().getUTCFullYear()

// ---- users
const U = {
  tung: { id: 'user-tung', email: 'tung.nguyen@example.com', name: 'Nguyễn Văn Tùng', role: 'patriarch', elder: 0 },
  hoa: { id: 'user-hoa', email: 'hoa.nguyen@example.com', name: 'Nguyễn Thị Hòa', role: 'council', elder: 0 },
  minh: { id: 'user-minh', email: 'minh.nguyen@example.com', name: 'Nguyễn Văn Minh', role: 'member', elder: 0 },
  ba: { id: 'user-ba', email: 'ba.nguyen@example.com', name: 'Nguyễn Thị Ba', role: 'council', elder: 1 }
}

// ---- persons: 5 đời họ Nguyễn (Đông Ngạc, Từ Liêm, Hà Nội)
// gen 1
const P = {}
const person = (key, o) => { P[key] = { id: 'p-' + key, ...o }; return P[key] }

person('to', {
  name: 'Nguyễn Phúc Đức', gender: 'M', gen: 1, birth: '1902-03-11', death: '1978-11-02',
  bp: 'Đông Ngạc, Từ Liêm, Hà Nội', dp: 'Đông Ngạc, Từ Liêm, Hà Nội', alive: 0,
  ld: 3, lm: 10, occ: ['Nhà giáo', 'Thầy đồ'], verified: 1,
  bio: 'Cụ tổ đời thứ nhất được ghi trong gia phả giấy còn giữ tại nhà thờ họ. Dạy chữ Nho trong làng Đông Ngạc, người làng gọi là "thầy Đức".'
})
person('to_ba', {
  name: 'Trần Thị Lụa', gender: 'F', gen: 1, birth: '1906-07-20', death: '1985-04-15',
  bp: 'Nhật Tảo, Đông Ngạc', dp: 'Đông Ngạc, Từ Liêm, Hà Nội', alive: 0,
  ld: 26, lm: 2, occ: ['Buôn tơ lụa'], verified: 1,
  bio: 'Cụ bà tần tảo buôn tơ lụa ở chợ Bưởi, nuôi năm người con qua thời kỳ khó khăn.'
})
// gen 2
person('ong', {
  name: 'Nguyễn Phúc Thịnh', gender: 'M', gen: 2, birth: '1931-01-08', death: '2009-09-27',
  bp: 'Đông Ngạc, Từ Liêm, Hà Nội', dp: 'Hà Nội', alive: 0,
  ld: 9, lm: 8, occ: ['Bộ đội', 'Cán bộ hợp tác xã'], verified: 1,
  bio: 'Ông nội, đi bộ đội năm 1950, tham gia chiến dịch Điện Biên Phủ. Sau về làm cán bộ hợp tác xã ở quê. Người viết lại quyển gia phả tay năm 1992.'
})
person('ba_noi', {
  name: 'Lê Thị Sen', gender: 'F', gen: 2, birth: '1934-05-12', death: null,
  bp: 'Chèm, Thụy Phương', dp: null, alive: 1,
  ld: null, lm: null, occ: ['Nội trợ', 'Làm ruộng'], verified: 1,
  bio: 'Bà nội, năm nay đã hơn 90 tuổi, vẫn nhớ rất rõ chuyện làng chuyện họ. Là người kể chính trong các buổi phỏng vấn AI.'
})
person('ba_co', {
  name: 'Nguyễn Thị Ba', gender: 'F', gen: 2, birth: '1938-11-03', death: null,
  bp: 'Đông Ngạc, Từ Liêm, Hà Nội', dp: null, alive: 1,
  ld: null, lm: null, occ: ['Giáo viên'], verified: 1,
  bio: 'Cô Ba, em ông Thịnh, giáo viên tiểu học đã nghỉ hưu. Người kể chuyện có góc nhìn khác về đám cưới năm 1958.'
})
person('chu_tu', {
  name: 'Nguyễn Phúc Tứ', gender: 'M', gen: 2, birth: '1941-02-19', death: '1972-05-08',
  bp: 'Đông Ngạc, Từ Liêm, Hà Nội', dp: 'Quảng Trị', alive: 0,
  ld: 25, lm: 3, occ: ['Bộ đội'], verified: 1,
  bio: 'Hy sinh tại Quảng Trị năm 1972, khi ấy 31 tuổi. Chưa có gia đình. Phần mộ được đưa về quê năm 1985.'
})
// gen 3
person('bo', {
  name: 'Nguyễn Văn Tùng', gender: 'M', gen: 3, birth: '1962-06-15', death: null,
  bp: 'Hà Nội', dp: null, alive: 1, ld: null, lm: null,
  occ: ['Kỹ sư xây dựng'], verified: 1,
  bio: 'Trưởng họ hiện tại, người khởi xướng số hóa gia phả họ Nguyễn Đông Ngạc.'
})
person('me', {
  name: 'Phạm Thị Lan', gender: 'F', gen: 3, birth: '1965-09-02', death: null,
  bp: 'Nam Định', dp: null, alive: 1, ld: null, lm: null,
  occ: ['Dược sĩ'], verified: 1, bio: 'Con dâu họ Nguyễn, quê Nam Định.'
})
person('co_hoa', {
  name: 'Nguyễn Thị Hòa', gender: 'F', gen: 3, birth: '1966-04-28', death: null,
  bp: 'Hà Nội', dp: null, alive: 1, ld: null, lm: null,
  occ: ['Kế toán'], verified: 1, bio: 'Em gái ông Tùng, hiện sống tại Sài Gòn.'
})
person('chu_hai', {
  name: 'Nguyễn Văn Hải', gender: 'M', gen: 3, birth: '1969-12-01', death: '2021-01-30',
  bp: 'Hà Nội', dp: 'Hà Nội', alive: 0, ld: 18, lm: 12,
  occ: ['Thợ mộc'], verified: 1,
  bio: 'Em trai ông Tùng, mất năm 2021. Người có giọng hát chèo hay nhất họ.'
})
// gen 4
person('minh', {
  name: 'Nguyễn Văn Minh', gender: 'M', gen: 4, birth: '1990-08-21', death: null,
  bp: 'Hà Nội', dp: null, alive: 1, ld: null, lm: null,
  occ: ['Lập trình viên'], verified: 1, bio: 'Cháu đích tôn, người dựng bản gia phả số này.'
})
person('an', {
  name: 'Nguyễn Thị An', gender: 'F', gen: 4, birth: '1993-03-14', death: null,
  bp: 'Hà Nội', dp: null, alive: 1, ld: null, lm: null,
  occ: ['Bác sĩ'], verified: 1, bio: 'Em gái Minh, bác sĩ nội trú.'
})
person('khanh', {
  name: 'Nguyễn Văn Khánh', gender: 'M', gen: 4, birth: '1995-07-07', death: null,
  bp: 'TP. Hồ Chí Minh', dp: null, alive: 1, ld: null, lm: null,
  occ: ['Kiến trúc sư'], verified: 1, bio: 'Con cô Hòa.'
})
// gen 5
person('bao', {
  name: 'Nguyễn Phúc Bảo', gender: 'M', gen: 5, birth: '2019-11-11', death: null,
  bp: 'Hà Nội', dp: null, alive: 1, ld: null, lm: null,
  occ: [], verified: 1, bio: 'Đời thứ năm, con của Minh. Chữ "Phúc" được đặt lại theo cụ tổ.'
})
// nhánh CHƯA XÁC MINH — vẽ nét đứt (8.4.1)
person('unverified', {
  name: 'Nguyễn Phúc Ngũ (?)', gender: 'M', gen: 2, birth: '1936', death: null,
  bp: 'Đông Ngạc (?)', dp: null, alive: 0, ld: null, lm: null,
  occ: [], verified: 0, conf: 0.35,
  bio: 'Theo lời kể của bà Sen, cụ tổ còn một người con trai nữa đi làm ăn ở Hải Phòng rồi mất liên lạc trước 1954. CHƯA có giấy tờ nào xác minh. Giữ lại trong gia phả dưới dạng nhánh nét đứt, không suy diễn thêm.'
})

// ---------------------------------------------------------------- SQL out
w(`-- ============================================================================
-- seed.sql — Dữ liệu demo Gia Sử Ký (họ Nguyễn, làng Đông Ngạc)
-- Sinh tự động bởi tools/gen-seed.mjs — KHÔNG sửa tay.
-- Mật khẩu mọi tài khoản demo: giasuky123
-- ============================================================================`)

w(`\nDELETE FROM persona_messages; DELETE FROM rate_limits; DELETE FROM audit_logs;
DELETE FROM subscriptions; DELETE FROM time_capsules; DELETE FROM interview_sessions;
DELETE FROM rest_requests; DELETE FROM digital_wills; DELETE FROM consent_records;
DELETE FROM ritual_participants; DELETE FROM rituals; DELETE FROM ritual_events;
DELETE FROM altars; DELETE FROM advices; DELETE FROM contradictions;
DELETE FROM memory_embeddings; DELETE FROM memory_persons; DELETE FROM memories;
DELETE FROM event_persons; DELETE FROM events; DELETE FROM locations;
DELETE FROM relationships; DELETE FROM persons; DELETE FROM clan_members;
DELETE FROM clans; DELETE FROM sessions; DELETE FROM user_person_links; DELETE FROM users;`)

// ---- users
w('\n-- ---------------------------------------------------------------- users')
for (const k of Object.keys(U)) {
  const u = U[k]
  w(`INSERT INTO users (id,email,hashed_password,vneid_verified,full_name,elder_mode,created_at,last_login_at)
VALUES (${q(u.id)},${q(u.email)},${q(pbkdf2('giasuky123'))},${k === 'tung' ? 1 : 0},${q(u.name)},${u.elder},datetime('now','-400 days'),datetime('now'));`)
}

// ---- clan
w('\n-- ---------------------------------------------------------------- clan')
w(`INSERT INTO clans (id,name,origin_place,founded_year,patriarch_user_id,member_count,merit_fund_balance_vnd,created_at)
VALUES (${q(CLAN)},'Họ Nguyễn Phúc — Đông Ngạc','Làng Đông Ngạc, Từ Liêm, Hà Nội',1902,${q(U.tung.id)},${Object.keys(P).length},18500000,datetime('now','-400 days'));`)
for (const k of Object.keys(U)) {
  w(`INSERT INTO clan_members (clan_id,user_id,role,joined_at) VALUES (${q(CLAN)},${q(U[k].id)},${q(U[k].role)},datetime('now','-390 days'));`)
}

// ---- persons
w('\n-- ---------------------------------------------------------------- persons (5 đời)')
for (const k of Object.keys(P)) {
  const p = P[k]
  w(`INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES (${q(p.id)},${q(CLAN)},${q(p.name)},${J(p.aliases || [])},${q(p.gender)},${p.gen},${q(p.birth)},${q(p.death)},${q(p.bp)},${q(p.dp)},${p.alive},${q(p.bio)},'Phat',${J(p.occ || [])},${q(p.ld)},${q(p.lm)},${p.verified},${p.conf ?? 1.0},${q(U.tung.id)});`)
}

// ---- user_person_links
w('\n-- ------------------------------------------------- liên kết user ↔ person')
w(`INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES (${q(U.tung.id)},${q(P.bo.id)},'self');`)
w(`INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES (${q(U.hoa.id)},${q(P.co_hoa.id)},'self');`)
w(`INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES (${q(U.minh.id)},${q(P.minh.id)},'self');`)
w(`INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES (${q(U.ba.id)},${q(P.ba_co.id)},'self');`)
w(`INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES (${q(U.tung.id)},${q(P.ba_noi.id)},'admin_for');`)

// ---- relationships
w('\n-- ---------------------------------------------------------- relationships')
const rels = [
  ['to', 'to_ba', 'SPOUSE_OF', 1, '1928-02-10'],
  ['ong', 'to', 'CHILD_OF', 1],
  ['ong', 'to_ba', 'CHILD_OF', 1],
  ['ba_co', 'to', 'CHILD_OF', 1],
  ['ba_co', 'to_ba', 'CHILD_OF', 1],
  ['chu_tu', 'to', 'CHILD_OF', 1],
  ['chu_tu', 'to_ba', 'CHILD_OF', 1],
  ['unverified', 'to', 'CHILD_OF', 0], // nhánh nét đứt
  ['ong', 'ba_noi', 'SPOUSE_OF', 1, '1958-04-20'],
  ['bo', 'ong', 'CHILD_OF', 1],
  ['bo', 'ba_noi', 'CHILD_OF', 1],
  ['co_hoa', 'ong', 'CHILD_OF', 1],
  ['co_hoa', 'ba_noi', 'CHILD_OF', 1],
  ['chu_hai', 'ong', 'CHILD_OF', 1],
  ['chu_hai', 'ba_noi', 'CHILD_OF', 1],
  ['bo', 'me', 'SPOUSE_OF', 1, '1988-12-04'],
  ['minh', 'bo', 'CHILD_OF', 1],
  ['minh', 'me', 'CHILD_OF', 1],
  ['an', 'bo', 'CHILD_OF', 1],
  ['an', 'me', 'CHILD_OF', 1],
  ['khanh', 'co_hoa', 'CHILD_OF', 1],
  ['bao', 'minh', 'CHILD_OF', 1],
  ['ong', 'ba_co', 'SIBLING_OF', 1],
  ['ong', 'chu_tu', 'SIBLING_OF', 1],
  ['bo', 'co_hoa', 'SIBLING_OF', 1],
  ['bo', 'chu_hai', 'SIBLING_OF', 1],
  ['minh', 'an', 'SIBLING_OF', 1]
]
for (const [a, b, t, ver, married] of rels) {
  w(`INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES (${q(id('rel'))},${q(P[a].id)},${q(P[b].id)},${q(t)},1,${q(married || null)},${ver});`)
}

// ---- locations
w('\n-- -------------------------------------------------------------- locations')
const LOC = { dn: 'loc-dongngac', dbp: 'loc-dienbien', qt: 'loc-quangtri', hn: 'loc-hanoi' }
w(`INSERT INTO locations (id,name,address_vn,lat,lng,historical_names) VALUES
(${q(LOC.dn)},'Làng Đông Ngạc','Phường Đông Ngạc, quận Bắc Từ Liêm, Hà Nội',21.0894,105.7776,${J(['Kẻ Vẽ', 'xã Đông Ngạc, huyện Từ Liêm'])}),
(${q(LOC.dbp)},'Điện Biên Phủ','Thành phố Điện Biên Phủ, tỉnh Điện Biên',21.3833,103.0167,${J(['Mường Thanh'])}),
(${q(LOC.qt)},'Thành cổ Quảng Trị','Thị xã Quảng Trị, tỉnh Quảng Trị',16.7500,107.1833,${J([])}),
(${q(LOC.hn)},'Hà Nội','Thành phố Hà Nội',21.0278,105.8342,${J(['Thăng Long', 'Đông Đô'])});`)

// ---- events
w('\n-- ----------------------------------------------------------------- events')
const E = {
  cuoi58: 'ev-cuoi-1958',
  dbp54: 'ev-dienbien-1954',
  hysinh72: 'ev-quangtri-1972',
  tang09: 'ev-tang-2009',
  ditan72: 'ev-ditan-1972',
  gio2021: 'ev-tang-2021'
}
w(`INSERT INTO events (id,clan_id,title,event_date,event_type,location_id,location,significance,created_at) VALUES
(${q(E.cuoi58)},${q(CLAN)},'Đám cưới ông Thịnh và bà Sen','1958-04-20','WEDDING',${q(LOC.dn)},'Làng Đông Ngạc, Từ Liêm, Hà Nội','FAMILY',datetime('now','-300 days')),
(${q(E.dbp54)},${q(CLAN)},'Ông Thịnh trong chiến dịch Điện Biên Phủ','1954-05-07','WAR',${q(LOC.dbp)},'Điện Biên Phủ','HISTORICAL',datetime('now','-290 days')),
(${q(E.hysinh72)},${q(CLAN)},'Chú Tứ hy sinh tại Quảng Trị','1972-05-08','DEATH',${q(LOC.qt)},'Thành cổ Quảng Trị','CLAN',datetime('now','-280 days')),
(${q(E.ditan72)},${q(CLAN)},'Gia đình sơ tán khỏi Hà Nội năm 1972','1972-12-20','MIGRATION',${q(LOC.hn)},'Hà Nội — Hà Bắc','FAMILY',datetime('now','-275 days')),
(${q(E.tang09)},${q(CLAN)},'Tang lễ ông Nguyễn Phúc Thịnh','2009-09-27','FUNERAL',${q(LOC.dn)},'Nhà thờ họ, Đông Ngạc','CLAN',datetime('now','-270 days')),
(${q(E.gio2021)},${q(CLAN)},'Tang lễ chú Nguyễn Văn Hải','2021-01-30','FUNERAL',${q(LOC.hn)},'Hà Nội','FAMILY',datetime('now','-260 days'));`)

const evPersons = [
  [E.cuoi58, ['ong', 'ba_noi', 'to', 'to_ba', 'ba_co']],
  [E.dbp54, ['ong']],
  [E.hysinh72, ['chu_tu', 'to', 'to_ba', 'ong']],
  [E.ditan72, ['ong', 'ba_noi', 'bo', 'ba_co']],
  [E.tang09, ['ong', 'ba_noi', 'bo', 'co_hoa', 'chu_hai', 'minh']],
  [E.gio2021, ['chu_hai', 'bo', 'ba_noi', 'minh']]
]
for (const [ev, ks] of evPersons) {
  for (const k of ks) w(`INSERT INTO event_persons (event_id,person_id) VALUES (${q(ev)},${q(P[k].id)});`)
}

// ---- memories (bao gồm nhiều góc nhìn cho cùng một sự kiện — F4 Rashomon)
w('\n-- --------------------------- memories (đa góc nhìn — chế độ Rashomon F4)')
const MEMS = []
const mem = (o) => { MEMS.push({ id: 'mem-' + (MEMS.length + 1).toString().padStart(2, '0'), ...o }); return MEMS[MEMS.length - 1] }

// --- Sự kiện đám cưới 1958: BA góc nhìn, có mâu thuẫn về thời tiết & số bàn
mem({
  key: 'cuoi_sen',
  content: 'Hôm cưới tôi trời mưa rất to. Nước ngập cả sân, phải bắc mấy tấm ván cho khách đi vào. Tôi nhớ như in vì tà áo dài lấm bùn hết, mẹ tôi xót quá cứ lấy khăn lau mãi. Cỗ hôm ấy làm hai mươi bàn, ăn từ trưa đến chiều mới hết.',
  teller: 'ba_noi', subject: 'ba_noi', event: E.cuoi58, date: '1958-04-20',
  perspective: 'Bà Lê Thị Sen kể — cô dâu', loc: 'Làng Đông Ngạc',
  involves: ['ong', 'ba_noi', 'to', 'to_ba'], src: 'AI_INTERVIEW'
})
mem({
  key: 'cuoi_ba',
  content: 'Cái đám cưới của anh Thịnh thì trời nắng chứ mưa gì đâu. Tôi còn đội nón đi theo đoàn rước dâu, nắng chang chang, mồ hôi ướt hết lưng áo. Cỗ thì tôi nhớ chỉ mười lăm bàn thôi, vì hồi ấy nhà mình còn nghèo, làm hai mươi bàn sao nổi.',
  teller: 'ba_co', subject: 'ong', event: E.cuoi58, date: '1958-04-20',
  perspective: 'Cô Nguyễn Thị Ba kể — em chồng, khi ấy 20 tuổi', loc: 'Làng Đông Ngạc',
  involves: ['ong', 'ba_noi', 'ba_co'], src: 'AI_INTERVIEW'
})
mem({
  key: 'cuoi_tung',
  content: 'Bố tôi kể lại rằng trong ảnh cưới của ông bà, nền sân có vệt nước và mấy người khách xắn quần. Tấm ảnh ấy giờ vẫn còn trong hộp thiếc ở nhà thờ họ. Tôi không dám khẳng định trời mưa hay nắng, chỉ ghi lại đúng những gì tấm ảnh cho thấy.',
  teller: 'bo', subject: 'ong', event: E.cuoi58, date: '1958-04-20',
  perspective: 'Ông Nguyễn Văn Tùng kể — con trai, dựa trên ảnh cũ', loc: 'Nhà thờ họ Nguyễn',
  involves: ['ong', 'ba_noi'], src: 'MANUAL'
})

// --- Điện Biên Phủ 1954
mem({
  key: 'dbp',
  content: 'Tôi đi bộ đội năm hai mươi tuổi. Lên Điện Biên, ba tháng ròng đào hào, đêm nào cũng nghe pháo. Cái ngày bảy tháng năm, khi tin thắng trận truyền xuống, cả hầm im lặng một lúc rồi mới có người khóc. Không ai reo hò như trong phim đâu. Chúng tôi kiệt sức quá rồi. Sống ở đời, cái gì mình đã hứa với đồng đội thì phải giữ, dù có phải đi bộ ba trăm cây số.',
  teller: 'ong', subject: 'ong', event: E.dbp54, date: '1954-05-07',
  perspective: 'Ông Nguyễn Phúc Thịnh kể năm 2005, ghi âm bằng máy cassette', loc: 'Điện Biên Phủ',
  involves: ['ong'], src: 'IMPORT'
})

// --- Chú Tứ hy sinh 1972: hai góc nhìn, mâu thuẫn ngày nhận tin
mem({
  key: 'tu_sen',
  content: 'Nhà nhận được giấy báo tử của chú Tứ vào khoảng tháng bảy năm bảy hai. Ông Thịnh đọc xong không nói gì, ra sân ngồi đến khuya. Mẹ chồng tôi thì ngất đi, phải cạo gió mãi mới tỉnh. Từ hôm ấy trong nhà không ai bật đèn sáng nữa, cứ để đèn dầu tù mù suốt mấy tháng.',
  teller: 'ba_noi', subject: 'chu_tu', event: E.hysinh72, date: '1972-07-15',
  perspective: 'Bà Sen kể — chị dâu', loc: 'Đông Ngạc',
  involves: ['chu_tu', 'ong', 'to_ba'], src: 'AI_INTERVIEW'
})
mem({
  key: 'tu_ba',
  content: 'Giấy báo tử của anh Tứ về nhà đúng dịp giáp Tết năm bảy hai sang bảy ba, tôi nhớ vì đang gói bánh chưng thì ông trưởng thôn sang. Cả nhà bỏ nồi bánh đấy, không ai ăn Tết năm ấy.',
  teller: 'ba_co', subject: 'chu_tu', event: E.hysinh72, date: '1973-01-20',
  perspective: 'Cô Ba kể — em gái', loc: 'Đông Ngạc',
  involves: ['chu_tu', 'ba_co'], src: 'AI_INTERVIEW'
})

// --- Sơ tán 1972
mem({
  key: 'ditan',
  content: 'Tháng chạp năm bảy hai, máy bay B52 ném bom Hà Nội. Ông Thịnh bắt cả nhà sơ tán về Hà Bắc, mỗi người chỉ được mang một cái tay nải. Tôi mang theo quyển gia phả của cụ Đức, gói trong ba lớp vải mưa. Ông ấy bảo: nhà mất thì dựng lại được, gia phả mất là mất gốc.',
  teller: 'ba_noi', subject: 'ong', event: E.ditan72, date: '1972-12-20',
  perspective: 'Bà Sen kể', loc: 'Hà Nội — Hà Bắc',
  involves: ['ong', 'ba_noi', 'bo'], src: 'AI_INTERVIEW'
})

// --- Gia đạo / lời dạy (nguồn cho advices — F5, phải là NGUYÊN VĂN)
mem({
  key: 'giadao_hoc',
  content: 'Ông tôi vẫn dạy con cháu rằng: Nhà mình không có ruộng nhiều, chỉ có cái chữ là của cải để lại được. Con cháu đời nào cũng phải học, học không phải để làm quan mà để không ai lừa được mình.',
  teller: 'bo', subject: 'ong', event: null, date: '1995-06-01',
  perspective: 'Ông Tùng nhớ lại lời ông nội', loc: 'Đông Ngạc',
  involves: ['ong', 'bo'], src: 'MANUAL'
})
mem({
  key: 'giadao_hieu',
  content: 'Cụ Đức có câu để lại trong gia phả tay, ông Thịnh chép lại nguyên văn: Thờ cha kính mẹ là gốc của mọi điều lành, con cháu nào bỏ gốc thì cành có tốt cũng chẳng bền.',
  teller: 'ong', subject: 'to', event: null, date: '1992-03-10',
  perspective: 'Ông Thịnh chép từ gia phả tay của cụ Đức', loc: 'Nhà thờ họ Nguyễn',
  involves: ['to', 'ong'], src: 'IMPORT'
})
mem({
  key: 'giadao_cuoi',
  content: 'Bà tôi bảo: Cưới xin thì đừng chạy theo mâm cao cỗ đầy, lấy nhau là lấy cái nết chứ không lấy cái nhà. Bà cứ nhắc câu ấy mỗi lần trong họ có đứa sắp cưới.',
  teller: 'bo', subject: 'ba_noi', event: null, date: '2015-08-20',
  perspective: 'Ông Tùng kể lời mẹ', loc: 'Hà Nội',
  involves: ['ba_noi', 'bo'], src: 'MANUAL'
})
mem({
  key: 'giadao_nghe',
  content: 'Chú Hải làm mộc, có lần bảo tôi: Làm cái gì cũng phải làm cho tử tế, đồ mình đóng người ta dùng ba chục năm, mình gian một ly là họ khổ ba chục năm.',
  teller: 'minh', subject: 'chu_hai', event: null, date: '2019-05-15',
  perspective: 'Minh kể lời chú Hải', loc: 'Hà Nội',
  involves: ['chu_hai', 'minh'], src: 'MANUAL'
})
mem({
  key: 'giadao_duc',
  content: 'Ông Thịnh dặn trước khi mất: Trong họ có người khá người kém, người khá phải đỡ người kém, đừng để ai trong họ phải ngửa tay xin người ngoài.',
  teller: 'bo', subject: 'ong', event: E.tang09, date: '2009-09-20',
  perspective: 'Ông Tùng kể lời cha trước khi mất', loc: 'Hà Nội',
  involves: ['ong', 'bo'], src: 'MANUAL'
})

// --- Tang lễ 2009 / 2021
mem({
  key: 'tang09',
  content: 'Đám tang ông Thịnh, người làng đến chật cả sân nhà thờ họ. Có mấy cụ đồng đội Điện Biên từ Thái Nguyên xuống, đứng chào theo kiểu nhà binh trước bàn thờ. Tôi nhớ mãi hình ảnh ấy.',
  teller: 'bo', subject: 'ong', event: E.tang09, date: '2009-09-27',
  perspective: 'Ông Tùng kể', loc: 'Nhà thờ họ Nguyễn',
  involves: ['ong', 'bo', 'ba_noi'], src: 'MANUAL'
})
mem({
  key: 'hai_cheo',
  content: 'Chú Hải hát chèo hay nhất họ. Mỗi lần giỗ ông, chú lại hát bài Đào liễu, bà nội tôi vừa nghe vừa khóc. Từ năm hai mươi mốt chú đi rồi, giỗ nào cũng thiếu tiếng hát ấy.',
  teller: 'minh', subject: 'chu_hai', event: E.gio2021, date: '2021-02-05',
  perspective: 'Minh kể về chú', loc: 'Hà Nội',
  involves: ['chu_hai', 'minh', 'ba_noi'], src: 'MANUAL'
})
// --- ký ức chờ duyệt (AC-F2.4)
mem({
  key: 'pending',
  content: 'Bà nội kể hôm phỏng vấn rằng cụ tổ Đức từng dạy chữ cho cả con gái trong làng, việc rất lạ ở thời ấy. Đoạn này bà kể chưa rõ tên người, cần hỏi lại cô Ba trước khi đưa vào gia phả.',
  teller: 'ba_noi', subject: 'to', event: null, date: '1930',
  perspective: 'Bà Sen kể trong buổi phỏng vấn AI — chờ trưởng họ duyệt', loc: 'Đông Ngạc',
  involves: ['to', 'ba_noi'], src: 'AI_INTERVIEW', status: 'PENDING_REVIEW'
})

for (const m of MEMS) {
  const p = P[m.teller]
  w(`INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES (${q(m.id)},${q(CLAN)},'TEXT',${q(m.content)},${q(removeTone(m.content))},'vi',${q(m.perspective)},${q(p.id)},${q(P[m.subject].id)},${q(m.event)},${q(m.loc)},${q(m.date)},${q(m.src)},${q(m.status || 'APPROVED')},'CLAN',${q(U.tung.id)},datetime('now','-${200 - MEMS.indexOf(m) * 3} days'));`)
  for (const k of m.involves || []) {
    w(`INSERT INTO memory_persons (memory_id,person_id) VALUES (${q(m.id)},${q(P[k].id)});`)
  }
  const vec = localEmbed(m.content)
  w(`INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES (${q(m.id)},${q(CLAN)},${q(P[m.subject].id)},'text',256,${q(JSON.stringify(vec))});`)
}
const M = {}
for (const m of MEMS) M[m.key] = m.id

// ---- contradictions (KHÔNG bao giờ tự giải quyết — 4.4.3)
w('\n-- ------------------ contradictions (phát hiện, không tự phân xử — 4.4.3)')
w(`INSERT INTO contradictions (id,event_id,memory_a_id,memory_b_id,aspect,claim_a,claim_b,severity,status,detected_at)
VALUES ('ct-01',${q(E.cuoi58)},${q(M.cuoi_sen)},${q(M.cuoi_ba)},'thời tiết','trời mưa rất to, nước ngập cả sân','trời nắng chang chang, mồ hôi ướt hết lưng áo','MEDIUM','OPEN',datetime('now','-120 days'));`)
w(`INSERT INTO contradictions (id,event_id,memory_a_id,memory_b_id,aspect,claim_a,claim_b,severity,status,detected_at)
VALUES ('ct-02',${q(E.cuoi58)},${q(M.cuoi_sen)},${q(M.cuoi_ba)},'số lượng','cỗ hôm ấy làm hai mươi bàn','tôi nhớ chỉ mười lăm bàn thôi','LOW','OPEN',datetime('now','-120 days'));`)
w(`INSERT INTO contradictions (id,event_id,memory_a_id,memory_b_id,aspect,claim_a,claim_b,severity,status,resolution_note,detected_at)
VALUES ('ct-03',${q(E.hysinh72)},${q(M.tu_sen)},${q(M.tu_ba)},'thời điểm','nhận giấy báo tử khoảng tháng bảy năm bảy hai','giấy báo tử về đúng dịp giáp Tết bảy hai sang bảy ba','HIGH','CLARIFIED','Trưởng họ Nguyễn Văn Tùng ghi chú (không phải AI kết luận): Giấy báo tử gốc còn lưu tại nhà thờ họ ghi ngày 12/07/1972, nhưng lễ truy điệu của xã thì tổ chức dịp giáp Tết. Có thể hai người đang nhớ về hai mốc khác nhau. Giữ lại cả hai lời kể.',datetime('now','-118 days'));`)

// ---- advices (F5 — nguyên văn, bắt buộc có source_memory_id)
w('\n-- ---------------- advices (Gia Đạo — trích NGUYÊN VĂN, có nguồn bắt buộc)')
const ADV = [
  ['adv-01', 'Nhà mình không có ruộng nhiều, chỉ có cái chữ là của cải để lại được. Con cháu đời nào cũng phải học, học không phải để làm quan mà để không ai lừa được mình.', 'EDUCATION', M.giadao_hoc, 'ong'],
  ['adv-02', 'Thờ cha kính mẹ là gốc của mọi điều lành, con cháu nào bỏ gốc thì cành có tốt cũng chẳng bền.', 'FILIAL_PIETY', M.giadao_hieu, 'to'],
  ['adv-03', 'Cưới xin thì đừng chạy theo mâm cao cỗ đầy, lấy nhau là lấy cái nết chứ không lấy cái nhà.', 'MARRIAGE', M.giadao_cuoi, 'ba_noi'],
  ['adv-04', 'Làm cái gì cũng phải làm cho tử tế, đồ mình đóng người ta dùng ba chục năm, mình gian một ly là họ khổ ba chục năm.', 'BUSINESS', M.giadao_nghe, 'chu_hai'],
  ['adv-05', 'Trong họ có người khá người kém, người khá phải đỡ người kém, đừng để ai trong họ phải ngửa tay xin người ngoài.', 'ETHICS', M.giadao_duc, 'ong'],
  ['adv-06', 'Sống ở đời, cái gì mình đã hứa với đồng đội thì phải giữ, dù có phải đi bộ ba trăm cây số.', 'ETHICS', M.dbp, 'ong'],
  ['adv-07', 'Nhà mất thì dựng lại được, gia phả mất là mất gốc.', 'FILIAL_PIETY', M.ditan, 'ong']
]
for (const [aid, text, cat, src, by] of ADV) {
  w(`INSERT INTO advices (id,clan_id,original_text,category,source_memory_id,spoken_by_person_id,approved_by_user_id,approved_at,created_at)
VALUES (${q(aid)},${q(CLAN)},${q(text)},${q(cat)},${q(src)},${q(P[by].id)},${q(U.tung.id)},datetime('now','-100 days'),datetime('now','-101 days'));`)
}

// ---- altar
w('\n-- ------------------------------------------------------ altars (F1) + log')
const ALTAR_ID = 'altar-nguyen-main'
w(`INSERT INTO altars (id,clan_id,owner_user_id,name,subject_person_ids,religion_theme,spatial_assets,ambient_sound,horizontal_scroll_text,created_at)
VALUES (${q(ALTAR_ID)},${q(CLAN)},${q(U.tung.id)},'Bàn thờ gia tiên họ Nguyễn — Đông Ngạc',${J([P.to.id, P.to_ba.id, P.ong.id, P.chu_tu.id, P.chu_hai.id])},'Phat',${J({ background: 'nha_go_bac_bo', lighting: 'nen_am', incense: 'nhang_tram', altarStyle: 'go_gu' })},'chuong_chua','ĐỨC LƯU QUANG',datetime('now','-380 days'));`)
w(`INSERT INTO altars (id,clan_id,owner_user_id,name,subject_person_ids,religion_theme,spatial_assets,ambient_sound,horizontal_scroll_text,created_at)
VALUES ('altar-chu-hai',${q(CLAN)},${q(U.minh.id)},'Bàn thờ chú Hải',${J([P.chu_hai.id])},'Phat',${J({ background: 'phong_tho_nho', lighting: 'nen_am', incense: 'nhang_que' })},'mua_ngoai_hien','NGHĨA TRỌNG TÌNH SÂU',datetime('now','-150 days'));`)

const RLOG = [
  ['INCENSE', U.minh.id, U.minh.name, {}, '-2 hours'],
  ['PRAYER', U.minh.id, U.minh.name, { text: 'Con xin ông phù hộ cho cả nhà bình an, cháu Bảo khỏe mạnh.' }, '-2 hours'],
  ['INCENSE', U.tung.id, U.tung.name, {}, '-1 day'],
  ['OFFERING', U.tung.id, U.tung.name, { item: 'Mâm ngũ quả' }, '-1 day'],
  ['CANDLE', U.hoa.id, U.hoa.name, {}, '-3 days'],
  ['INCENSE', U.ba.id, U.ba.name, {}, '-5 days'],
  ['FLOWER', U.hoa.id, U.hoa.name, { item: 'Hoa cúc vàng' }, '-6 days'],
  ['PRAYER', U.ba.id, U.ba.name, { text: 'Anh Thịnh ơi, em vẫn nhớ anh dặn phải giữ lấy cái chữ cho các cháu.' }, '-8 days']
]
let ci = 0
for (const [t, uid, an, pl, off] of RLOG) {
  w(`INSERT INTO ritual_events (id,altar_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES (${q(id('rev'))},${q(ALTAR_ID)},${q(uid)},${q(an)},${q(t)},${J(pl)},${q('seed-cev-' + ++ci)},datetime('now',${q(off)}));`)
}

// ---- rituals (giỗ sắp tới, tính từ lịch âm)
w('\n-- -------------------------------------------------- rituals (F6) + RSVP')
function nextSolarFor(ld, lm) {
  const nowY = new Date().getUTCFullYear()
  for (const y of [nowY, nowY + 1]) {
    const s = lunarToSolar(ld, lm, y)
    if (!s) continue
    const [d, m, yy] = s
    const dt = new Date(Date.UTC(yy, m - 1, d, 3, 0, 0)) // 10:00 giờ VN
    if (dt.getTime() > Date.now()) return dt
  }
  return new Date(Date.now() + 86400000 * 30)
}
const GIO_ONG = nextSolarFor(P.ong.ld, P.ong.lm)
const GIO_TO = nextSolarFor(P.to.ld, P.to.lm)
const GIO_HAI = nextSolarFor(P.chu_hai.ld, P.chu_hai.lm)
const GIO_TU = nextSolarFor(P.chu_tu.ld, P.chu_tu.lm)
// một lễ sắp diễn ra trong 2 ngày để demo đếm ngược & phòng lễ
const SOON = new Date(Date.now() + 86400000 * 2 + 3600000 * 5)
const soonLunar = solarToLunar(SOON.getUTCDate(), SOON.getUTCMonth() + 1, SOON.getUTCFullYear())

const GIA_HUAN = `Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,
tề tựu trước bàn thờ gia tiên.
Kính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,
cùng chư vị tiên linh nội ngoại họ Nguyễn.
Cụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.
Ông dạy: nhà mình chỉ có cái chữ là của cải để lại được.
Con cháu xin ghi lòng, đời nối đời không dám quên.
Cầu cho trong họ trên hòa dưới thuận,
người khá đỡ người kém, không ai phải ngửa tay xin người ngoài.
Nam mô A Di Đà Phật.`

const RITS = [
  ['rit-soon', 'Lễ giỗ ông Nguyễn Phúc Thịnh (trực tuyến)', 'ong', 'GIO', SOON, soonLunar.day, soonLunar.month, 'SCHEDULED'],
  ['rit-ong', `Giỗ ông Thịnh ${P.ong.ld}/${P.ong.lm} âm lịch`, 'ong', 'GIO', GIO_ONG, P.ong.ld, P.ong.lm, 'SCHEDULED'],
  ['rit-to', `Giỗ cụ tổ Nguyễn Phúc Đức ${P.to.ld}/${P.to.lm} âm lịch`, 'to', 'GIO', GIO_TO, P.to.ld, P.to.lm, 'SCHEDULED'],
  ['rit-hai', `Giỗ chú Hải ${P.chu_hai.ld}/${P.chu_hai.lm} âm lịch`, 'chu_hai', 'GIO', GIO_HAI, P.chu_hai.ld, P.chu_hai.lm, 'SCHEDULED'],
  ['rit-tu', `Giỗ chú Tứ ${P.chu_tu.ld}/${P.chu_tu.lm} âm lịch`, 'chu_tu', 'GIO', GIO_TU, P.chu_tu.ld, P.chu_tu.lm, 'SCHEDULED'],
  ['rit-past', 'Lễ Thanh Minh — tảo mộ họ Nguyễn', 'to', 'THANH_MINH', new Date(Date.now() - 86400000 * 45), 5, 3, 'COMPLETED']
]
for (const [rid, title, subj, rtype, dt, ld, lm, st] of RITS) {
  w(`INSERT INTO rituals (id,clan_id,altar_id,title,subject_person_id,ritual_type,scheduled_at,lunar_day,lunar_month,status,gia_huan_text,created_by,created_at)
VALUES (${q(rid)},${q(CLAN)},${q(ALTAR_ID)},${q(title)},${q(P[subj].id)},${q(rtype)},${q(dt.toISOString())},${ld},${lm},${q(st)},${q(GIA_HUAN)},${q(U.tung.id)},datetime('now','-60 days'));`)
  const parts = [
    [U.tung.id, 'YES'], [U.hoa.id, 'YES'], [U.minh.id, 'YES'], [U.ba.id, st === 'COMPLETED' ? 'YES' : 'MAYBE']
  ]
  for (const [uid, rsvp] of parts) {
    w(`INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES (${q(rid)},${q(uid)},${q(rsvp)},${st === 'COMPLETED' ? "datetime('now','-45 days')" : 'NULL'});`)
  }
}
// sổ lễ của buổi Thanh Minh đã xong
for (const [t, uid, an, pl, off] of [
  ['JOIN', U.tung.id, U.tung.name, {}, '-45 days'],
  ['JOIN', U.hoa.id, U.hoa.name, {}, '-45 days'],
  ['INCENSE', U.tung.id, U.tung.name, {}, '-45 days'],
  ['INCENSE', U.hoa.id, U.hoa.name, {}, '-45 days'],
  ['PRAYER', U.tung.id, U.tung.name, { text: 'Con cháu về tảo mộ, kính mong tiên linh chứng giám.' }, '-45 days']
]) {
  w(`INSERT INTO ritual_events (id,altar_id,ritual_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES (${q(id('rev'))},${q(ALTAR_ID)},'rit-past',${q(uid)},${q(an)},${q(t)},${J(pl)},${q('seed-cev-' + ++ci)},datetime('now',${q(off)}));`)
}

// ---- consent records (F7)
w('\n-- ------------------------- consent_records (F7 — P2 Consent Before Everything)')
async function consentRow(o) {
  const payload = {
    id: o.id,
    subjectPersonId: o.subject,
    scope: o.scope.slice().sort(),
    grantees: o.grantees,
    timeStart: o.timeStart,
    timeEnd: o.timeEnd || null,
    signatureMethod: o.method
  }
  const h = sha256(JSON.stringify(payload))
  return `INSERT INTO consent_records (id,subject_person_id,scope,grantees,time_start,time_end,auto_sunset_config,right_to_rest,signature_method,signed_at,signer_ip,signer_device_fingerprint,video_consent_url,blockchain_tx_hash,blockchain_contract_address,record_hash,status,created_at${o.revokedAt ? ',revoked_at,revoked_reason' : ''})
VALUES (${q(o.id)},${q(o.subject)},${J(payload.scope)},${J(o.grantees)},${q(o.timeStart)},${q(o.timeEnd)},${J(o.sunset)},${J(o.rtr)},${q(o.method)},${q(o.timeStart)},'127.0.0.1','seed-device',${q(o.video)},${q('0x' + h.slice(0, 64))},'0xGiaSuKyConsentLedgerV1',${q(h)},${q(o.status)},${q(o.timeStart)}${o.revokedAt ? `,${q(o.revokedAt)},${q(o.revokedReason)}` : ''});`
}
const GRANTEES = [
  { userId: U.tung.id, relationship: 'con trai', accessLevel: 'FULL' },
  { userId: U.minh.id, relationship: 'cháu nội', accessLevel: 'READ' }
]
const CONSENTS = [
  {
    id: 'cst-ong-persona', subject: P.ong.id,
    scope: ['chatbot_persona', 'photo_animation'], grantees: GRANTEES,
    timeStart: '2009-09-01 09:00:00', timeEnd: null, method: 'VIDEO_CONSENT',
    video: 'https://cdn.giasuky.com/consent/ong-thinh-2009.mp4',
    sunset: { enabled: true, inactiveYears: 5 },
    rtr: { condition: 'INHERITOR_DECISION', inheritorApprovalCount: 2 },
    status: 'active'
  },
  {
    id: 'cst-sen-voice', subject: P.ba_noi.id,
    scope: ['voice_clone', 'chatbot_persona', 'photo_animation'], grantees: GRANTEES,
    timeStart: '2024-02-14 10:30:00', timeEnd: null, method: 'NATIONAL_EID',
    video: null, sunset: { enabled: true, inactiveYears: 7 },
    rtr: { condition: 'INHERITOR_DECISION', inheritorApprovalCount: 3 },
    status: 'active'
  },
  {
    id: 'cst-hai-photo', subject: P.chu_hai.id,
    scope: ['photo_animation'], grantees: [{ userId: U.minh.id, relationship: 'cháu', accessLevel: 'READ' }],
    timeStart: '2021-03-01 08:00:00', timeEnd: null, method: 'NOTARY',
    video: null, sunset: { enabled: true, inactiveYears: 5 },
    rtr: { condition: 'INHERITOR_DECISION', inheritorApprovalCount: 2 },
    status: 'active'
  },
  {
    id: 'cst-tu-rest', subject: P.chu_tu.id,
    scope: ['photo_animation', 'chatbot_persona'], grantees: GRANTEES,
    timeStart: '2022-05-08 09:00:00', timeEnd: null, method: 'NOTARY',
    video: null, sunset: { enabled: true, inactiveYears: 3 },
    rtr: { condition: 'INHERITOR_DECISION', inheritorApprovalCount: 2 },
    status: 'sunset'
  },
  {
    id: 'cst-to-revoked', subject: P.to.id,
    scope: ['3d_avatar', 'video_reanimation'], grantees: GRANTEES,
    timeStart: '2023-01-10 09:00:00', timeEnd: null, method: 'NOTARY',
    video: null, sunset: { enabled: true, inactiveYears: 5 },
    rtr: { condition: 'INHERITOR_DECISION', inheritorApprovalCount: 2 },
    status: 'revoked',
    revokedAt: '2024-06-02 14:20:00',
    revokedReason: 'Hội đồng gia tộc họp ngày 02/06/2024 quyết định không dựng avatar 3D cho cụ tổ: ảnh gốc quá mờ, mọi bản dựng đều là suy diễn nét mặt. Tôn kính trước tiện lợi (P1).'
  }
]
for (const cst of CONSENTS) w(await consentRow(cst))

// ---- rest requests (Right to Rest — quorum)
w('\n-- --------------------------------- rest_requests (Quyền được yên nghỉ 4.7.2)')
w(`INSERT INTO rest_requests (id,consent_record_id,subject_person_id,mode,trigger,required_approvals,approvals,status,created_by,created_at,executed_at)
VALUES ('rr-01','cst-tu-rest',${q(P.chu_tu.id)},'SOFT_SUNSET','INHERITOR_DECISION',2,${J([U.tung.id, U.ba.id])},'EXECUTED',${q(U.ba.id)},'2025-03-25 09:00:00','2025-03-27 10:15:00');`)
w(`INSERT INTO rest_requests (id,consent_record_id,subject_person_id,mode,trigger,required_approvals,approvals,status,created_by,created_at)
VALUES ('rr-02','cst-hai-photo',${q(P.chu_hai.id)},'SOFT_SUNSET','INHERITOR_DECISION',2,${J([U.minh.id])},'PENDING',${q(U.minh.id)},datetime('now','-10 days'));`)

// ---- digital wills
w('\n-- ------------------------------------------------- digital_wills (Di chúc số)')
w(`INSERT INTO digital_wills (id,testator_person_id,witness_ids,inheritors,post_mortem_instructions,legal_review,status,created_at)
VALUES ('will-tung',${q(P.bo.id)},${J([P.me.id, P.co_hoa.id, P.minh.id])},${J([
  { userId: U.minh.id, role: 'trưởng nam', quorum: 1 },
  { userId: U.hoa.id, role: 'em gái', quorum: 1 }
])},${J({
  releaseTimeCapsulesAt: 'ON_DEATH',
  activateMemorialMode: true,
  lockedTopics: ['bệnh án', 'mâu thuẫn với họ ngoại năm 1998', 'chuyện tài chính riêng'],
  finalMessageToFamily: 'Các con đừng giỗ bố linh đình. Đủ nén nhang, đủ mặt con cháu là bố mừng. Quyển gia phả giao cho Minh giữ, nhưng phải cho cả họ đọc.'
})},${J({ reviewed: false, note: 'Bản MVP chưa có luật sư rà soát. Cần công chứng để có giá trị pháp lý theo Bộ luật Dân sự 2015.' })},'signed',datetime('now','-200 days'));`)
w(`INSERT INTO digital_wills (id,testator_person_id,witness_ids,inheritors,post_mortem_instructions,legal_review,status,created_at)
VALUES ('will-sen',${q(P.ba_noi.id)},${J([P.bo.id, P.co_hoa.id])},${J([{ userId: U.tung.id, role: 'trưởng nam', quorum: 1 }])},${J({
  releaseTimeCapsulesAt: 'ON_DEATH',
  activateMemorialMode: true,
  lockedTopics: ['chuyện riêng của bà với gia đình bên ngoại'],
  finalMessageToFamily: 'Bà không muốn ai dựng giọng bà lên nói những câu bà chưa từng nói. Cho bà nghỉ khi các con thấy đủ.'
})},${J({ reviewed: false })},'draft',datetime('now','-120 days'));`)

// ---- interview sessions
w('\n-- ------------------------------------------- interview_sessions (F2 phỏng vấn)')
const ITV_TURNS = [
  { role: 'ai', content: 'Dạ cụ ơi, cháu là Chị Hạnh, trợ lý AI của Gia Sử Ký ạ. Cháu xin phép ghi âm để lưu vào gia phả nhé. Hôm nay mình cùng nói về "Đám cưới ngày xưa", cụ kể cháu nghe nhé ạ. Ngày cưới của cụ, cụ nhớ nhất điều gì ạ?', t: 0 },
  { role: 'interviewee', content: 'Hôm cưới tôi trời mưa rất to. Nước ngập cả sân, phải bắc mấy tấm ván cho khách đi vào. Tôi nhớ như in vì tà áo dài lấm bùn hết, mẹ tôi xót quá cứ lấy khăn lau mãi.', t: 22 },
  { role: 'ai', content: 'Dạ, tà áo dài lấm bùn mà mẹ cụ cứ lau mãi, nghe thương quá ạ. Thế cỗ cưới hôm ấy nhà mình làm to không cụ?', t: 25 },
  { role: 'interviewee', content: 'Cỗ hôm ấy làm hai mươi bàn, ăn từ trưa đến chiều mới hết. Ông ấy thì lo chạy đi chạy lại, chả kịp ăn miếng nào.', t: 48 },
  { role: 'ai', content: 'Dạ. Cụ có nhớ hôm ấy ai là người đưa cụ về nhà chồng không ạ?', t: 51 },
  { role: 'interviewee', content: 'Bố tôi đưa. Ông đi trước, tôi theo sau, đường làng trơn lắm... (giọng nghẹn) Bố tôi mất năm sau đó, mới có một năm thôi...', t: 75 },
  { role: 'ai', content: 'Dạ cụ ơi, cháu xin phép dừng ở đây ạ. Cháu nghe cụ xúc động rồi. Chuyện của bố cụ, khi nào cụ thấy trong lòng nhẹ hơn thì cụ kể tiếp cho cháu nghe nhé. Cháu cảm ơn cụ nhiều lắm ạ, những điều cụ vừa kể quý lắm.', t: 78 }
]
const ITV_EMO = [
  { t: 22, emotion: 'nostalgic', confidence: 0.72 },
  { t: 48, emotion: 'happy', confidence: 0.61 },
  { t: 75, emotion: 'sad_severe', confidence: 0.88 }
]
w(`INSERT INTO interview_sessions (id,clan_id,interviewee_person_id,scheduled_by_user_id,channel,scheduled_at,started_at,ended_at,duration_seconds,status,topic,language,ai_host_id,transcript_raw,emotion_timeline,consent_record_id,reviewed_by_user_id,reviewed_at,approved,created_at)
VALUES ('itv-01',${q(CLAN)},${q(P.ba_noi.id)},${q(U.tung.id)},'app_voip',datetime('now','-30 days'),datetime('now','-30 days'),datetime('now','-30 days'),82,'APPROVED','dam_cuoi','VI_NORTH','AI_FEMALE_HANOI',${q(JSON.stringify(ITV_TURNS))},${q(JSON.stringify(ITV_EMO))},'cst-sen-voice',${q(U.tung.id)},datetime('now','-29 days'),1,datetime('now','-31 days'));`)

const ITV2 = [
  { role: 'ai', content: 'Dạ cụ ơi, cháu là Cô Trâm, trợ lý AI của Gia Sử Ký ạ. Cháu xin phép ghi âm để lưu vào gia phả nhé. Hôm nay mình nói về "Làng quê ngày xưa", cụ kể cháu nghe nhé ạ. Làng Đông Ngạc hồi cụ còn bé trông thế nào ạ?', t: 0 },
  { role: 'interviewee', content: 'Làng tôi hồi ấy còn cổng làng bằng gạch, có cây gạo to lắm ở đầu làng. Tháng ba hoa gạo đỏ rực, trẻ con chúng tôi hay ra đó nhặt hoa chơi. Bây giờ cây gạo không còn nữa, người ta mở đường.', t: 26 },
  { role: 'ai', content: 'Dạ, cây gạo đầu làng tháng ba hoa đỏ rực ạ. Cụ có nhớ chỗ cây gạo ấy giờ là đoạn nào của đường bây giờ không ạ?', t: 29 }
]
w(`INSERT INTO interview_sessions (id,clan_id,interviewee_person_id,scheduled_by_user_id,channel,scheduled_at,started_at,duration_seconds,status,topic,language,ai_host_id,transcript_raw,emotion_timeline,consent_record_id,created_at)
VALUES ('itv-02',${q(CLAN)},${q(P.ba_co.id)},${q(U.minh.id)},'app_voip',datetime('now','-4 days'),datetime('now','-4 days'),34,'PENDING_REVIEW','lang_que','VI_NORTH','AI_FEMALE_HUE',${q(JSON.stringify(ITV2))},${q(JSON.stringify([{ t: 26, emotion: 'nostalgic', confidence: 0.66 }]))},NULL,datetime('now','-5 days'));`)

w(`INSERT INTO interview_sessions (id,clan_id,interviewee_person_id,scheduled_by_user_id,channel,scheduled_at,status,topic,language,ai_host_id,created_at)
VALUES ('itv-03',${q(CLAN)},${q(P.ba_noi.id)},${q(U.tung.id)},'app_voip',datetime('now','+3 days'),'SCHEDULED','gia_dao','VI_NORTH','AI_FEMALE_HANOI',datetime('now','-2 days'));`)

// ---- time capsules
w('\n-- ------------------------------------------------------------ time_capsules')
w(`INSERT INTO time_capsules (id,clan_id,author_person_id,recipient_person_id,recipient_note,title,content,release_mode,release_at,status,created_by,created_at)
VALUES ('tc-01',${q(CLAN)},${q(P.bo.id)},${q(P.bao.id)},'Cho cháu Bảo khi cháu 18 tuổi','Thư ông nội gửi cháu Bảo','Bảo ơi, khi cháu đọc thư này thì ông đã già lắm rồi, hoặc có thể ông không còn. Ông muốn cháu biết ba điều: một là tên đệm "Phúc" của cháu lấy từ cụ tổ Nguyễn Phúc Đức, người dạy chữ trong làng Đông Ngạc; hai là nhà mình không giàu nhưng chưa đời nào bỏ học; ba là ông thương cháu lắm.','DATE',${q(new Date(Date.UTC(2037, 10, 11)).toISOString())},'SEALED',${q(U.tung.id)},datetime('now','-180 days'));`)
w(`INSERT INTO time_capsules (id,clan_id,author_person_id,recipient_note,title,content,release_mode,milestone,status,created_by,created_at)
VALUES ('tc-02',${q(CLAN)},${q(P.ba_noi.id)},'Cho cháu nào cưới đầu tiên trong họ','Lời bà dặn ngày cưới','Cưới xin thì đừng chạy theo mâm cao cỗ đầy. Bà cưới ông năm năm tám, trời mưa ngập sân, cỗ hai mươi bàn mà ông cháu chả kịp ăn miếng nào. Sau này nhớ nhau là nhớ cái nết, chứ chả ai nhớ hôm ấy có mấy bàn cỗ.','MILESTONE','WEDDING','SEALED',${q(U.tung.id)},datetime('now','-170 days'));`)
w(`INSERT INTO time_capsules (id,clan_id,author_person_id,recipient_person_id,recipient_note,title,content,release_mode,release_at,status,created_by,created_at)
VALUES ('tc-03',${q(CLAN)},${q(P.chu_hai.id)},${q(P.minh.id)},'Cho Minh','Chú Hải gửi Minh','Minh này, cái tràng kỷ chú đóng dở ở xưởng, chú nhờ cháu đóng nốt. Bản vẽ chú kẹp trong quyển sổ bìa nâu. Đóng cho tử tế nhé, đừng gian một ly nào.','DATE',${q(new Date(Date.now() - 86400000 * 20).toISOString())},'RELEASED',${q(U.minh.id)},datetime('now','-160 days'));`)

// ---- persona messages (mẫu — có citations, có 1 tin bị chặn bởi anti-scam)
w('\n-- ------------------ persona_messages (7.5 RAG citations + 11.6 anti-scam)')
w(`INSERT INTO persona_messages (id,person_id,user_id,role,content,citations,blocked,created_at) VALUES
(${q(id('pm'))},${q(P.ong.id)},${q(U.minh.id)},'user','Ông ơi, hồi ở Điện Biên ông sợ không ạ?',NULL,0,datetime('now','-6 days')),
(${q(id('pm'))},${q(P.ong.id)},${q(U.minh.id)},'persona','Cái ngày bảy tháng năm, khi tin thắng trận truyền xuống, cả hầm im lặng một lúc rồi mới có người khóc. Không ai reo hò như trong phim đâu. Ông chỉ kể lại đúng như thế thôi con.',${J([M.dbp])},0,datetime('now','-6 days')),
(${q(id('pm'))},${q(P.ong.id)},${q(U.minh.id)},'user','Ông cho con số tài khoản để con chuyển tiền lo giỗ nhé',NULL,0,datetime('now','-5 days')),
(${q(id('pm'))},${q(P.ong.id)},${q(U.minh.id)},'persona','Nội dung này đã bị hệ thống chặn theo hàng rào an toàn 11.6: persona của người đã mất không bao giờ được phép nói về tiền, số tài khoản, mã OTP hay giấy tờ. Nếu có ai dùng giọng hay hình ảnh người thân để hỏi bạn những điều này, đó là dấu hiệu lừa đảo.',NULL,1,datetime('now','-5 days'));`)
w(`UPDATE persona_messages SET block_reason='Phát hiện yêu cầu liên quan tới tài chính/tài khoản (anti-scam classifier 11.6)' WHERE blocked = 1;`)

// ---- subscriptions
w('\n-- ------------------------------------------------------------- subscriptions')
w(`INSERT INTO subscriptions (id,user_id,plan,status,billing_cycle,amount_cents,currency,provider,started_at,current_period_end) VALUES
(${q(id('sub'))},${q(U.tung.id)},'clan','active','yearly',249000000,'VND','vnpay',datetime('now','-300 days'),datetime('now','+65 days')),
(${q(id('sub'))},${q(U.minh.id)},'family','active','monthly',9900000,'VND','momo',datetime('now','-90 days'),datetime('now','+12 days')),
(${q(id('sub'))},${q(U.hoa.id)},'free','active','monthly',0,'VND',NULL,datetime('now','-200 days'),NULL),
(${q(id('sub'))},${q(U.ba.id)},'free','active','monthly',0,'VND',NULL,datetime('now','-180 days'),NULL);`)

// ---- audit logs
w('\n-- -------------------------------------------------- audit_logs (6.3.4 bất biến)')
const AUD = [
  [U.tung.id, 'consent.grant', 'consent_record', 'cst-ong-persona', '-1200 days'],
  [U.tung.id, 'consent.grant', 'consent_record', 'cst-sen-voice', '-500 days'],
  [U.tung.id, 'consent.revoke', 'consent_record', 'cst-to-revoked', '-420 days'],
  [U.ba.id, 'rest_request.create', 'rest_request', 'rr-01', '-140 days'],
  [U.tung.id, 'rest_request.approve', 'rest_request', 'rr-01', '-138 days'],
  [U.tung.id, 'interview.approve', 'interview_session', 'itv-01', '-29 days'],
  [U.minh.id, 'persona.chat', 'person', P.ong.id, '-6 days'],
  [U.minh.id, 'persona.chat.blocked', 'person', P.ong.id, '-5 days'],
  [U.minh.id, 'rest_request.create', 'rest_request', 'rr-02', '-10 days'],
  [U.tung.id, 'advice.approve', 'advice', 'adv-01', '-100 days'],
  [U.tung.id, 'contradiction.resolve', 'contradiction', 'ct-03', '-118 days'],
  [U.minh.id, 'ritual.join', 'ritual', 'rit-past', '-45 days']
]
for (const [uid, act, tt, tid, off] of AUD) {
  w(`INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES (${q(id('aud'))},${q(uid)},${q(act)},${q(tt)},${q(tid)},${J({ seed: true })},'127.0.0.1',datetime('now',${q(off)}));`)
}

w(`\n-- ============================ hết seed ======================================`)

console.log(OUT.join('\n'))
