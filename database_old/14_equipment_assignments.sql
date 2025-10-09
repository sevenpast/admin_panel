-- ========================================
-- EQUIPMENT_ASSIGNMENTS - Equipment-Guest Zuweisungen
-- ========================================

-- ENUM für Assignment Status
CREATE TYPE equipment_assignment_status_enum AS ENUM ('active', 'returned', 'lost', 'damaged');

CREATE TABLE equipment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    status equipment_assignment_status_enum DEFAULT 'active',

    -- Tracking
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES staff(id), -- Wer hat zugewiesen
    returned_at TIMESTAMPTZ, -- Wann zurückgegeben
    returned_to UUID REFERENCES staff(id), -- An wen zurückgegeben

    -- Condition Tracking
    condition_out equipment_condition_enum, -- Zustand bei Ausgabe
    condition_in equipment_condition_enum, -- Zustand bei Rückgabe

    notes TEXT, -- "Small ding on nose", "Lost fin", etc.

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Ein Equipment kann nicht gleichzeitig an mehrere Guests verliehen sein
    UNIQUE(equipment_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Performance Indizes
CREATE INDEX idx_equipment_assignments_camp_id ON equipment_assignments(camp_id);
CREATE INDEX idx_equipment_assignments_equipment_id ON equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_assignments_guest_id ON equipment_assignments(guest_id);
CREATE INDEX idx_equipment_assignments_active ON equipment_assignments(camp_id, status) WHERE status = 'active';
CREATE INDEX idx_equipment_assignments_guest_active ON equipment_assignments(guest_id, status) WHERE status = 'active';

-- Function: Equipment Assignment Validierungen
CREATE OR REPLACE FUNCTION validate_equipment_assignment() RETURNS TRIGGER AS $$
DECLARE
    guest_record RECORD;
    equipment_record RECORD;
    existing_board_count INTEGER;
BEGIN
    -- Guest-Daten holen
    SELECT is_active, surf_package INTO guest_record
    FROM guests
    WHERE id = NEW.guest_id;

    -- Equipment-Daten holen
    SELECT status, category INTO equipment_record
    FROM equipment
    WHERE id = NEW.equipment_id;

    -- Guest-Validierungen
    IF NOT guest_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign equipment to inactive guest';
    END IF;

    -- Equipment-Validierungen
    IF equipment_record.status NOT IN ('available') THEN
        RAISE EXCEPTION 'Equipment is not available for assignment';
    END IF;

    -- Business Rule: Ein Guest darf nicht mehrere Surfboards gleichzeitig haben
    IF equipment_record.category = 'surfboard' AND NEW.status = 'active' THEN
        SELECT COUNT(*) INTO existing_board_count
        FROM equipment_assignments ea
        JOIN equipment e ON ea.equipment_id = e.id
        WHERE ea.guest_id = NEW.guest_id
            AND ea.status = 'active'
            AND e.category = 'surfboard'
            AND (TG_OP = 'INSERT' OR ea.id != NEW.id); -- Bei UPDATE: eigene Assignment ausschließen

        IF existing_board_count > 0 THEN
            RAISE EXCEPTION 'Guest already has an active surfboard assignment';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Equipment Assignment Validierung
CREATE TRIGGER validate_equipment_assignment_trigger
    BEFORE INSERT OR UPDATE ON equipment_assignments
    FOR EACH ROW
    EXECUTE FUNCTION validate_equipment_assignment();

-- Function: Equipment Status und currently_assigned_to automatisch updaten
CREATE OR REPLACE FUNCTION update_equipment_status() RETURNS TRIGGER AS $$
DECLARE
    equipment_uuid UUID;
    new_status equipment_status_enum;
    assigned_guest UUID;
BEGIN
    -- Bestimme betroffenes Equipment
    IF TG_OP = 'DELETE' THEN
        equipment_uuid := OLD.equipment_id;
    ELSE
        equipment_uuid := NEW.equipment_id;
    END IF;

    -- Prüfe aktive Assignments für dieses Equipment
    SELECT guest_id INTO assigned_guest
    FROM equipment_assignments
    WHERE equipment_id = equipment_uuid AND status = 'active'
    LIMIT 1;

    -- Bestimme neuen Status
    IF assigned_guest IS NOT NULL THEN
        new_status := 'assigned';
    ELSE
        new_status := 'available';
    END IF;

    -- Update Equipment
    UPDATE equipment
    SET status = new_status,
        currently_assigned_to = assigned_guest,
        updated_at = now()
    WHERE id = equipment_uuid;

    -- Bei OLD equipment_id auch updaten (für Equipment-Wechsel)
    IF TG_OP = 'UPDATE' AND OLD.equipment_id != NEW.equipment_id THEN
        SELECT guest_id INTO assigned_guest
        FROM equipment_assignments
        WHERE equipment_id = OLD.equipment_id AND status = 'active'
        LIMIT 1;

        IF assigned_guest IS NOT NULL THEN
            new_status := 'assigned';
        ELSE
            new_status := 'available';
        END IF;

        UPDATE equipment
        SET status = new_status,
            currently_assigned_to = assigned_guest,
            updated_at = now()
        WHERE id = OLD.equipment_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Equipment Status bei Assignment-Änderungen updaten
CREATE TRIGGER update_equipment_status_trigger
    AFTER INSERT OR UPDATE OR DELETE ON equipment_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_status();

-- Auto-Update Trigger
CREATE TRIGGER update_equipment_assignments_updated_at
    BEFORE UPDATE ON equipment_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Equipment Assignments des eigenen Camps
CREATE POLICY equipment_assignments_camp_isolation ON equipment_assignments
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Equipment Assignments
INSERT INTO equipment_assignments (camp_id, equipment_id, guest_id, assigned_by, condition_out, notes) VALUES
    -- John Doe → Beginner Board 8'0
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM equipment WHERE name = 'Beginner Board 8''0'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'good',
     'First lesson assignment'),

    -- Maria Garcia → Intermediate Board 7'6
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM equipment WHERE name = 'Intermediate Board 7''6'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'good',
     'Intermediate level assignment'),

    -- Sarah Connor → Wetsuit M 3mm
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM equipment WHERE name = 'Wetsuit M 3mm'),
     (SELECT id FROM guests WHERE name = 'Sarah Connor'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'good',
     'Standard wetsuit assignment');