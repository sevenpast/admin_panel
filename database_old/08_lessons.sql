-- ========================================
-- LESSONS - Surf Lessons mit L-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für L-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_lesson_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- L- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'L-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE lesson_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for lesson_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUMs für Lesson
CREATE TYPE lesson_category_enum AS ENUM ('lesson', 'theory', 'other');
CREATE TYPE lesson_status_enum AS ENUM ('draft', 'published');

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_lesson_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category lesson_category_enum DEFAULT 'lesson',
    location VARCHAR(255) NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status lesson_status_enum DEFAULT 'draft', -- draft = intern, published = Guest App sichtbar

    -- Optional Alert System
    alert_time TIMESTAMPTZ, -- Wann Push senden
    alert_text TEXT, -- Push-Nachricht Text

    -- Content
    description TEXT,
    max_participants INTEGER,

    -- Audit
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Constraints
    CHECK (end_at > start_at),
    CHECK (max_participants IS NULL OR max_participants > 0)
);

-- Performance Indizes
CREATE INDEX idx_lessons_camp_id ON lessons(camp_id);
CREATE INDEX idx_lessons_status ON lessons(camp_id, status);
CREATE INDEX idx_lessons_category ON lessons(camp_id, category);
CREATE INDEX idx_lessons_date ON lessons(camp_id, DATE(start_at AT TIME ZONE 'UTC'));
CREATE INDEX idx_lessons_published_date ON lessons(camp_id, status, DATE(start_at AT TIME ZONE 'UTC'))
    WHERE status = 'published';
CREATE UNIQUE INDEX idx_lessons_id ON lessons(lesson_id);

-- Auto-Update Trigger
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Lessons des eigenen Camps
CREATE POLICY lessons_camp_isolation ON lessons
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Lessons
INSERT INTO lessons (camp_id, title, category, location, start_at, end_at, status, description, max_participants, created_by) VALUES
    -- Morgen Lesson
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Beginner Surf Lesson',
     'lesson',
     'Main Beach',
     CURRENT_DATE + INTERVAL '1 day' + TIME '09:00',
     CURRENT_DATE + INTERVAL '1 day' + TIME '11:00',
     'published',
     'Basic surf techniques for beginners',
     8,
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Morgen Theory
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Ocean Safety Theory',
     'theory',
     'Classroom A',
     CURRENT_DATE + INTERVAL '1 day' + TIME '15:00',
     CURRENT_DATE + INTERVAL '1 day' + TIME '16:30',
     'published',
     'Learn about ocean conditions, safety rules and surf etiquette',
     12,
     (SELECT id FROM staff WHERE name = 'Tom Wilson')),

    -- Draft Lesson für Testing
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Advanced Wave Reading',
     'lesson',
     'North Point',
     CURRENT_DATE + INTERVAL '2 days' + TIME '07:00',
     CURRENT_DATE + INTERVAL '2 days' + TIME '09:00',
     'draft',
     'Advanced techniques for reading waves and positioning',
     6,
     (SELECT id FROM staff WHERE name = 'Max Mustermann'));