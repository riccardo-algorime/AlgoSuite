BEGIN;

-- Create asset table
CREATE TABLE asset (
    id VARCHAR NOT NULL, 
    name VARCHAR NOT NULL, 
    asset_type VARCHAR NOT NULL, 
    description TEXT, 
    asset_metadata JSON, 
    attack_surface_id VARCHAR NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(attack_surface_id) REFERENCES attacksurface (id)
);

-- Create indexes
CREATE INDEX ix_asset_name ON asset (name);
CREATE INDEX ix_asset_asset_type ON asset (asset_type);
CREATE INDEX ix_asset_attack_surface_id ON asset (attack_surface_id);

-- Update alembic version
UPDATE alembic_version SET version_num='65450b0b8ab3' WHERE alembic_version.version_num = 'ba51f505e0bb';

COMMIT;
