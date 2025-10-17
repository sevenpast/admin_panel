-- Remove the database trigger that prevents multiple surfboard assignments
-- Per user stories: Equipment should be assignable to multiple guests

-- Drop the existing trigger
DROP TRIGGER IF EXISTS validate_equipment_assignment_trigger ON equipment_assignments;

-- Drop the existing function
DROP FUNCTION IF EXISTS validate_equipment_assignment();

-- Create a new version that allows multiple assignments but still validates basic requirements
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

    -- Allow equipment assignments regardless of category
    -- Per user stories: Equipment can be shared between multiple guests
    -- No restrictions on multiple assignments of the same category

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger with the updated function
CREATE TRIGGER validate_equipment_assignment_trigger
    BEFORE INSERT OR UPDATE ON equipment_assignments
    FOR EACH ROW EXECUTE FUNCTION validate_equipment_assignment();

-- Add a comment explaining the change
COMMENT ON FUNCTION validate_equipment_assignment() IS 'Validates equipment assignments - allows multiple assignments per user stories';