import type { RequestHandler } from "express";
import Order from "../model/Order.js";
import mongoose from "mongoose";

const getAllOrders: RequestHandler = async (req, res) => {
    try{
        const allOrder = await Order.find().exec();
        res.json(allOrder);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'ดึงข้อมูลไม่สำเร็จ' })
    }
}

const addOrders: RequestHandler = async (req, res) => {
    
}