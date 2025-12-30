-- Teething table for tracking baby teeth eruption
-- This table stores records of when each tooth appeared

CREATE TABLE IF NOT EXISTS tooth_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    toothCode VARCHAR(10) NOT NULL UNIQUE,
    appearedAt DATE DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tooth codes follow this convention:
-- U = Upper jaw, L = Lower jaw
-- R = Right side (from baby's perspective), L = Left side
-- 1-5 = Position from center to back
--
-- Positions:
-- 1 = Central Incisor
-- 2 = Lateral Incisor
-- 3 = Canine
-- 4 = First Molar
-- 5 = Second Molar
--
-- Example codes:
-- UR1 = Upper Right Central Incisor
-- UL3 = Upper Left Canine
-- LR4 = Lower Right First Molar
-- LL5 = Lower Left Second Molar

-- Optional: Pre-populate all 20 baby teeth (uncomment if desired)
-- INSERT IGNORE INTO tooth_entries (toothCode) VALUES
--     ('UR5'), ('UR4'), ('UR3'), ('UR2'), ('UR1'),
--     ('UL1'), ('UL2'), ('UL3'), ('UL4'), ('UL5'),
--     ('LR5'), ('LR4'), ('LR3'), ('LR2'), ('LR1'),
--     ('LL1'), ('LL2'), ('LL3'), ('LL4'), ('LL5');
