-- Add is_template column to meals table
ALTER TABLE public.meals ADD COLUMN is_template boolean DEFAULT false;

-- Add index for better performance when filtering templates
CREATE INDEX idx_meals_is_template ON public.meals(is_template);

-- Add comment for documentation
COMMENT ON COLUMN public.meals.is_template IS 'If true, this meal is a template for creating new meals. Templates are not visible to guests.';
