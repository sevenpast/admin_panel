-- ========================================
-- EVENT_ASSIGNMENTS - Guest-Event Zuweisungen
-- ========================================

-- ENUM für Event Assignment Status
CREATE TYPE event_assignment_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'no_show', 'attended');

CREATE TABLE event_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,

    -- Assignment Status
    status event_assignment_status_enum DEFAULT 'pending',

    -- Participation Tracking
    registered_at TIMESTAMPTZ DEFAULT now(),
    confirmed_at TIMESTAMPTZ, -- Wann Guest bestätigt hat
    attended_at TIMESTAMPTZ, -- Wann Guest tatsächlich teilgenommen hat
    cancelled_at TIMESTAMPTZ, -- Wann abgesagt wurde

    -- Additional Info
    special_requests TEXT, -- "Vegetarian meal", "Need wheelchair access"
    dietary_requirements TEXT, -- Für Meal Events
    notes TEXT, -- Staff notes

    -- Payment (für kostenpflichtige Events)
    payment_required DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'none', -- 'none', 'pending', 'paid', 'refunded'
    paid_at TIMESTAMPTZ,

    -- Tracking
    assigned_by UUID REFERENCES staff(id), -- Wer hat zugewiesen
    cancelled_reason TEXT, -- Grund der Absage

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Ein Guest kann nicht mehrfach für dasselbe Event zugewiesen werden
    UNIQUE(event_id, guest_id)
);

-- Performance Indizes
CREATE INDEX idx_event_assignments_camp_id ON event_assignments(camp_id);
CREATE INDEX idx_event_assignments_event_id ON event_assignments(event_id);
CREATE INDEX idx_event_assignments_guest_id ON event_assignments(guest_id);
CREATE INDEX idx_event_assignments_status ON event_assignments(event_id, status);
CREATE INDEX idx_event_assignments_confirmed ON event_assignments(event_id, status) WHERE status = 'confirmed';
CREATE INDEX idx_event_assignments_attended ON event_assignments(event_id, status) WHERE status = 'attended';
CREATE INDEX idx_event_assignments_payment ON event_assignments(payment_status) WHERE payment_required > 0;

-- Function: Event Assignment Validierungen
CREATE OR REPLACE FUNCTION validate_event_assignment() RETURNS TRIGGER AS $$
DECLARE
    guest_record RECORD;
    event_record RECORD;
    existing_participants INTEGER;
BEGIN
    -- Guest-Daten holen
    SELECT is_active INTO guest_record
    FROM guests
    WHERE id = NEW.guest_id;

    -- Event-Daten holen
    SELECT is_active, status, max_participants, current_participants,
           cost_per_person, included_in_package INTO event_record
    FROM events
    WHERE id = NEW.event_id;

    -- Validierungen
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guest or event not found';
    END IF;

    IF NOT guest_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign inactive guest to event';
    END IF;

    IF NOT event_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign guest to inactive event';
    END IF;

    IF event_record.status NOT IN ('draft', 'published') THEN
        RAISE EXCEPTION 'Cannot assign guest to cancelled or completed event';
    END IF;

    -- Kapazitätsprüfung nur bei confirmed Status
    IF NEW.status = 'confirmed' AND event_record.max_participants IS NOT NULL THEN
        -- Zähle bestätigte Teilnehmer (ohne die aktuelle Assignment wenn UPDATE)
        SELECT COUNT(*) INTO existing_participants
        FROM event_assignments
        WHERE event_id = NEW.event_id
            AND status = 'confirmed'
            AND (TG_OP = 'INSERT' OR id != NEW.id);

        IF existing_participants >= event_record.max_participants THEN
            RAISE EXCEPTION 'Event has reached maximum capacity (% participants)', event_record.max_participants;
        END IF;
    END IF;

    -- Payment Required setzen für kostenpflichtige Events
    IF NOT event_record.included_in_package AND event_record.cost_per_person > 0 THEN
        NEW.payment_required := event_record.cost_per_person;
        IF NEW.payment_status = 'none' THEN
            NEW.payment_status := 'pending';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Event Assignment Validierung
CREATE TRIGGER validate_event_assignment_trigger
    BEFORE INSERT OR UPDATE ON event_assignments
    FOR EACH ROW
    EXECUTE FUNCTION validate_event_assignment();

-- Function: Update Status Timestamps automatisch
CREATE OR REPLACE FUNCTION update_event_assignment_timestamps() RETURNS TRIGGER AS $$
BEGIN
    -- confirmed_at aktualisieren wenn status auf 'confirmed' wechselt
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'confirmed' THEN
                NEW.confirmed_at := now();
            WHEN 'cancelled' THEN
                NEW.cancelled_at := now();
            WHEN 'attended' THEN
                NEW.attended_at := now();
                -- Automatisch auch confirmed setzen falls nicht gesetzt
                IF NEW.confirmed_at IS NULL THEN
                    NEW.confirmed_at := now();
                END IF;
        END CASE;
    END IF;

    -- paid_at aktualisieren wenn payment_status auf 'paid' wechselt
    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'paid' THEN
        NEW.paid_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_assignment_timestamps_trigger
    BEFORE UPDATE ON event_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_event_assignment_timestamps();

-- Trigger: Event Participants Counter updaten (calls function from events table)
CREATE TRIGGER update_event_participants_trigger
    AFTER INSERT OR UPDATE OR DELETE ON event_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participants();

-- Auto-Update Trigger
CREATE TRIGGER update_event_assignments_updated_at
    BEFORE UPDATE ON event_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE event_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Event Assignments des eigenen Camps
CREATE POLICY event_assignments_camp_isolation ON event_assignments
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Event Assignments
INSERT INTO event_assignments (camp_id, event_id, guest_id, assigned_by, status, special_requests, payment_status) VALUES
    -- John Doe → Beach Volleyball (free, confirmed)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM events WHERE title = 'Morning Beach Volleyball'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'confirmed',
     'Prefer team captain role',
     'none'),

    -- Maria Garcia → Sunrise Yoga (free, confirmed)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM events WHERE title = 'Sunrise Yoga Session'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'confirmed',
     'Beginner level, need yoga mat',
     'none'),

    -- Sarah Connor → BBQ Night (paid event, pending payment)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM events WHERE title = 'BBQ Night & Live Music'),
     (SELECT id FROM guests WHERE name = 'Sarah Connor'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'pending',
     'Vegetarian meal please',
     'pending'),

    -- John Doe → Sunset Photography (paid event, confirmed & paid)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM events WHERE title = 'Sunset Photography Workshop'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'confirmed',
     'Have DSLR camera, intermediate level',
     'paid'),

    -- Alle Gäste → Mandatory Orientation (free, confirmed)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM events WHERE title = 'Camp Orientation & Safety Briefing'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'confirmed',
     NULL,
     'none'),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM events WHERE title = 'Camp Orientation & Safety Briefing'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'confirmed',
     NULL,
     'none'),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM events WHERE title = 'Camp Orientation & Safety Briefing'),
     (SELECT id FROM guests WHERE name = 'Sarah Connor'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     'confirmed',
     NULL,
     'none');