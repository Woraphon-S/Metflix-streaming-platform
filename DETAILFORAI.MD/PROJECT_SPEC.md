# PROJECT_SPEC.md

# NeonStream Project Specification

## 1. Project Name

NeonStream

## 2. Project Concept

NeonStream คือแพลตฟอร์มสตรีมมิ่งหนังและซีรีย์แบบ modern web application ที่มีหน้าตาคล้ายแพลตฟอร์มสตรีมมิ่งยุคใหม่ เน้นธีมสีดำ ฟ้า น้ำเงิน และเขียวอมมรกต ใช้งานง่าย รองรับทั้งผู้ใช้ทั่วไปและแอดมิน

ระบบนี้เป็น MVP สำหรับเริ่มต้นพัฒนา โดยยังไม่เน้นระบบ subscription/payment และยังไม่ทำ video streaming server เต็มรูปแบบ แต่ต้องออกแบบโครงสร้างให้พร้อมต่อยอดไปยัง HLS/CDN/Object Storage ภายหลัง

## 3. Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod
- Zustand หรือ TanStack Query
- Axios หรือ Fetch wrapper

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma หรือ TypeORM
- JWT Authentication
- Class Validator
- Config Module
- WebSocket Gateway สำหรับ notification แบบ real-time ในอนาคต

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL container
- Optional Redis container สำหรับ cache/queue ในอนาคต

## 4. Roles

ระบบมี role แค่ 2 แบบ

```txt
user
admin
```

### User

สิทธิ์ของ user:

- สมัครสมาชิก
- Login
- ดูรายการหนังและซีรีย์
- ดูรายละเอียดหนังและซีรีย์
- เล่นวิดีโอจาก video_url
- เพิ่ม/ลบ My List
- ดูประวัติการรับชม
- ดู notification
- แก้ไข profile ของตัวเอง

### Admin

สิทธิ์ของ admin:

- Login ด้วยบัญชี dev fixed account
- เข้าหน้า admin dashboard
- เพิ่ม/แก้ไข/ลบ movie
- เพิ่ม/แก้ไข/ลบ series
- เพิ่ม/แก้ไข/ลบ season
- เพิ่ม/แก้ไข/ลบ episode
- ดู users
- ส่ง notification
- ดู activity log เบื้องต้น

## 5. Fixed Admin Account

สำหรับ development/demo เท่านั้น:

```txt
id: admin
password: 1234
```

ข้อควรระวัง:

- ห้ามใช้แนวทางนี้ใน production
- ใน code ให้แยกชัดเจนว่าเป็น dev admin login
- ห้าม hardcode secret อื่น ๆ
- JWT secret ต้องมาจาก environment variable

## 6. Features Included in MVP

### 6.1 Authentication

- Register
- Login
- Admin Login
- Logout ฝั่ง frontend
- Auth Guard
- Role Guard
- Get current user
- Protected routes

### 6.2 User Profile

- View profile
- Update display name
- Update avatar URL
- View watch stats เบื้องต้น

### 6.3 Browse Page

- Hero section
- Featured content
- Movie carousel
- Series carousel
- Trending carousel แบบ mock จากข้อมูล view_count หรือ created_at
- Continue watching
- My List section

### 6.4 Movie

- Movie list
- Movie detail
- Poster
- Backdrop
- Title
- Description
- Duration
- Maturity rating
- Video URL
- Trailer URL
- Status: draft / published / archived

### 6.5 Series

- Series list
- Series detail
- Season list
- Episode list
- Episode detail
- Episode video URL
- Auto next episode structure

### 6.6 Watch Page

- Video player จาก video_url
- แสดง title
- progress tracking
- update watch progress
- continue watching
- next episode button ถ้าเป็น series

### 6.7 Watchlist / My List

- Add to My List
- Remove from My List
- Get My List
- ป้องกันรายการซ้ำ

### 6.8 Watch History

- Save progress
- Continue Watching
- Mark completed when progress near duration
- Update latest progress แทนการ insert รัว ๆ

### 6.9 Notification

ต้องเขียนโมดูล notification เอง

ฟังก์ชัน:

- Create notification
- Send notification to all users
- Send notification to specific user
- Get notifications for current user
- Mark as read
- Unread count
- Store payload as JSON
- Prepare structure for WebSocket real-time notification

Notification types:

```txt
movie_published
series_published
episode_published
system
admin_message
security
```

### 6.10 Admin Dashboard

- Total users
- Total movies
- Total series
- Total episodes
- Total notifications
- Recently added content
- Recent activity logs

## 7. Features Not Included Yet

ยังไม่ต้องทำในรอบแรก:

- Filter ตามหมวดหมู่
- Filter ตามปี
- Filter ตามภาษา
- Filter ตามเรตติ้ง
- Subscription
- Payment
- Multi-profile
- DRM
- Full CDN/HLS processing
- Recommendation engine จริง
- Advanced search
- Mobile app
- Parental control

## 8. UI Direction

Theme colors:

```txt
Background: #050814
Surface: #0B1020
Surface Soft: #111827
Primary Blue: #0EA5E9
Deep Blue: #1D4ED8
Emerald Accent: #00FF9C
Text Main: #F8FAFC
Text Muted: #94A3B8
Danger: #EF4444
Warning: #F59E0B
Success: #10B981
```

UI personality:

- modern
- cinematic
- smooth
- premium
- not plain admin style
- user friendly
- responsive
- animation rich but not slow

Animation:

- page fade transition
- card hover scale
- hero content slide/fade
- modal backdrop blur
- skeleton shimmer
- carousel hover effect
- button micro-interaction

## 9. Backend Architecture

NestJS ต้องแยก module ชัดเจน:

```txt
src/
├─ modules/
│  ├─ auth/
│  ├─ users/
│  ├─ movies/
│  ├─ series/
│  ├─ seasons/
│  ├─ episodes/
│  ├─ watchlist/
│  ├─ watch-history/
│  ├─ notifications/
│  ├─ admin/
│  └─ health/
├─ common/
│  ├─ decorators/
│  ├─ guards/
│  ├─ filters/
│  ├─ interceptors/
│  ├─ pipes/
│  └─ utils/
├─ config/
├─ database/
└─ main.ts
```

## 10. Frontend Architecture

Next.js ต้องแยก feature ชัดเจน:

```txt
src/
├─ app/
│  ├─ page.tsx
│  ├─ login/
│  ├─ register/
│  ├─ browse/
│  ├─ movies/[id]/
│  ├─ series/[id]/
│  ├─ watch/[contentId]/
│  ├─ my-list/
│  ├─ notifications/
│  ├─ profile/
│  └─ admin/
├─ components/
│  ├─ ui/
│  ├─ layout/
│  ├─ motion/
│  ├─ cards/
│  └─ player/
├─ features/
│  ├─ auth/
│  ├─ catalog/
│  ├─ player/
│  ├─ watchlist/
│  ├─ notifications/
│  └─ admin/
├─ services/
├─ stores/
├─ lib/
└─ types/
```

## 11. Database Tables

ขั้นต่ำ:

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

### users

```txt
id
email
password_hash
role
status
created_at
updated_at
```

### profiles

```txt
id
user_id
display_name
avatar_url
created_at
updated_at
```

### movies

```txt
id
title
slug
description
poster_url
backdrop_url
trailer_url
video_url
duration_seconds
maturity_rating
status
view_count
created_at
updated_at
```

### series

```txt
id
title
slug
description
poster_url
backdrop_url
trailer_url
status
view_count
created_at
updated_at
```

### seasons

```txt
id
series_id
season_number
title
description
created_at
updated_at
```

### episodes

```txt
id
series_id
season_id
episode_number
title
description
poster_url
video_url
duration_seconds
status
created_at
updated_at
```

### watchlists

```txt
id
user_id
content_type
content_id
created_at
```

### watch_histories

```txt
id
user_id
content_type
content_id
progress_seconds
duration_seconds
completed_at
last_watched_at
created_at
updated_at
```

### notifications

```txt
id
target_user_id
type
title
message
payload
created_at
```

### notification_reads

```txt
id
notification_id
user_id
read_at
```

### admin_activity_logs

```txt
id
admin_id
action
entity_type
entity_id
metadata
created_at
```

## 12. API Design

ใช้ prefix:

```txt
/api
```

Auth:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/admin-login
GET /api/auth/me
```

Movies:

```txt
GET /api/movies
GET /api/movies/:id
POST /api/admin/movies
PATCH /api/admin/movies/:id
DELETE /api/admin/movies/:id
```

Series:

```txt
GET /api/series
GET /api/series/:id
POST /api/admin/series
PATCH /api/admin/series/:id
DELETE /api/admin/series/:id
```

Watchlist:

```txt
GET /api/watchlist
POST /api/watchlist/:contentType/:contentId
DELETE /api/watchlist/:contentType/:contentId
```

Watch History:

```txt
GET /api/watch-history/continue
POST /api/watch-history/progress
```

Notifications:

```txt
GET /api/notifications
GET /api/notifications/unread-count
PATCH /api/notifications/:id/read
POST /api/admin/notifications
```

Admin:

```txt
GET /api/admin/dashboard
GET /api/admin/users
```

Health:

```txt
GET /api/health
```

## 13. Performance Rules

เพื่อรองรับผู้ใช้ระดับเริ่มต้นประมาณ 1,000 users:

- API list ต้องมี pagination
- ห้าม query ทั้งตารางโดยไม่ limit
- ใส่ index ให้ email, slug, status, created_at, user_id
- ใช้ connection pooling
- JWT stateless
- ใช้ cache ในอนาคตสำหรับหน้า browse
- update watch progress แบบ throttle ฝั่ง frontend
- Backend ไม่ควร stream video file ใหญ่เองใน production
- วิดีโอควรไปทาง CDN/HLS/Object Storage ในระยะถัดไป

## 14. Acceptance Criteria

โปรเจกต์ถือว่าสำเร็จใน MVP เมื่อ:

1. Run ด้วย Docker Compose ได้
2. Frontend เปิดได้
3. Backend เปิดได้
4. PostgreSQL เชื่อมได้
5. Register user ได้
6. Login user ได้
7. Login admin ด้วย id admin / password 1234 ได้
8. User เข้า browse page ได้
9. User ดู movie/series detail ได้
10. User เปิด watch page ได้
11. User เพิ่ม My List ได้
12. User เห็น Continue Watching ได้
13. User เห็น Notification ได้
14. Admin เข้า dashboard ได้
15. Admin เพิ่ม/แก้ไข/ลบ movie ได้
16. Admin เพิ่ม/แก้ไข/ลบ series ได้
17. Admin ส่ง notification ได้
18. Code build ผ่าน
19. README มีวิธี run ชัดเจน
