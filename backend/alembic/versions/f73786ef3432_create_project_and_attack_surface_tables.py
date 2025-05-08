"""create project and attack surface tables

Revision ID: f73786ef3432
Revises: 9b8e62a8b4da
Create Date: 2025-05-05 21:58:19.590878

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'f73786ef3432'
down_revision = '9b8e62a8b4da'
branch_labels = None
depends_on = None


def upgrade():
    # Create enum type for surface_type
    try:
        # Try to get the connection and check for existing enums
        connection = op.get_bind()

        # Check if we're in offline mode
        if not hasattr(connection, 'engine'):
            # We're in offline mode, just create the enum
            surface_type = postgresql.ENUM('web', 'api', 'mobile', 'network', 'cloud', 'iot', 'other', name='surfacetype')
            surface_type.create(connection)
        else:
            # We're in online mode, check for existing enums
            inspector = sa.inspect(connection)
            existing_enums = inspector.get_enums()
            existing_enum_names = [enum['name'] for enum in existing_enums]

            if 'surfacetype' not in existing_enum_names:
                surface_type = postgresql.ENUM('web', 'api', 'mobile', 'network', 'cloud', 'iot', 'other', name='surfacetype')
                surface_type.create(connection)
    except Exception as e:
        # If there's an error, just create the enum
        surface_type = postgresql.ENUM('web', 'api', 'mobile', 'network', 'cloud', 'iot', 'other', name='surfacetype')
        surface_type.create(op.get_bind())

    # Create project table
    op.create_table(
        'project',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_name'), 'project', ['name'], unique=False)

    # Create attack_surface table
    op.create_table(
        'attacksurface',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('project_id', sa.String(), nullable=False),
        sa.Column('surface_type', sa.Enum('web', 'api', 'mobile', 'network', 'cloud', 'iot', 'other', name='surfacetype'), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('config', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['project.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_attacksurface_project_id'), 'attacksurface', ['project_id'], unique=False)
    op.create_index(op.f('ix_attacksurface_surface_type'), 'attacksurface', ['surface_type'], unique=False)


def downgrade():
    # Drop tables
    op.drop_index(op.f('ix_attacksurface_surface_type'), table_name='attacksurface')
    op.drop_index(op.f('ix_attacksurface_project_id'), table_name='attacksurface')
    op.drop_table('attacksurface')
    op.drop_index(op.f('ix_project_name'), table_name='project')
    op.drop_table('project')

    # Drop enum type
    try:
        # Try to get the connection and check for existing enums
        connection = op.get_bind()

        # Check if we're in offline mode
        if not hasattr(connection, 'engine'):
            # We're in offline mode, just drop the enum
            op.execute('DROP TYPE IF EXISTS surfacetype')
        else:
            # We're in online mode, check for existing enums
            inspector = sa.inspect(connection)
            existing_enums = inspector.get_enums()
            existing_enum_names = [enum['name'] for enum in existing_enums]

            if 'surfacetype' in existing_enum_names:
                op.execute('DROP TYPE surfacetype')
    except Exception:
        # If there's an error, just try to drop the enum
        op.execute('DROP TYPE IF EXISTS surfacetype')
