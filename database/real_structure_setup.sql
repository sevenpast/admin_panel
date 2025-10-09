-- ========================================
-- CAMPFLOW 2.0 - REAL STRUCTURE BASED ON ACTUAL OLD DATABASE
-- Matches exactly what is in the user's old database schema
-- ========================================

-- Helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create camps table exactly as in old database
CREATE TABLE IF NOT EXISTS camps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  timezone VARCHAR DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER IF NOT EXISTS update_camps_updated_at BEFORE UPDATE ON camps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo camp if it doesn't exist
INSERT INTO camps (name, timezone, is_active)
SELECT 'Demo Camp', 'Europe/Lisbon', true
WHERE NOT EXISTS (SELECT 1 FROM camps WHERE name = 'Demo Camp');

-- Create staff table exactly as in old database
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id VARCHAR NOT NULL UNIQUE,
  camp_id UUID NOT NULL REFERENCES camps(id),
  name VARCHAR NOT NULL,
  mobile_number VARCHAR,
  labels TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER IF NOT EXISTS update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo staff if they don't exist
INSERT INTO staff (staff_id, camp_id, name, mobile_number, is_active)
SELECT 'STAFF001', (SELECT id FROM camps WHERE name = 'Demo Camp'), 'Max Mustermann', '+49123456789', true
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE staff_id = 'STAFF001');

INSERT INTO staff (staff_id, camp_id, name, mobile_number, is_active)
SELECT 'STAFF002', (SELECT id FROM camps WHERE name = 'Demo Camp'), 'Lisa Schmidt', '+49123456790', true
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE staff_id = 'STAFF002');

INSERT INTO staff (staff_id, camp_id, name, mobile_number, is_active)
SELECT 'STAFF003', (SELECT id FROM camps WHERE name = 'Demo Camp'), 'Tom Weber', '+49123456791', true
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE staff_id = 'STAFF003');

-- Create enum types as in old database
DO $$ BEGIN
    CREATE TYPE surf_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE meal_type_enum AS ENUM ('breakfast', 'lunch', 'dinner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create guests table exactly as in old database
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id VARCHAR NOT NULL UNIQUE,
  camp_id UUID NOT NULL REFERENCES camps(id),
  name VARCHAR NOT NULL,
  mobile_number VARCHAR,
  instagram VARCHAR,
  surf_package BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  surf_level surf_level_enum,
  surf_level_set_by UUID REFERENCES staff(id),
  surf_level_set_at TIMESTAMPTZ,
  allergies JSONB DEFAULT '{}',
  other_allergies TEXT,
  qr_code_payload JSONB,
  qr_code_generated_at TIMESTAMPTZ,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER IF NOT EXISTS update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo guests if they don't exist
INSERT INTO guests (guest_id, camp_id, name, mobile_number, surf_package, is_active, surf_level)
SELECT 'GUEST001', (SELECT id FROM camps WHERE name = 'Demo Camp'), 'John Doe', '+49123456792', true, true, 'beginner'
WHERE NOT EXISTS (SELECT 1 FROM guests WHERE guest_id = 'GUEST001');

INSERT INTO guests (guest_id, camp_id, name, mobile_number, surf_package, is_active, surf_level)
SELECT 'GUEST002', (SELECT id FROM camps WHERE name = 'Demo Camp'), 'Jane Smith', '+49123456793', true, true, 'intermediate'
WHERE NOT EXISTS (SELECT 1 FROM guests WHERE guest_id = 'GUEST002');

INSERT INTO guests (guest_id, camp_id, name, mobile_number, surf_package, is_active, surf_level)
SELECT 'GUEST003', (SELECT id FROM camps WHERE name = 'Demo Camp'), 'Mike Johnson', '+49123456794', false, true, 'beginner'
WHERE NOT EXISTS (SELECT 1 FROM guests WHERE guest_id = 'GUEST003');

-- Drop existing meals table if wrong structure
DROP TABLE IF EXISTS meals CASCADE;

-- Create meals table exactly as in old database (meal_plans structure)
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id VARCHAR NOT NULL UNIQUE,
  camp_id UUID NOT NULL REFERENCES camps(id),
  name VARCHAR NOT NULL,
  meal_type meal_type_enum NOT NULL,
  meal_date DATE NOT NULL,
  description TEXT,
  ingredients TEXT[],
  dietary_restrictions TEXT[],
  planned_portions INTEGER DEFAULT 0,
  actual_portions INTEGER DEFAULT 0,
  estimated_cost_per_portion DECIMAL(10,2),
  actual_cost_per_portion DECIMAL(10,2),
  prep_time_minutes INTEGER,
  cooking_time_minutes INTEGER,
  kitchen_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo meals based on old structure
INSERT INTO meals (meal_id, camp_id, name, meal_type, meal_date, description, ingredients, planned_portions, prep_time_minutes, cooking_time_minutes, kitchen_notes, is_active, is_confirmed) VALUES
('MEAL001',
 (SELECT id FROM camps WHERE name = 'Demo Camp'),
 'Pancakes with Berries', 'breakfast', CURRENT_DATE,
 'Fluffy pancakes served with fresh mixed berries and maple syrup',
 ARRAY['flour', 'milk', 'eggs', 'sugar', 'baking powder', 'mixed berries', 'maple syrup'],
 20, 15, 20, 'Keep batter smooth, don''t overmix', true, false),

('MEAL002',
 (SELECT id FROM camps WHERE name = 'Demo Camp'),
 'Grilled Chicken Caesar Salad', 'lunch', CURRENT_DATE,
 'Classic Caesar salad with grilled chicken breast and homemade croutons',
 ARRAY['chicken breast', 'romaine lettuce', 'parmesan', 'caesar dressing', 'croutons', 'lemon'],
 25, 20, 15, 'Grill chicken to 165°F internal temperature', true, false),

('MEAL003',
 (SELECT id FROM camps WHERE name = 'Demo Camp'),
 'Pasta Bolognese', 'dinner', CURRENT_DATE,
 'Traditional Italian Bolognese with ground beef and fresh herbs',
 ARRAY['ground beef', 'pasta', 'tomatoes', 'onion', 'garlic', 'basil', 'oregano', 'parmesan'],
 30, 30, 45, 'Simmer sauce for minimum 45 minutes', true, false);

-- Success message
SELECT 'Real Database Structure Setup Completed!' as status;