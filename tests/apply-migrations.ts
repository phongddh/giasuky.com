import { applyD1Migrations, env } from 'cloudflare:test'
import { beforeAll } from 'vitest'

/** Seed tối thiểu cho integration tests (đủ dữ liệu demo: user, clan, persons) */
async function seed() {
  const db = env.DB
  await db.prepare(
    `INSERT INTO users (id, email, hashed_password, full_name, elder_mode) VALUES (?,?,?,?,0)`
  ).bind('user-tung', 'tung.nguyen@example.com', 'x', 'Nguyễn Văn Tùng').run()
  await db.prepare(
    `INSERT INTO users (id, email, hashed_password, full_name, elder_mode) VALUES (?,?,?,?,0)`
  ).bind('user-minh', 'minh.nguyen@example.com', 'x', 'Nguyễn Văn Minh').run()
  await db.prepare(`INSERT INTO clans (id, name, patriarch_user_id) VALUES (?,?,?)`)
    .bind('clan-nguyen-dongngac', 'Họ Nguyễn Đồng Ngạc', 'user-tung').run()
  await db.prepare(`INSERT INTO clan_members (clan_id, user_id, role) VALUES (?,?,?)`)
    .bind('clan-nguyen-dongngac', 'user-tung', 'patriarch').run()
  await db.prepare(`INSERT INTO clan_members (clan_id, user_id, role) VALUES (?,?,?)`)
    .bind('clan-nguyen-dongngac', 'user-minh', 'member').run()
  const persons: Array<[string, string, string]> = [
    ['p-ong', 'Nguyễn Văn Thịnh', 'M'],
    ['p-ba_noi', 'Trần Thị Sen', 'F'],
    ['p-bo', 'Nguyễn Văn Hòa', 'M']
  ]
  for (const [id, name, gender] of persons) {
    await db.prepare(
      `INSERT INTO persons (id, clan_id, full_name, gender, is_alive, created_by) VALUES (?,?,?,?,?,?)`
    ).bind(id, 'clan-nguyen-dongngac', name, gender, id === 'p-bo' ? 1 : 0, 'user-tung').run()
  }
  await db.prepare(
    `INSERT INTO memories (id, clan_id, type, content, subject_person_id, status, created_by) VALUES (?,?,?,?,?,?,?)`
  ).bind('m-ong-01', 'clan-nguyen-dongngac', 'TEXT', 'Hồi đó ông làm nghề thợ mộc giỏi nhất làng.', 'p-ong', 'APPROVED', 'user-tung').run()
  for (let i = 1; i <= 3; i++) {
    await db.prepare(
      `INSERT INTO events (id, clan_id, title, event_date, event_type) VALUES (?,?,?,?,?)`
    ).bind(`e-t${i}`, 'clan-nguyen-dongngac', `Sự kiện thử ${i}`, `199${i}-05-10`, 'WEDDING').run()  }
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
  await seed()
})
