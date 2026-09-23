# Tasks: จองคิวตรวจสุขภาพ (Booking)

- Feature: จองคิวตรวจสุขภาพ (Booking)
- Spec ID: SPEC-BKG-001
- อ้างอิง: [plan.md](plan.md)
- วันที่: 2569-09-23
- สรุป: มีทั้งหมด 16 task โดยเรียงจากโครงสร้างข้อมูลและบริการไปยังหน้าจอและการทดสอบ
- มี 2 task ที่ต้องรอ Open Question Q-02 เรื่องรูปแบบและวิธีออกหมายเลขคิว

### T-01 สร้างตารางและ migration
- รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01, FR-BKG-01, FR-BKG-02, FR-BKG-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03, T-04 และ T-08
- ไฟล์ที่แตะ: `backend/app/db/models.py`, `backend/app/db/session.py`, `backend/app/db/migrations/001_init.py`, `backend/tests/conftest.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง `slots`, `bookings` และ `audit_logs` ได้ และตาราง `bookings` ไม่มี `national_id`
- สถานะ: พร้อมทำ

### T-02 ตรวจผลยืนยันตัวตนก่อนเข้าถึงข้อมูล
- รองรับ: IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ endpoint ทุกตัว
- ไฟล์ที่แตะ: `backend/app/auth/idp.py`, `backend/app/main.py`, `backend/tests/test_idp.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: request ที่ไม่มีผลยืนยันตัวตนถูกปฏิเสธ และ request ที่ยืนยันแล้วผ่าน dependency ได้
- สถานะ: พร้อมทำ

### T-03 สร้างบริการค้นหาช่วงเวลาว่าง
- รองรับ: FR-BKG-01, FR-BKG-06, ASM-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/app/slots/router.py`, `backend/tests/test_slots.py`
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `GET /slots` คืนช่วงเวลาภายใน 30 วันพร้อม `remaining` และเปลี่ยนผลลัพธ์ตาม `package_code` ได้
- สถานะ: พร้อมทำ

### T-04 บันทึกการจองและตัดที่นั่ง
- รองรับ: FR-BKG-04, IF-HIS-01
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_01.py`
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `POST /bookings` บันทึก booking และลด `remaining` จาก 1 เป็น 0 ได้ พร้อมคืนหมายเลขคิวตาม Q-02
- สถานะ: รอ Q-02

### T-05 ป้องกันการจองซ้ำในวันเดียวกัน
- รองรับ: FR-BKG-02, ASM-02
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_02.py`
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: การจองซ้ำของ HN ในวันเดียวกันถูกปฏิเสธและ response แสดงหมายเลขคิวเดิม
- สถานะ: รอ Q-02

### T-06 จัดการช่วงเวลาเต็มและหาช่วงใกล้เคียง
- รองรับ: FR-BKG-03, ASM-02
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_03.py`
- ต้องทำหลัง: T-03, T-04
- เสร็จเมื่อ: เมื่อช่วงเวลาเต็ม API ตอบ 409 พร้อม 3 ช่วงที่ใกล้ที่สุดในวันเดียวกัน/วันถัดไป และไม่สร้าง booking ใหม่
- สถานะ: พร้อมทำ

### T-07 วางคิวและส่งข้อความซ้ำ
- รองรับ: FR-BKG-05, IF-NOT-01, NFR-REL-02, ASM-03
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: `backend/app/notify/queue.py`, `backend/app/booking/service.py`, `backend/tests/test_AC_BKG_04.py`
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: การบันทึก booking ไม่รอผลแจ้งเตือน และงานที่ส่งไม่สำเร็จถูกกำหนดส่งซ้ำภายใน 5 นาทีตามจำนวนครั้งใน ASM-03
- สถานะ: พร้อมทำ

### T-08 บันทึก audit log การเข้าถึง
- รองรับ: DOM-PDPA-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: `backend/app/audit/middleware.py`, `backend/app/main.py`, `backend/tests/test_AC_BKG_06.py`
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: การเปิดดูข้อมูลการจองสร้าง audit log ที่มีผู้เข้าถึง เวลา และ HN และตั้ง retention ไม่น้อยกว่า 1 ปีตามระบบฐานข้อมูล
- สถานะ: พร้อมทำ

### T-09 ค้น HN จาก HIS
- รองรับ: IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04
- ไฟล์ที่แตะ: `backend/app/his/client.py`, `backend/app/main.py`, `backend/tests/test_his.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `GET /patients/lookup` ส่งเลขบัตรไปยัง HIS และคืน HN โดยไม่บันทึกเลขบัตรประชาชนใน booking
- สถานะ: พร้อมทำ

### T-10 บังคับการรับส่งข้อมูลด้วย TLS
- รองรับ: NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของการเปิด API
- ไฟล์ที่แตะ: `backend/app/config.py`, `backend/app/main.py`, `backend/tests/test_tls_config.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: การตั้งค่า API ระบุและตรวจสอบการใช้ TLS 1.2 ขึ้นไปสำหรับข้อมูลการจองได้
- สถานะ: พร้อมทำ

### T-11 สร้างหน้าจอเลือกแพ็กเกจและเวลา
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-12 และ T-15
- ไฟล์ที่แตะ: `frontend/src/pages/SlotPicker.jsx`, `frontend/src/api/client.js`, `frontend/src/App.jsx`, `frontend/src/__tests__/SlotPicker.test.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าจอแสดงช่วงเวลาและที่นั่งคงเหลือจาก API จำลอง และโหลดผลลัพธ์ใหม่เมื่อเปลี่ยนแพ็กเกจ
- สถานะ: พร้อมทำ

### T-12 สร้างหน้ายืนยันและแจ้งช่วงเวลาเต็ม
- รองรับ: FR-BKG-03, FR-BKG-04
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/AC-BKG-03.test.jsx`
- ต้องทำหลัง: T-11
- เสร็จเมื่อ: เมื่อ API จำลองตอบ 409 หน้าจอแสดงข้อความ "ช่วงเวลาเต็ม" และตัวเลือกช่วงเวลาว่าง 3 รายการ
- สถานะ: พร้อมทำ

### T-13 สร้างหน้าผลการจอง
- รองรับ: FR-BKG-04, FR-BKG-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-15
- ไฟล์ที่แตะ: `frontend/src/pages/BookingResult.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/BookingResult.test.jsx`
- ต้องทำหลัง: T-12
- เสร็จเมื่อ: หน้าจอแสดงหมายเลขคิวเมื่อจองสำเร็จ รวมถึงกรณีแจ้งเตือนส่งไม่สำเร็จ ตาม Q-02
- สถานะ: รอ Q-02

### T-14 ทดสอบประสิทธิภาพค้นหาช่วงเวลา
- รองรับ: NFR-PERF-01, FR-BKG-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: `backend/tests/test_AC_BKG_05.py`
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: การทดสอบแบบจำลองผู้ใช้พร้อมกัน 200 คนวัด p95 ของ `GET /slots` ได้ไม่เกิน 2 วินาที
- สถานะ: พร้อมทำ

### T-15 ต่อหน้าจอกับ API จริง
- รองรับ: FR-BKG-01, FR-BKG-03, FR-BKG-04, FR-BKG-05, IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานรวมของ AC-BKG-01, AC-BKG-03 และ AC-BKG-04
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/App.jsx`, `frontend/src/pages/SlotPicker.jsx`, `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/pages/BookingResult.jsx`
- ต้องทำหลัง: T-03, T-04, T-06, T-07, T-11, T-12, T-13
- เสร็จเมื่อ: หน้าจอเรียก endpoint จริงผ่าน `/api` และแสดงผลสำเร็จ/เต็ม/แจ้งเตือนไม่สำเร็จตามสัญญา API ใน plan.md
- สถานะ: รอ Q-02

### T-16 ประเมินเวลาจองของผู้ใช้ใหม่
- รองรับ: NFR-USE-01, ASM-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นการตรวจ NFR-USE-01
- ไฟล์ที่แตะ: `frontend/src/__tests__/NFR-USE-01.test.jsx`
- ต้องทำหลัง: T-15
- เสร็จเมื่อ: ผู้ทดสอบใหม่ 10 คนอย่างน้อย 8 คนจองสำเร็จภายใน 3 นาทีโดยไม่ขอความช่วยเหลือ
- สถานะ: รอ Q-02

## ตารางตรวจความครบ: Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-04 |
| AC-BKG-02 | T-05 |
| AC-BKG-03 | T-06, T-12 |
| AC-BKG-04 | T-07 |
| AC-BKG-05 | T-14 |
| AC-BKG-06 | T-08 |

## ตารางตรวจความครบ: Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01 |
| DOM-PDPA-01 | T-01, T-08 |
| IF-IDP-01 | T-02, T-15 |
| IF-HIS-01 | T-01, T-04, T-09 |
| IF-NOT-01 | T-07 |

## สิ่งที่ยังไม่ทำ

- Q-02 หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง และมีรูปแบบอย่างไร (เช่น A001)? ต้องถามเจ้าหน้าที่เวชระเบียน
- task ที่รอ Q-02: T-04, T-05, T-13, T-15, T-16
- ส่วนที่เกี่ยวข้องกับวิธีออกและการแสดงหมายเลขคิวจะยังไม่สรุปจนกว่าจะได้คำตอบ Q-02
