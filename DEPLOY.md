# Deploy METFLIX ฟรี (ฟรีทั้งหมด)

โปรเจกต์นี้ deploy ฟรีได้ โดยแยกเป็น 3 ส่วน:

| ส่วน | บริการฟรีแนะนำ | ทางเลือก |
| ---- | -------------- | -------- |
| ฐานข้อมูล (Postgres) | **Neon** (neon.tech) | Supabase, Railway |
| API (NestJS) | **Render** (render.com) | Railway, Fly.io, Koyeb |
| เว็บ (Next.js) | **Vercel** (vercel.com) | Netlify, Cloudflare Pages |

> หมายเหตุ: free tier ของ Render จะ “หลับ” เมื่อไม่มีคนใช้ ~15 นาที (เข้าครั้งแรกหลังหลับจะช้า ~30 วิ) ส่วน Neon/Vercel ใช้งานได้ตลอด

---

## 0. เตรียม: push ขึ้น GitHub
```bash
git add -A
git commit -m "prepare for deploy"
git push
```

## 1. ฐานข้อมูล — Neon
1. สมัคร neon.tech → **New Project**
2. คัดลอก **Connection string** (รูปแบบ `postgresql://user:pass@host/db?sslmode=require`)
3. เก็บไว้ใช้เป็น `DATABASE_URL`

## 2. API — Render
**วิธี A (ง่ายสุด ใช้ blueprint):** มีไฟล์ [`render.yaml`](./render.yaml) อยู่แล้ว
1. Render → **New** → **Blueprint** → เลือก repo นี้
2. กรอก env ที่ขึ้น `sync: false`:
   - `DATABASE_URL` = connection string จาก Neon
   - `CORS_ORIGIN` = URL ของเว็บบน Vercel (ใส่ทีหลังได้ หลังได้ URL จากขั้นตอน 3)
3. Deploy → จะได้ URL เช่น `https://metflix-api.onrender.com`

**วิธี B (ตั้งเอง):** New → **Web Service** → เลือก repo
- Build Command: `npm install && npm run build:api`
- Start Command: `node apps/api/dist/db/seed.js && node apps/api/dist/main.js`
- Health Check Path: `/api/health`
- Environment: ใส่ `DATABASE_URL`, `JWT_SECRET` (สุ่มยาวๆ), `CORS_ORIGIN`, `ADMIN_DEV_ID=admin`, `ADMIN_DEV_PASSWORD=1234`

> schema จะถูกสร้างอัตโนมัติตอน API boot และ seed รันใน start command (idempotent) — ไม่ต้องทำเอง
> API อ่าน `PORT` ที่ Render ใส่ให้อัตโนมัติ (รองรับแล้ว)

## 3. เว็บ — Vercel
1. Vercel → **Add New Project** → เลือก repo นี้
2. ตั้งค่า:
   - **Root Directory**: `apps/web`
   - Framework: Next.js (auto)
   - Build/Install: ปล่อย default (Vercel จัดการ workspace ให้)
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://metflix-api.onrender.com/api` (URL API จากขั้นตอน 2 + `/api`)
4. Deploy → จะได้ URL เช่น `https://metflix.vercel.app`

## 4. ปิดวง: อัปเดต CORS
กลับไปที่ Render → ตั้ง `CORS_ORIGIN` = URL ของ Vercel (เช่น `https://metflix.vercel.app`) → Save (API จะ redeploy)

---

## ตรวจสอบ
- API: เปิด `https://<api>.onrender.com/api/health` ควรได้ `{"ok":true,...}`
- เว็บ: เปิด `https://<web>.vercel.app` → login `demo@metflix.local` / `demo1234`
- Admin: แท็บ Admin → `admin` / `1234`

## ข้อควรระวัง (เป็น demo)
- เปลี่ยน `JWT_SECRET` เป็นค่าสุ่มยาวๆ และ **เปลี่ยน/ปิด admin `1234`** ก่อนใช้งานจริง
- token เก็บใน `localStorage` (demo) — production ควรย้ายไป httpOnly cookie
- วิดีโอเป็นไฟล์ตัวอย่าง (BigBuckBunny) — เปลี่ยนเป็น HLS/CDN จริงได้
