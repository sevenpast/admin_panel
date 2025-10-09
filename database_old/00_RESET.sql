-- ========================================
-- COMPLETE DATABASE RESET
-- ========================================
-- ACHTUNG: Löscht ALLE Daten unwiderruflich!
-- Führe diesen Code zuerst in Supabase SQL Editor aus

-- 1. Alle RLS Policies deaktivieren und löschen
DO $$
DECLARE
    r RECORD;
BEGIN
    -- RLS für alle Tabellen deaktivieren
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;

    -- Alle Policies löschen
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END
$$;

-- 2. Alle Views löschen
DROP VIEW IF EXISTS public.guest_meal_preferences CASCADE;
DROP VIEW IF EXISTS public.staff_schedule_view CASCADE;
DROP VIEW IF EXISTS public.lesson_assignments_view CASCADE;
DROP VIEW IF EXISTS public.material_availability_view CASCADE;

-- 3. Alle Tabellen löschen (neues System + alte Tabellen)
-- Neue CampFlow 2.0 Tabellen
DROP TABLE IF EXISTS public.meal_orders CASCADE;
DROP TABLE IF EXISTS public.meal_options CASCADE;
DROP TABLE IF EXISTS public.automation_deliveries CASCADE;
DROP TABLE IF EXISTS public.automation_jobs CASCADE;
DROP TABLE IF EXISTS public.automation_rules CASCADE;
DROP TABLE IF EXISTS public.shifts CASCADE;
DROP TABLE IF EXISTS public.event_assignments CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.meal_assignments CASCADE;
DROP TABLE IF EXISTS public.meal_plans CASCADE;
DROP TABLE IF EXISTS public.equipment_assignments CASCADE;
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.guest_assessments CASCADE;
DROP TABLE IF EXISTS public.assessment_questions CASCADE;
DROP TABLE IF EXISTS public.lesson_assignments CASCADE;
DROP TABLE IF EXISTS public.lesson_instructors CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.bed_assignments CASCADE;
DROP TABLE IF EXISTS public.beds CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.camps CASCADE;

-- Alte System Tabellen (falls vorhanden)
DROP TABLE IF EXISTS public.surf_assessment_answers CASCADE;
DROP TABLE IF EXISTS public.breakfast_timing_preferences CASCADE;
DROP TABLE IF EXISTS public.feedback_responses CASCADE;
DROP TABLE IF EXISTS public.event_choices CASCADE;
DROP TABLE IF EXISTS public.meal_choices CASCADE;
DROP TABLE IF EXISTS public.surf_lesson_assignments CASCADE;
DROP TABLE IF EXISTS public.event_staff CASCADE;
DROP TABLE IF EXISTS public.surf_lesson_staff CASCADE;
DROP TABLE IF EXISTS public.material_assignments CASCADE;
DROP TABLE IF EXISTS public.staff_permissions CASCADE;
DROP TABLE IF EXISTS public.staff_roles CASCADE;
DROP TABLE IF EXISTS public.staff_shifts CASCADE;
DROP TABLE IF EXISTS public.staff_schedule CASCADE;
DROP TABLE IF EXISTS public.event_manual_adjustments CASCADE;
DROP TABLE IF EXISTS public.meal_manual_adjustments CASCADE;
DROP TABLE IF EXISTS public.event_alerts CASCADE;
DROP TABLE IF EXISTS public.meal_alerts CASCADE;
DROP TABLE IF EXISTS public.guest_surf_levels CASCADE;
DROP TABLE IF EXISTS public.surf_lessons CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.beds CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.surf_lesson_categories CASCADE;
DROP TABLE IF EXISTS public.surf_lesson_types CASCADE;
DROP TABLE IF EXISTS public.event_categories CASCADE;
DROP TABLE IF EXISTS public.event_types CASCADE;
DROP TABLE IF EXISTS public.meal_categories CASCADE;
DROP TABLE IF EXISTS public.meal_types CASCADE;
DROP TABLE IF EXISTS public.material_categories CASCADE;
DROP TABLE IF EXISTS public.material_types CASCADE;
DROP TABLE IF EXISTS public.room_types CASCADE;
DROP TABLE IF EXISTS public.shift_types CASCADE;
DROP TABLE IF EXISTS public.staff_role_types CASCADE;
DROP TABLE IF EXISTS public.staff_permission_types CASCADE;
DROP TABLE IF EXISTS public.allergy_types CASCADE;
DROP TABLE IF EXISTS public.surf_assessment_questions CASCADE;
DROP TABLE IF EXISTS public.feedback_questions CASCADE;
DROP TABLE IF EXISTS public.camps CASCADE;
DROP TABLE IF EXISTS public.login_attempts CASCADE;

-- 4. Alle benutzerdefinierten Typen löschen
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END
$$;

-- 5. Alle Funktionen löschen
-- Neue CampFlow 2.0 Funktionen
DROP FUNCTION IF EXISTS public.generate_meal_order_id() CASCADE;
DROP FUNCTION IF EXISTS public.validate_meal_order() CASCADE;
DROP FUNCTION IF EXISTS public.update_meal_order_timestamps() CASCADE;
DROP FUNCTION IF EXISTS public.generate_meal_option_id() CASCADE;
DROP FUNCTION IF EXISTS public.update_meal_option_orders_counter() CASCADE;
DROP FUNCTION IF EXISTS public.generate_automation_rule_id() CASCADE;
DROP FUNCTION IF EXISTS public.validate_automation_rule() CASCADE;
DROP FUNCTION IF EXISTS public.update_automation_rule_updated_by() CASCADE;
DROP FUNCTION IF EXISTS public.update_automation_job_timestamps() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_automation_jobs() CASCADE;
DROP FUNCTION IF EXISTS public.generate_automation_jobs_for_rule(UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.update_delivery_timestamps() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_automation_deliveries() CASCADE;
DROP FUNCTION IF EXISTS public.get_delivery_stats_for_job(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_job_delivery_stats() CASCADE;
DROP FUNCTION IF EXISTS public.generate_shift_id() CASCADE;
DROP FUNCTION IF EXISTS public.validate_shift() CASCADE;
DROP FUNCTION IF EXISTS public.set_default_shift_color() CASCADE;
DROP FUNCTION IF EXISTS public.generate_event_id() CASCADE;
DROP FUNCTION IF EXISTS public.validate_event_assignment() CASCADE;
DROP FUNCTION IF EXISTS public.update_event_assignment_timestamps() CASCADE;
DROP FUNCTION IF EXISTS public.update_event_participants() CASCADE;
DROP FUNCTION IF EXISTS public.generate_meal_plan_id() CASCADE;
DROP FUNCTION IF EXISTS public.check_allergy_conflict() CASCADE;
DROP FUNCTION IF EXISTS public.validate_meal_assignment() CASCADE;
DROP FUNCTION IF EXISTS public.update_meal_assignment_timestamps() CASCADE;
DROP FUNCTION IF EXISTS public.update_meal_portions_counter() CASCADE;
DROP FUNCTION IF EXISTS public.generate_equipment_id() CASCADE;
DROP FUNCTION IF EXISTS public.validate_equipment_assignment() CASCADE;
DROP FUNCTION IF EXISTS public.update_equipment_status() CASCADE;
DROP FUNCTION IF EXISTS public.update_answered_at() CASCADE;
DROP FUNCTION IF EXISTS public.validate_lesson_assignment() CASCADE;
DROP FUNCTION IF EXISTS public.validate_lesson_instructor() CASCADE;
DROP FUNCTION IF EXISTS public.generate_lesson_id() CASCADE;
DROP FUNCTION IF EXISTS public.update_bed_occupancy() CASCADE;
DROP FUNCTION IF EXISTS public.validate_bed_assignment() CASCADE;
DROP FUNCTION IF EXISTS public.generate_bed_id() CASCADE;
DROP FUNCTION IF EXISTS public.set_bed_capacity() CASCADE;
DROP FUNCTION IF EXISTS public.generate_room_id() CASCADE;
DROP FUNCTION IF EXISTS public.generate_guest_id() CASCADE;
DROP FUNCTION IF EXISTS public.generate_qr_payload() CASCADE;
DROP FUNCTION IF EXISTS public.handle_guest_deactivation() CASCADE;
DROP FUNCTION IF EXISTS public.generate_staff_id() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Alte System Funktionen (falls vorhanden)
DROP FUNCTION IF EXISTS public.get_meal_counts(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.update_meal_adjustment(UUID, DATE, VARCHAR, VARCHAR, INTEGER, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_meal_counts(TEXT, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.update_meal_adjustment(TEXT, DATE, VARCHAR, VARCHAR, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.adjust_meal_count CASCADE;
DROP FUNCTION IF EXISTS public.update_surf_assessment CASCADE;

-- 6. Alle Sequenzen löschen
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
END
$$;

-- 7. Verification - Was ist noch übrig?
SELECT
    'Verbleibende Tabellen:' as info,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT
    'Verbleibende Funktionen:' as info,
    proname as function_name
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

SELECT
    'Verbleibende Typen:' as info,
    typname as type_name
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'
ORDER BY typname;

SELECT 'Database reset completed!' as status;