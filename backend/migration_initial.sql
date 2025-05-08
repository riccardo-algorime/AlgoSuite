BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 9b8e62a8b4da

CREATE TYPE scantype AS ENUM ('vulnerability', 'network', 'web', 'api', 'mobile', 'cloud');

CREATE TYPE scanstatus AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

CREATE TYPE severity AS ENUM ('high', 'medium', 'low', 'info');

CREATE TABLE "user" (
    id VARCHAR NOT NULL, 
    email VARCHAR NOT NULL, 
    hashed_password VARCHAR NOT NULL, 
    full_name VARCHAR, 
    is_active BOOLEAN NOT NULL, 
    is_superuser BOOLEAN NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (email)
);

CREATE UNIQUE INDEX ix_user_email ON "user" (email);

CREATE TABLE scan (
    id VARCHAR NOT NULL, 
    target VARCHAR NOT NULL, 
    scan_type scantype NOT NULL, 
    description TEXT, 
    config JSON, 
    status scanstatus NOT NULL, 
    created_by VARCHAR NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(created_by) REFERENCES "user" (id)
);

CREATE INDEX ix_scan_scan_type ON scan (scan_type);

CREATE INDEX ix_scan_status ON scan (status);

CREATE INDEX ix_scan_target ON scan (target);

CREATE TABLE finding (
    id VARCHAR NOT NULL, 
    title VARCHAR NOT NULL, 
    description TEXT NOT NULL, 
    severity severity NOT NULL, 
    cvss_score FLOAT, 
    cve_ids JSON, 
    affected_components JSON, 
    remediation TEXT, 
    "references" JSON, 
    scan_id VARCHAR NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(scan_id) REFERENCES scan (id)
);

CREATE INDEX ix_finding_severity ON finding (severity);

CREATE TABLE scanresult (
    id VARCHAR NOT NULL, 
    scan_id VARCHAR NOT NULL, 
    high_count INTEGER NOT NULL, 
    medium_count INTEGER NOT NULL, 
    low_count INTEGER NOT NULL, 
    info_count INTEGER NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(scan_id) REFERENCES scan (id), 
    UNIQUE (scan_id)
);

CREATE TABLE scan_result_finding (
    scan_result_id VARCHAR NOT NULL, 
    finding_id VARCHAR NOT NULL, 
    PRIMARY KEY (scan_result_id, finding_id), 
    FOREIGN KEY(finding_id) REFERENCES finding (id), 
    FOREIGN KEY(scan_result_id) REFERENCES scanresult (id)
);

INSERT INTO alembic_version (version_num) VALUES ('9b8e62a8b4da');

COMMIT;
