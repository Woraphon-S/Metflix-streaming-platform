# Claude Code Master Prompt: NeonStream

คุณคือ Senior Full-Stack Engineer ที่ต้องสร้างโปรเจกต์แพลตฟอร์มสตรีมมิ่งหนังและซีรีย์ชื่อ "NeonStream"

## เป้าหมาย
สร้างระบบเว็บแพลตฟอร์มสตรีมมิ่งหนัง/ซีรีย์ คล้ายแพลตฟอร์มสมัยใหม่ โดยใช้:

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Database: PostgreSQL
- Container: Docker / Docker Compose
- UI Theme: ดำ / ฟ้า / น้ำเงิน / เขียวอมมรกต
- Notification: เขียนโมดูลแจ้งเตือนเอง
- Code Style: Senior, clean, modular, readable, ไม่เน้น comment แต่เน้นตั้งชื่อให้เข้าใจง่าย
- Target: ออกแบบ backend ให้รองรับผู้ใช้ระดับเริ่มต้นประมาณ 1,000 users ได้

## ข้อกำหนดสำคัญ
1. Role มีแค่ 2 แบบ:
   - user
   - admin

2. Admin dev account ให้ fix ไว้ดังนี้:
   - id: admin
   - password: 1234

3. บัญชี admin แบบ fix นี้ใช้สำหรับ development/demo เท่านั้น ห้ามออกแบบให้เหมือน production security

4. ยังไม่ต้องมี filter เหล่านี้:
   - Filter ตามหมวดหมู่
   - Filter ตามปี
   - Filter ตามภาษา
   - Filter ตามเรตติ้ง

5. ต้องมีระบบหลัก:
   - Login
   - Register
   - Logout
   - User profile
   - Admin dashboard
   - Movie catalog
   - Series catalog
   - Movie detail
   - Series detail
   - Watch page
   - Watchlist / My List
   - Watch history / Continue Watching
   - Notification module
   - Admin content management

6. ระบบวิดีโอใน MVP ยังไม่ต้องทำ streaming server จริงเต็มรูปแบบ ให้รองรับ video_url หรือ HLS URL เป็น metadata ก่อน แต่โครงสร้างต้องพร้อมต่อยอดไปใช้ CDN / Object Storage / HLS Server ภายหลัง

## สิ่งที่ต้องทำก่อนเขียนโค้ด
อ่านไฟล์เหล่านี้ก่อนเสมอ:

1. PROJECT_SPEC.md
2. CLAUDE.md

จากนั้นให้เริ่มสร้างโปรเจกต์ตามลำดับนี้:

1. สร้างโครงสร้าง monorepo
2. สร้าง Docker Compose
3. สร้าง PostgreSQL schema หรือ Prisma schema
4. สร้าง NestJS backend modules
5. สร้าง Next.js frontend
6. เชื่อม frontend กับ backend
7. ทำ seed data สำหรับ admin และ sample movies/series
8. ทำ README พร้อมวิธี run project

## โครงสร้างที่ต้องการ

```txt
neonstream/
├─ apps/
│  ├─ web/
│  └─ api/
├─ packages/
│  └─ shared-types/
├─ docker/
├─ docker-compose.yml
├─ .env.example
├─ PROJECT_SPEC.md
├─ CLAUDE.md
└─ README.md
```

## Backend Modules ที่ต้องมี

```txt
AuthModule
UsersModule
MoviesModule
SeriesModule
SeasonsModule
EpisodesModule
WatchlistModule
WatchHistoryModule
NotificationsModule
AdminModule
HealthModule
```

## Frontend Pages ที่ต้องมี

```txt
/
 /login
 /register
 /browse
 /movies/[id]
 /series/[id]
 /watch/[contentId]
 /my-list
 /notifications
 /profile
 /admin
 /admin/movies
 /admin/series
 /admin/users
 /admin/notifications
```

## UI Style
สร้าง UI แบบ modern streaming platform:

- Dark cinematic layout
- Hero banner
- Horizontal carousel
- Movie cards
- Hover animation
- Smooth page transitions
- Skeleton loading
- Responsive layout
- Mobile friendly
- Glassmorphism เฉพาะจุด
- ปุ่มหลักสีฟ้า
- Accent สีเขียวอมมรกต
- ไม่ใช้ UI ที่ดูเหมือน dashboard admin ทั่วไปในหน้าผู้ใช้

แนะนำใช้:
- Tailwind CSS
- Framer Motion
- Zustand หรือ TanStack Query ตามความเหมาะสม
- React Hook Form + Zod สำหรับ form validation

## Backend Quality Rules

- ใช้ DTO ทุก request
- ใช้ validation pipe
- ใช้ guard สำหรับ auth
- ใช้ role guard สำหรับ admin
- ใช้ pagination ทุก list endpoint
- ใช้ service แยก business logic
- controller ต้องบาง
- ไม่เขียน logic หนักใน controller
- ใช้ enum สำหรับ role/status/type
- ตั้งชื่อ function ให้เข้าใจทันที
- error response ต้องเป็นระบบ
- config ต้องอ่านจาก environment
- ห้าม hardcode secret ยกเว้น dev admin account ตาม requirement

## Auth Requirement

- user login ด้วย email/password
- admin login ด้วย id/password:
  - id: admin
  - password: 1234
- หลัง login ให้ backend คืน accessToken
- frontend ต้องเก็บ token อย่างเหมาะสมสำหรับ demo
- protected route ต้องกันหน้า admin
- user ห้ามเข้า admin page

## Database Entities ขั้นต่ำ

```txt
users
profiles
movies
series
seasons
episodes
watchlists
watch_histories
notifications
notification_reads
admin_activity_logs
```

## API Endpoint ขั้นต่ำ

```txt
POST /auth/register
POST /auth/login
POST /auth/admin-login
GET /auth/me

GET /movies
GET /movies/:id
POST /admin/movies
PATCH /admin/movies/:id
DELETE /admin/movies/:id

GET /series
GET /series/:id
POST /admin/series
PATCH /admin/series/:id
DELETE /admin/series/:id

GET /watchlist
POST /watchlist/:contentType/:contentId
DELETE /watchlist/:contentType/:contentId

GET /watch-history/continue
POST /watch-history/progress

GET /notifications
PATCH /notifications/:id/read
POST /admin/notifications

GET /admin/dashboard
GET /health
```

## Output ที่ต้องการจาก Claude Code
ให้ลงมือสร้างไฟล์จริง ไม่ใช่อธิบายอย่างเดียว

หลังทำเสร็จให้สรุป:
1. สร้างอะไรไปแล้ว
2. วิธีติดตั้ง
3. วิธี run ด้วย Docker
4. URL frontend/backend
5. admin login
6. จุดที่ยังเป็น mock/demo
7. ขั้นตอนถัดไปที่ควรทำ
