# RTM: จองคิวตรวจสุขภาพ (Booking)
อ้างอิง: spec.md SPEC-BKG-001 Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-07 08:52 | test: 7 ผ่าน 0 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-BKG-01 | AC-BKG-05 อ้างใน Traceability แต่ตรวจเฉพาะ performance | T-02 เสร็จ | `backend/app/slots/router.py:get_slots`; `backend/app/slots/service.py:list_available_slots` | `test_AC_BKG_05` ผ่าน แต่ไม่ตรวจช่วงเวลา/ที่นั่งที่คืนมา; ขาด AC ที่ตรวจ behavior (F-06) | ช่องโหว่ |
| FR-BKG-02 | AC-BKG-02 | T-04 พร้อมทำ | ยังไม่พบการปฏิเสธการจองซ้ำหรือส่งหมายเลขคิวเดิม | ไม่มี test ของ AC-BKG-02 | ยังไม่ถึง |
| FR-BKG-03 | AC-BKG-03 | T-05, T-11, T-12 พร้อมทำ | `backend/app/booking/service.py:create_booking` ปฏิเสธเมื่อที่นั่งหมด แต่ยังไม่พบการค้นหา/เสนอ 3 ช่วงใกล้เคียงหรือหน้าจอแจ้งเตือน | ไม่มี test ของ AC-BKG-03 | ยังไม่ถึง |
| FR-BKG-04 | AC-BKG-01 | T-03 เสร็จ; T-06 รอ Q-02; T-07 พร้อมทำ | `backend/app/booking/service.py:create_booking` บันทึกและตัดที่นั่ง; `queue_no` เว้นว่างจนได้คำตอบ Q-02 | `test_AC_BKG_01`, `test_TC_BKG_01_1_booking_success`, `test_TC_BKG_01_2_booking_exact_capacity`, `test_TC_BKG_01_3_unverified_user_rejected` ผ่าน; ยังไม่มี assert การแสดงหมายเลขคิวตาม Q-02 | รอ Q-02 |
| FR-BKG-05 | AC-BKG-04 | T-07 พร้อมทำ | ยังไม่พบการส่งข้อความ, retry queue หรือหน้าจอผลการจอง | ไม่มี test ของ AC-BKG-04 | ยังไม่ถึง |
| FR-BKG-06 | ไม่มี AC ที่ตรวจการเปลี่ยนแพ็กเกจ | T-02 เสร็จ (กรอง package_code ที่ API); T-10 พร้อมทำ | `backend/app/slots/service.py:list_available_slots` กรองตาม package_code; ยังไม่มี UI เปลี่ยนแพ็กเกจและโหลดเวลาใหม่ | `test_AC_BKG_05` ไม่ตรวจ FR-BKG-06; ไม่มี test เปลี่ยนแพ็กเกจ (F-07) | ช่องโหว่ |
| NFR-PERF-01 | AC-BKG-05 | T-02 เสร็จ | `GET /slots` และ `list_available_slots` | `test_AC_BKG_05` ผ่าน p95 ≤ 2 วินาทีจากคำขอ 200 ครั้งแบบเรียงลำดับ ไม่ได้จำลองผู้ใช้พร้อมกัน 200 คน (F-08) | ช่องโหว่ |
| NFR-SEC-01 | ไม่มี AC | ไม่มี task | ไม่พบการกำหนดหรือบังคับ TLS 1.2 ขึ้นไปในโค้ด/API ที่ตรวจ | ไม่มี test TLS | ช่องโหว่ |
| NFR-REL-02 | AC-BKG-04 | T-07 พร้อมทำ | ยังไม่พบกลไกส่งซ้ำภายใน 5 นาที | ไม่มี test ของ AC-BKG-04 | ยังไม่ถึง |
| NFR-USE-01 | ไม่มี AC | ไม่มี task | ไม่พบขั้นตอนหรือหลักฐานทดสอบผู้ใช้ใหม่ 8 ใน 10 คนให้จองสำเร็จภายใน 3 นาทีโดยไม่ช่วยเหลือ (F-10) | ไม่มี test/ผลทดสอบผู้ใช้ | ช่องโหว่ |
| CON-TECH-01 | ไม่มี AC | T-01 เสร็จ | `backend/app/config.py:DATABASE_URL`, `backend/app/db/session.py` รองรับการตั้งค่าฐานข้อมูลผ่าน environment | `test_T01_tables_created` ผ่านบน SQLite; ยังไม่มีผลยืนยันการทำงานบน PostgreSQL ใน environment จริง | ยังไม่ถึง |
| DOM-PDPA-01 | AC-BKG-06 | T-01 เสร็จ (สร้างตาราง); T-08 พร้อมทำ | `AuditLog` และตาราง `audit_logs` มีอยู่ แต่ไม่พบ middleware/การบันทึกทุกครั้ง/การเก็บรักษาอย่างน้อย 1 ปี | `test_T01_tables_created` ตรวจเพียงการมีตาราง; ไม่มี test ของ AC-BKG-06 | ยังไม่ถึง |
| IF-IDP-01 | AC-BKG-01 สื่อถึง precondition | T-03 เสร็จ | `backend/app/auth/idp.py:get_verified_hn` ตรวจเพียง prefix จำลอง ไม่เรียก/ตรวจผลจากระบบยืนยันตัวตนจริง (F-02) | `test_TC_BKG_01_3_unverified_user_rejected` ผ่านสำหรับ token ที่ไม่มี prefix เท่านั้น | ช่องโหว่ |
| IF-HIS-01 | ไม่มี AC ตรง ๆ | T-01 เสร็จ; T-09 พร้อมทำ | `Booking` ไม่มีคอลัมน์ national_id; `BookingRequest` ไม่รับ national_id; ยังไม่มีการค้น HN จาก HIS | `test_T01_no_national_id` ผ่านเฉพาะการตรวจ schema; T-09 ยังไม่ทำ | ยังไม่ถึง |
| IF-NOT-01 | AC-BKG-04 | T-07 พร้อมทำ | ยังไม่พบการวางข้อความลงคิวแบบ asynchronous | ไม่มี test ของ AC-BKG-04 | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/main.py:lifespan`, `backend/app/db/session.py:get_db`, `backend/app/config.py:DATABASE_URL` | CON-TECH-01 | รองรับการกำหนด PostgreSQL ผ่าน `DATABASE_URL` แต่ค่าเริ่มต้นเป็น SQLite | ไม่มีการยืนยันการตั้งค่าหรือทดสอบ PostgreSQL จริงในชุดนี้ |
| `backend/app/db/migrations/001_init.py:upgrade`; `backend/app/db/models.py:Slot`, `Booking`, `AuditLog` | FR-BKG-01, FR-BKG-02, FR-BKG-04, FR-BKG-06, IF-HIS-01, DOM-PDPA-01 | ตารางมี fields พื้นฐาน; `Booking` เก็บ HN และไม่มี national_id; ยังไม่มีการบังคับกฎจองซ้ำหรืออายุเก็บ audit log | schema test ตรวจการสร้างตารางและไม่มี national_id column |
| `backend/app/auth/idp.py:get_verified_hn` | IF-IDP-01 | ไม่ตรงระบบจริง: เชื่อ prefix ใน Authorization แทนการรับผลยืนยันจาก IDP | F-02 |
| `backend/app/slots/router.py:GET /slots` | FR-BKG-01, FR-BKG-06 | ส่งรายการวัน เวลา และ remaining รวมทั้งรับ package_code; ไม่มีหน้าจอแสดงข้อมูล | ข้อมูลช่วงเวลา/จำนวนวันถูกกำหนดใน service |
| `backend/app/slots/service.py:list_available_slots` | FR-BKG-01, FR-BKG-06 | กรอง package และ remaining แต่จำกัดช่วงค้นหา 14 วัน ไม่ใช่ 30 วัน | F-05; ไม่มี AC ที่ตรวจ behavior ของ FR-BKG-01/06 อย่างครบถ้วน (F-06, F-07) |
| `backend/app/booking/router.py:BookingRequest`, `POST /bookings` | FR-BKG-04, IF-IDP-01 | POST รับ slot_id และคืน booking/slot/queue fields; authentication เป็น mock | ไม่มีฟิลด์ national_id ใน request หรือ logger แล้ว; IDP จริงยังไม่เชื่อม (F-02) |
| `backend/app/booking/service.py:create_booking` | FR-BKG-04, Q-02 | บันทึกและตัดที่นั่ง; เว้น queue_no เป็น null จนได้ข้อสรุป Q-02 | ไม่สร้าง format/sequence ของหมายเลขคิว |
| `backend/app/booking/service.py:create_booking` | FR-BKG-03, FR-BKG-04 | บันทึกและตัดที่นั่ง; ปฏิเสธเมื่อ remaining ≤ 0; ยังไม่มีทางเลือก 3 ช่วงใกล้เคียงหรือคิวแจ้งเตือน | ส่วนการจองพื้นฐานมี tests ผ่าน; FR-BKG-03 ยังรอ T-05 |
| `backend/app/booking/router.py:logger.info` | IF-HIS-01 | ไม่ตรง | ข้อความ log บันทึก `req.national_id`; F-01 |
| `frontend/src/api/client.js:api.getSlots`, `api.createBooking` | FR-BKG-01, FR-BKG-03, FR-BKG-04, FR-BKG-06 | wrapper เรียก slots/bookings; ยังไม่มีหน้าจอใช้ wrapper และไม่มีการตั้ง TLS ที่นี่ | หน้าจอจริงยังไม่ถูกทำ |
| `frontend/src/App.jsx:App`, `frontend/src/main.jsx` | ไม่มี behavior ของ AC | เป็นโครงหน้า/entry point | test frontend ตรวจเพียง render ชื่อระบบ |
| `backend/tests/test_AC_BKG_01.py:test_AC_BKG_01` | AC-BKG-01 | อ่อนเมื่อพิจารณาเดี่ยว ๆ เพราะตรวจเพียง status 201 | มี `test_TC_BKG_01_1` และ `_2` เพิ่มเติมที่ตรวจแถว booking และ remaining |
| `backend/tests/test_AC_BKG_05.py:test_AC_BKG_05` | AC-BKG-05, NFR-PERF-01 | ตรวจ p95 ของคำขอเรียงลำดับ ไม่ได้ทดสอบ concurrency 200 คน | F-08 |
| `backend/tests/test_T01_schema.py:test_T01_tables_created`, `test_T01_no_national_id` | CON-TECH-01, DOM-PDPA-01, IF-HIS-01 | ตรวจสร้าง schema และไม่มี national_id column เท่านั้น | ไม่ยืนยัน PostgreSQL, audit behavior, data retention, HIS หรือ national_id ใน logs |
| `frontend/src/__tests__/setup.test.jsx:โครงหน้าจอเปิดได้` | ไม่มี AC | เป็น smoke test ของโครงหน้า ไม่ตรวจ requirement การจอง | ไม่รันรอบนี้ตามขอบเขต /verify เพราะไม่มี UI test นอกเหนือจาก setup |

## 3. ข้อค้นพบ
ชนิด: ละเมิด Constraint / อยู่นอก Scope / เดา Q-xx / ตัวเลขไม่ตรง spec / FR ไม่มี AC / test อ่อน / ข้อกำหนดไม่มี task หรือ test

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-02 | ละเมิด Constraint | `backend/app/auth/idp.py:get_verified_hn` | IF-IDP-01 | ตรวจเพียงว่า Authorization ขึ้นต้นด้วย prefix คงที่แล้วใช้ข้อความต่อท้ายเป็น HN; ไม่ได้ตรวจผลจากระบบยืนยันตัวตนตามข้อกำหนด | |
| F-06 | FR ไม่มี AC | `specs/001-booking/spec.md:AC-BKG-05`, `backend/tests/test_AC_BKG_05.py` | FR-BKG-01 | Traceability ผูก FR-BKG-01 กับ AC-BKG-05 แต่ AC-BKG-05 ตรวจ p95 เท่านั้น ไม่ตรวจว่าระบบแสดงวัน/ช่วงเวลาว่างและจำนวนที่นั่งภายใน 30 วัน; จึงไม่มี AC ที่ตรวจ behavior ของ FR-BKG-01 | |
| F-07 | FR ไม่มี AC | `specs/001-booking/spec.md:FR-BKG-06` | FR-BKG-06 | ไม่มี AC สำหรับการเปลี่ยนแพ็กเกจแล้วคำนวณช่วงเวลาว่างใหม่; test ปัจจุบันไม่ตรวจ behavior นี้ | |
| F-08 | test อ่อน | `backend/tests/test_AC_BKG_05.py:test_AC_BKG_05` | NFR-PERF-01 | วนเรียก 200 requests แบบเรียงลำดับ ไม่ได้จำลองผู้ใช้พร้อมกัน 200 คนตาม NFR; ผล p95 ที่ผ่านจึงไม่ยืนยัน threshold ภายใต้ concurrency ที่กำหนด | |
| F-09 | ข้อกำหนดไม่มี task หรือ test | API/runtime configuration | NFR-SEC-01 | ไม่พบการกำหนด/บังคับ TLS 1.2 ขึ้นไปหรือ test ยืนยันการเข้ารหัสระหว่างรับส่ง; tasks.md ไม่มี task รองรับข้อนี้ | |
| F-10 | ข้อกำหนดไม่มี task หรือ test | `specs/001-booking/tasks.md`, test suites | NFR-USE-01 | ไม่มี task หรือผลทดสอบกับผู้ใช้ใหม่ 10 คนเพื่อยืนยัน 8 ใน 10 คนจองสำเร็จภายใน 3 นาทีโดยไม่ขอความช่วยเหลือ | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-03 | ลบ `DELETE /bookings/{booking_id}` และ `cancel_booking` ออกจาก router/service ตาม Out of scope UC-02 | ค้น `cancel_booking` และ `DELETE /bookings` ใน source ไม่พบ endpoint/ฟังก์ชันดังกล่าวแล้ว |
| F-01 | เอา `national_id` ออกจาก `BookingRequest` และ application log; คงข้อค้นพบเรื่องการค้น HN จาก HIS ไว้ตามสถานะ T-09 ที่ยังไม่ทำ | ตรวจ router ไม่พบฟิลด์หรือ log `national_id`; schema booking ยังคงมีเฉพาะ HN |
| F-04 | หยุดสร้างรูปแบบ/ลำดับหมายเลขคิว และบันทึก `queue_no` เป็น null จนกว่าจะได้คำตอบ Q-02 | ตรวจ `create_booking` ไม่เรียก generator และส่ง `queue_no=None` |
| F-05 | เปลี่ยน `DAYS_AHEAD` จาก 14 เป็น 30 ตาม FR-BKG-01 | ค่าคงที่ใน `backend/app/slots/service.py` เป็น 30 แล้ว |
