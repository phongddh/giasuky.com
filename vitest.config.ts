import path from 'node:path'
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    cloudflareTest(async () => {
      const migrationsPath = path.join(__dirname, 'migrations')
      const migrations = await readD1Migrations(migrationsPath)
      return {
        main: './src/index.tsx',
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations }
        }
      }
    })
  ],
  test: {
    setupFiles: ['./tests/apply-migrations.ts'],
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000
  }
})
