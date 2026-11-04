import type { CookieOptions } from 'express';

// host ส่วนใหญ่ตั้ง NODE_ENV=production ให้เอง ถ้าไม่มีค่า = ถือว่าเป็น dev
const isProd = process.env.NODE_ENV === 'production';

// ใช้ตอน clearCookie (ห้ามมี maxAge)
export const cookieOptions: CookieOptions = {
    httpOnly: true,                      // JS ในหน้าเว็บอ่านไม่ได้ กัน XSS
    sameSite: isProd ? 'none' : 'lax',   // prod: คนละโดเมน / dev: localhost ถือเป็น site เดียวกัน
    secure: isProd,                      // 'none' บังคับให้ต้องมี secure / dev เป็น http จึงต้อง false
};

// ใช้ตอน res.cookie
export const refreshCookieOptions: CookieOptions = {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,         // 24 ชั่วโมง
};