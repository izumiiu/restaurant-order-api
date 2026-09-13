
import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface OrderItem {
    menu: Types.ObjectId,
    menuname: string,
    price: number,
    quantity: number
}

interface Order {
    customer: Types.ObjectId,
    items: OrderItem[],
    totalPrice: number,
    status: 'pending' | 'cooking' | 'done' | 'cancelled',
    completedAt?: Date
}



const orderSchema = new Schema<Order>({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        menu: { type: Schema.Types.ObjectId, ref: 'Foodmenu', required: true },
        menuname: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 }
    }],
    totalPrice: { type: Number, required: true, min: 0},
    status: { type: String, enum: ['pending', 'cooking', 'done', 'cancelled'], default: 'pending'},
    completedAt: { type: Date }
}, { timestamps: true });

orderSchema.index({ status: 1, createdAt: -1 });      //วางก่อน export และ วางหลัง orderSchema และเพื่อรองรับ query ของ dashboard
orderSchema.index({ customer: 1, createdAt: -1 });

export default mongoose.model<Order>('Order', orderSchema);