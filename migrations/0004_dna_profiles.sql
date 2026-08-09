-- =====================================================================
-- Gia Sử Ký — Migration 0004: DNA profiles (GĐ5-29)
-- Module nhập liệu DNA (đối tác lab: 23andMe/MyHeritage export) + hiển thị
-- quan hệ ước tính. KHÔNG lưu dữ liệu gen thô — chỉ kết quả đã tổng hợp
-- (haplogroup, ethnicity breakdown, matches) + URL báo cáo gốc.
-- Bắt buộc consent scope dna_processing (kiểm tra ở route).
-- =====================================================================

CREATE TABLE IF NOT EXISTS dna_profiles (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  clan_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual',
  raw_report_url TEXT,
  haplogroup TEXT,
  ethnicity TEXT NOT NULL DEFAULT '[]',
  matches TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  consent_id TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_dna_profiles_person ON dna_profiles(person_id);
