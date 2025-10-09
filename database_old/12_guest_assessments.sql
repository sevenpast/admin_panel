-- ========================================
-- GUEST_ASSESSMENTS - Guest Assessment Antworten
-- ========================================

CREATE TABLE guest_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,

    -- Antwort (1-5 Skala, NULL = nicht beantwortet)
    answer_value INTEGER CHECK (answer_value >= 1 AND answer_value <= 5),

    -- Tracking
    answered_at TIMESTAMPTZ DEFAULT now(),

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Ein Guest kann eine Frage nur einmal beantworten (Update erlaubt)
    UNIQUE(guest_id, question_id)
);

-- Performance Indizes
CREATE INDEX idx_guest_assessments_camp_id ON guest_assessments(camp_id);
CREATE INDEX idx_guest_assessments_guest_id ON guest_assessments(guest_id);
CREATE INDEX idx_guest_assessments_question_id ON guest_assessments(question_id);
CREATE INDEX idx_guest_assessments_answered ON guest_assessments(guest_id, question_id) WHERE answer_value IS NOT NULL;

-- Auto-Update Trigger
CREATE TRIGGER update_guest_assessments_updated_at
    BEFORE UPDATE ON guest_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Update answered_at bei Antwort-Änderung
CREATE OR REPLACE FUNCTION update_answered_at() RETURNS TRIGGER AS $$
BEGIN
    -- Wenn answer_value geändert wird, answered_at aktualisieren
    IF OLD.answer_value IS DISTINCT FROM NEW.answer_value THEN
        NEW.answered_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_answered_at_trigger
    BEFORE UPDATE ON guest_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_answered_at();

-- RLS aktivieren
ALTER TABLE guest_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Assessments des eigenen Camps
CREATE POLICY guest_assessments_camp_isolation ON guest_assessments
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Guest Assessment Antworten
INSERT INTO guest_assessments (camp_id, guest_id, question_id, answer_value) VALUES
    -- John Doe Antworten
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM assessment_questions WHERE question_text = 'How often do you surf?'),
     2), -- Few times a year

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM assessment_questions WHERE question_text = 'How confident are you in reading ocean conditions?'),
     2), -- Slightly confident

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     (SELECT id FROM assessment_questions WHERE question_text = 'How comfortable are you surfing in different wave sizes?'),
     1), -- Only small waves

    -- Maria Garcia Antworten (fortgeschrittener)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM assessment_questions WHERE question_text = 'How often do you surf?'),
     4), -- Weekly

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM assessment_questions WHERE question_text = 'How confident are you in reading ocean conditions?'),
     4), -- Very confident

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     (SELECT id FROM assessment_questions WHERE question_text = 'How comfortable are you surfing in different wave sizes?'),
     3), -- Medium waves

    -- Sarah Connor Antworten (teilweise beantwortet)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM guests WHERE name = 'Sarah Connor'),
     (SELECT id FROM assessment_questions WHERE question_text = 'How important is wave riding technique improvement to you?'),
     5); -- Extremely important