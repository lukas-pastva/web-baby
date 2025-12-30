-- Web-Baby Database Schema
-- All tables are auto-created by Sequelize on server startup,
-- but this file documents the schema for reference/manual setup.

-- ================================================================
-- MILKING MODULE
-- ================================================================

-- Feeding recommendations by age
CREATE TABLE IF NOT EXISTS milking_recommendations (
    ageDays INT PRIMARY KEY,
    totalMl INT NOT NULL,
    mealsPerDay INT NOT NULL,
    perMealMl INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Individual feeding records
CREATE TABLE IF NOT EXISTS milking_feeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fedAt DATETIME NOT NULL,
    amountMl INT NOT NULL,
    feedingType ENUM('BREAST_DIRECT', 'BREAST_BOTTLE', 'FORMULA_PUMP', 'FORMULA_BOTTLE', 'FRUIT', 'PORRIDGE', 'VEGETABLES_MEAT') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- WEIGHT MODULE
-- ================================================================

CREATE TABLE IF NOT EXISTS weight_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    measuredAt DATE NOT NULL UNIQUE,
    weightGrams INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- HEIGHT MODULE
-- ================================================================

CREATE TABLE IF NOT EXISTS height_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    measuredAt DATE NOT NULL UNIQUE,
    heightCm FLOAT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- NOTES MODULE
-- ================================================================

CREATE TABLE IF NOT EXISTS note_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    noteDate DATE NOT NULL,
    title VARCHAR(128) NOT NULL,
    text TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TEETHING MODULE
-- ================================================================

CREATE TABLE IF NOT EXISTS tooth_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    toothCode VARCHAR(10) NOT NULL UNIQUE,
    appearedAt DATE DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- CONFIG MODULE
-- ================================================================

CREATE TABLE IF NOT EXISTS app_configs (
    id INT PRIMARY KEY DEFAULT 1,
    theme ENUM('boy', 'girl') DEFAULT 'boy',
    mode ENUM('light', 'dark', 'auto') DEFAULT 'light',
    disabledTypes JSON,
    childName VARCHAR(100),
    childSurname VARCHAR(100),
    birthTs DATETIME,
    birthWeightGrams INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
