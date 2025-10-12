-- Fix RLS policies for automation_rules table
-- This allows the API to create, read, update, and delete automation rules

-- First, let's check if there are existing policies
-- (This is just for reference, we'll create new ones)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on automation_rules" ON automation_rules;
DROP POLICY IF EXISTS "Enable read access for all users" ON automation_rules;
DROP POLICY IF EXISTS "Enable insert for all users" ON automation_rules;
DROP POLICY IF EXISTS "Enable update for all users" ON automation_rules;
DROP POLICY IF EXISTS "Enable delete for all users" ON automation_rules;

-- Create new policies that allow all operations
-- This is appropriate for an admin panel where we want full control

CREATE POLICY "Allow all operations on automation_rules" ON automation_rules
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Alternative: If you want more restrictive policies, you can use:
-- CREATE POLICY "Enable read access for all users" ON automation_rules
--     FOR SELECT
--     USING (true);

-- CREATE POLICY "Enable insert for all users" ON automation_rules
--     FOR INSERT
--     WITH CHECK (true);

-- CREATE POLICY "Enable update for all users" ON automation_rules
--     FOR UPDATE
--     USING (true)
--     WITH CHECK (true);

-- CREATE POLICY "Enable delete for all users" ON automation_rules
--     FOR DELETE
--     USING (true);

-- Ensure RLS is enabled on the table
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Add a comment to document the change
COMMENT ON TABLE automation_rules IS 'Automation rules table with permissive RLS policies for admin panel access';
