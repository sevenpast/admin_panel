-- ========================================
-- LESSON_ASSIGNMENTS - Guest-Lesson Zuweisungen mit Tagesregeln
-- ========================================

CREATE TABLE lesson_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,

    -- Tracking
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES staff(id), -- Wer hat zugewiesen

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Ein Gast kann nicht doppelt zu derselben Lesson zugewiesen werden
    UNIQUE(lesson_id, guest_id)
);

-- Performance Indizes
CREATE INDEX idx_lesson_assignments_camp_id ON lesson_assignments(camp_id);
CREATE INDEX idx_lesson_assignments_lesson_id ON lesson_assignments(lesson_id);
CREATE INDEX idx_lesson_assignments_guest_id ON lesson_assignments(guest_id);
-- Index für Guest-Lesson Performance (ohne Subquery)
CREATE INDEX idx_lesson_assignments_guest_camp ON lesson_assignments(guest_id, camp_id);

-- Function: Validierung der "Ein Lesson + Ein Theory pro Tag"-Regel
CREATE OR REPLACE FUNCTION validate_lesson_assignment() RETURNS TRIGGER AS $$
DECLARE
    guest_record RECORD;
    lesson_record RECORD;
    lesson_date DATE;
    existing_count INTEGER;
    camp_tz TEXT;
BEGIN
    -- Guest-Daten holen
    SELECT is_active, surf_package INTO guest_record
    FROM guests
    WHERE id = NEW.guest_id;

    -- Lesson-Daten holen
    SELECT category, start_at, camp_id INTO lesson_record
    FROM lessons
    WHERE id = NEW.lesson_id;

    -- Camp-Zeitzone holen
    SELECT timezone INTO camp_tz
    FROM camps
    WHERE id = lesson_record.camp_id;

    -- Lesson-Datum in Camp-Zeitzone berechnen
    lesson_date := DATE(lesson_record.start_at AT TIME ZONE camp_tz);

    -- Guest-Validierungen
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guest not found';
    END IF;

    IF NOT guest_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign inactive guest to lesson';
    END IF;

    IF NOT guest_record.surf_package THEN
        RAISE EXCEPTION 'Guest does not have surf package';
    END IF;

    -- Prüfe "Ein Lesson pro Tag"-Regel für category='lesson'
    IF lesson_record.category = 'lesson' THEN
        SELECT COUNT(*) INTO existing_count
        FROM lesson_assignments la
        JOIN lessons l ON la.lesson_id = l.id
        WHERE la.guest_id = NEW.guest_id
            AND la.camp_id = NEW.camp_id
            AND l.category = 'lesson'
            AND DATE(l.start_at AT TIME ZONE camp_tz) = lesson_date
            AND (TG_OP = 'INSERT' OR la.id != NEW.id); -- Bei UPDATE: eigene Assignment ausschließen

        IF existing_count > 0 THEN
            RAISE EXCEPTION 'Guest already has a lesson assignment on this day';
        END IF;
    END IF;

    -- Prüfe "Ein Theory pro Tag"-Regel für category='theory'
    IF lesson_record.category = 'theory' THEN
        SELECT COUNT(*) INTO existing_count
        FROM lesson_assignments la
        JOIN lessons l ON la.lesson_id = l.id
        WHERE la.guest_id = NEW.guest_id
            AND la.camp_id = NEW.camp_id
            AND l.category = 'theory'
            AND DATE(l.start_at AT TIME ZONE camp_tz) = lesson_date
            AND (TG_OP = 'INSERT' OR la.id != NEW.id); -- Bei UPDATE: eigene Assignment ausschließen

        IF existing_count > 0 THEN
            RAISE EXCEPTION 'Guest already has a theory assignment on this day';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Lesson Assignment Validierung
CREATE TRIGGER validate_lesson_assignment_trigger
    BEFORE INSERT OR UPDATE ON lesson_assignments
    FOR EACH ROW
    EXECUTE FUNCTION validate_lesson_assignment();

-- Auto-Update Trigger
CREATE TRIGGER update_lesson_assignments_updated_at
    BEFORE UPDATE ON lesson_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE lesson_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Lesson Assignments des eigenen Camps
CREATE POLICY lesson_assignments_camp_isolation ON lesson_assignments
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Guest Assignments (nur aktive Gäste mit surf_package=true)
INSERT INTO lesson_assignments (camp_id, lesson_id, guest_id, assigned_by) VALUES
    -- John Doe → Beginner Surf Lesson
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM lessons WHERE title = 'Beginner Surf Lesson'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Maria Garcia → Beginner Surf Lesson
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM lessons WHERE title = 'Beginner Surf Lesson'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Sarah Connor → Ocean Safety Theory
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM lessons WHERE title = 'Ocean Safety Theory'),
     (SELECT id FROM guests WHERE name = 'Sarah Connor'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- John Doe → Ocean Safety Theory (same day, different category = erlaubt)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM lessons WHERE title = 'Ocean Safety Theory'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'));