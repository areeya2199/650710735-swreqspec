from sqlalchemy.engine import Engine

from app.db.models import Base


def upgrade(engine: Engine) -> None:
    """สร้างตาราง slots, bookings และ audit_logs ตาม CON-TECH-01 และ DOM-PDPA-01"""
    Base.metadata.create_all(engine)