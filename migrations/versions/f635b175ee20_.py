"""empty message

Revision ID: f635b175ee20
Revises: 
Create Date: 2023-12-30 13:59:41.122838

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f635b175ee20'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('daily_agent',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date', sa.Date(), nullable=True),
    sa.Column('agent_name', sa.String(length=80), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('date')
    )
    op.create_table('client_quiz_result',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('ip_address', sa.String(length=45), nullable=True),
    sa.Column('guesses', sa.Integer(), nullable=True),
    sa.Column('date', sa.DateTime(), nullable=True),
    sa.Column('daily_agent_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['daily_agent_id'], ['daily_agent.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sound_file',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('file_name', sa.String(length=120), nullable=False),
    sa.Column('difficulty', sa.String(length=20), nullable=True),
    sa.Column('map_name', sa.String(length=80), nullable=True),
    sa.Column('daily_agent_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['daily_agent_id'], ['daily_agent.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('sound_file')
    op.drop_table('client_quiz_result')
    op.drop_table('daily_agent')
    # ### end Alembic commands ###
