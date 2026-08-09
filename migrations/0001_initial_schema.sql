-- =====================================================================
-- Gia Sử Ký — Migration 0001: Initial schema
-- Ánh xạ CHƯƠNG 6 của đặc tả kỹ thuật v1.0 sang Cloudflare D1 (SQLite):
--   Neo4j graph (6.2)  -> persons / clans / relationships / memories /
--                          events / locations / advice (+ recursive CTE)
--   PostgreSQL   (6.3) -> users / consent_records / digital_wills /
--                          subscriptions / audit_logs / interview_sessions
--   Elasticsearch(6.4) -> cột content_no_tone + bảng ảo FTS
--   Qdrant       (6.5) -> memory_embeddings (vector JSON + cosine in-app)
-- =====================================================================

-- ------------------------- 6.3.1 Users & Auth ------------------------
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  hashed_password TEXT,
  vneid_verified INTEGER NOT NULL DEFAULT 0,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'vi',
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  -- P8/8.3.4: "Ông bà mode" (font lớn, contrast cao, giảm animation)
  elder_mode INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS user_person_links (
  user_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  relationship_role TEXT NOT NULL CHECK (relationship_role IN ('self','admin_for','guardian_for')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, person_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- --------------------- 6.2.1 (:Clan) ---------------------------------
CREATE TABLE IF NOT EXISTS clans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  origin_place TEXT,
  founded_year INTEGER,
  crest_image_id TEXT,
  patriarch_user_id TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  merit_fund_balance_vnd INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clan_members (
  clan_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('patriarch','council','member','viewer')),
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (clan_id, user_id)
);

-- --------------------- 6.2.1 (:Person) -------------------------------
CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  full_name TEXT NOT NULL,
  aliases TEXT,                       -- JSON array: tên tự, tên hiệu, tên gọi ở nhà
  gender TEXT CHECK (gender IN ('M','F','OTHER')),
  generation INTEGER,                 -- đời thứ mấy (dùng cho LOD 4.3.3)
  birth_date TEXT,
  death_date TEXT,
  birth_place TEXT,
  death_place TEXT,
  is_alive INTEGER NOT NULL DEFAULT 1,
  bio TEXT,
  religion TEXT,
  occupation TEXT,                    -- JSON array
  photo_url TEXT,
  photo_ids TEXT,                     -- JSON array
  audio_ids TEXT,
  video_ids TEXT,
  -- lịch giỗ theo âm lịch (F1/F6)
  death_anniv_lunar_day INTEGER,
  death_anniv_lunar_month INTEGER,
  is_verified INTEGER NOT NULL DEFAULT 0,
  confidence_score REAL NOT NULL DEFAULT 1.0,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_persons_clan ON persons(clan_id);
CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(full_name);

-- --------------------- 6.2.2 Relationship types ----------------------
-- CHILD_OF / SPOUSE_OF / SIBLING_OF / ADOPTED_BY
CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  from_person_id TEXT NOT NULL,
  to_person_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CHILD_OF','SPOUSE_OF','SIBLING_OF','ADOPTED_BY')),
  biological INTEGER NOT NULL DEFAULT 1,
  adopted INTEGER NOT NULL DEFAULT 0,
  married_at TEXT,
  divorced_at TEXT,
  marriage_order INTEGER DEFAULT 1,
  is_verified INTEGER NOT NULL DEFAULT 0,   -- nhánh chưa xác minh => nét đứt (8.4.1)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rel_from ON relationships(from_person_id, type);
CREATE INDEX IF NOT EXISTS idx_rel_to ON relationships(to_person_id, type);

-- --------------------- 6.2.1 (:Location) -----------------------------
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address_vn TEXT,
  lat REAL,
  lng REAL,
  historical_names TEXT               -- JSON array (VD: "Hà Đông" trước 2008)
);

-- --------------------- 6.2.1 (:Event) --------------------------------
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  title TEXT NOT NULL,
  event_date TEXT,
  event_type TEXT CHECK (event_type IN ('WEDDING','FUNERAL','BIRTH','DEATH','WAR','MIGRATION','OTHER')),
  location_id TEXT,
  location TEXT,
  significance TEXT DEFAULT 'FAMILY' CHECK (significance IN ('FAMILY','CLAN','HISTORICAL')),
  cover_photo_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_clan ON events(clan_id);

CREATE TABLE IF NOT EXISTS event_persons (
  event_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  PRIMARY KEY (event_id, person_id)
);

-- --------------------- 6.2.1 (:Memory) -------------------------------
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  type TEXT NOT NULL DEFAULT 'TEXT' CHECK (type IN ('TEXT','AUDIO','VIDEO','PHOTO','MIXED')),
  content TEXT NOT NULL,              -- transcript hoặc caption
  content_no_tone TEXT,               -- 6.4: search không dấu
  media_asset_ids TEXT,               -- JSON array
  media_url TEXT,
  language TEXT DEFAULT 'vi',
  perspective TEXT,                   -- "kể bởi cô Ba"
  told_by_person_id TEXT,             -- (:Memory)-[:TOLD_BY]->(:Person)
  subject_person_id TEXT,             -- (:Person)-[:HAS_MEMORY]->(:Memory)
  event_id TEXT,                      -- (:Memory)-[:ABOUT_EVENT]->(:Event)
  location_id TEXT,
  location TEXT,
  event_date TEXT,
  source TEXT DEFAULT 'MANUAL' CHECK (source IN ('MANUAL','AI_INTERVIEW','IMPORT','TIME_CAPSULE')),
  interview_session_id TEXT,
  -- moderation & duyệt (AC-F2.4 / AC-F1.3)
  status TEXT NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING_REVIEW','APPROVED','REJECTED')),
  visibility TEXT NOT NULL DEFAULT 'CLAN' CHECK (visibility IN ('PRIVATE','FAMILY','CLAN','PUBLIC')),
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mem_subject ON memories(subject_person_id);
CREATE INDEX IF NOT EXISTS idx_mem_event ON memories(event_id);
CREATE INDEX IF NOT EXISTS idx_mem_clan ON memories(clan_id);

CREATE TABLE IF NOT EXISTS memory_persons (   -- (:Memory)-[:INVOLVES_PERSON]->(:Person)
  memory_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  PRIMARY KEY (memory_id, person_id)
);

-- 6.5 Qdrant thay bằng bảng embedding + cosine tính trong Worker
CREATE TABLE IF NOT EXISTS memory_embeddings (
  memory_id TEXT PRIMARY KEY,
  clan_id TEXT,
  person_id TEXT,
  modality TEXT DEFAULT 'text',
  dim INTEGER NOT NULL,
  vector TEXT NOT NULL,               -- JSON array float
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4.4.2 Contradiction detection
CREATE TABLE IF NOT EXISTS contradictions (
  id TEXT PRIMARY KEY,
  event_id TEXT,
  memory_a_id TEXT NOT NULL,
  memory_b_id TEXT NOT NULL,
  aspect TEXT,                        -- VD: weather / date / place
  claim_a TEXT,
  claim_b TEXT,
  severity TEXT DEFAULT 'LOW' CHECK (severity IN ('LOW','MEDIUM','HIGH')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLARIFIED','DISMISSED')),
  resolution_note TEXT,               -- KHÔNG auto-resolve (4.4.3)
  detected_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- --------------------- 6.2.1 (:Advice) — F5 --------------------------
CREATE TABLE IF NOT EXISTS advices (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  original_text TEXT NOT NULL,        -- 4.5.3: giữ NGUYÊN VĂN, không paraphrase
  category TEXT NOT NULL CHECK (category IN ('FILIAL_PIETY','EDUCATION','MARRIAGE','BUSINESS','ETHICS')),
  source_memory_id TEXT NOT NULL,     -- link ngược bắt buộc
  spoken_by_person_id TEXT,
  audio_url TEXT,
  approved_by_user_id TEXT,           -- human review (trưởng họ)
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_advice_clan ON advices(clan_id, category);

-- --------------------- 4.1 F1 Digital Altar --------------------------
CREATE TABLE IF NOT EXISTS altars (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  owner_user_id TEXT,
  name TEXT NOT NULL,
  subject_person_ids TEXT NOT NULL,   -- JSON array (ông bà chung một bàn)
  religion_theme TEXT NOT NULL DEFAULT 'Phat'
    CHECK (religion_theme IN ('Phat','CongGiao','CaoDai','HoaHao','DaoMau','KhongTonGiao')),
  spatial_assets TEXT,                -- JSON: background, ambient, incense, lighting
  ambient_sound TEXT DEFAULT 'chuong_chua',
  horizontal_scroll_text TEXT,        -- hoành phi
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ritual_events (      -- ritualLog của Altar (AC-F1.4)
  id TEXT PRIMARY KEY,
  altar_id TEXT,
  ritual_id TEXT,
  user_id TEXT,
  actor_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('INCENSE','FLOWER','OFFERING','PRAYER','CANDLE','JOIN','LEAVE')),
  payload TEXT,                       -- JSON: lời khấn, tên món cỗ...
  client_event_id TEXT,               -- offline queue idempotency
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ritevt_altar ON ritual_events(altar_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ritevt_ritual ON ritual_events(ritual_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ritevt_client ON ritual_events(client_event_id);

-- --------------------- 4.6 F6 Ritual Sync ----------------------------
CREATE TABLE IF NOT EXISTS rituals (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  altar_id TEXT,
  title TEXT NOT NULL,
  subject_person_id TEXT,
  ritual_type TEXT DEFAULT 'GIO' CHECK (ritual_type IN ('GIO','TET','THANH_MINH','CAU_AN','OTHER')),
  scheduled_at TEXT NOT NULL,         -- UTC ISO
  lunar_day INTEGER,
  lunar_month INTEGER,
  status TEXT NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED','LIVE','COMPLETED','CANCELED')),
  gia_huan_text TEXT,                 -- karaoke highlight khi trưởng họ đọc
  recording_url TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rituals_clan ON rituals(clan_id, scheduled_at);

CREATE TABLE IF NOT EXISTS ritual_participants (
  ritual_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rsvp TEXT NOT NULL DEFAULT 'MAYBE' CHECK (rsvp IN ('YES','NO','MAYBE')),
  joined_at TEXT,
  PRIMARY KEY (ritual_id, user_id)
);

-- --------------------- 6.3.2 Consent Ledger — F7 ---------------------
CREATE TABLE IF NOT EXISTS consent_records (
  id TEXT PRIMARY KEY,
  subject_person_id TEXT NOT NULL,
  scope TEXT NOT NULL,                -- JSON array of scopes (11.5.2)
  grantees TEXT,                      -- JSON array {userId, relationship, accessLevel}
  time_start TEXT NOT NULL DEFAULT (datetime('now')),
  time_end TEXT,                      -- NULL = perpetual (chịu Right to Rest)
  auto_sunset_config TEXT,            -- JSON {enabled, inactiveYears}
  right_to_rest TEXT,                 -- JSON {condition, inheritorApprovalCount}
  signature_method TEXT CHECK (signature_method IN ('NATIONAL_EID','HANDWRITTEN_SCAN','VIDEO_CONSENT','NOTARY')),
  signed_at TEXT,
  signer_ip TEXT,
  signer_device_fingerprint TEXT,
  video_consent_url TEXT,
  blockchain_tx_hash TEXT,            -- chỉ SHA-256 hash bản ghi, KHÔNG PII
  blockchain_contract_address TEXT,
  record_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('active','revoked','sunset','pending')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT,
  revoked_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_consent_subject ON consent_records(subject_person_id, status);

CREATE TABLE IF NOT EXISTS digital_wills (
  id TEXT PRIMARY KEY,
  testator_person_id TEXT NOT NULL,
  witness_ids TEXT,                   -- JSON array (>= 2 nhân chứng)
  inheritors TEXT,                    -- JSON array {userId, role, quorum}
  post_mortem_instructions TEXT,      -- JSON
  legal_review TEXT,                  -- JSON
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','signed','activated')),
  activated_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4.7.2 Right to Rest — phiếu đồng ý của người kế thừa
CREATE TABLE IF NOT EXISTS rest_requests (
  id TEXT PRIMARY KEY,
  consent_record_id TEXT NOT NULL,
  subject_person_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'SOFT_SUNSET' CHECK (mode IN ('SOFT_SUNSET','HARD_DELETE')),
  trigger TEXT NOT NULL CHECK (trigger IN ('INACTIVITY','MANUAL_TRIGGER','INHERITOR_DECISION')),
  required_approvals INTEGER NOT NULL DEFAULT 2,
  approvals TEXT,                     -- JSON array userId
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','EXECUTED','CANCELED')),
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  executed_at TEXT
);

-- --------------------- 6.3.5 AI Interviewer — F2 ---------------------
CREATE TABLE IF NOT EXISTS interview_sessions (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  interviewee_person_id TEXT NOT NULL,
  scheduled_by_user_id TEXT,
  channel TEXT NOT NULL DEFAULT 'app_voip' CHECK (channel IN ('app_voip','pstn_twilio')),
  scheduled_at TEXT,
  started_at TEXT,
  ended_at TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','FAILED','PENDING_REVIEW','APPROVED')),
  topic TEXT,
  language TEXT DEFAULT 'VI_NORTH'
    CHECK (language IN ('VI_NORTH','VI_CENTRAL','VI_SOUTH','EN','MIXED')),
  ai_host_id TEXT DEFAULT 'AI_FEMALE_SAIGON',
  audio_recording_url TEXT,
  transcript_raw TEXT,                -- JSON turns
  transcript_structured TEXT,         -- JSON đã cross-ref entity
  emotion_timeline TEXT,              -- JSON [{t, emotion}]
  consent_record_id TEXT,
  reviewed_by_user_id TEXT,
  reviewed_at TEXT,
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_interview_person ON interview_sessions(interviewee_person_id);

-- Time Capsule (2.3 supporting feature)
CREATE TABLE IF NOT EXISTS time_capsules (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  author_person_id TEXT,
  recipient_person_id TEXT,
  recipient_note TEXT,                -- VD: "cho cháu chưa sinh ra"
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  release_mode TEXT NOT NULL DEFAULT 'DATE' CHECK (release_mode IN ('DATE','ON_DEATH','MILESTONE')),
  release_at TEXT,
  milestone TEXT,
  status TEXT NOT NULL DEFAULT 'SEALED' CHECK (status IN ('SEALED','RELEASED')),
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- --------------------- 6.3.3 Subscription ----------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','family','clan','lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','trialing','past_due','canceled')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly','lifetime')),
  amount_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'VND',
  provider TEXT CHECK (provider IN ('stripe','vnpay','momo')),
  provider_subscription_id TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  current_period_end TEXT
);

-- --------------------- 6.3.4 Audit Log (immutable) -------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  action TEXT NOT NULL,               -- 'consent.grant', 'persona.chat', 'memory.delete'
  target_type TEXT,
  target_id TEXT,
  metadata TEXT,                      -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target_type, target_id);

-- Persona chat log (7.5 RAG + 7.6 anti-hallucination citations)
CREATE TABLE IF NOT EXISTS persona_messages (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  user_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user','persona')),
  content TEXT NOT NULL,
  citations TEXT,                     -- JSON array memoryId
  blocked INTEGER NOT NULL DEFAULT 0, -- anti-scam classifier chặn
  block_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_persona_msg ON persona_messages(person_id, created_at);

-- Rate limit counters (7.9)
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0
);
