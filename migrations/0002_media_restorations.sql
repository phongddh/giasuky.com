-- =====================================================================
-- Gia Sử Ký — Migration 0002: Media restoration jobs (GĐ5-26)
-- Bảng job cho pipeline phục dựng ảnh (4.1.4). Worker GPU ngoài đọc
-- row QUEUED, cập nhật RUNNING → COMPLETED/FAILED. Không lưu nội dung
-- ảnh (binary) trong D1 — chỉ URL gốc + URL kết quả (outputs JSON).
-- =====================================================================

CREATE TABLE IF NOT EXISTS media_restorations (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  clan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED'
    CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED')),
  progress INTEGER NOT NULL DEFAULT 0,
  pipeline TEXT NOT NULL DEFAULT '[]',
  outputs TEXT NOT NULL DEFAULT '[]',
  error TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_media_restorations_person ON media_restorations(person_id, status);
CREATE INDEX IF NOT EXISTS idx_media_restorations_status ON media_restorations(status);
