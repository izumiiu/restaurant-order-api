import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: { message: `กรุณาลองใหม่อีกครั้งในอีกสักครู่ rate-limit-detected` },
    statusCode: 429,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true
})

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: { message: `กรุณาลองใหม่อีกครั้งในอีกสักครู่ rate-limit-detected` },
    statusCode: 429,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: false
})