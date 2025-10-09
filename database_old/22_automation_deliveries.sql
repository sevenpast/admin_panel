-- ========================================
-- AUTOMATION_DELIVERIES - Push Notification Delivery Tracking
-- ========================================

-- ENUMs für Delivery Management
CREATE TYPE delivery_status_enum AS ENUM ('queued', 'sent', 'delivered', 'opened', 'failed', 'expired');
CREATE TYPE delivery_channel_enum AS ENUM ('push_notification', 'sms', 'email');

CREATE TABLE automation_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES automation_jobs(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,

    -- Delivery Details
    delivery_channel delivery_channel_enum DEFAULT 'push_notification',
    device_token VARCHAR(255), -- FCM/APNS Device Token
    phone_number VARCHAR(50), -- For SMS
    email_address VARCHAR(255), -- For Email

    -- Message Content
    message_title VARCHAR(255),
    message_body TEXT NOT NULL,
    message_data JSONB, -- Additional payload data

    -- Delivery Status & Tracking
    status delivery_status_enum DEFAULT 'queued',

    -- Timestamps für Delivery Lifecycle
    queued_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ, -- Platform confirmed delivery
    opened_at TIMESTAMPTZ, -- User opened notification
    expired_at TIMESTAMPTZ, -- TTL exceeded

    -- Error Handling
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- External Provider Response
    external_delivery_id VARCHAR(255), -- Provider's delivery ID
    provider_response JSONB, -- Raw provider response

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indizes
CREATE INDEX idx_automation_deliveries_camp_id ON automation_deliveries(camp_id);
CREATE INDEX idx_automation_deliveries_job_id ON automation_deliveries(job_id);
CREATE INDEX idx_automation_deliveries_guest_id ON automation_deliveries(guest_id);
CREATE INDEX idx_automation_deliveries_status ON automation_deliveries(status);
CREATE INDEX idx_automation_deliveries_queued ON automation_deliveries(camp_id, status, queued_at) WHERE status = 'queued';
CREATE INDEX idx_automation_deliveries_channel ON automation_deliveries(delivery_channel);
CREATE INDEX idx_automation_deliveries_sent_at ON automation_deliveries(sent_at) WHERE sent_at IS NOT NULL;
CREATE INDEX idx_automation_deliveries_device_token ON automation_deliveries(device_token) WHERE device_token IS NOT NULL;

-- Function: Update Delivery Timestamps basierend auf Status
CREATE OR REPLACE FUNCTION update_delivery_timestamps() RETURNS TRIGGER AS $$
BEGIN
    -- sent_at setzen wenn Status zu 'sent' wechselt
    IF OLD.status != 'sent' AND NEW.status = 'sent' AND NEW.sent_at IS NULL THEN
        NEW.sent_at := now();
    END IF;

    -- delivered_at setzen wenn Status zu 'delivered' wechselt
    IF OLD.status != 'delivered' AND NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN
        NEW.delivered_at := now();
    END IF;

    -- opened_at setzen wenn Status zu 'opened' wechselt
    IF OLD.status != 'opened' AND NEW.status = 'opened' AND NEW.opened_at IS NULL THEN
        NEW.opened_at := now();
    END IF;

    -- expired_at setzen wenn Status zu 'expired' wechselt
    IF OLD.status != 'expired' AND NEW.status = 'expired' AND NEW.expired_at IS NULL THEN
        NEW.expired_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Delivery Timestamp Management
CREATE TRIGGER update_delivery_timestamps_trigger
    BEFORE UPDATE ON automation_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_timestamps();

-- Function: Cleanup alte Deliveries (housekeeping)
CREATE OR REPLACE FUNCTION cleanup_old_automation_deliveries() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Lösche delivered/failed/expired Deliveries älter als 90 Tage
    DELETE FROM automation_deliveries
    WHERE status IN ('delivered', 'failed', 'expired', 'opened')
        AND COALESCE(delivered_at, opened_at, expired_at, sent_at) < (now() - INTERVAL '90 days');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Delivery Stats für Job
CREATE OR REPLACE FUNCTION get_delivery_stats_for_job(job_uuid UUID) RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_deliveries', COUNT(*),
        'queued', COUNT(*) FILTER (WHERE status = 'queued'),
        'sent', COUNT(*) FILTER (WHERE status = 'sent'),
        'delivered', COUNT(*) FILTER (WHERE status = 'delivered'),
        'opened', COUNT(*) FILTER (WHERE status = 'opened'),
        'failed', COUNT(*) FILTER (WHERE status = 'failed'),
        'expired', COUNT(*) FILTER (WHERE status = 'expired'),
        'success_rate', ROUND(
            (COUNT(*) FILTER (WHERE status IN ('delivered', 'opened'))::NUMERIC /
             GREATEST(COUNT(*), 1)) * 100, 2
        ),
        'open_rate', ROUND(
            (COUNT(*) FILTER (WHERE status = 'opened')::NUMERIC /
             GREATEST(COUNT(*) FILTER (WHERE status IN ('delivered', 'opened')), 1)) * 100, 2
        )
    ) INTO stats
    FROM automation_deliveries
    WHERE job_id = job_uuid;

    RETURN COALESCE(stats, '{}');
END;
$$ LANGUAGE plpgsql;

-- Function: Update Job Result Meta mit Delivery Stats
CREATE OR REPLACE FUNCTION update_job_delivery_stats() RETURNS TRIGGER AS $$
DECLARE
    job_uuid UUID;
    delivery_stats JSONB;
BEGIN
    job_uuid := COALESCE(NEW.job_id, OLD.job_id);

    -- Hole aktuelle Stats
    SELECT get_delivery_stats_for_job(job_uuid) INTO delivery_stats;

    -- Update Job mit aktuellen Stats
    UPDATE automation_jobs
    SET result_meta = COALESCE(result_meta, '{}'::JSONB) || delivery_stats,
        updated_at = now()
    WHERE id = job_uuid;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update Job Stats bei Delivery Changes
CREATE TRIGGER update_job_delivery_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON automation_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_job_delivery_stats();

-- Auto-Update Trigger
CREATE TRIGGER update_automation_deliveries_updated_at
    BEFORE UPDATE ON automation_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE automation_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Deliveries des eigenen Camps
CREATE POLICY automation_deliveries_camp_isolation ON automation_deliveries
    FOR ALL
    USING (camp_id IN (
        SELECT camp_id FROM user_sessions
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Demo Deliveries basierend auf Demo Jobs
INSERT INTO automation_deliveries (camp_id, job_id, guest_id, device_token, message_title, message_body, status, sent_at, delivered_at) VALUES
    -- Successful Delivery
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM automation_jobs WHERE status = 'completed' LIMIT 1),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     'fcm_token_john_doe_12345',
     'Frühstück verfügbar!',
     'Frühstück morgen verfügbar! Bitte bis 07:00 Uhr bestellen.',
     'delivered',
     CURRENT_TIMESTAMP - INTERVAL '55 minutes',
     CURRENT_TIMESTAMP - INTERVAL '54 minutes'),

    -- Opened Delivery
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM automation_jobs WHERE status = 'completed' LIMIT 1),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     'fcm_token_maria_garcia_67890',
     'Frühstück verfügbar!',
     'Frühstück morgen verfügbar! Bitte bis 07:00 Uhr bestellen.',
     'opened',
     CURRENT_TIMESTAMP - INTERVAL '55 minutes',
     CURRENT_TIMESTAMP - INTERVAL '54 minutes'),

    -- Failed Delivery
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM automation_jobs WHERE status = 'failed' LIMIT 1),
     (SELECT id FROM guests WHERE name = 'Sarah Connor'),
     'invalid_token_sarah_123',
     'Mittagessen verfügbar!',
     'Mittagessen heute verfügbar! Bitte bis 12:00 Uhr bestellen.',
     'failed',
     CURRENT_TIMESTAMP - INTERVAL '25 minutes',
     NULL),

    -- Queued Delivery (pending)
    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM automation_jobs WHERE status = 'pending' LIMIT 1),
     (SELECT id FROM guests WHERE name = 'John Doe'),
     'fcm_token_john_doe_12345',
     'Abendessen verfügbar!',
     'Abendessen heute verfügbar! Bitte bis 17:00 Uhr bestellen.',
     'queued',
     NULL,
     NULL),

    ((SELECT id FROM camps WHERE name = 'Demo Camp'),
     (SELECT id FROM automation_jobs WHERE status = 'pending' LIMIT 1),
     (SELECT id FROM guests WHERE name = 'Maria Garcia'),
     'fcm_token_maria_garcia_67890',
     'Abendessen verfügbar!',
     'Abendessen heute verfügbar! Bitte bis 17:00 Uhr bestellen.',
     'queued',
     NULL,
     NULL);

-- Update Demo Job mit failure reason für failed job
UPDATE automation_jobs
SET result_meta = jsonb_build_object(
    'total_deliveries', 1,
    'failed', 1,
    'success_rate', 0,
    'last_error', 'Invalid device token'
),
    last_error = 'Push notification delivery failed: Invalid device token'
WHERE status = 'failed';