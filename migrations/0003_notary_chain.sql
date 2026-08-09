-- =====================================================================
-- Gia Sử Ký — Migration 0003: notary_chain (GĐ5-30)
-- Ghi chain nào đã ký bản ghi consent (mock-ledger | stellar | evm-l2).
-- NULL = bản ghi tạo trước migration → coi như mock-ledger khi hiển thị.
-- =====================================================================
ALTER TABLE consent_records ADD COLUMN notary_chain TEXT;
