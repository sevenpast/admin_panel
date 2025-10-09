-- ========================================
-- MEAL_ORDERS - Guest Meal Bestellungen mit T-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für T-XXXXXXXXXX (T = orTer/besTellung)
CREATE OR REPLACE FUNCTION generate_meal_order_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- T- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'T-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM meal_orders WHERE meal_order_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for meal_order_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUMs für Order Management
CREATE TYPE meal_order_status_enum AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');

CREATE TABLE meal_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_order_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_meal_order_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

    -- References
    meal_option_id UUID NOT NULL REFERENCES meal_options(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,

    -- Order Details
    portion_count INTEGER DEFAULT 1 CHECK (portion_count > 0),
    special_requests TEXT, -- "No onions", "Extra spicy", "Allergy: nuts"

    -- Status & Tracking
    status meal_order_status_enum DEFAULT 'pending',

    -- Pricing
    price_per_portion DECIMAL(10,2), -- Snapshot vom Bestellzeitpunkt
    total_price DECIMAL(10,2), -- portion_count * price_per_portion

    -- Allergy & Dietary Checks
    has_dietary_conflict BOOLEAN DEFAULT false, -- Auto-calculated
    dietary_notes TEXT, -- "Guest has nut allergy - option contains nuts"

    -- Timestamps
    ordered_at TIMESTAMPTZ DEFAULT now(),
    confirmed_at TIMESTAMPTZ, -- Staff bestätigt
    preparation_started_at TIMESTAMPTZ, -- Küche beginnt
    ready_at TIMESTAMPTZ, -- Fertig zum Servieren
    served_at TIMESTAMPTZ, -- Dem Guest serviert
    cancelled_at TIMESTAMPTZ, -- Storniert

    -- Staff Tracking
    confirmed_by UUID REFERENCES staff(id), -- Wer bestätigt hat
    prepared_by UUID REFERENCES staff(id), -- Kitchen Staff
    served_by UUID REFERENCES staff(id), -- Service Staff
    cancelled_by UUID REFERENCES staff(id), -- Wer storniert hat
    cancellation_reason TEXT, -- "Guest cancelled", "Kitchen issue", etc.

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Business Rules
    CONSTRAINT meal_orders_price_check CHECK (price_per_portion >= 0),
    CONSTRAINT meal_orders_total_check CHECK (total_price >= 0)
);

-- Performance Indizes
CREATE INDEX idx_meal_orders_camp_id ON meal_orders(camp_id);
CREATE INDEX idx_meal_orders_meal_option_id ON meal_orders(meal_option_id);
CREATE INDEX idx_meal_orders_guest_id ON meal_orders(guest_id);
CREATE INDEX idx_meal_orders_status ON meal_orders(camp_id, status);
CREATE INDEX idx_meal_orders_ordered_date ON meal_orders(camp_id, DATE(ordered_at AT TIME ZONE 'UTC'));
CREATE INDEX idx_meal_orders_active ON meal_orders(meal_option_id, status) WHERE status NOT IN ('cancelled', 'served');
CREATE INDEX idx_meal_orders_dietary_conflict ON meal_orders(camp_id, has_dietary_conflict) WHERE has_dietary_conflict = true;
CREATE UNIQUE INDEX idx_meal_order_id ON meal_orders(meal_order_id);

-- Function: Automatically calculate prices and conflicts
CREATE OR REPLACE FUNCTION validate_meal_order() RETURNS TRIGGER AS $$
DECLARE
    option_record RECORD;
    guest_allergies JSONB;
    option_allergens JSONB;
    conflict_found BOOLEAN := false;
    conflict_notes TEXT := '';
    allergy_key TEXT;
    allergy_value TEXT;
BEGIN
    -- Meal Option Details holen
    SELECT mo.*, mp.meal_date, mp.name as meal_name
    INTO option_record
    FROM meal_options mo
    JOIN meal_plans mp ON mo.meal_plan_id = mp.id
    WHERE mo.id = NEW.meal_option_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Meal option not found';
    END IF;

    -- Price berechnen (Snapshot)
    NEW.price_per_portion := option_record.price_per_portion;
    NEW.total_price := NEW.portion_count * COALESCE(NEW.price_per_portion, 0);

    -- Availability Check
    IF NOT option_record.is_available THEN
        RAISE EXCEPTION 'Meal option is not available';
    END IF;

    -- Portion Limit Check
    IF option_record.max_portions IS NOT NULL THEN
        DECLARE current_orders INTEGER;
        BEGIN
            SELECT COALESCE(SUM(portion_count), 0) INTO current_orders
            FROM meal_orders
            WHERE meal_option_id = NEW.meal_option_id
                AND status NOT IN ('cancelled')
                AND id != COALESCE(NEW.id, gen_random_uuid());

            IF (current_orders + NEW.portion_count) > option_record.max_portions THEN
                RAISE EXCEPTION 'Not enough portions available. Max: %, Currently ordered: %, Requested: %',
                    option_record.max_portions, current_orders, NEW.portion_count;
            END IF;
        END;
    END IF;

    -- Deadline Check
    IF option_record.order_deadline IS NOT NULL AND now() > option_record.order_deadline THEN
        RAISE EXCEPTION 'Order deadline passed for this meal option';
    END IF;

    -- Dietary Conflict Check
    SELECT allergies INTO guest_allergies
    FROM guests
    WHERE id = NEW.guest_id;

    -- Option Allergen Info holen
    option_allergens := option_record.allergen_info;

    IF guest_allergies IS NOT NULL AND option_allergens IS NOT NULL THEN
        -- Durch Guest Allergien iterieren
        FOR allergy_key, allergy_value IN SELECT * FROM jsonb_each_text(guest_allergies)
        LOOP
            IF allergy_value::BOOLEAN = true THEN
                -- Check entsprechende Allergen in Option
                CASE allergy_key
                    WHEN 'nuts' THEN
                        IF (option_allergens->>'contains_nuts')::BOOLEAN = true THEN
                            conflict_found := true;
                            conflict_notes := conflict_notes || 'Guest has nut allergy but option contains nuts. ';
                        END IF;
                    WHEN 'gluten' THEN
                        IF (option_allergens->>'contains_gluten')::BOOLEAN = true THEN
                            conflict_found := true;
                            conflict_notes := conflict_notes || 'Guest has gluten allergy but option contains gluten. ';
                        END IF;
                    WHEN 'dairy' THEN
                        IF (option_allergens->>'contains_dairy')::BOOLEAN = true THEN
                            conflict_found := true;
                            conflict_notes := conflict_notes || 'Guest has dairy allergy but option contains dairy. ';
                        END IF;
                END CASE;
            END IF;
        END LOOP;
    END IF;

    NEW.has_dietary_conflict := conflict_found;
    NEW.dietary_notes := NULLIF(TRIM(conflict_notes), '');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Meal Order Validation
CREATE TRIGGER validate_meal_order_trigger
    BEFORE INSERT OR UPDATE ON meal_orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_meal_order();

-- Function: Update Status Timestamps
CREATE OR REPLACE FUNCTION update_meal_order_timestamps() RETURNS TRIGGER AS $$
BEGIN
    -- confirmed_at setzen
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
        NEW.confirmed_at := now();
    END IF;

    -- preparation_started_at setzen
    IF OLD.status != 'preparing' AND NEW.status = 'preparing' AND NEW.preparation_started_at IS NULL THEN
        NEW.preparation_started_at := now();
    END IF;

    -- ready_at setzen
    IF OLD.status != 'ready' AND NEW.status = 'ready' AND NEW.ready_at IS NULL THEN
        NEW.ready_at := now();
    END IF;

    -- served_at setzen
    IF OLD.status != 'served' AND NEW.status = 'served' AND NEW.served_at IS NULL THEN
        NEW.served_at := now();
    END IF;

    -- cancelled_at setzen
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
        NEW.cancelled_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Order Timestamp Management
CREATE TRIGGER update_meal_order_timestamps_trigger
    BEFORE UPDATE ON meal_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_meal_order_timestamps();

-- Trigger: Update Meal Options Counter
CREATE TRIGGER update_meal_option_orders_counter_trigger
    AFTER INSERT OR UPDATE OR DELETE ON meal_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_meal_option_orders_counter();

-- Auto-Update Trigger
CREATE TRIGGER update_meal_orders_updated_at
    BEFORE UPDATE ON meal_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE meal_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Orders des eigenen Camps
CREATE POLICY meal_orders_camp_isolation ON meal_orders
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Meal Orders (disable deadline validation for demo data)
-- Temporarily disable the trigger to insert demo orders
ALTER TABLE meal_orders DISABLE TRIGGER validate_meal_order_trigger;

INSERT INTO meal_orders (camp_id, meal_option_id, guest_id, portion_count, special_requests, status, confirmed_by, served_by, ordered_at) VALUES
    -- Confirmed Orders
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_options WHERE name = 'Standard Pancakes with Berries' LIMIT 1),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     1,
     'Light maple syrup please',
     'served',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     CURRENT_DATE + TIME '06:00'),

    -- Pending Orders
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_options WHERE name = 'Mediterranean Quinoa Bowl' LIMIT 1),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     1,
     'Extra hummus',
     'pending',
     NULL,
     NULL,
     CURRENT_DATE + TIME '11:00'),

    -- Preparing Orders
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_options WHERE name = 'Classic Pasta Bolognese' LIMIT 1),
     (SELECT id FROM guests WHERE name = 'Sarah Connor'),
     2,
     'One portion extra spicy',
     'preparing',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     NULL,
     CURRENT_DATE + TIME '16:00'),

    -- Ready to Serve
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_options WHERE name = 'Teriyaki Salmon with Rice' LIMIT 1),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     1,
     NULL,
     'ready',
     (SELECT id FROM staff WHERE name = 'Max Mustermann'),
     NULL,
     CURRENT_DATE + TIME '16:30');

-- Re-enable the trigger after inserting demo data
ALTER TABLE meal_orders ENABLE TRIGGER validate_meal_order_trigger;