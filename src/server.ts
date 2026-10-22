//แยกการโหลด env ไปเป็นไฟล์แยก แล้ว import ไฟล์นั้นเป็นบรรทัดแรก
//พอมันเป็น import มันจะถูกฮอยสต์ไปอยู่ในขั้น 1 พร้อมกัน และ Node รัน import ตามลำดับที่เขียน ดังนั้นมันจะรันก่อนตัวอื่นจริงๆ
// import './config/loadEnv.js';
import mongoose from 'mongoose';
import connectDB from './config/dbConn.js';
import app from './app.js';

const PORT = process.env.PORT || 3500;

connectDB();


mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {console.log(`server running on port ${PORT}`)});   // ย้าย listen เข้ามาไว้ในนี้
});

