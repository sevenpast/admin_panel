-- ========================================
-- USER_SESSIONS - RLS Basis für Multi-Tenant
-- ========================================

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin', -- admin, staff, guest
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Ein User kann nur in einem Camp gleichzeitig aktiv sein
    UNIQUE(user_id, camp_id)
);

-- Performance Indizes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_camp_id ON user_sessions(camp_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, is_active);

-- Auto-Update Trigger
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: User sieht nur seine eigenen Sessions
CREATE POLICY user_sessions_own_data ON user_sessions
    FOR ALL
    USING (user_id = auth.uid());