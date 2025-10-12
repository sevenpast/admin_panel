-- Robust solution: Add base_name column to equipment table
-- This provides explicit control over equipment grouping

-- Step 1: Add base_name column
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS base_name VARCHAR(255);

-- Step 2: Update existing records
-- For existing equipment, use the name without numbers as base_name
UPDATE equipment 
SET base_name = REGEXP_REPLACE(name, '\s+\d+$', '')
WHERE base_name IS NULL OR base_name = '';

-- Step 3: Make base_name NOT NULL after updating
ALTER TABLE equipment ALTER COLUMN base_name SET NOT NULL;

-- Step 4: Add index for efficient grouping
CREATE INDEX IF NOT EXISTS idx_equipment_base_name ON equipment(camp_id, base_name);

-- Step 5: Add comment for documentation
COMMENT ON COLUMN equipment.base_name IS 'Base name for explicit equipment grouping - provides full control over how items are grouped together';

-- Step 6: Add constraint to ensure base_name is not empty
ALTER TABLE equipment ADD CONSTRAINT equipment_base_name_not_empty 
CHECK (LENGTH(TRIM(base_name)) > 0);


