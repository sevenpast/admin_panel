-- ========================================
-- MEAL_PLANS - Mahlzeitenplanung mit M-XXXXXXXXXX IDs
-- ========================================

-- ID-Generierung für M-XXXXXXXXXX
CREATE OR REPLACE FUNCTION generate_meal_plan_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    collision_count INT := 0;
BEGIN
    LOOP
        -- M- + 10 zufällige Zeichen (A-Z, 0-9)
        new_id := 'M-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        -- Kollisionsprüfung
        IF NOT EXISTS (SELECT 1 FROM meal_plans WHERE meal_plan_id = new_id) THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for meal_plan_id generation';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ENUMs für Meals
CREATE TYPE meal_type_enum AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE dietary_restriction_enum AS ENUM ('vegetarian', 'vegan', 'gluten_free', 'lactose_free', 'nut_free', 'halal', 'kosher');

CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id VARCHAR(12) UNIQUE NOT NULL DEFAULT generate_meal_plan_id(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

    -- Basic Meal Info
    name VARCHAR(255) NOT NULL, -- "Pasta Bolognese", "Vegan Buddha Bowl"
    meal_type meal_type_enum NOT NULL,
    meal_date DATE NOT NULL,

    -- Meal Details
    description TEXT,
    ingredients TEXT[], -- Array of ingredients
    dietary_restrictions dietary_restriction_enum[], -- Array of restrictions this meal covers

    -- Portions & Planning
    planned_portions INTEGER DEFAULT 0, -- Geplante Anzahl Portionen
    actual_portions INTEGER DEFAULT 0, -- Tatsächlich servierte Portionen

    -- Costs (optional)
    estimated_cost_per_portion DECIMAL(10,2),
    actual_cost_per_portion DECIMAL(10,2),

    -- Kitchen Info
    prep_time_minutes INTEGER, -- Vorbereitungszeit
    cooking_time_minutes INTEGER, -- Kochzeit
    kitchen_notes TEXT, -- "Needs to marinate 2h", "Serve immediately"

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_confirmed BOOLEAN DEFAULT false, -- Bestätigt für Küche

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_meal_plans_camp_id ON meal_plans(camp_id);
CREATE INDEX idx_meal_plans_date ON meal_plans(camp_id, meal_date);
CREATE INDEX idx_meal_plans_type ON meal_plans(camp_id, meal_type);
CREATE INDEX idx_meal_plans_active ON meal_plans(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_meal_plans_confirmed ON meal_plans(camp_id, meal_date, is_confirmed) WHERE is_confirmed = true;
CREATE INDEX idx_meal_plans_dietary ON meal_plans USING GIN (dietary_restrictions);
CREATE UNIQUE INDEX idx_meal_plan_id ON meal_plans(meal_plan_id);

-- Auto-Update Trigger
CREATE TRIGGER update_meal_plans_updated_at
    BEFORE UPDATE ON meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Meal Plans des eigenen Camps
CREATE POLICY meal_plans_camp_isolation ON meal_plans
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Meal Plans
INSERT INTO meal_plans (camp_id, name, meal_type, meal_date, description, ingredients, dietary_restrictions, planned_portions, prep_time_minutes, cooking_time_minutes, kitchen_notes) VALUES
    -- Breakfast
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Pancakes with Berries',
     'breakfast',
     CURRENT_DATE,
     'Fluffy pancakes served with fresh mixed berries and maple syrup',
     ARRAY['flour', 'milk', 'eggs', 'sugar', 'baking powder', 'mixed berries', 'maple syrup'],
     ARRAY['vegetarian']::dietary_restriction_enum[],
     20,
     15,
     20,
     'Keep batter smooth, don''t overmix'),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Vegan Overnight Oats',
     'breakfast',
     CURRENT_DATE,
     'Creamy overnight oats with almond milk, chia seeds and fresh fruit',
     ARRAY['oats', 'almond milk', 'chia seeds', 'banana', 'berries', 'honey alternative'],
     ARRAY['vegan', 'gluten_free']::dietary_restriction_enum[],
     8,
     10,
     0,
     'Prepare night before, serve chilled'),

    -- Lunch
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Grilled Chicken Caesar Salad',
     'lunch',
     CURRENT_DATE,
     'Classic Caesar salad with grilled chicken breast and homemade croutons',
     ARRAY['chicken breast', 'romaine lettuce', 'parmesan', 'caesar dressing', 'croutons', 'lemon'],
     ARRAY[]::dietary_restriction_enum[],
     25,
     20,
     15,
     'Grill chicken to 165°F internal temperature'),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Mediterranean Quinoa Bowl',
     'lunch',
     CURRENT_DATE + 1,
     'Nutritious quinoa bowl with roasted vegetables, hummus and tahini dressing',
     ARRAY['quinoa', 'cucumber', 'tomatoes', 'red onion', 'chickpeas', 'hummus', 'tahini', 'olive oil'],
     ARRAY['vegetarian', 'gluten_free']::dietary_restriction_enum[],
     20,
     25,
     30,
     'Roast vegetables until slightly caramelized'),

    -- Dinner
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Pasta Bolognese',
     'dinner',
     CURRENT_DATE,
     'Traditional Italian Bolognese with ground beef and fresh herbs',
     ARRAY['ground beef', 'pasta', 'tomatoes', 'onion', 'garlic', 'basil', 'oregano', 'parmesan'],
     ARRAY[]::dietary_restriction_enum[],
     30,
     30,
     45,
     'Simmer sauce for minimum 45 minutes'),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Teriyaki Salmon with Rice',
     'dinner',
     CURRENT_DATE + 1,
     'Pan-seared salmon with teriyaki glaze served with jasmine rice and steamed vegetables',
     ARRAY['salmon fillet', 'teriyaki sauce', 'jasmine rice', 'broccoli', 'carrots', 'soy sauce', 'ginger'],
     ARRAY['gluten_free']::dietary_restriction_enum[],
     22,
     20,
     25,
     'Don''t overcook salmon - should flake easily'),

    -- Snacks
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'Fresh Fruit Platter',
     'snack',
     CURRENT_DATE,
     'Assorted seasonal fresh fruits',
     ARRAY['watermelon', 'pineapple', 'grapes', 'berries', 'orange'],
     ARRAY['vegan', 'gluten_free']::dietary_restriction_enum[],
     40,
     20,
     0,
     'Cut fresh before serving, keep refrigerated');