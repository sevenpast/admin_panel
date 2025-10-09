-- ========================================
-- MEAL_ASSIGNMENTS - Guest-Meal Zuweisungen mit Allergien-Check
-- ========================================

CREATE TABLE meal_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,

    -- Assignment Status
    is_confirmed BOOLEAN DEFAULT false, -- Guest hat bestätigt
    is_served BOOLEAN DEFAULT false, -- Meal wurde serviert
    portion_count INTEGER DEFAULT 1, -- Anzahl Portionen für diesen Guest

    -- Allergien & Dietary Restrictions Check
    has_allergy_conflict BOOLEAN DEFAULT false, -- Automatisch berechnet
    allergy_notes TEXT, -- "Guest allergic to nuts - alternative needed"

    -- Special Requests
    special_requests TEXT, -- "Extra spicy", "No onions", etc.

    -- Tracking
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES staff(id),
    confirmed_at TIMESTAMPTZ, -- Wann Guest bestätigt hat
    served_at TIMESTAMPTZ, -- Wann serviert wurde

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Ein Guest kann nicht mehrfach für dieselbe Meal zugewiesen werden
    UNIQUE(meal_plan_id, guest_id)
);

-- Performance Indizes
CREATE INDEX idx_meal_assignments_camp_id ON meal_assignments(camp_id);
CREATE INDEX idx_meal_assignments_meal_plan_id ON meal_assignments(meal_plan_id);
CREATE INDEX idx_meal_assignments_guest_id ON meal_assignments(guest_id);
CREATE INDEX idx_meal_assignments_confirmed ON meal_assignments(meal_plan_id, is_confirmed) WHERE is_confirmed = true;
CREATE INDEX idx_meal_assignments_served ON meal_assignments(meal_plan_id, is_served) WHERE is_served = true;
CREATE INDEX idx_meal_assignments_allergy_conflict ON meal_assignments(camp_id, has_allergy_conflict) WHERE has_allergy_conflict = true;

-- Function: Allergien-Konflikt Check
CREATE OR REPLACE FUNCTION check_allergy_conflict() RETURNS TRIGGER AS $$
DECLARE
    guest_allergies JSONB;
    meal_ingredients TEXT[];
    ingredient TEXT;
    allergy_key TEXT;
    allergy_value TEXT;
    conflict_found BOOLEAN := false;
    conflict_notes TEXT := '';
BEGIN
    -- Guest-Allergien holen
    SELECT allergies INTO guest_allergies
    FROM guests
    WHERE id = NEW.guest_id;

    -- Meal-Ingredients holen
    SELECT ingredients INTO meal_ingredients
    FROM meal_plans
    WHERE id = NEW.meal_plan_id;

    -- Wenn Guest keine Allergien oder Meal keine Ingredients hat, kein Konflikt
    IF guest_allergies IS NULL OR jsonb_typeof(guest_allergies) = 'null' OR meal_ingredients IS NULL THEN
        NEW.has_allergy_conflict := false;
        NEW.allergy_notes := NULL;
        RETURN NEW;
    END IF;

    -- Durch alle Guest-Allergien iterieren
    FOR allergy_key, allergy_value IN SELECT * FROM jsonb_each_text(guest_allergies)
    LOOP
        -- Nur aktive Allergien prüfen (true Werte)
        IF allergy_value::BOOLEAN = true THEN
            -- Durch alle Meal-Ingredients iterieren
            FOREACH ingredient IN ARRAY meal_ingredients
            LOOP
                -- Einfacher Substring-Check (case insensitive)
                IF LOWER(ingredient) LIKE '%' || LOWER(allergy_key) || '%' THEN
                    conflict_found := true;
                    IF conflict_notes != '' THEN
                        conflict_notes := conflict_notes || '; ';
                    END IF;
                    conflict_notes := conflict_notes || 'Conflict: ' || allergy_key || ' in ' || ingredient;
                END IF;
            END LOOP;
        END IF;
    END LOOP;

    -- Ergebnis setzen
    NEW.has_allergy_conflict := conflict_found;
    NEW.allergy_notes := CASE WHEN conflict_found THEN conflict_notes ELSE NULL END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Meal Assignment Validierungen
CREATE OR REPLACE FUNCTION validate_meal_assignment() RETURNS TRIGGER AS $$
DECLARE
    guest_record RECORD;
    meal_record RECORD;
BEGIN
    -- Guest-Daten holen
    SELECT is_active INTO guest_record
    FROM guests
    WHERE id = NEW.guest_id;

    -- Meal-Daten holen
    SELECT is_active, meal_date INTO meal_record
    FROM meal_plans
    WHERE id = NEW.meal_plan_id;

    -- Validierungen
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guest or meal plan not found';
    END IF;

    IF NOT guest_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign meal to inactive guest';
    END IF;

    IF NOT meal_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign inactive meal plan';
    END IF;

    -- Portion Count muss >= 1 sein
    IF NEW.portion_count < 1 THEN
        RAISE EXCEPTION 'Portion count must be at least 1';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Allergien-Check bei Assignment
CREATE TRIGGER check_allergy_conflict_trigger
    BEFORE INSERT OR UPDATE ON meal_assignments
    FOR EACH ROW
    EXECUTE FUNCTION check_allergy_conflict();

-- Trigger: Meal Assignment Validierung
CREATE TRIGGER validate_meal_assignment_trigger
    BEFORE INSERT OR UPDATE ON meal_assignments
    FOR EACH ROW
    EXECUTE FUNCTION validate_meal_assignment();

-- Function: Update confirmed_at und served_at automatisch
CREATE OR REPLACE FUNCTION update_meal_assignment_timestamps() RETURNS TRIGGER AS $$
BEGIN
    -- confirmed_at aktualisieren wenn is_confirmed sich ändert
    IF OLD.is_confirmed IS DISTINCT FROM NEW.is_confirmed AND NEW.is_confirmed = true THEN
        NEW.confirmed_at := now();
    END IF;

    -- served_at aktualisieren wenn is_served sich ändert
    IF OLD.is_served IS DISTINCT FROM NEW.is_served AND NEW.is_served = true THEN
        NEW.served_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meal_assignment_timestamps_trigger
    BEFORE UPDATE ON meal_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_meal_assignment_timestamps();

-- Function: Update meal_plans.actual_portions Counter
CREATE OR REPLACE FUNCTION update_meal_portions_counter() RETURNS TRIGGER AS $$
DECLARE
    total_portions INTEGER;
    meal_uuid UUID;
BEGIN
    -- Bestimme betroffene meal_plan
    IF TG_OP = 'DELETE' THEN
        meal_uuid := OLD.meal_plan_id;
    ELSE
        meal_uuid := NEW.meal_plan_id;
    END IF;

    -- Berechne Gesamt-Portionen für diese Meal
    SELECT COALESCE(SUM(portion_count), 0) INTO total_portions
    FROM meal_assignments
    WHERE meal_plan_id = meal_uuid AND is_served = true;

    -- Update meal_plans.actual_portions
    UPDATE meal_plans
    SET actual_portions = total_portions,
        updated_at = now()
    WHERE id = meal_uuid;

    -- Bei OLD meal_plan_id auch updaten (für Meal-Wechsel)
    IF TG_OP = 'UPDATE' AND OLD.meal_plan_id != NEW.meal_plan_id THEN
        SELECT COALESCE(SUM(portion_count), 0) INTO total_portions
        FROM meal_assignments
        WHERE meal_plan_id = OLD.meal_plan_id AND is_served = true;

        UPDATE meal_plans
        SET actual_portions = total_portions,
            updated_at = now()
        WHERE id = OLD.meal_plan_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Meal Portions Counter bei Assignment-Änderungen updaten
CREATE TRIGGER update_meal_portions_counter_trigger
    AFTER INSERT OR UPDATE OR DELETE ON meal_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_meal_portions_counter();

-- Auto-Update Trigger
CREATE TRIGGER update_meal_assignments_updated_at
    BEFORE UPDATE ON meal_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE meal_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Meal Assignments des eigenen Camps
CREATE POLICY meal_assignments_camp_isolation ON meal_assignments
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Meal Assignments
INSERT INTO meal_assignments (camp_id, meal_plan_id, guest_id, assigned_by, is_confirmed, special_requests) VALUES
    -- John Doe → Pancakes (no allergies)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Pancakes with Berries'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     true,
     'Extra maple syrup'),

    -- Maria Garcia → Vegan Overnight Oats (nut allergy conflict possible)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Vegan Overnight Oats'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     true,
     NULL),

    -- Sarah Connor → Grilled Chicken Caesar (lactose intolerance conflict with parmesan)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Grilled Chicken Caesar Salad'),
     (SELECT id FROM guests WHERE name = 'Sarah Connor'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     false,
     'No croutons please'),

    -- John Doe → Pasta Bolognese
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Pasta Bolognese'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     true,
     NULL),

    -- Maria Garcia → Fresh Fruit Platter (safe choice)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Fresh Fruit Platter'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     true,
     'Extra berries if available');