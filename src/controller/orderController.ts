import type { RequestHandler } from "express";
import Order from "../model/Order.js";
import mongoose from "mongoose";
import Recipes from "../model/Recipes.js";
import { isAccessPayload } from "../middleware/verifyJWT.js";


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

export { getAllOrders, addOrders};