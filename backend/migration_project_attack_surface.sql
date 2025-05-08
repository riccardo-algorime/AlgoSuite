BEGIN;

-- Running upgrade 9b8e62a8b4da -> f73786ef3432

CREATE TYPE surfacetype AS ENUM ('web', 'api', 'mobile', 'network', 'cloud', 'iot', 'other');

CREATE TABLE project (
    id VARCHAR NOT NULL, 
    name VARCHAR NOT NULL, 
    description TEXT, 
    created_by VARCHAR NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(created_by) REFERENCES "user" (id)
);

CREATE INDEX ix_project_name ON project (name);

CREATE TABLE attacksurface (
    id VARCHAR NOT NULL, 
    project_id VARCHAR NOT NULL, 
    surface_type surfacetype NOT NULL, 
    description TEXT, 
    config JSON, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(project_id) REFERENCES project (id)
);

CREATE INDEX ix_attacksurface_project_id ON attacksurface (project_id);

CREATE INDEX ix_attacksurface_surface_type ON attacksurface (surface_type);

UPDATE alembic_version SET version_num='f73786ef3432' WHERE alembic_version.version_num = '9b8e62a8b4da';

COMMIT;
