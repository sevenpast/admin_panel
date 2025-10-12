-- Add recurrence functionality to meals table
-- This script adds the necessary tables and columns for meal recurrence

-- 1. Create recurrence_rules table
CREATE TABLE IF NOT EXISTS public.recurrence_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id UUID NOT NULL REFERENCES public.camps(id),
  rule_name VARCHAR(100) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  interval_value INTEGER DEFAULT 1 CHECK (interval_value > 0),
  days_of_week INTEGER[] DEFAULT NULL, -- For weekly: [1,2,3,4,5] = Mon-Fri
  day_of_month INTEGER DEFAULT NULL,   -- For monthly: 15 = 15th of each month
  end_date DATE DEFAULT NULL,
  max_occurrences INTEGER DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add recurrence_rule_id to meals table
ALTER TABLE public.meals 
ADD COLUMN IF NOT EXISTS recurrence_rule_id UUID REFERENCES public.recurrence_rules(id);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurrence_rules_camp_id ON public.recurrence_rules(camp_id);
CREATE INDEX IF NOT EXISTS idx_recurrence_rules_active ON public.recurrence_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_meals_recurrence_rule ON public.meals(recurrence_rule_id) WHERE recurrence_rule_id IS NOT NULL;

-- 4. Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_recurrence_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recurrence_rules_updated_at
    BEFORE UPDATE ON public.recurrence_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_recurrence_rules_updated_at();

-- 5. Add RLS policies
ALTER TABLE public.recurrence_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recurrence rules for their camp" ON public.recurrence_rules
    FOR SELECT USING (
        camp_id IN (
            SELECT us.camp_id 
            FROM public.user_sessions us 
            WHERE us.user_id = auth.uid() 
            AND us.is_active = true
        )
    );

CREATE POLICY "Users can insert recurrence rules for their camp" ON public.recurrence_rules
    FOR INSERT WITH CHECK (
        camp_id IN (
            SELECT us.camp_id 
            FROM public.user_sessions us 
            WHERE us.user_id = auth.uid() 
            AND us.is_active = true
        )
    );

CREATE POLICY "Users can update recurrence rules for their camp" ON public.recurrence_rules
    FOR UPDATE USING (
        camp_id IN (
            SELECT us.camp_id 
            FROM public.user_sessions us 
            WHERE us.user_id = auth.uid() 
            AND us.is_active = true
        )
    );

CREATE POLICY "Users can delete recurrence rules for their camp" ON public.recurrence_rules
    FOR DELETE USING (
        camp_id IN (
            SELECT us.camp_id 
            FROM public.user_sessions us 
            WHERE us.user_id = auth.uid() 
            AND us.is_active = true
        )
    );




