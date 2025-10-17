-- Add status column to staff table to match the application requirements
-- This enables active/inactive staff management as per the technical specification

ALTER TABLE staff
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add constraint to ensure only valid status values
ALTER TABLE staff
ADD CONSTRAINT IF NOT EXISTS staff_status_check
CHECK (status IN ('active', 'inactive'));

-- Update existing records to have active status
UPDATE staff
SET status = 'active'
WHERE status IS NULL;

-- Add image_url and description columns if they don't exist
ALTER TABLE staff
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE staff
ADD COLUMN IF NOT EXISTS description TEXT;

-- Make sure is_active column exists for backward compatibility
ALTER TABLE staff
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Sync status and is_active columns
UPDATE staff
SET is_active = (status = 'active')
WHERE status IS NOT NULL;

SELECT 'Staff table schema updated successfully!' as status;