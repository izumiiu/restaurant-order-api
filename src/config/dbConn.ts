import mongoose from "mongoose";
import { DATABASE_URI } from "./loadEnv.js";


const connectDB = async () => {
    try{
        await mongoose.connect(DATABASE_URI);
    } catch (err){
        console.error('ต่อ MongoDB ไม่ได้ — ตรวจ DATABASE_URI และ Atlas Network Access');
        console.error(err);
        process.exit(1);
    }
}

export default connectDB;