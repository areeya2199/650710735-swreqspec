from collections.abc import Generator
from importlib import import_module

import pytest
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session, sessionmaker

from app.db.models import Base


migration = import_module("app.db.migrations.001_init")


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """เตรียมฐานข้อมูลทดสอบสำหรับตารางของ T-01"""
    test_engine = create_engine("sqlite:///:memory:")
    migration.upgrade(test_engine)
    session_factory = sessionmaker(bind=test_engine)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        test_engine.dispose()


def test_t01_schema() -> None:
    """ตรวจว่าตารางหลักถูกสร้างและ bookings ไม่เก็บ national_id ตาม IF-HIS-01"""
    test_engine = create_engine("sqlite:///:memory:")
    migration.upgrade(test_engine)
    table_names = set(inspect(test_engine).get_table_names())
    booking_columns = {
        column["name"] for column in inspect(test_engine).get_columns("bookings")
    }
    assert {"slots", "bookings", "audit_logs"} <= table_names
    assert "national_id" not in booking_columns
    test_engine.dispose()