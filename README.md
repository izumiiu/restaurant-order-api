# Restaurant Order API

![CI](https://github.com/izumiiu/restaurant-order-api/actions/workflows/ci.yml/badge.svg)

REST API สำหรับระบบสั่งอาหารในร้าน รองรับทั้งฝั่งลูกค้าและพนักงาน

## Overview

ระบบหลังบ้านของร้านอาหาร ครอบคลุมตั้งแต่การจัดการเมนู, รับออเดอร์, รวมไปถึงการติดตามสถานะออเดอร์จนเสร็จ 

**ลูกค้า** - สามารถดูเมนู, สั่งรายการอาหาร, ติดตามสถานะของออเดอร์, โดยราคาจะคำนวณฝั่งเซิร์ฟเวอร์ และบันทึกลงบิล ณ ตอนที่สั่งและสามารถดูบิลและรายละเอียดต่างๆย้อนหลังได้

**พนักงาน** - สามารถจัดการแก้ไข, เพิ่ม, ลบ, รายการเมนูในระบบได้ และสามารถดูรายการ order ที่เข้ามาทั้งหมดได้ สามารถอัพเดตสถานะของแต่ละ order ได้ โดยเปลี่ยนสถานะได้ตามลำดับเท่านั้น — ย้อนกลับหรือข้ามขั้นไม่ได้

## Features

- JWT authentication — access token + refresh token (httpOnly cookie)
- Role-based access control (customer / employee)
- Ownership check — ลูกค้าเข้าถึงได้เฉพาะบิลของตัวเอง
- Order status state machine — กันเปลี่ยนสถานะย้อนกลับและข้ามขั้น
- ราคาคำนวณฝั่ง server + snapshot ราคาและชื่อเมนูลงในบิล
- Input validation ทุก endpoint
- Security headers (helmet) + CORS allowlist จาก env
- Rate limiting — /auth (นับเฉพาะที่ล็อกอินล้มเหลว) และ /register
- Request body size limit (10kb)
- Health check endpoint พร้อมเช็คสถานะ DB
- Integration tests + CI

## Roadmap
- [ ] React frontend
- [ ] Deployment

## API

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| `GET` | `/health` | public | 503 เมื่อยังต่อ DB ไม่ได้ |
| `POST` | `/register` | public | สร้างบัญชี role `customer` |
| `POST` | `/auth` | public | คืน access token + ตั้ง refresh cookie |
| `POST` | `/refresh` | refresh cookie | ออก access token ใบใหม่ |
| `POST` | `/logout` | refresh cookie | ลบ cookie + ลบ token ใน DB |
| `GET` | `/manageMenu` | customer, employee | |
| `POST` | `/manageMenu` | employee | |
| `PUT` `DELETE` | `/manageMenu/:id` | employee | |
| `GET` | `/order` | employee | ออเดอร์ทั้งหมด |
| `POST` | `/order` | customer | คำนวณราคาฝั่ง server |
| `GET` | `/order/me` | customer | เฉพาะบิลตัวเอง ใหม่→เก่า |
| `GET` | `/order/:id` | customer, employee | **มี ownership check ข้างใน** |
| `PATCH` | `/order/:id/status` | employee | **ตาม state machine** |

## Getting started

### Prerequisites
- Node.js 22+
- MongoDB (Atlas หรือ local)

### Installation
```bash
git clone https://github.com/izumiiu/restaurant-order-api.git
cd restaurant-order-api
npm install
```

### Environment
คัดลอก `.env.example` เป็น `.env` แล้วเติมค่า

| Variable | Required | Example |
|---|---|---|
| `DATABASE_URI` | ✅ | `mongodb+srv://...` |
| `ACCESS_TOKEN_SECRET` | ✅ | สตริงสุ่มยาวๆ |
| `REFRESH_TOKEN_SECRET` | ✅ | ต้องไม่ซ้ำกับ access secret |
| `ALLOWED_ORIGINS` | ✅ | `http://localhost:5173` (คั่นด้วย `,`) |
| `PORT` | — | ไม่ใส่ = `3500` |

### Running
เปิด 2 terminal:
```bash
npm run watch    # terminal 1 — tsc เฝ้า src/
npm run dev      # terminal 2 — nodemon เฝ้า dist/
```

### Scripts
| | |
|---|---|
| `npm run build` | คอมไพล์ `src/` → `dist/` และตรวจ type |
| `npm start` | รันเวอร์ชันที่คอมไพล์แล้ว |
| `npm test` | รันเทสทั้งหมดหนึ่งรอบ |
| `npm run test:watch` | รันเทสแบบ watch |


