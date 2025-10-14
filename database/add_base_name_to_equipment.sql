-- Add base_name column to existing equipment table
-- This script adds the base_name field for equipment grouping

-- Add the base_name column
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS base_name VARCHAR(255);

-- Update existing records to use name as base_name
UPDATE equipment SET base_name = name WHERE base_name IS NULL OR base_name = '';

-- Make base_name NOT NULL after updating existing records
ALTER TABLE equipment ALTER COLUMN base_name SET NOT NULL;

-- Add index for efficient grouping
CREATE INDEX IF NOT EXISTS idx_equipment_base_name ON equipment(camp_id, base_name);

-- Add comment
COMMENT ON COLUMN equipment.base_name IS 'Base name for grouping similar equipment items together';



