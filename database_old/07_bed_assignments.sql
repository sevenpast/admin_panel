-- ========================================
-- BED_ASSIGNMENTS - Guest-Bed Zuweisungen
-- ========================================

-- ENUM für Assignment Status
CREATE TYPE assignment_status_enum AS ENUM ('active', 'checked_out', 'completed');

CREATE TABLE bed_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
    status assignment_status_enum DEFAULT 'active',

    -- Tracking
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES staff(id), -- Welcher Staff hat zugewiesen
    checked_out_at TIMESTAMPTZ, -- Temporäre Abwesenheit
    completed_at TIMESTAMPTZ, -- Endgültiger Check-Out

    -- Notizen
    notes TEXT, -- "Guest requested bed near window", etc.

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_bed_assignments_camp_id ON bed_assignments(camp_id);
CREATE INDEX idx_bed_assignments_guest_id ON bed_assignments(guest_id);
CREATE INDEX idx_bed_assignments_bed_id ON bed_assignments(bed_id);
CREATE INDEX idx_bed_assignments_active ON bed_assignments(camp_id, status) WHERE status = 'active';

-- Constraint: Ein Guest kann nur ein aktives Bed haben
CREATE UNIQUE INDEX idx_bed_assignments_guest_unique_active
    ON bed_assignments(guest_id)
    WHERE status = 'active';

-- Trigger: Bed current_occupancy automatisch updaten
CREATE OR REPLACE FUNCTION update_bed_occupancy() RETURNS TRIGGER AS $$
DECLARE
    bed_uuid UUID;
    new_occupancy INTEGER;
BEGIN
    -- Bestimme betroffenes Bed
    IF TG_OP = 'DELETE' THEN
        bed_uuid := OLD.bed_id;
    ELSE
        bed_uuid := COALESCE(NEW.bed_id, OLD.bed_id);
    END IF;

    -- Berechne neue Occupancy für das Bed
    SELECT COUNT(*) INTO new_occupancy
    FROM bed_assignments
    WHERE bed_id = bed_uuid AND status = 'active';

    -- Update Bed current_occupancy
    UPDATE beds
    SET current_occupancy = new_occupancy,
        updated_at = now()
    WHERE id = bed_uuid;

    -- Bei Bettwechsel (UPDATE mit bed_id Änderung): auch altes Bed updaten
    IF TG_OP = 'UPDATE' AND OLD.bed_id != NEW.bed_id THEN
        SELECT COUNT(*) INTO new_occupancy
        FROM bed_assignments
        WHERE bed_id = OLD.bed_id AND status = 'active';

        UPDATE beds
        SET current_occupancy = new_occupancy,
            updated_at = now()
        WHERE id = OLD.bed_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Occupancy bei Assignment-Änderungen updaten
CREATE TRIGGER update_bed_occupancy_trigger
    AFTER INSERT OR UPDATE OR DELETE ON bed_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_bed_occupancy();

-- Trigger: Guest Deaktivierung → alle Bed Assignments beenden
CREATE OR REPLACE FUNCTION handle_guest_deactivation() RETURNS TRIGGER AS $$
BEGIN
    -- Wenn Guest inaktiv wird, alle aktiven Bed Assignments beenden
    IF OLD.is_active = true AND NEW.is_active = false THEN
        UPDATE bed_assignments
        SET status = 'completed',
            completed_at = now(),
            updated_at = now()
        WHERE guest_id = NEW.id AND status = 'active';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger auf guests Tabelle: Deaktivierung cascadieren
CREATE TRIGGER guest_deactivation_trigger
    AFTER UPDATE OF is_active ON guests
    FOR EACH ROW
    EXECUTE FUNCTION handle_guest_deactivation();

-- Auto-Update Trigger
CREATE TRIGGER update_bed_assignments_updated_at
    BEFORE UPDATE ON bed_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE bed_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Assignments des eigenen Camps
CREATE POLICY bed_assignments_camp_isolation ON bed_assignments
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Bed Assignments - Gäste zu Betten zuweisen
INSERT INTO bed_assignments (camp_id, guest_id, bed_id, assigned_by, notes) VALUES
    -- John Doe → Bed 1 in Dormitory A
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM beds WHERE identifier = 'Bed 1' LIMIT 1),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'Initial check-in assignment'),

    -- Maria Garcia → Bed A in Dormitory B
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM beds WHERE identifier = 'Bed A' AND room_id = (SELECT id FROM rooms WHERE name = 'Dormitory B')),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'Initial check-in assignment'),

    -- Sarah Connor → Double Bed in Private Room 1
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'Sarah Connor'),
     (SELECT id FROM beds WHERE identifier = 'Double Bed'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'Private room assignment');