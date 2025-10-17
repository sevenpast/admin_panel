-- Update event categories to match user stories requirements
-- Categories: Day Activity, Night Activity, Sport Activity, Teaching

-- Drop existing enum and recreate with new values
DROP TYPE IF EXISTS event_category_enum CASCADE;
CREATE TYPE event_category_enum AS ENUM ('day_activity', 'night_activity', 'sport_activity', 'teaching');

-- Recreate the events table category column with the new enum
-- Note: This will remove all existing events! If you need to preserve data,
-- first backup the events table and migrate the category values manually.

-- Update the events table to use the new enum
ALTER TABLE events DROP COLUMN IF EXISTS category;
ALTER TABLE events ADD COLUMN category event_category_enum NOT NULL DEFAULT 'day_activity';

-- Add comment for documentation
COMMENT ON TYPE event_category_enum IS 'Event categories: day_activity, night_activity, sport_activity, teaching';
COMMENT ON COLUMN events.category IS 'Event category from predefined enum values';