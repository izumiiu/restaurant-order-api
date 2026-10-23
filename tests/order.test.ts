import { describe, it, expect } from "vitest";
import request from 'supertest';
import app from '../src/app.js';

describe('GET /order/me', () => {
  it('ไม่มี token ต้องได้ 401', async () => {
    const res = await request(app).get('/order/me');
    expect(res.status).toBe(401);
  });

  it('มี token ของ customer ต้องได้ 200', async () => {
    await request(app).post('/register').send({ username: 'tjtj', password: 'tjtesttest' });
    const loginRes = await request(app).post('/auth').send({ username: 'tjtj', password: 'tjtesttest' });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.accessToken;
    const res = await request(app).get('/order/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

