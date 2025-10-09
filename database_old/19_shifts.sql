-- ========================================
-- SHIFTS - Staff Schichtplanung mit H-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für H-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_shift_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- H- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'H-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE shift_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for shift_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUMs für Shifts
CREATE TYPE shift_role_enum AS ENUM ('host', 'teacher', 'instructor', 'kitchen', 'maintenance', 'other');

CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_shift_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

    -- Staff Assignment
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role_label shift_role_enum NOT NULL DEFAULT 'other',

    -- Time & Duration
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,

    -- Visual & Organization
    color VARCHAR(7), -- Hex color override (z.B. "#FF5733")

    -- Recurrence Management (für Serien)
    recurrence_rule TEXT, -- RFC-5545-artig: "FREQ=WEEKLY;BYDAY=MO,WE;COUNT=8"
    recurrence_parent_id UUID REFERENCES shifts(id), -- Zeigt auf Parent-Shift bei Serien

    -- Additional Info
    notes TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Audit
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Logische Constraints
    CONSTRAINT shifts_time_check CHECK (end_at > start_at),
    CONSTRAINT shifts_same_day_check CHECK (DATE(start_at AT TIME ZONE 'UTC') = DATE(end_at AT TIME ZONE 'UTC'))
);

-- Performance Indizes
CREATE INDEX idx_shifts_camp_id ON shifts(camp_id);
CREATE INDEX idx_shifts_staff_id ON shifts(staff_id);
CREATE INDEX idx_shifts_time_range ON shifts(camp_id, start_at, end_at);
CREATE INDEX idx_shifts_active ON shifts(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_shifts_recurrence_parent ON shifts(recurrence_parent_id) WHERE recurrence_parent_id IS NOT NULL;
CREATE INDEX idx_shifts_date ON shifts(camp_id, DATE(start_at AT TIME ZONE 'UTC'));
CREATE UNIQUE INDEX idx_shift_id ON shifts(shift_id);

-- Function: Shift Validierungen
CREATE OR REPLACE FUNCTION validate_shift() RETURNS TRIGGER AS $$
DECLARE
    staff_record RECORD;
    camp_tz TEXT;
    shift_date DATE;
    conflicting_shifts INTEGER;
BEGIN
    -- Staff-Daten holen
    SELECT is_active, labels INTO staff_record
    FROM staff
    WHERE id = NEW.staff_id;

    -- Camp-Zeitzone holen
    SELECT timezone INTO camp_tz
    FROM camps
    WHERE id = NEW.camp_id;

    -- Shift-Datum in Camp-Zeitzone berechnen
    shift_date := DATE(NEW.start_at AT TIME ZONE camp_tz);

    -- Validierungen
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Staff member not found';
    END IF;

    IF NOT staff_record.is_active THEN
        RAISE EXCEPTION 'Staff ist inaktiv und kann nicht verplant werden';
    END IF;

    -- Prüfe ob Shift über Mitternacht geht
    IF DATE(NEW.start_at AT TIME ZONE camp_tz) != DATE(NEW.end_at AT TIME ZONE camp_tz) THEN
        RAISE EXCEPTION 'Shifts dürfen nicht über Mitternacht gehen';
    END IF;

    -- Konfliktprüfung: Überschneidung mit anderen Shifts desselben Staff
    SELECT COUNT(*) INTO conflicting_shifts
    FROM shifts
    WHERE staff_id = NEW.staff_id
        AND camp_id = NEW.camp_id
        AND is_active = true
        AND id != COALESCE(NEW.id, gen_random_uuid()) -- Bei UPDATE eigene Shift ausschließen
        AND (
            (NEW.start_at < end_at AND NEW.end_at > start_at) -- Zeitüberschneidung
        );

    IF conflicting_shifts > 0 THEN
        RAISE EXCEPTION 'Konflikt: Überschneidung mit bestehender Schicht';
    END IF;

    -- Rollen-Validierung (Warnung, aber erlaubt)
    -- Da wir nur Exceptions werfen können, machen wir das in der UI
    -- IF NOT (NEW.role_label::TEXT = ANY(staff_record.labels)) THEN
    --     -- Dies wird in der UI als Warnung behandelt
    -- END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Shift Validierung
CREATE TRIGGER validate_shift_trigger
    BEFORE INSERT OR UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION validate_shift();

-- Function: Automatische Farbe setzen falls nicht angegeben
CREATE OR REPLACE FUNCTION set_default_shift_color() RETURNS TRIGGER AS $$
DECLARE
    staff_color TEXT;
BEGIN
    -- Wenn keine Farbe gesetzt, versuche Staff-Farbe zu verwenden
    IF NEW.color IS NULL THEN
        -- Da staff Tabelle aktuell keine color Spalte hat, generieren wir deterministisch
        -- Hash aus staff_id für konsistente Farben
        NEW.color := '#' || SUBSTRING(MD5(NEW.staff_id::TEXT) FROM 1 FOR 6);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Default Farbe setzen
CREATE TRIGGER set_default_shift_color_trigger
    BEFORE INSERT ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION set_default_shift_color();

-- Auto-Update Trigger
CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Shifts des eigenen Camps
CREATE POLICY shifts_camp_isolation ON shifts
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Shifts (keine Zeitkonflikte)
INSERT INTO shifts (camp_id, staff_id, role_label, start_at, end_at, notes, created_by) VALUES
    -- Max Mustermann Morning Host Shift
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'host',
     CURRENT_DATE + TIME '08:00',
     CURRENT_DATE + TIME '12:00',
     'Morning reception and guest check-ins',
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Max Mustermann Afternoon Teaching Shift (gleicher Tag, keine Überschneidung)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'teacher',
     CURRENT_DATE + TIME '14:00',
     CURRENT_DATE + TIME '18:00',
     'Afternoon surf lesson instruction',
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Nächster Tag: Kitchen Shift
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'kitchen',
     CURRENT_DATE + INTERVAL '1 day' + TIME '06:00',
     CURRENT_DATE + INTERVAL '1 day' + TIME '10:00',
     'Breakfast preparation and service',
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Nächster Tag: Instructor Shift (nachmittags, keine Überschneidung)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'instructor',
     CURRENT_DATE + INTERVAL '1 day' + TIME '15:00',
     CURRENT_DATE + INTERVAL '1 day' + TIME '17:00',
     'Advanced surf technique workshop',
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Übernächster Tag: Maintenance Shift
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'maintenance',
     CURRENT_DATE + INTERVAL '2 days' + TIME '07:00',
     CURRENT_DATE + INTERVAL '2 days' + TIME '09:00',
     'Daily equipment inspection and maintenance',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'));

-- Demo Serien-Shift (Parent + 2 einfache Child-Shifts)
INSERT INTO shifts (camp_id, staff_id, role_label, start_at, end_at, recurrence_rule, notes, created_by) VALUES
    -- Parent Shift für Weekly Host Duties (weit in die Zukunft, um Konflikte zu vermeiden)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'host',
     CURRENT_DATE + INTERVAL '1 week' + TIME '09:00',
     CURRENT_DATE + INTERVAL '1 week' + TIME '11:00',
     'FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12',
     'Weekly morning host duties - parent shift',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'));

-- Einfache Child-Shifts für die Serie (2 Wochen später)
INSERT INTO shifts (camp_id, staff_id, role_label, start_at, end_at, recurrence_parent_id, notes, created_by) VALUES
    -- Child Shift 1: Montag, 2 Wochen später
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'host',
     CURRENT_DATE + INTERVAL '2 weeks' + TIME '09:00',
     CURRENT_DATE + INTERVAL '2 weeks' + TIME '11:00',
     (SELECT id FROM shifts WHERE recurrence_rule = 'FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12' LIMIT 1),
     'Weekly morning host duties - occurrence 1',
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Child Shift 2: Mittwoch, 2 Wochen später
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'host',
     CURRENT_DATE + INTERVAL '2 weeks' + INTERVAL '2 days' + TIME '09:00',
     CURRENT_DATE + INTERVAL '2 weeks' + INTERVAL '2 days' + TIME '11:00',
     (SELECT id FROM shifts WHERE recurrence_rule = 'FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12' LIMIT 1),
     'Weekly morning host duties - occurrence 2',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'));