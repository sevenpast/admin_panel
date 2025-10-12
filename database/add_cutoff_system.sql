-- Add cutoff system to meals and events tables
-- This implements automatic cutoff functionality for meal bookings and event registrations

-- Add cutoff fields to meals table
ALTER TABLE public.meals
ADD COLUMN cutoff_time TIME,
ADD COLUMN cutoff_enabled BOOLEAN DEFAULT false,
ADD COLUMN reset_time TIME,
ADD COLUMN reset_enabled BOOLEAN DEFAULT false,
ADD COLUMN is_booking_active BOOLEAN DEFAULT true;

-- Add cutoff fields to events table  
ALTER TABLE public.events
ADD COLUMN cutoff_time TIME,
ADD COLUMN cutoff_enabled BOOLEAN DEFAULT false,
ADD COLUMN reset_time TIME,
ADD COLUMN reset_enabled BOOLEAN DEFAULT false,
ADD COLUMN is_registration_active BOOLEAN DEFAULT true;

-- Set default cutoff times for existing meals based on meal_type
UPDATE public.meals 
SET 
  cutoff_time = CASE 
    WHEN meal_type = 'breakfast' THEN '08:00'::TIME
    WHEN meal_type = 'lunch' THEN '09:00'::TIME
    WHEN meal_type = 'dinner' THEN '16:30'::TIME
    ELSE '08:00'::TIME
  END,
  cutoff_enabled = true,
  reset_time = CASE 
    WHEN meal_type = 'breakfast' THEN '19:00'::TIME
    WHEN meal_type = 'lunch' THEN '00:00'::TIME
    WHEN meal_type = 'dinner' THEN '00:00'::TIME
    ELSE '19:00'::TIME
  END,
  reset_enabled = true
WHERE cutoff_time IS NULL;

-- Set default cutoff times for existing events (2 hours before start)
UPDATE public.events 
SET 
  cutoff_time = (start_at - INTERVAL '2 hours')::TIME,
  cutoff_enabled = true,
  reset_time = '00:00'::TIME,
  reset_enabled = true
WHERE cutoff_time IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meals_cutoff_active ON public.meals(cutoff_enabled, is_booking_active, meal_date);
CREATE INDEX IF NOT EXISTS idx_events_cutoff_active ON public.events(cutoff_enabled, is_registration_active, start_at);

-- Add comments for documentation
COMMENT ON COLUMN public.meals.cutoff_time IS 'Time when guest bookings are cut off (same day)';
COMMENT ON COLUMN public.meals.cutoff_enabled IS 'Whether cutoff functionality is enabled for this meal';
COMMENT ON COLUMN public.meals.reset_time IS 'Time when bookings are reset for next day (previous day)';
COMMENT ON COLUMN public.meals.reset_enabled IS 'Whether reset functionality is enabled for this meal';
COMMENT ON COLUMN public.meals.is_booking_active IS 'Current booking status - true = guests can book, false = cutoff reached';

COMMENT ON COLUMN public.events.cutoff_time IS 'Time when guest registrations are cut off';
COMMENT ON COLUMN public.events.cutoff_enabled IS 'Whether cutoff functionality is enabled for this event';
COMMENT ON COLUMN public.events.reset_time IS 'Time when registrations are reset for next occurrence';
COMMENT ON COLUMN public.events.reset_enabled IS 'Whether reset functionality is enabled for this event';
COMMENT ON COLUMN public.events.is_registration_active IS 'Current registration status - true = guests can register, false = cutoff reached';
