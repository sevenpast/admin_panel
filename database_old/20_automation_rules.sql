-- ========================================
-- AUTOMATION_RULES - Alert & Cutoff Regeln mit A-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für A-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_automation_rule_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- A- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'A-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM automation_rules WHERE automation_rule_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for automation_rule_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUMs für Alert Management
CREATE TYPE automation_target_enum AS ENUM ('meals', 'events', 'surf_lessons');
CREATE TYPE meal_type_automation_enum AS ENUM ('breakfast', 'lunch', 'dinner');
CREATE TYPE recurrence_type_enum AS ENUM ('none', 'daily', 'weekly', 'monthly', 'custom');

CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_rule_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_automation_rule_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

    -- Rule Basic Info
    name VARCHAR(255) NOT NULL, -- "Breakfast Alert Daily"
    target automation_target_enum NOT NULL,
    meal_type meal_type_automation_enum, -- Nur für target='meals'

    -- Alert Configuration
    alert_days_before INTEGER NOT NULL DEFAULT 0 CHECK (alert_days_before >= 0),
    alert_time TIME NOT NULL, -- 24-hour format
    alert_message TEXT NOT NULL,
    send_automatically BOOLEAN DEFAULT true,

    -- Cutoff Configuration (optional)
    cutoff_enabled BOOLEAN DEFAULT false,
    cutoff_days_before INTEGER CHECK (cutoff_days_before >= 0),
    cutoff_time TIME, -- 24-hour format

    -- Recurrence Settings
    recurring BOOLEAN DEFAULT false,
    recurrence_type recurrence_type_enum DEFAULT 'none',
    recurrence_payload JSONB, -- {"days": ["MO", "WE", "FR"], "count": 12, "until": "2024-12-31"}

    -- Season & Special Date Overrides
    season_override JSONB, -- {"summer": {"alert_time": "20:00", "cutoff_time": "19:00"}}
    special_dates JSONB[], -- [{"date": "2024-12-25", "alert_time": "18:00", "message": "Special Christmas meal"}]

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Audit
    created_by UUID REFERENCES staff(id),
    updated_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Constraints
    CONSTRAINT automation_rules_meal_type_check
        CHECK ((target = 'meals' AND meal_type IS NOT NULL) OR (target != 'meals' AND meal_type IS NULL)),
    CONSTRAINT automation_rules_cutoff_check
        CHECK ((cutoff_enabled = false) OR (cutoff_enabled = true AND cutoff_days_before IS NOT NULL AND cutoff_time IS NOT NULL))
);

-- Performance Indizes
CREATE INDEX idx_automation_rules_camp_id ON automation_rules(camp_id);
CREATE INDEX idx_automation_rules_target ON automation_rules(camp_id, target);
CREATE INDEX idx_automation_rules_active ON automation_rules(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_automation_rules_recurring ON automation_rules(camp_id, recurring) WHERE recurring = true;
CREATE INDEX idx_automation_rules_meal_type ON automation_rules(camp_id, meal_type) WHERE meal_type IS NOT NULL;
CREATE UNIQUE INDEX idx_automation_rule_id ON automation_rules(automation_rule_id);

-- Function: Automation Rule Validierungen
CREATE OR REPLACE FUNCTION validate_automation_rule() RETURNS TRIGGER AS $$
BEGIN
    -- Target-spezifische Validierungen
    IF NEW.target = 'meals' AND NEW.meal_type IS NULL THEN
        RAISE EXCEPTION 'Meal-Regeln erfordern meal_type';
    END IF;

    IF NEW.target != 'meals' AND NEW.meal_type IS NOT NULL THEN
        RAISE EXCEPTION 'meal_type nur für Meal-Regeln erlaubt';
    END IF;

    -- Cutoff Validierungen
    IF NEW.cutoff_enabled AND (NEW.cutoff_days_before IS NULL OR NEW.cutoff_time IS NULL) THEN
        RAISE EXCEPTION 'Cutoff erfordert cutoff_days_before und cutoff_time';
    END IF;

    -- Recurrence Validierungen
    IF NEW.recurring AND NEW.recurrence_type = 'none' THEN
        RAISE EXCEPTION 'Wiederkehrende Regeln erfordern recurrence_type != none';
    END IF;

    IF NOT NEW.recurring AND NEW.recurrence_type != 'none' THEN
        NEW.recurrence_type := 'none';
        NEW.recurrence_payload := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Automation Rule Validierung
CREATE TRIGGER validate_automation_rule_trigger
    BEFORE INSERT OR UPDATE ON automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION validate_automation_rule();

-- Function: Update updated_by automatisch
CREATE OR REPLACE FUNCTION update_automation_rule_updated_by() RETURNS TRIGGER AS $$
DECLARE
    current_staff_id UUID;
BEGIN
    -- Versuche current staff aus session context zu holen (vereinfacht)
    -- In der echten Implementation würde das über die Applikation gesetzt werden
    SELECT id INTO current_staff_id
    FROM staff
    WHERE camp_id = NEW.camp_id
    ORDER BY created_at DESC
    LIMIT 1;

    NEW.updated_by := current_staff_id;
    NEW.updated_at := now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_by
CREATE TRIGGER update_automation_rule_updated_by_trigger
    BEFORE UPDATE ON automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_rule_updated_by();

-- Auto-Update Trigger
CREATE TRIGGER update_automation_rules_updated_at
    BEFORE UPDATE ON automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Automation Rules des eigenen Camps
CREATE POLICY automation_rules_camp_isolation ON automation_rules
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Automation Rules
INSERT INTO automation_rules (camp_id, name, target, meal_type, alert_days_before, alert_time, alert_message, cutoff_enabled, cutoff_days_before, cutoff_time, recurring, recurrence_type, recurrence_payload, created_by) VALUES
    -- Meal Alert Rules (Default Setup)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Breakfast Daily Alert',
     'meals',
     'breakfast',
     0, -- Same day
     '19:00', -- 7 PM
     'Frühstück morgen verfügbar! Bitte bis 07:00 Uhr bestellen.',
     true, -- Cutoff enabled
     0, -- Same day
     '07:00', -- 7 AM cutoff
     true, -- Recurring
     'daily',
     '{"frequency": "daily"}',
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Lunch Daily Alert',
     'meals',
     'lunch',
     0, -- Same day
     '10:00', -- 10 AM
     'Mittagessen heute verfügbar! Bitte bis 12:00 Uhr bestellen.',
     true, -- Cutoff enabled
     0, -- Same day
     '12:00', -- 12 PM cutoff
     true, -- Recurring
     'daily',
     '{"frequency": "daily"}',
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Dinner Daily Alert',
     'meals',
     'dinner',
     0, -- Same day
     '15:00', -- 3 PM
     'Abendessen heute verfügbar! Bitte bis 17:00 Uhr bestellen.',
     true, -- Cutoff enabled
     0, -- Same day
     '17:00', -- 5 PM cutoff
     true, -- Recurring
     'daily',
     '{"frequency": "daily"}',
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Surf Lesson Alert Rules
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Surf Lessons Weekly Alert',
     'surf_lessons',
     NULL,
     1, -- 1 day before
     '08:00', -- 8 AM
     'Deine Surf-Stunden diese Woche sind geplant! Schaue in die App für Details.',
     false, -- No cutoff for lessons
     NULL,
     NULL,
     true, -- Recurring
     'weekly',
     '{"days": ["MO", "WE", "FR"], "frequency": "weekly"}',
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Event Alert Rules
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Event Reminder',
     'events',
     NULL,
     0, -- Same day
     '09:00', -- 9 AM
     'Heute finden besondere Events statt! Verpasse sie nicht.',
     false, -- No cutoff for events
     NULL,
     NULL,
     false, -- One-time rule (can be activated per event)
     'none',
     NULL,
     (SELECT id FROM staff WHERE name = 'Max Mustermann')),

    -- Special Event with Season Override
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Weekend Special Events',
     'events',
     NULL,
     1, -- 1 day before
     '18:00', -- 6 PM
     'Morgen ist Wochenende! Besondere Events warten auf dich.',
     false,
     NULL,
     NULL,
     true,
     'weekly',
     '{"days": ["SA", "SO"], "frequency": "weekly"}',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'));