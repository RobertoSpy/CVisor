-- =====================================================
-- Migration: Normalizare Badge System
-- Creat: 2026-02-13
-- Scop: Creează tabela badges + FK constraint
-- =====================================================
-- ====================
-- 1. CREEAZĂ TABELA BADGES
-- ====================
CREATE TABLE IF NOT EXISTS badges (
  code VARCHAR(50) PRIMARY KEY,
  -- Ex: 'lvl1', 'streak_7', 'creator_pro'
  name VARCHAR(100) NOT NULL,
  -- Ex: 'Level 1', 'Streak Master'
  description TEXT,
  -- Descriere badge
  icon_url TEXT,
  -- URL imagine badge (opțional)
  category VARCHAR(50) NOT NULL,
  -- 'level', 'streak', 'achievement'
  points_value INTEGER DEFAULT 5,
  -- Puncte acordate la unlock
  sort_order INTEGER DEFAULT 0,
  -- Ordine afișare
  created_at TIMESTAMP DEFAULT NOW()
);
-- Index pentru filtrare rapidă
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
-- ====================
-- 2. POPULEAZĂ BADGES EXISTENTE
-- ====================
-- Level Badges (Gamification Map) — matches frontend BADGES in streak.ts
INSERT INTO badges (
    code,
    name,
    description,
    category,
    points_value,
    sort_order
  )
VALUES (
    'lvl1',
    'Începător',
    'Bine ai venit în comunitate! Ai deblocat primul nivel.',
    'level',
    5,
    1
  ),
  (
    'lvl2',
    'Explorator',
    'Ai acumulat 50 de puncte. Continuă să explorezi!',
    'level',
    5,
    2
  ),
  (
    'lvl3',
    'Dedicat',
    'Impresionant! 150 de puncte - ești pe drumul cel bun.',
    'level',
    5,
    3
  ),
  (
    'lvl4',
    'Expert',
    '400 de puncte! Experiența ta face diferența.',
    'level',
    5,
    4
  ),
  (
    'lvl5',
    'Maestru',
    '1000 de puncte! Ai ajuns la vârful lanțului trofic.',
    'level',
    5,
    5
  ) ON CONFLICT (code) DO NOTHING;
-- ====================
-- 3. VERIFICĂ ȘI RENUMEȘTE COLOANA (dacă e nevoie)
-- ====================
-- Verifică dacă există badge_id și o renumește în badge_code
DO $$ BEGIN -- Dacă există badge_id și nu există badge_code
IF EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'user_badges'
    AND column_name = 'badge_id'
)
AND NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'user_badges'
    AND column_name = 'badge_code'
) THEN -- Redenumește coloana
ALTER TABLE user_badges
  RENAME COLUMN badge_id TO badge_code;
RAISE NOTICE 'Coloana badge_id redenumită în badge_code';
END IF;
END $$;
-- ====================
-- 4. ACTUALIZEAZĂ UNIQUE CONSTRAINT
-- ====================
-- Șterge constraint-ul vechi (dacă există cu badge_id)
DO $$ BEGIN IF EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'user_badges_user_id_badge_id_key'
) THEN
ALTER TABLE user_badges DROP CONSTRAINT user_badges_user_id_badge_id_key;
RAISE NOTICE 'Constraint vechi șters';
END IF;
END $$;
-- Recreează constraint cu badge_code (dacă nu există)
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'user_badges_user_id_badge_code_key'
) THEN
ALTER TABLE user_badges
ADD CONSTRAINT user_badges_user_id_badge_code_key UNIQUE(user_id, badge_code);
RAISE NOTICE 'Constraint nou creat';
END IF;
END $$;
-- ====================
-- 5. ADAUGĂ FOREIGN KEY CONSTRAINT
-- ====================
-- Șterge FK-ul vechi dacă există
ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS fk_user_badges_badge_code;
-- Adaugă FK constraint către badges.code
ALTER TABLE user_badges
ADD CONSTRAINT fk_user_badges_badge_code FOREIGN KEY (badge_code) REFERENCES badges(code) ON DELETE RESTRICT -- Nu permite ștergerea unui badge folosit
  ON UPDATE CASCADE;
-- Dacă badge code se schimbă, update automat
-- Index pentru performanță FK lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_code ON user_badges(badge_code);
-- ====================
-- 6. VALIDARE & CLEANUP
-- ====================
-- Verifică dacă există badge_code-uri în user_badges care nu sunt în badges
DO $$
DECLARE orphan_count INTEGER;
BEGIN
SELECT COUNT(*) INTO orphan_count
FROM user_badges ub
WHERE NOT EXISTS (
    SELECT 1
    FROM badges b
    WHERE b.code = ub.badge_code
  );
IF orphan_count > 0 THEN RAISE WARNING 'ATENȚIE: Există % badge-uri orfane în user_badges!',
orphan_count;
-- Opțional: Afișează badge-urile orfane
RAISE NOTICE 'Badge-uri orfane: %',
(
  SELECT string_agg(DISTINCT badge_code, ', ')
  FROM user_badges ub
  WHERE NOT EXISTS (
      SELECT 1
      FROM badges b
      WHERE b.code = ub.badge_code
    )
);
ELSE RAISE NOTICE 'Validare OK: Toate badge-urile sunt referențiate corect';
END IF;
END $$;
-- ====================
-- 7. COMENTARII DOCUMENTARE
-- ====================
COMMENT ON TABLE badges IS 'Master table pentru toate badge-urile disponibile în sistem';
COMMENT ON COLUMN badges.code IS 'Identificator unic badge (folosit în cod)';
COMMENT ON COLUMN badges.category IS 'Categorie: level (gamification), streak (daily login), achievement (one-time)';
COMMENT ON COLUMN badges.points_value IS 'Puncte acordate automat la unlock (sincronizat cu pointsManager.js)';
COMMENT ON COLUMN user_badges.badge_code IS 'FK către badges.code - ce badge a primit user-ul';
COMMENT ON CONSTRAINT fk_user_badges_badge_code ON user_badges IS 'Asigură că badge_code există în tabela badges';
-- ====================
-- MIGRARE COMPLETĂ ✅
-- ====================