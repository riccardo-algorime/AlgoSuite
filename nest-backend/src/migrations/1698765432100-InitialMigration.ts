import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1698765432100 implements MigrationInterface {
  name = 'InitialMigration1698765432100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This is a sample migration script
    // In a real scenario, you would generate this using the migration:generate script
    // which would automatically create the SQL statements based on your entity definitions

    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."surface_type_enum" AS ENUM('web', 'api', 'mobile', 'network', 'cloud', 'iot', 'other');
      CREATE TYPE "public"."asset_type_enum" AS ENUM('server', 'website', 'database', 'application', 'endpoint', 'container', 'network_device', 'cloud_resource', 'other');
      CREATE TYPE "public"."scan_type_enum" AS ENUM('vulnerability', 'network', 'web', 'api', 'mobile', 'cloud');
      CREATE TYPE "public"."scan_status_enum" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');
      CREATE TYPE "public"."severity_enum" AS ENUM('high', 'medium', 'low', 'info');
    `);

    // Create tables
    await queryRunner.query(`
            CREATE TABLE "user"
            (
                "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
                "created_at"   TIMESTAMP         NOT NULL DEFAULT now(),
                "updated_at"   TIMESTAMP         NOT NULL DEFAULT now(),
                "email"        character varying NOT NULL,
                "first_name"   character varying NOT NULL,
                "last_name"    character varying NOT NULL,
                "password"     character varying NOT NULL,
                "is_active"    boolean           NOT NULL DEFAULT true,
                "is_superuser" boolean           NOT NULL DEFAULT false,
                "roles"        text              NOT NULL DEFAULT 'user',
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            );

            CREATE TABLE "project"
            (
                "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
                "created_at"  TIMESTAMP         NOT NULL DEFAULT now(),
                "updated_at"  TIMESTAMP         NOT NULL DEFAULT now(),
                "name"        character varying NOT NULL,
                "description" text,
                "created_by"  uuid              NOT NULL,
                CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id")
            );

            CREATE TABLE "attack_surface"
            (
                "id"           uuid                         NOT NULL DEFAULT uuid_generate_v4(),
                "created_at"   TIMESTAMP                    NOT NULL DEFAULT now(),
                "updated_at"   TIMESTAMP                    NOT NULL DEFAULT now(),
                "project_id"   uuid                         NOT NULL,
                "surface_type" "public"."surface_type_enum" NOT NULL DEFAULT 'web',
                "description"  text,
                "config"       json,
                CONSTRAINT "PK_9f5f1afb1a2b8e5e9b2b1f5f1a" PRIMARY KEY ("id")
            );

            CREATE TABLE "asset"
            (
                "id"                uuid                       NOT NULL DEFAULT uuid_generate_v4(),
                "created_at"        TIMESTAMP                  NOT NULL DEFAULT now(),
                "updated_at"        TIMESTAMP                  NOT NULL DEFAULT now(),
                "name"              character varying          NOT NULL,
                "asset_type"        "public"."asset_type_enum" NOT NULL DEFAULT 'server',
                "description"       text,
                "asset_metadata"    json,
                "attack_surface_id" uuid                       NOT NULL,
                CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id")
            );

            CREATE TABLE "scan"
            (
                "id"          uuid                        NOT NULL DEFAULT uuid_generate_v4(),
                "created_at"  TIMESTAMP                   NOT NULL DEFAULT now(),
                "updated_at"  TIMESTAMP                   NOT NULL DEFAULT now(),
                "target"      character varying           NOT NULL,
                "scan_type"   "public"."scan_type_enum"   NOT NULL DEFAULT 'vulnerability',
                "description" text,
                "config"      json,
                "status"      "public"."scan_status_enum" NOT NULL DEFAULT 'pending',
                "created_by"  uuid                        NOT NULL,
                CONSTRAINT "PK_df35de87a8a3d75789e2e9c82c9" PRIMARY KEY ("id")
            );

            CREATE TABLE "scan_result"
            (
                "id"           uuid      NOT NULL DEFAULT uuid_generate_v4(),
                "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at"   TIMESTAMP NOT NULL DEFAULT now(),
                "scan_id"      uuid      NOT NULL,
                "high_count"   integer   NOT NULL DEFAULT 0,
                "medium_count" integer   NOT NULL DEFAULT 0,
                "low_count"    integer   NOT NULL DEFAULT 0,
                "info_count"   integer   NOT NULL DEFAULT 0,
                CONSTRAINT "UQ_9f5f1afb1a2b8e5e9b2b1f5f1b" UNIQUE ("scan_id"),
                CONSTRAINT "PK_9f5f1afb1a2b8e5e9b2b1f5f1c" PRIMARY KEY ("id")
            );

            CREATE TABLE "finding"
            (
                "id"                  uuid                     NOT NULL DEFAULT uuid_generate_v4(),
                "created_at"          TIMESTAMP                NOT NULL DEFAULT now(),
                "updated_at"          TIMESTAMP                NOT NULL DEFAULT now(),
                "title"               character varying        NOT NULL,
                "description"         text                     NOT NULL,
                "severity"            "public"."severity_enum" NOT NULL DEFAULT 'low',
                "cvss_score"          real,
                "cve_ids"             json,
                "affected_components" json,
                "remediation"         text,
                "references"          json,
                "scan_id"             uuid                     NOT NULL,
                CONSTRAINT "PK_9f5f1afb1a2b8e5e9b2b1f5f1d" PRIMARY KEY ("id")
            );

            CREATE TABLE "scan_result_findings"
            (
                "scan_result_id" uuid NOT NULL,
                "finding_id"     uuid NOT NULL,
                CONSTRAINT "PK_9f5f1afb1a2b8e5e9b2b1f5f1e" PRIMARY KEY ("scan_result_id", "finding_id")
            );
        `);

    // Create indexes
    await queryRunner.query(`
            CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e22" ON "user" ("email");
            CREATE INDEX "IDX_4d68b1358bb5b766d3e78f32f57" ON "project" ("name");
            CREATE INDEX "IDX_9f5f1afb1a2b8e5e9b2b1f5f1a" ON "attack_surface" ("project_id");
            CREATE INDEX "IDX_9f5f1afb1a2b8e5e9b2b1f5f1b" ON "attack_surface" ("surface_type");
            CREATE INDEX "IDX_1209d107fe21482beaea51b745e" ON "asset" ("name");
            CREATE INDEX "IDX_1209d107fe21482beaea51b745f" ON "asset" ("asset_type");
            CREATE INDEX "IDX_1209d107fe21482beaea51b7460" ON "asset" ("attack_surface_id");
            CREATE INDEX "IDX_df35de87a8a3d75789e2e9c82c9" ON "scan" ("target");
            CREATE INDEX "IDX_df35de87a8a3d75789e2e9c82ca" ON "scan" ("scan_type");
            CREATE INDEX "IDX_df35de87a8a3d75789e2e9c82cb" ON "scan" ("status");
            CREATE INDEX "IDX_9f5f1afb1a2b8e5e9b2b1f5f1d" ON "finding" ("severity");
        `);

    // Create foreign keys
    await queryRunner.query(`
            ALTER TABLE "project"
                ADD CONSTRAINT "FK_4d68b1358bb5b766d3e78f32f57" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE "attack_surface"
                ADD CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1a" FOREIGN KEY ("project_id") REFERENCES "project" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "asset"
                ADD CONSTRAINT "FK_1209d107fe21482beaea51b7460" FOREIGN KEY ("attack_surface_id") REFERENCES "attack_surface" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "scan"
                ADD CONSTRAINT "FK_df35de87a8a3d75789e2e9c82c9" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE "scan_result"
                ADD CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1b" FOREIGN KEY ("scan_id") REFERENCES "scan" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "finding"
                ADD CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1d" FOREIGN KEY ("scan_id") REFERENCES "scan" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "scan_result_findings"
                ADD CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1e" FOREIGN KEY ("scan_result_id") REFERENCES "scan_result" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "scan_result_findings"
                ADD CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1f" FOREIGN KEY ("finding_id") REFERENCES "finding" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`
            ALTER TABLE "scan_result_findings" DROP CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1f";
            ALTER TABLE "scan_result_findings" DROP CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1e";
            ALTER TABLE "finding" DROP CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1d";
            ALTER TABLE "scan_result" DROP CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1b";
            ALTER TABLE "scan" DROP CONSTRAINT "FK_df35de87a8a3d75789e2e9c82c9";
            ALTER TABLE "asset" DROP CONSTRAINT "FK_1209d107fe21482beaea51b7460";
            ALTER TABLE "attack_surface" DROP CONSTRAINT "FK_9f5f1afb1a2b8e5e9b2b1f5f1a";
            ALTER TABLE "project" DROP CONSTRAINT "FK_4d68b1358bb5b766d3e78f32f57";
        `);

    // Drop tables
    await queryRunner.query(`
            DROP TABLE "scan_result_findings";
            DROP TABLE "finding";
            DROP TABLE "scan_result";
            DROP TABLE "scan";
            DROP TABLE "asset";
            DROP TABLE "attack_surface";
            DROP TABLE "project";
            DROP TABLE "user";
        `);

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE "public"."severity_enum";
      DROP TYPE "public"."scan_status_enum";
      DROP TYPE "public"."scan_type_enum";
      DROP TYPE "public"."asset_type_enum";
      DROP TYPE "public"."surface_type_enum";
    `);
  }
}
