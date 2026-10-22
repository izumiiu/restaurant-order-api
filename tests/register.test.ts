import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('POST /register', () => {
    it('สมัครสำเร็จต้องได้ 201', async () => {
        const res = await request(app).post('/register').send({ username: 'zack', password: 'zacktesttest'});
        expect(res.status).toBe(201);
    });

    it('แต่ละเทสเริ่มจาก DB ว่าง (beforeEach ล้างจริง)', async () => {
        const res = await request(app).post('/register').send({ username: 'zack', password: 'zacktesttest'});
        expect(res.status).toBe(201);
    });

    it('เจอข้อมูลซ้ำต้องได้ 409', async () => {
        await request(app).post('/register')
        .send({ username: 'tjtj', password: 'tjtesttest' });

        const res = await request(app).post('/register')
        .send({ username: 'tjtj', password: 'tjtesttest' });

        expect(res.status).toBe(409);
    });

    it('ไม่ส่ง body ต้องได้ 400', async() => {
        const res = await request(app).post('/register');
        expect(res.status).toBe(400);
    });
});
