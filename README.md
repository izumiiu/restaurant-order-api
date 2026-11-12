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

## Testing

```bash
npm test          # รันทั้งหมดหนึ่งรอบ
npm run test:watch
```

ใช้ [Vitest](https://vitest.dev) + [Supertest](https://github.com/ladjs/supertest) +
[mongodb-memory-server](https://github.com/typegoose/mongodb-memory-server)

เทสยิงผ่าน HTTP จริงเข้า Express app และเขียนลง MongoDB ที่รันในหน่วยความจำ
**clone มาแล้ว `npm test` ได้ทันที** ไม่ต้องมี Atlas ไม่ต้องตั้ง `.env` ไม่ต้องรัน server แยก
(เหตุผลที่เลือกวิธีนี้อยู่ใน [docs/decisions.md](docs/decisions.md))

ทุก push และ pull request เข้า `main` จะรัน `npm run build` และ `npm test` บน GitHub Actions

### Covered

ตอนนี้เทสเน้นที่ชั้น authentication / authorization เป็นหลัก — 11 เทส

| ไฟล์ | ครอบคลุม |
|---|---|
| `db.test.ts` | การเชื่อมต่อ database ในเทส |
| `health.test.ts` | `GET /health` → 200 |
| `order.test.ts` | `GET /order/me` — ไม่มี token 401 / customer 200 / employee 403<br>`POST /order` — employee 403<br>`PATCH /order/:id/status` — customer 403 |
| `register.test.ts` | สมัครสำเร็จ 201 / username ซ้ำ 409 / ไม่ส่ง body 400 / `beforeEach` ล้าง DB จริง |

### Not covered

ยังไม่ได้เขียน เรียงตามขนาดพื้นที่ที่ยังไม่ถูกตรวจ — อยู่ใน [Roadmap](#roadmap)

- **`menuController`** — ทั้งไฟล์ยังไม่มีเทสเลย เป็นส่วนที่ใหญ่ที่สุดที่ยังว่าง
- **business logic ของ `orderController`** — ตอนนี้เทสครอบคลุมเฉพาะการกันสิทธิ์ ส่วนที่ยังไม่ถูกตรวจคือ
  - state machine เปลี่ยน status ผิดลำดับ → 409
  - ownership ไม่ใช่เจ้าของบิล → 403 / 404
  - การคำนวณ `totalPrice` และการเก็บราคา ณ เวลาที่สั่ง
  - เมนูหมด / เมนูซ้ำในบิลเดียว / `menu` id ที่ไม่มีใน DB
- **`POST /refresh`** — ทั้ง flow
- **`POST /auth`** — ตอนนี้ถูกยิงทางอ้อมผ่าน helper `loginAs` เฉพาะเส้นทางที่สำเร็จ ยังไม่มีเทสกรณีรหัสผิด 401
- **`POST /logout`**
- **rate limit และ body size limit**

## Out of scope
ใน version นี้ยังไม่รวม 
- ระบบจอง
- ระบบชำระเงิน
- นับสต็อควัตถุดิบ

## Design decisions

การตัดสินใจที่ไม่ชัดในตัวเองถูกบันทึกไว้ที่ [`docs/decisions.md`](docs/decisions.md)
แต่ละรายการเก็บปัญหา ตัวเลือกที่พิจารณา เหตุผลที่เลือก และสิ่งที่ยอมแลก

- **เปิด `0.0.0.0/0` ใน IP access list ของ Atlas** — host ฟรีไม่ให้ static outbound IP
  และ Private Endpoint ต้องใช้ M10 ขึ้นไป จึงเลือกเปิดทั้งหมดโดยย้ายด่านป้องกันไปไว้ที่
  DB user ที่มีสิทธิ์เฉพาะ `readWrite` บน database ของตัวเอง พร้อมบันทึกเงื่อนไขที่จะกลับมาทบทวน

- **middleware `ensureBody`** — ตอนย้ายจากการทดสอบด้วย Postman มาเป็น Supertest เจอว่า
  `req.body` เป็น `undefined` เพราะ Postman ติด `Content-Type` ให้อัตโนมัติ แต่ Supertest ไม่ติด
  การ destructure จาก `undefined` ทำให้ทุก controller ตอบ 500 แทน 400

## Roadmap
- [ ] React frontend
- [ ] Deployment
- [ ] เทส business logic (state machine, ownership, ราคา)
- [ ] เทส menuController



