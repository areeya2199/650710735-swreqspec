# test ของ T-03: จองคิวสำเร็จ
# AC-BKG-01 (FR-BKG-04)
from app.db.models import Booking
from tests.conftest import AUTH


def test_AC_BKG_01(client, make_slot):
    """AC-BKG-01: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง จองแล้วต้องสำเร็จ"""
    slot = make_slot(start="09:00", remaining=1)

    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    assert res.status_code == 201


def test_TC_BKG_01_1_booking_success(client, db, make_slot):
    # Given ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่ และผู้รับบริการเลือกช่วงเวลา 09.00 น.
    slot = make_slot(start="09:00", remaining=1)

    # When ยืนยันการจอง
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then บันทึกสำเร็จ
    assert res.status_code == 201
    assert db.query(Booking).count() == 1
    # Then แสดงหมายเลขคิว (รอ Q-02)
    # ยังไม่ตรวจหมายเลขคิว เพราะรูปแบบและวิธีออกเลขยังรอ Q-02
    # Then ที่นั่งว่างของช่วงนั้นเป็น 0
    db.refresh(slot)
    assert slot.remaining == 0


def test_TC_BKG_01_2_booking_exact_capacity(client, db, make_slot):
    # Given ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่างตรงพอดี 1 ที่ (ก่อนยืนยันการจอง)
    slot = make_slot(start="09:00", remaining=1)

    # When ยืนยันการจองในช่วงเวลา 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then การจองถูกบันทึกสำเร็จ
    assert res.status_code == 201
    assert db.query(Booking).count() == 1
    # Then แสดงหมายเลขคิว (รอ Q-02)
    # ยังไม่ตรวจหมายเลขคิว เพราะรูปแบบและวิธีออกเลขยังรอ Q-02
    # Then ที่นั่งว่างของช่วงนั้นลดจาก 1 เป็น 0
    db.refresh(slot)
    assert slot.remaining == 0


def test_TC_BKG_01_3_unverified_user_rejected(client, db, make_slot):
    # Given ยังไม่ได้ยืนยันตัวตน และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1)

    # When พยายามยืนยันการจอง
    res = client.post("/bookings", json={"slot_id": slot.id})

    # Then ไม่บันทึกการจอง
    assert db.query(Booking).count() == 0
    # Then ไม่ลดจำนวนที่นั่งของช่วงนั้น
    db.refresh(slot)
    assert slot.remaining == 1
    # Then ปฏิเสธการเข้าถึงตาม IF-IDP-01
    assert res.status_code == 401
