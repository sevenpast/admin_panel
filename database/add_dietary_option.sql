-- Add dietary_option column to meals table
-- This script adds the dietary_option field to the meals table

-- First, create the enum type for dietary options
DROP TYPE IF EXISTS dietary_option_enum CASCADE;
CREATE TYPE dietary_option_enum AS ENUM ('meat', 'animal_product', 'vegetarian', 'vegan', 'other');

-- Add the dietary_option column to the meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS dietary_option dietary_option_enum DEFAULT 'meat';

-- Update existing meals to have a default dietary option
UPDATE meals 
SET dietary_option = 'meat' 
WHERE dietary_option IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE meals 
ALTER COLUMN dietary_option SET NOT NULL;
