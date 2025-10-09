-- ========================================
-- MEAL_OPTIONS - Verfügbare Meal Optionen für Guests mit O-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für O-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_meal_option_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- O- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'O-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM meal_options WHERE meal_option_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for meal_option_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE meal_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_option_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_meal_option_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,

    -- Option Details
    name VARCHAR(255) NOT NULL, -- "Standard", "Vegan Alternative", "Gluten-Free Version"
    description TEXT, -- "Our classic pasta dish with meat sauce"

    -- Availability & Limits
    max_portions INTEGER, -- NULL = unlimited
    current_orders INTEGER DEFAULT 0, -- Live counter
    is_available BOOLEAN DEFAULT true,

    -- Pricing (optional)
    price_per_portion DECIMAL(10,2) DEFAULT 0.00,

    -- Dietary Info
    dietary_tags dietary_restriction_enum[], -- inherited from meal_plans + specific overrides
    allergen_info JSONB, -- {"contains_nuts": true, "gluten_free": false}

    -- Kitchen Prep Info
    prep_notes TEXT, -- "Prepare separately to avoid cross-contamination"

    -- Order Window
    order_deadline TIMESTAMPTZ, -- Bestellfrist für diese Option

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_meal_options_camp_id ON meal_options(camp_id);
CREATE INDEX idx_meal_options_meal_plan_id ON meal_options(meal_plan_id);
CREATE INDEX idx_meal_options_available ON meal_options(meal_plan_id, is_available) WHERE is_available = true;
CREATE INDEX idx_meal_options_deadline ON meal_options(camp_id, order_deadline) WHERE order_deadline IS NOT NULL;
CREATE INDEX idx_meal_options_dietary ON meal_options USING GIN (dietary_tags);
CREATE UNIQUE INDEX idx_meal_option_id ON meal_options(meal_option_id);

-- Function: Update current_orders counter
CREATE OR REPLACE FUNCTION update_meal_option_orders_counter() RETURNS TRIGGER AS $$
DECLARE
    option_id UUID;
    new_count INTEGER;
BEGIN
    -- Bestimme welche meal_option_id betroffen ist
    option_id := COALESCE(NEW.meal_option_id, OLD.meal_option_id);

    -- Zähle aktuelle Bestellungen für diese Option
    SELECT COUNT(*) INTO new_count
    FROM meal_orders mo
    WHERE mo.meal_option_id = option_id
        AND mo.status != 'cancelled';

    -- Update counter
    UPDATE meal_options
    SET current_orders = new_count,
        updated_at = now()
    WHERE id = option_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Auto-Update Trigger
CREATE TRIGGER update_meal_options_updated_at
    BEFORE UPDATE ON meal_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE meal_options ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Meal Options des eigenen Camps
CREATE POLICY meal_options_camp_isolation ON meal_options
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Meal Options für bestehende Meal Plans
INSERT INTO meal_options (camp_id, meal_plan_id, name, description, max_portions, price_per_portion, dietary_tags, allergen_info, order_deadline) VALUES
    -- Breakfast Options - Pancakes with Berries
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Pancakes with Berries' LIMIT 1),
     'Standard Pancakes with Berries',
     'Fluffy pancakes served with fresh mixed berries and maple syrup',
     20,
     8.50,
     '{"vegetarian"}',
     '{"contains_gluten": true, "contains_dairy": true}',
     CURRENT_DATE + INTERVAL '1 day' + TIME '07:00'),

    -- Vegan Breakfast Option
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Vegan Overnight Oats' LIMIT 1),
     'Vegan Overnight Oats',
     'Creamy overnight oats with almond milk, chia seeds and fresh fruit',
     8,
     7.50,
     '{"vegan", "gluten_free"}',
     '{"contains_gluten": false, "contains_dairy": false, "vegan": true}',
     CURRENT_DATE + INTERVAL '1 day' + TIME '07:00'),

    -- Lunch Options - Caesar Salad
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Grilled Chicken Caesar Salad' LIMIT 1),
     'Classic Caesar Salad with Chicken',
     'Fresh Caesar salad with grilled chicken breast and homemade croutons',
     25,
     12.00,
     '{}',
     '{"contains_dairy": true, "contains_gluten": true}',
     CURRENT_DATE + INTERVAL '1 day' + TIME '12:00'),

    -- Vegetarian Lunch Option
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Mediterranean Quinoa Bowl' LIMIT 1),
     'Mediterranean Quinoa Bowl',
     'Nutritious quinoa bowl with roasted vegetables, hummus and tahini dressing',
     20,
     11.00,
     '{"vegetarian", "gluten_free"}',
     '{"contains_dairy": false, "vegan": false}',
     CURRENT_DATE + INTERVAL '1 day' + TIME '12:00'),

    -- Dinner Options - Pasta
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Pasta Bolognese' LIMIT 1),
     'Classic Pasta Bolognese',
     'Traditional Italian Bolognese with ground beef and fresh herbs',
     30,
     14.50,
     '{}',
     '{"contains_gluten": true, "contains_dairy": true}',
     CURRENT_DATE + TIME '17:00'),

    -- Salmon Dinner Option
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM meal_plans WHERE name = 'Teriyaki Salmon with Rice' LIMIT 1),
     'Teriyaki Salmon with Rice',
     'Pan-seared salmon with teriyaki glaze served with jasmine rice',
     22,
     16.50,
     '{"gluten_free"}',
     '{"contains_gluten": false, "contains_dairy": false}',
     CURRENT_DATE + INTERVAL '1 day' + TIME '17:00');