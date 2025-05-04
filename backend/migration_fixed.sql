-- Create enum types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scantype') THEN
        CREATE TYPE scantype AS ENUM ('vulnerability', 'network', 'web', 'api', 'mobile', 'cloud');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scanstatus') THEN
        CREATE TYPE scanstatus AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity') THEN
        CREATE TYPE severity AS ENUM ('high', 'medium', 'low', 'info');
    END IF;
END
$$;

-- Create user table
CREATE TABLE IF NOT EXISTS "user" (
    id VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (email)
);

-- Create index on user.email
CREATE INDEX IF NOT EXISTS ix_user_email ON "user" (email);

-- Create scan table
CREATE TABLE IF NOT EXISTS scan (
    id VARCHAR NOT NULL,
    target VARCHAR NOT NULL,
    scan_type scantype NOT NULL,
    description TEXT,
    config JSONB,
    status scanstatus NOT NULL,
    created_by VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(created_by) REFERENCES "user" (id)
);

-- Create indexes on scan
CREATE INDEX IF NOT EXISTS ix_scan_scan_type ON scan (scan_type);
CREATE INDEX IF NOT EXISTS ix_scan_status ON scan (status);
CREATE INDEX IF NOT EXISTS ix_scan_target ON scan (target);

-- Create finding table
CREATE TABLE IF NOT EXISTS finding (
    id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    severity severity NOT NULL,
    cvss_score FLOAT,
    cve_ids JSONB,
    affected_components JSONB,
    remediation TEXT,
    reference_urls JSONB,
    scan_id VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(scan_id) REFERENCES scan (id)
);

-- Create index on finding.severity
CREATE INDEX IF NOT EXISTS ix_finding_severity ON finding (severity);

-- Create scan_result table
CREATE TABLE IF NOT EXISTS scanresult (
    id VARCHAR NOT NULL,
    scan_id VARCHAR NOT NULL,
    high_count INTEGER NOT NULL DEFAULT 0,
    medium_count INTEGER NOT NULL DEFAULT 0,
    low_count INTEGER NOT NULL DEFAULT 0,
    info_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (scan_id),
    FOREIGN KEY(scan_id) REFERENCES scan (id)
);

-- Create association table for scan_result and finding
CREATE TABLE IF NOT EXISTS scan_result_finding (
    scan_result_id VARCHAR NOT NULL,
    finding_id VARCHAR NOT NULL,
    PRIMARY KEY (scan_result_id, finding_id),
    FOREIGN KEY(finding_id) REFERENCES finding (id),
    FOREIGN KEY(scan_result_id) REFERENCES scanresult (id)
);

-- Create Alembic version table if it doesn't exist
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR NOT NULL,
    PRIMARY KEY (version_num)
);

-- Insert Alembic version record
INSERT INTO alembic_version (version_num) VALUES ('9b8e62a8b4da');
