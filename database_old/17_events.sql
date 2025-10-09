-- ========================================
-- EVENTS - Camp Events mit E-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für E-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_event_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- E- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'E-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM events WHERE event_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for event_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUMs für Events
CREATE TYPE event_category_enum AS ENUM ('activity', 'excursion', 'social', 'sport', 'workshop', 'meal_event', 'other');
CREATE TYPE event_status_enum AS ENUM ('draft', 'published', 'cancelled', 'completed');

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_event_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

    -- Basic Event Info
    title VARCHAR(255) NOT NULL, -- "Beach Volleyball", "Sunset Yoga", "BBQ Night"
    category event_category_enum NOT NULL DEFAULT 'activity',
    location VARCHAR(255) NOT NULL, -- "Beach Court", "Yoga Deck", "Main Terrace"

    -- Time & Duration
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,

    -- Event Details
    description TEXT,
    status event_status_enum DEFAULT 'draft',

    -- Capacity Management
    max_participants INTEGER CHECK (max_participants IS NULL OR max_participants > 0),
    current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),

    -- Requirements & Restrictions
    requirements TEXT, -- "Bring water bottle", "Wear comfortable shoes"
    min_age INTEGER CHECK (min_age IS NULL OR min_age >= 0),
    max_age INTEGER CHECK (max_age IS NULL OR max_age >= min_age),

    -- Costs (optional)
    cost_per_person DECIMAL(10,2) DEFAULT 0,
    included_in_package BOOLEAN DEFAULT true, -- Teil des Camp-Pakets oder Extra-Cost

    -- Staff & Organization
    organizer_id UUID REFERENCES staff(id), -- Hauptverantwortlicher
    additional_staff UUID[], -- Array von staff_ids für zusätzliche Helfer

    -- Alerts & Notifications
    alert_time TIMESTAMPTZ, -- Wann Alert senden
    alert_text TEXT, -- "Event starts in 30 minutes at Beach Court"

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_mandatory BOOLEAN DEFAULT false, -- Pflichtveranstaltung

    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Logische Constraints
    CONSTRAINT events_time_check CHECK (end_at > start_at),
    CONSTRAINT events_age_check CHECK (max_age IS NULL OR max_age >= min_age),
    CONSTRAINT events_participants_check CHECK (current_participants <= COALESCE(max_participants, current_participants))
);

-- Performance Indizes
CREATE INDEX idx_events_camp_id ON events(camp_id);
CREATE INDEX idx_events_start_time ON events(camp_id, start_at);
CREATE INDEX idx_events_category ON events(camp_id, category);
CREATE INDEX idx_events_status ON events(camp_id, status);
CREATE INDEX idx_events_active ON events(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_events_published ON events(camp_id, status) WHERE status = 'published';
CREATE INDEX idx_events_organizer ON events(organizer_id) WHERE organizer_id IS NOT NULL;
CREATE INDEX idx_events_additional_staff ON events USING GIN (additional_staff);
CREATE UNIQUE INDEX idx_event_id ON events(event_id);

-- Function: Update current_participants automatisch (wird von event_assignments aufgerufen)
CREATE OR REPLACE FUNCTION update_event_participants() RETURNS TRIGGER AS $$
DECLARE
    participant_count INTEGER;
    event_uuid UUID;
BEGIN
    -- Bestimme betroffenes Event
    IF TG_OP = 'DELETE' THEN
        event_uuid := OLD.event_id;
    ELSE
        event_uuid := NEW.event_id;
    END IF;

    -- Berechne aktuelle Teilnehmer für dieses Event
    SELECT COUNT(*) INTO participant_count
    FROM event_assignments
    WHERE event_id = event_uuid AND status = 'confirmed';

    -- Update events.current_participants
    UPDATE events
    SET current_participants = participant_count,
        updated_at = now()
    WHERE id = event_uuid;

    -- Bei OLD event_id auch updaten (für Event-Wechsel)
    IF TG_OP = 'UPDATE' AND OLD.event_id != NEW.event_id THEN
        SELECT COUNT(*) INTO participant_count
        FROM event_assignments
        WHERE event_id = OLD.event_id AND status = 'confirmed';

        UPDATE events
        SET current_participants = participant_count,
            updated_at = now()
        WHERE id = OLD.event_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Auto-Update Trigger
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Events des eigenen Camps
CREATE POLICY events_camp_isolation ON events
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Events
INSERT INTO events (camp_id, title, category, location, start_at, end_at, description, max_participants, requirements, organizer_id, cost_per_person, included_in_package, is_mandatory, created_by) VALUES
    -- Morning Activities
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Morning Beach Volleyball',
     'sport',
     'Beach Court',
     CURRENT_DATE + INTERVAL '1 day' + TIME '08:00',
     CURRENT_DATE + INTERVAL '1 day' + TIME '09:30',
     'Friendly beach volleyball tournament with prizes for winners',
     12,
     'Bring water bottle and wear sports shoes',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     0,
     true,
     false,
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Sunrise Yoga Session',
     'activity',
     'Yoga Deck',
     CURRENT_DATE + INTERVAL '1 day' + TIME '06:30',
     CURRENT_DATE + INTERVAL '1 day' + TIME '07:30',
     'Start your day with peaceful yoga overlooking the ocean',
     20,
     'Bring yoga mat if you have one, wear comfortable clothes',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     0,
     true,
     false,
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Afternoon/Evening Activities
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Sunset Photography Workshop',
     'workshop',
     'Viewpoint Deck',
     CURRENT_DATE + TIME '17:30',
     CURRENT_DATE + TIME '19:00',
     'Learn professional photography techniques during golden hour',
     8,
     'Bring camera or smartphone, basic photography knowledge helpful',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     25,
     false,
     false,
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Social Events
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'BBQ Night & Live Music',
     'social',
     'Main Terrace',
     CURRENT_DATE + TIME '19:00',
     CURRENT_DATE + TIME '23:00',
     'Community BBQ with live acoustic music and campfire stories',
     50,
     'Vegetarian and vegan options available',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     15,
     false,
     false,
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Excursions
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Island Boat Tour',
     'excursion',
     'Harbor Dock',
     CURRENT_DATE + INTERVAL '2 days' + TIME '09:00',
     CURRENT_DATE + INTERVAL '2 days' + TIME '16:00',
     'Full-day boat tour exploring nearby islands with snorkeling stops',
     15,
     'Bring sunscreen, hat, swimwear, and snorkeling gear if you have it',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     45,
     false,
     false,
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Mandatory Events
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Camp Orientation & Safety Briefing',
     'other',
     'Main Hall',
     CURRENT_DATE + TIME '16:00',
     CURRENT_DATE + TIME '17:00',
     'Mandatory orientation for all new arrivals covering camp rules, safety procedures, and activity schedules',
     100,
     'Attendance required for all guests',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     0,
     true,
     true,
     (SELECT id FROM staff WHERE name = 'Max Mustermann'));