-- =================================================================
-- Add base_name field to both rooms and equipment tables
-- This provides explicit control over grouping for both entities
-- =================================================================

-- ========================================
-- ROOMS: Add base_name field
-- ========================================

-- Step 1: Add base_name column to rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS base_name VARCHAR(255);

-- Step 2: Update existing room records
-- For existing rooms, use the name as base_name
UPDATE rooms 
SET base_name = name
WHERE base_name IS NULL OR base_name = '';

-- Step 3: Make base_name NOT NULL after updating
ALTER TABLE rooms ALTER COLUMN base_name SET NOT NULL;

-- Step 4: Add index for efficient grouping
CREATE INDEX IF NOT EXISTS idx_rooms_base_name ON rooms(camp_id, base_name);

-- Step 5: Add comment for documentation
COMMENT ON COLUMN rooms.base_name IS 'Base name for explicit room grouping - provides full control over how rooms are grouped together';

-- ========================================
-- EQUIPMENT: Add base_name field
-- ========================================

-- Step 1: Add base_name column to equipment
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS base_name VARCHAR(255);

-- Step 2: Update existing equipment records
-- For existing equipment, extract base name by removing numbers/suffixes
UPDATE equipment 
SET base_name = REGEXP_REPLACE(name, '\s+\d+$', '')
WHERE base_name IS NULL OR base_name = '';

-- Step 3: Make base_name NOT NULL after updating
ALTER TABLE equipment ALTER COLUMN base_name SET NOT NULL;

-- Step 4: Add index for efficient grouping
CREATE INDEX IF NOT EXISTS idx_equipment_base_name ON equipment(camp_id, base_name);

-- Step 5: Add comment for documentation
COMMENT ON COLUMN equipment.base_name IS 'Base name for explicit equipment grouping - provides full control over how equipment items are grouped together';

-- ========================================
-- CONSTRAINTS: Ensure data integrity
-- ========================================

-- Ensure base_name is not empty for rooms
ALTER TABLE rooms ADD CONSTRAINT rooms_base_name_not_empty 
CHECK (LENGTH(TRIM(base_name)) > 0);

-- Ensure base_name is not empty for equipment
ALTER TABLE equipment ADD CONSTRAINT equipment_base_name_not_empty 
CHECK (LENGTH(TRIM(base_name)) > 0);

-- ========================================
-- VERIFICATION: Check the changes
-- ========================================

-- Verify rooms table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rooms' AND column_name = 'base_name';

-- Verify equipment table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'equipment' AND column_name = 'base_name';

-- Show sample data
SELECT 'ROOMS' as table_name, name, base_name FROM rooms LIMIT 5
UNION ALL
SELECT 'EQUIPMENT' as table_name, name, base_name FROM equipment LIMIT 5;



