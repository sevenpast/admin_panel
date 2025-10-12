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

-- No demo data - use real camp data

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

-- No demo staff data - use real staff data

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

-- No demo guest data - use real guest data

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

-- No demo meal data - use real meal data

-- Success message
SELECT 'Real Database Structure Setup Completed!' as status;