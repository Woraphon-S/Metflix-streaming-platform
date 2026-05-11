# CLAUDE.md

# Claude Code Instructions for NeonStream

## 1. Working Style

คุณต้องทำงานเหมือน Senior Full-Stack Engineer

- คิดเป็นระบบก่อนเขียน
- แยกงานเป็น phase
- เขียนโค้ดจริง ไม่ใช่แค่อธิบาย
- ตรวจสอบผลกระทบก่อนแก้ไฟล์
- อย่าทำไฟล์ใหญ่เกินจำเป็น
- อย่าเขียน comment เยอะ
- ใช้ชื่อไฟล์ ตัวแปร ฟังก์ชัน และ class ให้สื่อความหมาย
- โค้ดต้องอ่านง่ายเหมือนมีคนในทีมต้องมาดูต่อ
- ถ้าไม่แน่ใจ ให้เลือกวิธีที่ปลอดภัยและ maintain ง่ายกว่า

## 2. Project Context

โปรเจกต์นี้คือ NeonStream แพลตฟอร์มสตรีมมิ่งหนัง/ซีรีย์

Tech stack:

- Next.js
- NestJS
- TypeScript
- PostgreSQL
- Docker
- Tailwind CSS
- Framer Motion

ระบบมี role แค่:

```txt
user
admin
```

Admin dev account:

```txt
id: admin
password: 1234
```

บัญชีนี้ใช้สำหรับ dev/demo เท่านั้น

## 3. Core Rule

ก่อนเขียนโค้ดทุกครั้ง ให้ยึดตามไฟล์เหล่านี้:

1. PROJECT_SPEC.md
2. CLAUDE.md

ถ้าต้องแก้ architecture ให้ยังคงเป้าหมายเดิมของโปรเจกต์

## 4. Code Quality Rules

### General

- ใช้ TypeScript strict
- หลีกเลี่ยง any
- หลีกเลี่ยง duplicated logic
- หลีกเลี่ยง magic string
- ใช้ enum หรือ const object เมื่อต้องใช้ค่าซ้ำ
- ฟังก์ชันควรทำหน้าที่เดียว
- แยก domain logic ออกจาก UI/API layer
- Error handling ต้องชัดเจน
- ห้ามซ่อน error ด้วย catch ว่าง

### Naming

ใช้ชื่อที่อ่านแล้วเข้าใจ เช่น:

```txt
createMovie
publishMovie
getContinueWatchingItems
markNotificationAsRead
updateWatchProgress
validateAdminCredentials
```

ห้ามใช้ชื่อคลุมเครือ เช่น:

```txt
handleData
processThing
doStuff
temp
foo
bar
```

## 5. Backend Rules

### NestJS Structure

ให้แยกเป็น module:

```txt
auth
users
movies
series
seasons
episodes
watchlist
watch-history
notifications
admin
health
```

ในแต่ละ module ควรมี:

```txt
controller
service
dto
entities/model หรือ repository
```

### Controller Rule

Controller มีหน้าที่:

- รับ request
- validate ผ่าน DTO
- เรียก service
- คืน response

Controller ห้ามมี business logic หนัก

### Service Rule

Service มีหน้าที่:

- business logic
- ตรวจสิทธิ์
- เชื่อม repository/database
- สร้าง response ที่เหมาะสม

### Auth Rule

- user login ด้วย email/password
- admin login ด้วย id/password
- admin id/password fixed ตาม requirement
- ใช้ JWT access token
- ใช้ Auth Guard
- ใช้ Role Guard
- user ห้ามเข้า admin endpoint
- admin เท่านั้นที่เข้าทาง `/admin/*`

### Validation

- ใช้ DTO ทุก POST/PATCH
- ใช้ class-validator
- เปิด global validation pipe
- ป้องกัน input เกินจำเป็นด้วย whitelist

### Database

- ใช้ migration หรือ schema ที่ reproducible
- ใส่ index ให้ field ที่ query บ่อย
- ใช้ created_at และ updated_at
- ใช้ status แทนการลบทิ้งทันทีเมื่อเหมาะสม
- list endpoint ต้องมี pagination

## 6. Frontend Rules

### Next.js Structure

ใช้ App Router และแยก feature:

```txt
app
components
features
services
stores
lib
types
```

### UI Rules

- UI ต้องเป็นธีม streaming platform
- ห้ามทำให้หน้าผู้ใช้ดูเหมือน admin dashboard
- ใช้ dark theme เป็นหลัก
- ใช้ accent ฟ้า/น้ำเงิน/เขียวอมมรกต
- responsive ทุกหน้า
- mobile friendly
- มี animation ที่ลื่นและไม่รก
- ใช้ loading state
- ใช้ empty state
- ใช้ error state

### Component Rules

- แยก component เล็กพอดี
- component ที่ reuse ได้ให้วางใน components
- component เฉพาะ feature ให้วางใน features
- ห้ามผูก API logic กระจายมั่วในหลาย component
- สร้าง service layer สำหรับเรียก API

### UX Rules

- Login/Register ต้องใช้ง่าย
- ปุ่มต้องเห็นชัด
- Card ต้องกดง่าย
- Admin page ต้องแยก look จาก user page แต่ยังคุม theme เดียวกัน
- หน้า watch ต้องเน้น video player และไม่รก

## 7. Notification Skill

เมื่อทำ notification module ต้องรองรับ:

- create notification
- get current user notifications
- unread count
- mark as read
- admin send notification
- target_user_id เป็น optional เพื่อรองรับส่งทุกคน
- payload เป็น JSON
- เตรียมโครงสร้างให้ต่อ WebSocket ได้ภายหลัง

ห้ามใช้ third-party notification service ใน MVP

## 8. Security Rules

- ห้ามเก็บ user password เป็น plain text
- user password ต้อง hash
- admin fixed password ใช้เฉพาะ dev/demo
- JWT secret ต้องมาจาก environment variable
- ห้าม commit secret จริง
- CORS ต้อง config ได้จาก env
- ป้องกัน admin route ด้วย guard
- validate input ทุกครั้ง
- อย่า expose password_hash ใน response

## 9. Performance Rules

- ทุก list endpoint ต้อง pagination
- ห้าม fetch all โดยไม่จำกัด
- watch progress ต้อง update แบบประหยัด
- browse page ควรออกแบบให้ cache ได้ในอนาคต
- อย่าให้ backend serve video file ใหญ่โดยตรง
- ให้ใช้ video_url เป็น metadata ใน MVP
- ออกแบบให้ย้ายไป CDN/HLS ได้ในอนาคต

## 10. Docker Rules

ต้องมี:

```txt
docker-compose.yml
.env.example
Dockerfile สำหรับ frontend
Dockerfile สำหรับ backend
postgres volume
```

ระบบควร run ได้ด้วย:

```bash
docker compose up -d --build
```

หรือถ้ายังไม่สมบูรณ์ ต้องระบุชัดเจนใน README ว่าต้องใช้คำสั่งใด

## 11. README Requirement

README ต้องมี:

- Project overview
- Tech stack
- Folder structure
- Environment variables
- Install
- Run dev
- Run docker
- API base URL
- Frontend URL
- Admin login
- Known limitations
- Next steps

## 12. Implementation Order

ให้ทำตามลำดับนี้:

1. Bootstrap monorepo
2. Add Docker Compose
3. Setup backend
4. Setup database schema
5. Create auth module
6. Create users/profile module
7. Create movies/series module
8. Create watchlist/watch-history module
9. Create notifications module
10. Create admin module
11. Setup frontend
12. Build UI layout/theme
13. Build auth pages
14. Build browse/detail/watch pages
15. Build admin pages
16. Connect API
17. Add seed data
18. Final test
19. Update README

## 13. Response Format While Working

เวลาทำงาน ให้ตอบสั้น ๆ แต่ชัดเจน:

- ทำอะไรไปแล้ว
- ไฟล์ไหนที่เปลี่ยน
- มีปัญหาอะไรหรือไม่
- คำสั่งทดสอบคืออะไร
- ขั้นตอนถัดไปคืออะไร

## 14. Do Not Do

ห้ามทำสิ่งต่อไปนี้:

- อย่าเพิ่ม payment/subscription ใน MVP
- อย่าเพิ่ม filter ขั้นสูงในรอบแรก
- อย่าเพิ่มระบบซับซ้อนเกิน requirement
- อย่าใช้ mock ทั้งระบบจน backend ใช้จริงไม่ได้
- อย่าเขียนทุกอย่างในไฟล์เดียว
- อย่า hardcode secret จริง
- อย่า expose password_hash
- อย่า stream video file ใหญ่ผ่าน NestJS ใน production design
- อย่าใช้ภาษาโค้ดปนกันโดยไม่จำเป็น

## 15. Final Check

ก่อนจบงาน ต้องตรวจว่า:

- TypeScript build ผ่าน
- Backend start ได้
- Frontend start ได้
- Docker Compose ใช้งานได้
- Login user ได้
- Login admin ได้
- Admin route protected
- Browse page มีข้อมูล
- Watch page เปิดได้
- Notification ทำงานระดับ MVP
- README อธิบายครบ
