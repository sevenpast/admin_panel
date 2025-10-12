-- Execute this in Supabase SQL Editor to add base_name fields

-- Add base_name to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS base_name VARCHAR(255);
UPDATE rooms SET base_name = name WHERE base_name IS NULL OR base_name = '';
ALTER TABLE rooms ALTER COLUMN base_name SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rooms_base_name ON rooms(camp_id, base_name);

-- Add base_name to equipment table  
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS base_name VARCHAR(255);
UPDATE equipment SET base_name = REGEXP_REPLACE(name, '\s+\d+$', '') WHERE base_name IS NULL OR base_name = '';
ALTER TABLE equipment ALTER COLUMN base_name SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_equipment_base_name ON equipment(camp_id, base_name);

-- Add constraints
ALTER TABLE rooms ADD CONSTRAINT rooms_base_name_not_empty CHECK (LENGTH(TRIM(base_name)) > 0);
ALTER TABLE equipment ADD CONSTRAINT equipment_base_name_not_empty CHECK (LENGTH(TRIM(base_name)) > 0);


