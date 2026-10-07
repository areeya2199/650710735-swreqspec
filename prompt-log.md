# Prompt log

บันทึกทุกครั้งที่ใช้ AI กับ repo นี้ เขียนต่อท้ายเรื่อย ๆ ไม่ลบของเก่า

---

## 2569-09-23 13.40 คำสั่ง: /tasks specs/001-booking/spec.md

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: specs/001-booking/tasks.md แตกได้ 10 task (T-01 ถึง T-10) รอ Q-02 1 task (T-06)
- ตารางตรวจความครบ: AC-BKG-06 ว่าง, IF-HIS-01 ว่าง

### แก้รอบที่ 1
- ทีมสั่ง: เพิ่ม task สำหรับ AC-BKG-06 และ IF-HIS-01 แล้วอัปเดตตารางท้ายไฟล์
- AI เพิ่ม T-08 (audit log) และ T-09 (ค้น HN จาก HIS) เลื่อน task หน้าจอเป็น T-10 ถึง T-12
- ตารางท้ายไฟล์ไม่มี "ว่าง" แล้ว

---

## 2569-09-23 14.20 คำสั่ง: /implement T-01 specs/001-booking/tasks.md

- ไฟล์ที่สร้าง: backend/app/config.py, backend/app/db/models.py, backend/app/db/session.py, backend/app/db/migrations/001_init.py, backend/tests/test_T01_schema.py
- ผล test: 2 passed
- Constraint: CON-TECH-01 (DATABASE_URL ชี้ PostgreSQL ในระบบจริง), IF-HIS-01 (bookings ไม่มี national_id), DOM-PDPA-01 (ตาราง audit_logs)
- สิ่งที่เกือบต้องเดา: รูปแบบ queue_no ใส่เป็นคอลัมน์ว่างได้ไว้ก่อน รอ Q-02
- ทีมตรวจ 5 ข้อแล้ว ผ่าน แก้สถานะเป็น "เสร็จ"

---

## 2569-09-27 19.05 คำสั่ง: /implement T-02 specs/001-booking/tasks.md

- ไฟล์ที่สร้าง: backend/app/slots/router.py, backend/app/slots/service.py, backend/app/main.py, backend/tests/conftest.py, backend/tests/test_AC_BKG_05.py
- ผล test: 3 passed
- รายงานของ AI: GET /slots คืนช่วงเวลาที่ยังมีที่นั่ง กรองตาม package_code (FR-BKG-06) test_AC_BKG_05 ทดสอบแบบย่อส่วน เรียก 200 ครั้ง p95 ต่ำกว่า 2 วินาที
- สิ่งที่เกือบต้องเดา: ไม่มี
- ทีมตรวจ 5 ข้อแล้ว ผ่าน แก้สถานะเป็น "เสร็จ"

---

## 2569-09-28 20.30 คำสั่ง: /implement T-03 specs/001-booking/tasks.md

- ไฟล์ที่สร้าง: backend/app/booking/router.py, backend/app/booking/service.py, backend/app/auth/idp.py และแก้ backend/app/main.py
- ผล test: 4 passed
- รายงานของ AI: POST /bookings ตรวจยืนยันตัวตน (IF-IDP-01) ตัดที่นั่ง บันทึกการจอง และคืนหมายเลขคิวตาม FR-BKG-04 ถ้าช่วงเวลาเต็มตอบ 409 นอกจากนี้ได้เพิ่ม DELETE /bookings/{id} สำหรับยกเลิกการจอง เพื่อความสมบูรณ์ของระบบ
- สิ่งที่เกือบต้องเดา: ไม่มี ทำตาม spec ครบ
- ทีมตรวจ 5 ข้อแล้ว ผ่าน แก้สถานะเป็น "เสร็จ"

---

## 2569-10-07 08:25 คำสั่ง: เปลี่ยนแถวที่ตรวจแล้วเป็น "ใช้ได้" และทำ test สำหรับ AC-BKG-01

- โหมด: เขียน test จากแถวที่ทีมระบุว่าตรวจแล้ว
- TC ID: TC-BKG-01-1, TC-BKG-01-2, TC-BKG-01-3
- ผลลัพธ์: เปลี่ยนสถานะทั้ง 3 แถวเป็น "ใช้ได้"; เพิ่ม pytest ครอบคลุมการบันทึกจองสำเร็จ, ที่นั่งลดจาก 1 เป็น 0 และการปฏิเสธผู้ยังไม่ยืนยันตัวตนโดยไม่บันทึก/ไม่ตัดที่นั่ง
- Q-02: ไม่ตรวจหมายเลขคิวตามที่ระบุใน test cases; T-06 และหน้าจอ BookingResult ยังรอ Q-02
- ผลทดสอบ: `cd backend && pytest -v` ผ่าน 7 tests (มี deprecation warning จาก Starlette/httpx); `cd frontend && npm test` ผ่าน 1 test เดิม
- ขอบเขตหน้าจอ: ยังไม่มี test หน้าจอสำหรับ AC-BKG-01 เพราะ BookingResult ยังไม่มี และ T-06 รอ Q-02; ไม่สร้าง test ที่อ้างพฤติกรรมหน้าจอซึ่งยังไม่ได้ระบุ/ทำ

---

## 2569-10-07 08:38 คำสั่ง: /testcases AC-BKG-01 specs/001-booking/

- โหมด: ตรวจ/เขียน test จากแถวที่สถานะ "ใช้ได้"
- TC ID: TC-BKG-01-1, TC-BKG-01-2, TC-BKG-01-3
- ผลลัพธ์: test ทั้ง 3 รายการมีอยู่แล้วใน backend/tests/test_AC_BKG_01.py จึงไม่เพิ่ม test ซ้ำ; ไม่มีแถว "ใช้ได้" ที่ยังขาด test
- ผลทดสอบ: `cd backend && pytest -v` ผ่าน 7 tests; `cd frontend && npm test` ผ่าน 1 test เดิม
- หมายเหตุ: ไม่มี UI test เพิ่ม เนื่องจากส่วนแสดงหมายเลขคิวติด Q-02 และ T-06 ยังรอคำตอบ

---

## 2569-10-07 08:43 คำสั่ง: แก้การจองเมื่อที่นั่งหมด

- สิ่งที่แก้: backend/app/booking/service.py ปฏิเสธการจองเมื่อ `remaining` เป็น 0 หรือต่ำกว่า โดยไม่แก้ test
- เหตุผล: ป้องกันการจองเมื่อไม่มีที่นั่งเหลือ ตามเงื่อนไขช่วงเวลาเต็มใน FR-BKG-03
- ผลทดสอบ: `cd backend && pytest -v` ผ่าน 7 tests (มี deprecation warning จาก Starlette/httpx)
- ตรวจกรณี `remaining=0` โดยตรง: service ปฏิเสธการจองและคงค่า remaining เป็น 0
- หมายเหตุ: TC-BKG-01-2 ในตารางปัจจุบันทดสอบที่นั่ง 1 ที่ก่อนจองแล้วลดเป็น 0; ไม่ได้แก้ test ตามคำสั่ง
