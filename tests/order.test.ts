import { describe, it, expect } from "vitest";
import request from 'supertest';
import app from '../src/app.js';
import { loginAs } from "./helper.js";

describe('GET /order/me', () => {
  it('ไม่มี token ต้องได้ 401', async () => {
    const res = await request(app).get('/order/me');
    expect(res.status).toBe(401);
  });

  it('มี token ของ customer ต้องได้ 200', async () => {
    const token = await loginAs('customer');
    const res = await request(app).get('/order/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('token ของ employee ต้องได้ 403', async() => {
    const token = await loginAs('employee');
    const res = await request(app).get('/order/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  })
});

describe('POST /order', () => {
  it('มี token ของ employee ต้องได้ 403', async() => {
    const token = await loginAs('employee');
    const res = await request(app).post('/order').set('Authorization', `Bearer ${token}`).send({ items: [{menu: 'rice', quantity: 2}]});
    expect(res.status).toBe(403);
  });
});

describe('PATCH /order/:id/status', () => {
  it('customer ต้องได้ 403', async() => {
    const token = await loginAs('customer');
    const res = await request(app).patch('/order/507f1f77bcf86cd799439011/status').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  })
})

