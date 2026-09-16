# Plan: จองคิวตรวจสุขภาพ (Booking)

## 1. สรุปแนวทาง
ฟีเจอร์นี้สร้างเพื่อให้ผู้รับบริการที่ยืนยันตัวตนแล้วเลือกแพ็กเกจ วัน และช่วงเวลาตรวจสุขภาพ แล้วได้รับหมายเลขคิวพร้อมยืนยันการจองได้ภายในกระบวนการที่เร็วและปลอดภัย ผู้ใช้หลักคือผู้รับบริการและทีมเจ้าหน้าที่ตรวจสุขภาพที่ต้องเห็นข้อมูลคิวและความพร้อมของช่วงเวลา ระบบจะใช้การคำนวณช่วงเวลาว่างจากฐานข้อมูลที่มีอยู่ การป้องกันการจองซ้ำ และคิวส่งข้อความแบบ asynchronous เพื่อให้การจองไม่หยุดรอส่ง SMS/LINE และแนวทางการออกแบบจะยึดตาม FR, NFR และ Constraints ใน spec อย่างเคร่งครัด

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React + Vite สำหรับหน้าเว็บไซต์/แอปผู้ใช้ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับแสดงวันและช่วงเวลา ว่าง พร้อมการยืนยันการจองและแสดงหมายเลขคิว |
| Python FastAPI สำหรับ API backend | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับการตรวจสิทธิ์ การคำนวณช่วงเวลาและการบันทึกการจอง |
| MySQL | CON-TECH-01 | ใช้เก็บข้อมูล booking, availability, queue, audit log และการส่งข้อความซ้ำ |
| Queue สำหรับการส่งข้อความยืนยันแบบ asynchronous | IF-NOT-01 | ระบบบันทึกการจองก่อนและจัดเก็บงานส่ง SMS/LINE ไว้ในคิวเพื่อไม่ให้รอผลส่งข้อความ |
| TLS 1.2+ สำหรับข้อมูลรับส่ง | NFR-SEC-01 | ใช้ในทุกการสื่อสารระหว่าง frontend, API และระบบภายนอก |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ FR / Constraint |
|---|---|---|
| Patient | hn, full_name, verified_status, last_updated_at | รองรับ IF-IDP-01, IF-HIS-01; ไม่เก็บเลขบัตรประชาชนในตารางการจอง |
| Booking | booking_id, hn, package_id, booking_date, slot_id, queue_no, status, created_at, notification_status | รองรับ FR-BKG-02, FR-BKG-04, FR-BKG-05, AC-BKG-01, AC-BKG-02, AC-BKG-04 |
| TimeSlot | slot_id, date, start_time, end_time, package_id, capacity, remaining_seats, status | รองรับ FR-BKG-01, FR-BKG-03, FR-BKG-06, AC-BKG-03, AC-BKG-05 |
| QueuePolicy | policy_id, package_id, date, slot_id, quota, max_per_day | รองรับ Goal, ASM-01, ASM-04, FR-BKG-01 |
| NotificationJob | job_id, booking_id, channel, payload, status, retry_count, next_retry_at | รองรับ IF-NOT-01, FR-BKG-05, NFR-REL-02, AC-BKG-04 |
| AuditLog | audit_id, actor_user_id, hn, accessed_at, resource_type, action | รองรับ DOM-PDPA-01, AC-BKG-06 |

> ข้อควรระวัง: ตารางการจองและตารางข้อมูลหลักจะไม่เก็บเลขบัตรประชาชน ตาม IF-HIS-01 และจะใช้ HN เป็นรหัสอ้างอิงภายในระบบเท่านั้น

## 4. API / หน้าจอ

| Method / Path | Input หลัก | Output หลัก | รองรับ FR |
|---|---|---|---|
| GET /api/booking/slots | packageId, fromDate, toDate | รายการวันและช่วงเวลาว่างพร้อม remainingSeats | FR-BKG-01, FR-BKG-06 |
| POST /api/booking/check-duplicate | hn, bookingDate | status=allowed/blocked, existingQueueNo | FR-BKG-02 |
| POST /api/booking/alternatives | packageId, selectedDate, selectedSlotId | 3 ตัวเลือกช่วงเวลาใกล้เคียง | FR-BKG-03 |
| POST /api/booking/reserve | hn, packageId, bookingDate, slotId | bookingId, queueNo, reserveStatus | FR-BKG-04 |
| GET /api/booking/{bookingId} | bookingId | queueNo, status, notificationStatus | FR-BKG-05 |
| POST /api/booking/notification/retry | bookingId | retryAccepted, nextRetryAt | FR-BKG-05, NFR-REL-02 |
| GET /booking | - | หน้าเลือกแพ็กเกจ วัน และช่วงเวลา | FR-BKG-01, FR-BKG-02, FR-BKG-03, FR-BKG-06 |
| GET /booking/confirm | bookingId | หน้าแสดงหมายเลขคิวและสรุปการจอง | FR-BKG-04, FR-BKG-05 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-TECH-01 | MySQL ถูกเลือกเป็น datastore หลักสำหรับ Booking, TimeSlot, QueuePolicy และ AuditLog | ใช้แล้ว |
| DOM-PDPA-01 | เพิ่ม AuditLog entity และการบันทึกผู้เข้าถึง เวลา และ HN ทุกครั้งที่เข้าใช้ข้อมูล | ใช้แล้ว |
| IF-IDP-01 | กระบวนการ reserve/check-duplicate จะต้องตรวจว่าผู้รับบริการยืนยันตัวตนแล้วก่อนเรียก API | ใช้แล้ว |
| IF-HIS-01 | Patient entity ใช้ HN เป็น key ภายในระบบ และไม่เก็บเลขบัตรประชาชนใน Booking หรือ TimeSlot | ใช้แล้ว |
| IF-NOT-01 | NotificationJob + async queue ทำให้การจองไม่รอผลส่งข้อความ และยังเรียก retry ได้ตามเงื่อนไข | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-BKG-01 | test_AC_BKG_01_successful_booking_reduces_remaining_seat | ตั้งค่า slot มีที่นั่ง 1 ที่, ทำการ reserve สำเร็จ, ตรวจว่าบันทึก booking, แสดง queueNo และ remainingSeats กลายเป็น 0 |
| AC-BKG-02 | test_AC_BKG_02_block_duplicate_active_booking_same_day | ตั้งคิววันเดียวกันที่ยังไม่ใช้, พยายามจองใหม่, ตรวจว่า API คืนค่าปฏิเสธและแสดง queueNo เดิม |
| AC-BKG-03 | test_AC_BKG_03_show_three_alternative_slots_when_full | จำลอง slot ว่างเหลือ 1 ที่และมีคนยืนยันก่อน, ตรวจว่าแสดงข้อความ “ช่วงเวลาเต็ม” และมี 3 ตัวเลือกภายในวันเดียวกันและวันถัดไป |
| AC-BKG-04 | test_AC_BKG_04_notification_failure_keeps_booking_and_retries | จำลอง notification failure, ตรวจว่าการจองยังถูกบันทึกพร้อม queue retry และแสดงหมายเลขคิวบนหน้าจอ |
| AC-BKG-05 | test_AC_BKG_05_peak_load_slot_lookup_p95_under_2_seconds | จำลองผู้ใช้พร้อมกัน 200 คน, วัด p95 ของการเรียก slots API และตรวจว่าต่ำกว่า 2 วินาที |
| AC-BKG-06 | test_AC_BKG_06_audit_log_written_on_access | ทำการเข้าดูข้อมูล booking ของผู้รับบริการ, ตรวจว่ามี AuditLog ที่มี actor, accessed_at และ hn | 

## 7. ลำดับงาน

1. กำหนดโครงสร้างข้อมูล booking, slot และ audit log ตาม Entity และ Constraint ที่ระบุ (FR-BKG-01, DOM-PDPA-01, IF-HIS-01)
2. สร้าง API ดึงช่วงเวลาว่างพร้อม remainingSeats และ logic เลือก slot ตามแพ็กเกจ (FR-BKG-01, FR-BKG-06)
3. สร้างตรวจสอบคิวซ้ำในวันเดียวกันก่อนบันทึกการจอง (FR-BKG-02, AC-BKG-02)
4. สร้าง flow เมื่อ slot เต็ม: แสดงข้อความ เต็ม และแนะนำ 3 ตัวเลือกภายในวันเดียวกันและวันถัดไป (FR-BKG-03, AC-BKG-03)
5. สร้าง reserve flow บันทึกการจอง, ออก queueNo และลด remainingSeats (FR-BKG-04, AC-BKG-01)
6. เพิ่ม queue สำหรับส่งข้อความยืนยันแบบ asynchronous และ retry ภายใน 5 นาที (FR-BKG-05, NFR-REL-02, AC-BKG-04)
7. สร้างหน้าแสดงผลการจองสำเร็จ แสดงหมายเลขคิว และสถานะการส่งข้อความ (FR-BKG-04, FR-BKG-05)
8. ทดสอบประสิทธิภาพ p95 และ audit log ตาม AC-BKG-05, AC-BKG-06

## 8. สิ่งที่ยังไม่ทำ

- Q-01 หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง? -> ถามเจ้าหน้าที่เวชระเบียน
  ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
