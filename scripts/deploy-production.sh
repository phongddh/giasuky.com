#!/usr/bin/env bash
# =====================================================================
# Gia Sử Ký — Deploy production (checklist P0, ROADMAP mục cuối)
# Cách dùng:
#   ./scripts/deploy-production.sh --dry-run          # rehearsal: không thay đổi gì
#   ./scripts/deploy-production.sh                    # deploy chuẩn (APP_ENV=production)
#   ./scripts/deploy-production.sh --seed             # + seed dữ liệu demo (KHÔNG khuyến khích prod)
#   ./scripts/deploy-production.sh --openai-key=sk-... --base-url=... --model=...
#   ./scripts/deploy-production.sh --allowed-origins=domain1,domain2
#   ./scripts/deploy-production.sh --url=https://ten.pages.dev   # smoke test địa chỉ tùy chọn
#
# Đặc tính: fail-fast (dừng ngay khi lỗi), idempotent (chạy lại an toàn),
# chỉ sửa wrangler.jsonc khi database_id vẫn là placeholder (hoặc --force).
# =====================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

DRY=0; SEED=0; FORCE=0; URL=""
OPENAI_KEY=""; BASE_URL=""; MODEL=""; ALLOWED=""
for a in "$@"; do
  case "$a" in
    --dry-run) DRY=1 ;;
    --seed) SEED=1 ;;
    --force) FORCE=1 ;;
    --url=*) URL="${a#--url=}" ;;
    --openai-key=*) OPENAI_KEY="${a#--openai-key=}" ;;
    --base-url=*) BASE_URL="${a#--base-url=}" ;;
    --model=*) MODEL="${a#--model=}" ;;
    --allowed-origins=*) ALLOWED="${a#--allowed-origins=}" ;;
    *) echo "❌ Cờ không biết: $a"; exit 1 ;;
  esac
done

step() { echo; echo "──────────────────────────────────────────────"; echo "▶ $1"; }
fail() { echo "❌ $1"; exit 1; }
run() {
  if [ "$DRY" = 1 ]; then echo "  [dry-run] $*"; return 0; fi
  "$@"
}
log() { if [ "$DRY" = 1 ]; then echo "  [dry-run] ✔ $1"; else echo "  ✔ $1"; fi; }

echo "=== Gia Sử Ký — deploy production (dry-run=$DRY, seed=$SEED, force=$FORCE) ==="

step "1. Kiểm tra xác thực wrangler"
if [ "$DRY" = 0 ]; then
  npx wrangler whoami 2>&1 | grep -q "authenticated" || fail "Chưa đăng nhập: chạy 'npx wrangler login' trước."
fi
log "Đã xác thực Cloudflare"

step "2. Tạo D1 'webapp-production' nếu chưa có"
DB_ID=$(node -e "
const s = require('fs').readFileSync('wrangler.jsonc','utf8');
const m = s.match(/\"database_id\"\s*:\s*\"([^\"]+)\"/);
process.stdout.write(m ? m[1] : '');
")
if [ -z "$DB_ID" ] || [ "$DB_ID" = "local-dev-placeholder" ] || [ "$FORCE" = 1 ]; then
  OUT=$(run npx wrangler d1 create webapp-production 2>&1 || true)
  if [ "$DRY" = 0 ]; then
    NEW_ID=$(echo "$OUT" | grep -oE '"id":\s*"[0-9a-f-]{36}"' | head -1 | grep -oE '[0-9a-f-]{36}' || true)
    if [ -z "$NEW_ID" ]; then
      # Đã tồn tại trên account → lấy ID từ danh sách
      NEW_ID=$(npx wrangler d1 list 2>/dev/null | grep "webapp-production" | grep -oE '[0-9a-f-]{36}' | head -1 || true)
      [ -z "$NEW_ID" ] && fail "Không tạo được D1: $OUT"
      log "D1 đã tồn tại — tái dùng ID"
    fi
    node -e "
const s = require('fs').readFileSync('wrangler.jsonc','utf8');
const next = s.replace(/\"database_id\"\s*:\s*\"[^\"]*\"/, '\"database_id\": \"$NEW_ID\"');
require('fs').writeFileSync('wrangler.jsonc', next);
console.log('  database_id → $NEW_ID');
"
  else
    log "sẽ tạo D1 + cập nhật database_id vào wrangler.jsonc"
  fi
else
  log "D1 đã có database_id thật ($DB_ID) — giữ nguyên"
fi

step "3. Áp dụng migrations lên remote"
run npx wrangler d1 migrations apply webapp-production --remote
log "Migrations đã áp dụng"

if [ "$SEED" = 1 ]; then
  step "3b. Seed dữ liệu demo lên remote"
  run npx wrangler d1 execute webapp-production --remote --file=seed.sql
  log "Seed đã chạy"
else
  log "Bỏ qua seed (dùng --seed nếu muốn, không khuyến khích production)"
fi

step "4. Secrets Pages"
if [ "$DRY" = 0 ]; then
  echo -n "production" | npx wrangler pages secret put APP_ENV --project-name webapp >/dev/null
  log "APP_ENV = production"
  if [ -n "$OPENAI_KEY" ]; then
    echo -n "$OPENAI_KEY" | npx wrangler pages secret put OPENAI_API_KEY --project-name webapp >/dev/null
    log "OPENAI_API_KEY đã đặt"
  fi
  if [ -n "$BASE_URL" ]; then
    echo -n "$BASE_URL" | npx wrangler pages secret put OPENAI_BASE_URL --project-name webapp >/dev/null
    log "OPENAI_BASE_URL đã đặt"
  fi
  if [ -n "$MODEL" ]; then
    echo -n "$MODEL" | npx wrangler pages secret put LLM_MODEL --project-name webapp >/dev/null
    log "LLM_MODEL đã đặt"
  fi
  if [ -n "$ALLOWED" ]; then
    echo -n "$ALLOWED" | npx wrangler pages secret put ALLOWED_ORIGINS --project-name webapp >/dev/null
    log "ALLOWED_ORIGINS đã đặt"
  fi
else
  log "sẽ đặt APP_ENV=production$( [ -n "$OPENAI_KEY" ] && echo ' + OPENAI_API_KEY' )$( [ -n "$BASE_URL" ] && echo ' + OPENAI_BASE_URL' )$( [ -n "$MODEL" ] && echo ' + LLM_MODEL' )$( [ -n "$ALLOWED" ] && echo ' + ALLOWED_ORIGINS' )"
fi

step "5. Test + build + deploy Pages"
run npx vitest run
run npm run build
run npx wrangler pages deploy dist --project-name webapp --branch main
log "Đã deploy"

step "6. Smoke test /api/health"
if [ -z "$URL" ]; then
  URL="https://webapp.pages.dev"
  [ "$DRY" = 1 ] && URL="https://webapp.pages.dev (mặc định)"
fi
if [ "$DRY" = 0 ]; then
  H=$(curl -s -m 20 "$URL/api/health" || true)
  echo "$H" | grep -q '"ok":true' || fail "Health check thất bại: $H"
  echo "  $H"
  echo "$H" | grep -q '"appEnv":"production"' || echo "  ⚠️  appEnv không phải production — kiểm tra secret APP_ENV!"
else
  log "sẽ curl $URL/api/health, mong đợi ok:true + appEnv:production"
fi

echo
echo "=== ✅ Hoàn tất (dry-run=$DRY). Nhớ: đẩy database_id thật lên git (git add wrangler.jsonc && git commit). ==="
