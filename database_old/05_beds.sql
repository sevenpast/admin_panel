-- ========================================
-- BEDS - Betten mit B-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für B-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_bed_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- B- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'B-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM beds WHERE bed_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for bed_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUMs für Betttypen
CREATE TYPE bed_type_enum AS ENUM ('single', 'double', 'bunk', 'queen', 'king', 'sofa', 'extra', 'crib');
CREATE TYPE bed_slot_enum AS ENUM ('upper', 'lower', 'single');

CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_bed_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    identifier VARCHAR(50) NOT NULL, -- "Bed 1", "Upper Left", etc.
    bed_type bed_type_enum DEFAULT 'single',
    capacity INTEGER NOT NULL DEFAULT 1, -- Auto-gesetzt via Trigger
    current_occupancy INTEGER DEFAULT 0, -- Live-Tracking für Dashboard
    group_id UUID, -- Für Etagenbetten (Upper/Lower = same group)
    slot bed_slot_enum DEFAULT 'single',
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Constraints
    CHECK (current_occupancy >= 0),
    CHECK (capacity > 0 AND capacity <= 2)
);

-- Performance Indizes
CREATE INDEX idx_beds_camp_id ON beds(camp_id);
CREATE INDEX idx_beds_room_id ON beds(room_id);
CREATE INDEX idx_beds_active ON beds(camp_id, is_active);
CREATE INDEX idx_beds_available ON beds(camp_id, current_occupancy, capacity) WHERE is_active = true;
CREATE INDEX idx_beds_group ON beds(group_id) WHERE group_id IS NOT NULL;
CREATE UNIQUE INDEX idx_beds_id ON beds(bed_id);

-- Trigger: Auto-Kapazität basierend auf Betttyp
CREATE OR REPLACE FUNCTION set_bed_capacity() RETURNS TRIGGER AS $$
BEGIN
    CASE NEW.bed_type
        WHEN 'single', 'sofa', 'extra', 'crib' THEN
            NEW.capacity := 1;
        WHEN 'double', 'queen', 'king', 'bunk' THEN
            NEW.capacity := 2;
    END CASE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_bed_capacity_trigger
    BEFORE INSERT OR UPDATE OF bed_type ON beds
    FOR EACH ROW
    EXECUTE FUNCTION set_bed_capacity();

-- Auto-Update Trigger
CREATE TRIGGER update_beds_updated_at
    BEFORE UPDATE ON beds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Beds von Rooms des eigenen Camps
CREATE POLICY beds_camp_isolation ON beds
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Beds für die bestehenden Rooms
INSERT INTO beds (camp_id, room_id, identifier, bed_type) VALUES
    -- Dormitory A (2 Betten)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Dormitory A'), 'Bed 1', 'single'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Dormitory A'), 'Bed 2', 'single'),

    -- Dormitory B (3 Betten)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Dormitory B'), 'Bed A', 'single'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Dormitory B'), 'Bed B', 'single'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Dormitory B'), 'Bed C', 'single'),

    -- Private Room 1 (Double Bed)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Private Room 1'), 'Double Bed', 'double'),

    -- Private Room 2 (Twin Beds)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Private Room 2'), 'Bed A', 'single'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Private Room 2'), 'Bed B', 'single'),

    -- Suite Deluxe (King + Sofa)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Suite Deluxe'), 'King Bed', 'king'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), (SELECT id FROM rooms WHERE name = 'Suite Deluxe'), 'Sofa Bed', 'sofa');