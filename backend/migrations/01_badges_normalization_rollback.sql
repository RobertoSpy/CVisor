-- =====================================================
-- ROLLBACK: Normalizare Badge System
-- Creat: 2026-02-13
-- Scop: Revine la structura anterioară (doar dacă e nevoie)
-- =====================================================

-- ATENȚIE: Rulează doar dacă migrarea 01 a eșuat sau vrei să revii!

-- ====================
-- 1. ȘTERGE FK CONSTRAINT
-- ====================
ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS fk_user_badges_badge_code;

-- Șterge indexul FK
DROP INDEX IF EXISTS idx_user_badges_badge_code;

-- ====================
-- 2. REDENUMEȘTE ÎNAPOI (dacă ai redenumit)
-- ====================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_badges' AND column_name = 'badge_code'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_badges' AND column_name = 'badge_id'
  ) THEN
    ALTER TABLE user_badges RENAME COLUMN badge_code TO badge_id;
    RAISE NOTICE 'Redenumit badge_code → badge_id';
  END IF;
END $$;

-- ====================
-- 3. RECREEAZĂ CONSTRAINT VECHI
-- ====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_badges_user_id_badge_id_key'
  ) THEN
    ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE(user_id, badge_id);
  END IF;
END $$;

-- ====================
-- 4. ȘTERGE TABELA BADGES (OPȚIONAL)
-- ====================
-- ATENȚIE: Comentează dacă vrei să păstrezi datele!
DROP TABLE IF EXISTS badges CASCADE;

RAISE NOTICE 'Rollback complet - ai revenit la structura anterioară';
