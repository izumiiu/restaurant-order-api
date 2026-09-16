
import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { ACCESS_TOKEN_SECRET } from "../config/loadEnv.js";

const verifyJWT: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: `dont have authHeader` });
    const token = authHeader.split(' ')[1];
    if(!token) return res.status(401).json({ message: `Invalid type authHeader` });

    try{
        jwt.verify(token, ACCESS_TOKEN_SECRET);

    }catch(err){
        if(err instanceof jwt.TokenExpiredError) return res.status(401).json({ message: `expired token` });
        if(err instanceof jwt.JsonWebTokenError) return res.status(401).json({ message: `token ไม่ถูกต้อง` });
        console.error(err);
        return res.status(500).json({ message: `server error` })
    }
    // เอา next ไว้ นอก try เพราะเดี๋ยวมันจะไอนั่น (Express 4 & Express 5 ไม่เหมือนกัน) จริงๆ next() ไม่ควรอยู่ใน try อยู่แล้ว
    next();
}

export default verifyJWT;