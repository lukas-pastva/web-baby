-- Migration: Add new food types to milking_feeds table
-- Run this on existing databases to add the new ENUM values

ALTER TABLE milking_feeds
MODIFY COLUMN feedingType ENUM(
    'BREAST_DIRECT',
    'BREAST_BOTTLE',
    'FORMULA_PUMP',
    'FORMULA_BOTTLE',
    'FRUIT',
    'PORRIDGE',
    'VEGETABLES_MEAT'
) NOT NULL;
