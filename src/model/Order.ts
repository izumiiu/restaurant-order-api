
import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

export type OrderStatus = 'pending' | 'cooking' | 'done' | 'cancelled';

interface AddOns {
    addOnsId: Types.ObjectId,
    addOnsName: string,
    quantity: number,
    price: number
}


export interface OrderItem {
    menu: Types.ObjectId,
    menuname: string,
    price: number,
    addOns: AddOns[],
    addOnsPrice: number,
    quantity: number
}

interface Order {
    customerName: string,
    phoneNumber: string,
    location: string,
    items: OrderItem[],
    totalPrice: number,
    status: 'pending' | 'cooking' | 'done' | 'cancelled', // เดี๋ยวค่อยเอา type มาใช้ซ้ำเดี๋ยวงง
    completedAt?: Date,
    
}

const orderSchema = new Schema<Order>({
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true},
    location: { type: String, required: true },
    items: [{
        menu: { type: Schema.Types.ObjectId, ref: 'Foodmenu', required: true },
        menuname: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        addOns: [{ addOnsId: {type: Schema.Types.ObjectId , required: true },
                   addOnsName: { type: String, required: true },
                   quantity: { type: Number, required: true, min: 1 },
                   price: { type: Number, required: true, min: 0 }
                }],
        addOnsPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 }
    }],
    totalPrice: { type: Number, required: true, min: 0},
    status: { type: String, enum: ['pending', 'cooking', 'done', 'cancelled'], default: 'pending'},
    completedAt: { type: Date },
    
}, { timestamps: true });

orderSchema.index({ status: 1, createdAt: -1 });      //วางก่อน export และ วางหลัง orderSchema และเพื่อรองรับ query ของ dashboard
orderSchema.index({ phoneNumber: 1, createdAt: -1 });

export default mongoose.model<Order>('Order', orderSchema);