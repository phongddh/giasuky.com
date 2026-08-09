# Gia Sử Ký (giasuky.com)

> Nền tảng gia phả số & di sản tinh thần cho gia đình Việt — kết hợp DNA, AI và ký ức nhiều góc nhìn.
> Triển khai theo `GiaSuKy-Technical-Specification-v1.0.md` (15 chương, 7 tính năng đột phá F1–F7).

## 1. Tổng quan dự án

- **Tên**: Gia Sử Ký / giasuky.com
- **Mục tiêu**: Số hoá gia phả, lưu giữ ký ức và "lời dặn" của tổ tiên, cho phép con cháu tra cứu — nhưng luôn đặt **sự đồng thuận (consent)** và **chống bịa đặt (anti-hallucination)** lên trên trải nghiệm.
- **Tech stack**: Hono 4 + TypeScript + Cloudflare Pages/Workers + Cloudflare D1 (SQLite) + TailwindCSS (CDN) + Vanilla JS (no framework).

### 7 tính năng đột phá đã hiện thực

| Mã | Tính năng | Trạng thái | Ghi chú hiện thực |
|----|-----------|-----------|-------------------|
| **F1** | Bàn thờ số (Digital Altar) | ✅ | Chủ đề theo 6 tôn giáo, thắp hương/dâng hoa realtime, offline queue (AC-F1.4) |
| **F2** | AI Phỏng vấn & Persona tổ tiên | ✅ | 5 AI host, phỏng vấn theo 6 chủ đề, persona chat có trích dẫn bắt buộc |
| **F3** | Cây gia phả tương tác | ✅ | 5 thế hệ, đường nét đứt cho quan hệ chưa xác thực, SVG/CSS 2.5D |
| **F4** | Rashomon — ký ức nhiều góc nhìn | ✅ | Nhiều lời kể cùng một sự kiện + phát hiện & giải quyết mâu thuẫn |
| **F5** | Cuộn Lời Dặn (Legacy Scroll) | ✅ | Trích lời dặn từ ký ức, xác minh câu trích là substring thật của nguồn |
| **F6** | Đồng bộ nghi lễ (Ritual Sync) | ✅ | Lịch âm, RSVP, đồng bộ tiến trình bằng polling cursor |
| **F7** | Sổ đồng thuận (Consent Ledger) | ✅ | `record_hash` SHA-256, chuỗi xác minh, thu hồi, di chúc số, audit log |

### 4 nguyên tắc bảo vệ (spec ch.11)

- **P2 — Consent Before Everything**: `assertConsent()` chặn mọi tính năng AI nếu chưa có đồng thuận hợp lệ. Scope rủi ro cao (giọng nói / khuôn mặt) bắt buộc `VIDEO_CONSENT` / `NATIONAL_EID` / `NOTARY`, nếu không → **422**.
- **P3 — Grief-aware**: `detectGrief()` phát hiện dấu hiệu đau buồn nặng → trả về thông báo dịu + hotline **096 306 1414**.
- **P4 — Anti-scam**: quét **cả câu hỏi vào và câu trả lời ra** (`scanOutput`) theo 11.6 — chặn OTP, chuyển tiền, số tài khoản, mật khẩu, giấy tờ tuỳ thân, và các chủ đề ngoài phạm vi (y tế, chính trị, đầu tư).
- **Anti-hallucination (7.6)**: **không gọi LLM nếu không tìm được ≥1 ký ức nguồn**; mọi câu trả lời persona bắt buộc kèm `citations: [memoryId]` + watermark.

## 2. URLs

- **Preview (sandbox)**: https://3000-i3i967f48uvcy1y1eku2a-b237eb32.sandbox.novita.ai
- **Health check**: `/api/health` → `{"ok":true,"service":"giasuky","llmReady":true}`
- **GitHub**: https://github.com/phongddh/giasuky.com
- **Production (Cloudflare Pages)**: chưa deploy (xem §6)

### Trang giao diện

| Đường dẫn | Trang |
|-----------|-------|
| `/` | Landing + nút "Dùng thử demo" |
| `/dashboard` | Tổng quan dòng họ, giỗ chạp sắp tới, lịch âm hôm nay |
| `/tree` | F3 — Cây gia phả |
| `/altar` | F1 — Bàn thờ số |
| `/memories` | Ký ức + F4 Rashomon |
| `/scroll` | F5 — Cuộn Lời Dặn |
| `/interview` | F2 — AI phỏng vấn + Persona chat |
| `/rituals` | F6 — Nghi lễ & lịch âm |
| `/consent` | F7 — Sổ đồng thuận, di chúc số, audit log |

## 3. API (73 endpoints, prefix `/api/v1`)

Mọi lỗi trả về theo **RFC 7807 Problem Details**.

<details>
<summary><b>Auth — 7 endpoints</b></summary>

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/auth/register` | `{email, password, full_name, phone?}` |
| POST | `/auth/login` | `{email, password}` |
| POST | `/auth/demo` | Đăng nhập nhanh tài khoản demo |
| POST | `/auth/logout` | |
| GET | `/auth/me` | Người dùng hiện tại + dòng họ + gói |
| POST | `/auth/elder-mode` | Bật/tắt chế độ chữ lớn cho người cao tuổi |
| GET | `/auth/export` | Xuất toàn bộ dữ liệu của người dùng (GDPR) |
</details>

<details>
<summary><b>Genealogy — 10 endpoints</b></summary>

| Method | Path | Mô tả |
|--------|------|-------|
| GET / POST | `/clans` | Danh sách / tạo dòng họ |
| GET | `/clans/:clanId` | Chi tiết dòng họ |
| GET | `/clans/:clanId/tree` | **Cây gia phả** (recursive CTE thay Neo4j) |
| POST | `/clans/:clanId/members` | Thêm thành viên |
| GET / PATCH | `/persons/:id` | Chi tiết / cập nhật một người |
| POST | `/persons/:id/relationships` | Thêm quan hệ |
| GET | `/persons` | Tìm/duyệt người |
| GET | `/dashboard` | Thống kê + giỗ sắp tới + lịch âm |
</details>

<details>
<summary><b>Memories / Events / Advices — 17 endpoints</b></summary>

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/memories` | Tạo ký ức (tự sinh `content_no_tone` + embedding) |
| GET / DELETE | `/memories/:id` | |
| GET | `/persons/:id/memories` | Ký ức của một người |
| GET / POST | `/events` | |
| GET | `/events/:id/rashomon` | **F4** — tất cả góc nhìn + mâu thuẫn |
| POST | `/events/:id/detect-contradictions` | Phát hiện mâu thuẫn |
| POST | `/contradictions/:id/resolve` | Người thật giải quyết (CLARIFIED) |
| GET | `/contradictions` | |
| GET | `/search?q=` | **Tìm không dấu** cho memories/persons/advices/events |
| GET | `/advices` | **F5** — Cuộn Lời Dặn |
| POST | `/advices/extract` | Trích lời dặn (xác minh substring nguồn) |
| POST | `/advices/:id/approve` · DELETE `/advices/:id` | |
| GET / POST | `/time-capsules` | Hộp thời gian |
</details>

<details>
<summary><b>Consent Ledger (F7) — 13 endpoints</b></summary>

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/consent/scopes` | 6 scope đồng thuận |
| GET | `/consent` · `/consent/subject/:personId` | |
| POST | `/consent` | Tạo bản ghi (422 nếu scope rủi ro cao thiếu phương thức ký) |
| POST | `/consent/:id/revoke` | Thu hồi |
| GET | `/consent/:id/verify` | Xác minh `record_hash` |
| GET / POST | `/rest-requests` · POST `/rest-requests/:id/approve` | "Xin cho người đã mất được nghỉ" |
| GET / POST | `/wills` · POST `/wills/:id/activate` | Di chúc số |
| GET | `/audit-logs` | |
</details>

<details>
<summary><b>AI (F2) — 11 endpoints</b></summary>

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/ai/hosts` | 5 AI host phỏng vấn |
| GET / POST | `/interviews` · GET `/interviews/:id` | |
| POST | `/interviews/:id/turn` · `/end` · `/approve` | |
| GET | `/personas/:personId/status` | Kiểm tra gating đồng thuận |
| GET | `/personas/:personId/messages` | |
| POST | `/personas/:personId/chat` | **Persona chat** — `{message}` → `{reply, citations[], blocked?, grief?}` |
| POST | `/personas/:personId/chat-stream` | SSE |
</details>

<details>
<summary><b>Rituals (F1 + F6) — 15 endpoints</b></summary>

| Method | Path | Mô tả |
|--------|------|-------|
| GET / POST | `/altars` · GET/PATCH `/altars/:id` | **F1** Bàn thờ số |
| POST | `/ritual-events` · GET `/ritual-events/stream` | Đồng bộ realtime (polling cursor) |
| GET / POST | `/rituals` · GET `/rituals/:id` | **F6** |
| POST | `/rituals/:id/rsvp` · `/join` · `/complete` | |
| GET | `/lunar/calendar` · `/lunar/convert` | Lịch âm Hồ Ngọc Đức (UTC+7) |
| POST | `/media/:mediaId/restore-photo` | Phục dựng ảnh cũ |
</details>

## 4. Kiến trúc dữ liệu

### Storage services
- **Cloudflare D1 (SQLite)** — toàn bộ dữ liệu quan hệ, **28 bảng** (`migrations/0001_initial_schema.sql`).
- **Không dùng bộ nhớ tạm / filesystem** — Workers không có `fs`.

### Nhóm bảng chính
| Nhóm | Bảng |
|------|------|
| Danh tính | `users`, `sessions`, `subscriptions`, `audit_logs` |
| Gia phả | `clans`, `clan_members`, `persons`, `relationships`, `locations` |
| Ký ức | `events`, `memories`, `memory_embeddings`, `contradictions`, `media` |
| Di sản | `advices`, `time_capsules`, `digital_wills` |
| Nghi lễ | `altars`, `rituals`, `ritual_participants`, `ritual_events` |
| Đồng thuận | `consent_records`, `rest_requests` |
| AI | `interview_sessions`, `interview_turns`, `persona_messages`, `ai_rate_limits` |

### Luồng dữ liệu AI (RAG — spec 7.5)

```
Câu hỏi
  └─ scanOutput(input)         ← P4 chặn lừa đảo ngay ở đầu vào (11.6)
  └─ detectGrief()             ← P3 phát hiện đau buồn
  └─ assertConsent()           ← P2 chặn nếu chưa đồng thuận
  └─ embed() → vector search   ← memory_embeddings + cosine trong Worker
  └─ hybrid rerank             ← 0.55*vector + 0.45*keyword, ngưỡng 0.14
  └─ nếu KHÔNG có ký ức nào  → KHÔNG gọi LLM (7.6 rule 1)
  └─ buildPersonaPrompt() → LLM → postProcessPersona()
  └─ scanOutput(output) + citations[] + watermark
```

### Thay thế hạ tầng (spec → môi trường edge)

Spec gốc yêu cầu 10 microservice NestJS/FastAPI + Neo4j + PostgreSQL + Elasticsearch + Qdrant + Kafka + K8s + mediasoup + GPU voice-cloning. Trên Cloudflare Pages/Workers, các thành phần được ánh xạ như sau:

| Spec | Hiện thực |
|------|-----------|
| Neo4j (graph traversal) | D1 **recursive CTE** |
| Elasticsearch (full-text VN) | cột `content_no_tone` + `removeTone()` + LIKE |
| Qdrant (vector DB) | bảng `memory_embeddings` + cosine trong Worker |
| Three.js 3D altar | SVG / CSS 2.5D |
| mediasoup SFU | polling cursor (`/ritual-events/stream`) |
| Twilio PSTN interview | AI interviewer trên web |
| bcrypt | **Web Crypto PBKDF2-SHA256** 100k vòng |

## 5. Hướng dẫn sử dụng

```bash
# 1. Cài đặt
npm install

# 2. Áp dụng schema + dữ liệu mẫu vào D1 local
npm run db:migrate:local
npm run db:seed

# 3. Build & chạy
npm run build
pm2 start ecosystem.config.cjs

# 4. Kiểm tra
curl http://localhost:3000/api/health
```

**Tài khoản demo** — bấm nút *"Dùng thử demo"* trên trang chủ, hoặc đăng nhập:
- Email: `tung.nguyen@example.com`
- Mật khẩu: `giasuky123`

**Dữ liệu mẫu**: 4 người dùng, 15 nhân vật / 5 thế hệ (có 1 nhánh chưa xác thực vẽ nét đứt), 27 quan hệ, 15 ký ức (gồm 3 góc nhìn Rashomon về đám cưới 1958), 3 mâu thuẫn, 7 lời dặn, 6 nghi lễ, 5 bản ghi đồng thuận (active/sunset/revoked), 2 di chúc số, 12 audit log.

**Cần đổi dữ liệu mẫu?** Sửa `tools/gen-seed.mjs` rồi chạy lại `node tools/gen-seed.mjs > seed.sql` — hash mật khẩu và embedding phải được sinh bằng đúng thuật toán trong `src/lib/util.ts`.

**Biến môi trường** (`.dev.vars`, đã git-ignore):
```
APP_ENV=development            # 'development' = chế độ mở (sandbox/demo); thiếu hoặc khác = production nghiêm ngặt
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1
LLM_MODEL=gpt-5-mini
# ALLOWED_ORIGINS=https://giasuky.com   # origin bổ sung được phép cho CORS (phân tách dấu phẩy)
```
Nếu không có LLM key hợp lệ, persona chat **vẫn hoạt động an toàn**: hệ thống trả về nguyên văn câu nói đã lưu kèm trích dẫn, không bịa thêm.

### Mô hình kiểm soát truy cập (bảo mật Giai đoạn 1)

Mọi quyền đọc/ghi dữ liệu dòng họ đi qua `src/lib/access.ts`, 2 chế độ theo `APP_ENV`:

| Chế độ | Điều kiện | Quyền truy cập |
|---|---|---|
| **Production** (mặc định — thiếu hoặc khác `development`) | `APP_ENV != development` | **Chỉ thành viên** (`clan_members`) của đúng dòng họ mới đọc/ghi được dữ liệu. Khách bị chặn toàn bộ. `/auth/demo` bị khoá. |
| **Mở / sandbox** | `APP_ENV=development` | Giữ hành vi demo: khách xem được clan mẫu, ghi cần đăng nhập. `/auth/demo` hoạt động. |

Các điểm chốt đã triển khai:

- **Chống IDOR xuyên clan**: mọi endpoint theo resource (person, memory, event, advice, altar, ritual, interview, consent, will, rest-request, contradiction) đều resolve `clan_id` của tài nguyên rồi so với quyền của user. Không thể sửa/xoá/duyệt/thu hồi dữ liệu của dòng họ khác.
- **Search và các danh sách** (`/search`, `/events`, `/advices`, `/consent`, `/wills`, `/rest-requests`, `/altars`, `/rituals`, `/interviews`, `/audit-logs`) lọc theo clan người dùng được phép.
- **CSRF**: mọi POST/PATCH/PUT/DELETE có header `Origin` từ nguồn không thuộc (cùng host, `*.pages.dev`, hoặc `ALLOWED_ORIGINS`) → **403**. CORS không còn `origin:'*'`+`credentials:true` (combo bất hợp lệ).
- **Rate limit atomic**: `checkRateLimit` dùng 1 câu UPSERT (ON CONFLICT ... DO UPDATE) — hết TOCTOU; áp dụng cho đăng nhập (10 lần/15 phút/email+IP), đăng ký (5/giờ/IP), persona chat, phỏng vấn.
- **Email chuẩn hoá**: lowercase + trim + kiểm tra định dạng ở cả register và login.
- **Guardrail đồng nhất giữa `/personas/:id/chat` và `/personas/:id/chat-stream`**: rate limit chung, quét đầu vào, grief-aware, lưu log — không thể bypass qua đường streaming.

## 6. Trạng thái triển khai

- **Platform**: Cloudflare Pages + D1
- **Status**: ✅ Chạy được ở sandbox / ❌ Chưa deploy production
- **Trước khi deploy production cần**:
  1. `npx wrangler d1 create webapp-production` rồi thay `database_id: "local-dev-placeholder"` trong `wrangler.jsonc` bằng ID thật.
  2. `npx wrangler d1 migrations apply webapp-production` (production).
  3. `npx wrangler pages secret put OPENAI_API_KEY` và `npx wrangler pages secret put APP_ENV` (giá trị `production`; không đặt → mặc định đã là production nghiêm ngặt).
  4. `npm run deploy:prod`.

## 7. Chưa hoàn thiện / bước tiếp theo

- [ ] **Truy hồi lệch chủ đề**: câu hỏi ngoài phạm vi vẫn có thể khớp một ký ức không liên quan (điểm 0.253 > ngưỡng 0.14) vì việc bỏ dấu làm "quán" ≈ "quần". Hướng sửa: tính điểm trên token **có dấu** khi câu hỏi vốn đã có dấu.
- [ ] **LLM key hiện hết hạn** (401) — cần nạp lại key để dùng đầy đủ AI (fallback vẫn an toàn).
- [ ] Deploy production lên Cloudflare Pages + bind D1 thật.
- [ ] Clone giọng nói / phục dựng ảnh bằng AI thật (hiện là stub, đúng theo giới hạn edge runtime).
- [ ] Video call nghi lễ (mediasoup SFU) — cần server riêng, không khả thi trên Workers.
- [ ] Tích hợp DNA lab & đối sánh quan hệ sinh học.
- [ ] Test tự động (unit / e2e) — hiện chỉ có smoke test bằng `curl`.
- [ ] Deploy production: set `APP_ENV=production` + kiểm tra quyền truy cập theo thành viên dòng họ (đã triển khai code, cần verify trên môi trường thật).

---

**Tech Stack**: Hono 4 · TypeScript · Cloudflare Pages/Workers · Cloudflare D1 · Vite 8 · TailwindCSS (CDN) · PM2
**Last Updated**: 2026-08-09 (Giai đoạn 1 — bảo mật: access control, CSRF, rate limit, khoá demo, guardrail stream)
