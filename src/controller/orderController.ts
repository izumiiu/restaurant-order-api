import type { RequestHandler } from "express";
import Order from "../model/Order.js";
import mongoose, { Types } from "mongoose";
import Recipes from "../model/Recipes.js";
import { isAccessPayload } from "../middleware/verifyJWT.js";
import { isValidStatus } from "../utils/validators.js";
import type { OrderItem, OrderStatus, AddOns } from "../model/Order.js";
import { randomInt } from 'node:crypto';


const getAllOrders: RequestHandler = async (req, res) => {
    try{
        const allOrder = await Order.find().exec();
        res.json(allOrder);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'ดึงข้อมูลไม่สำเร็จ' })
    }
}

interface AddOnsIn{
    group: string,
    option: string,
    quantity: number
}

const isValidAddOns = (a: unknown): a is AddOnsIn => {
    return typeof a === 'object' && a !== null && 'group' in a && 'option' in a && 'quantity' in a
                                                                                && mongoose.isValidObjectId(a.group)
                                                                                && mongoose.isValidObjectId(a.option)
                                                                                && typeof a.group === 'string'
                                                                                && typeof a.option === 'string'
                                                                                && typeof a.quantity === 'number'
                                                                                && Number.isInteger(a.quantity) && a.quantity >=1
}

interface OrderItemInput{
    menu: string,
    quantity: number,
    addOns: AddOnsIn[]
}

const isValidateOrderItemInput = (o: unknown):o is OrderItemInput => {
    return typeof o === 'object' && o !== null && 'menu' in o && 'quantity' in o && 'addOns' in o
                                                              && mongoose.isValidObjectId(o.menu)
                                                              && typeof o.quantity === 'number'
                                                              && Number.isInteger(o.quantity) && o.quantity >= 1
                                                              && typeof o.menu === 'string'
                                                              && Array.isArray(o.addOns)
                                                              && o.addOns.every(isValidAddOns)
}

interface OrderItemInfo{
    customerName: string,
    phoneNumber: string,
    location: string
}

const isValidateOrderInfo = (i: unknown):i is OrderItemInfo => {
    return typeof i === 'object' && i !== null && 'phoneNumber' in i && 'location' in i 
                                                                     && typeof i.phoneNumber === 'string' 
                                                                     && typeof i.location === 'string'
                                                                     && i.phoneNumber.trim().length > 0
                                                                     && i.location.trim().length > 0
                                                                     && 'customerName' in i
                                                                     && typeof i.customerName === 'string'
                                                                     && i.customerName.trim().length > 0

}


// 31 ตัว: A–Z ไม่มี I L O และ 2–9 เพราะตัวอักษรคล้ายกันดูยาก
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const generateOrderCode = (length = 6): string => {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += ALPHABET[randomInt(ALPHABET.length)];
    }
    return code;
};

const addOrders: RequestHandler = async (req, res) => {
    const { items, information } = req.body;
    if(!Array.isArray(items)) return res.status(400).json({ message: `body is not array`});
    if(items.length === 0) return res.status(400).json({ message: `สั่งบิลเปล่าไม่ได้`});
    if(!items.every(isValidateOrderItemInput)) return res.status(400).json({ message: `invalid menu or price` });
    if(!isValidateOrderInfo(information)) return res.status(400).json({ message: 'โปรดกรอกชื่อ,ที่อยู่,และเบอร์โทรอย่างละเอียด' });

    // const menuIds = items.map(i => i.menu);
    const menuIds = [...new Set(items.map(i => i.menu))];
    // if(new Set(menuIds).size !== menuIds.length) return res.status(400).json({ message: 'duplicate menu' });
    try{
        const menus = await Recipes.find({ _id: { $in: menuIds } }).exec();
        if(menuIds.length !== menus.length) return res.status(400).json({ message: `menu not match in DB` });
        
        const soldOut = menus.filter(s => !s.isAvailable);
        if(soldOut.length > 0) return res.status(400).json({ message: `เมนูหมด ${soldOut.map(s => s.menuname).join(', ')}`});
        const menuMap = new Map(menus.map(m => [m._id.toString(), m]));
       
        const orderMenu: OrderItem[] = [];

        for (const i of items){
            const m = menuMap.get(i.menu);
            if(!m) throw new Error(`หา menu ${i.menu} ไม่เจอใน map`);
            const addOns: AddOns[] = [];

            for(const u of i.addOns){
                const g = m.optionGroups.find(f => f._id.equals(u.group));
                if(!g) return res.status(400).json({ message: `optionGroup not match in DB` });
                const o = g.options.find(f => f._id.equals(u.option));
                if(!o) return res.status(400).json({ message: `options not match in DB` });
                if(o.isAvailable === false) return res.status(400).json({ message: `this options is not available right now` });
                addOns.push({ addOnsId: o._id, addOnsName: o.name, quantity: u.quantity, price: g.unitPrice });
            }

            let addOnsPrice = 0;
            for (const g of m.optionGroups) {
                const inThisGroup = i.addOns.filter(u => g._id.equals(u.group));
                const qty = inThisGroup.reduce((sum, u) => sum + u.quantity, 0);
                addOnsPrice += Math.max(qty - g.freeQuota, 0) * g.unitPrice;
            }

            orderMenu.push({
                menu: m._id,
                menuname: m.menuname,
                price: m.price,
                addOns: addOns,
                addOnsPrice: addOnsPrice,
                quantity: i.quantity
            });
        }

        const totalPrice = orderMenu.reduce((sum, t) => sum + ((t.price + t.addOnsPrice) * t.quantity), 0);

        for(let attempt = 1;attempt <=5; attempt++){
            try{

                const orderCode = generateOrderCode();

                const newOrder = await Order.create({
                customerName: information.customerName,
                phoneNumber: information.phoneNumber,
                location: information.location,
                orderCode: orderCode,
                items: orderMenu,
                totalPrice: totalPrice
                });

                return res.status(201).json(newOrder);
            } catch(err){
                if (err && typeof err === 'object' && 'code' in err && err.code === 11000) continue;
                throw err;
                
            }
            
        }
        console.error('too many attempt to generate order code');
        return res.status(500).json({ message: `cannot create orderCode` });

    }catch(err){
        console.error(err);
        return res.status(500).json({ message: 'server error' });
    }
    
}


// const getMyOrders: RequestHandler = async (req, res) => {
//     if(!isAccessPayload(req.user)){
//         console.error('getMyOrders: req.user หาย — ลืมต่อ verifyJWT?');
//         return res.status(500).json({ message: 'server error' });
//     }

//     try{
//         const myOrders = await Order.find({ customer: req.user.userId}).sort({ createdAt: -1}).lean().exec();
//         res.json(myOrders);

//     }catch(err){
//         console.error(err);
//         return res.status(500).json({ message: 'server error' });

//     }
    
// }

// const getOrderById: RequestHandler = async (req, res) => {
//     if(!isAccessPayload(req.user)){
//         console.error('getOrderById: req.user  หาย');
//         return res.status(500).json({ message: 'server error' });
//     }
//     if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: `Invalid id` });

//     try{
//         const order = await Order.findById(req.params.id).exec();
//         if(!order) return res.status(404).json({ message: `ไม่มีบิล`});
//         // isOwner คือเป็นเจ้าของจริงไหม
//         const isOwner = order.customer.equals(req.user.userId);
//         const isEmployee = req.user.role === 'employee';

//         if(!isOwner && !isEmployee) return res.status(403).json({ message: 'ไม่ใช่เจ้าของ' })

//         return res.json(order)

//     }catch(err){
//         console.error(err);
//         return res.status(500).json({ message: 'server error' });
//     }

// }

const allowedFrom: Record<OrderStatus, OrderStatus[]> = {
    pending:   [],
    cooking:   ['pending'],
    done:      ['cooking'],
    cancelled: ['pending', 'cooking'],
};

const setStatus: RequestHandler = async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: `Invalid id` });
    const { status } = req.body;
    if(!isValidStatus(status)) return res.status(400).json({ message: 'invalid status' });
    const update = status === 'done' ? { status, completedAt: new Date() } : { status };

    try{
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, status:  { $in: allowedFrom[status] } },
            { $set: update },
            { returnDocument: 'after' }
        ).exec();
        if(order === null){
            const found = await Order.findOne({ _id: req.params.id }).exec();
            if(!found) return res.status(404).json({ message: 'order not found' });
            return res.status(409).json({ message: `เปลี่ยนจาก ${found.status} เป็น ${status} ไม่ได้` });
        }
        return res.json(order);

    } catch(err){
        console.error(err);
        return res.status(500).json({ message: 'server error' });
    }
}

// export { getAllOrders, addOrders, getMyOrders, getOrderById, setStatus };
export { getAllOrders, addOrders, setStatus };