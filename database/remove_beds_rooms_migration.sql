-- =================================================================
-- CampFlow 2.0 - Remove Beds and Rooms Migration
-- Date: 2025-01-27
--
-- This migration removes all bed and room inventory functionality
-- while keeping the UI/frontend intact.
-- =================================================================

-- ========================================
-- Section 1: Remove Bed and Room Related Tables
-- ========================================

-- Drop bed assignments table first (due to foreign key constraints)
DROP TABLE IF EXISTS bed_assignments CASCADE;

-- Drop beds table
DROP TABLE IF EXISTS beds CASCADE;

-- Drop rooms table
DROP TABLE IF EXISTS rooms CASCADE;

-- ========================================
-- Section 2: Remove Bed and Room Related Enums
-- ========================================

-- Drop bed and room related enums
DROP TYPE IF EXISTS room_type_enum CASCADE;
DROP TYPE IF EXISTS bed_type_enum CASCADE;
DROP TYPE IF EXISTS bed_slot_enum CASCADE;
DROP TYPE IF EXISTS assignment_status_enum CASCADE;

-- ========================================
-- Section 3: Remove Bed and Room Related Functions
-- ========================================

-- Drop bed-related functions
DROP FUNCTION IF EXISTS set_bed_capacity() CASCADE;
DROP FUNCTION IF EXISTS update_bed_occupancy() CASCADE;
DROP FUNCTION IF EXISTS handle_guest_deactivation() CASCADE;

-- ========================================
-- Section 4: Update ID Generation Function
-- ========================================

-- Update the generate_id function to remove bed and room prefixes
CREATE OR REPLACE FUNCTION generate_id(prefix TEXT) RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    table_name TEXT;
    id_column_name TEXT;
    collision_count INT := 0;
BEGIN
    CASE prefix
        WHEN 'S' THEN
            table_name := 'staff';
            id_column_name := 'staff_id';
        WHEN 'G' THEN
            table_name := 'guests';
            id_column_name := 'guest_id';
        WHEN 'L' THEN
            table_name := 'lessons';
            id_column_name := 'lesson_id';
        WHEN 'U' THEN
            table_name := 'equipment';
            id_column_name := 'equipment_id';
        WHEN 'M' THEN
            table_name := 'meals';
            id_column_name := 'meal_id';
        WHEN 'O' THEN
            table_name := 'meal_options';
            id_column_name := 'meal_option_id';
        WHEN 'T' THEN
            table_name := 'meal_orders';
            id_column_name := 'meal_order_id';
        WHEN 'E' THEN
            table_name := 'events';
            id_column_name := 'event_id';
        WHEN 'H' THEN
            table_name := 'shifts';
            id_column_name := 'shift_id';
        WHEN 'A' THEN
            table_name := 'automation_rules';
            id_column_name := 'automation_rule_id';
        ELSE
            RAISE EXCEPTION 'Invalid prefix for ID generation: %', prefix;
    END CASE;

    LOOP
        new_id := prefix || '-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        EXECUTE format('SELECT 1 FROM public.%I WHERE %I = %L', table_name, id_column_name, new_id)
        INTO collision_count;

        IF collision_count = 0 THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for % ID generation', prefix;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Section 5: Clean Up Any Remaining References
-- ========================================

-- Remove any remaining bed/room related triggers that might still exist
DROP TRIGGER IF EXISTS set_bed_capacity_trigger ON beds;
DROP TRIGGER IF EXISTS update_bed_occupancy_trigger ON bed_assignments;
DROP TRIGGER IF EXISTS guest_deactivation_trigger ON guests;

-- ========================================
-- Section 6: Verification
-- ========================================

-- Verify that bed and room tables are removed
DO $$
BEGIN
    -- Check if beds table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'beds') THEN
        RAISE EXCEPTION 'Beds table still exists after migration';
    END IF;
    
    -- Check if rooms table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rooms') THEN
        RAISE EXCEPTION 'Rooms table still exists after migration';
    END IF;
    
    -- Check if bed_assignments table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bed_assignments') THEN
        RAISE EXCEPTION 'Bed_assignments table still exists after migration';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully - all bed and room tables removed';
END $$;
