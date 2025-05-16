# Database Migrations Guide

This document provides instructions for managing database migrations in the NestJS backend.

## Overview

We use TypeORM for database access and migrations. Migrations allow us to:

- Version control database schema changes
- Apply changes consistently across environments
- Roll back changes if needed
- Automate schema updates during deployments

## Prerequisites

- PostgreSQL database
- Node.js and npm
- Environment variables configured in `.env.{environment}` files

## Migration Commands

The following npm scripts are available for managing migrations:

- `npm run migration:generate` - Generate a migration based on entity changes
- `npm run migration:create` - Create a new empty migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert the most recent migration
- `npm run migration:show` - Show all migrations and their status

## Workflow

### 1. Creating a New Migration

When you make changes to entity files, generate a migration to apply those changes to the database:

```bash
# First, make sure your entity changes are saved
# Then, generate a migration with a descriptive name
npm run migration:generate -- src/migrations/add-user-profile
```

This will create a new migration file in the `src/migrations` directory with SQL statements to update the database
schema.

### 2. Running Migrations

To apply pending migrations to the database:

```bash
npm run migration:run
```

This should be done:

- During local development after pulling changes with new migrations
- As part of the deployment process in staging and production environments

### 3. Reverting Migrations

If you need to roll back a migration:

```bash
npm run migration:revert
```

This will revert the most recent migration. Run it multiple times to revert multiple migrations.

### 4. Creating Empty Migrations

For complex changes or data migrations, you may want to create an empty migration and write the SQL manually:

```bash
npm run migration:create -- src/migrations/seed-initial-data
```

Then edit the generated file to add your custom SQL statements.

## Best Practices

1. **Always generate migrations** - Don't use TypeORM's `synchronize: true` option in production as it can lead to data
   loss.

2. **Test migrations** - Always test migrations in a development or staging environment before applying them to
   production.

3. **Include both up and down methods** - Ensure your migrations can be reverted by implementing the `down` method.

4. **Use transactions** - Wrap complex migrations in transactions to ensure atomicity.

5. **Avoid direct schema manipulation** - Don't modify the database schema directly; always use migrations.

6. **Keep migrations small** - Create focused migrations that do one thing well rather than large migrations with many
   changes.

7. **Document complex migrations** - Add comments to explain the purpose and any special considerations for complex
   migrations.

## Troubleshooting

### Migration Failed to Apply

If a migration fails to apply:

1. Check the error message for details
2. Fix the issue in the migration file
3. If you've already run the migration partially, you may need to manually fix the database state
4. Run `npm run migration:run` again

### Migration Conflicts

If you have conflicts between migrations:

1. Ensure you're pulling the latest migrations from version control
2. Check the migrations table in the database to see which migrations have been applied
3. Coordinate with your team to resolve conflicts

## Example Migration

Here's an example of a migration file:

```typescript
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddUserProfile1698765432100 implements MigrationInterface {
    name = 'AddUserProfile1698765432100';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "user_profile" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "bio" text,
        "avatar_url" character varying,
        "user_id" uuid NOT NULL,
        CONSTRAINT "REL_51cb79b5555effaf7d69ba1cff" UNIQUE ("user_id"),
        CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id")
      );
    `);

        await queryRunner.query(`
      ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff" 
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff";
    `);

        await queryRunner.query(`
      DROP TABLE "user_profile";
    `);
    }
}
```