-- ========================================
-- AUTOMATION_JOBS - Scheduled Alert & Cutoff Jobs
-- ========================================

-- ENUMs für Job Management
CREATE TYPE automation_job_type_enum AS ENUM ('alert', 'cutoff');
CREATE TYPE automation_job_status_enum AS ENUM ('pending', 'completed', 'failed', 'skipped');

CREATE TABLE automation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,

    -- Job Execution Details
    job_type automation_job_type_enum NOT NULL,
    execute_at TIMESTAMPTZ NOT NULL,

    -- Target Reference (optional - für spezifische Events/Lessons/Meals)
    target_ref_id VARCHAR(12), -- M-/E-/L-XXXXXXXXXX depending on rule target
    target_ref_table VARCHAR(50), -- 'meal_plans', 'events', 'lessons'

    -- Job Payload & Configuration
    payload JSONB NOT NULL, -- {"message": "...", "recipients": [...], "target_data": {...}}

    -- Execution Results
    status automation_job_status_enum DEFAULT 'pending',
    result_meta JSONB, -- {"recipients_count": 15, "sent_count": 14, "failed_count": 1, "errors": [...]}

    -- Execution Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Retry Logic
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_error TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_automation_jobs_camp_id ON automation_jobs(camp_id);
CREATE INDEX idx_automation_jobs_rule_id ON automation_jobs(rule_id);
CREATE INDEX idx_automation_jobs_execute_at ON automation_jobs(execute_at);
CREATE INDEX idx_automation_jobs_status ON automation_jobs(status);
CREATE INDEX idx_automation_jobs_pending ON automation_jobs(camp_id, status, execute_at) WHERE status = 'pending';
CREATE INDEX idx_automation_jobs_job_type ON automation_jobs(camp_id, job_type);
CREATE INDEX idx_automation_jobs_target_ref ON automation_jobs(target_ref_id, target_ref_table) WHERE target_ref_id IS NOT NULL;

-- Function: Update Job Timestamps basierend auf Status
CREATE OR REPLACE FUNCTION update_automation_job_timestamps() RETURNS TRIGGER AS $$
BEGIN
    -- started_at setzen wenn Status von pending zu anderem wechselt
    IF OLD.status = 'pending' AND NEW.status != 'pending' AND OLD.started_at IS NULL THEN
        NEW.started_at := now();
    END IF;

    -- completed_at setzen wenn Status zu completed, failed oder skipped wechselt
    IF NEW.status IN ('completed', 'failed', 'skipped') AND OLD.completed_at IS NULL THEN
        NEW.completed_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Job Timestamp Management
CREATE TRIGGER update_automation_job_timestamps_trigger
    BEFORE UPDATE ON automation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_job_timestamps();

-- Function: Cleanup alte Jobs (housekeeping)
CREATE OR REPLACE FUNCTION cleanup_old_automation_jobs() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Lösche completed/failed/skipped Jobs älter als 30 Tage
    DELETE FROM automation_jobs
    WHERE status IN ('completed', 'failed', 'skipped')
        AND completed_at < (now() - INTERVAL '30 days');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Job Generation für Automation Rules
CREATE OR REPLACE FUNCTION generate_automation_jobs_for_rule(rule_uuid UUID, start_date DATE, end_date DATE) RETURNS INTEGER AS $$
DECLARE
    rule_record RECORD;
    job_date DATE;
    alert_datetime TIMESTAMPTZ;
    cutoff_datetime TIMESTAMPTZ;
    camp_tz TEXT;
    jobs_created INTEGER := 0;
BEGIN
    -- Rule-Daten holen
    SELECT ar.* INTO rule_record
    FROM automation_rules ar
    WHERE ar.id = rule_uuid AND ar.is_active = true;

    -- Camp-Zeitzone holen
    SELECT c.timezone INTO camp_tz
    FROM camps c
    WHERE c.id = rule_record.camp_id;

    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- Jobs für jeden Tag im Zeitraum generieren (vereinfacht)
    job_date := start_date;
    WHILE job_date <= end_date LOOP
        -- Alert Job erstellen
        IF rule_record.send_automatically THEN
            alert_datetime := (job_date - INTERVAL '1 day' * rule_record.alert_days_before)::DATE
                            + rule_record.alert_time;

            -- Nur erstellen wenn in der Zukunft und noch nicht existiert
            IF alert_datetime > now() AND NOT EXISTS (
                SELECT 1 FROM automation_jobs
                WHERE rule_id = rule_uuid
                    AND job_type = 'alert'
                    AND execute_at = alert_datetime
            ) THEN
                INSERT INTO automation_jobs (camp_id, rule_id, job_type, execute_at, payload)
                VALUES (
                    rule_record.camp_id,
                    rule_uuid,
                    'alert',
                    alert_datetime,
                    jsonb_build_object(
                        'message', rule_record.alert_message,
                        'target', rule_record.target,
                        'meal_type', rule_record.meal_type,
                        'target_date', job_date
                    )
                );
                jobs_created := jobs_created + 1;
            END IF;
        END IF;

        -- Cutoff Job erstellen
        IF rule_record.cutoff_enabled THEN
            cutoff_datetime := (job_date - INTERVAL '1 day' * rule_record.cutoff_days_before)::DATE
                             + rule_record.cutoff_time;

            -- Nur erstellen wenn in der Zukunft und noch nicht existiert
            IF cutoff_datetime > now() AND NOT EXISTS (
                SELECT 1 FROM automation_jobs
                WHERE rule_id = rule_uuid
                    AND job_type = 'cutoff'
                    AND execute_at = cutoff_datetime
            ) THEN
                INSERT INTO automation_jobs (camp_id, rule_id, job_type, execute_at, payload)
                VALUES (
                    rule_record.camp_id,
                    rule_uuid,
                    'cutoff',
                    cutoff_datetime,
                    jsonb_build_object(
                        'target', rule_record.target,
                        'meal_type', rule_record.meal_type,
                        'target_date', job_date,
                        'cutoff_message', 'Cutoff überschritten. Bitte wende dich an ein Staff-Mitglied.'
                    )
                );
                jobs_created := jobs_created + 1;
            END IF;
        END IF;

        -- Nächster Tag
        job_date := job_date + INTERVAL '1 day';
    END LOOP;

    RETURN jobs_created;
END;
$$ LANGUAGE plpgsql;

-- Auto-Update Trigger
CREATE TRIGGER update_automation_jobs_updated_at
    BEFORE UPDATE ON automation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE automation_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Jobs des eigenen Camps
CREATE POLICY automation_jobs_camp_isolation ON automation_jobs
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Jobs (für die nächsten 7 Tage) basierend auf Demo Rules
DO $$
DECLARE
    demo_rule_id UUID;
    jobs_count INTEGER;
BEGIN
    -- Breakfast Alert Rule
    SELECT id INTO demo_rule_id
    FROM automation_rules
    WHERE name = 'Breakfast Daily Alert'
    LIMIT 1;

    IF demo_rule_id IS NOT NULL THEN
        SELECT generate_automation_jobs_for_rule(
            demo_rule_id,
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '7 days')::DATE
        ) INTO jobs_count;
    END IF;

    -- Lunch Alert Rule
    SELECT id INTO demo_rule_id
    FROM automation_rules
    WHERE name = 'Lunch Daily Alert'
    LIMIT 1;

    IF demo_rule_id IS NOT NULL THEN
        SELECT generate_automation_jobs_for_rule(
            demo_rule_id,
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '7 days')::DATE
        ) INTO jobs_count;
    END IF;

    -- Surf Lesson Alert Rule (Weekly)
    SELECT id INTO demo_rule_id
    FROM automation_rules
    WHERE name = 'Surf Lessons Weekly Alert'
    LIMIT 1;

    IF demo_rule_id IS NOT NULL THEN
        SELECT generate_automation_jobs_for_rule(
            demo_rule_id,
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '14 days')::DATE
        ) INTO jobs_count;
    END IF;
END;
$$;

-- Manuelle Demo Jobs für Testing
INSERT INTO automation_jobs (camp_id, rule_id, job_type, execute_at, payload, status) VALUES
    -- Completed Job Example
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM automation_rules WHERE name = 'Breakfast Daily Alert' LIMIT 1),
     'alert',
     CURRENT_TIMESTAMP - INTERVAL '1 hour',
     '{"message": "Frühstück heute verfügbar!", "recipients": ["G-ABC123"], "sent_count": 1}'::JSONB,
     'completed'),

    -- Failed Job Example
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM automation_rules WHERE name = 'Lunch Daily Alert' LIMIT 1),
     'alert',
     CURRENT_TIMESTAMP - INTERVAL '30 minutes',
     '{"message": "Mittagessen verfügbar!", "recipients": ["G-XYZ789"]}'::JSONB,
     'failed'),

    -- Future Pending Job
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM automation_rules WHERE name = 'Dinner Daily Alert' LIMIT 1),
     'alert',
     CURRENT_TIMESTAMP + INTERVAL '2 hours',
     ('{"message": "Abendessen heute verfügbar!", "target_date": "' || (CURRENT_DATE + INTERVAL '1 day')::TEXT || '"}')::JSONB,
     'pending');