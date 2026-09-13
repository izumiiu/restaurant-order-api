import mongoose from "mongoose";
const Schema = mongoose.Schema;

interface Recipes {
    menuname: string,
    price: number
}

// เกร็ด: mongoose มี trim: true ให้ใน schema
const Recipes = new Schema<Recipes>({
    menuname: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    }
})

export default mongoose.model<Recipes>('Foodmenu', Recipes);