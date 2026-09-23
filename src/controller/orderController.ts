import type { RequestHandler } from "express";
import Order from "../model/Order.js";
import mongoose from "mongoose";
import Recipes from "../model/Recipes.js";
import { isAccessPayload } from "../middleware/verifyJWT.js";
import { isValidStatus } from "../utils/validators.js";
import type { OrderStatus } from "../model/Order.js";


const getAllOrders: RequestHandler = async (req, res) => {
    try{
        const allOrder = await Order.find().exec();
        res.json(allOrder);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'ดึงข้อมูลไม่สำเร็จ' })
    }
}

interface OrderItemInput{
    menu: string,
    quantity: number
}

const isValidateOrderItemInput = (o: unknown):o is OrderItemInput => {
    return typeof o === 'object' && o !== null && 'menu' in o && 'quantity' in o
                                                              && mongoose.isValidObjectId(o.menu)
                                                              && typeof o.quantity === 'number'
                                                              && Number.isInteger(o.quantity) && o.quantity >= 1
                                                              && typeof o.menu === 'string'
}

const addOrders: RequestHandler = async (req, res) => {
    const { items } = req.body;
    if(!Array.isArray(items)) return res.status(400).json({ message: `body is not array`});
    if(items.length === 0) return res.status(400).json({ message: `สั่งบิลเปล่าไม่ได้`});
    if(!items.every(isValidateOrderItemInput)) return res.status(400).json({ message: `invalid menu or price` });

    const menuIds = items.map(i => i.menu);
    if(new Set(menuIds).size !== menuIds.length) return res.status(400).json({ message: 'duplicate menu' });
    try{
        const menus = await Recipes.find({ _id: { $in: menuIds } }).exec();
        if(menuIds.length !== menus.length) return res.status(400).json({ message: `menu not match in DB` });
        
        const soldOut = menus.filter(s => !s.isAvailable);
        if(soldOut.length > 0) return res.status(400).json({ message: `เมนูหมด ${soldOut.map(s => s.menuname).join(', ')}`});
        const menuMap = new Map(menus.map(m => [m._id.toString(), m]));

        const orderMenu = items.map(i => {
            const m = menuMap.get(i.menu);
            if (!m) throw new Error(`หา menu ${i.menu} ไม่เจอใน map`);
            return { menu: m._id, menuname: m.menuname, price: m.price, quantity: i.quantity }
        });

        const totalPrice = orderMenu.reduce((sum, t) => sum + (t.price * t.quantity), 0);

        
        if(!isAccessPayload(req.user)){
            console.error('addOrders: req.user หาย — ลืมต่อ verifyJWT?');
            return res.status(500).json({ message: 'server error' });
        }
        

        const newOrder = await Order.create({
            customer: req.user.userId,
            items: orderMenu,
            totalPrice
        })

        return res.status(201).json(newOrder);

    }catch(err){
        console.error(err);
        return res.status(500).json({ message: 'server error' });
    }
    
}


const getMyOrders: RequestHandler = async (req, res) => {
    if(!isAccessPayload(req.user)){
        console.error('getMyOrders: req.user หาย — ลืมต่อ verifyJWT?');
        return res.status(500).json({ message: 'server error' });
    }

    try{
        const myOrders = await Order.find({ customer: req.user.userId}).sort({ createdAt: -1}).lean().exec();
        res.json(myOrders);

    }catch(err){
        console.error(err);
        return res.status(500).json({ message: 'server error' });

    }
    
}

const getOrderById: RequestHandler = async (req, res) => {
    if(!isAccessPayload(req.user)){
        console.error('getOrderById: req.user  หาย');
        return res.status(500).json({ message: 'server error' });
    }
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: `Invalid id` });

    try{
        const order = await Order.findById(req.params.id).exec();
        if(!order) return res.status(404).json({ message: `ไม่มีบิล`});
        // isOwner คือเป็นเจ้าของจริงไหม
        const isOwner = order.customer.equals(req.user.userId);
        const isEmployee = req.user.role === 'employee';

        if(!isOwner && !isEmployee) return res.status(403).json({ message: 'ไม่ใช่เจ้าของ' })

        return res.json(order)

    }catch(err){
        console.error(err);
        return res.status(500).json({ message: 'server error' });
    }

}

const allowedNext: Record<OrderStatus, OrderStatus[]> = {
    pending:   ['cooking', 'cancelled'],
    cooking:   ['done', 'cancelled'],
    done:      [],
    cancelled: [],
};

const setStatus: RequestHandler = async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: `Invalid id` });
    const { status } = req.body;
    if(!isValidStatus(status)) return res.status(400).json({ message: 'invalid status' });

    try{
        const order = await Order.findById(req.params.id).exec();
        if(!order) return res.status(404).json({ message: 'order not found' });
        if(!allowedNext[order.status].includes(status)) return res.status(409).json({ message: `เปลี่ยนจาก ${order.status} เป็น ${status} ไม่ได้` });
        order.status = status;
        if (status === 'done') order.completedAt = new Date();
        await order.save();
        return res.json(order);

    }catch(err){
        console.error(err);
        return res.status(500).json({ message: 'server error' });
    }

}

export { getAllOrders, addOrders, getMyOrders, getOrderById, setStatus };