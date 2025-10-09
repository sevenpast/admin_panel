-- ========================================
-- LESSON_INSTRUCTORS - Lesson-Instructor Zuweisungen
-- ========================================

CREATE TABLE lesson_instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,

    -- Tracking
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES staff(id), -- Wer hat zugewiesen

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Ein Staff kann nicht doppelt zu derselben Lesson zugewiesen werden
    UNIQUE(lesson_id, staff_id)
);

-- Performance Indizes
CREATE INDEX idx_lesson_instructors_camp_id ON lesson_instructors(camp_id);
CREATE INDEX idx_lesson_instructors_lesson_id ON lesson_instructors(lesson_id);
CREATE INDEX idx_lesson_instructors_staff_id ON lesson_instructors(staff_id);

-- Function: Prüfe ob Staff Instructor-Label hat und aktiv ist
CREATE OR REPLACE FUNCTION validate_instructor_assignment() RETURNS TRIGGER AS $$
DECLARE
    staff_record RECORD;
BEGIN
    -- Staff-Daten holen
    SELECT is_active, labels INTO staff_record
    FROM staff
    WHERE id = NEW.staff_id;

    -- Prüfungen
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Staff not found';
    END IF;

    IF NOT staff_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign inactive staff as instructor';
    END IF;

    IF NOT 'instructor' = ANY(staff_record.labels) THEN
        RAISE EXCEPTION 'Staff does not have instructor label';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Instructor-Validierung bei Assignment
CREATE TRIGGER validate_instructor_assignment_trigger
    BEFORE INSERT OR UPDATE ON lesson_instructors
    FOR EACH ROW
    EXECUTE FUNCTION validate_instructor_assignment();

-- Auto-Update Trigger
CREATE TRIGGER update_lesson_instructors_updated_at
    BEFORE UPDATE ON lesson_instructors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE lesson_instructors ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Lesson-Instructor Zuweisungen des eigenen Camps
CREATE POLICY lesson_instructors_camp_isolation ON lesson_instructors
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Instructor Assignments
INSERT INTO lesson_instructors (camp_id, lesson_id, staff_id, assigned_by) VALUES
    -- Beginner Surf Lesson → Max Mustermann (instructor)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM lessons WHERE title = 'Beginner Surf Lesson'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Ocean Safety Theory → Tom Wilson (instructor)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM lessons WHERE title = 'Ocean Safety Theory'),
     (SELECT id FROM staff WHERE name = 'Tom Wilson'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Advanced Wave Reading → Max Mustermann (instructor)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM lessons WHERE title = 'Advanced Wave Reading'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'));