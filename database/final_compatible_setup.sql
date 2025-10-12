-- ========================================
-- CAMPFLOW 2.0 - FINAL COMPATIBLE SETUP
-- Matches the exact current admin panel code
-- ========================================

-- Create types
DO $$ BEGIN
    CREATE TYPE guest_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE staff_role AS ENUM ('admin', 'manager', 'instructor', 'receptionist', 'kitchen_staff', 'maintenance', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create camps table if it doesn't exist
CREATE TABLE IF NOT EXISTS camps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(300),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'USD',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- No demo data - use real camp data

-- Create staff table matching current admin panel expectations
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id VARCHAR(20) NOT NULL REFERENCES camps(camp_id),
  staff_id VARCHAR(20) UNIQUE NOT NULL,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'other',
  department VARCHAR(100),
  hire_date DATE,
  hourly_rate DECIMAL(10,2),
  skills TEXT[],
  certifications TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(camp_id, staff_id)
);

-- No demo staff data - use real staff data

-- Create guests table matching current admin panel expectations
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id VARCHAR(20) NOT NULL REFERENCES camps(camp_id),
  guest_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(50),
  passport_number VARCHAR(50),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  allergies TEXT,
  dietary_restrictions TEXT,
  check_in_date DATE,
  check_out_date DATE,
  room_number VARCHAR(20),
  status VARCHAR(20) DEFAULT 'reserved',
  surf_package BOOLEAN DEFAULT true,
  surf_level VARCHAR(20) DEFAULT 'beginner',
  notes TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(camp_id, guest_id)
);

-- No demo guest data - use real guest data

-- Drop existing meal tables if wrong structure
DROP TABLE IF EXISTS meals CASCADE;

-- Create meals table matching EXACTLY the current admin panel interface
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID,
  recurrence_rule_id UUID,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  meal_type VARCHAR(20) NOT NULL,
  scheduled_date DATE NOT NULL,  -- Matches interface line 48
  serving_date DATE NOT NULL,    -- Needed for dashboard stats line 513
  start_time TIME NOT NULL,
  end_time TIME,
  image_path VARCHAR(500),
  dietary_option VARCHAR(20) DEFAULT 'other',
  ingredients TEXT[],
  allergens TEXT[],
  calories_per_portion INTEGER,
  status VARCHAR(20) DEFAULT 'published',
  preparation_time INTEGER,
  kitchen_notes TEXT,
  created_by VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert demo meals with both scheduled_date and serving_date
INSERT INTO meals (name, description, meal_type, scheduled_date, serving_date, start_time, end_time, dietary_option, status) VALUES
('Morning Breakfast', 'Standard breakfast options', 'breakfast', '2024-12-15', '2024-12-15', '07:30', '09:30', 'vegetarian', 'published'),
('Lunch Special', 'Fresh lunch options', 'lunch', '2024-12-15', '2024-12-15', '12:00', '14:00', 'meat', 'published'),
('Evening Dinner', 'Hearty dinner options', 'dinner', '2024-12-15', '2024-12-15', '18:30', '20:30', 'meat', 'published'),
('Continental Breakfast', 'Light breakfast with pastries', 'breakfast', '2024-12-16', '2024-12-16', '07:30', '09:30', 'vegetarian', 'published'),
('Mediterranean Lunch', 'Fresh Mediterranean cuisine', 'lunch', '2024-12-16', '2024-12-16', '12:00', '14:00', 'vegetarian', 'published'),
('Vegan Dinner', 'Plant-based dinner options', 'dinner', '2024-12-16', '2024-12-16', '18:30', '20:30', 'vegan', 'published');

-- Create recurrence_rules table for templates
CREATE TABLE IF NOT EXISTS recurrence_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id VARCHAR(20) NOT NULL REFERENCES camps(camp_id),
  rule_name VARCHAR(100) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  interval_value INTEGER DEFAULT 1,
  days_of_week INTEGER[],
  days_of_month INTEGER[],
  months INTEGER[],
  until_date DATE,
  occurrence_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(camp_id, rule_name)
);

-- Create other required tables for admin panel
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID,
  recurrence_rule_id UUID,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location VARCHAR(200),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'published',
  equipment_needed TEXT[],
  special_requirements TEXT,
  weather_dependent BOOLEAN DEFAULT false,
  created_by VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS surf_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID,
  recurrence_rule_id UUID,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructor_ids TEXT[],
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  max_participants INTEGER DEFAULT 8,
  current_participants INTEGER DEFAULT 0,
  skill_level VARCHAR(20) DEFAULT 'beginner',
  location VARCHAR(200),
  price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'published',
  equipment_included TEXT[],
  prerequisites TEXT,
  weather_conditions TEXT[],
  created_by VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS surf_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES surf_lessons(id),
  guest_id UUID NOT NULL REFERENCES guests(id),
  participation_status VARCHAR(20) DEFAULT 'registered',
  skill_assessment TEXT,
  equipment_size VARCHAR(20),
  registered_at TIMESTAMPTZ DEFAULT now(),
  attended_at TIMESTAMPTZ,
  notes TEXT
);

-- Success message
SELECT 'Final Compatible Database Setup Completed!' as status;