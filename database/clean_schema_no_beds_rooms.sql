-- =================================================================
-- CampFlow 2.0 - Clean Database Schema (No Beds/Rooms)
-- Version: 1.5
-- Date: 2025-01-27
--
-- This schema removes all bed and room inventory functionality
-- while keeping the UI/frontend intact.
-- =================================================================

-- ========================================
-- Section 1: ENUMS & TYPES
-- ========================================

-- General Purpose Enums
DROP TYPE IF EXISTS lesson_category_enum CASCADE;
CREATE TYPE lesson_category_enum AS ENUM ('lesson', 'theory', 'other');
DROP TYPE IF EXISTS lesson_status_enum CASCADE;
CREATE TYPE lesson_status_enum AS ENUM ('draft', 'published');
DROP TYPE IF EXISTS surf_level_enum CASCADE;
CREATE TYPE surf_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
DROP TYPE IF EXISTS assessment_category_enum CASCADE;
CREATE TYPE assessment_category_enum AS ENUM ('experience', 'safety', 'preferences', 'goals');
DROP TYPE IF EXISTS equipment_category_enum CASCADE;
CREATE TYPE equipment_category_enum AS ENUM ('surfboard', 'wetsuit', 'safety', 'cleaning', 'other');
DROP TYPE IF EXISTS equipment_status_enum CASCADE;
CREATE TYPE equipment_status_enum AS ENUM ('available', 'assigned', 'maintenance', 'retired');
DROP TYPE IF EXISTS equipment_condition_enum CASCADE;
CREATE TYPE equipment_condition_enum AS ENUM ('excellent', 'good', 'fair', 'poor');
DROP TYPE IF EXISTS meal_type_enum CASCADE;
CREATE TYPE meal_type_enum AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
DROP TYPE IF EXISTS dietary_restriction_enum CASCADE;
CREATE TYPE dietary_restriction_enum AS ENUM ('vegetarian', 'vegan', 'gluten_free', 'lactose_free', 'nut_free', 'halal', 'kosher');
DROP TYPE IF EXISTS event_category_enum CASCADE;
CREATE TYPE event_category_enum AS ENUM ('activity', 'excursion', 'social', 'sport', 'workshop', 'meal_event', 'other');
DROP TYPE IF EXISTS event_status_enum CASCADE;
CREATE TYPE event_status_enum AS ENUM ('draft', 'published', 'cancelled', 'completed');
DROP TYPE IF EXISTS shift_role_enum CASCADE;
CREATE TYPE shift_role_enum AS ENUM ('host', 'teacher', 'instructor', 'kitchen', 'maintenance', 'other');
DROP TYPE IF EXISTS automation_target_enum CASCADE;
CREATE TYPE automation_target_enum AS ENUM ('meals', 'events', 'surf_lessons');
DROP TYPE IF EXISTS meal_type_automation_enum CASCADE;
CREATE TYPE meal_type_automation_enum AS ENUM ('breakfast', 'lunch', 'dinner');
DROP TYPE IF EXISTS recurrence_type_enum CASCADE;
CREATE TYPE recurrence_type_enum AS ENUM ('none', 'daily', 'weekly', 'monthly', 'custom');
DROP TYPE IF EXISTS automation_job_type_enum CASCADE;
CREATE TYPE automation_job_type_enum AS ENUM ('alert', 'cutoff');
DROP TYPE IF EXISTS automation_job_status_enum CASCADE;
CREATE TYPE automation_job_status_enum AS ENUM ('pending', 'completed', 'failed', 'skipped');
DROP TYPE IF EXISTS delivery_status_enum CASCADE;
CREATE TYPE delivery_status_enum AS ENUM ('queued', 'sent', 'delivered', 'opened', 'failed', 'expired');
DROP TYPE IF EXISTS delivery_channel_enum CASCADE;
CREATE TYPE delivery_channel_enum AS ENUM ('push_notification', 'sms', 'email');
DROP TYPE IF EXISTS meal_order_status_enum CASCADE;
CREATE TYPE meal_order_status_enum AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');
DROP TYPE IF EXISTS equipment_assignment_status_enum CASCADE;
CREATE TYPE equipment_assignment_status_enum AS ENUM ('active', 'returned', 'lost', 'damaged');
DROP TYPE IF EXISTS event_assignment_status_enum CASCADE;
CREATE TYPE event_assignment_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'no_show', 'attended');

-- ========================================
-- Section 2: Utility Functions
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Section 3: TABLES
-- ========================================

-- Table: camps
DROP TABLE IF EXISTS camps CASCADE;
CREATE TABLE camps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_camps_active ON camps(is_active) WHERE is_active = true;
CREATE TRIGGER update_camps_updated_at BEFORE UPDATE ON camps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: user_sessions
DROP TABLE IF EXISTS user_sessions CASCADE;
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, camp_id)
);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_camp_id ON user_sessions(camp_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, is_active);
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: staff
DROP TABLE IF EXISTS staff CASCADE;
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50),
    labels TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_staff_camp_id ON staff(camp_id);
CREATE INDEX idx_staff_active ON staff(camp_id, is_active);
CREATE INDEX idx_staff_labels ON staff USING GIN(labels);
CREATE UNIQUE INDEX idx_staff_id ON staff(staff_id);
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: guests
DROP TABLE IF EXISTS guests CASCADE;
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50),
    instagram VARCHAR(100),
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
CREATE INDEX idx_guests_camp_id ON guests(camp_id);
CREATE INDEX idx_guests_active ON guests(camp_id, is_active);
CREATE INDEX idx_guests_surf_package ON guests(camp_id, surf_package, is_active);
CREATE INDEX idx_guests_surf_level ON guests(camp_id, surf_level) WHERE surf_level IS NOT NULL;
CREATE INDEX idx_guests_allergies ON guests USING GIN(allergies);
CREATE UNIQUE INDEX idx_guests_id ON guests(guest_id);
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: lessons
DROP TABLE IF EXISTS lessons CASCADE;
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category lesson_category_enum DEFAULT 'lesson',
    location VARCHAR(255) NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status lesson_status_enum DEFAULT 'draft',
    alert_time TIMESTAMPTZ,
    alert_text TEXT,
    description TEXT,
    max_participants INTEGER,
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CHECK (end_at > start_at),
    CHECK (max_participants IS NULL OR max_participants > 0)
);
CREATE INDEX idx_lessons_camp_id ON lessons(camp_id);
CREATE INDEX idx_lessons_status ON lessons(camp_id, status);
CREATE INDEX idx_lessons_category ON lessons(camp_id, category);
CREATE INDEX idx_lessons_date ON lessons(camp_id, DATE(start_at AT TIME ZONE 'UTC'));
CREATE INDEX idx_lessons_published_date ON lessons(camp_id, status, DATE(start_at AT TIME ZONE 'UTC')) WHERE status = 'published';
CREATE UNIQUE INDEX idx_lessons_id ON lessons(lesson_id);
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: lesson_instructors
DROP TABLE IF EXISTS lesson_instructors CASCADE;
CREATE TABLE lesson_instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(lesson_id, staff_id)
);
CREATE INDEX idx_lesson_instructors_camp_id ON lesson_instructors(camp_id);
CREATE INDEX idx_lesson_instructors_lesson_id ON lesson_instructors(lesson_id);
CREATE INDEX idx_lesson_instructors_staff_id ON lesson_instructors(staff_id);
CREATE TRIGGER update_lesson_instructors_updated_at BEFORE UPDATE ON lesson_instructors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: lesson_assignments
DROP TABLE IF EXISTS lesson_assignments CASCADE;
CREATE TABLE lesson_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(lesson_id, guest_id)
);
CREATE INDEX idx_lesson_assignments_camp_id ON lesson_assignments(camp_id);
CREATE INDEX idx_lesson_assignments_lesson_id ON lesson_assignments(lesson_id);
CREATE INDEX idx_lesson_assignments_guest_id ON lesson_assignments(guest_id);
CREATE INDEX idx_lesson_assignments_guest_camp ON lesson_assignments(guest_id, camp_id);
CREATE TRIGGER update_lesson_assignments_updated_at BEFORE UPDATE ON lesson_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: assessment_questions
DROP TABLE IF EXISTS assessment_questions CASCADE;
CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    category assessment_category_enum DEFAULT 'experience',
    scale_labels JSONB NOT NULL DEFAULT '{"1": "Never", "2": "Rarely", "3": "Sometimes", "4": "Often", "5": "Always"}',
    is_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_assessment_questions_camp_id ON assessment_questions(camp_id);
CREATE INDEX idx_assessment_questions_active ON assessment_questions(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_assessment_questions_category ON assessment_questions(camp_id, category, is_active);
CREATE INDEX idx_assessment_questions_sort ON assessment_questions(camp_id, sort_order, is_active);
CREATE TRIGGER update_assessment_questions_updated_at BEFORE UPDATE ON assessment_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: guest_assessments
DROP TABLE IF EXISTS guest_assessments CASCADE;
CREATE TABLE guest_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    answer_value INTEGER CHECK (answer_value >= 1 AND answer_value <= 5),
    answered_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(guest_id, question_id)
);
CREATE INDEX idx_guest_assessments_camp_id ON guest_assessments(camp_id);
CREATE INDEX idx_guest_assessments_guest_id ON guest_assessments(guest_id);
CREATE INDEX idx_guest_assessments_question_id ON guest_assessments(question_id);
CREATE INDEX idx_guest_assessments_answered ON guest_assessments(guest_id, question_id) WHERE answer_value IS NOT NULL;
CREATE TRIGGER update_guest_assessments_updated_at BEFORE UPDATE ON guest_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: equipment
DROP TABLE IF EXISTS equipment CASCADE;
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    base_name VARCHAR(255) NOT NULL, -- For grouping (e.g., "Beginner Board 8'0")
    category equipment_category_enum NOT NULL,
    type VARCHAR(100),
    brand VARCHAR(100),
    size VARCHAR(50),
    status equipment_status_enum DEFAULT 'available',
    condition equipment_condition_enum DEFAULT 'good',
    currently_assigned_to UUID REFERENCES guests(id),
    description TEXT,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    numbering_type VARCHAR(20) DEFAULT 'numeric',
    numbering_start INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_equipment_camp_id ON equipment(camp_id);
CREATE INDEX idx_equipment_status ON equipment(camp_id, status);
CREATE INDEX idx_equipment_category ON equipment(camp_id, category);
CREATE INDEX idx_equipment_base_name ON equipment(camp_id, base_name); -- For grouping
CREATE INDEX idx_equipment_available ON equipment(camp_id, status, is_active) WHERE status = 'available' AND is_active = true;
CREATE INDEX idx_equipment_assigned_to ON equipment(currently_assigned_to) WHERE currently_assigned_to IS NOT NULL;
CREATE UNIQUE INDEX idx_equipment_id ON equipment(equipment_id);
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: equipment_assignments
DROP TABLE IF EXISTS equipment_assignments CASCADE;
CREATE TABLE equipment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    status equipment_assignment_status_enum DEFAULT 'active',
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES staff(id),
    returned_at TIMESTAMPTZ,
    returned_to UUID REFERENCES staff(id),
    condition_out equipment_condition_enum,
    condition_in equipment_condition_enum,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(equipment_id, status) DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX idx_equipment_assignments_camp_id ON equipment_assignments(camp_id);
CREATE INDEX idx_equipment_assignments_equipment_id ON equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_assignments_guest_id ON equipment_assignments(guest_id);
CREATE INDEX idx_equipment_assignments_active ON equipment_assignments(camp_id, status) WHERE status = 'active';
CREATE INDEX idx_equipment_assignments_guest_active ON equipment_assignments(guest_id, status) WHERE status = 'active';
CREATE TRIGGER update_equipment_assignments_updated_at BEFORE UPDATE ON equipment_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: meals
DROP TABLE IF EXISTS meals CASCADE;
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    meal_type meal_type_enum NOT NULL,
    meal_date DATE NOT NULL,
    description TEXT,
    ingredients TEXT[],
    dietary_restrictions dietary_restriction_enum[],
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
CREATE INDEX idx_meals_camp_id ON meals(camp_id);
CREATE INDEX idx_meals_date ON meals(camp_id, meal_date);
CREATE INDEX idx_meals_type ON meals(camp_id, meal_type);
CREATE INDEX idx_meals_active ON meals(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_meals_confirmed ON meals(camp_id, meal_date, is_confirmed) WHERE is_confirmed = true;
CREATE INDEX idx_meals_dietary ON meals USING GIN (dietary_restrictions);
CREATE UNIQUE INDEX idx_meal_id ON meals(meal_id);
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: meal_options
DROP TABLE IF EXISTS meal_options CASCADE;
CREATE TABLE meal_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_option_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_portions INTEGER,
    current_orders INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    price_per_portion DECIMAL(10,2) DEFAULT 0.00,
    dietary_tags dietary_restriction_enum[],
    allergen_info JSONB,
    prep_notes TEXT,
    order_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_meal_options_camp_id ON meal_options(camp_id);
CREATE INDEX idx_meal_options_meal_id ON meal_options(meal_id);
CREATE INDEX idx_meal_options_available ON meal_options(meal_id, is_available) WHERE is_available = true;
CREATE INDEX idx_meal_options_deadline ON meal_options(camp_id, order_deadline) WHERE order_deadline IS NOT NULL;
CREATE INDEX idx_meal_options_dietary ON meal_options USING GIN (dietary_tags);
CREATE UNIQUE INDEX idx_meal_option_id ON meal_options(meal_option_id);
CREATE TRIGGER update_meal_options_updated_at BEFORE UPDATE ON meal_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: meal_orders
DROP TABLE IF EXISTS meal_orders CASCADE;
CREATE TABLE meal_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_order_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    meal_option_id UUID NOT NULL REFERENCES meal_options(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    portion_count INTEGER DEFAULT 1 CHECK (portion_count > 0),
    special_requests TEXT,
    status meal_order_status_enum DEFAULT 'pending',
    price_per_portion DECIMAL(10,2),
    total_price DECIMAL(10,2),
    has_dietary_conflict BOOLEAN DEFAULT false,
    dietary_notes TEXT,
    ordered_at TIMESTAMPTZ DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    preparation_started_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES staff(id),
    prepared_by UUID REFERENCES staff(id),
    served_by UUID REFERENCES staff(id),
    cancelled_by UUID REFERENCES staff(id),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT meal_orders_price_check CHECK (price_per_portion >= 0),
    CONSTRAINT meal_orders_total_check CHECK (total_price >= 0)
);
CREATE INDEX idx_meal_orders_camp_id ON meal_orders(camp_id);
CREATE INDEX idx_meal_orders_meal_option_id ON meal_orders(meal_option_id);
CREATE INDEX idx_meal_orders_guest_id ON meal_orders(guest_id);
CREATE INDEX idx_meal_orders_status ON meal_orders(camp_id, status);
CREATE INDEX idx_meal_orders_ordered_date ON meal_orders(camp_id, DATE(ordered_at AT TIME ZONE 'UTC'));
CREATE INDEX idx_meal_orders_active ON meal_orders(meal_option_id, status) WHERE status NOT IN ('cancelled', 'served');
CREATE INDEX idx_meal_orders_dietary_conflict ON meal_orders(camp_id, has_dietary_conflict) WHERE has_dietary_conflict = true;
CREATE UNIQUE INDEX idx_meal_order_id ON meal_orders(meal_order_id);
CREATE TRIGGER update_meal_orders_updated_at BEFORE UPDATE ON meal_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: events
DROP TABLE IF EXISTS events CASCADE;
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category event_category_enum NOT NULL DEFAULT 'activity',
    location VARCHAR(255) NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    description TEXT,
    status event_status_enum DEFAULT 'draft',
    max_participants INTEGER CHECK (max_participants IS NULL OR max_participants > 0),
    current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
    requirements TEXT,
    min_age INTEGER CHECK (min_age IS NULL OR min_age >= 0),
    max_age INTEGER CHECK (max_age IS NULL OR max_age >= min_age),
    cost_per_person DECIMAL(10,2) DEFAULT 0,
    included_in_package BOOLEAN DEFAULT true,
    organizer_id UUID REFERENCES staff(id),
    additional_staff UUID[],
    alert_time TIMESTAMPTZ,
    alert_text TEXT,
    is_active BOOLEAN DEFAULT true,
    is_mandatory BOOLEAN DEFAULT false,
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT events_time_check CHECK (end_at > start_at),
    CONSTRAINT events_age_check CHECK (max_age IS NULL OR max_age >= min_age),
    CONSTRAINT events_participants_check CHECK (current_participants <= COALESCE(max_participants, current_participants))
);
CREATE INDEX idx_events_camp_id ON events(camp_id);
CREATE INDEX idx_events_start_time ON events(camp_id, start_at);
CREATE INDEX idx_events_category ON events(camp_id, category);
CREATE INDEX idx_events_status ON events(camp_id, status);
CREATE INDEX idx_events_active ON events(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_events_published ON events(camp_id, status) WHERE status = 'published';
CREATE INDEX idx_events_organizer ON events(organizer_id) WHERE organizer_id IS NOT NULL;
CREATE INDEX idx_events_additional_staff ON events USING GIN (additional_staff);
CREATE UNIQUE INDEX idx_event_id ON events(event_id);
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: event_assignments
DROP TABLE IF EXISTS event_assignments CASCADE;
CREATE TABLE event_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    status event_assignment_status_enum DEFAULT 'pending',
    registered_at TIMESTAMPTZ DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    attended_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    special_requests TEXT,
    dietary_requirements TEXT,
    notes TEXT,
    payment_required DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'none',
    paid_at TIMESTAMPTZ,
    assigned_by UUID REFERENCES staff(id),
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, guest_id)
);
CREATE INDEX idx_event_assignments_camp_id ON event_assignments(camp_id);
CREATE INDEX idx_event_assignments_event_id ON event_assignments(event_id);
CREATE INDEX idx_event_assignments_guest_id ON event_assignments(guest_id);
CREATE INDEX idx_event_assignments_status ON event_assignments(event_id, status);
CREATE INDEX idx_event_assignments_confirmed ON event_assignments(event_id, status) WHERE status = 'confirmed';
CREATE INDEX idx_event_assignments_attended ON event_assignments(event_id, status) WHERE status = 'attended';
CREATE INDEX idx_event_assignments_payment ON event_assignments(payment_status) WHERE payment_required > 0;
CREATE TRIGGER update_event_assignments_updated_at BEFORE UPDATE ON event_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: shifts
DROP TABLE IF EXISTS shifts CASCADE;
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role_label shift_role_enum NOT NULL DEFAULT 'other',
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    color VARCHAR(7),
    recurrence_rule TEXT,
    recurrence_parent_id UUID REFERENCES shifts(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT shifts_time_check CHECK (end_at > start_at),
    CONSTRAINT shifts_same_day_check CHECK (DATE(start_at AT TIME ZONE 'UTC') = DATE(end_at AT TIME ZONE 'UTC'))
);
CREATE INDEX idx_shifts_camp_id ON shifts(camp_id);
CREATE INDEX idx_shifts_staff_id ON shifts(staff_id);
CREATE INDEX idx_shifts_time_range ON shifts(camp_id, start_at, end_at);
CREATE INDEX idx_shifts_active ON shifts(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_shifts_recurrence_parent ON shifts(recurrence_parent_id) WHERE recurrence_parent_id IS NOT NULL;
CREATE INDEX idx_shifts_date ON shifts(camp_id, DATE(start_at AT TIME ZONE 'UTC'));
CREATE UNIQUE INDEX idx_shift_id ON shifts(shift_id);
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: automation_rules
DROP TABLE IF EXISTS automation_rules CASCADE;
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_rule_id VARCHAR(12) UNIQUE NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target automation_target_enum NOT NULL,
    meal_type meal_type_automation_enum,
    alert_days_before INTEGER NOT NULL DEFAULT 0 CHECK (alert_days_before >= 0),
    alert_time TIME NOT NULL,
    alert_message TEXT NOT NULL,
    send_automatically BOOLEAN DEFAULT true,
    cutoff_enabled BOOLEAN DEFAULT false,
    cutoff_days_before INTEGER CHECK (cutoff_days_before >= 0),
    cutoff_time TIME,
    recurring BOOLEAN DEFAULT false,
    recurrence_type recurrence_type_enum DEFAULT 'none',
    recurrence_payload JSONB,
    season_override JSONB,
    special_dates JSONB[],
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES staff(id),
    updated_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT automation_rules_meal_type_check CHECK ((target = 'meals' AND meal_type IS NOT NULL) OR (target != 'meals' AND meal_type IS NULL)),
    CONSTRAINT automation_rules_cutoff_check CHECK ((cutoff_enabled = false) OR (cutoff_enabled = true AND cutoff_days_before IS NOT NULL AND cutoff_time IS NOT NULL))
);
CREATE INDEX idx_automation_rules_camp_id ON automation_rules(camp_id);
CREATE INDEX idx_automation_rules_target ON automation_rules(camp_id, target);
CREATE INDEX idx_automation_rules_active ON automation_rules(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_automation_rules_recurring ON automation_rules(camp_id, recurring) WHERE recurring = true;
CREATE INDEX idx_automation_rules_meal_type ON automation_rules(camp_id, meal_type) WHERE meal_type IS NOT NULL;
CREATE UNIQUE INDEX idx_automation_rule_id ON automation_rules(automation_rule_id);
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: automation_jobs
DROP TABLE IF EXISTS automation_jobs CASCADE;
CREATE TABLE automation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    job_type automation_job_type_enum NOT NULL,
    execute_at TIMESTAMPTZ NOT NULL,
    target_ref_id VARCHAR(12),
    target_ref_table VARCHAR(50),
    payload JSONB NOT NULL,
    status automation_job_status_enum DEFAULT 'pending',
    result_meta JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_automation_jobs_camp_id ON automation_jobs(camp_id);
CREATE INDEX idx_automation_jobs_rule_id ON automation_jobs(rule_id);
CREATE INDEX idx_automation_jobs_execute_at ON automation_jobs(execute_at);
CREATE INDEX idx_automation_jobs_status ON automation_jobs(status);
CREATE INDEX idx_automation_jobs_pending ON automation_jobs(camp_id, status, execute_at) WHERE status = 'pending';
CREATE INDEX idx_automation_jobs_job_type ON automation_jobs(camp_id, job_type);
CREATE INDEX idx_automation_jobs_target_ref ON automation_jobs(target_ref_id, target_ref_table) WHERE target_ref_id IS NOT NULL;
CREATE TRIGGER update_automation_jobs_updated_at BEFORE UPDATE ON automation_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: automation_deliveries
DROP TABLE IF EXISTS automation_deliveries CASCADE;
CREATE TABLE automation_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES automation_jobs(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    delivery_channel delivery_channel_enum DEFAULT 'push_notification',
    device_token VARCHAR(255),
    phone_number VARCHAR(50),
    email_address VARCHAR(255),
    message_title VARCHAR(255),
    message_body TEXT NOT NULL,
    message_data JSONB,
    status delivery_status_enum DEFAULT 'queued',
    queued_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    external_delivery_id VARCHAR(255),
    provider_response JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_automation_deliveries_camp_id ON automation_deliveries(camp_id);
CREATE INDEX idx_automation_deliveries_job_id ON automation_deliveries(job_id);
CREATE INDEX idx_automation_deliveries_guest_id ON automation_deliveries(guest_id);
CREATE INDEX idx_automation_deliveries_status ON automation_deliveries(status);
CREATE INDEX idx_automation_deliveries_queued ON automation_deliveries(camp_id, status, queued_at) WHERE status = 'queued';
CREATE INDEX idx_automation_deliveries_channel ON automation_deliveries(delivery_channel);
CREATE INDEX idx_automation_deliveries_sent_at ON automation_deliveries(sent_at) WHERE sent_at IS NOT NULL;
CREATE INDEX idx_automation_deliveries_device_token ON automation_deliveries(device_token) WHERE device_token IS NOT NULL;
CREATE TRIGGER update_automation_deliveries_updated_at BEFORE UPDATE ON automation_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Section 4: ID Generation Functions
-- ========================================

CREATE OR REPLACE FUNCTION generate_id(prefix TEXT) RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    table_name TEXT;
    id_column_name TEXT;
    collision_count INT := 0;
BEGIN
    CASE prefix
        WHEN 'S' THEN
            table_name := 'staff';
            id_column_name := 'staff_id';
        WHEN 'G' THEN
            table_name := 'guests';
            id_column_name := 'guest_id';
        WHEN 'L' THEN
            table_name := 'lessons';
            id_column_name := 'lesson_id';
        WHEN 'U' THEN
            table_name := 'equipment';
            id_column_name := 'equipment_id';
        WHEN 'M' THEN
            table_name := 'meals';
            id_column_name := 'meal_id';
        WHEN 'O' THEN
            table_name := 'meal_options';
            id_column_name := 'meal_option_id';
        WHEN 'T' THEN
            table_name := 'meal_orders';
            id_column_name := 'meal_order_id';
        WHEN 'E' THEN
            table_name := 'events';
            id_column_name := 'event_id';
        WHEN 'H' THEN
            table_name := 'shifts';
            id_column_name := 'shift_id';
        WHEN 'A' THEN
            table_name := 'automation_rules';
            id_column_name := 'automation_rule_id';
        ELSE
            RAISE EXCEPTION 'Invalid prefix for ID generation: %', prefix;
    END CASE;

    LOOP
        new_id := prefix || '-' || UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 10)
        );

        EXECUTE format('SELECT 1 FROM public.%I WHERE %I = %L', table_name, id_column_name, new_id)
        INTO collision_count;

        IF collision_count = 0 THEN
            RETURN new_id;
        END IF;

        collision_count := collision_count + 1;
        IF collision_count > 100 THEN
            RAISE EXCEPTION 'Too many ID collisions for % ID generation', prefix;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Section 5: Triggers & Functions
-- ========================================

-- Trigger to validate instructor assignment
CREATE OR REPLACE FUNCTION validate_instructor_assignment() RETURNS TRIGGER AS $$
DECLARE
    staff_record RECORD;
BEGIN
    SELECT is_active, labels INTO staff_record
    FROM staff
    WHERE id = NEW.staff_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Staff not found';
    END IF;

    IF NOT staff_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign inactive staff as instructor';
    END IF;

    IF NOT 'instructor' = ANY(staff_record.labels) THEN
        RAISE EXCEPTION 'Staff does not have instructor label';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER validate_instructor_assignment_trigger BEFORE INSERT OR UPDATE ON lesson_instructors FOR EACH ROW EXECUTE FUNCTION validate_instructor_assignment();

-- Trigger to validate lesson assignment
CREATE OR REPLACE FUNCTION validate_lesson_assignment() RETURNS TRIGGER AS $$
DECLARE
    guest_record RECORD;
    lesson_record RECORD;
    lesson_date DATE;
    existing_count INTEGER;
    camp_tz TEXT;
BEGIN
    SELECT is_active, surf_package INTO guest_record
    FROM guests
    WHERE id = NEW.guest_id;

    SELECT category, start_at, camp_id INTO lesson_record
    FROM lessons
    WHERE id = NEW.lesson_id;

    SELECT timezone INTO camp_tz
    FROM camps
    WHERE id = lesson_record.camp_id;

    lesson_date := DATE(lesson_record.start_at AT TIME ZONE camp_tz);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guest not found';
    END IF;

    IF NOT guest_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign inactive guest to lesson';
    END IF;

    IF NOT guest_record.surf_package THEN
        RAISE EXCEPTION 'Guest does not have surf package';
    END IF;

    IF lesson_record.category = 'lesson' THEN
        SELECT COUNT(*) INTO existing_count
        FROM lesson_assignments la
        JOIN lessons l ON la.lesson_id = l.id
        WHERE la.guest_id = NEW.guest_id
            AND la.camp_id = NEW.camp_id
            AND l.category = 'lesson'
            AND DATE(l.start_at AT TIME ZONE camp_tz) = lesson_date
            AND (TG_OP = 'INSERT' OR la.id != NEW.id);

        IF existing_count > 0 THEN
            RAISE EXCEPTION 'Guest already has a lesson assignment on this day';
        END IF;
    END IF;

    IF lesson_record.category = 'theory' THEN
        SELECT COUNT(*) INTO existing_count
        FROM lesson_assignments la
        JOIN lessons l ON la.lesson_id = l.id
        WHERE la.guest_id = NEW.guest_id
            AND la.camp_id = NEW.camp_id
            AND l.category = 'theory'
            AND DATE(l.start_at AT TIME ZONE camp_tz) = lesson_date
            AND (TG_OP = 'INSERT' OR la.id != NEW.id);

        IF existing_count > 0 THEN
            RAISE EXCEPTION 'Guest already has a theory assignment on this day';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER validate_lesson_assignment_trigger BEFORE INSERT OR UPDATE ON lesson_assignments FOR EACH ROW EXECUTE FUNCTION validate_lesson_assignment();

-- Trigger to update answered_at in guest_assessments
CREATE OR REPLACE FUNCTION update_answered_at() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.answer_value IS DISTINCT FROM NEW.answer_value THEN
        NEW.answered_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_answered_at_trigger BEFORE UPDATE ON guest_assessments FOR EACH ROW EXECUTE FUNCTION update_answered_at();

-- Trigger to validate equipment assignment
CREATE OR REPLACE FUNCTION validate_equipment_assignment() RETURNS TRIGGER AS $$
DECLARE
    guest_record RECORD;
    equipment_record RECORD;
    existing_board_count INTEGER;
BEGIN
    SELECT is_active, surf_package INTO guest_record
    FROM guests
    WHERE id = NEW.guest_id;

    SELECT status, category INTO equipment_record
    FROM equipment
    WHERE id = NEW.equipment_id;

    IF NOT guest_record.is_active THEN
        RAISE EXCEPTION 'Cannot assign equipment to inactive guest';
    END IF;

    IF equipment_record.status NOT IN ('available') THEN
        RAISE EXCEPTION 'Equipment is not available for assignment';
    END IF;

    IF equipment_record.category = 'surfboard' AND NEW.status = 'active' THEN
        SELECT COUNT(*) INTO existing_board_count
        FROM equipment_assignments ea
        JOIN equipment e ON ea.equipment_id = e.id
        WHERE ea.guest_id = NEW.guest_id
            AND ea.status = 'active'
            AND e.category = 'surfboard'
            AND (TG_OP = 'INSERT' OR ea.id != NEW.id);

        IF existing_board_count > 0 THEN
            RAISE EXCEPTION 'Guest already has an active surfboard assignment';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER validate_equipment_assignment_trigger BEFORE INSERT OR UPDATE ON equipment_assignments FOR EACH ROW EXECUTE FUNCTION validate_equipment_assignment();

-- Trigger to update equipment status
CREATE OR REPLACE FUNCTION update_equipment_status() RETURNS TRIGGER AS $$
DECLARE
    equipment_uuid UUID;
    new_status equipment_status_enum;
    assigned_guest UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        equipment_uuid := OLD.equipment_id;
    ELSE
        equipment_uuid := NEW.equipment_id;
    END IF;

    SELECT guest_id INTO assigned_guest
    FROM equipment_assignments
    WHERE equipment_id = equipment_uuid AND status = 'active'
    LIMIT 1;

    IF assigned_guest IS NOT NULL THEN
        new_status := 'assigned';
    ELSE
        new_status := 'available';
    END IF;

    UPDATE equipment
    SET status = new_status,
        currently_assigned_to = assigned_guest,
        updated_at = now()
    WHERE id = equipment_uuid;

    IF TG_OP = 'UPDATE' AND OLD.equipment_id != NEW.equipment_id THEN
        SELECT guest_id INTO assigned_guest
        FROM equipment_assignments
        WHERE equipment_id = OLD.equipment_id AND status = 'active'
        LIMIT 1;

        IF assigned_guest IS NOT NULL THEN
            new_status := 'assigned';
        ELSE
            new_status := 'available';
        END IF;

        UPDATE equipment
        SET status = new_status,
            currently_assigned_to = assigned_guest,
            updated_at = now()
        WHERE id = OLD.equipment_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_equipment_status_trigger AFTER INSERT OR UPDATE OR DELETE ON equipment_assignments FOR EACH ROW EXECUTE FUNCTION update_equipment_status();

-- Trigger to update meal option orders counter
CREATE OR REPLACE FUNCTION update_meal_option_orders_counter() RETURNS TRIGGER AS $$
DECLARE
    option_id UUID;
    new_count INTEGER;
BEGIN
    option_id := COALESCE(NEW.meal_option_id, OLD.meal_option_id);

    SELECT COUNT(*) INTO new_count
    FROM meal_orders mo
    WHERE mo.meal_option_id = option_id
        AND mo.status != 'cancelled';

    UPDATE meal_options
    SET current_orders = new_count,
        updated_at = now()
    WHERE id = option_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_meal_option_orders_counter_trigger AFTER INSERT OR UPDATE OR DELETE ON meal_orders FOR EACH ROW EXECUTE FUNCTION update_meal_option_orders_counter();

-- Trigger to validate meal order
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
    SELECT mo.*, m.meal_date, m.name as meal_name
    INTO option_record
    FROM meal_options mo
    JOIN meals m ON mo.meal_id = m.id
    WHERE mo.id = NEW.meal_option_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Meal option not found';
    END IF;

    NEW.price_per_portion := option_record.price_per_portion;
    NEW.total_price := NEW.portion_count * COALESCE(NEW.price_per_portion, 0);

    IF NOT option_record.is_available THEN
        RAISE EXCEPTION 'Meal option is not available';
    END IF;

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

    IF option_record.order_deadline IS NOT NULL AND now() > option_record.order_deadline THEN
        RAISE EXCEPTION 'Order deadline passed for this meal option';
    END IF;

    SELECT allergies INTO guest_allergies
    FROM guests
    WHERE id = NEW.guest_id;

    option_allergens := option_record.allergen_info;

    IF guest_allergies IS NOT NULL AND option_allergens IS NOT NULL THEN
        FOR allergy_key, allergy_value IN SELECT * FROM jsonb_each_text(guest_allergies)
        LOOP
            IF allergy_value::BOOLEAN = true THEN
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
CREATE TRIGGER validate_meal_order_trigger BEFORE INSERT OR UPDATE ON meal_orders FOR EACH ROW EXECUTE FUNCTION validate_meal_order();

-- Trigger to update meal order timestamps
CREATE OR REPLACE FUNCTION update_meal_order_timestamps() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
        NEW.confirmed_at := now();
    END IF;
    IF OLD.status != 'preparing' AND NEW.status = 'preparing' AND NEW.preparation_started_at IS NULL THEN
        NEW.preparation_started_at := now();
    END IF;
    IF OLD.status != 'ready' AND NEW.status = 'ready' AND NEW.ready_at IS NULL THEN
        NEW.ready_at := now();
    END IF;
    IF OLD.status != 'served' AND NEW.status = 'served' AND NEW.served_at IS NULL THEN
        NEW.served_at := now();
    END IF;
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
        NEW.cancelled_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_meal_order_timestamps_trigger BEFORE UPDATE ON meal_orders FOR EACH ROW EXECUTE FUNCTION update_meal_order_timestamps();

-- Trigger to update event participants
CREATE OR REPLACE FUNCTION update_event_participants() RETURNS TRIGGER AS $$
DECLARE
    participant_count INTEGER;
    event_uuid UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        event_uuid := OLD.event_id;
    ELSE
        event_uuid := NEW.event_id;
    END IF;

    SELECT COUNT(*) INTO participant_count
    FROM event_assignments
    WHERE event_id = event_uuid AND status = 'confirmed';

    UPDATE events
    SET current_participants = participant_count,
        updated_at = now()
    WHERE id = event_uuid;

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
CREATE TRIGGER update_event_participants_trigger AFTER INSERT OR UPDATE OR DELETE ON event_assignments FOR EACH ROW EXECUTE FUNCTION update_event_participants();

-- Trigger to validate event assignment
CREATE OR REPLACE FUNCTION validate_event_assignment() RETURNS TRIGGER AS $$
DECLARE
    guest_record RECORD;
    event_record RECORD;
    existing_participants INTEGER;
BEGIN
    SELECT is_active INTO guest_record
    FROM guests
    WHERE id = NEW.guest_id;

    SELECT is_active, status, max_participants, current_participants,
           cost_per_person, included_in_package INTO event_record
    FROM events
    WHERE id = NEW.event_id;

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

    IF NEW.status = 'confirmed' AND event_record.max_participants IS NOT NULL THEN
        SELECT COUNT(*) INTO existing_participants
        FROM event_assignments
        WHERE event_id = NEW.event_id
            AND status = 'confirmed'
            AND (TG_OP = 'INSERT' OR id != NEW.id);

        IF existing_participants >= event_record.max_participants THEN
            RAISE EXCEPTION 'Event has reached maximum capacity (% participants)', event_record.max_participants;
        END IF;
    END IF;

    IF NOT event_record.included_in_package AND event_record.cost_per_person > 0 THEN
        NEW.payment_required := event_record.cost_per_person;
        IF NEW.payment_status = 'none' THEN
            NEW.payment_status := 'pending';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER validate_event_assignment_trigger BEFORE INSERT OR UPDATE ON event_assignments FOR EACH ROW EXECUTE FUNCTION validate_event_assignment();

-- Trigger to update event assignment timestamps
CREATE OR REPLACE FUNCTION update_event_assignment_timestamps() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'confirmed' THEN
                NEW.confirmed_at := now();
            WHEN 'cancelled' THEN
                NEW.cancelled_at := now();
            WHEN 'attended' THEN
                NEW.attended_at := now();
                IF NEW.confirmed_at IS NULL THEN
                    NEW.confirmed_at := now();
                END IF;
        END CASE;
    END IF;

    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'paid' THEN
        NEW.paid_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_event_assignment_timestamps_trigger BEFORE UPDATE ON event_assignments FOR EACH ROW EXECUTE FUNCTION update_event_assignment_timestamps();

-- Trigger to validate shift
CREATE OR REPLACE FUNCTION validate_shift() RETURNS TRIGGER AS $$
DECLARE
    staff_record RECORD;
    camp_tz TEXT;
    shift_date DATE;
    conflicting_shifts INTEGER;
BEGIN
    SELECT is_active, labels INTO staff_record
    FROM staff
    WHERE id = NEW.staff_id;

    SELECT timezone INTO camp_tz
    FROM camps
    WHERE id = NEW.camp_id;

    shift_date := DATE(NEW.start_at AT TIME ZONE camp_tz);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Staff member not found';
    END IF;

    IF NOT staff_record.is_active THEN
        RAISE EXCEPTION 'Staff ist inaktiv und kann nicht verplant werden';
    END IF;

    IF DATE(NEW.start_at AT TIME ZONE camp_tz) != DATE(NEW.end_at AT TIME ZONE camp_tz) THEN
        RAISE EXCEPTION 'Shifts dürfen nicht über Mitternacht gehen';
    END IF;

    SELECT COUNT(*) INTO conflicting_shifts
    FROM shifts
    WHERE staff_id = NEW.staff_id
        AND camp_id = NEW.camp_id
        AND is_active = true
        AND id != COALESCE(NEW.id, gen_random_uuid())
        AND (
            (NEW.start_at < end_at AND NEW.end_at > start_at)
        );

    IF conflicting_shifts > 0 THEN
        RAISE EXCEPTION 'Konflikt: Überschneidung mit bestehender Schicht';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER validate_shift_trigger BEFORE INSERT OR UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION validate_shift();

-- Trigger to set default shift color
CREATE OR REPLACE FUNCTION set_default_shift_color() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.color IS NULL THEN
        NEW.color := '#' || SUBSTRING(MD5(NEW.staff_id::TEXT) FROM 1 FOR 6);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_default_shift_color_trigger BEFORE INSERT ON shifts FOR EACH ROW EXECUTE FUNCTION set_default_shift_color();

-- Trigger to validate automation rule
CREATE OR REPLACE FUNCTION validate_automation_rule() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.target = 'meals' AND NEW.meal_type IS NULL THEN
        RAISE EXCEPTION 'Meal-Regeln erfordern meal_type';
    END IF;

    IF NEW.target != 'meals' AND NEW.meal_type IS NOT NULL THEN
        RAISE EXCEPTION 'meal_type nur für Meal-Regeln erlaubt';
    END IF;

    IF NEW.cutoff_enabled AND (NEW.cutoff_days_before IS NULL OR NEW.cutoff_time IS NULL) THEN
        RAISE EXCEPTION 'Cutoff erfordert cutoff_days_before und cutoff_time';
    END IF;

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
CREATE TRIGGER validate_automation_rule_trigger BEFORE INSERT OR UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION validate_automation_rule();

-- Trigger to update automation rule updated_by
CREATE OR REPLACE FUNCTION update_automation_rule_updated_by() RETURNS TRIGGER AS $$
DECLARE
    current_staff_id UUID;
BEGIN
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
CREATE TRIGGER update_automation_rule_updated_by_trigger BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_automation_rule_updated_by();

-- Trigger to update automation job timestamps
CREATE OR REPLACE FUNCTION update_automation_job_timestamps() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status != 'pending' AND OLD.started_at IS NULL THEN
        NEW.started_at := now();
    END IF;

    IF NEW.status IN ('completed', 'failed', 'skipped') AND OLD.completed_at IS NULL THEN
        NEW.completed_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_automation_job_timestamps_trigger BEFORE UPDATE ON automation_jobs FOR EACH ROW EXECUTE FUNCTION update_automation_job_timestamps();

-- Trigger to update delivery timestamps
CREATE OR REPLACE FUNCTION update_delivery_timestamps() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'sent' AND NEW.status = 'sent' AND NEW.sent_at IS NULL THEN
        NEW.sent_at := now();
    END IF;

    IF OLD.status != 'delivered' AND NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN
        NEW.delivered_at := now();
    END IF;

    IF OLD.status != 'opened' AND NEW.status = 'opened' AND NEW.opened_at IS NULL THEN
        NEW.opened_at := now();
    END IF;

    IF OLD.status != 'expired' AND NEW.status = 'expired' AND NEW.expired_at IS NULL THEN
        NEW.expired_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_delivery_timestamps_trigger BEFORE UPDATE ON automation_deliveries FOR EACH ROW EXECUTE FUNCTION update_delivery_timestamps();

-- ========================================
-- Section 6: RLS Policies
-- ========================================

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_sessions_own_data ON user_sessions FOR ALL USING (user_id = auth.uid());

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_camp_isolation ON staff FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY guests_camp_isolation ON guests FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY lessons_camp_isolation ON lessons FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE lesson_instructors ENABLE ROW LEVEL SECURITY;
CREATE POLICY lesson_instructors_camp_isolation ON lesson_instructors FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE lesson_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY lesson_assignments_camp_isolation ON lesson_assignments FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_questions_camp_isolation ON assessment_questions FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE guest_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY guest_assessments_camp_isolation ON guest_assessments FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY equipment_camp_isolation ON equipment FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY equipment_assignments_camp_isolation ON equipment_assignments FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY meals_camp_isolation ON meals FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE meal_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY meal_options_camp_isolation ON meal_options FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE meal_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY meal_orders_camp_isolation ON meal_orders FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_camp_isolation ON events FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE event_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY event_assignments_camp_isolation ON event_assignments FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY shifts_camp_isolation ON shifts FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY automation_rules_camp_isolation ON automation_rules FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE automation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY automation_jobs_camp_isolation ON automation_jobs FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE automation_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY automation_deliveries_camp_isolation ON automation_deliveries FOR ALL USING (camp_id IN (SELECT camp_id FROM user_sessions WHERE user_id = auth.uid() AND is_active = true));
