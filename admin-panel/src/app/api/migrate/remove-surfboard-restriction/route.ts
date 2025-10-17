import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Since we can't run DDL commands directly through Supabase client,
    // we need to acknowledge that this migration needs to be done manually
    // in the Supabase SQL Editor

    const migrationSQL = `
-- Remove the database constraints that prevent multiple equipment assignments
-- Per user stories: Equipment should be assignable to multiple guests

-- Step 1: Drop the unique constraint that prevents multiple assignments of same equipment
ALTER TABLE equipment_assignments DROP CONSTRAINT IF EXISTS equipment_assignments_equipment_id_status_key;

-- Step 2: Drop the existing trigger
DROP TRIGGER IF EXISTS validate_equipment_assignment_trigger ON equipment_assignments;

-- Step 3: Drop the existing function
DROP FUNCTION IF EXISTS validate_equipment_assignment();

-- Step 4: Create a new version that allows multiple assignments but still validates basic requirements
CREATE OR REPLACE FUNCTION validate_equipment_assignment() RETURNS TRIGGER AS $$
DECLARE
    equipment_record RECORD;
BEGIN
    -- Get equipment details
    SELECT category, status, is_active INTO equipment_record
    FROM equipment
    WHERE id = NEW.equipment_id;

    -- Check if equipment exists and is active
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Equipment not found';
    END IF;

    IF NOT equipment_record.is_active THEN
        RAISE EXCEPTION 'Equipment is not active';
    END IF;

    -- Allow equipment assignments regardless of category and current assignments
    -- Per user stories: Equipment can be shared between multiple guests
    -- No restrictions on multiple assignments of the same equipment

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Recreate the trigger with the updated function
CREATE TRIGGER validate_equipment_assignment_trigger
    BEFORE INSERT OR UPDATE ON equipment_assignments
    FOR EACH ROW EXECUTE FUNCTION validate_equipment_assignment();

-- Step 6: Add a comment explaining the change
COMMENT ON FUNCTION validate_equipment_assignment() IS 'Validates equipment assignments - allows multiple assignments per user stories';
    `

    return NextResponse.json({
      success: false,
      message: 'Manual migration required. Please run the following SQL in Supabase SQL Editor:',
      sql: migrationSQL,
      instructions: [
        '1. Go to your Supabase project dashboard',
        '2. Navigate to SQL Editor',
        '3. Create a new query and paste the provided SQL',
        '4. Execute the query to remove the surfboard restriction',
        '5. After running the migration, equipment can be assigned to multiple guests'
      ]
    })

  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration preparation failed', details: error.message }, { status: 500 })
  }
}