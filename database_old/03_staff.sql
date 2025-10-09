-- ========================================
-- STAFF - Personal mit S-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für S-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_staff_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- S- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'S-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM staff WHERE staff_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for staff_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_staff_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50),
    labels TEXT[] DEFAULT '{}', -- host, teacher, instructor, kitchen, maintenance, other
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_staff_camp_id ON staff(camp_id);
CREATE INDEX idx_staff_active ON staff(camp_id, is_active);
CREATE INDEX idx_staff_labels ON staff USING GIN(labels); -- Array-Suche
CREATE UNIQUE INDEX idx_staff_id ON staff(staff_id);

-- Auto-Update Trigger
CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Staff des eigenen Camps sichtbar
CREATE POLICY staff_camp_isolation ON staff
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Staff
INSERT INTO staff (camp_id, name, labels, mobile_number) VALUES
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Max Mustermann', ARRAY['instructor', 'host'], '+49123456789'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Anna Schmidt', ARRAY['kitchen'], '+49987654321'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Tom Wilson', ARRAY['teacher', 'instructor'], '+49555123456');