"""Create initial models

Revision ID: 9b8e62a8b4da
Revises:
Create Date: 2025-05-02 22:32:48.693591

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '9b8e62a8b4da'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create enum types
    try:
        # Try to get the connection and check for existing enums
        connection = op.get_bind()

        # Check if we're in offline mode
        if not hasattr(connection, 'engine'):
            # We're in offline mode, just create the enums
            scan_type = postgresql.ENUM('vulnerability', 'network', 'web', 'api', 'mobile', 'cloud', name='scantype')
            scan_type.create(connection)

            scan_status = postgresql.ENUM('pending', 'running', 'completed', 'failed', 'cancelled', name='scanstatus')
            scan_status.create(connection)

            severity = postgresql.ENUM('high', 'medium', 'low', 'info', name='severity')
            severity.create(connection)
        else:
            # We're in online mode, check for existing enums
            inspector = sa.inspect(connection)
            existing_enums = inspector.get_enums()
            existing_enum_names = [enum['name'] for enum in existing_enums]

            if 'scantype' not in existing_enum_names:
                scan_type = postgresql.ENUM('vulnerability', 'network', 'web', 'api', 'mobile', 'cloud', name='scantype')
                scan_type.create(connection)

            if 'scanstatus' not in existing_enum_names:
                scan_status = postgresql.ENUM('pending', 'running', 'completed', 'failed', 'cancelled', name='scanstatus')
                scan_status.create(connection)

            if 'severity' not in existing_enum_names:
                severity = postgresql.ENUM('high', 'medium', 'low', 'info', name='severity')
                severity.create(connection)
    except Exception as e:
        # If there's an error, just create the enums
        scan_type = postgresql.ENUM('vulnerability', 'network', 'web', 'api', 'mobile', 'cloud', name='scantype')
        scan_type.create(op.get_bind())

        scan_status = postgresql.ENUM('pending', 'running', 'completed', 'failed', 'cancelled', name='scanstatus')
        scan_status.create(op.get_bind())

        severity = postgresql.ENUM('high', 'medium', 'low', 'info', name='severity')
        severity.create(op.get_bind())

    # Create user table
    op.create_table(
        'user',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_superuser', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)

    # Create scan table
    op.create_table(
        'scan',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('target', sa.String(), nullable=False),
        sa.Column('scan_type', sa.Enum('vulnerability', 'network', 'web', 'api', 'mobile', 'cloud', name='scantype'), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('config', sa.JSON(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'running', 'completed', 'failed', 'cancelled', name='scanstatus'), nullable=False),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_scan_scan_type'), 'scan', ['scan_type'], unique=False)
    op.create_index(op.f('ix_scan_status'), 'scan', ['status'], unique=False)
    op.create_index(op.f('ix_scan_target'), 'scan', ['target'], unique=False)

    # Create finding table
    op.create_table(
        'finding',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.Enum('high', 'medium', 'low', 'info', name='severity'), nullable=False),
        sa.Column('cvss_score', sa.Float(), nullable=True),
        sa.Column('cve_ids', sa.JSON(), nullable=True),
        sa.Column('affected_components', sa.JSON(), nullable=True),
        sa.Column('remediation', sa.Text(), nullable=True),
        sa.Column('references', sa.JSON(), nullable=True),
        sa.Column('scan_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['scan_id'], ['scan.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_finding_severity'), 'finding', ['severity'], unique=False)

    # Create scan_result table
    op.create_table(
        'scanresult',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('scan_id', sa.String(), nullable=False),
        sa.Column('high_count', sa.Integer(), nullable=False, default=0),
        sa.Column('medium_count', sa.Integer(), nullable=False, default=0),
        sa.Column('low_count', sa.Integer(), nullable=False, default=0),
        sa.Column('info_count', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['scan_id'], ['scan.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('scan_id')
    )

    # Create association table for scan_result and finding
    op.create_table(
        'scan_result_finding',
        sa.Column('scan_result_id', sa.String(), nullable=False),
        sa.Column('finding_id', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['finding_id'], ['finding.id'], ),
        sa.ForeignKeyConstraint(['scan_result_id'], ['scanresult.id'], ),
        sa.PrimaryKeyConstraint('scan_result_id', 'finding_id')
    )


def downgrade():
    # Drop tables
    op.drop_table('scan_result_finding')
    op.drop_table('scanresult')
    op.drop_table('finding')
    op.drop_table('scan')
    op.drop_table('user')

    # Drop enum types
    try:
        # Try to get the connection and check for existing enums
        connection = op.get_bind()

        # Check if we're in offline mode
        if not hasattr(connection, 'engine'):
            # We're in offline mode, just drop the enums
            op.execute('DROP TYPE IF EXISTS severity')
            op.execute('DROP TYPE IF EXISTS scanstatus')
            op.execute('DROP TYPE IF EXISTS scantype')
        else:
            # We're in online mode, check for existing enums
            inspector = sa.inspect(connection)
            existing_enums = inspector.get_enums()
            existing_enum_names = [enum['name'] for enum in existing_enums]

            if 'severity' in existing_enum_names:
                op.execute('DROP TYPE severity')

            if 'scanstatus' in existing_enum_names:
                op.execute('DROP TYPE scanstatus')

            if 'scantype' in existing_enum_names:
                op.execute('DROP TYPE scantype')
    except Exception:
        # If there's an error, just try to drop the enums
        op.execute('DROP TYPE IF EXISTS severity')
        op.execute('DROP TYPE IF EXISTS scanstatus')
        op.execute('DROP TYPE IF EXISTS scantype')
