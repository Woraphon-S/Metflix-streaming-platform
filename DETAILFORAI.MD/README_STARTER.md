# NeonStream Claude Starter Pack

ไฟล์ชุดนี้ใช้สำหรับเริ่มสั่ง Claude Code ให้สร้างโปรเจกต์แพลตฟอร์มสตรีมมิ่งหนัง/ซีรีย์

## Files

```txt
00_CLAUDE_CODE_MASTER_PROMPT.md
PROJECT_SPEC.md
CLAUDE.md
```

## วิธีใช้กับ Claude Code

1. สร้างโฟลเดอร์โปรเจกต์

```bash
mkdir neonstream
cd neonstream
```

2. วางไฟล์ทั้ง 3 ไฟล์นี้ใน root project

```txt
neonstream/
├─ 00_CLAUDE_CODE_MASTER_PROMPT.md
├─ PROJECT_SPEC.md
└─ CLAUDE.md
```

3. เปิด Claude Code ในโฟลเดอร์นี้

4. ส่ง prompt จากไฟล์ `00_CLAUDE_CODE_MASTER_PROMPT.md`

5. ให้ Claude Code อ่าน `PROJECT_SPEC.md` และ `CLAUDE.md` ก่อนเริ่มเขียนโค้ด

## Admin Dev Account

```txt
id: admin
password: 1234
```

ใช้สำหรับ development/demo เท่านั้น
