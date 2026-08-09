#!/usr/bin/env node
/**
 * GĐ4-24 — Backup D1 (local hoặc remote) ra file .sql
 * Cách dùng:
 *   node scripts/backup-d1.mjs                # backup local (mặc định)
 *   node scripts/backup-d1.mjs --remote       # backup production D1
 *   node scripts/backup-d1.mjs --remote --out backups/prod-2026-08-09.sql
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const args = process.argv.slice(2)
const remote = args.includes('--remote')
const outIdx = args.indexOf('--out')
const db = 'webapp-production'

const date = new Date().toISOString().slice(0, 10)
const outDir = join(root, 'backups')
mkdirSync(outDir, { recursive: true })
const outFile = outIdx >= 0 ? args[outIdx + 1] : join(outDir, `${remote ? 'prod' : 'local'}-${date}.sql`)

console.log(`[backup] ${remote ? 'REMOTE' : 'LOCAL'} D1 → ${outFile}`)
const cmd = ['d1', 'export', db, '--output', outFile]
if (remote) cmd.push('--remote')
else cmd.push('--local')
try {
  execFileSync('npx', ['wrangler', ...cmd], { cwd: root, stdio: 'inherit' })
  const size = existsSync(outFile) ? (statSync(outFile).size / 1024).toFixed(1) + ' KB' : '?'
  console.log(`[backup] OK (${size})`)
} catch (e) {
  console.error('[backup] FAILED:', e.message)
  process.exit(1)
}
