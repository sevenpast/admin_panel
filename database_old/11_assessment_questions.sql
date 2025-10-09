-- ========================================
-- ASSESSMENT_QUESTIONS - Surf Skill Assessment Fragenkatalog
-- ========================================

-- ENUM für Assessment Kategorien
CREATE TYPE assessment_category_enum AS ENUM ('experience', 'safety', 'preferences', 'goals');

CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    category assessment_category_enum DEFAULT 'experience',

    -- 1-5 Skala Labels als JSONB
    scale_labels JSONB NOT NULL DEFAULT '{"1": "Never", "2": "Rarely", "3": "Sometimes", "4": "Often", "5": "Always"}',

    -- Konfiguration
    is_required BOOLEAN DEFAULT true, -- Muss beantwortet werden
    is_active BOOLEAN DEFAULT true, -- Sichtbar in Assessment

    -- Sortierung
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_assessment_questions_camp_id ON assessment_questions(camp_id);
CREATE INDEX idx_assessment_questions_active ON assessment_questions(camp_id, is_active) WHERE is_active = true;
CREATE INDEX idx_assessment_questions_category ON assessment_questions(camp_id, category, is_active);
CREATE INDEX idx_assessment_questions_sort ON assessment_questions(camp_id, sort_order, is_active);

-- Auto-Update Trigger
CREATE TRIGGER update_assessment_questions_updated_at
    BEFORE UPDATE ON assessment_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Questions des eigenen Camps
CREATE POLICY assessment_questions_camp_isolation ON assessment_questions
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Assessment Questions
INSERT INTO assessment_questions (camp_id, question_text, category, scale_labels, sort_order) VALUES
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'How often do you surf?',
     'experience',
     '{"1": "Never", "2": "Few times a year", "3": "Monthly", "4": "Weekly", "5": "Daily"}',
     10),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'How confident are you in reading ocean conditions?',
     'safety',
     '{"1": "Not confident", "2": "Slightly confident", "3": "Moderately confident", "4": "Very confident", "5": "Extremely confident"}',
     20),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'How comfortable are you surfing in different wave sizes?',
     'experience',
     '{"1": "Only small waves", "2": "Small to medium", "3": "Medium waves", "4": "Medium to large", "5": "Any wave size"}',
     30),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'How important is wave riding technique improvement to you?',
     'goals',
     '{"1": "Not important", "2": "Slightly important", "3": "Moderately important", "4": "Very important", "5": "Extremely important"}',
     40),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     'How do you prefer to learn new surf techniques?',
     'preferences',
     '{"1": "Self-guided", "2": "With friends", "3": "Small groups", "4": "One-on-one", "5": "Mixed methods"}',
     50);