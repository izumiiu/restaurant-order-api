import { expect } from "vitest";
import request from 'supertest';
import app from '../src/app.js';
import User from "../src/model/User.js";


const loginAs = async(role: 'customer' | 'employee', username = `test_${role}`): Promise<string> => {
    const PASSWORD = 'tjtesttest';
    const credentials = { username, password: PASSWORD };
    const registerRes = await request(app).post('/register').send(credentials);
    expect(registerRes.status).toBe(201);
    const result = await User.updateOne({ username }, { role });
    expect(result.matchedCount).toBe(1);
    const loginRes = await request(app).post('/auth').send(credentials);
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken;
    return accessToken;
} 

export { loginAs }