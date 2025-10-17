-- Add template support to lessons table
-- This allows lessons to be marked as templates for easy reuse

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;

-- Add template_name for better organization of templates
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS template_name character varying;

-- Create index for faster template queries
CREATE INDEX IF NOT EXISTS idx_lessons_template
ON public.lessons (camp_id, is_template)
WHERE is_template = true;

-- Update existing lessons to not be templates by default
UPDATE public.lessons
SET is_template = false
WHERE is_template IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.lessons.is_template IS 'Marks whether this lesson is a template for creating new lessons';
COMMENT ON COLUMN public.lessons.template_name IS 'Optional name for template organization, different from title';