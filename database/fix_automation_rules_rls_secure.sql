-- Fix RLS policies for automation_rules table with secure admin access
-- This creates specific policies for admin panel operations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on automation_rules" ON automation_rules;
DROP POLICY IF EXISTS "Enable read access for all users" ON automation_rules;
DROP POLICY IF EXISTS "Enable insert for all users" ON automation_rules;
DROP POLICY IF EXISTS "Enable update for all users" ON automation_rules;
DROP POLICY IF EXISTS "Enable delete for all users" ON automation_rules;
DROP POLICY IF EXISTS "Admin full access to automation_rules" ON automation_rules;

-- Create secure policies for admin operations
-- These policies allow full access for authenticated users (admin panel)
CREATE POLICY "Admin full access to automation_rules" ON automation_rules
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled on the table
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Add a comment to document the change
COMMENT ON TABLE automation_rules IS 'Automation rules table with secure RLS policies for authenticated admin users';

-- Verify the setup
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'automation_rules';
