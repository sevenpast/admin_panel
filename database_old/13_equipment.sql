-- ========================================
-- EQUIPMENT - Material/Equipment mit U-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für U-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_equipment_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- U- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'U-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM equipment WHERE equipment_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for equipment_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUMs für Equipment
CREATE TYPE equipment_category_enum AS ENUM ('surfboard', 'wetsuit', 'safety', 'cleaning', 'other');
CREATE TYPE equipment_status_enum AS ENUM ('available', 'assigned', 'maintenance', 'retired');
CREATE TYPE equipment_condition_enum AS ENUM ('excellent', 'good', 'fair', 'poor');

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_equipment_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- "Beginner Board 8'0", "Wetsuit XL 3mm"
    category equipment_category_enum NOT NULL,
    type VARCHAR(100), -- "Longboard", "Shortboard", "Full Wetsuit", "Helmet"
    brand VARCHAR(100),
    size VARCHAR(50), -- "8'0", "XL", "Medium", etc.

    -- Status & Condition
    status equipment_status_enum DEFAULT 'available',
    condition equipment_condition_enum DEFAULT 'good',

    -- Assignment (wird durch equipment_assignments Tabelle verwaltet)
    currently_assigned_to UUID REFERENCES guests(id), -- Cache für Performance

    -- Additional Info
    description TEXT,
    serial_number VARCHAR(100),
    purchase_date DATE,
    notes TEXT,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_equipment_camp_id ON equipment(camp_id);
CREATE INDEX idx_equipment_status ON equipment(camp_id, status);
CREATE INDEX idx_equipment_category ON equipment(camp_id, category);
CREATE INDEX idx_equipment_available ON equipment(camp_id, status, is_active)
    WHERE status = 'available' AND is_active = true;
CREATE INDEX idx_equipment_assigned_to ON equipment(currently_assigned_to) WHERE currently_assigned_to IS NOT NULL;
CREATE UNIQUE INDEX idx_equipment_id ON equipment(equipment_id);

-- Auto-Update Trigger
CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Equipment des eigenen Camps
CREATE POLICY equipment_camp_isolation ON equipment
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Equipment
INSERT INTO equipment (camp_id, name, category, type, brand, size, status, condition, description) VALUES
    -- Surfboards
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Beginner Board 8''0', 'surfboard', 'Longboard', 'Catch Surf', '8''0', 'available', 'good', 'Soft-top beginner friendly longboard'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Beginner Board 8''6', 'surfboard', 'Longboard', 'Catch Surf', '8''6', 'available', 'excellent', 'Soft-top beginner friendly longboard'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Intermediate Board 7''6', 'surfboard', 'Funboard', 'Lost', '7''6', 'available', 'good', 'Mid-length board for progressing surfers'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Advanced Board 6''2', 'surfboard', 'Shortboard', 'Al Byrne', '6''2', 'available', 'excellent', 'High performance shortboard'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Repair Board 8''0', 'surfboard', 'Longboard', 'Generic', '8''0', 'maintenance', 'fair', 'Needs fin box repair'),

    -- Wetsuits
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Wetsuit XS 3mm', 'wetsuit', 'Full Suit', 'Rip Curl', 'XS', 'available', 'excellent', '3mm full wetsuit for cooler water'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Wetsuit S 3mm', 'wetsuit', 'Full Suit', 'Rip Curl', 'S', 'available', 'good', '3mm full wetsuit for cooler water'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Wetsuit M 3mm', 'wetsuit', 'Full Suit', 'Rip Curl', 'M', 'available', 'good', '3mm full wetsuit for cooler water'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Wetsuit L 2mm', 'wetsuit', 'Full Suit', 'Billabong', 'L', 'available', 'excellent', '2mm full wetsuit for warmer water'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Wetsuit XL 2mm', 'wetsuit', 'Full Suit', 'Billabong', 'XL', 'available', 'good', '2mm full wetsuit for warmer water'),

    -- Safety Equipment
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Surf Helmet S', 'safety', 'Helmet', 'Pro-Tec', 'S', 'available', 'excellent', 'Protective helmet for surf lessons'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Surf Helmet M', 'safety', 'Helmet', 'Pro-Tec', 'M', 'available', 'good', 'Protective helmet for surf lessons'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Life Vest M', 'safety', 'Life Vest', 'O''Neill', 'M', 'available', 'excellent', 'Buoyancy aid for beginners'),

    -- Cleaning Supplies
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Board Wax Remover', 'cleaning', 'Wax Remover', 'Sexwax', 'Standard', 'available', 'good', 'Wax remover for board maintenance'),
    ((SELECT id FROM camps WHERE name = 'Demo Camp'), 'Wetsuit Cleaner', 'cleaning', 'Cleaner', 'Prana', 'Standard', 'available', 'excellent', 'Wetsuit cleaning solution');