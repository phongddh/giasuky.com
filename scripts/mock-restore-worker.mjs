#!/usr/bin/env node
/**
 * GĐ5-26 — Mock GPU worker cho pipeline phục dựng ảnh.
 * Simulate worker ngoài repo: QUEUED → RUNNING (chờ 5s) → COMPLETED.
 * Chạy: node scripts/mock-restore-worker.mjs [--once] [--interval 8000]
 * Dùng SQL thuần (không parse output) — worker thật ngoài repo làm đúng
 * chuyển trạng thái này sau khi pipeline GPU chạy xong.
 */
import { execFileSync } from 'node:child_process'

const once = process.argv.includes('--once')
const intervalArg = process.argv.find((a) => a.startsWith('--interval='))
const interval = intervalArg ? parseInt(intervalArg.split('=')[1], 10) : 8000
const DB = 'webapp-production'
const OUTPUTS =
  '[{"kind":"original","url":"https://cdn.giasuky.com/mock/original.jpg"},' +
  '{"kind":"restored_bw","url":"https://cdn.giasuky.com/mock/restored_bw.jpg"},' +
  '{"kind":"restored_color","url":"https://cdn.giasuky.com/mock/restored_color.jpg"}]'

function sql(command) {
  execFileSync('npx', ['wrangler', 'd1', 'execute', DB, '--local', '--command', command], {
    cwd: new URL('..', import.meta.url).pathname,
    stdio: ['ignore', 'pipe', 'inherit']
  })
}

function tick() {
  // Bước 1: QUEUED → RUNNING (đánh dấu updated_at để đo thời gian "GPU chạy")
  sql(
    `UPDATE media_restorations SET status='RUNNING', progress=10, updated_at=datetime('now')
      WHERE id = (SELECT id FROM media_restorations WHERE status='QUEUED' LIMIT 1)`
  )
  // Bước 2: job RUNNING đã qua 5 giây → COMPLETED (mô phỏng pipeline GPU)
  sql(
    `UPDATE media_restorations SET status='COMPLETED', progress=100,
            outputs='${OUTPUTS.replace(/'/g, "''")}', updated_at=datetime('now')
      WHERE status='RUNNING' AND updated_at <= datetime('now','-5 seconds')`
  )
  console.log(`[mock-worker] tick ${new Date().toISOString()}`)
}

console.log(`[mock-worker] polling mỗi ${interval}ms (--once để chạy 1 lần)`)
tick()
if (!once) setInterval(tick, interval)
