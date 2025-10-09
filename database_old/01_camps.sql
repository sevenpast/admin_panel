-- ========================================
-- CAMPS - Multi-Tenant Basis
-- ========================================

CREATE TABLE camps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Index
CREATE INDEX idx_camps_active ON camps(is_active) WHERE is_active = true;

-- Auto-Update Trigger Function (wird von allen Tabellen verwendet)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-Update Trigger
CREATE TRIGGER update_camps_updated_at
    BEFORE UPDATE ON camps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Demo Camp
INSERT INTO camps (name, timezone) VALUES ('Demo Camp', 'Europe/Berlin');