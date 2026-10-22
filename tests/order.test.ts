import { describe, it, expect } from "vitest";
import request from 'supertest';
import app from '../src/app.js';

describe('GET /order/me', () => {
  it('ไม่มี token ต้องได้ 401', async () => {
    const res = await request(app).get('/order/me');
    expect(res.status).toBe(401);
  });
});

