-- ========================================
-- ROOMS - Zimmer mit R-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für R-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_room_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- R- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'R-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM rooms WHERE room_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for room_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUM für Zimmertypen
CREATE TYPE room_type_enum AS ENUM ('dormitory', 'private', 'suite');

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_room_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- "Dormitory A", "Private Room 1"
    room_type room_type_enum DEFAULT 'dormitory',
    description TEXT,
    max_capacity INTEGER DEFAULT 0, -- Obergrenze für Überbelegungswarnung
    floor_number INTEGER DEFAULT 1,
    room_number VARCHAR(20), -- "101", "A1", etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_rooms_camp_id ON rooms(camp_id);
CREATE INDEX idx_rooms_active ON rooms(camp_id, is_active);
CREATE INDEX idx_rooms_type ON rooms(camp_id, room_type);
CREATE UNIQUE INDEX idx_rooms_id ON rooms(room_id);

-- Auto-Update Trigger
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Rooms des eigenen Camps
CREATE POLICY rooms_camp_isolation ON rooms
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Rooms
INSERT INTO rooms (camp_id, name, room_type, max_capacity, room_number, description) VALUES
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Dormitory A', 'dormitory', 8, 'A1', '8-bed shared dormitory with lockers'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Dormitory B', 'dormitory', 6, 'A2', '6-bed shared dormitory with ocean view'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Private Room 1', 'private', 2, 'B1', 'Double bed private room'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Private Room 2', 'private', 2, 'B2', 'Twin beds private room'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Suite Deluxe', 'suite', 3, 'C1', 'Suite with double bed and sofa bed');