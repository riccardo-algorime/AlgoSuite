"""create_asset_table

Revision ID: 65450b0b8ab3
Revises: ba51f505e0bb
Create Date: 2025-05-10 12:07:37.421595

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '65450b0b8ab3'
down_revision = 'ba51f505e0bb'
branch_labels = None
depends_on = None


def upgrade():
    # Create asset table
    op.create_table(
        'asset',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('asset_type', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('asset_metadata', sa.JSON(), nullable=True),
        sa.Column('attack_surface_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['attack_surface_id'], ['attacksurface.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_asset_name'), 'asset', ['name'], unique=False)
    op.create_index(op.f('ix_asset_asset_type'), 'asset', ['asset_type'], unique=False)
    op.create_index(op.f('ix_asset_attack_surface_id'), 'asset', ['attack_surface_id'], unique=False)


def downgrade():
    # Drop asset table
    op.drop_index(op.f('ix_asset_attack_surface_id'), table_name='asset')
    op.drop_index(op.f('ix_asset_asset_type'), table_name='asset')
    op.drop_index(op.f('ix_asset_name'), table_name='asset')
    op.drop_table('asset')
