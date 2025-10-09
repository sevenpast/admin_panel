-- ========================================
-- GUESTS - Gäste mit G-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für G-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_guest_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- G- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'G-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM guests WHERE guest_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for guest_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUM für Surf Level
CREATE TYPE surf_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_guest_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50),
    instagram VARCHAR(100), -- Handle ohne @
    surf_package BOOLEAN DEFAULT true, -- Berechtigung für Surf Lessons
    is_active BOOLEAN DEFAULT true, -- Im Haus und teilnahmeberechtigt

    -- Surf Level (wird von Instructor gesetzt)
    surf_level surf_level_enum,
    surf_level_set_by UUID REFERENCES staff(id),
    surf_level_set_at TIMESTAMPTZ,

    -- Allergien für Meal Management
    allergies JSONB DEFAULT '{}', -- {"nuts": true, "dairy": false, "gluten": true}
    other_allergies TEXT, -- Freitext für sonstige Allergien

    -- QR Code für Check-In/Scan-Flows
    qr_code_payload JSONB,
    qr_code_generated_at TIMESTAMPTZ,

    -- Zusatz-Infos
    notes TEXT,
    image_url TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_guests_camp_id ON guests(camp_id);
CREATE INDEX idx_guests_active ON guests(camp_id, is_active);
CREATE INDEX idx_guests_surf_package ON guests(camp_id, surf_package, is_active);
CREATE INDEX idx_guests_surf_level ON guests(camp_id, surf_level) WHERE surf_level IS NOT NULL;
CREATE INDEX idx_guests_allergies ON guests USING GIN(allergies);
CREATE UNIQUE INDEX idx_guests_id ON guests(guest_id);

-- Auto-Update Trigger
CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Guests des eigenen Camps
CREATE POLICY guests_camp_isolation ON guests
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Guests
INSERT INTO guests (camp_id, name, mobile_number, instagram, surf_package, is_active, allergies, other_allergies) VALUES
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'John Doe', '+49123456789', 'johndoe_surf', true, true, '{"nuts": true, "dairy": false}', 'Shellfish allergy (severe)'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Maria Garcia', '+34666777888', 'maria_waves', true, true, '{"gluten": true}', NULL),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Tom Wilson', '+44777888999', NULL, false, true, '{}', NULL),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Sarah Connor', '+1555123456', 'sarah_surfgirl', true, true, '{"dairy": true, "eggs": true}', 'No spicy food'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Alex Johnson', NULL, 'alex_boardrider', true, false, '{}', NULL); -- Inaktiv für Testing