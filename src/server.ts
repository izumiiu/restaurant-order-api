//แยกการโหลด env ไปเป็นไฟล์แยก แล้ว import ไฟล์นั้นเป็นบรรทัดแรก
//พอมันเป็น import มันจะถูกฮอยสต์ไปอยู่ในขั้น 1 พร้อมกัน และ Node รัน import ตามลำดับที่เขียน ดังนั้นมันจะรันก่อนตัวอื่นจริงๆ
import './config/loadEnv.js';
import express from 'express';
import mongoose from 'mongoose';
const PORT = 3500;
const app = express();
import connectDB from './config/dbConn.js';

import { logger } from './middleware/logEvents.js';
import registerRouter from './routes/register.js';
import manageMenuRouter from './routes/api/manageMenu.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import verifyJWT from './middleware/verifyJWT.js';
import refreshRouter from './routes/refresh.js';
connectDB();

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

app.use(logger);

app.use('/register', registerRouter);
app.use('/auth', authRouter);
app.use('/refresh', refreshRouter);
app.use('/manageMenu', verifyJWT, manageMenuRouter);


mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {console.log(`server running on port ${PORT}`)});   // ย้าย listen เข้ามาไว้ในนี้
});

